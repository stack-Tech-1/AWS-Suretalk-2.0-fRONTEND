'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Receipt, Download, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '@/utils/api';
import { toast } from '@/components/ui/Toast';

const StatusBadge = ({ status }) => {
  const styles = {
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    void: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    uncollectible: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    succeeded: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  };

  const icons = {
    paid: <CheckCircle className="w-3 h-3" />,
    succeeded: <CheckCircle className="w-3 h-3" />,
    failed: <XCircle className="w-3 h-3" />,
    uncollectible: <XCircle className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
    open: <Clock className="w-3 h-3" />
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {icons[status]}
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default function BillingHistoryPage() {
  const [invoices, setInvoices] = useState([]);
  const [localHistory, setLocalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const response = await api.request('/billing/history');
        if (response.success) {
          setInvoices(response.data.stripeInvoices || []);
          setLocalHistory(response.data.localHistory || []);
        }
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load billing history', 'Error');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency
    }).format(amount);
  };

  return (
    <div className="page-enter max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/usersDashboard/billing" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your past invoices and payments</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 h-16 skeleton" />
          ))}
        </div>
      ) : error ? (
        <div className="card p-8 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-500">Failed to load billing history</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-sm text-brand-600 hover:underline">
            Try again
          </button>
        </div>
      ) : invoices.length === 0 && localHistory.length === 0 ? (
        <div className="card p-12 text-center">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700 dark:text-gray-300">No billing history yet</p>
          <p className="text-sm text-gray-400 mt-1">Your invoices will appear here after your first payment</p>
          <Link href="/usersDashboard/billing" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
            View plans →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Stripe invoices */}
          {invoices.map(invoice => (
            <div key={invoice.id} className="card p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {invoice.description}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(invoice.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={invoice.status} />
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatAmount(invoice.amount, invoice.currency)}
                  </p>
                  <div className="flex items-center gap-1">
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </a>
                    )}
                    {invoice.hostedUrl && (
                      <a
                        href={invoice.hostedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="View invoice"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Local history fallback */}
          {invoices.length === 0 && localHistory.map(record => (
            <div key={record.stripe_invoice_id} className="card p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{record.description || 'Payment'}</p>
                    <p className="text-xs text-gray-400">{formatDate(record.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={record.status} />
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatAmount(record.amount_cents / 100, record.currency)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
