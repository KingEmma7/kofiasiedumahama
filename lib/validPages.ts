/**
 * Paths that are real pages on the site. Used to:
 * - Only store/count page_view events for these paths (typos, /analytics, 404s are ignored)
 * - Optionally skip sending tracking for invalid paths from the client
 */
export const VALID_PAGE_VIEW_PATHS = new Set([
  '/',
  '/about',
  '/book',
  '/research',
  '/cookies',
  '/privacy',
  '/terms',
]);

export function isValidPageViewPath(path: string | null | undefined): boolean {
  const p = ((path ?? '') || '/').replace(/\/+$/, '') || '/';
  return VALID_PAGE_VIEW_PATHS.has(p);
}
