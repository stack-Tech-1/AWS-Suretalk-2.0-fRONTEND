"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Clock, Key, Briefcase, ArrowLeft, CheckCircle } from "lucide-react";
import LogoIcon from "@/components/common/LogoIcon";
import { api } from "@/utils/api";
import { getTurnstileToken } from "@/utils/turnstile";

const inputClass = "w-full py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all disabled:opacity-60";

function Field({ label, htmlFor, icon: Icon, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />}
        {children}
      </div>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default function AdminRegister() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", department: "", password: "", confirmPassword: "", registrationCode: "", reason: "" });

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError("The passwords don't match.");
    if (form.password.length < 12) return setError("Password must be at least 12 characters.");
    if (form.reason.trim().length < 10) return setError("Tell us why you need admin access (at least 10 characters).");

    setLoading(true);
    try {
      const turnstileToken = await getTurnstileToken('admin_request');
      await api.request('/auth/admin/request', {
        method: 'POST',
        body: JSON.stringify({
          fullName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          department: form.department || undefined,
          password: form.password,
          registrationCode: form.registrationCode.trim(),
          reason: form.reason.trim(),
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      });
      localStorage.setItem('pending_admin_email', form.email.trim());
      setDone(true);
    } catch (err) {
      setError(err.message || "Couldn't submit your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-lg glass rounded-3xl shadow-2xl px-6 sm:px-8 py-8 sm:py-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-3">
            <LogoIcon size={40} />
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">SureTalk</span>
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
            <Shield className="w-3.5 h-3.5" /> Admin Console
          </span>
        </div>

        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Request sent</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              A super admin will review your request. You&apos;ll get an email at <strong>{form.email}</strong> when it&apos;s decided.
            </p>
            <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8 mx-auto max-w-xs">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Your request was received</li>
              <li className="flex items-start gap-2"><Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" /> Waiting for a super admin to review it</li>
            </ul>
            <div className="flex flex-col gap-3">
              <Link href="/admin/pending" className="py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 text-white font-semibold">Check my request status</Link>
              <Link href="/admin/login" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Back to admin sign in</Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white text-center">Request admin access</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-6">Admins can see every user&apos;s data, so each request is reviewed by a super admin.</p>

            {error && (
              <div role="alert" className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First name" htmlFor="firstName" icon={User}>
                  <input id="firstName" name="firstName" value={form.firstName} onChange={set} required disabled={loading} autoComplete="given-name" className={`${inputClass} pl-11 pr-4`} />
                </Field>
                <Field label="Last name" htmlFor="lastName" icon={User}>
                  <input id="lastName" name="lastName" value={form.lastName} onChange={set} required disabled={loading} autoComplete="family-name" className={`${inputClass} pl-11 pr-4`} />
                </Field>
              </div>
              <Field label="Email" htmlFor="email" icon={Mail}>
                <input id="email" name="email" type="email" value={form.email} onChange={set} required disabled={loading} autoComplete="email" className={`${inputClass} pl-11 pr-4`} placeholder="you@suretalknow.com" />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone" htmlFor="phone" icon={Phone}>
                  <input id="phone" name="phone" type="tel" value={form.phone} onChange={set} required disabled={loading} autoComplete="tel" className={`${inputClass} pl-11 pr-4`} placeholder="+2348012345678" />
                </Field>
                <Field label="Department (optional)" htmlFor="department" icon={Briefcase}>
                  <select id="department" name="department" value={form.department} onChange={set} disabled={loading} className={`${inputClass} pl-11 pr-4`}>
                    <option value="">Choose…</option>
                    <option value="Customer support">Customer support</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Management">Management</option>
                    <option value="Security">Security</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Password" htmlFor="password" icon={Lock} hint="At least 12 characters">
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set} required minLength={12} disabled={loading} autoComplete="new-password" className={`${inputClass} pl-11 pr-11`} />
                  <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </Field>
                <Field label="Confirm password" htmlFor="confirmPassword" icon={Lock}>
                  <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={set} required disabled={loading} autoComplete="new-password" className={`${inputClass} pl-11 pr-4`} />
                </Field>
              </div>
              <Field label="Registration code" htmlFor="registrationCode" icon={Key} hint="Ask your SureTalk contact for the current code.">
                <input id="registrationCode" name="registrationCode" value={form.registrationCode} onChange={set} disabled={loading} autoComplete="off" className={`${inputClass} pl-11 pr-4`} />
              </Field>
              <Field label="Why do you need admin access?" htmlFor="reason">
                <textarea id="reason" name="reason" value={form.reason} onChange={set} required rows={3} maxLength={2000} disabled={loading}
                  className={`${inputClass} px-4`} placeholder="e.g. I handle customer support and need to look up accounts" />
              </Field>
              <button type="submit" disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending request…</> : <><Shield className="w-5 h-5" /> Request admin access</>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Already approved? <Link href="/admin/login" className="font-semibold text-brand-600 dark:text-brand-400">Sign in</Link>
            </p>
          </>
        )}
      </motion.div>

      <Link href="/admin/login" className="fixed top-4 left-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600"><ArrowLeft className="w-4 h-4" /> Admin sign in</Link>
    </div>
  );
}
