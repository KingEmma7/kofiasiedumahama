import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { sendEmail, sendAdminPurchaseNotification } from '@/lib/email';

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
  const customerEmail = data.customer.email;
  const amount = data.amount / 100; // Convert from pesewas to GHS
  
  // Extract customer details from metadata
  const customerName = data.metadata?.custom_fields?.find(
    f => f.variable_name === 'customer_name'
  )?.value || data.customer.first_name || customerEmail.split('@')[0];

  const customerPhone = data.metadata?.custom_fields?.find(
    f => f.variable_name === 'phone'
  )?.value;

  const productValue = data.metadata?.custom_fields?.find(
    f => f.variable_name === 'product'
  )?.value || 'eBook';

  const bookType = productValue.toLowerCase().includes('hardcopy') ? 'hardcopy' : 'ebook';
  const isBundle = productValue.toLowerCase().includes('bundle');
  const isEbook = bookType === 'ebook' || isBundle;

  // Parse delivery address if available
  let deliveryAddress;
  if (!isEbook) {
    const addressString = data.metadata?.custom_fields?.find(
      f => f.variable_name === 'delivery_address'
    )?.value;
    
    if (addressString) {
      const parts = addressString.split(', ').map(s => s.trim());
      if (parts.length >= 3) {
        deliveryAddress = {
          street: parts[0] || '',
          city: parts[1] || '',
          region: parts[2] || '',
          postalCode: parts[3] || '',
          country: parts[4] || 'Ghana',
        };
      }
    }
  }

  console.log('Successful payment:', {
    reference: data.reference,
    email: customerEmail,
    name: customerName,
    phone: customerPhone,
    amount,
    bookType,
    hasDeliveryAddress: !!deliveryAddress,
  });

  // Generate download URL for ebooks/bundles (product determines download display name)
  const downloadProduct = isBundle ? 'bundle' : 'book';
  let downloadUrl: string | undefined;
  if (isEbook) {
    const downloadSecret = process.env.DOWNLOAD_SECRET;
    if (downloadSecret) {
      const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      const dataString = `${customerEmail}:${downloadProduct}:${expires}`;
      const signature = crypto
        .createHmac('sha256', downloadSecret)
        .update(dataString)
        .digest('hex');
      
      const params = new URLSearchParams({
        email: customerEmail,
        product: downloadProduct,
        expires: expires.toString(),
        sig: signature,
      });
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kofiasiedumahama.com';
      downloadUrl = `${siteUrl}/api/download?${params.toString()}`;
    } else {
      console.error('[Webhook] DOWNLOAD_SECRET not set - cannot generate download URL');
    }
  }

  // To avoid double-sending (verify-payment also sends), webhook email sending is OFF by default.
  // Turn on only if you want webhook to send as a fallback:
  // RESEND_WEBHOOK_SEND_EMAILS=true
  if (process.env.RESEND_WEBHOOK_SEND_EMAILS !== 'true') {
    return;
  }

  try {
    const subject = 'Your Copy of "The Psychology of Sustainable Wealth"';
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin: 0 0 12px;">Thank you for your purchase, ${customerName}.</h2>
        <p style="margin: 0 0 12px;">Your copy of <strong>"The Psychology of Sustainable Wealth - The Ghanaian Perspective"</strong> is ready!</p>
        <p style="margin: 0 0 12px;">Reference: <strong>${data.reference}</strong></p>
        ${downloadUrl ? `<p><a href="${downloadUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;">Download your book</a></p><p style="color:#6b7280;font-size:12px;">This link expires in 24 hours.</p>` : ''}
      </div>
    `;
    await sendEmail({ to: customerEmail, subject, html });
  } catch (emailError) {
    console.error('[Webhook] Resend customer email failed:', emailError);
  }

  try {
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin:0 0 12px;">New book purchase (webhook)</h2>
        <p style="margin:0;"><strong>Reference:</strong> ${data.reference}</p>
        <p style="margin:0;"><strong>Name:</strong> ${customerName}</p>
        <p style="margin:0;"><strong>Email:</strong> ${customerEmail}</p>
        ${customerPhone ? `<p style="margin:0;"><strong>Phone:</strong> ${customerPhone}</p>` : ''}
        ${deliveryAddress ? `<p style="margin:12px 0 0;"><strong>Delivery:</strong> ${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.region}</p>` : ''}
      </div>
    `;
    await sendAdminPurchaseNotification({
      subject: `New Purchase (Webhook) - ${customerName} (${data.reference})`,
      html: adminHtml,
    });
  } catch (emailError) {
    console.error('[Webhook] Resend admin email failed:', emailError);
  }

  // In production, you would also:
  // 1. Store payment in database
  // 2. Track affiliate if applicable
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

