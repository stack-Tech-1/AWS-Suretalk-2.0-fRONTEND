"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, User, Mail, Phone, CreditCard, HardDrive, Users, Volume2, AlertCircle, RefreshCw, Loader2, Lock } from "lucide-react";
import { api } from "@/utils/api";
import { toast } from "@/components/ui/Toast";
import { PLANS } from "@/components/admin/userShared";

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed";

export default function EditUser() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!id) return;
    api.getUserDetails(id)
      .then(res => {
        const u = res.data.user;
        setUser(u);
        setForm({
          fullName: u.full_name || '',
          subscriptionTier: u.subscription_tier === 'PREMIUM' ? 'LEGACY_VAULT_PREMIUM' : (u.subscription_tier || 'LITE'),
          storageLimitGb: u.storage_limit_gb ?? 1,
          contactsLimit: u.contacts_limit ?? 3,
          voiceNotesLimit: u.voice_notes_limit ?? 3,
        });
      })
      .catch(err => setLoadError(err.message || 'Failed to load user'));
  }, [id]);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-gray-700 dark:text-gray-300 mb-4">{loadError}</p>
        <Link href="/adminDashboard/users" className="px-5 py-2 rounded-xl bg-brand-600 text-white">Back to users</Link>
      </div>
    );
  }
  if (!form) {
    return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-brand-500 animate-spin" /></div>;
  }

  const planLocked = user.stripe_managed;
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const choosePlan = (plan) => setForm(f => ({
    ...f, subscriptionTier: plan.id, storageLimitGb: plan.storageGb, contactsLimit: plan.contacts, voiceNotesLimit: plan.voiceNotes
  }));
  const chosen = PLANS.find(p => p.id === form.subscriptionTier);
  const customised = chosen && (Number(form.storageLimitGb) !== chosen.storageGb || Number(form.contactsLimit) !== chosen.contacts || Number(form.voiceNotesLimit) !== chosen.voiceNotes);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.fullName.trim()) { setError('Name cannot be empty'); return; }

    // Only send what changed
    const update = {};
    if (form.fullName.trim() !== (user.full_name || '')) update.fullName = form.fullName.trim();
    if (!planLocked) {
      if (form.subscriptionTier !== user.subscription_tier) update.subscriptionTier = form.subscriptionTier;
      if (Number(form.storageLimitGb) !== user.storage_limit_gb) update.storageLimitGb = Number(form.storageLimitGb);
      if (Number(form.contactsLimit) !== user.contacts_limit) update.contactsLimit = Number(form.contactsLimit);
      if (Number(form.voiceNotesLimit) !== user.voice_notes_limit) update.voiceNotesLimit = Number(form.voiceNotesLimit);
    }
    if (!Object.keys(update).length) { toast.info('Nothing to save — no changes made.'); return; }

    setSaving(true);
    try {
      await api.updateUser(id, update);
      toast.success('Changes saved', 'User updated');
      router.push(`/adminDashboard/users/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to save changes');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/adminDashboard/users/${id}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Back to user">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-white">Edit user</h1>
          <p className="text-gray-600 dark:text-gray-400">{user.full_name || user.email}</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2"><User className="w-5 h-5" /> Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full name</label>
              <input id="fullName" value={form.fullName} onChange={e => set('fullName', e.target.value)} maxLength={255} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input value={user.email} disabled className={`${inputClass} pl-10`} />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">The sign-in email can&apos;t be changed here.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input value={user.phone || 'Not provided'} disabled className={`${inputClass} pl-10`} />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Linked to their phone line (IVR) account, so it can&apos;t be changed here.</p>
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2"><CreditCard className="w-5 h-5" /> Plan</h2>
          {planLocked ? (
            <div className="mb-5 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 flex items-start gap-3">
              <Lock className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-800 dark:text-indigo-300">
                This user pays through Stripe, so their plan and limits follow their subscription. To change their plan, update or cancel the subscription in Stripe.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Choosing a plan sets its standard limits. This doesn&apos;t charge the user — use it for free or complimentary accounts.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {PLANS.map(plan => {
              const selected = form.subscriptionTier === plan.id;
              return (
                <button type="button" key={plan.id} onClick={() => !planLocked && choosePlan(plan)} disabled={planLocked}
                  aria-pressed={selected}
                  className={`p-4 rounded-xl border-2 text-left transition-all disabled:cursor-not-allowed ${selected
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'} ${planLocked && !selected ? 'opacity-50' : ''}`}>
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

          <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Limits</h3>
          <p className="text-xs text-gray-500 mb-3">
            {customised ? 'Custom limits — different from the plan\'s standard limits.' : 'Standard limits for this plan. You can raise or lower them for this user.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ['contactsLimit', 'Contacts', Users],
              ['voiceNotesLimit', 'Voice notes', Volume2],
              ['storageLimitGb', 'Storage (GB)', HardDrive],
            ].map(([key, label, Icon]) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input id={key} type="number" min="0" max="100000" step="1" value={form[key]} disabled={planLocked}
                    onChange={e => set(key, e.target.value)} className={`${inputClass} pl-10`} required />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Link href={`/adminDashboard/users/${id}`}
            className="px-6 py-3 text-center border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
