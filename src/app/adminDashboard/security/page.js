"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Shield, ShieldCheck, ShieldOff, KeyRound, Copy, Download, CheckCircle, AlertCircle,
  AlertTriangle, Loader2, ClipboardList, LogIn, Search, ChevronLeft, ChevronRight, ChevronDown
} from "lucide-react";
import { api } from "@/utils/api";
import { toast } from "@/components/ui/Toast";

const TABS = [
  { id: "2fa", label: "Two-step verification", icon: ShieldCheck },
  { id: "audit", label: "Audit log", icon: ClipboardList },
  { id: "signins", label: "Admin sign-ins", icon: LogIn },
];

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent";
const primaryButton = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryButton = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all disabled:opacity-50";

const formatDateTime = (value) => value
  ? new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  : 'â€”';

// "UPDATE_SCHEDULED_MSG_STATUS" â†’ "Update scheduled msg status"
const humanizeAction = (action) => {
  const text = String(action || '').toLowerCase().replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const shortDevice = (ua) => {
  if (!ua) return 'â€”';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
  return os ? `${browser} on ${os}` : browser;
};

function CodeInput({ value, onChange, disabled, autoFocus = true }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      aria-label="6-digit code"
      value={value}
      onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      className={`${inputClass} text-center text-2xl tracking-[0.4em] font-mono py-3`}
      placeholder="000000"
      autoFocus={autoFocus}
      disabled={disabled}
    />
  );
}

