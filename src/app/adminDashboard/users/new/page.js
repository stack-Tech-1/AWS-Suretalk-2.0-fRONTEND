"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, Mail, Phone, User, CheckCircle, AlertCircle, AlertTriangle, Copy, Loader2, Users, Volume2, HardDrive } from "lucide-react";
import { api } from "@/utils/api";
import { toast } from "@/components/ui/Toast";
import { PLANS } from "@/components/admin/userShared";

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent";
const EMPTY = { fullName: "", email: "", phone: "", subscriptionTier: "LITE", sendSetupEmail: true };

export default function CreateUser() {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const phone = form.phone.replace(/[\s()-]/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      setError('Phone must be in international format, starting with + and the country code, e.g. +2348012345678');
      return;
    }
    setSaving(true);
    try {
      const res = await api.createUser({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone,
        subscriptionTier: form.subscriptionTier,
        sendSetupEmail: form.sendSetupEmail,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0" />
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-800 dark:text-white">User created</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{result.user.full_name} · {result.user.email}</p>
            </div>
          </div>

          {result.emailSent ? (
            <p className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-300">
              We emailed {result.user.email} a link to set their password. The link works for 7 days — if it expires, use
              &ldquo;Send password reset&rdquo; on their profile.
            </p>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                No email was sent{form.sendSetupEmail ? ' (the email service failed)' : ''}. Send them this link so they can set their password.
                It works for 7 days — treat it like a password.
              </p>
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-lg">
                <code className="flex-1 text-xs break-all text-gray-700 dark:text-gray-300">{result.setupLink}</code>
                <button onClick={() => { navigator.clipboard.writeText(result.setupLink); toast.success('Link copied'); }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0" aria-label="Copy link">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link href={`/adminDashboard/users/${result.user.id}`}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white text-center font-medium">
              View user
            </Link>
            <button onClick={() => { setResult(null); setForm(EMPTY); }}
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium">
              Add another user
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/adminDashboard/users" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Back to users">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-white">Add user</h1>
          <p className="text-gray-600 dark:text-gray-400">Create an account. They&apos;ll choose their own password.</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="glass rounded-2xl p-6 space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input id="fullName" value={form.fullName} onChange={e => set('fullName', e.target.value)} required maxLength={255}
                className={`${inputClass} pl-10`} placeholder="Ada Okafor" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} required
                  className={`${inputClass} pl-10`} placeholder="ada@example.com" />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input id="phone" type="tel" required value={form.phone} onChange={e => set('phone', e.target.value)}
                  className={`${inputClass} pl-10`} placeholder="+2348012345678" />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Every account needs a unique phone number (also used for the phone line). Include the country code.</p>
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white mb-1">Plan</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
            The user isn&apos;t charged — a paid plan here is complimentary. If they later subscribe through the app, Stripe takes over.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map(plan => {
              const selected = form.subscriptionTier === plan.id;
              return (
                <button type="button" key={plan.id} onClick={() => set('subscriptionTier', plan.id)} aria-pressed={selected}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${selected
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-800 dark:text-white">{plan.label}</span>
                    <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{plan.price}</span>
                  </div>
                  <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2"><Users className="w-4 h-4" /> {plan.contacts} contacts</li>
                    <li className="flex items-center gap-2"><Volume2 className="w-4 h-4" /> {plan.voiceNotes} voice notes</li>
                    <li className="flex items-center gap-2"><HardDrive className="w-4 h-4" /> {plan.storageGb} GB storage</li>
                  </ul>
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.sendSetupEmail} onChange={e => set('sendSetupEmail', e.target.checked)} className="mt-1 rounded" />
            <span>
              <span className="font-medium text-gray-800 dark:text-white">Email them a link to set their password</span>
              <span className="block text-sm text-gray-500">Recommended. If you untick this, you&apos;ll get the link to send yourself.</span>
            </span>
          </label>
        </section>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Link href="/adminDashboard/users"
            className="px-6 py-3 text-center border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Create user
          </button>
        </div>
      </form>
    </div>
  );
}
