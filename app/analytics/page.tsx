import { Metadata } from 'next';
import { AnalyticsDashboard } from './AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'View site analytics, downloads, and user engagement metrics.',
  robots: {
    index: false, // Don't index admin pages
    follow: false,
  },
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
