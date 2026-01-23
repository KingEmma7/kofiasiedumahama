import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { sendEmail, sendAdminPurchaseNotification } from '@/lib/email';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Payment verification and download URL generation
// Security: This route verifies payments with Paystack and generates signed download URLs

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    customer: {
      email: string;
    };
    metadata?: {
      custom_fields?: Array<{
        variable_name: string;
        value: string;
      }>;
    };
  };
}

type DeliveryAddress = {
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

// Generate a time-limited signed URL for downloads
function generateSignedDownloadUrl(
  email: string,
  product: string,
  expiresIn: number = 24 * 60 * 60 * 1000 // 24 hours
): string {
  const secret = process.env.DOWNLOAD_SECRET || 'fallback-secret-change-me';
  const expires = Date.now() + expiresIn;
  const data = `${email}:${product}:${expires}`;
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');

  const params = new URLSearchParams({
    email,
    product,
    expires: expires.toString(),
    sig: signature,
  });

  // Return relative URL - will be used with the site's domain
  return `/api/download?${params.toString()}`;
}

function parseDeliveryAddressString(addressString?: string): DeliveryAddress | undefined {
  if (!addressString) return undefined;
  const parts = addressString.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length < 3) return undefined;
  return {
    street: parts[0] || '',
    city: parts[1] || '',
    region: parts[2] || '',
    postalCode: parts[3] || '',
    country: parts[4] || 'Ghana',
  };
}

