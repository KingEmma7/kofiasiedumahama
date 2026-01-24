import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Map of research paper IDs to their file names
const researchPapers: Record<string, { fileName: string; displayName: string }> = {
  'ai-job-security': {
    fileName: 'ai-job-security-human-condition.pdf',
    displayName: 'AI-Job-Security-and-the-Human-Condition.pdf',
  },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paperId = searchParams.get('id');

    if (!paperId || !researchPapers[paperId]) {
      return NextResponse.json(
        { error: 'Invalid paper ID' },
        { status: 400 }
      );
    }

    const paper = researchPapers[paperId];
    const filePath = path.join(process.cwd(), 'public', 'books', paper.fileName);

    try {
      const fileBuffer = await readFile(filePath);

      // Get user info for tracking
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const ip = (request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown').split(',')[0].trim();

      // Save download to database
      if (supabaseAdmin) {
        try {
          await supabaseAdmin
            .from('downloads')
            .insert({
              email: 'anonymous', // Research papers are free, no email required
              product: `research:${paperId}`, // Format: research:paper-id
              user_agent: userAgent,
              ip_address: ip || null,
            });
        } catch (dbError) {
          console.error('Failed to save research download to database:', dbError);
          // Continue anyway - don't fail the download
        }
      }

      // Return file with appropriate headers
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${paper.displayName}"`,
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
