'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from './Analytics';

/**
 * Tracks page views automatically
 * Sends page view events to analytics on route changes
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track page views on the analytics page itself
    if (pathname === '/analytics') {
      return;
    }
    
    // Track page view
    trackEvent('page_view', 'navigation', pathname);
  }, [pathname]);

  return null;
}
