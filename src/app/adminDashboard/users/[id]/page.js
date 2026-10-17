"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Users, Mail, Phone, Calendar, Shield, CreditCard, Activity, MessageSquare,
  Edit, Trash2, RefreshCw, AlertCircle, CheckCircle, XCircle, User, KeyRound, UserX, UserCheck,
  AlertTriangle, Loader2, HardDrive, Clock, FileText
} from "lucide-react";
import { api } from "@/utils/api";
import { toast } from "@/components/ui/Toast";
import {
  planInfo, statusInfo, isActiveStatus, timeAgo, formatDate, formatBytes, ConfirmDialog, useConfirm
} from "@/components/admin/userShared";

const formatDuration = (s) => {
  const total = Math.round(Number(s) || 0);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const humanizeAction = (action) => {
  const text = String(action || '').toLowerCase().replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

function UsageBar({ label, used, limit, color, format = (v) => Number(v).toLocaleString() }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const over = limit > 0 && used > limit;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className={`font-medium ${over ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
          {format(used)} / {format(limit)}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className={`h-2 rounded-full ${over ? 'bg-red-500' : color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <div className="flex items-center gap-2 mt-0.5">
        {Icon && <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        <p className="font-medium text-gray-800 dark:text-white break-all">{children}</p>
      </div>
    </div>
  );
}

const Check = ({ ok }) => ok
  ? <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle className="w-4 h-4" /> Yes</span>
  : <span className="inline-flex items-center gap-1 text-gray-500"><XCircle className="w-4 h-4" /> No</span>;

export default function UserDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");
  const [activity, setActivity] = useState(null);
  const [activityError, setActivityError] = useState('');
  const [myId, setMyId] = useState(null);
  const [notifyUser, setNotifyUser] = useState(true);
  const notifyRef = useRef(true);
  const confirm = useConfirm();

  const load = useCallback(async () => {
    try {
      const res = await api.getUserDetails(id);
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load user");
    }
  }, [id]);

  useEffect(() => { if (id) load(); }, [id, load]);
  useEffect(() => { api.getProfile().then(r => setMyId(r.data?.id)).catch(() => {}); }, []);

  useEffect(() => {
    if (tab !== 'activity' || activity) return;
    api.getUserActivity(id)
      .then(r => setActivity(r.data))
      .catch(err => setActivityError(err.message || 'Could not load activity'));
  }, [tab, activity, id]);

  if (!data && !error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">User not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <Link href="/adminDashboard/users" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl">
          <ArrowLeft className="w-4 h-4" /> Back to users
        </Link>
      </div>
    );
  }

  const u = data.user;
  const plan = planInfo(u.subscription_tier);
  const status = statusInfo(u.subscription_status);
  const active = isActiveStatus(u.subscription_status);
  const isSelf = myId && myId === u.id;
  const canManage = !u.is_admin && !isSelf;
  const name = u.full_name || u.email;
  const paidTotal = data.billingHistory
    .filter(b => ['paid', 'succeeded'].includes(b.status))
    .reduce((sum, b) => sum + b.amount_cents / 100, 0);

  const sendReset = () => confirm.open({
    title: `Send a password reset email to ${u.email}?`,
    message: 'They\'ll get a link to choose a new password. The link expires in 1 hour. Their current password keeps working until they change it.',
    confirmLabel: 'Send email',
    onConfirm: async () => {
      try { const r = await api.sendUserPasswordReset(u.id); toast.success(r.message, 'Email sent'); }
      catch (err) { toast.error(err.message || 'Could not send the email'); return true; }
    }
  });

  const toggleActive = () => confirm.open(active ? {
    title: `Deactivate ${name}?`,
    message: <>They won&apos;t be able to sign in or use the app until you reactivate them. Their data is kept.{u.stripe_managed && <> <strong>Their Stripe subscription is not changed</strong> — cancel it in Stripe if they shouldn&apos;t be charged.</>}</>,
    confirmLabel: 'Deactivate', danger: true,
    onConfirm: async () => {
      try { await api.deactivateUser(u.id); toast.success(`${name} was deactivated`); await load(); }
      catch (err) { toast.error(err.message || 'Could not deactivate'); return true; }
    }
  } : {
    title: `Reactivate ${name}?`,
    message: 'They\'ll be able to sign in and use the app again.',
    confirmLabel: 'Reactivate',
    onConfirm: async () => {
      try { await api.reactivateUser(u.id); toast.success(`${name} was reactivated`); await load(); }
      catch (err) { toast.error(err.message || 'Could not reactivate'); return true; }
    }
  });

  const deleteUser = () => {
    setNotifyUser(true);
    notifyRef.current = true;
    confirm.open({
      title: `Delete ${name}?`,
      message: <>Their account is closed and they lose access.{u.stripe_managed && ' Their Stripe subscription is cancelled.'} Their data is kept on record.</>,
      confirmLabel: 'Delete user', danger: true, notifyOption: true,
      onConfirm: async () => {
        try {
          const res = await api.deleteUser(u.id, { notify: notifyRef.current });
          if (res.data?.stripeCancelled === false) toast.warning(res.message, 'Check Stripe');
          else toast.success(`${name} was deleted`, 'User deleted');
          router.push('/adminDashboard/users');
        } catch (err) {
          toast.error(err.message || 'Delete failed');
          return true;
        }
      }
    });
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "voice-notes", label: "Voice notes", icon: MessageSquare, count: u.note_count },
    { id: "contacts", label: "Contacts", icon: Users, count: u.contact_count },
    { id: "billing", label: "Billing", icon: CreditCard, count: data.billingHistory.length },
    { id: "activity", label: "Activity", icon: Activity },
  ];

  // User events and admin actions on this account, newest first
  const timeline = activity ? [
    ...activity.events.map(e => ({ key: `e-${e.id}`, at: e.created_at, level: e.level, title: e.message, sub: [e.service, e.ip_address].filter(Boolean).join(' · ') })),
    ...activity.adminActions.map(a => ({ key: `a-${a.id}`, at: a.created_at, level: 'admin', title: `${humanizeAction(a.action)} by ${a.admin_name || a.admin_email || 'an admin'}`, sub: 'Admin action' })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)) : [];

  const levelStyle = {
    admin: 'bg-brand-500', error: 'bg-red-500', warning: 'bg-amber-500', warn: 'bg-amber-500', info: 'bg-green-500',
  };

  return (
    <div>
      <Link href="/adminDashboard/users" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> All users
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-white text-2xl">{name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold text-gray-800 dark:text-white truncate">{u.full_name || 'No name'}</h1>
              <p className="text-gray-600 dark:text-gray-400 truncate">{u.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${plan.color}`}>{plan.label}</span>
                <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                {u.stripe_managed && <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">Pays via Stripe</span>}
                {u.is_admin && <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">Admin</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/adminDashboard/users/${u.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white text-sm font-medium">
              <Edit className="w-4 h-4" /> Edit
            </Link>
            <button onClick={sendReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <KeyRound className="w-4 h-4" /> Send password reset
            </button>
            {canManage && (
              <>
                <button onClick={toggleActive}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  {active ? <><UserX className="w-4 h-4" /> Deactivate</> : <><UserCheck className="w-4 h-4" /> Reactivate</>}
                </button>
                <button onClick={deleteUser}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </>
            )}
          </div>
        </div>
        {u.is_admin && (
          <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Admin accounts can&apos;t be deactivated or deleted here — use the Admin requests page.
          </p>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-all ${tab === t.id
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <Icon className="w-4 h-4" /> {t.label}
                {t.count !== undefined && <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">{t.count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white mb-5">Account</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoRow icon={Mail} label="Email">{u.email}</InfoRow>
                <InfoRow icon={Phone} label="Phone">{u.phone || 'Not provided'}</InfoRow>
                <InfoRow icon={Calendar} label="Joined">{formatDate(u.created_at, true)}</InfoRow>
                <InfoRow icon={Clock} label="Last active">{timeAgo(u.last_active)}</InfoRow>
                <InfoRow icon={Activity} label="Last sign-in">{u.last_login ? formatDate(u.last_login, true) : 'Never'}</InfoRow>
                <InfoRow icon={User} label="Signed up via">{u.source === 'admin' ? 'Added by an admin' : u.source === 'ivr' ? 'Phone line (IVR)' : 'Website / app'}</InfoRow>
                <InfoRow label="Email verified"><Check ok={u.email_verified} /></InfoRow>
                <InfoRow label="Two-step verification"><Check ok={u.two_factor_enabled} /></InfoRow>
              </div>
              <p className="mt-6 text-xs text-gray-500">User ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{u.id}</code></p>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white">Plan &amp; usage</h2>
                <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${plan.color}`}>{plan.label}</span>
              </div>
              <div className="space-y-5">
                <UsageBar label="Voice notes" used={u.note_count} limit={u.voice_notes_limit} color="bg-brand-500" />
                <UsageBar label="Contacts" used={u.contact_count} limit={u.contacts_limit} color="bg-green-500" />
                <UsageBar label="Storage" used={Number(u.storage_bytes)} limit={u.storage_limit_gb * 1024 ** 3} color="bg-sky-500" format={formatBytes} />
                <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-gray-500">Voice wills</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{u.will_count}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-gray-500">Scheduled</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{u.scheduled_count}</p>
                  </div>
                </div>
                {u.stripe_managed && (
                  <p className="text-xs text-gray-500 flex items-start gap-2">
                    <CreditCard className="w-4 h-4 flex-shrink-0" /> This user pays through Stripe, so their plan follows their subscription.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "voice-notes" && (
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white">Voice notes</h2>
            <p className="text-sm text-gray-500 mb-5">
              {u.note_count > data.voiceNotes.length ? `Latest ${data.voiceNotes.length} of ${u.note_count}` : `${u.note_count} voice note${u.note_count === 1 ? '' : 's'}`} ·
              {' '}{formatBytes(u.storage_bytes)} used. Recordings are private, so they can&apos;t be played from here.
            </p>
            {data.voiceNotes.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[520px]">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-600 dark:text-gray-400">
                    <tr><th className="py-3 px-4 font-medium">Title</th><th className="py-3 px-4 font-medium">Length</th><th className="py-3 px-4 font-medium">Size</th><th className="py-3 px-4 font-medium">Created</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                    {data.voiceNotes.map(n => (
                      <tr key={n.id}>
                        <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">{n.title || 'Untitled'}</td>
                        <td className="py-3 px-4">{formatDuration(n.duration_seconds)}</td>
                        <td className="py-3 px-4">{formatBytes(n.file_size_bytes)}</td>
                        <td className="py-3 px-4">{formatDate(n.created_at, true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-center text-gray-500 py-10">No voice notes yet.</p>}
          </div>
        )}

        {tab === "contacts" && (
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white mb-1">Contacts</h2>
            <p className="text-sm text-gray-500 mb-5">
              {u.contact_count > data.contacts.length ? `Latest ${data.contacts.length} of ${u.contact_count}` : `${u.contact_count} contact${u.contact_count === 1 ? '' : 's'}`}
            </p>
            {data.contacts.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-600 dark:text-gray-400">
                    <tr><th className="py-3 px-4 font-medium">Name</th><th className="py-3 px-4 font-medium">Phone</th><th className="py-3 px-4 font-medium">Email</th><th className="py-3 px-4 font-medium">Relationship</th><th className="py-3 px-4 font-medium">Added</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                    {data.contacts.map(c => (
                      <tr key={c.id}>
                        <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">{c.name}</td>
                        <td className="py-3 px-4">{c.phone || '—'}</td>
                        <td className="py-3 px-4">{c.email || '—'}</td>
                        <td className="py-3 px-4">{c.relationship || '—'}</td>
                        <td className="py-3 px-4">{formatDate(c.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-center text-gray-500 py-10">No contacts yet.</p>}
          </div>
        )}

        {tab === "billing" && (
          <div className="glass rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white">Billing history</h2>
                <p className="text-sm text-gray-500">Payments recorded for this account. Full invoices are in your Stripe dashboard.</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total paid</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">${paidTotal.toFixed(2)}</p>
              </div>
            </div>
            {data.billingHistory.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[520px]">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-600 dark:text-gray-400">
                    <tr><th className="py-3 px-4 font-medium">Date</th><th className="py-3 px-4 font-medium">Description</th><th className="py-3 px-4 font-medium">Amount</th><th className="py-3 px-4 font-medium">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                    {data.billingHistory.map(b => {
                      const paid = ['paid', 'succeeded'].includes(b.status);
                      return (
                        <tr key={b.id}>
                          <td className="py-3 px-4 whitespace-nowrap">{formatDate(b.created_at)}</td>
                          <td className="py-3 px-4">{b.description || '—'}</td>
                          <td className="py-3 px-4 font-medium">${(b.amount_cents / 100).toFixed(2)} {(b.currency || 'USD').toUpperCase()}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${paid
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : b.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                              {paid ? 'Paid' : b.status === 'manual_change' ? 'Plan change' : (b.status || '—')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-center text-gray-500 py-10">No payments recorded.</p>}
          </div>
        )}

        {tab === "activity" && (
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white mb-1">Activity</h2>
            <p className="text-sm text-gray-500 mb-5">
              Sign-ins, account changes and admin actions on this account
              {activity ? ` · ${activity.recentLogins} sign-in${activity.recentLogins === 1 ? '' : 's'} in the latest 100 events` : ''}.
            </p>
            {activityError ? (
              <p className="text-sm text-red-600 dark:text-red-400 py-6">{activityError}</p>
            ) : !activity ? (
              <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-brand-500" /></div>
            ) : timeline.length ? (
              <ol className="space-y-3">
                {timeline.map(item => (
                  <li key={item.key} className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                    <span className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${levelStyle[item.level] || 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-white">{item.title}</p>
                      {item.sub && <p className="text-xs text-gray-500">{item.sub}</p>}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap" title={formatDate(item.at, true)}>{timeAgo(item.at)}</span>
                  </li>
                ))}
              </ol>
            ) : <p className="text-center text-gray-500 py-10">No activity recorded yet.</p>}
          </div>
        )}
      </motion.div>

      <ConfirmDialog {...confirm.dialogProps}>
        {confirm.dialogProps.notifyOption && (
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={notifyUser} onChange={e => { setNotifyUser(e.target.checked); notifyRef.current = e.target.checked; }} className="rounded" />
            Email the user that their account was closed
          </label>
        )}
      </ConfirmDialog>
    </div>
  );
}
