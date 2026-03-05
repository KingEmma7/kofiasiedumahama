import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect sensitive files from direct access.
 * Blocks direct URL access to paid book PDFs that might accidentally
 * end up in the /public directory.
 * 
 * Free research papers remain accessible.
 */

// Files that are explicitly allowed (free research papers, etc.)
const ALLOWED_FILES = [
  'ai-job-security-human-condition.pdf',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only check requests to /books/ directory (public static files)
  if (pathname.startsWith('/books/')) {
    const fileName = decodeURIComponent(pathname.split('/').pop() || '');

    // Allow explicitly free files
    if (ALLOWED_FILES.some(f => fileName.includes(f))) {
      return NextResponse.next();
    }

    // Security default-deny: any non-allowlisted /books file is blocked
    return NextResponse.json(
      { error: 'This content requires purchase. Visit the book page to buy.' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on static book files
  matcher: ['/books/:path*'],
};
