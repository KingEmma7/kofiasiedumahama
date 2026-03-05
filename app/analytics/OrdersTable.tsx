'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloudArrowDownIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

interface Order {
  id: number;
  reference: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  amount: number;
  currency: string;
  book_type: string;
  quantity: number | null;
  delivery_address: Record<string, string> | null;
  download_url: string | null;
  status: string | null;
  fulfilled_at: string | null;
  is_test: boolean | null;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Totals {
  totalRevenue: number;
  totalOrders: number;
  totalQuantity: number;
}

const STATUS_OPTIONS = ['pending', 'fulfilled', 'cancelled'] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
  fulfilled: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
  cancelled: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrdersTable({ authKey }: Readonly<{ authKey: string | null }>) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [totals, setTotals] = useState<Totals>({ totalRevenue: 0, totalOrders: 0, totalQuantity: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [testFilter, setTestFilter] = useState<string>('hide');
  const [testSectionExpanded, setTestSectionExpanded] = useState(false);
  const [testOrders, setTestOrders] = useState<Order[]>([]);
  const [testOrdersLoading, setTestOrdersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [updatingRef, setUpdatingRef] = useState<string | null>(null);
  const [patchError, setPatchError] = useState<string | null>(null);
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const buildUrl = useCallback(
    (page: number, showTest: 'real' | 'only') => {
      const params = new URLSearchParams();
      if (authKey) params.set('key', authKey);
      params.set('page', String(page));
      params.set('limit', '50');
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('show_test', showTest);
      if (searchDebounced) params.set('search', searchDebounced);
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      return `/api/orders?${params.toString()}`;
    },
    [authKey, statusFilter, searchDebounced, dateFrom, dateTo]
  );

  const showMainAsTest = testFilter === 'only';

  const fetchOrders = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(buildUrl(page, showMainAsTest ? 'only' : 'real'));
        const json = await res.json();
        if (json.success) {
          setOrders(json.orders);
          setPagination(json.pagination);
          if (json.totals) setTotals(json.totals);
        } else {
          setOrders([]);
          setTotals({ totalRevenue: 0, totalOrders: 0, totalQuantity: 0 });
          setError(json.error || 'Failed to load orders');
        }
      } catch (err) {
        setOrders([]);
        setTotals({ totalRevenue: 0, totalOrders: 0, totalQuantity: 0 });
        setError('Network error while loading orders');
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    },
    [buildUrl, showMainAsTest]
  );

  const fetchTestOrders = useCallback(async () => {
    setTestOrdersLoading(true);
    try {
      const res = await fetch(buildUrl(1, 'only'));
      const json = await res.json();
      if (json.success) setTestOrders(json.orders);
    } catch {
      setTestOrders([]);
    } finally {
      setTestOrdersLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  useEffect(() => {
    if (testSectionExpanded && testFilter === 'hide') fetchTestOrders();
  }, [testSectionExpanded, testFilter, fetchTestOrders]);

  const patchOrder = async (reference: string, payload: Record<string, unknown>, fromTestSection = false) => {
    setUpdatingRef(reference);
    setPatchError(null);
    try {
      const params = new URLSearchParams();
      if (authKey) params.set('key', authKey);
      const res = await fetch(`/api/orders?${params.toString()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, ...payload }),
      });
      const json = await res.json();
      if (json.success) {
        const updated = json.order;
        const toggledTest = payload.is_test !== undefined;
        if (toggledTest) {
          if (payload.is_test) {
            setOrders(prev => prev.filter(o => o.reference !== reference));
            setTestOrders(prev => [...prev.filter(o => o.reference !== reference), updated]);
          } else {
            setTestOrders(prev => prev.filter(o => o.reference !== reference));
            fetchOrders(1);
          }
          if (testSectionExpanded) fetchTestOrders();
        } else {
          if (fromTestSection) {
            setTestOrders(prev => prev.map(o => (o.reference === reference ? { ...o, ...updated } : o)));
          } else {
            setOrders(prev => prev.map(o => (o.reference === reference ? { ...o, ...updated } : o)));
          }
        }
      } else {
        setPatchError(json.error || 'Update failed');
      }
    } catch (err) {
      setPatchError('Network error');
      console.error('Failed to update order:', err);
    } finally {
      setUpdatingRef(null);
    }
  };

  const handleBackfill = async () => {
    setBackfillLoading(true);
    setBackfillResult(null);
    try {
      const params = new URLSearchParams();
      if (authKey) params.set('key', authKey);
      const res = await fetch(`/api/orders/backfill?${params.toString()}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        setBackfillResult(
          `Imported ${json.imported} new orders (${json.skipped} skipped, ${json.totalFetched} fetched from Paystack)`
        );
        fetchOrders(1);
        if (testSectionExpanded) fetchTestOrders();
      } else {
        setBackfillResult(`Error: ${json.error}`);
      }
    } catch (err) {
      setBackfillResult('Backfill request failed');
      console.error('Backfill error:', err);
    } finally {
      setBackfillLoading(false);
    }
  };

  const exportCsv = () => {
    const headers = ['Date', 'Reference', 'Name', 'Email', 'Phone', 'Type', 'Qty', 'Amount', 'Currency', 'Status', 'Test'];
    const rows = orders.map(o => [
      o.created_at,
      o.reference,
      o.customer_name || '',
      o.customer_email,
      o.customer_phone || '',
      o.book_type,
      String(o.quantity ?? 1),
      String(o.amount),
      o.currency,
      o.status || 'pending',
      o.is_test ? 'YES' : '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const colCount = 8;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-0 sm:min-w-[180px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, or reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation min-h-[44px] sm:min-h-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2.5 sm:py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation min-h-[44px] sm:min-h-0"
            title="From date"
          />
          <span className="text-gray-400 text-sm hidden sm:inline">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2.5 sm:py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation min-h-[44px] sm:min-h-0"
            title="To date"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 sm:py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation min-h-[44px] sm:min-h-0"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={testFilter}
            onChange={e => setTestFilter(e.target.value)}
            className="px-3 py-2.5 sm:py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation min-h-[44px] sm:min-h-0"
          >
            <option value="hide">Real orders</option>
            <option value="only">Test only</option>
          </select>

          <button
            onClick={() => fetchOrders(pagination.page)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-400 transition-colors disabled:opacity-50 touch-manipulation min-h-[44px] sm:min-h-0"
          >
            <ArrowPathIcon className={`w-4 h-4 shrink-0 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={exportCsv}
            disabled={orders.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-400 transition-colors disabled:opacity-50 touch-manipulation min-h-[44px] sm:min-h-0"
          >
            <ArrowDownTrayIcon className="w-4 h-4 shrink-0" />
            CSV
          </button>

          <button
            onClick={handleBackfill}
            disabled={backfillLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 touch-manipulation min-h-[44px] sm:min-h-0"
          >
            <CloudArrowDownIcon className={`w-4 h-4 shrink-0 ${backfillLoading ? 'animate-spin' : ''}`} />
            {backfillLoading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>

      {backfillResult && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
          {backfillResult}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-300">
          {error}
        </div>
      )}
      {patchError && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
          {patchError}
          {patchError.includes('is_test') || patchError.includes('column') ? (
            <span className="block mt-1 text-xs">
              Run ADD_ORDER_EXTRAS.sql in Supabase to enable test flagging.
            </span>
          ) : null}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs sm:text-sm text-left min-w-[640px]">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Test</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && orders.length === 0 && (
              <tr>
                <td colSpan={colCount} className="px-4 py-12 text-center text-gray-400">
                  <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading orders...
                </td>
              </tr>
            )}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={colCount} className="px-4 py-12 text-center text-gray-400">
                  No orders found
                </td>
              </tr>
            )}
            {orders.length > 0 &&
              orders.map(order => {
                const currentStatus = order.status || 'pending';
                const isTest = !!order.is_test;
                const qty = order.quantity ?? 1;

                return (
                  <tr
                    key={order.reference}
                    className={`transition-colors ${
                      isTest
                        ? 'bg-gray-200/70 dark:bg-gray-700/50 opacity-90'
                        : 'bg-white dark:bg-gray-900'
                    } hover:bg-gray-50 dark:hover:bg-gray-800/50`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        {order.reference}
                      </span>
                      {isTest && (
                        <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-500 text-white">
                          TEST
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 dark:text-white font-medium">
                        {order.customer_name || '—'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.customer_email}
                      </div>
                      {order.customer_phone && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {order.customer_phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize">
                      {order.book_type}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                      {qty}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {order.currency === 'GHS' ? '₵' : order.currency}{' '}
                      {Number(order.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={currentStatus}
                        onChange={e => patchOrder(order.reference, { status: e.target.value })}
                        disabled={updatingRef === order.reference}
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border cursor-pointer appearance-none text-center focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 ${
                          STATUS_COLORS[currentStatus] || STATUS_COLORS.pending
                        }`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => patchOrder(order.reference, { is_test: !isTest })}
                        disabled={updatingRef === order.reference}
                        title={isTest ? 'Remove test flag' : 'Flag as test'}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                          isTest
                            ? 'text-gray-700 dark:text-gray-200 bg-gray-400/30 dark:bg-gray-500/30'
                            : 'text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                        }`}
                      >
                        <BeakerIcon className="w-4 h-4" />
                        {isTest && <span>TEST</span>}
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>

          {/* Totals footer (only for real orders) */}
          {orders.length > 0 && !showMainAsTest && (
            <tfoot className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-600">
              <tr className="font-semibold text-gray-900 dark:text-white">
                <td colSpan={4} className="px-4 py-3 text-right text-sm">
                  Totals (excl. test):
                </td>
                <td className="px-4 py-3 text-center text-sm">
                  {totals.totalQuantity}
                </td>
                <td className="px-4 py-3 text-right text-sm whitespace-nowrap">
                  ₵ {totals.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  {totals.totalOrders} orders
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <span className="order-2 sm:order-1">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
          </span>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => fetchOrders(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-400 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchOrders(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-400 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Test orders section (only when viewing real orders) */}
      {testFilter === 'hide' && (
        <div className="mt-8 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setTestSectionExpanded(!testSectionExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <BeakerIcon className="w-4 h-4 text-gray-500" />
              Test orders
              {testSectionExpanded && testOrders.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({testOrders.length})
                </span>
              )}
            </span>
            {testSectionExpanded ? (
              <ChevronUpIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {testSectionExpanded && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              {testOrdersLoading ? (
                <div className="px-4 py-12 text-center text-gray-400">
                  <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading test orders...
                </div>
              ) : testOrders.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  No test orders
                </div>
              ) : (
                <OrdersTableInner
                  orders={testOrders}
                  formatDate={formatDate}
                  STATUS_OPTIONS={STATUS_OPTIONS}
                  STATUS_COLORS={STATUS_COLORS}
                  patchOrder={(ref, payload) => patchOrder(ref, payload, true)}
                  updatingRef={updatingRef}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrdersTableInner({
  orders,
  formatDate,
  STATUS_OPTIONS,
  STATUS_COLORS,
  patchOrder,
  updatingRef,
}: {
  orders: Order[];
  formatDate: (s: string) => string;
  STATUS_OPTIONS: readonly string[];
  STATUS_COLORS: Record<string, string>;
  patchOrder: (ref: string, payload: Record<string, unknown>) => void;
  updatingRef: string | null;
}) {
  return (
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase text-xs">
        <tr>
          <th className="px-4 py-3">Date</th>
          <th className="px-4 py-3">Reference</th>
          <th className="px-4 py-3">Customer</th>
          <th className="px-4 py-3">Type</th>
          <th className="px-4 py-3 text-center">Qty</th>
          <th className="px-4 py-3 text-right">Amount</th>
          <th className="px-4 py-3 text-center">Status</th>
          <th className="px-4 py-3 text-center">Test</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {orders.map(order => {
          const currentStatus = order.status || 'pending';
          const isTest = !!order.is_test;
          const qty = order.quantity ?? 1;
          return (
            <tr
              key={order.reference}
              className="bg-gray-200/70 dark:bg-gray-700/50 opacity-90 hover:opacity-100 transition-opacity"
            >
              <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                {formatDate(order.created_at)}
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  {order.reference}
                </span>
                <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-500 text-white">
                  TEST
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="text-gray-900 dark:text-white font-medium">
                  {order.customer_name || '—'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {order.customer_email}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize">
                {order.book_type}
              </td>
              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {qty}
              </td>
              <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white whitespace-nowrap">
                {order.currency === 'GHS' ? '₵' : order.currency}{' '}
                {Number(order.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-center">
                <select
                  value={currentStatus}
                  onChange={e => patchOrder(order.reference, { status: e.target.value })}
                  disabled={updatingRef === order.reference}
                  className={`text-xs font-medium rounded-full px-2.5 py-1 border cursor-pointer ${
                    STATUS_COLORS[currentStatus] || STATUS_COLORS.pending
                  }`}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => patchOrder(order.reference, { is_test: false })}
                  disabled={updatingRef === order.reference}
                  title="Remove test flag"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-400/30 dark:bg-gray-500/30 hover:bg-orange-100 dark:hover:bg-orange-900/20 disabled:opacity-50"
                >
                  <BeakerIcon className="w-4 h-4" />
                  <span>TEST</span>
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
