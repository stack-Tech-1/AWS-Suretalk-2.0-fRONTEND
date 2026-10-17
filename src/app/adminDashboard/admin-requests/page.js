"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, Search, RefreshCw, Download, Clock, CheckCircle, XCircle, Shield, AlertCircle, X,
  Mail, Phone, Briefcase, Trash2, Loader2, Lock, UserCheck, UserX
} from "lucide-react";
import { api } from "@/utils/api";
import { toast } from "@/components/ui/Toast";
import { formatDate, timeAgo, saveBlob, ConfirmDialog, useConfirm } from "@/components/admin/userShared";

const FILTERS = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];
const STATUS = {
  pending: { label: 'Pending', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', icon: Clock },
  approved: { label: 'Approved', cls: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', icon: CheckCircle },
  rejected: { label: 'Rejected', cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', icon: XCircle },
};
const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.pending;
  const Icon = s.icon;
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}><Icon className="w-3 h-3" /> {s.label}</span>;
};

const csvCell = (v) => {
  let t = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
};

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const rejectReasonRef = useRef("");
  const confirm = useConfirm();

  useEffect(() => { const t = setTimeout(() => setSearch(searchInput.trim()), 400); return () => clearTimeout(t); }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, st] = await Promise.all([
        api.getAdminRequests({ status: filter, search }),
        api.getAdminRequestStats(),
      ]);
      setRequests(list.data.requests || []);
      setStats(st.data);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load requests");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);
  useEffect(() => { load(); }, [load]);

  const canDecide = !!stats?.canDecide;

  const after = async (fn, okText) => {
    try { await fn(); toast.success(okText); setOpen(null); await load(); }
    catch (err) { toast.error(err.message || 'Action failed'); return true; }
  };

  const approve = (r) => confirm.open({
    title: `Give ${r.full_name} admin access?`,
    message: <>They&apos;ll be able to see and change every user&apos;s data, including voice wills. Only approve people you know. They&apos;ll get an email saying they can sign in.</>,
    confirmLabel: 'Approve',
    onConfirm: () => after(() => api.approveAdminRequest(r.id), `${r.full_name} can now sign in as an admin`),
  });

  const reject = (r) => {
    setRejectReason(''); rejectReasonRef.current = '';
    confirm.open({
      kind: 'reject',
      title: `Reject ${r.full_name}'s request?`,
      message: 'They\'ll get an email saying their request wasn\'t approved, with your reason if you give one.',
      confirmLabel: 'Reject', danger: true,
      onConfirm: () => after(() => api.rejectAdminRequest(r.id, rejectReasonRef.current.trim()), 'Request rejected'),
    });
  };

  const remove = (r) => confirm.open({
    title: `Delete ${r.full_name}'s application?`,
    message: 'The application and its account are removed, so this email address can apply or sign up again. This is recorded in the audit log.',
    confirmLabel: 'Delete', danger: true,
    onConfirm: () => after(() => api.deleteAdminRequest(r.id), 'Application deleted'),
  });

  const exportCsv = () => {
    const headers = ['Name', 'Email', 'Phone', 'Department', 'Reason', 'Status', 'Applied', 'Decided by', 'Decided at', 'Rejection reason'];
    const rows = requests.map(r => [
      r.full_name, r.email, r.phone, r.department, r.reason, r.status,
      r.created_at && new Date(r.created_at).toISOString().slice(0, 10),
      r.approved_by_name || r.approved_by_email || r.rejected_by_name || r.rejected_by_email || '',
      (r.approved_at || r.rejected_at) && new Date(r.approved_at || r.rejected_at).toISOString().slice(0, 10),
      r.rejection_notes,
    ]);
    const csv = [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
    saveBlob(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), `suretalk-admin-requests-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Exported ${requests.length} request${requests.length === 1 ? '' : 's'}`);
  };

  const cards = [
    { label: "Waiting for a decision", value: stats?.pending, icon: Clock, color: "from-amber-500 to-orange-500", f: "pending" },
    { label: "Approved", value: stats?.approved, icon: CheckCircle, color: "from-green-500 to-emerald-500", f: "approved" },
    { label: "Rejected", value: stats?.rejected, icon: XCircle, color: "from-red-500 to-pink-500", f: "rejected" },
    { label: "Average response", value: stats ? (stats.avgResponseHours === null ? '—' : stats.avgResponseHours < 48 ? `${stats.avgResponseHours} h` : `${Math.round(stats.avgResponseHours / 24)} days`) : undefined, icon: RefreshCw, color: "from-blue-500 to-cyan-500" },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500"><ClipboardList className="w-6 h-6 text-white" /></div>
              <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-white">Admin requests</h1>
              {loading && <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />}
            </div>
            <p className="text-gray-600 dark:text-gray-400">People asking for access to the admin console.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={exportCsv} disabled={!requests.length} className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 disabled:opacity-40">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {stats && !canDecide && (
        <div className="mb-6 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
          <Lock className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          Only super admins can approve or reject requests. You can see them here.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(k => {
          const Icon = k.icon;
          const Tag = k.f ? 'button' : 'div';
          return (
            <Tag key={k.label} {...(k.f ? { onClick: () => setFilter(k.f) } : {})}
              className={`glass rounded-xl p-4 text-left ${k.f ? 'hover:shadow-lg transition-all' : ''} ${filter === k.f ? 'ring-2 ring-brand-500' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">{k.label}</p>
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${k.color} text-white`}><Icon className="w-3.5 h-3.5" /></div>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {k.value === undefined ? <span className="inline-block w-10 h-7 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /> : typeof k.value === 'number' ? k.value.toLocaleString() : k.value}
              </p>
            </Tag>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="search" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search by name, email, phone, or department"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f.id ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="glass rounded-2xl p-10 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 dark:text-gray-300 mb-4">Couldn&apos;t load requests ({error}).</p>
          <button onClick={load} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium">Try again</button>
        </div>
      ) : (
        <div className={`space-y-3 ${loading ? 'opacity-60' : ''}`}>
          {requests.map(r => (
            <button key={r.id} onClick={() => setOpen(r)} className="w-full glass rounded-2xl p-5 text-left hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{r.full_name}</h3>
                    <StatusBadge status={r.status} />
                    {r.is_super_admin && <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">Super admin</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{r.email}{r.department ? ` · ${r.department}` : ''}</p>
                  {r.reason && <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">&ldquo;{r.reason}&rdquo;</p>}
                </div>
                <p className="text-xs text-gray-500 flex-shrink-0">Applied {timeAgo(r.created_at).toLowerCase()}</p>
              </div>
            </button>
          ))}
          {!loading && requests.length === 0 && (
            <div className="text-center py-16">
              <ClipboardList className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{filter === 'pending' ? 'No requests waiting' : 'Nothing here'}</h3>
              <p className="text-gray-600 dark:text-gray-400">{filter === 'pending' ? 'New requests will appear here, and super admins get an email.' : 'Try another filter or search.'}</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setOpen(null)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}
              role="dialog" aria-modal="true" aria-label="Admin request" className="relative w-full max-w-lg h-full overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
                <h2 className="font-display text-lg font-bold text-gray-800 dark:text-white">Admin request</h2>
                <button onClick={() => setOpen(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5 text-sm">
                <div>
                  <div className="flex items-center gap-2 flex-wrap"><h3 className="text-xl font-bold text-gray-800 dark:text-white">{open.full_name}</h3><StatusBadge status={open.status} /></div>
                  <p className="text-gray-500 mt-1">Applied {formatDate(open.created_at, true)}</p>
                </div>
                <dl className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                  {[[Mail, 'Email', open.email], [Phone, 'Phone', open.phone || '—'], [Briefcase, 'Department', open.department || '—']].map(([Icon, label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <dt className="text-gray-500 flex items-center gap-2"><Icon className="w-4 h-4" /> {label}</dt>
                      <dd className="text-gray-800 dark:text-gray-200 text-right break-all">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <p className="text-gray-500 mb-1">Why they need access</p>
                  <p className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200 whitespace-pre-line">{open.reason || 'No reason given'}</p>
                </div>
                {open.status !== 'pending' && (
                  <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300">
                      {open.status === 'approved' ? 'Approved' : 'Rejected'} {formatDate(open.approved_at || open.rejected_at, true)}
                      {(open.approved_by_name || open.rejected_by_name || open.approved_by_email || open.rejected_by_email) && <> by {open.approved_by_name || open.rejected_by_name || open.approved_by_email || open.rejected_by_email}</>}
                    </p>
                    {open.rejection_notes && <p className="text-gray-600 dark:text-gray-400 mt-1">Reason: {open.rejection_notes}</p>}
                  </div>
                )}

                {canDecide ? (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {open.status === 'pending' && <>
                      <button onClick={() => approve(open)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium"><UserCheck className="w-4 h-4" /> Approve</button>
                      <button onClick={() => reject(open)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium"><UserX className="w-4 h-4" /> Reject</button>
                    </>}
                    {open.status !== 'approved' && !open.is_super_admin && (
                      <button onClick={() => remove(open)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium"><Trash2 className="w-4 h-4" /> Delete application</button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 flex items-center gap-2"><Shield className="w-4 h-4" /> A super admin needs to decide on this request.</p>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog {...confirm.dialogProps}>
        {confirm.dialogProps.kind === 'reject' && (
          <div>
            <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason (optional, sent to them)</label>
            <textarea id="reject-reason" rows={3} maxLength={1000} value={rejectReason}
              onChange={e => { setRejectReason(e.target.value); rejectReasonRef.current = e.target.value; }}
              placeholder="e.g. We couldn't verify you work with SureTalk"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
