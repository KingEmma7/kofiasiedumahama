import { NextRequest, NextResponse } from 'next/server';
import { upsertSubscriber, getBrevoListIds } from '@/lib/brevo';

export const dynamic = 'force-dynamic';

function asOptionalTrimmedString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const v = value.trim();
    return v || undefined;
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    const v = String(value).trim();
    return v || undefined;
  }
  return undefined;
}

/**
 * Brevo subscriber management endpoint.
 *
 * Setup:
 * - Create a Brevo account at https://www.brevo.com/
 * - Create a List (e.g. "Newsletter") and copy its List ID
 * - Get your API key from Brevo > Settings > API Keys
 * - Set env vars:
 *   - BREVO_API_KEY=...
 *   - BREVO_LIST_ID=... (or BREVO_LIST_IDS=1,2,3 for multiple lists)
 *
 * Free plan: Unlimited contacts + 300 emails/day (9,000/month)
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Brevo is configured
    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY is not set in environment variables');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email service is not configured. Please contact support.',
          ...(process.env.NODE_ENV === 'development' ? { 
            error: 'BREVO_API_KEY environment variable is missing' 
          } : {})
        },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const phone = asOptionalTrimmedString(body.phone);
    const name = asOptionalTrimmedString(body.name);

    if (!email?.includes('@')) {
      return NextResponse.json({ success: false, message: 'Valid email is required' }, { status: 400 });
    }

    const listIds = getBrevoListIds();
    if (listIds.length === 0) {
      console.warn('BREVO_LIST_ID or BREVO_LIST_IDS is not set - contact will be created without list assignment');
    }

    console.log('Attempting to subscribe:', { email, hasName: !!name, hasPhone: !!phone, listIds });

    await upsertSubscriber({
      email,
      name,
      phone,
      listIds,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! You have been subscribed successfully.',
    });
  } catch (error) {
    console.error('Brevo subscribe error:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      // Log Brevo API response if available
      const brevoError = error as any;
      if (brevoError.response) {
        const responseBody = brevoError.response.data || brevoError.response.body;
        console.error('Brevo API response status:', brevoError.response.status || brevoError.response.statusCode);
        console.error('Brevo API response body:', JSON.stringify(responseBody, null, 2));
        
        // If it's an invalid phone number error, provide helpful message
        if (responseBody?.code === 'invalid_parameter' && responseBody?.message?.includes('phone')) {
          errorMessage = 'Invalid phone number format. Please include country code (e.g., +233...).';
          statusCode = 400;
        }
      }
    }
    
    // Determine error message and status
    let errorMessage = 'Subscription failed. Please try again later.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('BREVO_API_KEY')) {
        errorMessage = 'Email service is not configured. Please contact support.';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid API credentials. Please contact support.';
      } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
        errorMessage = 'Invalid contact data. Please check your information.';
        statusCode = 400;
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        // Include error details in development
        ...(process.env.NODE_ENV === 'development' && error instanceof Error ? { 
          error: error.message 
        } : {})
      },
      { status: statusCode }
    );
  }
}