'use client';
// Super admin console. Deleting accounts is soft-only and lives on the admin Users page.
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import { toast } from '@/components/ui/Toast';
import {
  PLANS, planInfo, accountStatusInfo, timeAgo, formatDate, formatBytes, saveBlob,
  ConfirmDialog, ReasonDialog, actionLabel, eventLabel,
} from '@/components/admin/userShared';
import {
  Users, Search, Shield, AlertTriangle, CheckCircle, RefreshCw, ChevronLeft, ChevronRight,
  Eye, Edit, Ban, Mic, HardDrive, Download, XCircle, Activity, DollarSign, Server,
  ArrowRightLeft, Clock, Phone, CreditCard, Loader2, ChevronDown,
} from 'lucide-react';

const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const money = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const errorText = (err, fallback) => err?.data?.error || err?.message || fallback;

function Kpi({ label, value, sub, tone, icon: Icon }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <p className={`text-2xl font-bold stat-number ${tone || 'text-gray-900 dark:text-white'}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function Loading() {
  return <div className="flex items-center justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-brand-500" /></div>;
}

function LoadError({ message, onRetry }) {
  return (
    <div className="text-center py-12">
      <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-400 mb-3">{message}</p>
      <button onClick={onRetry} className="text-sm text-brand-600 hover:underline">Try again</button>
    </div>
  );
}

const TABS = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'dead-letters', label: 'Failed syncs', icon: AlertTriangle },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'sync-monitor', label: 'Sync monitor', icon: ArrowRightLeft },
  { id: 'system-health', label: 'System health', icon: Server },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
];

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [overview, setOverview] = useState(null);

  // Users tab
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [exporting, setExporting] = useState('');

  // Other tabs (loaded when first opened)
  const [deadLetters, setDeadLetters] = useState(null);
  const [syncHealth, setSyncHealth] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [tabErrors, setTabErrors] = useState({});
  const [checking, setChecking] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [expanded, setExpanded] = useState({});

  // Dialogs
  const [planTarget, setPlanTarget] = useState(null);
  const [planChoice, setPlanChoice] = useState('');
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [dismissTarget, setDismissTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ userId: '', slotNumber: '', contact: '', voiceMessage: '' });
  const [editBusy, setEditBusy] = useState(false);

  const requestId = useRef(0);

  const fetchUsers = useCallback(async (page = 1) => {
    const id = ++requestId.current;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await api.getSuperAdminUsers({ page, limit: 20, search: search.trim(), tier: tierFilter, status: statusFilter });
      if (id !== requestId.current) return;
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err) {
      if (id === requestId.current) setUsersError(errorText(err, 'Failed to load users'));
    } finally {
      if (id === requestId.current) setUsersLoading(false);
    }
  }, [search, tierFilter, statusFilter]);

  const fetchOverview = useCallback(async () => {
    try { setOverview((await api.getSuperAdminOverview()).data); }
    catch (err) { setTabErrors(e => ({ ...e, overview: errorText(err, 'Failed to load overview') })); }
  }, []);

  const loaders = {
    'dead-letters': async () => setDeadLetters((await api.getDeadLetters()).data.deadLetters),
    'sync-monitor': async () => setSyncHealth((await api.getSuperAdminSyncHealth()).data),
    'system-health': async (refresh) => setSystemHealth((await api.getSuperAdminSystemHealth(refresh)).data),
    revenue: async () => setRevenue((await api.getSuperAdminRevenue()).data),
    activity: fetchOverview,
  };
  const loadTab = async (tab, arg) => {
    if (!loaders[tab]) return;
    setTabErrors(e => ({ ...e, [tab]: null }));
    try { await loaders[tab](arg); }
    catch (err) { setTabErrors(e => ({ ...e, [tab]: errorText(err, 'Failed to load') })); }
  };

  useEffect(() => { fetchOverview(); loadTab('dead-letters'); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Search is debounced; filters apply straight away
  useEffect(() => {
    const t = setTimeout(() => fetchUsers(1), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchUsers, search]);

  useEffect(() => {
    if (activeTab === 'sync-monitor' && !syncHealth) loadTab('sync-monitor');
    if (activeTab === 'system-health' && !systemHealth) loadTab('system-health');
    if (activeTab === 'revenue' && !revenue) loadTab('revenue');
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshAll = () => {
    fetchOverview();
    fetchUsers(pagination.page);
    loadTab('dead-letters');
    if (activeTab === 'sync-monitor' || activeTab === 'system-health' || activeTab === 'revenue') loadTab(activeTab);
  };

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

  // ── Actions ──
  const openPlan = (user) => { setPlanChoice(''); setPlanTarget(user); };
  const submitPlan = async (reason) => {
    try {
      await api.updateUserTier(planTarget.id, planChoice, reason);
      toast.success(`Plan changed to ${planInfo(planChoice).label}`);
      fetchUsers(pagination.page);
      fetchOverview();
    } catch (err) {
      toast.error(errorText(err, 'Failed to change plan'));
      return false;
    }
  };

  const submitSuspend = async (reason) => {
    const suspend = !suspendTarget.is_suspended;
    try {
      await api.suspendUser(suspendTarget.id, suspend, reason || null);
      toast.success(suspend ? 'Account suspended' : 'Account reactivated');
      fetchUsers(pagination.page);
      fetchOverview();
    } catch (err) {
      toast.error(errorText(err, 'Failed to update account'));
      return false;
    }
  };

  const retrySync = async (item) => {
    setBusyId(item.id);
    try {
      await api.retrySyncItem(item.id);
      toast.success('Queued for retry');
      loadTab('dead-letters');
      fetchOverview();
    } catch (err) {
      toast.error(errorText(err, 'Failed to retry'));
    } finally {
      setBusyId(null);
    }
  };

  const submitDismiss = async (reason) => {
    try {
      await api.dismissSyncItem(dismissTarget.id, reason);
      toast.success('Dismissed');
      loadTab('dead-letters');
      fetchOverview();
    } catch (err) {
      toast.error(errorText(err, 'Failed to dismiss'));
      return false;
    }
  };

  const openEdit = (item) => {
    const p = item.payload || {};
    setEditForm({ userId: p.userId || '', slotNumber: p.slotNumber || '', contact: p.contact || '', voiceMessage: p.voiceMessage || '' });
    setEditTarget(item);
  };
  const slot = parseInt(editForm.slotNumber, 10);
  const editValid = !!editForm.userId.trim() && !!editForm.voiceMessage.trim() && slot >= 1 && slot <= 15;
  const submitEdit = async () => {
    if (!editValid) return;
    setEditBusy(true);
    try {
      await api.editRetrySyncItem(editTarget.id, { ...editForm, userId: editForm.userId.trim(), voiceMessage: editForm.voiceMessage.trim(), contact: editForm.contact.trim() });
      toast.success('Updated and queued for retry');
      setEditTarget(null);
      loadTab('dead-letters');
      fetchOverview();
    } catch (err) {
      toast.error(errorText(err, 'Failed to update'));
    } finally {
      setEditBusy(false);
    }
  };

  const u = overview?.users;
  const c = overview?.content;
  const s = overview?.sync;
  const deadCount = deadLetters?.length ?? s?.dead_count ?? 0;

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Accounts, phone-line sync, system health and revenue</p>
          </div>
        </div>
        <button onClick={refreshAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* KPI cards — customers only (admins and deleted accounts aren't counted) */}
      {tabErrors.overview && !overview ? (
        <div className="card p-4 mb-8 text-sm text-red-600">{tabErrors.overview}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Kpi icon={Users} label="Customers" value={u?.total_users} sub={u && `+${u.new_this_week} this week`} />
          <Kpi icon={Activity} label="Active in last 24h" value={u?.active_today} sub={u && `${u.suspended_users} suspended`} />
          <Kpi icon={CreditCard} label="On paid plans" value={u && u.essential_users + u.premium_users}
            sub={u && `${u.essential_users} Essential · ${u.premium_users} Premium`} />
          <Kpi icon={Mic} label="Voice notes" value={c?.total_voice_notes?.toLocaleString()} sub={c && `${formatBytes(c.total_storage_bytes)} stored`} />
          <Kpi icon={Clock} label="Scheduled messages" value={c?.total_scheduled?.toLocaleString()}
            sub={c && `${c.total_delivered} delivered · ${c.total_failed} failed`} />
          <Kpi icon={ArrowRightLeft} label="Failed phone-line syncs" value={s?.dead_count}
            tone={s?.dead_count > 0 ? 'text-red-600' : undefined} sub={s && `${s.pending_count} waiting to send`} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'dead-letters' && deadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">{deadCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Users ── */}
      {activeTab === 'users' && (
        <div>
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="search" placeholder="Search by name, email or phone..." value={search}
                onChange={e => setSearch(e.target.value)} className={`${inputClass} pl-9`} />
            </div>
            <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className={`${inputClass} md:w-40`}>
              <option value="">All plans</option>
              {PLANS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`${inputClass} md:w-44`}>
              <option value="">All accounts</option>
              <option value="active">Not suspended</option>
              <option value="suspended">Suspended</option>
              <option value="admins">Admins</option>
              <option value="deleted">Deleted</option>
            </select>
            <button onClick={() => download('users', '/users/export', 'suretalk-users.csv')} disabled={exporting === 'users'}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
              title="All current customers (not admins or deleted accounts)">
              {exporting === 'users' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export CSV
            </button>
          </div>

          {usersError ? <LoadError message={usersError} onRetry={() => fetchUsers(pagination.page)} /> : usersLoading && !users.length ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card p-4 h-20 skeleton" />)}</div>
          ) : (
            <div className={`space-y-3 ${usersLoading ? 'opacity-60' : ''}`}>
              {users.map(user => {
                const plan = planInfo(user.subscription_tier);
                const status = accountStatusInfo(user);
                const deleted = !!user.deleted_at;
                const protectedAccount = user.is_super_admin;
                return (
                  <div key={user.id} className={`card p-4 ${user.is_suspended || deleted ? 'border-red-200 dark:border-red-900' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${deleted ? 'bg-gray-400' : 'bg-gradient-to-br from-brand-500 to-accent-500'}`}>
                          <span className="text-white font-bold text-sm">{user.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">{user.full_name || 'Unknown'}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${plan.color}`}>{plan.label}</span>
                            {(user.is_suspended || deleted || status.label !== 'Active') && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{user.is_suspended && !deleted ? 'Suspended' : status.label}</span>
                            )}
                            {user.stripe_managed && <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Pays via Stripe</span>}
                            {user.is_super_admin ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">Super admin</span>
                            ) : user.is_admin && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">Admin</span>
                            )}
                            {user.source === 'ivr' && <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Phone line</span>}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}{user.phone ? ` · ${user.phone}` : ''}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1"><Mic className="w-3 h-3" />{user.voice_note_count} notes</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{user.contact_count} contacts</span>
                            <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{formatBytes(user.storage_used_bytes)}</span>
                            <span>Joined {formatDate(user.created_at)}</span>
                            <span>{deleted ? `Deleted ${formatDate(user.deleted_at)}` : `Last active ${timeAgo(user.last_active)}`}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={`/adminDashboard/super/users/${user.id}`} title="View full profile"
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Link>
                        {!deleted && (
                          <>
                            <button onClick={() => openPlan(user)} disabled={user.stripe_managed}
                              title={user.stripe_managed ? 'Pays through Stripe — change the plan in Stripe' : 'Change plan'}
                              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40">
                              Change plan
                            </button>
                            <button onClick={() => setSuspendTarget(user)} disabled={protectedAccount}
                              title={protectedAccount ? 'Super admin accounts can\'t be suspended' : user.is_suspended ? 'Reactivate account' : 'Suspend account'}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${user.is_suspended ? 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600' : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500'}`}>
                              {user.is_suspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {users.length === 0 && !usersLoading && <div className="text-center py-12 text-gray-500">No accounts match your filters.</div>}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button onClick={() => fetchUsers(pagination.page - 1)} disabled={pagination.page <= 1 || usersLoading}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} accounts)</span>
              <button onClick={() => fetchUsers(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages || usersLoading}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Failed syncs (dead letters) ── */}
      {activeTab === 'dead-letters' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Changes the app couldn&apos;t send to the phone line after every retry. Retry once the cause is fixed, or dismiss with a note if it no longer matters.
          </p>
          {tabErrors['dead-letters'] ? <LoadError message={tabErrors['dead-letters']} onRetry={() => loadTab('dead-letters')} />
            : !deadLetters ? <Loading /> : deadLetters.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No failed syncs. Everything reached the phone line.</p>
            </div>
          ) : deadLetters.map(item => {
            const p = item.payload || {};
            return (
              <div key={item.id} className="card p-4 border-red-200 dark:border-red-900">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        Failed {item.attempts} time{item.attempts === 1 ? '' : 's'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {item.user_id
                        ? <Link href={`/adminDashboard/super/users/${item.user_id}`} className="text-brand-600 hover:underline">{item.user_name || item.user_email}</Link>
                        : <span>{p.userId || 'Unknown account'}</span>}
                      {p.slotNumber && <span className="text-gray-400"> · slot {p.slotNumber}</span>}
                      {p.action && <span className="text-gray-400"> · {String(p.action)}</span>}
                    </p>
                    {item.error_message && <p className="text-sm text-red-500 mt-1 break-words">{item.error_message}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      Created {formatDate(item.created_at, true)} · last tried {item.last_attempt_at ? timeAgo(item.last_attempt_at) : 'never'}
                    </p>
                    <button onClick={() => setExpanded(e => ({ ...e, [item.id]: !e[item.id] }))}
                      className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                      <ChevronDown className={`w-3 h-3 transition-transform ${expanded[item.id] ? 'rotate-180' : ''}`} />
                      {expanded[item.id] ? 'Hide' : 'Show'} technical details
                    </button>
                    {expanded[item.id] && (
                      <pre className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-auto max-h-48">
                        {JSON.stringify(item.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.editable && (
                      <button onClick={() => openEdit(item)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                    )}
                    <button onClick={() => setDismissTarget(item)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                      <XCircle className="w-3 h-3" /> Dismiss
                    </button>
                    <button onClick={() => retrySync(item)} disabled={busyId === item.id}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-40">
                      <RefreshCw className={`w-3 h-3 ${busyId === item.id ? 'animate-spin' : ''}`} /> Retry
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Activity ── */}
      {activeTab === 'activity' && (
        !overview ? (tabErrors.overview ? <LoadError message={tabErrors.overview} onRetry={fetchOverview} /> : <Loading />) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Admin actions</h3>
              <p className="text-xs text-gray-400 mb-4">Latest 30 entries from the audit log</p>
              <div className="space-y-3">
                {overview.adminActions.length === 0 && <p className="text-sm text-gray-400">No admin actions yet.</p>}
                {overview.adminActions.map(a => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{a.admin_name || a.admin_email || 'An admin'}</span>{' '}
                        <span className="text-gray-600 dark:text-gray-300">{actionLabel(a.action).charAt(0).toLowerCase() + actionLabel(a.action).slice(1)}</span>
                        {(a.target_name || a.target_email) && <span className="text-gray-500"> — {a.target_name || a.target_email}</span>}
                      </p>
                      {a.new_value?.reason && <p className="text-xs text-gray-400 truncate">“{a.new_value.reason}”</p>}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0" title={formatDate(a.created_at, true)}>{timeAgo(a.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Customer activity</h3>
              <p className="text-xs text-gray-400 mb-4">Latest 30 recorded events</p>
              <div className="space-y-3">
                {overview.recentActivity.length === 0 && <p className="text-sm text-gray-400">No activity recorded yet.</p>}
                {overview.recentActivity.map((e, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                    <p className="text-sm text-gray-900 dark:text-white flex-1 min-w-0">
                      <Link href={`/adminDashboard/super/users/${e.user_id}`} className="font-medium hover:underline">{e.full_name || e.email}</Link>{' '}
                      <span className="text-gray-600 dark:text-gray-300">{eventLabel(e.event_type)}</span>
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0" title={formatDate(e.created_at, true)}>{timeAgo(e.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* ── Sync monitor ── */}
      {activeTab === 'sync-monitor' && (
        tabErrors['sync-monitor'] ? <LoadError message={tabErrors['sync-monitor']} onRetry={() => loadTab('sync-monitor')} /> : !syncHealth ? <Loading /> : (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">App → phone line</h3>
                <p className="text-xs text-gray-400">
                  Last successful send {syncHealth.appToIvr.lastSuccess ? timeAgo(syncHealth.appToIvr.lastSuccess) : 'never'} · {syncHealth.appToIvr.sent7d} sent in the last 7 days
                </p>
              </div>
              <div className="flex gap-2">
                {[30, 90].map(d => (
                  <button key={d} onClick={() => download(`sync-${d}`, `/export/sync-logs?days=${d}`, 'suretalk-sync-logs.csv')} disabled={!!exporting}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40">
                    {exporting === `sync-${d}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Export {d} days
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Kpi label="Delivered" value={syncHealth.appToIvr.sent.toLocaleString()} tone="text-green-600" />
              <Kpi label="Waiting / retrying" value={syncHealth.appToIvr.pending} tone={syncHealth.appToIvr.pending > 0 ? 'text-amber-600' : undefined} />
              <Kpi label="Failed" value={syncHealth.appToIvr.dead} tone={syncHealth.appToIvr.dead > 0 ? 'text-red-600' : undefined} />
              <Kpi label="Dismissed" value={syncHealth.appToIvr.dismissed} />
              <Kpi label="Success rate" value={syncHealth.appToIvr.successRate == null ? '—' : `${syncHealth.appToIvr.successRate}%`}
                tone={syncHealth.appToIvr.successRate != null && syncHealth.appToIvr.successRate < 95 ? 'text-amber-600' : undefined} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">By type</p>
                {Object.keys(syncHealth.appToIvr.byEvent).length === 0 ? <p className="text-sm text-gray-400">Nothing sent yet.</p> : (
                  <table className="w-full text-sm">
                    <thead><tr className="text-xs text-gray-400 text-left"><th className="pb-2 font-medium">Type</th><th className="pb-2 font-medium text-right">Delivered</th><th className="pb-2 font-medium text-right">Waiting</th><th className="pb-2 font-medium text-right">Failed</th></tr></thead>
                    <tbody>
                      {Object.entries(syncHealth.appToIvr.byEvent).map(([key, e]) => (
                        <tr key={key} className="border-t border-gray-100 dark:border-gray-800">
                          <td className="py-2 text-gray-700 dark:text-gray-300">{e.label}</td>
                          <td className="py-2 text-right text-green-600">{e.sent || 0}</td>
                          <td className="py-2 text-right text-amber-600">{e.pending || 0}</td>
                          <td className="py-2 text-right text-red-600">{e.dead || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="card p-5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent problems</p>
                {syncHealth.appToIvr.recentFailures.length === 0 ? <p className="text-sm text-gray-400">No recent failures.</p> : (
                  <div className="space-y-2">
                    {syncHealth.appToIvr.recentFailures.map(f => (
                      <div key={f.id} className="text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-700 dark:text-gray-300">{syncHealth.appToIvr.byEvent[f.event_type]?.label || f.event_type}</span>
                          <span className={`text-xs ${f.status === 'dead' ? 'text-red-600' : 'text-amber-600'}`}>{f.status === 'dead' ? 'Failed' : `Retrying (${f.attempts})`}</span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{f.error_message || 'No error message'} · {timeAgo(f.last_attempt_at || f.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"><Phone className="w-4 h-4" /> Phone line → app</p>
                <p className="text-xs text-gray-400">Last received {syncHealth.ivrToApp.lastReceived ? timeAgo(syncHealth.ivrToApp.lastReceived) : 'never'}</p>
              </div>
              {syncHealth.ivrToApp.breakdown.length === 0 ? <p className="text-sm text-gray-400">Nothing received from the phone line yet.</p> : (
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-gray-400 text-left"><th className="pb-2 font-medium">Type</th><th className="pb-2 font-medium text-right">Last 7 days</th><th className="pb-2 font-medium text-right">All time</th></tr></thead>
                  <tbody>
                    {syncHealth.ivrToApp.breakdown.map(r => (
                      <tr key={r.event_type} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="py-2 text-gray-700 dark:text-gray-300 capitalize">{r.label}</td>
                        <td className="py-2 text-right">{r.last_7_days}</td>
                        <td className="py-2 text-right">{r.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )
      )}

      {/* ── System health ── */}
      {activeTab === 'system-health' && (
        tabErrors['system-health'] ? <LoadError message={tabErrors['system-health']} onRetry={() => loadTab('system-health')} /> : !systemHealth ? <Loading /> : (() => {
          const overall = {
            operational: { label: 'All systems working', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
            degraded: { label: 'Working, but slow', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
            issues: { label: 'Something is down', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
          }[systemHealth.overall] || { label: systemHealth.overall, color: 'text-gray-600 border-gray-200' };
          const sch = systemHealth.scheduler;
          const hours = Math.floor(systemHealth.uptimeSeconds / 3600);
          return (
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 flex-wrap ${overall.color}`}>
                <div>
                  <p className="font-semibold">{overall.label}</p>
                  <p className="text-xs opacity-80">Checked {timeAgo(systemHealth.checkedAt)} · server up {hours >= 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${Math.floor((systemHealth.uptimeSeconds % 3600) / 60)}m`}</p>
                </div>
                <button disabled={checking} onClick={async () => { setChecking(true); await loadTab('system-health', true); setChecking(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/70 dark:bg-gray-900/40 text-sm font-medium text-gray-700 dark:text-gray-200 disabled:opacity-50">
                  {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Run check now
                </button>
              </div>
              <div className="card divide-y divide-gray-100 dark:divide-gray-800">
                {systemHealth.services.map(svc => (
                  <div key={svc.service} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{svc.service}</p>
                      {svc.error && <p className="text-xs text-red-500 truncate">{svc.error}</p>}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {svc.latency_ms != null && <span className="text-xs text-gray-400">{svc.latency_ms} ms</span>}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${svc.status === 'ok' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : svc.status === 'slow' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {svc.status === 'ok' ? 'Working' : svc.status === 'slow' ? 'Slow' : 'Down'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Kpi label="Messages waiting to send" value={sch.waiting} sub="App-scheduled (phone-line ones are sent by the phone system)" />
                <Kpi label="Overdue messages" value={sch.overdue} tone={sch.overdue > 0 ? 'text-red-600' : undefined} sub="Past their send time but not sent" />
                <Kpi label="Delivered in last 24h" value={sch.delivered_24h} sub={`${sch.failed} failed in total`} />
                <Kpi label="Phone-line sync backlog" value={systemHealth.sync.pending} tone={systemHealth.sync.dead > 0 ? 'text-red-600' : undefined} sub={`${systemHealth.sync.dead} failed`} />
              </div>
              <div className="card p-4 text-sm flex items-center justify-between flex-wrap gap-2">
                <span className="text-gray-500">Database</span>
                <span className="text-gray-900 dark:text-white">{systemHealth.database.version} · {formatBytes(systemHealth.database.sizeBytes)}</span>
              </div>
            </div>
          );
        })()
      )}

      {/* ── Revenue ── */}
      {activeTab === 'revenue' && (
        tabErrors.revenue ? <LoadError message={tabErrors.revenue} onRetry={() => loadTab('revenue')} /> : !revenue ? <Loading /> : (() => {
          const max = Math.max(1, ...revenue.monthly.map(m => m.revenue));
          return (
            <div className="space-y-6">
              <p className="text-xs text-gray-400">
                {revenue.source === 'stripe' ? 'Collected revenue is read live from Stripe.' : 'Stripe couldn\'t be reached — collected revenue comes from payments recorded in the app.'}
                {' '}Recurring revenue is an estimate: paying subscribers × list price (discounts and trials aren&apos;t reflected).
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <Kpi label="Collected this month" value={money(revenue.thisMonth)} />
                <Kpi label="Last month" value={money(revenue.lastMonth)} />
                <Kpi label="Est. monthly recurring" value={money(revenue.estimatedMrr)} />
                <Kpi label="Est. yearly recurring" value={money(revenue.estimatedArr)} />
                <Kpi label="Paying subscribers" value={revenue.payingUsers} sub="Active Stripe subscriptions" />
                <Kpi label="Failed payments (30d)" value={revenue.failedPayments30d} tone={revenue.failedPayments30d > 0 ? 'text-red-600' : undefined} />
              </div>

              <div className="card p-5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Collected per month</p>
                <div className="flex items-end gap-2 h-40">
                  {revenue.monthly.map(m => (
                    <div key={m.key} className="flex-1 flex flex-col items-center justify-end h-full min-w-0" title={`${m.month}: ${money(m.revenue)} (${m.transactions} payments)`}>
                      <span className="text-[10px] text-gray-400 mb-1 truncate">{m.revenue > 0 ? money(m.revenue) : ''}</span>
                      <div className="w-full rounded-t-md bg-gradient-to-t from-brand-500 to-accent-500" style={{ height: `${Math.max(2, (m.revenue / max) * 100)}%` }} />
                      <span className="text-xs text-gray-500 mt-1 truncate">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-5">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">By plan</p>
                  <table className="w-full text-sm">
                    <thead><tr className="text-xs text-gray-400 text-left"><th className="pb-2 font-medium">Plan</th><th className="pb-2 font-medium text-right">Customers</th><th className="pb-2 font-medium text-right">Paying</th><th className="pb-2 font-medium text-right">Est. / month</th></tr></thead>
                    <tbody>
                      {PLANS.map(p => {
                        const rows = revenue.byTier.filter(t => planInfo(t.tier).plan?.id === p.id);
                        const sum = (k) => rows.reduce((acc, r) => acc + (r[k] || 0), 0);
                        return (
                          <tr key={p.id} className="border-t border-gray-100 dark:border-gray-800">
                            <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${planInfo(p.id).color}`}>{p.label}</span></td>
                            <td className="py-2 text-right">{sum('users')}</td>
                            <td className="py-2 text-right">{p.id === 'LITE' ? '—' : sum('paying')}</td>
                            <td className="py-2 text-right font-medium">{p.id === 'LITE' ? '—' : money(sum('estimatedMrr'))}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-400 mt-3">Customers on a paid plan without a Stripe subscription (given the plan by an admin) aren&apos;t counted as paying.</p>
                </div>
                <div className="card p-5">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent payments</p>
                  {revenue.recentTransactions.length === 0 ? <p className="text-sm text-gray-400">No payments recorded yet.</p> : (
                    <div className="space-y-2">
                      {revenue.recentTransactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between gap-3 text-sm">
                          <div className="min-w-0">
                            <Link href={`/adminDashboard/super/users/${tx.user_id}`} className="text-gray-900 dark:text-white hover:underline truncate block">{tx.full_name || tx.email}</Link>
                            <p className="text-xs text-gray-400 truncate">{tx.description || 'Subscription payment'} · {formatDate(tx.created_at)}</p>
                          </div>
                          <span className={`font-medium flex-shrink-0 ${tx.status === 'failed' ? 'text-red-600' : 'text-green-600'}`}>
                            {tx.status === 'failed' ? 'Failed ' : ''}{money(tx.amount_cents / 100)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* ── Dialogs ── */}
      <ReasonDialog
        open={!!planTarget}
        title="Change plan"
        message={planTarget && <>For <strong>{planTarget.full_name || planTarget.email}</strong>, currently on {planInfo(planTarget.subscription_tier).label}. Their limits and the phone line update straight away. No charge is made.</>}
        confirmLabel="Change plan"
        extraValid={!!planChoice}
        onSubmit={submitPlan}
        onClose={() => setPlanTarget(null)}
      >
        <div className="space-y-2">
          {PLANS.filter(p => p.id !== planInfo(planTarget?.subscription_tier).plan?.id).map(p => (
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
        open={!!suspendTarget}
        title={suspendTarget?.is_suspended ? 'Reactivate account' : 'Suspend account'}
        message={suspendTarget && (suspendTarget.is_suspended
          ? <>Let <strong>{suspendTarget.full_name || suspendTarget.email}</strong> sign in and use the app and phone line again.</>
          : <><strong>{suspendTarget.full_name || suspendTarget.email}</strong> will be signed out and blocked from the app, the admin console and the phone line. Their data and any Stripe subscription are left as they are.</>)}
        confirmLabel={suspendTarget?.is_suspended ? 'Reactivate' : 'Suspend'}
        danger={!suspendTarget?.is_suspended}
        required={!suspendTarget?.is_suspended}
        onSubmit={submitSuspend}
        onClose={() => setSuspendTarget(null)}
      />

      <ReasonDialog
        open={!!dismissTarget}
        title="Dismiss failed sync"
        message={dismissTarget && <>Stop showing this <strong>{dismissTarget.label.toLowerCase()}</strong> item. It won&apos;t be sent to the phone line. Use this when it no longer matters or was fixed another way.</>}
        confirmLabel="Dismiss"
        placeholder="e.g. User re-recorded this slot on the phone line"
        onSubmit={submitDismiss}
        onClose={() => setDismissTarget(null)}
      />

      <ConfirmDialog
        open={!!editTarget}
        title="Edit and retry"
        message={editTarget && <>Fix the memory-slot details, then send again.{editTarget.error_message && <span className="block text-xs text-red-500 mt-1">Last error: {editTarget.error_message}</span>}</>}
        confirmLabel="Save and retry"
        busy={editBusy}
        confirmDisabled={!editValid}
        onConfirm={submitEdit}
        onCancel={() => !editBusy && setEditTarget(null)}
      >
        <div className="space-y-3">
          {[
            { key: 'userId', label: 'Phone number (account)', required: true, placeholder: '+2348012345678' },
            { key: 'slotNumber', label: 'Slot number (1–15)', required: true, placeholder: '1', type: 'number' },
            { key: 'contact', label: 'Contact phone', placeholder: 'Leave empty if none' },
            { key: 'voiceMessage', label: 'Recording link', required: true, placeholder: 'https://...' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              <input type={f.type || 'text'} min={f.type ? 1 : undefined} max={f.type ? 15 : undefined}
                value={editForm[f.key]} placeholder={f.placeholder} className={inputClass}
                onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
            </div>
          ))}
        </div>
      </ConfirmDialog>
    </div>
  );
}
