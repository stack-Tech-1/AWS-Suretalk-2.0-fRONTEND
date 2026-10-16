"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, AlertCircle, Shield, ShieldCheck, KeyRound, ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoIcon from "@/components/common/LogoIcon";
import { api } from "../../../utils/api";

// Turns backend errors into plain messages for the admin
function friendlyError(error) {
  const message = error?.message || '';
  if (error instanceof TypeError || /Failed to fetch|NetworkError/i.test(message)) {
    return "Can't reach the server. Check your internet connection and try again.";
  }
  if (/locked/i.test(message)) {
    const until = error?.data?.lockedUntil ? new Date(error.data.lockedUntil) : null;
    const minutes = until ? Math.max(1, Math.ceil((until - Date.now()) / 60000)) : null;
    if (minutes && minutes >= 60) {
      const hours = Math.ceil(minutes / 60);
      return `Too many failed attempts. This account is locked — try again in about ${hours} hour${hours === 1 ? '' : 's'}.`;
    }
    return `Too many failed attempts. This account is locked — try again in ${minutes ? `${minutes} minute${minutes === 1 ? '' : 's'}` : 'a little while'}.`;
  }
  if (/Too many failed attempts from this IP/i.test(message) || error?.status === 429) {
    return 'Too many sign-in attempts from this network. Please wait 15 minutes and try again.';
  }
  if (/Invalid credentials/i.test(message)) return 'Incorrect email or password.';
  if (/Admin access required/i.test(message)) return "This account doesn't have admin access.";
  if (/not approved/i.test(message)) return 'Your admin request was not approved. Contact a super admin if you think this is a mistake.';
  if (/Access denied from this IP/i.test(message)) return "Admin sign-in isn't allowed from this network.";
  if (/Invalid code/i.test(message)) return "That code didn't work. Check your authenticator app and try again.";
  return message || 'Sign-in failed. Please try again.';
}

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: email + password, 2: 2FA code
  const [tempToken, setTempToken] = useState("");
  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Already signed in as an admin? Go straight to the dashboard
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.getProfile()
      .then(response => { if (response?.data?.is_admin) router.replace('/adminDashboard'); })
      .catch(() => {});
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const completeLogin = (response) => {
    localStorage.setItem('admin_session', JSON.stringify({
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      sessionToken: response.data.sessionToken,
      user: response.data.user,
      loginTime: new Date().toISOString()
    }));
    localStorage.setItem('token', response.data.token);
    router.replace('/adminDashboard');
  };

  const handleCredentials = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.request('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      if (response.requiresTwoFactor) {
        setTempToken(response.tempToken);
        setCode("");
        setUseBackupCode(false);
        setStep(2);
        setLoading(false);
        return;
      }
      completeLogin(response);
    } catch (err) {
      if (/pending approval/i.test(err.message || '')) {
        localStorage.setItem('pending_admin_email', formData.email);
        router.push('/admin/pending');
        return;
      }
      setError(friendlyError(err));
      setLoading(false);
    }
  };

  const handleCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.request('/auth/admin-login/2fa', {
        method: 'POST',
        body: JSON.stringify({ tempToken, code })
      });
      completeLogin(response);
    } catch (err) {
      if (/Session expired/i.test(err.message || '')) {
        backToCredentials();
        setError('That took too long, so the sign-in expired. Please enter your password again.');
      } else {
        setError(friendlyError(err));
      }
      setLoading(false);
    }
  };

  const backToCredentials = () => {
    setStep(1);
    setTempToken("");
    setCode("");
    setError("");
    setFormData(prev => ({ ...prev, password: "" }));
  };

  const codeReady = useBackupCode ? code.replace(/\s/g, '').length >= 8 : code.length === 6;
  const inputClass = "w-full py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all disabled:opacity-60";
  const primaryButton = "w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="glass rounded-3xl shadow-2xl px-6 sm:px-8 py-8 sm:py-10"
        >
          {/* Brand */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-3">
              <LogoIcon size={40} />
              <span className="font-display text-2xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
                SureTalk
              </span>
            </div>
            <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                             bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              <Shield className="w-3.5 h-3.5" />
              Admin Console
            </span>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="credentials" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white text-center">Admin sign in</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-6">
                  For approved SureTalk administrators only.
                </p>

                <form onSubmit={handleCredentials} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="username"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${inputClass} pl-11 pr-4`}
                        placeholder="you@suretalknow.com"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`${inputClass} pl-11 pr-12`}
                        placeholder="Your password"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className={primaryButton}>
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <><Lock className="w-5 h-5" /> Sign in</>
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Need admin access?{" "}
                    <Link href="/admin/register" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 inline-flex items-center gap-1">
                      <UserPlus className="w-4 h-4" /> Request it
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="2fa" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.25 }}>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    {useBackupCode ? <KeyRound className="w-7 h-7 text-white" /> : <ShieldCheck className="w-7 h-7 text-white" />}
                  </div>
                  <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                    {useBackupCode ? 'Use a backup code' : 'Two-step verification'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {useBackupCode
                      ? 'Enter one of the backup codes you saved when you set up 2FA. Each code works once.'
                      : 'Enter the 6-digit code from your authenticator app.'}
                  </p>
                </div>

                <form onSubmit={handleCode} className="space-y-4">
                  <input
                    key={useBackupCode ? 'backup' : 'totp'}
                    type="text"
                    inputMode={useBackupCode ? 'text' : 'numeric'}
                    autoComplete="one-time-code"
                    aria-label={useBackupCode ? 'Backup code' : '6-digit code'}
                    value={code}
                    onChange={e => setCode(useBackupCode
                      ? e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 12)
                      : e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`${inputClass} px-4 text-center text-2xl tracking-[0.4em] font-mono`}
                    placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
                    autoFocus
                    disabled={loading}
                  />

                  <motion.button type="submit" disabled={loading || !codeReady} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className={primaryButton}>
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <><ShieldCheck className="w-5 h-5" /> Verify and sign in</>
                    )}
                  </motion.button>

                  <div className="flex items-center justify-between text-sm pt-1">
                    <button
                      type="button"
                      onClick={backToCredentials}
                      disabled={loading}
                      className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUseBackupCode(!useBackupCode); setCode(""); setError(""); }}
                      disabled={loading}
                      className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                    >
                      {useBackupCode ? 'Use authenticator app' : 'Lost your device? Use a backup code'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            All sign-in attempts are logged and monitored.
          </p>
        </motion.div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <Link href="/login" className="inline-flex items-center gap-1 hover:text-brand-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to SureTalk sign in
          </Link>
          <p className="mt-2">© {new Date().getFullYear()} SureTalk</p>
        </div>
      </div>
    </div>
  );
}
