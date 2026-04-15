'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Plus, Star, ExternalLink, Shield } from 'lucide-react';
import { api } from '@/utils/api';
import { toast } from '@/components/ui/Toast';

const CardBrandIcon = ({ brand }) => {
  const colors = {
    visa: 'text-blue-600',
    mastercard: 'text-red-500',
    amex: 'text-blue-400',
    discover: 'text-orange-500'
  };

  return (
    <div className={`font-bold text-sm uppercase ${colors[brand] || 'text-gray-600'}`}>
      {brand}
    </div>
  );
};

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [hasStripeCustomer, setHasStripeCustomer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setLoading(true);
        const response = await api.request('/billing/payment-methods');
        if (response.success) {
          setPaymentMethods(response.data.paymentMethods || []);
          setHasStripeCustomer(response.data.hasStripeCustomer);
        }
      } catch (err) {
        toast.error('Failed to load payment methods', 'Error');
      } finally {
        setLoading(false);
      }
    };
    loadPaymentMethods();
  }, []);

  const handleManageInPortal = async () => {
    try {
      setOpeningPortal(true);
      const response = await api.request('/billing/create-portal-session', {
        method: 'POST',
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/usersDashboard/billing/payment-methods`
        })
      });
      if (response.success) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      if (err.message?.includes('No billing account')) {
        toast.warning(
          'Your subscription was set up by phone. Contact contact@suretalknow.com to manage payment methods.',
          'Phone Subscription'
        );
      } else {
        toast.error('Failed to open billing portal', 'Error');
      }
    } finally {
      setOpeningPortal(false);
    }
  };

  return (
    <div className="page-enter max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/usersDashboard/billing" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Methods</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your cards and payment options</p>
          </div>
        </div>
        {hasStripeCustomer && (
          <button
            onClick={handleManageInPortal}
            disabled={openingPortal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white text-sm font-semibold hover:shadow-brand transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {openingPortal ? 'Opening...' : 'Add Card'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="card p-4 h-20 skeleton" />
          ))}
        </div>
      ) : !hasStripeCustomer ? (
        <div className="card p-8 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700 dark:text-gray-300">No billing account linked</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            You subscribed via phone. To manage payment methods online, please contact support.
          </p>
          <a
            href="mailto:contact@suretalknow.com"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            Contact Support
          </a>
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="card p-8 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700 dark:text-gray-300">No payment methods on file</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Add a card to manage your subscription</p>
          <button
            onClick={handleManageInPortal}
            disabled={openingPortal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Payment Method
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {paymentMethods.map(pm => (
              <div key={pm.id} className="card p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <CardBrandIcon brand={pm.brand} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {pm.brand} •••• {pm.last4}
                        </p>
                        {pm.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                            <Star className="w-3 h-3 fill-current" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        Expires {pm.expMonth}/{pm.expYear}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleManageInPortal}
                    disabled={openingPortal}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Security note */}
          <div className="card p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Secure payments</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your payment information is encrypted and securely managed by Stripe.
                SureTalk never stores your full card details.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