function buildCustomerEmailHtml(params: {
  customerName: string;
  reference: string;
  amount: number;
  isEbook: boolean;
  customerPhone?: string;
  fullDownloadUrl?: string;
  deliveryAddress?: DeliveryAddress;
}): string {
  const { customerName, reference, amount, isEbook, customerPhone, fullDownloadUrl, deliveryAddress } = params;

  const detailsRows = [
    `<p style="margin:0;"><strong>Reference:</strong> ${reference}</p>`,
    `<p style="margin:0;"><strong>Amount:</strong> GHS ${amount}</p>`,
    `<p style="margin:0;"><strong>Type:</strong> ${isEbook ? 'eBook (PDF)' : 'Hardcopy Book'}</p>`,
    customerPhone ? `<p style="margin:0;"><strong>Phone:</strong> ${customerPhone}</p>` : '',
  ].filter(Boolean).join('');

  const ebookSection =
    isEbook && fullDownloadUrl
      ? `
        <p style="margin: 0 0 12px;"><strong>Your download link:</strong></p>
        <p style="margin: 0 0 18px;">
          <a href="${fullDownloadUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;">
            Download your book
          </a>
        </p>
        <p style="margin:0;color:#6b7280;font-size:12px;">This link expires in 24 hours.</p>
      `
      : '';

  const hardcopyAddress =
    !isEbook && deliveryAddress
      ? `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;"><strong>Delivery address</strong></p>
          <p style="margin:0;">
            ${deliveryAddress.street}<br/>
            ${deliveryAddress.city}, ${deliveryAddress.region}<br/>
            ${deliveryAddress.postalCode || ''} ${deliveryAddress.country}
          </p>
        </div>
      `
      : '';

  const hardcopySection =
    !isEbook
      ? `
        <p style="margin: 18px 0 0;">
          Your hardcopy will be delivered to the address you provided. Our team will contact you shortly.
        </p>
        ${hardcopyAddress}
      `
      : '';

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin: 0 0 12px;">Thank you for your purchase, ${customerName}.</h2>
      <p style="margin: 0 0 12px;">We’ve received your payment successfully.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;">
        ${detailsRows}
      </div>
      ${ebookSection}
      ${hardcopySection}
      <p style="margin: 22px 0 0;">— Kofi Asiedu-Mahama</p>
    </div>
  `;
}

function buildAdminEmailHtml(params: {
  reference: string;
  amount: number;
  isEbook: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  fullDownloadUrl?: string;
  deliveryAddress?: DeliveryAddress;
}): string {
  const { reference, amount, isEbook, customerName, customerEmail, customerPhone, fullDownloadUrl, deliveryAddress } = params;

  const deliverySection =
    !isEbook && deliveryAddress
      ? `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;"><strong>Delivery address</strong></p>
          <p style="margin:0;">
            ${deliveryAddress.street}<br/>
            ${deliveryAddress.city}, ${deliveryAddress.region}<br/>
            ${deliveryAddress.postalCode || ''} ${deliveryAddress.country}
          </p>
        </div>
      `
      : '';

  const downloadSection =
    isEbook && fullDownloadUrl
      ? `<p style="margin:0;"><strong>Download link:</strong> <a href="${fullDownloadUrl}">${fullDownloadUrl}</a></p>`
      : '';

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin:0 0 12px;">New book purchase</h2>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:0;"><strong>Reference:</strong> ${reference}</p>
        <p style="margin:0;"><strong>Amount:</strong> GHS ${amount}</p>
        <p style="margin:0;"><strong>Type:</strong> ${isEbook ? 'eBook (PDF)' : 'Hardcopy Book'}</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:0;"><strong>Name:</strong> ${customerName}</p>
        <p style="margin:0;"><strong>Email:</strong> ${customerEmail}</p>
        ${customerPhone ? `<p style="margin:0;"><strong>Phone:</strong> ${customerPhone}</p>` : ''}
      </div>
      ${deliverySection}
      ${downloadSection}
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      reference, 
      email, 
      name,
      phone,
      bookType,
      deliveryAddress,
      includeBundle 
    } = body;

    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecretKey) {
      console.error('Paystack secret key not configured');
      // For development: Allow proceeding without verification
      if (process.env.NODE_ENV === 'development') {
        const downloadUrl = generateSignedDownloadUrl(
          email,
          includeBundle ? 'bundle' : 'book'
        );
        return NextResponse.json({
          success: true,
          message: 'DEV MODE: Payment simulated',
          downloadUrl,
        });
      }
      return NextResponse.json(
        { success: false, message: 'Payment system configuration error' },
        { status: 500 }
      );
    }

    // Call Paystack API to verify transaction
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const verifyData: PaystackVerifyResponse = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment verification failed',
          details: verifyData.message,
        },
        { status: 400 }
      );
    }

    // Payment verified successfully
    const customerEmail = verifyData.data.customer.email;
    const amount = verifyData.data.amount / 100; // Convert from pesewas to GHS
    const productType = bookType || (includeBundle ? 'bundle' : 'ebook');
    const isEbook = productType === 'ebook' || productType === 'bundle';

    // Extract customer name from metadata or use provided name
    const customerName = name || 
      verifyData.data.metadata?.custom_fields?.find(f => f.variable_name === 'customer_name')?.value ||
      customerEmail.split('@')[0];

    // Extract phone from metadata or use provided phone
    const customerPhone = phone || 
      verifyData.data.metadata?.custom_fields?.find(f => f.variable_name === 'phone')?.value;

    // Extract delivery address from metadata or use provided address
    let parsedDeliveryAddress: DeliveryAddress | undefined = deliveryAddress;
    if (!parsedDeliveryAddress && !isEbook) {
      const addressString = verifyData.data.metadata?.custom_fields?.find(
        f => f.variable_name === 'delivery_address'
      )?.value;
      
      parsedDeliveryAddress = parseDeliveryAddressString(addressString);
    }

    // Generate signed download URL (only for ebooks)
    const downloadUrl = isEbook ? generateSignedDownloadUrl(
      customerEmail,
      includeBundle ? 'bundle' : 'book'
    ) : undefined;

    // Get full URL for email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kofiasiedumahama.com';
    const fullDownloadUrl = downloadUrl ? `${siteUrl}${downloadUrl}` : undefined;

    // Send customer transactional email via Resend
    try {
      const subject = 'Your Copy of "The Psychology of Sustainable Wealth"';
      const customerHtml = buildCustomerEmailHtml({
        customerName,
        reference,
        amount,
        isEbook,
        customerPhone,
        fullDownloadUrl,
        deliveryAddress: parsedDeliveryAddress,
      });

      await sendEmail({
        to: customerEmail,
        subject,
        html: customerHtml,
      });
    } catch (emailError) {
      console.error('Resend customer email failed:', emailError);
    }

    // Send admin notification(s) via Resend
    try {
      const adminHtml = buildAdminEmailHtml({
        reference,
        amount,
        isEbook,
        customerName,
        customerEmail,
        customerPhone,
        fullDownloadUrl,
        deliveryAddress: parsedDeliveryAddress,
      });

      await sendAdminPurchaseNotification({
        subject: `New Purchase - ${customerName} (${reference})`,
        html: adminHtml,
      });
    } catch (emailError) {
      console.error('Resend admin email failed:', emailError);
    }

    // Log successful payment (in production, store in database)
    console.log('Payment verified:', {
      reference,
      email: customerEmail,
      name: customerName,
      phone: customerPhone,
      amount,
      bookType: productType,
      hasDeliveryAddress: !!parsedDeliveryAddress,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      downloadUrl,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

