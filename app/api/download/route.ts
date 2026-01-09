import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { readFile } from 'fs/promises';
import path from 'path';

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
    const expirationTime = parseInt(expires, 10);
    if (isNaN(expirationTime) || Date.now() > expirationTime) {
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
    // For production, use S3 or similar cloud storage
    let fileName: string;
    let contentDisposition: string;

    switch (product) {
      case 'book':
        fileName = 'book.pdf';
        contentDisposition = 'attachment; filename="The-Path-to-Purpose.pdf"';
        break;
      case 'bundle':
        fileName = 'book.pdf'; // Could be a zip file with all bundle contents
        contentDisposition = 'attachment; filename="The-Path-to-Purpose-Bundle.pdf"';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid product' },
          { status: 400 }
        );
    }

    // Read file from public directory
    // SECURITY NOTE: In production, store files outside public/ and use S3
    const filePath = path.join(process.cwd(), 'public', fileName);

    try {
      const fileBuffer = await readFile(filePath);

      // Log download (in production, store in database)
      console.log('Download:', {
        email,
        product,
        timestamp: new Date().toISOString(),
      });

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
      console.error('File not found:', filePath);
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

