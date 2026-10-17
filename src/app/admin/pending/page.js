"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Shield, Mail, Lock, AlertCircle, CheckCircle, XCircle, RefreshCw, Eye, EyeOff } from "lucide-react";
import LogoIcon from "@/components/common/LogoIcon";
import { api } from "@/utils/api";

const inputClass = "w-full py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-60";

export default function PendingAdminStatus() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { status, reason }

  useEffect(() => {
    try { setEmail(localStorage.getItem('pending_admin_email') || ""); } catch {}
  }, []);

  const check = async (e) => {
    e.preventDefault();
    setError("");
    setChecking(true);
    try {
      const r = await api.checkAdminRequestStatus(email.trim(), password);
      setResult(r.data);
      if (r.data.status !== 'pending') { try { localStorage.removeItem('pending_admin_email'); } catch {} }
    } catch (err) {
      setError(err.message || "Couldn't check your request");
    } finally {
      setChecking(false);
    }
  };

  const view = {
    pending: { icon: Clock, color: 'from-amber-500 to-orange-500', title: 'Still waiting for review', text: 'A super admin hasn\'t decided yet. You\'ll get an email when they do.' },
    approved: { icon: CheckCircle, color: 'from-green-500 to-emerald-500', title: 'You\'re approved', text: 'You can now sign in to the admin console. We recommend turning on two-step verification once you\'re in.' },
    rejected: { icon: XCircle, color: 'from-red-500 to-pink-500', title: 'Request not approved', text: 'A super admin decided not to give this account admin access.' },
  }[result?.status];

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md glass rounded-3xl shadow-2xl px-6 sm:px-8 py-8 sm:py-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-3">
            <LogoIcon size={40} />
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">SureTalk</span>
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
            <Shield className="w-3.5 h-3.5" /> Admin Console
          </span>
        </div>

        {view ? (
          <div className="text-center">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${view.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
              <view.icon className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">{view.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{view.text}</p>
            {result.status === 'rejected' && result.reason && (
              <p className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-700 dark:text-gray-300 text-left"><strong>Reason:</strong> {result.reason}</p>
            )}
            <div className="flex flex-col gap-3 mt-8">
              {result.status === 'approved'
                ? <Link href="/admin/login" className="py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 text-white font-semibold">Sign in</Link>
                : <button onClick={() => setResult(null)} className="py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium inline-flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> Check again later</button>}
              <Link href="/admin/login" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Back to admin sign in</Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white text-center">Check your request</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-6">Enter the email and password you used when you asked for admin access.</p>
            {error && (
              <div role="alert" className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            <form onSubmit={check} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" aria-label="Email" value={email} onChange={e => setEmail(e.target.value)} required disabled={checking} autoComplete="username" placeholder="you@suretalknow.com" className={`${inputClass} pl-11 pr-4`} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} aria-label="Password" value={password} onChange={e => setPassword(e.target.value)} required disabled={checking} autoComplete="current-password" placeholder="Your password" className={`${inputClass} pl-11 pr-11`} />
                <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button type="submit" disabled={checking} className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 text-white font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2">
                {checking ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking…</> : 'Check status'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Haven&apos;t applied yet? <Link href="/admin/register" className="font-semibold text-brand-600 dark:text-brand-400">Request access</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