function BackupCodesPanel({ codes, onDone, doneLabel = "I've saved my codes" }) {
  const text = [
    'SureTalk Admin â€” 2FA backup codes',
    `Created: ${new Date().toLocaleDateString('en-US')}`,
    'Each code works once. Keep them somewhere safe.',
    '',
    ...codes.map((c, i) => `${i + 1}. ${c}`)
  ].join('\n');

  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suretalk-admin-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Save these backup codes now â€” they won&apos;t be shown again. If you lose your phone, each code lets you sign in once.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {codes.map(c => (
          <div key={c} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-center font-mono text-sm text-gray-800 dark:text-gray-200">{c}</div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={download} className={secondaryButton}><Download className="w-4 h-4" /> Download</button>
        <button type="button" onClick={() => { navigator.clipboard.writeText(codes.join('\n')); toast.success('Backup codes copied'); }} className={secondaryButton}>
          <Copy className="w-4 h-4" /> Copy
        </button>
        <button type="button" onClick={onDone} className={`${primaryButton} sm:ml-auto`}><CheckCircle className="w-4 h-4" /> {doneLabel}</button>
      </div>
    </div>
  );
}

function TwoFactorSection() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(null); // null | 'setup' | 'regen' | 'disable'
  const [setup, setSetup] = useState(null); // { qrCode, secret }
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [newCodes, setNewCodes] = useState(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await api.getAdminTwoFactorStatus();
      setStatus(res.data);
    } catch (err) {
      setError(err.message || 'Could not load 2FA status');
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const reset = () => { setMode(null); setSetup(null); setCode(''); setError(''); setNewCodes(null); };

  const startSetup = async () => {
    setError('');
    setBusy(true);
    try {
      const res = await api.setupTwoFactor();
      setSetup({ qrCode: res.data.qrCode, secret: res.data.secret });
      setMode('setup');
    } catch (err) {
      setError(err.message || 'Could not start 2FA setup');
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'setup') {
        const res = await api.verifyTwoFactorSetup(code);
        setNewCodes(res.data.backupCodes);
      } else if (mode === 'regen') {
        const res = await api.regenerateAdminBackupCodes(code);
        setNewCodes(res.data.backupCodes);
      } else if (mode === 'disable') {
        await api.disableTwoFactor(code);
        toast.success('Two-step verification is now off');
        reset();
        await loadStatus();
      }
    } catch (err) {
      setError(/invalid/i.test(err.message || '') ? "That code didn't work. Check your authenticator app and try again." : (err.message || 'Something went wrong'));
    } finally {
      setBusy(false);
      setCode('');
    }
  };

  const finishCodes = async () => {
    toast.success(mode === 'setup' ? 'Two-step verification is now on' : 'New backup codes saved');
    reset();
    await loadStatus();
  };

  if (!status && !error) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="max-w-2xl">
      {error && (
        <div role="alert" className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {newCodes ? (
        <BackupCodesPanel codes={newCodes} onDone={finishCodes} />
      ) : mode === 'setup' && setup ? (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">1. Scan this QR code</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Open Google Authenticator, Authy, or another authenticator app and scan the code.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="p-3 bg-white rounded-2xl shadow-md flex-shrink-0">
                <Image unoptimized src={setup.qrCode} alt="2FA QR code" width={170} height={170} />
              </div>
              <div className="w-full">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Can&apos;t scan it? Enter this key in the app instead:</p>
                <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-200 break-all">{setup.secret}</code>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(setup.secret); toast.success('Key copied'); }}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Copy key">
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <form onSubmit={submitCode} className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">2. Enter the 6-digit code the app shows</h3>
            <CodeInput value={code} onChange={setCode} disabled={busy} autoFocus={false} />
            <div className="flex gap-3">
              <button type="button" onClick={reset} disabled={busy} className={secondaryButton}>Cancel</button>
              <button type="submit" disabled={busy || code.length !== 6} className={primaryButton}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Turn on
              </button>
            </div>
          </form>
        </div>
      ) : status?.enabled ? (
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-300">Two-step verification is on</h3>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                Signing in to the admin console needs your password and a code from your authenticator app.
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${status.backupCodesRemaining <= 3
            ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
            <KeyRound className="w-5 h-5 flex-shrink-0" />
            <span>
              {status.backupCodesRemaining} of 10 backup codes left.
              {status.backupCodesRemaining <= 3 && ' Create new ones soon so you don\'t get locked out.'}
            </span>
          </div>

          {mode === 'regen' || mode === 'disable' ? (
            <form onSubmit={submitCode} className="space-y-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {mode === 'regen'
                  ? 'Enter a code from your authenticator app. Your old backup codes will stop working.'
                  : 'Enter a code from your authenticator app to turn two-step verification off.'}
              </p>
              <CodeInput value={code} onChange={setCode} disabled={busy} />
              <div className="flex gap-3">
                <button type="button" onClick={reset} disabled={busy} className={secondaryButton}>Cancel</button>
                <button type="submit" disabled={busy || code.length !== 6}
                  className={mode === 'disable' ? `${primaryButton} !from-red-600 !to-red-500` : primaryButton}>
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === 'regen' ? 'Create new codes' : 'Turn off'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => { setError(''); setMode('regen'); }} className={secondaryButton}>
                <KeyRound className="w-4 h-4" /> Get new backup codes
              </button>
              <button type="button" onClick={() => { setError(''); setMode('disable'); }}
                className={`${secondaryButton} text-red-600 dark:text-red-400 border-red-200 dark:border-red-800`}>
                <ShieldOff className="w-4 h-4" /> Turn off 2FA
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-300">Two-step verification is off</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                Admin accounts can see and change every user&apos;s data. Turn this on so a stolen password alone can&apos;t get into the admin console.
              </p>
            </div>
          </div>
          <button type="button" onClick={startSetup} disabled={busy} className={primaryButton}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Turn on two-step verification
          </button>
        </div>
      )}
    </div>
  );
}

function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
      <span>Page {pagination.page} of {pagination.pages} Â· {pagination.total.toLocaleString()} entries</span>
      <div className="flex gap-2">
        <button onClick={() => onPage(pagination.page - 1)} disabled={pagination.page <= 1}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40" aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => onPage(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40" aria-label="Next page">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Stable loaders (defined once) so the list effect doesn't re-run on every render
const fetchAuditLog = (params) => api.getAdminAuditLog(params);
const fetchLoginAttempts = (params) => api.getAdminLoginAttempts(params);

// Fetches a paged list whenever the filters change; search waits until typing pauses
function usePagedList(fetcher, filters) {
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [page, setPage] = useState(1);
  const key = JSON.stringify(filters);

  useEffect(() => { setPage(1); }, [key]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setState(s => ({ ...s, loading: true, error: '' }));
      try {
        const params = Object.fromEntries(Object.entries({ ...JSON.parse(key), page }).filter(([, v]) => v !== '' && v !== undefined));
        const res = await fetcher(params);
        if (!cancelled) setState({ loading: false, error: '', data: res.data });
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: err.message || 'Could not load', data: null });
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [fetcher, key, page]);

  return { ...state, page, setPage };
}

function AuditLogSection() {
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const { loading, error, data, setPage } = usePagedList(fetchAuditLog, { action, search, limit: 25 });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by admin or target ID"
            className={`${inputClass} pl-9`} />
        </div>
        <select value={action} onChange={e => setAction(e.target.value)} className={`${inputClass} sm:w-64`} aria-label="Filter by action">
          <option value="">All actions</option>
          {(data?.actions || []).map(a => <option key={a} value={a}>{humanizeAction(a)}</option>)}
        </select>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400 py-6">{error}</p>
      ) : loading && !data ? (
        <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-brand-500" /></div>
      ) : data?.entries?.length ? (
        <div className={`overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 ${loading ? 'opacity-60' : ''}`}>
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-left text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">IP</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.entries.map(entry => {
                const hasDetails = entry.old_value || entry.new_value;
                const open = expanded === entry.id;
                return (
                  <FragmentRow key={entry.id}>
                    <tr className="text-gray-700 dark:text-gray-300">
                      <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(entry.created_at)}</td>
                      <td className="px-4 py-3">{entry.admin_name || entry.admin_email || 'Unknown'}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{humanizeAction(entry.action)}</td>
                      <td className="px-4 py-3 font-mono text-xs max-w-[12rem] truncate" title={entry.target_id || ''}>{entry.target_id || 'â€”'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{entry.ip_address || 'â€”'}</td>
                      <td className="px-4 py-3 text-right">
                        {hasDetails && (
                          <button onClick={() => setExpanded(open ? null : entry.id)} className="text-brand-600 dark:text-brand-400 inline-flex items-center gap-1">
                            Details <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </td>
                    </tr>
                    {open && (
                      <tr className="bg-gray-50 dark:bg-gray-800/40">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="grid sm:grid-cols-2 gap-3 text-xs">
                            {entry.old_value && (
                              <div><p className="font-semibold text-gray-500 mb-1">Before</p>
                                <pre className="p-3 rounded-lg bg-white dark:bg-gray-900 overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(entry.old_value, null, 2)}</pre></div>
                            )}
                            {entry.new_value && (
                              <div><p className="font-semibold text-gray-500 mb-1">After</p>
                                <pre className="p-3 rounded-lg bg-white dark:bg-gray-900 overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(entry.new_value, null, 2)}</pre></div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </FragmentRow>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-12">No admin actions recorded{action || search ? ' for this filter' : ' yet'}.</p>
      )}
      <Pagination pagination={data?.pagination} onPage={setPage} />
    </div>
  );
}

function SignInsSection() {
  const [result, setResult] = useState('');
  const [search, setSearch] = useState('');
  const { loading, error, data, setPage } = usePagedList(fetchLoginAttempts, { result, search, limit: 25 });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or IP"
            className={`${inputClass} pl-9`} />
        </div>
        <select value={result} onChange={e => setResult(e.target.value)} className={`${inputClass} sm:w-48`} aria-label="Filter by result">
          <option value="">All attempts</option>
          <option value="failed">Failed only</option>
          <option value="success">Successful only</option>
        </select>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400 py-6">{error}</p>
      ) : loading && !data ? (
        <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-brand-500" /></div>
      ) : data?.attempts?.length ? (
        <div className={`overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 ${loading ? 'opacity-60' : ''}`}>
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-left text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">IP</th>
                <th className="px-4 py-3 font-medium">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
              {data.attempts.map(a => (
                <tr key={a.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(a.created_at)}</td>
                  <td className="px-4 py-3">{a.email || 'â€”'}</td>
                  <td className="px-4 py-3">
                    {a.success ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        <CheckCircle className="w-3.5 h-3.5" /> Signed in
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" title={a.failure_reason || ''}>
                        <AlertCircle className="w-3.5 h-3.5" /> {a.failure_reason || 'Failed'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{a.ip_address || 'â€”'}</td>
                  <td className="px-4 py-3" title={a.user_agent || ''}>{shortDevice(a.user_agent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-12">No sign-in attempts{result || search ? ' for this filter' : ' yet'}.</p>
      )}
      <Pagination pagination={data?.pagination} onPage={setPage} />
    </div>
  );
}

// Lets a table body render two <tr>s per entry without an extra wrapper element
function FragmentRow({ children }) {
  return <>{children}</>;
}

export default function AdminSecurityPage() {
  const [tab, setTab] = useState("2fa");
  // Set when the admin was sent here because "Require 2FA for all admins" is on
  const [required, setRequired] = useState(false);
  useEffect(() => {
    setRequired(new URLSearchParams(window.location.search).get('required') === '1');
  }, []);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-white">Security &amp; audit</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Protect your admin account and review what admins have done.
        </p>
      </motion.div>

      {required && (
        <div role="alert" className="mb-6 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Two-step verification is required for all admin accounts. Turn it on below to keep using the admin console.
          </p>
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === t.id
                ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="glass rounded-2xl p-6">
          {tab === "2fa" && <TwoFactorSection />}
          {tab === "audit" && <AuditLogSection />}
          {tab === "signins" && <SignInsSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
