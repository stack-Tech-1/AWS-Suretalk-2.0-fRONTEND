"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X, AlertCircle, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "../../utils/api";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying"); // verifying, success, error, expired
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      setLoading(false);
      return;
    }

    verifyEmailToken();
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      // Call backend verification endpoint
      const response = await api.request(`/auth/verify-email?token=${token}`);
      
      if (response.success) {
        setStatus("success");
        setMessage("Email verified successfully! You can now log in to your account.");
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(response.error || "Verification failed.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      
      if (error.message.includes("expired")) {
        setStatus("expired");
        setMessage("Verification link has expired. Please request a new one.");
      } else {
        setStatus("error");
        setMessage(error.message || "Invalid verification link.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      alert("Please enter your email address to resend verification.");
      return;
    }

    try {
      setLoading(true);
      await api.resendVerification({ email });
      alert("Verification email resent successfully! Please check your inbox.");
    } catch (error) {
      alert("Failed to resend verification: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Verifying your email...</h2>
          <p className="text-gray-500 mt-2">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl text-center">
          
          {/* Status Icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            status === "success" ? "bg-green-100" :
            status === "expired" ? "bg-yellow-100" :
            "bg-red-100"
          }`}>
            {status === "success" ? (
              <Check className="w-10 h-10 text-green-600" />
            ) : status === "expired" ? (
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            ) : (
              <X className="w-10 h-10 text-red-600" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {status === "success" ? "Email Verified!" :
             status === "expired" ? "Link Expired" :
             "Verification Failed"}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Additional Info */}
          {status === "expired" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-yellow-700">
                Verification links expire after 24 hours for security reasons.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {status === "success" ? (
              <>
                <Link
                  href="/login"
                  className="block w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-accent-500 
                           text-white font-medium rounded-xl hover:shadow-lg transition-all"
                >
                  Go to Login
                </Link>
                <p className="text-sm text-gray-500">
                  Redirecting in 3 seconds...
                </p>
              </>
            ) : (
              <>
                {status === "expired" && email && (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-brand-600 text-white font-medium rounded-xl 
                             hover:bg-brand-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Resend Verification Email"}
                  </button>
                )}
                
                <Link
                  href="/login"
                  className="block w-full py-3 px-4 border border-gray-300 text-gray-700 
                           font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Go to Login
                </Link>
                
                <Link
                  href="/signup"
                  className="block w-full py-3 px-4 text-brand-600 font-medium 
                           hover:text-brand-700 transition-colors"
                >
                  Create New Account
                </Link>
              </>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <a 
                href="mailto:contact@suretalknow.com" 
                className="text-brand-600 hover:text-brand-700 font-medium"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>

        {/* Development Info (only in development) */}
        {process.env.NODE_ENV === "development" && token && (
          <div className="mt-4 p-4 bg-gray-800 text-gray-200 rounded-lg text-xs">
            <p className="font-mono break-all">
              Token: {token.substring(0, 30)}...
            </p>
            <p className="mt-2">
              Backend: {process.env.NEXT_PUBLIC_API_URL}/auth/verify-email
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}