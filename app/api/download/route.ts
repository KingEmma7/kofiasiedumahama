import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Secure download endpoint
// Validates signed URLs and serves protected files
// Supports both Supabase Storage (production) and local filesystem (development)

function verifySignature(
  email: string,
  product: string,
  expires: string,
  signature: string
): boolean {
  const secret = process.env.DOWNLOAD_SECRET;
  if (!secret) {
    console.error('DOWNLOAD_SECRET is not set - cannot verify download signatures');
    return false;
  }

  const data = `${email}:${product}:${expires}`;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');

  // Ensure both buffers are the same length before timing-safe comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Product file mapping
const PRODUCT_FILES: Record<string, { fileName: string; displayName: string; storagePath: string }> = {
  book: {
    fileName: 'The Psychology of Sustainable Wealth - The Ghanaian Perspective - Kofi Asideu-Mahama.pdf',
    displayName: 'The-Psychology-of-Sustainable-Wealth.pdf',
    storagePath: 'books/The Psychology of Sustainable Wealth - The Ghanaian Perspective - Kofi Asideu-Mahama.pdf',
  },
  bundle: {
    fileName: 'The Psychology of Sustainable Wealth - The Ghanaian Perspective - Kofi Asideu-Mahama.pdf',
    displayName: 'The-Psychology-of-Sustainable-Wealth-Bundle.pdf',
    storagePath: 'books/The Psychology of Sustainable Wealth - The Ghanaian Perspective - Kofi Asideu-Mahama.pdf',
  },
};

/**
 * Try to fetch the file from Supabase Storage first (production).
 * Falls back to local filesystem (development).
 */
async function getFileBuffer(product: string): Promise<{ buffer: Buffer; displayName: string } | null> {
  const productConfig = PRODUCT_FILES[product];
  if (!productConfig) return null;

  const { fileName, displayName, storagePath } = productConfig;

  // Strategy 1: Supabase Storage (recommended for production/Vercel)
  const storageBucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (supabaseAdmin && storageBucket) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(storageBucket)
        .download(storagePath);

      if (error) {
        console.error('Supabase Storage download error:', error.message);
      } else if (data) {
        const arrayBuffer = await data.arrayBuffer();
        return { buffer: Buffer.from(arrayBuffer), displayName };
      }
    } catch (storageError) {
      console.error('Supabase Storage error:', storageError);
    }
  }

  // Strategy 2: Local filesystem fallback (development / self-hosted)
  try {
    const filePath = path.join(process.cwd(), 'private', 'books', fileName);
    const fileBuffer = await readFile(filePath);
    return { buffer: fileBuffer, displayName };
  } catch {
    // File not found locally either
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const product = searchParams.get('product');
    const expires = searchParams.get('expires');
    const sig = searchParams.get('sig');

    // Validate parameters
    if (!email || !product || !expires || !sig) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check if link has expired
    const expirationTime = Number.parseInt(expires, 10);
    if (Number.isNaN(expirationTime) || Date.now() > expirationTime) {
      return NextResponse.json(
        { error: 'Download link has expired. Please contact support for a new link.' },
        { status: 410 }
      );
    }

    // Verify signature
    if (!verifySignature(email, product, expires, sig)) {
      return NextResponse.json(
        { error: 'Invalid download link' },
        { status: 403 }
      );
    }

    // Validate product
    if (!PRODUCT_FILES[product]) {
      return NextResponse.json(
        { error: 'Invalid product' },
        { status: 400 }
      );
    }

    // Fetch file (Supabase Storage or local filesystem)
    const fileResult = await getFileBuffer(product);

    if (!fileResult) {
      console.error(`File not found for product: ${product}`);
      return NextResponse.json(
        { error: 'File not found. Please contact support.' },
        { status: 404 }
      );
    }

    const { buffer, displayName } = fileResult;

    // Log download with analytics tracking
    const downloadData = {
      email: email.substring(0, 3) + '***', // Partial email for privacy
      product,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown').split(',')[0].trim(),
    };
    
    console.log('[Download]', JSON.stringify(downloadData));
    
    // Save download to database if configured
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('downloads')
          .insert({
            email,
            product,
            user_agent: request.headers.get('user-agent') || null,
            ip_address: (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '').split(',')[0].trim() || null,
          });
      } catch (dbError) {
        console.error('Failed to save download to database:', dbError);
        // Continue anyway - don't fail the download
      }
    }

    // Return file with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${displayName}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/*
 * SETUP: Supabase Storage (recommended for Vercel deployment)
 * 
 * 1. Go to your Supabase project > Storage > Create bucket
 *    - Name: "paid-books" (or whatever you prefer)
 *    - Set to PRIVATE (not public)
 * 
 * 2. Upload your PDF to the bucket (exact path and filename):
 *    - Path: books/The Psychology of Sustainable Wealth - The Ghanaian Perspective - Kofi Asideu-Mahama.pdf
 * 
 * 3. Add to your .env.local:
 *    SUPABASE_STORAGE_BUCKET=paid-books
 * 
 * 4. That's it! The download API will automatically use Supabase Storage
 *    when the bucket is configured, with local filesystem as fallback.
 * 
 * ALTERNATIVE: AWS S3
 * 
 * import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
 * import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
 * 
 * const s3Client = new S3Client({
 *   region: process.env.AWS_REGION,
 *   credentials: {
 *     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
 *     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
 *   },
 * });
 * 
 * async function getS3DownloadUrl(key: string): Promise<string> {
 *   const command = new GetObjectCommand({
 *     Bucket: process.env.AWS_S3_BUCKET,
 *     Key: key,
 *   });
 *   return getSignedUrl(s3Client, command, { expiresIn: 3600 });
 * }
 */
