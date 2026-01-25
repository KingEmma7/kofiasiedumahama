'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  subtitle?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
        <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
      </div>
      {trend && (
        <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-gray-500'}`}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    {subtitle && (
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
    )}
  </motion.div>
);

interface AnalyticsData {
  pageViews: {
    total: number;
    byPage: Record<string, number>;
  };
  downloads: {
    total: number;
    byProduct: Record<string, number>; // e.g., { "The Psychology of Sustainable Wealth": 5, "AI, Job Security...": 3 }
    byProductSummary: {
      book: number;
      research: number;
    };
  };
  purchases: {
    total: number;
    revenue: number;
    byType: {
      ebook: number;
      hardcopy: number;
    };
  };
  events: {
    newsletter_signups: number;
    payment_initiated: number;
    payment_success: number;
    payment_cancelled: number;
  };
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'total'>('day');
  const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()));

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const key = new URLSearchParams(globalThis.location?.search ?? '').get('key');
      const params = new URLSearchParams();
      if (key) params.set('key', key);
      params.set('date', viewMode === 'total' ? 'total' : selectedDate);
      const url = '/api/analytics' + (params.toString() ? `?${params.toString()}` : '');
      const response = await fetch(url);
      const result = await response.json();
      if (response.status === 401) {
        setError('Unauthorized. Use /analytics?key=YOUR_SECRET');
        setData(null);
        setLoading(false);
        return;
      }
      
      if (result.success) {
        setData(result.data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      setError('Error fetching analytics. Make sure analytics API is configured.');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [viewMode, selectedDate]);

  const todayString = formatDate(new Date());
  let viewingLabel = 'All time';
  if (viewMode !== 'total') {
    viewingLabel = selectedDate === todayString ? 'Today' : selectedDate;
  }

  const shiftDate = (days: number) => {
    const base = new Date(`${selectedDate}T00:00:00`);
    base.setDate(base.getDate() + days);
    setSelectedDate(formatDate(base));
    setViewMode('day');
  };

  const handleDateChange = (nextDate: string) => {
    if (!nextDate) return;
    setSelectedDate(nextDate);
    setViewMode('day');
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-50"
                title="Refresh analytics"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/" className="hidden sm:block">
                <Image
                  src="/images/kofi-logo-transparent.png"
                  alt="Kofi Asiedu-Mahama"
                  width={120}
                  height={60}
                  className="h-10 w-auto dark:invert"
                />
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-primary-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track site performance, downloads, purchases, and user engagement
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Viewing:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{viewingLabel}</span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => {
                  setSelectedDate(todayString);
                  setViewMode('day');
                }}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  viewMode === 'day' && selectedDate === todayString
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-primary-400'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setViewMode('total')}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  viewMode === 'total'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-primary-400'
                }`}
              >
                Total
              </button>
              <button
                onClick={() => shiftDate(-1)}
                disabled={viewMode === 'total'}
                className="px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => handleDateChange(event.target.value)}
                disabled={viewMode === 'total'}
                className="px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => shiftDate(1)}
                disabled={viewMode === 'total'}
                className="px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && !data && (
          <div className="text-center py-12">
            <ArrowPathIcon className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              Note: Analytics data requires a database connection. Currently showing placeholder structure.
            </p>
          </div>
        )}

        {/* Analytics Data */}
        {data && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Page Views"
                value={data.pageViews.total}
                icon={EyeIcon}
                subtitle="Total site visits"
              />
              <StatCard
                title="Total Downloads"
                value={data.downloads.total}
                icon={ArrowDownTrayIcon}
                subtitle={`${data.downloads.byProductSummary.book} books, ${data.downloads.byProductSummary.research} papers`}
              />
              <StatCard
                title="Total Purchases"
                value={data.purchases.total}
                icon={ShoppingCartIcon}
                subtitle={`₵${data.purchases.revenue.toLocaleString()} GHS`}
              />
              <StatCard
                title="Newsletter Signups"
                value={data.events.newsletter_signups}
                icon={DocumentTextIcon}
              />
            </div>

            {/* Page Views Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 mb-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <EyeIcon className="w-6 h-6 text-primary-600" />
                Page Views by Page
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.pageViews.byPage).length > 0 ? (
                  Object.entries(data.pageViews.byPage)
                    .sort(([, a], [, b]) => b - a) // Sort by count descending
                    .map(([page, views]) => (
                      <div key={page} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {page === '/' ? 'Home' : page.replace('/', '')}
                          </p>

                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {views}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {views === 1 ? 'view' : 'views'}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8 col-span-2">
                    No page views tracked yet
                  </p>
                )}
              </div>
            </motion.div>

            {/* Downloads Breakdown by Product */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 mb-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ArrowDownTrayIcon className="w-6 h-6 text-primary-600" />
                Downloads by Product
              </h2>
              <div className="space-y-4">
                {Object.entries(data.downloads.byProduct).length > 0 ? (
                  Object.entries(data.downloads.byProduct)
                    .sort(([, a], [, b]) => b - a) // Sort by count descending
                    .map(([product, count]) => (
                      <div key={product} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {product}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {product.includes('Psychology') ? 'Book' : 'Research Paper'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {count}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {count === 1 ? 'download' : 'downloads'}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No downloads yet
                  </p>
                )}
              </div>
            </motion.div>

            {/* Purchases Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 mb-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
                Purchase Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₵{data.purchases.revenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">eBooks Sold</p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {data.purchases.byType.ebook}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hardcopies Sold</p>
                  <p className="text-2xl font-bold text-gold-600 dark:text-gold-400">
                    {data.purchases.byType.hardcopy}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Event Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Event Tracking
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.events.payment_initiated}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Payments Initiated
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {data.events.payment_success}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Successful Payments
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {data.events.payment_cancelled}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Cancelled Payments
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {data.events.newsletter_signups}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Newsletter Signups
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Info Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
            >
              <p className="text-sm text-blue-800 dark:text-blue-400 text-center">
                For detailed analytics and performance metrics, visit{' '}
                <a 
                  href="https://vercel.com/analytics" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  Vercel Analytics
                </a>
              </p>
            </motion.div>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
