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

export default function BillingSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const analytics = useAnalyticsContext();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        console.log('No session ID found in URL');
        setError('No payment session found');
        setLoading(false);
        return;
      }
  
      try {
        console.log('Verifying payment with session ID:', sessionId);
        
        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // First, check if the subscription was created in our database
        const subscriptionResponse = await api.getSubscription();
        console.log('Current subscription:', subscriptionResponse.data);
        
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
            if (retryCount < 5) { // Try up to 5 times
              setRetryCount(prev => prev + 1);
              setTimeout(() => {
                verifyPayment();
              }, 3000); // Wait 3 seconds before retry
            } else {
              setError('Payment processed but subscription update is taking longer than expected. Please check your account in a few minutes or contact support.');
            }
          }
        } else {
          setError('Failed to verify subscription status');
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        setError(error.message || 'Payment verification failed');
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
          <p className="text-gray-600 dark:text-gray-400">Verifying your payment...</p>
          <p className="text-sm text-gray-500 mt-2">Session: {sessionId?.substring(0, 20)}...</p>
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
              Payment Successful!
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Thank you for your purchase. Your subscription has been activated and 
              you now have access to all premium features. A receipt has been sent to your email.
            </p>
            
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 
                          dark:border-green-400/20 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  What happens next?
                </h3>
              </div>
              <ul className="space-y-3 text-left max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Immediate access to premium features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Receipt sent to your email</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">New limits applied immediately</span>
                </li>
              </ul>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Redirecting to dashboard in 10 seconds...
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
                Go to Dashboard Now
              </Link>
              <Link
                href="/usersDashboard/billing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 
                         border-2 border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                         dark:hover:bg-gray-800 transition-colors font-medium"
              >
                <CreditCard className="w-4 h-4" />
                View Billing Details
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              {error ? 'Payment Issue' : 'Payment Processing'}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {error || 'Your payment is being processed. This may take a few moments.'}
            </p>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                           rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>Session ID:</strong> {sessionId}<br/>
                  <strong>Error:</strong> {error}
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
                Check Again
              </button>
              <Link
                href="/usersDashboard/billing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 
                         border-2 border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                         dark:hover:bg-gray-800 transition-colors font-medium"
              >
                <ArrowRight className="w-4 h-4" />
                Back to Billing
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}