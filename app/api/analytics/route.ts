import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isValidPageViewPath } from '@/lib/validPages';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const DATE_PARAM_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const normalizeLabel = (label: string | null) =>
  ((label ?? '') || '/').replace(/\/+$/, '') || '/';

function getDateRange(dateParam: string | null) {
  if (!dateParam || dateParam === 'total' || dateParam === 'all') return null;

  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  switch (dateParam.toLowerCase()) {
    case 'last7': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start: start.toISOString(), end: todayEnd.toISOString() };
    }
    case 'last30': {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start: start.toISOString(), end: todayEnd.toISOString() };
    }
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: start.toISOString(), end: todayEnd.toISOString() };
    }
    default:
      if (!DATE_PARAM_REGEX.test(dateParam)) return null;
      const start = new Date(`${dateParam}T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      return { start: start.toISOString(), end: end.toISOString() };
  }
}

function derivePurchaseQuantity(
  p: Record<string, unknown>,
  ebookPrice: number,
  hardcopyPrice: number,
  ebookDiscounted: number,
  hardcopyDiscounted: number
): number {
  const stored = Number(p.quantity);
  if (Number.isInteger(stored) && stored > 1) return stored;
  const amount = Number(p.amount) || 0;
  const bookType = String(p.book_type || '').toLowerCase();
  const prices = bookType === 'hardcopy'
    ? [hardcopyPrice, hardcopyDiscounted]
    : [ebookPrice, ebookDiscounted];
  for (const unitPrice of prices) {
    if (unitPrice <= 0) continue;
    const q = amount / unitPrice;
    const rounded = Math.round(q);
    if (Math.abs(q - rounded) < 0.02 && rounded >= 1 && rounded <= 100) return rounded;
  }
  return 1;
}

/**
 * Analytics event tracking endpoint
 * Tracks custom events server-side for better reliability
 * Events are logged and can be aggregated for the analytics dashboard
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, category, label, value, metadata } = body;

    if (!action || !category) {
      return NextResponse.json(
        { error: 'Action and category are required' },
        { status: 400 }
      );
    }

    // Only store page_view for real site pages (typos, /analytics, 404s like /analyt are skipped)
    if (action === 'page_view' && !isValidPageViewPath(typeof label === 'string' ? label : null)) {
      return NextResponse.json({ success: true, event: { ...body, skipped: true } });
    }

    // Get user info from request
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const referer = request.headers.get('referer') || 'direct';

    // Log analytics event
    const eventData = {
      action,
      category,
      label: label || null,
      value: value || null,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      userAgent,
      ip: ip.split(',')[0].trim(), // Get first IP if multiple
      referer,
    };

    console.log('[Analytics Event]', JSON.stringify(eventData));

    // Save to Supabase database if configured
    if (supabaseAdmin) {
      try {
        const { error } = await supabaseAdmin
          .from('analytics_events')
          .insert({
            action,
            category,
            label: label || null,
            value: value || null,
            metadata: metadata || {},
            user_agent: userAgent,
            ip_address: ip.split(',')[0].trim(),
            referer,
          });

        if (error) {
          console.error('Failed to save analytics event to database:', error);
          // Continue anyway - don't fail the request
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue anyway - analytics shouldn't break the app
      }
    }

    return NextResponse.json({ success: true, event: eventData });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

/**
 * Get analytics summary (for admin dashboard)
 * When ANALYTICS_SECRET is set, requires ?key=SECRET (same as /analytics page).
 */
export async function GET(request: NextRequest) {
  try {
    const secret = process.env.ANALYTICS_SECRET;
    if (secret) {
      const url = new URL(request.url);
      if (url.searchParams.get('key') !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!supabaseAdmin) {
      // Return empty structure if database not configured
      return NextResponse.json({
        success: true,
        data: {
          pageViews: { total: 0, byPage: {} },
          downloads: { total: 0, byProduct: {}, byProductSummary: { book: 0, research: 0 } },
          purchases: { total: 0, revenue: 0, byType: { ebook: 0, hardcopy: 0 } },
          events: { newsletter_signups: 0, payment_initiated: 0, payment_success: 0, payment_cancelled: 0 },
        },
        note: 'Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables.',
      });
    }

    const url = new URL(request.url);
    const dateRange = getDateRange(url.searchParams.get('date'));

    // Query page views
    let pageViewsQuery = supabaseAdmin
      .from('analytics_events')
      .select('label')
      .eq('action', 'page_view');
    if (dateRange) {
      pageViewsQuery = pageViewsQuery
        .gte('created_at', dateRange.start)
        .lt('created_at', dateRange.end);
    }
    const { data: pageViews, error: pageViewsError } = await pageViewsQuery;

    // Query downloads from downloads table only
    // NOTE: We only count from downloads table to avoid double counting
    // Research downloads are tracked via /api/download-research which saves to downloads table
    let downloadsQuery = supabaseAdmin
      .from('downloads')
      .select('product, created_at, email')
      .order('created_at', { ascending: false });
    if (dateRange) {
      downloadsQuery = downloadsQuery
        .gte('created_at', dateRange.start)
        .lt('created_at', dateRange.end);
    }
    const { data: downloads, error: downloadsError } = await downloadsQuery;

    // Query purchases (include quantity and is_test for correct aggregation)
    let purchasesQuery = supabaseAdmin
      .from('purchases')
      .select('book_type, amount, quantity, is_test, created_at');
    if (dateRange) {
      purchasesQuery = purchasesQuery
        .gte('created_at', dateRange.start)
        .lt('created_at', dateRange.end);
    }
    let purchases: Array<Record<string, unknown>> | null;
    let purchasesError: unknown;
    const purchasesResult = await purchasesQuery;
    purchases = purchasesResult.data;
    purchasesError = purchasesResult.error;

    // Fallback if quantity/is_test columns not yet migrated
    if (purchasesError) {
      const errMsg = String((purchasesError as { message?: string })?.message || '').toLowerCase();
      if (errMsg.includes('column') && (errMsg.includes('quantity') || errMsg.includes('is_test'))) {
        let fallbackQuery = supabaseAdmin.from('purchases').select('book_type, amount, created_at');
        if (dateRange) {
          fallbackQuery = fallbackQuery
            .gte('created_at', dateRange.start)
            .lt('created_at', dateRange.end);
        }
        const fallback = await fallbackQuery;
        purchases = fallback.data as Array<Record<string, unknown>> | null;
        purchasesError = fallback.error;
      }
    }

    // Query events
    let eventsQuery = supabaseAdmin
      .from('analytics_events')
      .select('action');
    if (dateRange) {
      eventsQuery = eventsQuery
        .gte('created_at', dateRange.start)
        .lt('created_at', dateRange.end);
    }
    const { data: events, error: eventsError } = await eventsQuery;

    if (pageViewsError || downloadsError || purchasesError || eventsError) {
      console.error('Database query errors:', { pageViewsError, downloadsError, purchasesError, eventsError });
    }

    // Only count page views for real site pages (ignore /analytics, typos like /analyt, 404s)
    const filteredPageViews = pageViews?.filter((e) => isValidPageViewPath(e.label)) || [];

    // Aggregate page views by page
    const pageViewsByPage: Record<string, number> = {};
    filteredPageViews.forEach((event) => {
      const page = normalizeLabel(event.label);
      pageViewsByPage[page] = (pageViewsByPage[page] || 0) + 1;
    });

    // Aggregate downloads by specific product
    // Format: { "The Psychology of Sustainable Wealth": 5, "AI, Job Security...": 3 }
    const downloadsByProduct: Record<string, number> = {};
    const productNames: Record<string, string> = {
      'book': 'The Psychology of Sustainable Wealth',
      'research:ai-job-security': 'AI, Job Security, and the Human Condition',
    };

    // Process downloads from downloads table ONLY
    // This is the single source of truth for download counts
    if (downloads) {
      downloads.forEach((download) => {
        let productName = productNames[download.product] || download.product;
        
        // Handle research downloads with format "research:paper-id"
        if (download.product.startsWith('research:')) {
          const paperId = download.product.replace('research:', '');
          productName = productNames[download.product] || `Research Paper: ${paperId}`;
        }
        
        downloadsByProduct[productName] = (downloadsByProduct[productName] || 0) + 1;
      });
    }

    // Calculate totals
    const totalDownloads = Object.values(downloadsByProduct).reduce((sum, count) => sum + count, 0);
    const bookDownloads = downloadsByProduct['The Psychology of Sustainable Wealth'] || 0;
    const researchDownloadsTotal = Object.entries(downloadsByProduct)
      .filter(([name]) => name.includes('AI, Job Security') || name.startsWith('Research Paper'))
      .reduce((sum, [, count]) => sum + count, 0);

    // Aggregate purchases (exclude test, use quantity for both ebook and hardcopy)
    const ebookPrice = Number.parseInt(process.env.NEXT_PUBLIC_EBOOK_PRICE || '89', 10);
    const hardcopyPrice = Number.parseInt(process.env.NEXT_PUBLIC_HARDCOPY_PRICE || '99', 10);
    const discountPct = 20;
    const ebookDiscounted = ebookPrice * (100 - discountPct) / 100;
    const hardcopyDiscounted = hardcopyPrice * (100 - discountPct) / 100;

    let totalRevenue = 0;
    let totalPurchaseCount = 0;
    const purchasesByType = { ebook: 0, hardcopy: 0 };
    if (purchases) {
      purchases.forEach((p) => {
        if (p.is_test === true) return;
        const amount = typeof p.amount === 'number' && !Number.isNaN(p.amount)
          ? p.amount
          : parseFloat(String(p.amount ?? '')) || 0;
        totalRevenue += amount;
        totalPurchaseCount++;
        const qty = derivePurchaseQuantity(p, ebookPrice, hardcopyPrice, ebookDiscounted, hardcopyDiscounted);
        const bookType = String(p.book_type ?? '').toLowerCase();
        if (bookType === 'ebook') purchasesByType.ebook += qty;
        else if (bookType === 'hardcopy') purchasesByType.hardcopy += qty;
      });
    }

    // Aggregate events
    const eventCounts = {
      newsletter_signups: 0,
      payment_initiated: 0,
      payment_success: 0,
      payment_cancelled: 0,
    };
    if (events) {
      events.forEach((event) => {
        if (event.action === 'newsletter_signup') eventCounts.newsletter_signups++;
        else if (event.action === 'payment_initiated') eventCounts.payment_initiated++;
        else if (event.action === 'payment_success') eventCounts.payment_success++;
        else if (event.action === 'payment_cancelled') eventCounts.payment_cancelled++;
      });
    }

    const summary = {
      pageViews: {
        total: filteredPageViews.length,
        byPage: pageViewsByPage,
      },
      downloads: {
        total: totalDownloads,
        byProduct: downloadsByProduct,
        byProductSummary: {
          book: bookDownloads,
          research: researchDownloadsTotal,
        },
      },
      purchases: {
        total: totalPurchaseCount,
        revenue: totalRevenue,
        byType: purchasesByType,
      },
      events: eventCounts,
    };

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
