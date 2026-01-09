import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Paystack webhook handler
// Receives payment notifications from Paystack
// Use this for reliable payment tracking and sending confirmation emails

interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    customer: {
      email: string;
      first_name?: string;
      last_name?: string;
    };
    metadata?: {
      custom_fields?: Array<{
        variable_name: string;
        value: string;
      }>;
    };
  };
}

// Verify webhook signature
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex');
  
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      console.error('Paystack secret key not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify signature
    if (!signature || !verifyWebhookSignature(body, signature, secret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event: PaystackWebhookEvent = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
      
      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;

      case 'refund.processed':
        await handleRefund(event.data);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 anyway to prevent Paystack from retrying
    return NextResponse.json({ received: true, error: 'Processing error' });
  }
}

async function handleSuccessfulPayment(data: PaystackWebhookEvent['data']) {
  console.log('Successful payment:', {
    reference: data.reference,
    email: data.customer.email,
    amount: data.amount / 100,
  });

  // In production:
  // 1. Store payment in database
  // await db.payments.create({
  //   reference: data.reference,
  //   email: data.customer.email,
  //   amount: data.amount,
  //   status: 'success',
  //   createdAt: new Date(),
  // });

  // 2. Send confirmation email with download link
  // const downloadUrl = generateSignedDownloadUrl(data.customer.email, 'book');
  // await sendEmail({
  //   to: data.customer.email,
  //   subject: 'Your Book Download Link',
  //   template: 'purchase-confirmation',
  //   data: { downloadUrl, name: data.customer.first_name },
  // });

  // 3. Track affiliate if applicable
  // const affiliateId = data.metadata?.custom_fields?.find(
  //   f => f.variable_name === 'affiliate_id'
  // )?.value;
  // if (affiliateId) {
  //   await trackAffiliateConversion(affiliateId, data.amount);
  // }
}

async function handleFailedPayment(data: PaystackWebhookEvent['data']) {
  console.log('Failed payment:', {
    reference: data.reference,
    email: data.customer.email,
  });

  // Log failed payment for analytics
  // Could send a follow-up email asking if they need help
}

async function handleRefund(data: PaystackWebhookEvent['data']) {
  console.log('Refund processed:', {
    reference: data.reference,
    email: data.customer.email,
  });

  // Update payment status in database
  // Revoke download access if needed
}

/*
 * PAYSTACK WEBHOOK SETUP:
 * 
 * 1. Go to Paystack Dashboard > Settings > Webhooks
 * 2. Add webhook URL: https://yourdomain.com/api/webhook/paystack
 * 3. Enable the events you want to receive:
 *    - charge.success (required for payment confirmation)
 *    - charge.failed (optional, for analytics)
 *    - refund.processed (optional, for refund handling)
 * 
 * IMPORTANT: The webhook URL must be HTTPS and publicly accessible
 */

