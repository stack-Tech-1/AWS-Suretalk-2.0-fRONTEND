"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FileText, Search, RefreshCw, Download, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, AlertCircle,
  Info, Bug, Shield, X, Loader2, User, Globe, Monitor, Trash2, Database
} from "lucide-react";
import { api } from "@/utils/api";
import { toast } from "@/components/ui/Toast";
import { formatBytes, formatDate, saveBlob, ConfirmDialog, useConfirm } from "@/components/admin/userShared";

const TIMEFRAMES = [
  { id: "1h", label: "Last hour", ms: 3600e3 },
  { id: "24h", label: "24 hours", ms: 86400e3 },
  { id: "7d", label: "7 days", ms: 7 * 86400e3 },
  { id: "30d", label: "30 days", ms: 30 * 86400e3 },
  { id: "all", label: "All time", ms: null },
];
const LEVELS = [
  { id: "all", label: "All levels" },
  { id: "error", label: "Errors" },
  { id: "warning", label: "Warnings" },
  { id: "info", label: "Info" },
];
const PAGE_SIZE = 50;

const LEVEL_STYLE = {
  error: { cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', icon: AlertCircle, label: 'Error' },
  warning: { cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', icon: AlertTriangle, label: 'Warning' },
  info: { cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', icon: Info, label: 'Info' },
  debug: { cls: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400', icon: Bug, label: 'Debug' },
};
const LevelBadge = ({ level }) => {
  const s = LEVEL_STYLE[level] || LEVEL_STYLE.debug;
  const Icon = s.icon;
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}><Icon className="w-3 h-3" /> {s.label}</span>;
};

const shortDevice = (ua) => {
  if (!ua) return null;
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : /okhttp|Dart|axios|node/i.test(ua) ? 'App / server' : 'Browser';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
  return os ? `${browser} on ${os}` : browser;
};

const hasDetails = (m) => m && typeof m === 'object' && Object.keys(m).length > 0;

function LogPanel({ log, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}
        role="dialog" aria-modal="true" aria-label="Log details" className="relative w-full max-w-lg h-full overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
          <h2 className="font-display text-lg font-bold text-gray-800 dark:text-white">Log entry</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5 text-sm">
          <div className="flex items-center gap-2"><LevelBadge level={log.level} /><span className="text-gray-500">{log.service}</span></div>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{log.message}</p>
          <dl className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {[
              ['When', `${formatDate(log.created_at, true)} (${new Date(log.created_at).toISOString().replace('T', ' ').slice(0, 19)} UTC)`],
              ['User', log.user_id ? <Link href={`/adminDashboard/users/${log.user_id}`} className="text-brand-600 dark:text-brand-400">{log.user_name || log.user_email}</Link> : 'System'],
              log.ip_address && ['IP address', <code key="ip">{log.ip_address}</code>],
              log.user_agent && ['Device', <span key="ua" title={log.user_agent}>{shortDevice(log.user_agent)}</span>],
            ].filter(Boolean).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-4 py-2.5"><dt className="text-gray-500">{label}</dt><dd className="text-right text-gray-800 dark:text-gray-200 break-all">{value}</dd></div>
            ))}
          </dl>
          {hasDetails(log.metadata) && (
            <div>
              <p className="text-gray-500 mb-2">Details</p>
              <dl className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-4 space-y-2">
                {Object.entries(log.metadata).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-3">
                    <dt className="text-gray-500 break-words">{k}</dt>
                    <dd className="col-span-2 text-gray-800 dark:text-gray-200 break-all font-mono text-xs">{typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {log.user_agent && <p className="text-xs text-gray-400 break-all">{log.user_agent}</p>}
          <p className="text-xs text-gray-400">Log ID {log.id}</p>
        </div>
      </motion.aside>
    </div>
  );
}

export default function SystemLogs() {
  const [timeframe, setTimeframe] = useState("24h");
  const [level, setLevel] = useState("all");
  const [securityOnly, setSecurityOnly] = useState(false);
  const [service, setService] = useState("all");
  const [services, setServices] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openLog, setOpenLog] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const confirm = useConfirm();

  useEffect(() => { const t = setTimeout(() => setSearch(searchInput.trim()), 400); return () => clearTimeout(t); }, [searchInput]);
  useEffect(() => { setPage(1); }, [timeframe, level, securityOnly, service, search]);
  useEffect(() => { api.getAdminLogServices().then(r => setServices(r.data || [])).catch(() => {}); }, []);

  // Fixed for one load so the list and the counts use the same time window
  const filters = useCallback(() => {
    const tf = TIMEFRAMES.find(t => t.id === timeframe);
    return {
      ...(tf?.ms ? { startDate: new Date(Date.now() - tf.ms).toISOString() } : {}),
      ...(securityOnly ? { category: 'security' } : {}),
      ...(service !== 'all' ? { service } : {}),
      ...(search ? { search } : {}),
    };
  }, [timeframe, securityOnly, service, search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const f = filters();
      try {
        const [list, sum] = await Promise.all([
          api.getAdminLogs({ ...f, ...(level !== 'all' ? { level } : {}), page, limit: PAGE_SIZE }),
          api.getAdminLogSummary(f),
        ]);
        if (cancelled) return;
        setLogs(list.data.logs || []);
        setPagination(list.data.pagination || { total: 0, totalPages: 1 });
        setSummary(sum.data);
        setError("");
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load logs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [filters, level, page, reloadKey]);

  const refresh = () => setReloadKey(k => k + 1);

  const doExport = async (format) => {
    setExporting(format);
    try {
      const { blob, filename } = await api.downloadLogsExport(format, { ...filters(), ...(level !== 'all' ? { level } : {}) });
      saveBlob(blob, filename);
      toast.success(`Exported ${pagination.total.toLocaleString()} log entr${pagination.total === 1 ? 'y' : 'ies'}`, 'Export ready');
      setExportOpen(false);
    } catch (err) {
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  const ret = summary?.retention;
  const clearOld = () => confirm.open({
    title: 'Clear logs past the retention period?',
    message: ret ? `This permanently deletes ${ret.clearableNow.toLocaleString()} log entr${ret.clearableNow === 1 ? 'y' : 'ies'}: routine info logs older than 1 year, and anything older than 3 years. Warnings, errors and security events younger than 3 years are kept.` : '',
    confirmLabel: 'Clear old logs', danger: true,
    confirmDisabled: !ret?.clearableNow,
    onConfirm: async () => {
      try {
        const r = await api.clearOldLogs();
        toast.success(`Deleted ${r.data.deleted.toLocaleString()} old log entr${r.data.deleted === 1 ? 'y' : 'ies'}`, 'Logs cleared');
        refresh();
      } catch (err) {
        toast.error(err.message || 'Could not clear logs');
        return true;
      }
    }
  });

  const c = summary?.counts;
  const cards = [
    { label: "Total in range", value: c?.total, icon: FileText, color: "from-gray-500 to-gray-600", onClick: () => { setLevel('all'); setSecurityOnly(false); }, active: level === 'all' && !securityOnly },
    { label: "Errors", value: c?.error, icon: AlertCircle, color: "from-red-500 to-pink-500", onClick: () => { setLevel('error'); setSecurityOnly(false); }, active: level === 'error' && !securityOnly },
    { label: "Warnings", value: c?.warning, icon: AlertTriangle, color: "from-amber-500 to-orange-500", onClick: () => { setLevel('warning'); setSecurityOnly(false); }, active: level === 'warning' && !securityOnly },
    { label: "Security events", value: c?.security, icon: Shield, color: "from-purple-500 to-indigo-500", onClick: () => { setLevel('all'); setSecurityOnly(true); }, active: securityOnly, hint: 'Sign-ins, admin actions, settings, wills and account changes' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700"><FileText className="w-6 h-6 text-white" /></div>
              <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-white">System logs</h1>
              {loading && <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Everything the app records: sign-ins, errors, payments and account changes. Admin actions are in the{' '}
              <Link href="/adminDashboard/security" className="text-brand-600 dark:text-brand-400 font-medium">audit log</Link>.
            </p>
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
                    <p className="px-3 py-2 text-xs text-gray-500">Exports the {pagination.total.toLocaleString()} entr{pagination.total === 1 ? 'y' : 'ies'} matching the current filters.</p>
                    {[['csv', 'CSV', 'Excel, Google Sheets'], ['json', 'JSON', 'For developers']].map(([f, label, hint]) => (
                      <button key={f} onClick={() => doExport(f)} disabled={!!exporting || !pagination.total} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(k => {
          const Icon = k.icon;
          return (
            <button key={k.label} onClick={k.onClick} title={k.hint}
              className={`glass rounded-xl p-4 text-left hover:shadow-lg transition-all ${k.active ? 'ring-2 ring-brand-500' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">{k.label}</p>
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${k.color} text-white`}><Icon className="w-3.5 h-3.5" /></div>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {k.value === undefined ? <span className="inline-block w-12 h-7 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /> : k.value.toLocaleString()}
              </p>
            </button>
          );
        })}
      </div>

      <div className="glass rounded-2xl p-4 mb-6 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="search" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search messages, services, user email, or IP address"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          </div>
          <select value={service} onChange={e => setService(e.target.value)} aria-label="Service"
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <option value="all">All services</option>
            {services.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {TIMEFRAMES.map(t => (
            <button key={t.id} onClick={() => setTimeframe(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${timeframe === t.id ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {t.label}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />
          {LEVELS.map(l => (
            <button key={l.id} onClick={() => setLevel(l.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${level === l.id ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {l.label}
            </button>
          ))}
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 ml-1">
            <input type="checkbox" checked={securityOnly} onChange={e => setSecurityOnly(e.target.checked)} className="rounded" /> Security events only
          </label>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {error ? (
          <div className="p-10 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700 dark:text-gray-300 mb-4">Couldn&apos;t load logs ({error}).</p>
            <button onClick={refresh} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium">Try again</button>
          </div>
        ) : (
          <>
            <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="py-3 px-6 font-semibold">Time</th>
                    <th className="py-3 px-4 font-semibold">Level</th>
                    <th className="py-3 px-4 font-semibold">Service</th>
                    <th className="py-3 px-4 font-semibold">Message</th>
                    <th className="py-3 px-4 font-semibold">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map(log => (
                    <tr key={log.id} onClick={() => setOpenLog(log)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                      <td className="py-3 px-6 whitespace-nowrap text-gray-700 dark:text-gray-300">{formatDate(log.created_at, true)}</td>
                      <td className="py-3 px-4"><LevelBadge level={log.level} /></td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{log.service}</td>
                      <td className="py-3 px-4">
                        <p className="text-gray-800 dark:text-white">{log.message}</p>
                        {hasDetails(log.metadata) && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">{Object.entries(log.metadata).slice(0, 3).map(([k, v]) => `${k}: ${typeof v === 'object' ? '…' : v}`).join(' · ')}</p>}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" />{log.user_email || 'System'}</span>
                        {log.ip_address && <span className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5"><Globe className="w-3 h-3" />{log.ip_address}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loading && logs.length === 0 && (
              <div className="text-center py-16">
                <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">No logs found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try a longer time range or different filters.</p>
              </div>
            )}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                <span className="text-gray-600 dark:text-gray-400">{pagination.total.toLocaleString()} entries</span>
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

      {summary && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><Database className="w-5 h-5 text-blue-500" /> Log storage</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">Space used by logs</dt><dd className="font-medium text-gray-800 dark:text-white">{formatBytes(summary.table.bytes)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">Entries kept</dt><dd className="font-medium text-gray-800 dark:text-white">{summary.table.rows.toLocaleString()}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">Oldest entry</dt><dd className="font-medium text-gray-800 dark:text-white">{summary.table.oldest ? formatDate(summary.table.oldest) : '—'}</dd></div>
            </dl>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2"><Shield className="w-5 h-5 text-purple-500" /> Retention</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Routine info logs are kept for <strong>1 year</strong>. Warnings, errors and security events are kept for <strong>3 years</strong>. Individual entries can&apos;t be deleted.
            </p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">{ret.clearableNow.toLocaleString()} entr{ret.clearableNow === 1 ? 'y is' : 'ies are'} past the retention period</span>
              <button onClick={clearOld} disabled={!ret.clearableNow}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium disabled:opacity-40">
                <Trash2 className="w-4 h-4" /> Clear old logs
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>{openLog && <LogPanel key={openLog.id} log={openLog} onClose={() => setOpenLog(null)} />}</AnimatePresence>
      <ConfirmDialog {...confirm.dialogProps} />
    </div>
  );
}
