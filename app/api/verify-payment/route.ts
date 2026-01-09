import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, email, includeBundle } = body;

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
    // In production, you would:
    // 1. Store the purchase in a database
    // 2. Send confirmation email
    // 3. Track affiliate referrals if applicable

    // Generate signed download URL
    const product = includeBundle ? 'bundle' : 'book';
    const downloadUrl = generateSignedDownloadUrl(
      verifyData.data.customer.email,
      product
    );

    // Log successful payment (in production, store in database)
    console.log('Payment verified:', {
      reference,
      email: verifyData.data.customer.email,
      amount: verifyData.data.amount / 100, // Convert from pesewas to GHS
      product,
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

