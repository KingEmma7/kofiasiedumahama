import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect sensitive files from direct access.
 * Blocks direct URL access to paid book PDFs that might accidentally
 * end up in the /public directory.
 * 
 * Free research papers remain accessible.
 */

// Patterns for files that should NEVER be publicly accessible
const BLOCKED_PATTERNS = [
  /psychology.*sustainable.*wealth/i,
  /kofi.*asie/i,
];

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

    // Block access to paid book files
    if (BLOCKED_PATTERNS.some(pattern => pattern.test(fileName))) {
      return NextResponse.json(
        { error: 'This content requires purchase. Visit the book page to buy.' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on static book files
  matcher: ['/books/:path*'],
};
