"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Clock, Search, Download, RefreshCw, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  AlertTriangle, Pause, Play, XCircle, RotateCcw, Phone, Mail, MessageSquare, X, Loader2, User, Eye, Calendar
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/utils/api";
import { toast } from "@/components/ui/Toast";
import { formatDate, timeAgo, saveBlob, ConfirmDialog, useConfirm } from "@/components/admin/userShared";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "scheduled", label: "Waiting to send" },
  { id: "paused", label: "Paused" },
  { id: "delivered", label: "Delivered" },
  { id: "failed", label: "Failed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "phone", label: "Phone line" },
];
const PAGE_SIZE = 25;

const STATUS = {
  scheduled: { label: 'Waiting to send', cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', icon: Clock },
  paused: { label: 'Paused', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', icon: Pause },
  delivered: { label: 'Delivered', cls: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', icon: CheckCircle },
  failed: { label: 'Failed', cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', icon: AlertCircle },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300', icon: XCircle },
};

function StatusBadge({ m }) {
  if (m.source === 'ivr' && m.status === 'scheduled') {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"><Phone className="w-3 h-3" /> Phone line</span>;
  }
  const s = STATUS[m.status] || { label: m.status, cls: 'bg-gray-100 dark:bg-gray-800 text-gray-600', icon: Clock };
  const Icon = s.icon;
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}><Icon className="w-3 h-3" /> {s.label}</span>;
}

const methodLabel = (method) => ({ phone: 'Call + SMS', email: 'Email', both: 'Call, SMS + email' }[method] || method || '—');
const MethodIcons = ({ method }) => (
  <span className="inline-flex items-center gap-1 text-gray-400">
    {(method === 'phone' || method === 'both') && <Phone className="w-3.5 h-3.5" />}
    {(method === 'email' || method === 'both') && <Mail className="w-3.5 h-3.5" />}
  </span>
);

// ── Details panel ────────────────────────────────────────────────────────────
function MessagePanel({ id, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const reasonRef = useRef('');
  const confirm = useConfirm();

  const load = useCallback(async () => {
    try { const r = await api.getAdminScheduledMessage(id); setData(r.data); setError(''); }
    catch (err) { setError(err.message || 'Could not load this message'); }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const run = async (action, okText) => {
    try {
      const r = await api.adminScheduledAction(id, action, action === 'cancel' ? reasonRef.current.trim() : undefined);
      toast.success(r.data.sendsWithinAMinute ? `${okText} Its time has passed, so it will go out within a minute.` : okText);
      await load();
      onChanged();
    } catch (err) {
      toast.error(err.message || 'Action failed');
      return true;
    }
  };

  const m = data?.message;
  const ask = (action) => {
    const configs = {
      pause: { title: 'Pause this message?', message: 'It won\'t be sent until you resume it.', confirmLabel: 'Pause', ok: 'Message paused.' },
      resume: { title: 'Resume this message?', message: m && new Date(m.scheduledFor) <= new Date() ? 'Its scheduled time has already passed, so it will be sent within a minute.' : `It will be sent on ${formatDate(m?.scheduledFor, true)}.`, confirmLabel: 'Resume', ok: 'Message resumed.' },
      retry: { title: 'Retry this message?', message: 'It gets 3 fresh delivery attempts. Fix the cause first (for example a wrong phone number in the contact), or it will fail again.', confirmLabel: 'Retry now', ok: 'Message queued for retry.' },
      cancel: { title: 'Cancel this message?', message: 'It will never be sent. The sender sees it as cancelled.', confirmLabel: 'Cancel message', danger: true, ok: 'Message cancelled.', needsReason: true },
    };
    const c = configs[action];
    if (c.needsReason) { setReason(''); reasonRef.current = ''; }
    confirm.open({
      ...c, kind: action,
      onConfirm: async () => {
        if (c.needsReason && reasonRef.current.trim().length < 3) { toast.warning('Give a reason for cancelling'); return true; }
        return run(action, c.ok);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}
        role="dialog" aria-modal="true" aria-label="Scheduled message details"
        className="relative w-full max-w-lg h-full overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
          <h2 className="font-display text-lg font-bold text-gray-800 dark:text-white">Scheduled message</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        {error ? <p className="p-6 text-red-600 dark:text-red-400">{error}</p> : !m ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
        ) : (
          <div className="p-6 space-y-5 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{m.title}</h3>
                <p className="text-gray-500 mt-0.5">{m.source === 'ivr' ? 'Scheduled by phone' : 'Scheduled in the app'} · {methodLabel(m.method)}</p>
              </div>
              <StatusBadge m={m} />
            </div>

            {m.source === 'ivr' && (
              <p className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                This message was scheduled by phone and is delivered by the phone line, so it can&apos;t be paused or cancelled here, and its delivery result isn&apos;t reported back yet.
              </p>
            )}

            {m.status === 'failed' && m.error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="font-medium text-red-800 dark:text-red-300 mb-1">Why it failed</p>
                <p className="text-red-700 dark:text-red-400 break-words">{m.error}</p>
              </div>
            )}

            <dl className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              {[
                ['From', <><Link href={`/adminDashboard/users/${m.userId}`} className="text-brand-600 dark:text-brand-400">{m.sender}</Link>{m.senderEmail && m.senderEmail !== m.sender ? <span className="block text-xs text-gray-500">{m.senderEmail}</span> : null}</>],
                ['To', <>{m.recipient}{[m.recipientPhone, m.recipientEmail].filter(Boolean).length ? <span className="block text-xs text-gray-500">{[m.recipientPhone, m.recipientEmail].filter(Boolean).join(' · ')}</span> : null}</>],
                ['Scheduled for', formatDate(m.scheduledFor, true)],
                m.deliveredAt && ['Delivered', formatDate(m.deliveredAt, true)],
                m.failedAt && ['Failed', formatDate(m.failedAt, true)],
                m.cancelledAt && ['Cancelled', formatDate(m.cancelledAt, true)],
                m.pausedAt && m.status === 'paused' && ['Paused', formatDate(m.pausedAt, true)],
                m.source !== 'ivr' && ['Attempts', `${m.attempts} of 3${m.lastAttemptAt ? ` · last ${timeAgo(m.lastAttemptAt).toLowerCase()}` : ''}`],
                m.status === 'delivered' && (m.method === 'phone' || m.method === 'both') && ['Call / SMS', `${m.callSent ? 'Call placed' : 'No call'} · ${m.smsSent ? 'SMS sent' : 'No SMS'}`],
                m.source !== 'ivr' && ['Listening link', m.linkOpens ? `Opened ${m.linkOpens}× · last ${timeAgo(m.lastOpened).toLowerCase()}` : (m.status === 'delivered' ? 'Not opened yet' : '—')],
              ].filter(Boolean).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="text-gray-500 flex-shrink-0">{label}</dt>
                  <dd className="text-right text-gray-800 dark:text-gray-200">{value}</dd>
                </div>
              ))}
            </dl>

            {m.customMessage && (
              <div>
                <p className="text-gray-500 mb-1">Message from the sender</p>
                <p className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200 whitespace-pre-line">{m.customMessage}</p>
              </div>
            )}

            {data.adminHistory.length > 0 && (
              <div>
                <p className="text-gray-500 mb-2">Admin actions</p>
                <ul className="space-y-1.5">
                  {data.adminHistory.map((h, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400">
                      {String(h.action).toLowerCase().replace(/_/g, ' ').replace(/ scheduled msg/, '')} by {h.admin_name || h.admin_email || 'an admin'} · {timeAgo(h.created_at).toLowerCase()}
                      {h.new_value?.reason ? ` — "${h.new_value.reason}"` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {m.source !== 'ivr' && (
              <div className="flex flex-wrap gap-3 pt-2">
                {m.status === 'scheduled' && <button onClick={() => ask('pause')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300"><Pause className="w-4 h-4" /> Pause</button>}
                {m.status === 'paused' && <button onClick={() => ask('resume')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 text-white font-medium"><Play className="w-4 h-4" /> Resume</button>}
                {m.status === 'failed' && <button onClick={() => ask('retry')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 text-white font-medium"><RotateCcw className="w-4 h-4" /> Retry</button>}
                {['scheduled', 'paused', 'failed'].includes(m.status) && <button onClick={() => ask('cancel')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium"><XCircle className="w-4 h-4" /> Cancel</button>}
              </div>
            )}
          </div>
        )}

        <ConfirmDialog {...confirm.dialogProps}>
          {confirm.dialogProps.kind === 'cancel' && (
            <div>
              <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason (required)</label>
              <textarea id="cancel-reason" rows={3} maxLength={1000} value={reason}
                onChange={e => { setReason(e.target.value); reasonRef.current = e.target.value; }}
                placeholder="e.g. Sender asked us to stop it"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
            </div>
          )}
        </ConfirmDialog>
      </motion.aside>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminScheduledMessages() {
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(null);

  useEffect(() => { const t = setTimeout(() => setSearch(searchInput.trim()), 400); return () => clearTimeout(t); }, [searchInput]);
  useEffect(() => { setPage(1); }, [filter, search]);

  const loadStats = useCallback(() => { api.getAdminScheduledStats().then(r => setStats(r.data)).catch(() => {}); }, []);
  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.getAdminScheduledMessages({ page, limit: PAGE_SIZE, status: filter, search });
      setMessages(r.data.messages || []);
      setPagination(r.data.pagination || { total: 0, totalPages: 1 });
      setError("");
    } catch (err) {
      setError(err.message || "Could not load scheduled messages");
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);
  useEffect(() => { loadMessages(); }, [loadMessages]);
  useEffect(() => { loadStats(); }, [loadStats]);
  const refresh = () => { loadMessages(); loadStats(); };

  const doExport = async (format) => {
    setExporting(format);
    try {
      const { blob, filename } = await api.downloadScheduledExport(format, { status: filter, search });
      saveBlob(blob, filename);
      toast.success(`Exported ${pagination.total.toLocaleString()} message${pagination.total === 1 ? '' : 's'}`, 'Export ready');
      setExportOpen(false);
    } catch (err) {
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  const kpis = [
    { label: "Waiting to send", value: stats?.waiting, detail: stats ? (stats.overdue ? `${stats.overdue} past their time` : `${stats.paused} paused`) : '', icon: Clock, color: "from-blue-500 to-cyan-500", filter: "scheduled" },
    { label: "Delivered (7 days)", value: stats?.delivered_7d, detail: stats?.phone_line ? `Phone-line messages not counted (${stats.phone_line})` : '', icon: CheckCircle, color: "from-green-500 to-emerald-500", filter: "delivered" },
    { label: "Failed", value: stats?.failed_total, detail: stats ? `${stats.failed_7d} in the last 7 days` : '', icon: AlertCircle, color: "from-red-500 to-pink-500", filter: "failed", alert: stats?.failed_total > 0 },
    { label: "Success rate (7 days)", value: stats ? (stats.success_rate_7d === null ? '—' : `${stats.success_rate_7d}%`) : undefined, detail: stats ? (stats.success_rate_7d === null ? 'Nothing sent yet' : 'Delivered ÷ (delivered + failed)') : '', icon: MessageSquare, color: "from-purple-500 to-indigo-500" },
  ];
  const chartData = (stats?.daily || []).map(d => ({ ...d, label: new Date(d.day).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) }));

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500"><Clock className="w-6 h-6 text-white" /></div>
              <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-white">Scheduled messages</h1>
              {loading && <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Track deliveries, fix failures, and pause or cancel messages.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button onClick={() => setExportOpen(o => !o)} className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20">
                <Download className="w-4 h-4" /> Export <ChevronDown className="w-4 h-4" />
              </button>
              {exportOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setExportOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 p-2">
                    <p className="px-3 py-2 text-xs text-gray-500">Exports the {pagination.total.toLocaleString()} message{pagination.total === 1 ? '' : 's'} matching the current filter{search ? ' and search' : ''}.</p>
                    {[['csv', 'CSV', 'Excel, Google Sheets'], ['json', 'JSON', 'For developers']].map(([f, label, hint]) => (
                      <button key={f} onClick={() => doExport(f)} disabled={!!exporting} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                        <span><span className="font-medium text-gray-800 dark:text-white">{label}</span><span className="block text-xs text-gray-500">{hint}</span></span>
                        {exporting === f && <Loader2 className="w-4 h-4 animate-spin text-brand-500" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {stats?.failed_total > 0 && filter !== 'failed' && (
        <button onClick={() => setFilter('failed')} className="w-full mb-6 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 flex items-center gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-800 dark:text-red-300"><strong>{stats.failed_total} message{stats.failed_total === 1 ? '' : 's'} failed to send.</strong> Open one to see why, fix the cause, then retry or cancel it.</span>
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="grid grid-cols-2 gap-4">
          {kpis.map(k => {
            const Icon = k.icon;
            const Tag = k.filter ? 'button' : 'div';
            return (
              <Tag key={k.label} {...(k.filter ? { onClick: () => setFilter(k.filter) } : {})}
                className={`glass rounded-xl p-4 text-left ${k.filter ? 'hover:shadow-lg transition-all' : ''} ${filter === k.filter ? 'ring-2 ring-brand-500' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{k.label}</p>
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${k.color} text-white`}><Icon className="w-3.5 h-3.5" /></div>
                </div>
                <p className={`text-2xl font-bold ${k.alert ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
                  {k.value === undefined ? <span className="inline-block w-10 h-7 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /> : typeof k.value === 'number' ? k.value.toLocaleString() : k.value}
                </p>
                <p className="text-xs text-gray-500 mt-1 min-h-[1rem]">{k.detail}</p>
              </Tag>
            );
          })}
        </div>
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-gray-800 dark:text-white">Deliveries, last 7 days</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">App-scheduled messages delivered vs failed per day</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> Delivered</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-red-500" /> Failed</span>
            </div>
          </div>
          <div className="h-56">
            {chartData.some(d => d.delivered || d.failed) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" strokeOpacity={0.25} vertical={false} />
                  <XAxis dataKey="label" stroke="#9CA3AF" tickLine={false} />
                  <YAxis stroke="#9CA3AF" tickLine={false} allowDecimals={false} width={30} />
                  <Tooltip cursor={{ fill: 'rgba(156,163,175,0.1)' }} contentStyle={{ borderRadius: '0.75rem' }} />
                  <Bar dataKey="delivered" name="Delivered" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="failed" name="Failed" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">No deliveries in the last 7 days</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="search" placeholder="Search by sender, recipient, phone, email, or voice note" value={searchInput} onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.id ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {error ? (
          <div className="p-10 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700 dark:text-gray-300 mb-4">Couldn&apos;t load scheduled messages ({error}).</p>
            <button onClick={loadMessages} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium">Try again</button>
          </div>
        ) : (
          <>
            <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="py-4 px-6 font-semibold">Message</th>
                    <th className="py-4 px-4 font-semibold">From</th>
                    <th className="py-4 px-4 font-semibold">Scheduled for</th>
                    <th className="py-4 px-4 font-semibold">Status</th>
                    <th className="py-4 px-4 font-semibold"><span className="sr-only">Details</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {messages.map(m => (
                    <tr key={m.id} onClick={() => setOpenId(m.id)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-800 dark:text-white flex items-center gap-2">{m.title} <MethodIcons method={m.method} /></p>
                        <p className="text-gray-500 text-xs mt-0.5">To {m.recipient}</p>
                      </td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300"><span className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-gray-400" />{m.sender}</span></td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-400" />{formatDate(m.scheduledFor, true)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge m={m} />
                        {m.status === 'failed' && m.error && <p className="text-xs text-red-500 mt-1 max-w-[14rem] truncate" title={m.error}>{m.error}</p>}
                        {m.status === 'scheduled' && m.source !== 'ivr' && m.attempts > 0 && <p className="text-xs text-amber-600 mt-1">Retrying · {m.attempts} of 3 tries</p>}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button onClick={(e) => { e.stopPropagation(); setOpenId(m.id); }} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="View details"><Eye className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && messages.length === 0 && (
              <div className="text-center py-16">
                <Clock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">No messages here</h3>
                <p className="text-gray-600 dark:text-gray-400">{search ? 'Try a different search.' : 'Nothing matches this filter.'}</p>
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                <span className="text-gray-600 dark:text-gray-400">{pagination.total.toLocaleString()} messages</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-gray-600 dark:text-gray-400">Page {page} of {pagination.totalPages}</span>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40" aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {openId && <MessagePanel key={openId} id={openId} onClose={() => setOpenId(null)} onChanged={refresh} />}
      </AnimatePresence>
    </div>
  );
}
