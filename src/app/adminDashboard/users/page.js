"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, Search, UserPlus, Download, Eye, Edit, Trash2, RefreshCw, AlertCircle,
  CheckSquare, Square, Mail, Phone, Shield, CreditCard, Activity, ChevronDown,
  UserX, UserCheck, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { api } from "@/utils/api";
import { toast } from "@/components/ui/Toast";
import {
  PLANS, planInfo, accountStatusInfo, timeAgo, formatDate, saveBlob, ConfirmDialog, useConfirm
} from "@/components/admin/userShared";

const FILTERS = [
  { id: "all", label: "All users", params: {} },
  { id: "LITE", label: "Lite", params: { tier: "LITE" } },
  { id: "ESSENTIAL", label: "Essential", params: { tier: "ESSENTIAL" } },
  { id: "PREMIUM", label: "Premium", params: { tier: "LEGACY_VAULT_PREMIUM" } },
  { id: "paying", label: "Paying (Stripe)", params: { status: "paying" } },
  { id: "active", label: "Active", params: { status: "active" } },
  { id: "inactive", label: "Inactive", params: { status: "inactive" } },
  { id: "suspended", label: "Deactivated", params: { status: "suspended" } },
  { id: "admins", label: "Admins", params: { type: "admins" } },
];
const PAGE_SIZE = 25;

