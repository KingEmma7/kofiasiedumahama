import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AnalyticsDashboard } from './AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'View site analytics, downloads, and user engagement metrics.',
  robots: { index: false, follow: false },
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const secret = process.env.ANALYTICS_SECRET;
  if (secret && key !== secret) redirect('/');
  return <AnalyticsDashboard />;
}
