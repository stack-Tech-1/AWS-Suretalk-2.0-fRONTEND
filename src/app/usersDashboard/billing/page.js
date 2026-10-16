//C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\src\app\usersDashboard\billing\page.js
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Shield, 
  Zap, 
  Check,
  Star,
  TrendingUp,
  Loader2,
  ArrowRight,
  Calendar,
  Cloud,
  Lock,
  Users,
  Headphones,
  MessageSquare,
  Clock,
  HelpCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Download,
  Globe,
  Smartphone,
  Bell,
  BarChart
} from "lucide-react";
import { api } from "@/utils/api";
import { toast } from '@/components/ui/Toast';
import { useRouter, useSearchParams } from "next/navigation";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { Suspense } from "react";
import { useLanguage } from '@/contexts/LanguageContext';

function BillingPageInner() {
  const { t } = useLanguage();
  const router = useRouter();
  const analytics = useAnalyticsContext();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get('success') === 'true';
  const checkoutCancelled = searchParams.get('cancelled') === 'true';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPlanState, setCurrentPlan] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const tiers = [
    {
      id: "LITE",
      name: "SureTalk LITE",
      price: "$0",
      period: t('bill.periodForever'),
      description: t('bill.liteDesc'),
      features: [
        t('bill.f.contacts3'),
        t('bill.f.notes3'),        
        t('bill.f.phoneAccess'),
        t('bill.f.webDashboard'),
        t('bill.f.basicIvr'),
      ],
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_LITE_PRICE_ID,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      badge: t('bill.badgeFree')
    },
    {
      id: "ESSENTIAL",
      name: "SureTalk Essential",
      price: "$6.99",
      period: t('bill.periodMonth'),
      description: t('bill.essentialDesc'),
      features: [
        t('bill.f.contacts9'),
        t('bill.f.unlimitedNotes'),
        t('bill.f.advancedIvr'),
        t('bill.f.webDashboard'),
        t('bill.f.exports'),
        t('bill.f.storage90'),
      ],
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ESSENTIAL_PRICE_ID,
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
      highlighted: true,
      badge: t('bill.mostPopular')
    },
    {
      id: "LEGACY_VAULT_PREMIUM",
      name: "Legacy Vault",
      price: "$12.99",
      period: t('bill.periodMonth'),
      description: t('bill.premiumDesc'),
      features: [
        t('bill.f.allEssential'),
        t('bill.f.permanentStorage'),
        t('bill.f.voiceWills'),
        t('bill.f.legacyMessages'),
        "Glacier Deep Archive",
        t('bill.f.kms'),
        t('bill.f.prioritySupport'),
      ],
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
      color: "amber",
      gradient: "from-amber-500 to-orange-500",
      badge: "Premium"
    },
  ];

  // Re-read the current plan from the (translated) tiers so its text follows the UI language
  const currentPlan = currentPlanState ? tiers.find(p => p.id === currentPlanState.id) || currentPlanState : null;

  // Translated label for a status value from the API; unknown values are shown capitalized
  const subscriptionStatusLabel = (value) => {
    if (!value) return '';
    const key = `billing.subStatus.${value}`;
    const label = t(key);
    return label === key ? value.charAt(0).toUpperCase() + value.slice(1) : label;
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const subscriptionResponse = await api.getSubscription();

      if (subscriptionResponse.success) {
        setSubscription(subscriptionResponse.data);
        
        const currentTier = subscriptionResponse.data?.currentTier || 'LITE';
        const currentPlanData = tiers.find(plan => plan.id === currentTier);
        setCurrentPlan(currentPlanData);
        
        if (subscriptionResponse.data?.billingHistory) {
          setBillingHistory(subscriptionResponse.data.billingHistory);
        }
      } else {
        throw new Error(subscriptionResponse.error || t('bill.fetchError'));
      }

    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      setError(t('bill.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    try {
      setProcessing(true);
      setSelectedPlan(plan);

      if (plan.price === 0 || plan.price === "$0") {
        await handlePlanChange(plan.id);
        return;
      }

      const successUrl = `${window.location.origin}/usersDashboard/billing?success=true`;
      const cancelUrl  = `${window.location.origin}/usersDashboard/billing?cancelled=true`;

      // Try Stripe Checkout first
      try {
        const checkoutResponse = await api.createCheckoutSession(
          plan.stripePriceId,
          successUrl,
          cancelUrl
        );
        if (checkoutResponse.success) {
          window.location.href = checkoutResponse.data.url;
          return;
        }
      } catch {
        // Fall through to portal
      }

      // Fallback: Stripe Customer Portal (works for all users including IVR-registered)
      const portalResponse = await api.request('/billing/create-portal-session', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: `${window.location.origin}/usersDashboard/billing` }),
      });
      if (portalResponse.success) {
        window.location.href = portalResponse.data.url;
      } else {
        throw new Error(portalResponse.error || t('bill.portalError'));
      }
    } catch (error) {
      console.error('❌ Upgrade error:', error);
      toast.error(t('bill.upgradeError', { error: error.message }));
    } finally {
      setProcessing(false);
    }
  };
  const handlePlanChange = async (newTier) => {
    try {
      setProcessing(true);

      const response = await api.request('/billing/change-tier', {
        method: 'POST',
        body: JSON.stringify({ tier: newTier }),
      });

      if (response.success) {
        // Direct change succeeded (IVR user with no Stripe subscription)
        const newPlan = tiers.find(p => p.id === newTier);
        setCurrentPlan(newPlan);
        toast.success(t('bill.switched', { plan: newPlan?.name || newTier }), t('bill.planUpdated'));
        await fetchBillingData();
        window.location.reload();
        return;
      }

      // Backend says: cancel via Stripe portal (user has an active Stripe subscription)
      if (response.code === 'USE_PORTAL') {
        toast.info(
          t('bill.downgradeViaPortal'),
          t('bill.cancelViaPortal')
        );
        const portalResponse = await api.request('/billing/create-portal-session', {
          method: 'POST',
          body: JSON.stringify({ returnUrl: `${window.location.origin}/usersDashboard/billing` }),
        });
        if (portalResponse.success) {
          window.location.href = portalResponse.data.url;
        } else {
          throw new Error(portalResponse.error || t('bill.portalError'));
        }
        return;
      }

      // Any other failure (e.g. USE_CHECKOUT block — shouldn't be reachable from this path)
      throw new Error(response.error || t('bill.changeError'));
    } catch (error) {
      console.error('Plan change error:', error);
      toast.error(t('bill.changeErrorWithReason', { error: error.message }));
    } finally {
      setProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setProcessing(true);
      
      const response = await api.request('/billing/create-portal-session', {
        method: 'POST',
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/usersDashboard/billing`
        }),
      });

      if (response.success) {
        window.location.href = response.data.url;
      } else {
        const err = new Error(response.error || t('bill.portalError'));
        err.code = response.code;
        throw err;
      }
    } catch (error) {
      console.error('Manage subscription error:', error);

      if (error.code === 'FREE_PLAN') {
        toast.info(
          t('bill.onFreePlan'),
          t('bill.freePlan')
        );
      } else if (error.code === 'NO_STRIPE_CUSTOMER' || error.message?.includes('No billing account')) {
        toast.warning(
          t('bill.phoneSubscriptionMsg'),
          t('bill.phoneSubscription')
        );
      } else {
        toast.error(error.message || t('bill.portalError'), t('bill.billingError'));
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t('bill.unableToLoad')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchBillingData}
            className="px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {t('billing.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('billing.subtitle')}
            </p>
          </div>
          
          {currentPlan && (
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-gradient-to-r from-brand-500/10 to-accent-500/10 
                           border border-brand-500/20 dark:border-brand-400/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand-500" />
                  <span className="font-medium text-gray-800 dark:text-white">
                    {t('bill.currentLabel', { plan: currentPlan.name })}
                  </span>
                </div>
              </div>
              <button
                onClick={handleManageSubscription}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 
                         transition-colors"
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    {t('billing.manageBilling')}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Checkout success/cancel banners */}
      {checkoutSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3"
        >
          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-700 dark:text-green-400 font-medium">
            {t('bill.checkoutSuccess')}
          </div>
        </motion.div>
      )}
      {checkoutCancelled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
            {t('bill.checkoutCancelled')}
          </div>
        </motion.div>
      )}

      {/* Current Plan Details */}
      {currentPlan && subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-brand-500/5 to-accent-500/5 border border-brand-500/10 
                        dark:border-brand-400/10 rounded-2xl p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${currentPlan.gradient}`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {currentPlan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{currentPlan.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('contacts.title')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {subscription.limits?.contacts || '0'}
                    </p>
                  </div>
                  
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Headphones className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bill.storage')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {subscription.limits?.storageGb || '0'} GB
                    </p>
                  </div>
                  
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bill.notesLimit')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {subscription.limits?.voiceNotes || '0'}
                    </p>
                  </div>
                  
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.status')}</span>
                    </div>
                    <p className="text-lg font-bold capitalize text-gray-800 dark:text-white">
                      {subscriptionStatusLabel(subscription.status || 'active')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="glass rounded-xl p-6 h-full">
                  <h4 className="font-bold text-gray-800 dark:text-white mb-4">{t('bill.billingDetails')}</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">{t('billing.currentPlan')}</span>
                      <span className="font-medium text-gray-800 dark:text-white">{currentPlan.name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">{t('bill.price')}</span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {currentPlan.price}
                        <span className="text-sm text-gray-500 ml-1">{currentPlan.period}</span>
                      </span>
                    </div>
                    
                    {subscription.stripeSubscription && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">{t('bill.nextBilling')}</span>
                          <span className="font-medium text-gray-800 dark:text-white">
                            {/* Format Stripe timestamp if available */}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">{t('bill.paymentMethod')}</span>
                          <span className="font-medium text-gray-800 dark:text-white">
                            {t('bill.creditCard')}
                          </span>
                        </div>
                      </>
                    )}
                    
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleManageSubscription}
                        className="w-full flex items-center justify-center gap-2 py-3 
                                 border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                                 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                        disabled={processing}
                      >
                        {processing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            {t('billing.manageSubscription')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Plan Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('billing.choosePlan')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('billing.choosePlanDesc')}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Check className="w-4 h-4 text-green-500" />
            <span>{t('bill.moneyBack')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((plan, index) => {
            const isCurrentPlan = currentPlan?.id === plan.id;
            const isHighlighted = plan.highlighted;
            const currentPlanIndex = currentPlan ? tiers.findIndex(tier => tier.id === currentPlan.id) : -1;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300
                          ${isCurrentPlan ? 'border-brand-500' : 'border-gray-200 dark:border-gray-700'}
                          ${isHighlighted ? 'scale-[1.02] shadow-2xl' : 'shadow-lg hover:shadow-xl'}`}
              >
                {isHighlighted && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 
                                text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                    {t('bill.mostPopular')}
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-brand-500 to-accent-500 
                                text-white px-4 py-1 rounded-br-lg text-sm font-medium">
                    {t('billing.currentPlan')}
                  </div>
                )}
                
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.gradient}`}>
                        {plan.id === 'LITE' && <Zap className="w-5 h-5 text-white" />}
                        {plan.id === 'ESSENTIAL' && <Star className="w-5 h-5 text-white" />}
                        {plan.id === 'LEGACY_VAULT_PREMIUM' && <Shield className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{plan.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-gray-800 dark:text-white">{plan.price}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">{plan.period}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={isCurrentPlan || processing}
                    className={`w-full py-3 rounded-xl font-medium transition-all
                              ${isCurrentPlan 
                                ? 'bg-gradient-to-r from-brand-500/20 to-accent-500/20 text-brand-600 dark:text-brand-400 cursor-default' 
                                : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:scale-[1.02]`
                              }`}
                  >
                    {processing && selectedPlan?.id === plan.id ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : isCurrentPlan ? (
                      t('billing.currentPlan')
                    ) : currentPlan && index < currentPlanIndex ? (
                      plan.price === "$0" ? t('billing.downgradeToFree') : `${t('billing.downgradeTo')} ${plan.name}`
                    ) : (
                      `${t('common.upgrade')} ${plan.name}`
                    )}
                  </button>
                  
                  {plan.price !== "$0" && (
                    <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-3">
                      {t('bill.cancelAnytime')} • {t('bill.moneyBack')}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingPageInner />
    </Suspense>
  );
}