export default function AdminUsers() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkTier, setBulkTier] = useState("ESSENTIAL");
  const [notifyUser, setNotifyUser] = useState(true);
  const confirm = useConfirm();
  // Read by dialog confirm handlers at click time (state captured when the dialog opened would be stale)
  const bulkTierRef = useRef("ESSENTIAL");
  const notifyRef = useRef(true);

  const filterParams = FILTERS.find(f => f.id === filter)?.params || {};

  // Search waits until typing pauses
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [filter, search]);

  const loadStats = useCallback(() => {
    api.getAdminUserStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE, ...filterParams, ...(search ? { search } : {}), t: Date.now() };
      const res = await api.getAdminUsers(params);
      setUsers(res.data.users || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
      setSelected([]);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load users");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter, search]);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const refreshAll = () => { loadUsers(); loadStats(); };

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const allSelected = users.length > 0 && selected.length === users.length;

  const doExport = async (format) => {
    setExporting(format);
    try {
      const { blob, filename } = await api.downloadUsersExport(format, { ...filterParams, search });
      saveBlob(blob, filename);
      toast.success(`Exported ${pagination.total.toLocaleString()} user${pagination.total === 1 ? '' : 's'}`, 'Export ready');
      setExportOpen(false);
    } catch (err) {
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  const reportBulk = (res, verb) => {
    const { affected, skipped } = res.data;
    if (affected) toast.success(`${verb} ${affected} user${affected === 1 ? '' : 's'}`, 'Done');
    if (skipped?.length) {
      const reasons = [...new Set(skipped.map(s => s.reason))].join(', ');
      toast.warning(`${skipped.length} skipped (${reasons})`, 'Some users skipped');
    }
    refreshAll();
  };

  const bulk = (action) => {
    setBulkOpen(false);
    const count = selected.length;
    const plural = `${count} user${count === 1 ? '' : 's'}`;
    const configs = {
      'change-plan': {
        title: `Change plan for ${plural}`,
        message: 'Users who pay through Stripe are skipped — their plan follows their subscription. Limits are set to the new plan\'s defaults.',
        confirmLabel: 'Change plan',
        planPicker: true,
        run: () => api.bulkUserAction(selected, 'change-plan', bulkTierRef.current).then(r => reportBulk(r, 'Updated plan for')),
      },
      deactivate: {
        title: `Deactivate ${plural}?`,
        message: 'They won\'t be able to sign in or use the app until reactivated. Their data and any Stripe billing stay as they are.',
        confirmLabel: 'Deactivate', danger: true,
        run: () => api.bulkUserAction(selected, 'deactivate').then(r => reportBulk(r, 'Deactivated')),
      },
      reactivate: {
        title: `Reactivate ${plural}?`,
        message: 'They\'ll be able to sign in and use the app again.',
        confirmLabel: 'Reactivate',
        run: () => api.bulkUserAction(selected, 'reactivate').then(r => reportBulk(r, 'Reactivated')),
      },
      delete: {
        title: `Delete ${plural}?`,
        message: 'Their accounts are closed and any Stripe subscriptions cancelled. Their data is kept on record but they lose access. Admin accounts are skipped. No goodbye emails are sent for bulk deletes.',
        confirmLabel: 'Delete', danger: true,
        run: () => api.bulkUserAction(selected, 'delete').then(r => reportBulk(r, 'Deleted')),
      },
    };
    const c = configs[action];
    confirm.open({
      ...c,
      onConfirm: async () => {
        try { await c.run(); } catch (err) { toast.error(err.message || 'Bulk action failed'); return true; }
      }
    });
  };

  const deleteOne = (user) => {
    setNotifyUser(true);
    notifyRef.current = true;
    confirm.open({
      title: `Delete ${user.full_name || user.email}?`,
      message: 'Their account is closed and any Stripe subscription cancelled. Their data is kept on record but they lose access.',
      confirmLabel: 'Delete user', danger: true, notifyOption: true,
      onConfirm: async () => {
        try {
          const res = await api.deleteUser(user.id, { notify: notifyRef.current });
          if (res.data?.stripeCancelled === false) toast.warning(res.message, 'Check Stripe');
          else toast.success(`${user.full_name || user.email} was deleted`, 'User deleted');
          refreshAll();
        } catch (err) {
          toast.error(err.message || 'Delete failed');
          return true;
        }
      }
    });
  };

  const premiumShare = stats?.total_users ? Math.round((stats.premium_users / stats.total_users) * 100) : 0;
  const kpis = [
    { label: "Total users", value: stats?.total_users, detail: stats ? `+${stats.new_users_30d} in the last 30 days` : '', icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Premium users", value: stats?.premium_users, detail: stats ? `${premiumShare}% of users` : '', icon: Shield, color: "from-purple-500 to-pink-500" },
    { label: "Paying subscribers", value: stats?.paying_users, detail: stats ? `≈ $${Number(stats.estimated_mrr).toLocaleString('en-US', { minimumFractionDigits: 2 })}/month at list prices` : '', icon: CreditCard, color: "from-green-500 to-emerald-500" },
    { label: "Active today", value: stats?.active_today, detail: stats ? `${stats.inactive_users} inactive or deactivated` : '', icon: Activity, color: "from-orange-500 to-red-500" },
  ];

  const from = pagination.total ? (pagination.page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(pagination.page * PAGE_SIZE, pagination.total);

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-white">User management</h1>
              {loading && <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Find users, change plans, and manage accounts.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <button onClick={() => setExportOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                <Download className="w-4 h-4" /> Export <ChevronDown className="w-4 h-4" />
              </button>
              {exportOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 p-2">
                    <p className="px-3 py-2 text-xs text-gray-500">
                      Exports the {pagination.total.toLocaleString()} user{pagination.total === 1 ? '' : 's'} matching the current filter{search ? ' and search' : ''}.
                    </p>
                    {[['csv', 'CSV', 'Excel, Google Sheets'], ['json', 'JSON', 'For developers']].map(([format, label, hint]) => (
                      <button key={format} onClick={() => doExport(format)} disabled={!!exporting}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                        <span>
                          <span className="font-medium text-gray-800 dark:text-white">{label}</span>
                          <span className="block text-xs text-gray-500">{hint}</span>
                        </span>
                        {exporting === format && <Loader2 className="w-4 h-4 animate-spin text-brand-500" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Link href="/adminDashboard/users/new"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all">
              <UserPlus className="w-4 h-4" /> Add user
            </Link>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{k.label}</p>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${k.color} text-white`}><Icon className="w-4 h-4" /></div>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {k.value === undefined ? <span className="inline-block w-16 h-7 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /> : Number(k.value).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2 min-h-[1rem]">{k.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="search" placeholder="Search by name, email, or phone" value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.id
                ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-gray-800 dark:text-white">{selected.length} selected</span>
            <button onClick={() => setSelected([])} className="text-sm text-blue-600 dark:text-blue-400">Clear</button>
          </div>
          <div className="relative">
            <button onClick={() => setBulkOpen(o => !o)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl">
              Bulk actions <ChevronDown className="w-4 h-4" />
            </button>
            {bulkOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setBulkOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 p-2">
                  {[
                    ['change-plan', CreditCard, 'Change plan'],
                    ['deactivate', UserX, 'Deactivate'],
                    ['reactivate', UserCheck, 'Reactivate'],
                    ['delete', Trash2, 'Delete'],
                  ].map(([action, Icon, label]) => (
                    <button key={action} onClick={() => bulk(action)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${action === 'delete' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {error ? (
          <div className="p-10 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700 dark:text-gray-300 mb-4">Couldn&apos;t load users ({error}).</p>
            <button onClick={loadUsers} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium">Try again</button>
          </div>
        ) : (
          <>
            <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-gray-800 text-left text-sm text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="py-4 px-6">
                      <button onClick={() => setSelected(allSelected ? [] : users.map(u => u.id))} disabled={!users.length}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Select all on this page">
                        {allSelected ? <CheckSquare className="w-4 h-4 text-brand-500" /> : <Square className="w-4 h-4 text-gray-400" />}
                      </button>
                    </th>
                    <th className="py-4 px-4 font-semibold">User</th>
                    <th className="py-4 px-4 font-semibold">Contact</th>
                    <th className="py-4 px-4 font-semibold">Plan</th>
                    <th className="py-4 px-4 font-semibold">Status</th>
                    <th className="py-4 px-4 font-semibold">Usage</th>
                    <th className="py-4 px-4 font-semibold">Joined</th>
                    <th className="py-4 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map(user => {
                    const plan = planInfo(user.subscription_tier);
                    const status = accountStatusInfo(user);
                    const isSel = selected.includes(user.id);
                    return (
                      <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isSel ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                        <td className="py-4 px-6">
                          <button onClick={() => toggle(user.id)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={`Select ${user.full_name || user.email}`}>
                            {isSel ? <CheckSquare className="w-4 h-4 text-brand-500" /> : <Square className="w-4 h-4 text-gray-400" />}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <Link href={`/adminDashboard/users/${user.id}`} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                              <span className="font-bold text-white text-sm">{(user.full_name || user.email || 'U').charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 dark:text-white group-hover:text-brand-600 truncate">
                                {user.full_name || 'No name'}
                                {user.is_admin && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">Admin</span>}
                              </p>
                              <p className="text-xs text-gray-500">Last active {timeAgo(user.last_active).toLowerCase()}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                          <p className="flex items-center gap-2"><Mail className="w-3 h-3 text-gray-400" />{user.email}</p>
                          <p className="flex items-center gap-2 mt-1"><Phone className="w-3 h-3 text-gray-400" />{user.phone || '—'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${plan.color}`}>{plan.label}</span>
                          {user.stripe_managed && <span className="block text-xs text-gray-500 mt-1">Pays via Stripe</span>}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-600 dark:text-gray-400">
                          <p>{user.note_count} voice notes</p>
                          <p>{user.contact_count} contacts</p>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatDate(user.created_at)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Link href={`/adminDashboard/users/${user.id}`} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="View" aria-label="View user">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link href={`/adminDashboard/users/${user.id}/edit`} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Edit" aria-label="Edit user">
                              <Edit className="w-4 h-4" />
                            </Link>
                            {!user.is_admin && (
                              <button onClick={() => deleteOne(user)} className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500" title="Delete" aria-label="Delete user">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!loading && users.length === 0 && (
              <div className="text-center py-16">
                <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">No users found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try a different search or filter.</p>
              </div>
            )}

            {pagination.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Showing {from.toLocaleString()}–{to.toLocaleString()} of {pagination.total.toLocaleString()}
                </span>
                {pagination.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40" aria-label="Previous page">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-gray-600 dark:text-gray-400">Page {page} of {pagination.totalPages}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40" aria-label="Next page">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog {...confirm.dialogProps}>
        {confirm.dialogProps.planPicker && (
          <select value={bulkTier} onChange={e => { setBulkTier(e.target.value); bulkTierRef.current = e.target.value; }} aria-label="New plan"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            {PLANS.map(p => <option key={p.id} value={p.id}>{p.label} — {p.contacts} contacts, {p.voiceNotes} voice notes, {p.storageGb} GB</option>)}
          </select>
        )}
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
