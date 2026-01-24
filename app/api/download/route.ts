import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Secure download endpoint
// Validates signed URLs and serves protected files
// For production, consider using AWS S3 presigned URLs instead

function verifySignature(
  email: string,
  product: string,
  expires: string,
  signature: string
): boolean {
  const secret = process.env.DOWNLOAD_SECRET || 'fallback-secret-change-me';
  const data = `${email}:${product}:${expires}`;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
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

    // Determine which file to serve
    // Files are stored in /private/books/ - NOT accessible via public URL
    let fileName: string;
    let displayName: string;

    switch (product) {
      case 'book':
        fileName = 'The Psychology of Sustainable Wealth - The Ghanaian Perspective.pdf';
        displayName = 'The-Psychology-of-Sustainable-Wealth.pdf';
        break;
      case 'bundle':
        fileName = 'The Psychology of Sustainable Wealth - The Ghanaian Perspective.pdf';
        displayName = 'The-Psychology-of-Sustainable-Wealth-Bundle.pdf';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid product' },
          { status: 400 }
        );
    }

    // Read file from PRIVATE directory (not publicly accessible)
    // SECURITY: Files in /private/ cannot be accessed directly via URL
    const filePath = path.join(process.cwd(), 'private', 'books', fileName);
    const contentDisposition = `attachment; filename="${displayName}"`;

    try {
      const fileBuffer = await readFile(filePath);

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
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': contentDisposition,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (fileError) {
      console.error('File read error:', filePath, fileError instanceof Error ? fileError.message : fileError);
      return NextResponse.json(
        { error: 'File not found. Please contact support.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/*
 * PRODUCTION RECOMMENDATIONS:
 * 
 * 1. Move book files to AWS S3 or similar:
 *    - More secure (files not in public directory)
 *    - Better scalability and CDN distribution
 *    - Use S3 presigned URLs for time-limited access
 * 
 * Example S3 implementation:
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
 *   
 *   return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
 * }
 * 
 * // Then redirect to S3 URL instead of serving file directly:
 * const s3Url = await getS3DownloadUrl(`books/${fileName}`);
 * return NextResponse.redirect(s3Url);
 */

