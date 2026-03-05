import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { sendEmail, sendAdminPurchaseNotification } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase';

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

const DISCOUNT_PERCENT = 20;
const VALID_DISCOUNT_CODE = (
  process.env.DISCOUNT_CODE_20 ||
  process.env.NEXT_PUBLIC_DISCOUNT_CODE ||
  'WEALTH20'
).trim().toUpperCase();

// Generate a time-limited signed URL for downloads
function generateSignedDownloadUrl(
  email: string,
  product: string,
  expiresIn: number = 24 * 60 * 60 * 1000 // 24 hours
): string | null {
  const secret = process.env.DOWNLOAD_SECRET;
  if (!secret) {
    console.error('DOWNLOAD_SECRET is not set - cannot generate download URLs');
    return null;
  }

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
  quantity: number;
  discountCode?: string;
  discountAmount?: number;
  isEbook: boolean;
  customerPhone?: string;
  fullDownloadUrl?: string;
  deliveryAddress?: DeliveryAddress;
}): string {
  const {
    customerName,
    reference,
    amount,
    quantity,
    discountCode,
    discountAmount,
    isEbook,
    customerPhone,
    fullDownloadUrl,
    deliveryAddress,
  } = params;

  const detailsRows = [
    `<p style="margin:0;"><strong>Reference:</strong> ${reference}</p>`,
    `<p style="margin:0;"><strong>Amount:</strong> GHS ${amount}</p>`,
    `<p style="margin:0;"><strong>Quantity:</strong> ${quantity}</p>`,
    discountCode ? `<p style="margin:0;"><strong>Discount:</strong> ${DISCOUNT_PERCENT}% (${discountCode})</p>` : '',
    discountCode && typeof discountAmount === 'number' ? `<p style="margin:0;"><strong>You saved:</strong> GHS ${discountAmount.toFixed(2)}</p>` : '',
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
  quantity: number;
  discountCode?: string;
  discountAmount?: number;
  isEbook: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  fullDownloadUrl?: string;
  deliveryAddress?: DeliveryAddress;
}): string {
  const {
    reference,
    amount,
    quantity,
    discountCode,
    discountAmount,
    isEbook,
    customerName,
    customerEmail,
    customerPhone,
    fullDownloadUrl,
    deliveryAddress,
  } = params;

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
        <p style="margin:0;"><strong>Quantity:</strong> ${quantity}</p>
        ${discountCode ? `<p style="margin:0;"><strong>Discount:</strong> ${DISCOUNT_PERCENT}% (${discountCode})</p>` : ''}
        ${discountCode && typeof discountAmount === 'number' ? `<p style="margin:0;"><strong>Discount Amount:</strong> GHS ${discountAmount.toFixed(2)}</p>` : ''}
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
      quantity,
      discountCode,
      deliveryAddress,
    } = body;

    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Check for duplicate payment reference (prevent replay attacks)
    if (supabaseAdmin) {
      try {
        const { data: existing } = await supabaseAdmin
          .from('purchases')
          .select('reference')
          .eq('reference', reference)
          .maybeSingle();

        if (existing) {
          console.warn('Duplicate payment verification attempt:', reference);
          return NextResponse.json(
            { success: false, message: 'This payment has already been processed' },
            { status: 409 }
          );
        }
      } catch (dbError) {
        console.error('Duplicate check failed:', dbError);
        // Continue - don't block payment on DB errors
      }
    }

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecretKey) {
      console.error('Paystack secret key not configured');
      // For development: Allow proceeding without verification
      if (process.env.NODE_ENV === 'development') {
        const downloadUrl = generateSignedDownloadUrl(
          email,
          'book'
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
    const amountPesewas = verifyData.data.amount;
    const amount = amountPesewas / 100; // Convert from pesewas to GHS
    const productType = bookType === 'hardcopy' ? 'hardcopy' : 'ebook';
    const isEbook = productType === 'ebook';
    const unitPrice = productType === 'hardcopy'
      ? Number.parseInt(process.env.NEXT_PUBLIC_HARDCOPY_PRICE || '99', 10)
      : Number.parseInt(process.env.NEXT_PUBLIC_EBOOK_PRICE || '89', 10);

    let finalQuantity = 1;
    if (!isEbook) {
      const requestedQuantity = Number.parseInt(String(quantity ?? '1'), 10);
      const metadataQuantityRaw = verifyData.data.metadata?.custom_fields?.find(
        f => f.variable_name === 'quantity'
      )?.value;
      const metadataQuantity = Number.parseInt(metadataQuantityRaw || '1', 10);
      const derivedQuantity = Number.isInteger(amount / unitPrice) ? amount / unitPrice : Number.NaN;
      if (Number.isInteger(metadataQuantity) && metadataQuantity > 0) {
        finalQuantity = metadataQuantity;
      } else if (Number.isInteger(requestedQuantity) && requestedQuantity > 0) {
        finalQuantity = requestedQuantity;
      } else if (Number.isInteger(derivedQuantity) && derivedQuantity > 0) {
        finalQuantity = derivedQuantity;
      }
    }

    const requestedDiscountCode = typeof discountCode === 'string' ? discountCode.trim().toUpperCase() : '';
    const metadataDiscountCode = verifyData.data.metadata?.custom_fields?.find(
      f => f.variable_name === 'discount_code'
    )?.value?.trim().toUpperCase() || '';
    const activeDiscountCode = metadataDiscountCode || requestedDiscountCode;
    const hasValidDiscount = !!activeDiscountCode && activeDiscountCode === VALID_DISCOUNT_CODE;
    const discountMultiplier = hasValidDiscount ? (100 - DISCOUNT_PERCENT) / 100 : 1;

    const expectedAmountPesewas = Math.round(unitPrice * finalQuantity * discountMultiplier * 100);
    if (amountPesewas !== expectedAmountPesewas) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment amount mismatch for selected quantity/discount',
        },
        { status: 400 }
      );
    }

    const subtotalAmount = unitPrice * finalQuantity;
    const discountAmount = hasValidDiscount ? Number((subtotalAmount - amount).toFixed(2)) : 0;

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
      'book'
    ) : undefined;
    if (isEbook && !downloadUrl) {
      return NextResponse.json(
        { success: false, message: 'Unable to generate secure download link. Please contact support.' },
        { status: 500 }
      );
    }

    // Get full URL for email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kofiasiedumahama.com';
    const fullDownloadUrl = downloadUrl ? `${siteUrl}${downloadUrl}` : undefined;

    // Track email send status for user feedback
    let customerEmailSent = false;
    let adminEmailSent = false;

    // Send customer transactional email via Resend
    try {
      const subject = 'Your Copy of "The Psychology of Sustainable Wealth"';
      const customerHtml = buildCustomerEmailHtml({
        customerName,
        reference,
        amount,
        quantity: finalQuantity,
        discountCode: hasValidDiscount ? activeDiscountCode : undefined,
        discountAmount,
        isEbook,
        customerPhone,
        fullDownloadUrl,
        deliveryAddress: parsedDeliveryAddress,
      });

      customerEmailSent = await sendEmail({
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
        quantity: finalQuantity,
        discountCode: hasValidDiscount ? activeDiscountCode : undefined,
        discountAmount,
        isEbook,
        customerName,
        customerEmail,
        customerPhone,
        fullDownloadUrl,
        deliveryAddress: parsedDeliveryAddress,
      });

      adminEmailSent = await sendAdminPurchaseNotification({
        subject: `New Purchase - ${customerName} (${reference})`,
        html: adminHtml,
      });
    } catch (emailError) {
      console.error('Resend admin email failed:', emailError);
    }

    // Log successful payment
    console.log('Payment verified:', {
      reference,
      email: customerEmail,
      name: customerName,
      phone: customerPhone,
      amount,
      quantity: finalQuantity,
      discountCode: hasValidDiscount ? activeDiscountCode : null,
      discountAmount,
      bookType: productType,
      hasDeliveryAddress: !!parsedDeliveryAddress,
      customerEmailSent,
      adminEmailSent,
    });

    // Save purchase to database if configured
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('purchases')
          .insert({
            reference,
            customer_email: customerEmail,
            customer_name: customerName,
            customer_phone: customerPhone || null,
            amount,
            currency: 'GHS',
            book_type: productType,
            delivery_address: parsedDeliveryAddress || null,
            download_url: fullDownloadUrl || null,
          });
      } catch (dbError) {
        console.error('Failed to save purchase to database:', dbError);
        // Continue anyway - don't fail the payment verification
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      downloadUrl,
      emailSent: customerEmailSent,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

