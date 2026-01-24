import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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
 * In production, this would query a database
 * For now, returns mock data structure
 */
export async function GET(request: NextRequest) {
  try {
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

    // Query page views
    const { data: pageViews, error: pageViewsError } = await supabaseAdmin
      .from('analytics_events')
      .select('label')
      .eq('action', 'page_view');

    // Query downloads from downloads table only
    // NOTE: We only count from downloads table to avoid double counting
    // Research downloads are tracked via /api/download-research which saves to downloads table
    const { data: downloads, error: downloadsError } = await supabaseAdmin
      .from('downloads')
      .select('product, created_at, email')
      .order('created_at', { ascending: false });

    // Query purchases
    const { data: purchases, error: purchasesError } = await supabaseAdmin
      .from('purchases')
      .select('book_type, amount, created_at');

    // Query events
    const { data: events, error: eventsError } = await supabaseAdmin
      .from('analytics_events')
      .select('action');

    if (pageViewsError || downloadsError || purchasesError || eventsError) {
      console.error('Database query errors:', { pageViewsError, downloadsError, purchasesError, eventsError });
    }

    // Aggregate page views by page
    const pageViewsByPage: Record<string, number> = {};
    if (pageViews) {
      pageViews.forEach((event) => {
        const page = event.label || '/';
        pageViewsByPage[page] = (pageViewsByPage[page] || 0) + 1;
      });
    }

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

    // Aggregate purchases
    let totalRevenue = 0;
    const purchasesByType = { ebook: 0, hardcopy: 0 };
    if (purchases) {
      purchases.forEach((purchase) => {
        totalRevenue += Number(purchase.amount) || 0;
        if (purchase.book_type === 'ebook') purchasesByType.ebook++;
        else if (purchase.book_type === 'hardcopy') purchasesByType.hardcopy++;
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
        total: pageViews?.length || 0,
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
        total: purchases?.length || 0,
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
