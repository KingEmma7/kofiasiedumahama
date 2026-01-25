'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from './Analytics';
import { isValidPageViewPath } from '@/lib/validPages';

/**
 * Tracks page views automatically for real site pages only.
 * Skips /analytics, typos (/analyt), 404s, and other invalid paths.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isValidPageViewPath(pathname ?? null)) return;
    trackEvent('page_view', 'navigation', pathname ?? '/');
  }, [pathname]);

  return null;
}
