"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  ArrowRight, 
  Home, 
  CreditCard,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { api } from "@/utils/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BillingSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const analytics = useAnalyticsContext();
  const { t } = useLanguage();

  useEffect(() => {
    // attempt counts webhook-polling retries (previously used an undefined retryCount variable)
    const verifyPayment = async (attempt = 0) => {
      if (!sessionId) {
        setError(t('bsucc.noSession'));
        setLoading(false);
        return;
      }
  
      try {
        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // First, check if the subscription was created in our database
        const subscriptionResponse = await api.getSubscription();

        if (subscriptionResponse.success) {
          // Check if subscription was upgraded
          const currentTier = subscriptionResponse.data?.currentTier;
          
          if (currentTier && currentTier !== 'LITE') {
            // Success! User has been upgraded
            setSuccess(true);
            
            // Record analytics
            analytics.recordEvent('payment_successful', { 
              sessionId,
              tier: currentTier
            });
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              router.push('/usersDashboard');
            }, 10000);
          } else {
            // Subscription not updated yet - check if we should retry
            if (attempt < 5) { // Try up to 5 times
              setTimeout(() => {
                verifyPayment(attempt + 1);
              }, 3000); // Wait 3 seconds before retry
            } else {
              setError(t('bsucc.slow'));
            }
          }
        } else {
          setError(t('bsucc.verifyStatusError'));
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        setError(error.message || t('bsucc.verifyError'));
      } finally {
        setLoading(false);
      }
    };
  
    verifyPayment();
  }, [sessionId, router, analytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('bsucc.verifying')}</p>
          <p className="text-sm text-gray-500 mt-2">{t('bsucc.session')}: {sessionId?.substring(0, 20)}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {success ? (
          <>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              {t('billing.successTitle')}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t('bsucc.thankYou')}
            </p>
            
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 
                          dark:border-green-400/20 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {t('bsucc.next')}
                </h3>
              </div>
              <ul className="space-y-3 text-left max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{t('bsucc.next1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{t('bsucc.next2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{t('bsucc.next3')}</span>
                </li>
              </ul>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                {t('bsucc.redirecting')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/usersDashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 
                         bg-gradient-to-r from-brand-500 to-accent-500 text-white 
                         rounded-xl hover:shadow-lg transition-all font-medium"
              >
                <Home className="w-4 h-4" />
                {t('bsucc.goToDashboard')}
              </Link>
              <Link
                href="/usersDashboard/billing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 
                         border-2 border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                         dark:hover:bg-gray-800 transition-colors font-medium"
              >
                <CreditCard className="w-4 h-4" />
                {t('bsucc.viewBilling')}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              {error ? t('bsucc.issue') : t('bsucc.processing')}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {error || t('bsucc.processingDesc')}
            </p>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                           rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>{t('bsucc.sessionId')}:</strong> {sessionId}<br/>
                  <strong>{t('common.error')}:</strong> {error}
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 
                         bg-gradient-to-r from-brand-500 to-accent-500 text-white 
                         rounded-xl hover:shadow-lg transition-all font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                {t('bsucc.checkAgain')}
              </button>
              <Link
                href="/usersDashboard/billing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 
                         border-2 border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                         dark:hover:bg-gray-800 transition-colors font-medium"
              >
                <ArrowRight className="w-4 h-4" />
                {t('bsucc.backToBilling')}
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}