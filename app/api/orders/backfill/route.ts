import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface PaystackTransaction {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  paid_at: string;
  customer: {
    email: string;
  };
  metadata?: {
    custom_fields?: Array<{
      variable_name: string;
      value: string;
    }>;
  };
}

interface PaystackListResponse {
  status: boolean;
  data: PaystackTransaction[];
  meta: {
    total: number;
    perPage: number;
    page: number;
    pageCount: number;
  };
}

function extractMetaField(tx: PaystackTransaction, field: string): string | undefined {
  return tx.metadata?.custom_fields?.find(f => f.variable_name === field)?.value;
}

function parseDeliveryAddress(raw: string | undefined) {
  if (!raw) return null;
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  return {
    street: parts[0] || '',
    city: parts[1] || '',
    region: parts[2] || '',
    postalCode: parts[3] || '',
    country: parts[4] || 'Ghana',
  };
}

function txToPurchaseRow(tx: PaystackTransaction) {
  const qtyRaw = extractMetaField(tx, 'quantity');
  const qty = qtyRaw ? Number.parseInt(qtyRaw, 10) : 1;

  return {
    reference: tx.reference,
    customer_email: tx.customer.email,
    customer_name: extractMetaField(tx, 'customer_name') || tx.customer.email.split('@')[0],
    customer_phone: extractMetaField(tx, 'phone') || null,
    amount: tx.amount / 100,
    currency: tx.currency || 'GHS',
    book_type: extractMetaField(tx, 'book_type') || 'ebook',
    delivery_address: parseDeliveryAddress(extractMetaField(tx, 'delivery_address')),
    download_url: null,
    quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
    status: 'pending',
    created_at: tx.paid_at,
  };
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.ANALYTICS_SECRET;
    if (secret) {
      const url = new URL(request.url);
      if (url.searchParams.get('key') !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) {
      return NextResponse.json(
        { error: 'PAYSTACK_SECRET_KEY not configured' },
        { status: 500 }
      );
    }

    let page = 1;
    let imported = 0;
    let skipped = 0;
    let totalFetched = 0;
    const perPage = 100;

    while (true) {
      const res = await fetch(
        `https://api.paystack.co/transaction?status=success&perPage=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${paystackKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        return NextResponse.json(
          { error: `Paystack API error: ${res.status}` },
          { status: 502 }
        );
      }

      const payload: PaystackListResponse = await res.json();
      if (!payload.status || !payload.data?.length) break;

      totalFetched += payload.data.length;

      for (const tx of payload.data) {
        const row = txToPurchaseRow(tx);
        const { error } = await supabaseAdmin
          .from('purchases')
          .upsert(row, { onConflict: 'reference', ignoreDuplicates: true });

        if (error) {
          console.error(`Backfill upsert error for ${tx.reference}:`, error);
          skipped++;
        } else {
          imported++;
        }
      }

      if (page >= payload.meta.pageCount) break;
      page++;
    }

    return NextResponse.json({
      success: true,
      totalFetched,
      imported,
      skipped,
    });
  } catch (error) {
    console.error('Backfill error:', error);
    return NextResponse.json(
      { error: 'Backfill failed' },
      { status: 500 }
    );
  }
}
