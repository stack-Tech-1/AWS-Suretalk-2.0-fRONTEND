'use client';
// Super admin view of one account. Editing details and (soft) deleting live on the admin Users page.
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/utils/api';
import { toast } from '@/components/ui/Toast';
import {
  PLANS, planInfo, statusInfo, accountStatusInfo, timeAgo, formatDate, formatBytes, saveBlob,
  ConfirmDialog, ReasonDialog, eventLabel,
} from '@/components/admin/userShared';
import {
  ArrowLeft, User, Mic, Shield, Calendar, Activity, CreditCard, Phone, Mail, Clock, Download,
  Play, Star, Lock, AlertTriangle, RefreshCw, Eye, Ban, CheckCircle, Pencil, LogIn,
} from 'lucide-react';

const formatDuration = (s) => { const n = Math.round(Number(s) || 0); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };
const errorText = (err, fallback) => err?.data?.error || err?.message || fallback;
const DELIVERY = {
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'recordings', label: 'Recordings', icon: Mic },
  { id: 'scheduled', label: 'Scheduled', icon: Calendar },
  { id: 'vault', label: 'Voice wills', icon: Shield },
  { id: 'footprint', label: 'Footprint', icon: Activity },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function SuperUserDetailPage() {
  const params = useParams();
  const id = params.id;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [footprint, setFootprint] = useState(null);
  const [footprintError, setFootprintError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [exporting, setExporting] = useState('');
  const [dialog, setDialog] = useState(null); // 'plan' | 'suspend' | 'impersonate' | 'resync'
  const [planChoice, setPlanChoice] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setUserData((await api.getSuperAdminUserFull(id)).data);
    } catch (err) {
      setError(errorText(err, 'Failed to load this account'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (activeTab !== 'footprint' || footprint) return;
    setFootprintError(null);
    api.getSuperAdminUserFootprint(id)
      .then(res => setFootprint(res.data))
      .catch(err => setFootprintError(errorText(err, 'Failed to load activity')));
  }, [activeTab, id, footprint]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !userData) return (
    <div className="text-center py-16">
      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">{error || 'User not found'}</p>
      <Link href="/adminDashboard/super" className="mt-4 inline-flex items-center gap-2 text-brand-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Super Admin
      </Link>
    </div>
  );

  const { user, voiceNotes, contacts, scheduled, vault, billing } = userData;
  const plan = planInfo(user.subscription_tier);
  const status = accountStatusInfo(user);
  const deleted = !!user.deleted_at;
  const canAct = !deleted;
  const storageLimitGb = user.storage_limit_gb || plan.plan?.storageGb || 1;
  const storagePct = Math.min(100, (user.storage_used_bytes / (storageLimitGb * 1024 ** 3)) * 100);

  const download = async (key, path, fallback) => {
    setExporting(key);
    try {
      const { blob, filename } = await api.downloadSuperAdminFile(path, fallback);
      saveBlob(blob, filename);
    } catch (err) {
      toast.error(errorText(err, 'Export failed'));
    } finally {
      setExporting('');
    }
  };

  const submitPlan = async (reason) => {
    try {
      await api.updateUserTier(id, planChoice, reason);
      toast.success(`Plan changed to ${planInfo(planChoice).label}`);
      await load();
    } catch (err) {
      toast.error(errorText(err, 'Failed to change plan'));
      return false;
    }
  };

  const submitSuspend = async (reason) => {
    try {
      await api.suspendUser(id, !user.is_suspended, reason || null);
      toast.success(user.is_suspended ? 'Account reactivated' : 'Account suspended');
      await load();
    } catch (err) {
      toast.error(errorText(err, 'Failed to update account'));
      return false;
    }
  };

  const runResync = async () => {
    setBusy(true);
    try {
      const res = await api.resyncSuperAdminUser(id);
      toast.success(`Synced from the phone line (${res.data.syncedFields.join(', ').replace(/_/g, ' ')})`);
      setDialog(null);
      await load();
    } catch (err) {
      toast.error(errorText(err, 'Re-sync failed'));
    } finally {
      setBusy(false);
    }
  };

  const runImpersonate = async () => {
    setBusy(true);
    try {
      const res = await api.impersonateUser(id);
      localStorage.setItem('adminReturnToken', localStorage.getItem('token'));
      localStorage.setItem('impersonationToken', res.data.token);
      localStorage.setItem('impersonationData', JSON.stringify({
        targetUser: res.data.targetUser, expiresAt: res.data.expiresAt, startedAt: new Date().toISOString()
      }));
      localStorage.setItem('token', res.data.token);
      window.location.href = '/usersDashboard';
    } catch (err) {
      toast.error(errorText(err, 'Couldn\'t start viewing as this user'));
      setBusy(false);
    }
  };

  const cantImpersonate = user.is_admin ? 'Admin accounts can\'t be viewed as' : user.is_suspended ? 'Reactivate the account first' : null;
  const btn = 'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors disabled:opacity-40';

  return (
    <div className="page-enter max-w-5xl mx-auto">
      <Link href="/adminDashboard/super" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Super Admin
      </Link>

      {deleted && (
        <div className="mb-4 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
          This account was deleted on {formatDate(user.deleted_at, true)}. Its data is kept for records; it can&apos;t sign in.
        </div>
      )}
      {user.is_suspended && !deleted && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          Suspended {user.suspended_at ? formatDate(user.suspended_at, true) : ''}{user.suspended_reason ? ` — “${user.suspended_reason}”` : ''}. They can&apos;t use the app or phone line.
        </div>
      )}

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${deleted ? 'bg-gray-400' : 'bg-gradient-to-br from-brand-500 to-accent-500'}`}>
            <span className="text-2xl font-bold text-white">{user.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.full_name || 'Unknown'}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${plan.color}`}>{plan.label}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>{user.is_suspended && !deleted ? 'Suspended' : status.label}</span>
              {user.stripe_managed && <span className="px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Pays via Stripe</span>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{user.email}</span>
              {user.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{user.phone}</span>}
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Joined {formatDate(user.created_at)}</span>
              <span className="flex items-center gap-1"><Activity className="w-4 h-4" />Last active {timeAgo(user.last_active)}</span>
            </div>
          </div>
          <div className="hidden md:flex gap-6 text-center flex-shrink-0">
            <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{user.voice_note_count}</p><p className="text-xs text-gray-500">Notes</p></div>
            <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{user.scheduled_count}</p><p className="text-xs text-gray-500">Scheduled</p></div>
            <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{formatBytes(user.storage_used_bytes)}</p><p className="text-xs text-gray-500">Storage</p></div>
          </div>
        </div>

        {canAct && (
          <div className="mt-5 flex justify-end gap-2 flex-wrap">
            <Link href={`/adminDashboard/users/${id}`} className={`${btn} border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800`}
              title="Edit details, reset password or delete on the admin Users page">
              <Pencil className="w-4 h-4" /> Edit / delete
            </Link>
            <button onClick={() => { setPlanChoice(''); setDialog('plan'); }} disabled={user.stripe_managed}
              title={user.stripe_managed ? 'Pays through Stripe — change the plan in Stripe' : 'Change plan'}
              className={`${btn} border-brand-300 dark:border-brand-700 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20`}>
              <CreditCard className="w-4 h-4" /> Change plan
            </button>
            <button onClick={() => setDialog('impersonate')} disabled={!!cantImpersonate} title={cantImpersonate || 'See the app as this user for 5 minutes'}
              className={`${btn} border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20`}>
              <Eye className="w-4 h-4" /> View as user
            </button>
            <button onClick={() => setDialog('resync')} disabled={!user.phone} title={user.phone ? 'Pull plan and Stripe details from the phone line' : 'No phone number on this account'}
              className={`${btn} border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20`}>
              <RefreshCw className="w-4 h-4" /> Re-sync from phone line
            </button>
            {!user.is_super_admin && (
              <button onClick={() => setDialog('suspend')}
                className={`${btn} ${user.is_suspended ? 'border-green-300 dark:border-green-700 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'border-red-300 dark:border-red-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                {user.is_suspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                {user.is_suspended ? 'Reactivate' : 'Suspend'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-brand-500 text-white shadow-brand' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Account details</h3>
            <dl className="space-y-3">
              {[
                ['Full name', user.full_name || '—'],
                ['Email', user.email],
                ['Phone', user.phone || 'Not set'],
                ['Signed up through', user.source === 'ivr' ? 'Phone line' : 'App'],
                ['Email verified', user.email_verified ? 'Yes' : 'No'],
                ['Two-step verification', user.two_factor_enabled ? 'On' : 'Off'],
                ['Account created', formatDate(user.created_at, true)],
                ['Last sign-in', user.last_login ? formatDate(user.last_login, true) : 'Never'],
                ['Role', user.is_super_admin ? 'Super admin' : user.is_admin ? 'Admin' : 'Customer'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium text-right truncate">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Export</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'full', path: `/users/${id}/export/full`, label: 'All data (JSON)', fallback: 'suretalk-user.json' },
                  { key: 'billing', path: `/users/${id}/export/billing`, label: 'Payments (CSV)', fallback: 'suretalk-billing.csv' },
                  { key: 'notes', path: `/users/${id}/export/voice-notes`, label: 'Voice notes (CSV)', fallback: 'suretalk-voice-notes.csv' },
                ].map(x => (
                  <button key={x.key} onClick={() => download(x.key, x.path, x.fallback)} disabled={!!exporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40">
                    {exporting === x.key ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                    {x.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contacts ({contacts.length})</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {contacts.length === 0 ? <p className="text-sm text-gray-400">No contacts added</p> : contacts.map(ct => (
                <div key={ct.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{ct.name}</p>
                    <p className="text-gray-400 text-xs truncate">{[ct.phone, ct.email].filter(Boolean).join(' · ')}</p>
                  </div>
                  {ct.relationship && <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{ct.relationship}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recordings */}
      {activeTab === 'recordings' && (
        <div className="space-y-3">
          {voiceNotes.length === 0 ? <div className="text-center py-12 text-gray-500">No voice notes recorded</div> : (
            <>
              {user.voice_note_count > voiceNotes.length && <p className="text-xs text-gray-400">Showing the latest {voiceNotes.length} of {user.voice_note_count}. Export the CSV for all of them.</p>}
              {voiceNotes.map(note => (
                <div key={note.id} className="card p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{note.title || 'Untitled'}</p>
                    {note.is_favorite && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                    {note.is_permanent && <Lock className="w-4 h-4 text-purple-500 flex-shrink-0" title="Kept permanently" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span>{formatDuration(note.duration_seconds)}</span>
                    <span>{formatBytes(note.file_size_bytes)}</span>
                    <span className="flex items-center gap-1"><Play className="w-3 h-3" />{note.play_count || 0} plays</span>
                    <span>{note.source === 'ivr' ? 'Phone line' : 'App'}</span>
                    <span>{formatDate(note.created_at)}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Scheduled */}
      {activeTab === 'scheduled' && (
        <div className="space-y-3">
          {scheduled.length === 0 ? <div className="text-center py-12 text-gray-500">No scheduled messages</div> : scheduled.map(msg => (
            <div key={msg.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white mb-1 truncate">{msg.voice_note_title || (msg.source === 'ivr' ? 'Phone-line recording' : 'Voice note')}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span className="capitalize">{msg.delivery_method}</span>
                    <span>To {msg.recipient_email || msg.recipient_phone || '—'}</span>
                    <span>Send {formatDate(msg.scheduled_for, true)}</span>
                    {msg.delivered_at && <span>Delivered {formatDate(msg.delivered_at, true)}</span>}
                    {msg.source === 'ivr' && <span className="text-blue-500">Phone line</span>}
                  </div>
                  {msg.error_message && <p className="text-xs text-red-500 mt-1">{msg.error_message}</p>}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 capitalize ${DELIVERY[msg.delivery_status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                  {msg.delivery_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voice wills */}
      {activeTab === 'vault' && (
        <div className="space-y-3">
          {vault.length === 0 ? (
            <div className="text-center py-12 text-gray-500"><Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No voice wills</p></div>
          ) : vault.map(item => (
            <div key={item.id} className="card p-4">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-medium text-gray-900 dark:text-white">{item.title || 'Untitled will'}</p>
                {item.is_released && <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Released</span>}
                {item.admin_removed_at && <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Removed by admin</span>}
                {item.source === 'ivr' && <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Phone line</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                <span>Release: {item.release_condition === 'date' ? `on ${formatDate(item.release_date)}` : (item.release_condition || 'manual').replace(/_/g, ' ')}</span>
                {item.released_at && <span>Released {formatDate(item.released_at)}</span>}
                <span>Added {formatDate(item.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footprint */}
      {activeTab === 'footprint' && (
        footprintError ? <div className="text-center py-12 text-red-500">{footprintError}</div> : !footprint ? (
          <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Activity in the last 90 days</h3>
              {footprint.eventBreakdown.length === 0 ? <p className="text-sm text-gray-400">No activity recorded.</p> : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {footprint.eventBreakdown.map(({ event_type, count }) => (
                    <div key={event_type} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 first-letter:uppercase">{eventLabel(event_type)}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><LogIn className="w-4 h-4" /> Sign-ins</h3>
              {footprint.loginHistory.length === 0 ? <p className="text-sm text-gray-400">No sign-ins recorded in the last 90 days.</p> : (
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {footprint.loginHistory.map((l, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                      <span className="text-gray-400 text-xs w-40 flex-shrink-0">{formatDate(l.created_at, true)}</span>
                      <span className={`flex-shrink-0 ${/fail/i.test(l.event_type) ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>{l.event_type}</span>
                      <span className="text-xs text-gray-400 truncate">{[l.ip_address, l.user_agent].filter(Boolean).join(' · ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">By day</h3>
              {footprint.dailySummary.length === 0 ? <p className="text-gray-400 text-sm">No activity in the last 90 days</p> : (
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  <div className="flex items-center justify-between px-2 text-xs text-gray-400">
                    <span className="w-28">Day</span>
                    <span className="flex gap-4"><span>Plays</span><span>Recorded</span><span>Downloads</span><span>Scheduled</span></span>
                    <span>Total</span>
                  </div>
                  {footprint.dailySummary.map(d => (
                    <div key={d.date} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                      <span className="text-gray-500 dark:text-gray-400 w-28">{formatDate(d.date)}</span>
                      <span className="flex gap-4 text-xs text-gray-500"><span className="w-8 text-center">{d.plays}</span><span className="w-14 text-center">{d.recordings}</span><span className="w-16 text-center">{d.downloads}</span><span className="w-16 text-center">{d.schedules}</span></span>
                      <span className="text-gray-900 dark:text-white font-medium">{d.total_events}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {footprint.topPlayed.some(n => n.play_count > 0) && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Most played recordings</h3>
                <div className="space-y-2">
                  {footprint.topPlayed.filter(n => n.play_count > 0).map((note, i) => (
                    <div key={note.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <span className="text-lg font-bold text-gray-300 dark:text-gray-600 w-6">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{note.title || 'Untitled'}</p>
                        <p className="text-xs text-gray-400">{formatDuration(note.duration_seconds)} · last played {timeAgo(note.last_played)}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{note.play_count} <span className="text-xs font-normal text-gray-400">plays</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">All events ({footprint.events.length})</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {footprint.events.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 text-xs rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                    <span className="text-gray-400 w-40 flex-shrink-0">{formatDate(e.created_at, true)}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300 first-letter:uppercase">{eventLabel(e.event_type)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* Billing */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Plan and subscription</h3>
            <dl className="space-y-3">
              {[
                ['Plan', `${plan.label}${plan.plan ? ` (${plan.plan.price})` : ''}`],
                ['Subscription status', statusInfo(user.subscription_status).label],
                ['Billed through', user.stripe_managed ? 'Stripe' : user.subscription_tier !== 'LITE' ? 'Not billed (given by an admin)' : 'Free plan'],
                ['Stripe customer', user.stripe_customer_id || 'Not connected'],
                ['Stripe subscription', user.stripe_subscription_id || 'None'],
                ['Voice notes', `${user.voice_note_count} of ${user.voice_notes_limit ?? plan.plan?.voiceNotes ?? '—'}`],
                ['Contacts', `${user.contact_count} of ${user.contacts_limit ?? plan.plan?.contacts ?? '—'}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium text-right truncate">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 dark:text-gray-400">Storage</span>
                <span className="text-gray-900 dark:text-white font-medium">{formatBytes(user.storage_used_bytes)} of {storageLimitGb} GB</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className={`h-full ${storagePct > 90 ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: `${Math.max(storagePct, user.storage_used_bytes ? 1 : 0)}%` }} />
              </div>
            </div>
            {!user.stripe_customer_id && user.source === 'ivr' && (
              <div className="mt-4 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-xs text-orange-700 dark:text-orange-300">
                Signed up on the phone line and has no Stripe customer linked here. &ldquo;Re-sync from phone line&rdquo; pulls their Stripe details across.
              </div>
            )}
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payments</h3>
            {billing.length === 0 ? <p className="text-sm text-gray-400">No payments recorded.</p> : (
              <div className="space-y-2">
                {billing.map((b, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="text-gray-900 dark:text-white truncate">{b.description || 'Subscription payment'}</p>
                      <p className="text-xs text-gray-400">{formatDate(b.created_at)}</p>
                    </div>
                    <span className={`font-medium flex-shrink-0 ${b.status === 'failed' ? 'text-red-600' : 'text-green-600'}`}>
                      {b.status === 'failed' ? 'Failed ' : ''}${(b.amount_cents / 100).toFixed(2)} {(b.currency || 'usd').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ReasonDialog
        open={dialog === 'plan'}
        title="Change plan"
        message={<>Currently on {plan.label}. Their limits and the phone line update straight away. No charge is made.</>}
        confirmLabel="Change plan"
        extraValid={!!planChoice}
        onSubmit={submitPlan}
        onClose={() => setDialog(null)}
      >
        <div className="space-y-2">
          {PLANS.filter(p => p.id !== plan.plan?.id).map(p => (
            <label key={p.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer ${planChoice === p.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className="flex items-center gap-2">
                <input type="radio" name="plan" checked={planChoice === p.id} onChange={() => setPlanChoice(p.id)} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{p.label}</span>
                <span className="text-xs text-gray-400">{p.price}</span>
              </span>
              <span className="text-xs text-gray-500">{p.voiceNotes} notes · {p.contacts} contacts · {p.storageGb} GB</span>
            </label>
          ))}
        </div>
      </ReasonDialog>

      <ReasonDialog
        open={dialog === 'suspend'}
        title={user.is_suspended ? 'Reactivate account' : 'Suspend account'}
        message={user.is_suspended
          ? 'They\'ll be able to sign in and use the app and phone line again.'
          : 'They\'ll be signed out and blocked from the app, the admin console and the phone line. Their data and any Stripe subscription are left as they are.'}
        confirmLabel={user.is_suspended ? 'Reactivate' : 'Suspend'}
        danger={!user.is_suspended}
        required={!user.is_suspended}
        onSubmit={submitSuspend}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === 'impersonate'}
        title="View the app as this user"
        message={<>You&apos;ll see the app as <strong>{user.full_name || user.email}</strong> for 5 minutes. This is recorded in the audit log, and anything you do counts as them.</>}
        confirmLabel="Start"
        busy={busy}
        onConfirm={runImpersonate}
        onCancel={() => !busy && setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === 'resync'}
        title="Re-sync from the phone line"
        message="Replaces this account's plan, subscription status and Stripe IDs with what the phone-line system has for their number."
        confirmLabel="Re-sync"
        busy={busy}
        onConfirm={runResync}
        onCancel={() => !busy && setDialog(null)}
      />
    </div>
  );
}
