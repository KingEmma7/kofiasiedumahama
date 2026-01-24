'use client';

import Script from 'next/script';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      {/* Vercel Web Analytics */}
      <VercelAnalytics />
      
      {/* Google Analytics */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}

// Track custom events (client-side)
export function trackEvent(action: string, category: string, label?: string, value?: number, metadata?: Record<string, any>) {
  // Track in Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Also send to server-side analytics API for reliable tracking
  if (typeof window !== 'undefined') {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        category,
        label,
        value,
        metadata,
      }),
    }).catch((err) => {
      // Silently fail - analytics shouldn't break the app
      console.debug('Analytics tracking failed:', err);
    });
  }
}

