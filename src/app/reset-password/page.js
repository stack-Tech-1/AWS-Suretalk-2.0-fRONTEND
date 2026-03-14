"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "../../utils/api";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setTokenExpired(true);
      } else {
        setError(msg || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600
    bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2
    focus:ring-brand-500 focus:border-transparent transition-all`;

  const ctaButtonClass = `inline-flex items-center justify-center gap-2 px-6 py-3
    bg-gradient-to-r from-brand-600 to-accent-500 text-white font-medium rounded-xl
    hover:shadow-lg transform transition-all duration-300 hover:-translate-y-0.5`;

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo/Brand Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="https://i.postimg.cc/9MbyJVL4/cropped-fulllogo-edited.webp"
              alt="SureTalk Logo"
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              SureTalk
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Set a new password
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          {/* No token */}
          {!token && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Invalid Link</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This reset link is invalid. Please request a new one.
              </p>
              <Link href="/forgot-password" className={ctaButtonClass}>
                Request New Link
              </Link>
            </div>
          )}

          {/* Token expired */}
          {token && tokenExpired && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Link Expired</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This reset link has expired. Please request a new one.
              </p>
              <Link href="/forgot-password" className={ctaButtonClass}>
                Request New Link
              </Link>
            </div>
          )}

          {/* Success */}
          {token && !tokenExpired && success && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Password Reset!</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your password has been reset successfully.
              </p>
              <Link href="/login" className={ctaButtonClass}>
                Sign In
              </Link>
            </div>
          )}

          {/* Form */}
          {token && !tokenExpired && !success && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
                Reset Password
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
                Choose a new password for your account.
              </p>

              {/* Error banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass}
                      placeholder="At least 8 characters"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                      {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                      placeholder="Re-enter your new password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-accent-500
                           text-white font-medium rounded-xl hover:shadow-lg
                           transform transition-all duration-300 hover:-translate-y-0.5
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>

              {/* Back to login */}
              <div className="text-center mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2024 SureTalk. All rights reserved.</p>
          <p className="mt-1">
            <Link href="/privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link>
            {" · "}
            <Link href="/terms" className="hover:text-brand-600 transition-colors">Terms of Service</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}
