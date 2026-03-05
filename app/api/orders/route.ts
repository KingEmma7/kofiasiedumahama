import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function authorize(request: NextRequest): boolean {
  const secret = process.env.ANALYTICS_SECRET;
  if (!secret) return true;
  const url = new URL(request.url);
  return url.searchParams.get('key') === secret;
}

function isMissingColumnError(error: unknown, columnName: string): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = String((error as { message?: unknown }).message || '').toLowerCase();
  return message.includes(columnName.toLowerCase()) && message.includes('column');
}

export async function GET(request: NextRequest) {
  try {
    if (!authorize(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search')?.trim().toLowerCase();
    const showTest = url.searchParams.get('show_test');
    const fromDate = url.searchParams.get('from');
    const toDate = url.searchParams.get('to');
    const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get('limit') || '50', 10)));
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('purchases')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ['pending', 'fulfilled', 'cancelled'].includes(status)) {
      query = query.eq('status', status);
    }

    if (showTest === 'only') query = query.eq('is_test', true);
    else if (showTest !== 'all') query = query.not('is_test', 'is', true);

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (fromDate && dateRegex.test(fromDate)) {
      query = query.gte('created_at', `${fromDate}T00:00:00.000Z`);
    }
    if (toDate && dateRegex.test(toDate)) {
      const nextDay = new Date(`${toDate}T00:00:00.000Z`);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      query = query.lt('created_at', nextDay.toISOString());
    }

    if (search) {
      query = query.or(
        `customer_email.ilike.%${search}%,customer_name.ilike.%${search}%,reference.ilike.%${search}%`
      );
    }

    let { data: orders, count, error } = await query;

    // Graceful fallback if DB migration for is_test has not been run yet.
    if (error && isMissingColumnError(error, 'is_test')) {
      let fallbackQuery = supabaseAdmin
        .from('purchases')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status && ['pending', 'fulfilled', 'cancelled'].includes(status)) {
        fallbackQuery = fallbackQuery.eq('status', status);
      }
      if (fromDate && dateRegex.test(fromDate)) {
        fallbackQuery = fallbackQuery.gte('created_at', `${fromDate}T00:00:00.000Z`);
      }
      if (toDate && dateRegex.test(toDate)) {
        const nextDay = new Date(`${toDate}T00:00:00.000Z`);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        fallbackQuery = fallbackQuery.lt('created_at', nextDay.toISOString());
      }
      if (search) {
        fallbackQuery = fallbackQuery.or(
          `customer_email.ilike.%${search}%,customer_name.ilike.%${search}%,reference.ilike.%${search}%`
        );
      }

      const fallbackResult = await fallbackQuery;
      orders = fallbackResult.data;
      count = fallbackResult.count;
      error = fallbackResult.error;
    }

    if (error) {
      console.error('Orders query error:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    const ebookPrice = Number.parseInt(process.env.NEXT_PUBLIC_EBOOK_PRICE || '89', 10);
    const hardcopyPrice = Number.parseInt(process.env.NEXT_PUBLIC_HARDCOPY_PRICE || '99', 10);
    const discountPct = 20;
    const ebookDiscounted = ebookPrice * (100 - discountPct) / 100;
    const hardcopyDiscounted = hardcopyPrice * (100 - discountPct) / 100;

    const enrichedOrders = (orders || []).map((o: Record<string, unknown>) => ({
      ...o,
      quantity: deriveQuantity(o, ebookPrice, hardcopyPrice, ebookDiscounted, hardcopyDiscounted),
    }));

    const totals = computeTotals(enrichedOrders);

    return NextResponse.json({
      success: true,
      orders: enrichedOrders,
      totals,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function deriveQuantity(
  o: Record<string, unknown>,
  ebookPrice: number,
  hardcopyPrice: number,
  ebookDiscounted: number,
  hardcopyDiscounted: number
): number {
  const stored = Number(o.quantity);
  if (Number.isInteger(stored) && stored > 1) return stored;

  const amount = Number(o.amount) || 0;
  const bookType = String(o.book_type || '').toLowerCase();
  const prices = bookType === 'hardcopy'
    ? [hardcopyPrice, hardcopyDiscounted]
    : [ebookPrice, ebookDiscounted];

  for (const unitPrice of prices) {
    if (unitPrice <= 0) continue;
    const q = amount / unitPrice;
    const rounded = Math.round(q);
    if (Math.abs(q - rounded) < 0.02 && rounded >= 1 && rounded <= 100) {
      return rounded;
    }
  }
  return 1;
}

function computeTotals(orders: Array<Record<string, unknown>>) {
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalQuantity = 0;

  for (const o of orders) {
    if (o.is_test === true) continue;
    totalOrders++;
    totalRevenue += Number(o.amount) || 0;
    totalQuantity += Number(o.quantity) || 1;
  }

  return { totalRevenue, totalOrders, totalQuantity };
}

export async function PATCH(request: NextRequest) {
  try {
    if (!authorize(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { reference, status, is_test } = body;

    if (!reference || typeof reference !== 'string') {
      return NextResponse.json(
        { error: 'reference is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, string | boolean | null> = {};

    if (status !== undefined) {
      if (!['pending', 'fulfilled', 'cancelled'].includes(status)) {
        return NextResponse.json(
          { error: 'status must be pending, fulfilled, or cancelled' },
          { status: 400 }
        );
      }
      updateData.status = status;
      updateData.fulfilled_at = status === 'fulfilled' ? new Date().toISOString() : null;
    }

    if (is_test !== undefined) {
      updateData.is_test = !!is_test;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nothing to update' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('purchases')
      .update(updateData)
      .eq('reference', reference)
      .select()
      .single();

    if (error) {
      console.error('Order update error:', error);
      if (updateData.is_test !== undefined && isMissingColumnError(error, 'is_test')) {
        return NextResponse.json(
          { error: 'is_test column missing. Run ADD_ORDER_EXTRAS.sql in Supabase.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    console.error('Orders PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
