"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FileText, Search, User, Calendar, CheckCircle, Clock, AlertTriangle, AlertCircle, RefreshCw,
  Phone, Smartphone, Users, X, Send, Play, Pause, Archive, RotateCcw, Loader2, Mail, MessageSquare,
  ChevronLeft, ChevronRight, Shield, Eye
} from "lucide-react";
import { api } from "@/utils/api";
import { toast } from "@/components/ui/Toast";
import { formatDate, timeAgo, ConfirmDialog, useConfirm } from "@/components/admin/userShared";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "due", label: "Due for release" },
  { id: "pending", label: "Awaiting release" },
  { id: "released", label: "Released" },
  { id: "removed", label: "Removed" },
];
const PAGE_SIZE = 12;

const releaseLabel = (w) => {
  if (w.release_condition === 'date') return w.release_date ? `On ${formatDate(w.release_date)}` : 'On a date (not set)';
  if (w.release_condition === 'event') return 'After an event (admin confirms)';
  return 'When an admin releases it';
};

function StatusBadge({ will }) {
  if (will.admin_removed_at) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"><Archive className="w-3 h-3" /> Removed</span>;
  if (will.is_released) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"><CheckCircle className="w-3 h-3" /> Released</span>;
  if (will.is_due) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"><AlertTriangle className="w-3 h-3" /> Due for release</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"><Clock className="w-3 h-3" /> Awaiting release</span>;
}

const deliveryText = (status) => ({ sent: 'Sent', failed: 'Failed', not_sent: '—' }[status] || '—');

// ── Details panel ────────────────────────────────────────────────────────────
function WillPanel({ willId, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [notes, setNotes] = useState('');
  const [deliver, setDeliver] = useState(true);
  const [reason, setReason] = useState('');
  const [releaseResult, setReleaseResult] = useState(null);
  const audioRef = useRef(null);
  const notesRef = useRef(''); const deliverRef = useRef(true); const reasonRef = useRef('');
  const confirm = useConfirm();

  const load = useCallback(async () => {
    try {
      const res = await api.getAdminWill(willId);
      setData(res.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load this will');
    }
  }, [willId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const listen = async () => {
    if (audioUrl && audioRef.current) {
      if (playing) audioRef.current.pause(); else audioRef.current.play();
      return;
    }
    setLoadingAudio(true);
    try {
      const res = await api.listenToWill(willId);
      setAudioUrl(res.data.audioUrl);
      setTimeout(() => audioRef.current?.play().catch(() => {}), 50);
    } catch (err) {
      toast.error(err.message || 'Could not load the recording');
    } finally {
      setLoadingAudio(false);
    }
  };

  const openRelease = () => {
    setNotes(''); notesRef.current = '';
    setDeliver(true); deliverRef.current = true;
    confirm.open({
      kind: 'release',
      title: 'Release this voice will?',
      message: 'This can\'t be undone. Make sure the release condition has been verified (for example, a death certificate).',
      confirmLabel: 'Release',
      onConfirm: async () => {
        try {
          const res = await api.releaseWill(willId, { notes: notesRef.current, deliver: deliverRef.current });
          setReleaseResult(res.data);
          toast.success(res.data.delivered
            ? `Released and delivered to ${res.data.delivered} recipient${res.data.delivered === 1 ? '' : 's'}`
            : 'Released. Nobody was contacted automatically.', 'Will released');
          await load();
          onChanged();
        } catch (err) {
          toast.error(err.message || 'Release failed');
          return true;
        }
      }
    });
  };

  const openRemove = () => {
    setReason(''); reasonRef.current = '';
    confirm.open({
      kind: 'remove',
      title: 'Remove this will from service?',
      message: 'It will be hidden, the phone line will stop playing it, and any recipient links stop working. The recording is kept and you can restore it later.',
      confirmLabel: 'Remove', danger: true,
      onConfirm: async () => {
        if (reasonRef.current.trim().length < 5) { toast.warning('Give a reason (at least 5 characters)'); return true; }
        try {
          await api.removeWill(willId, reasonRef.current.trim());
          toast.success('Will removed from service. The recording was kept.');
          await load();
          onChanged();
        } catch (err) {
          toast.error(err.message || 'Could not remove the will');
          return true;
        }
      }
    });
  };

  const restore = () => confirm.open({
    title: 'Restore this will?',
    message: 'It becomes visible again and the phone line can play it. Recipient links that haven\'t expired start working again.',
    confirmLabel: 'Restore',
    onConfirm: async () => {
      try { await api.restoreWill(willId); toast.success('Will restored'); await load(); onChanged(); }
      catch (err) { toast.error(err.message || 'Could not restore the will'); return true; }
    }
  });

  const w = data?.will;
  const reachable = data?.recipients?.filter(r => r.reachable) || [];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}
        role="dialog" aria-modal="true" aria-label="Voice will details"
        className="relative w-full max-w-xl h-full overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
          <h2 className="font-display text-lg font-bold text-gray-800 dark:text-white">Voice will</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        {error ? (
          <p className="p-6 text-red-600 dark:text-red-400">{error}</p>
        ) : !data ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
        ) : (
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{w.title}</h3>
                <StatusBadge will={w} />
              </div>
              {w.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{w.description}</p>}
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                {w.source === 'ivr' ? <><Phone className="w-3 h-3" /> Recorded by phone{w.will_slot_number ? ` · slot ${w.will_slot_number}` : ''}</> : <><Smartphone className="w-3 h-3" /> Recorded in the app</>}
                {' · '}created {formatDate(w.created_at)}
              </p>
            </div>

            <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-sm space-y-2">
              <p className="font-semibold text-gray-800 dark:text-white mb-1">Owner</p>
              <p className="text-gray-700 dark:text-gray-300">{data.owner.name || 'No name'} · {data.owner.email}</p>
              {data.owner.phone && <p className="text-gray-500">{data.owner.phone}</p>}
              {data.owner.account_deleted && <p className="text-amber-600 dark:text-amber-400 text-xs">The owner&apos;s account has been closed.</p>}
              <Link href={`/adminDashboard/users/${data.owner.id}`} className="inline-block text-brand-600 dark:text-brand-400 text-xs font-medium">View user →</Link>
            </section>

            <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-sm">
              <p className="font-semibold text-gray-800 dark:text-white mb-2">Release</p>
              <dl className="space-y-1.5">
                <div className="flex justify-between gap-3"><dt className="text-gray-500">Condition</dt><dd className="text-gray-800 dark:text-gray-200 text-right">{releaseLabel(w)}</dd></div>
                {w.is_released && <>
                  <div className="flex justify-between gap-3"><dt className="text-gray-500">Released</dt><dd className="text-gray-800 dark:text-gray-200 text-right">{formatDate(w.released_at, true)}{w.released_by_name ? ` by ${w.released_by_name}` : ''}</dd></div>
                  {w.release_notes && <div><dt className="text-gray-500">Notes</dt><dd className="text-gray-800 dark:text-gray-200 whitespace-pre-line mt-0.5">{w.release_notes}</dd></div>}
                </>}
                {w.admin_removed_at && <>
                  <div className="flex justify-between gap-3"><dt className="text-gray-500">Removed</dt><dd className="text-gray-800 dark:text-gray-200 text-right">{formatDate(w.admin_removed_at, true)}{w.admin_removed_by_name ? ` by ${w.admin_removed_by_name}` : ''}</dd></div>
                  <div><dt className="text-gray-500">Reason</dt><dd className="text-gray-800 dark:text-gray-200 mt-0.5">{w.admin_removed_reason}</dd></div>
                </>}
              </dl>
            </section>

            <section>
              <p className="font-semibold text-gray-800 dark:text-white text-sm mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Recipients</p>
              {data.recipients.length ? (
                <ul className="space-y-2">
                  {data.recipients.map((r, i) => (
                    <li key={i} className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 text-sm">
                      <p className="font-medium text-gray-800 dark:text-white">{r.name}{r.relationship ? <span className="text-gray-500 font-normal"> · {r.relationship}</span> : null}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">{[r.phone, r.email].filter(Boolean).join(' · ') || 'No phone or email saved'}</p>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-gray-500">No beneficiaries named on this will.</p>}
              {!w.is_released && data.recipients.length > 0 && reachable.length < data.recipients.length && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Some recipients have no phone or email, so they can&apos;t be sent a link automatically.</p>
              )}
            </section>

            {data.links.length > 0 && (
              <section>
                <p className="font-semibold text-gray-800 dark:text-white text-sm mb-2 flex items-center gap-2"><Send className="w-4 h-4" /> Delivery</p>
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-xs min-w-[420px]">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-500"><tr><th className="px-3 py-2 font-medium">Recipient</th><th className="px-3 py-2 font-medium">SMS</th><th className="px-3 py-2 font-medium">Email</th><th className="px-3 py-2 font-medium">Opened</th></tr></thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                      {data.links.map(l => (
                        <tr key={l.id}>
                          <td className="px-3 py-2">{l.recipient_name}{l.revoked_at ? <span className="text-gray-400"> (link paused)</span> : new Date(l.expires_at) < new Date() ? <span className="text-gray-400"> (expired)</span> : null}</td>
                          <td className={`px-3 py-2 ${l.sms_status === 'failed' ? 'text-red-600' : ''}`}>{deliveryText(l.sms_status)}</td>
                          <td className={`px-3 py-2 ${l.email_status === 'failed' ? 'text-red-600' : ''}`}>{deliveryText(l.email_status)}</td>
                          <td className="px-3 py-2">{l.play_count ? `${l.play_count}× · ${timeAgo(l.last_played_at)}` : 'Not yet'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {releaseResult && releaseResult.recipients.length === 0 && (
              <p className="text-sm p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
                Nobody was contacted automatically. Reach the family yourselves.
              </p>
            )}

            {/* Listening */}
            <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              {w.is_released ? (
                <>
                  {audioUrl && <audio ref={audioRef} src={audioUrl} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} controls className="w-full mb-3" />}
                  {!audioUrl && (
                    <button onClick={listen} disabled={loadingAudio || !w.has_audio}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50">
                      {loadingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {w.has_audio ? 'Listen' : 'No recording found'}
                    </button>
                  )}
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Eye className="w-3 h-3" /> Each time you listen, it&apos;s recorded in the audit log.</p>
                </>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" /> This will stays private until it&apos;s released. Nobody, including admins, can listen to it before then.
                </p>
              )}
            </section>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              {!w.is_released && !w.admin_removed_at && (
                <button onClick={openRelease}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium">
                  <Send className="w-4 h-4" /> Release will
                </button>
              )}
              {w.admin_removed_at ? (
                <button onClick={restore} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium">
                  <RotateCcw className="w-4 h-4" /> Restore
                </button>
              ) : (
                <button onClick={openRemove} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium">
                  <Archive className="w-4 h-4" /> Remove from service
                </button>
              )}
            </div>
          </div>
        )}

        <ConfirmDialog {...confirm.dialogProps}>
          {confirm.dialogProps.kind === 'release' && data && (
            <div className="space-y-4">
              <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" className="mt-0.5 rounded" checked={deliver} onChange={e => { setDeliver(e.target.checked); deliverRef.current = e.target.checked; }} />
                <span>
                  Send each recipient a private listening link by SMS and email
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {reachable.length
                      ? `${reachable.length} recipient${reachable.length === 1 ? '' : 's'} can be reached. Links work for 30 days.`
                      : 'No recipient has a phone or email saved, so nobody will be contacted.'}
                  </span>
                </span>
              </label>
              <div>
                <label htmlFor="release-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Release notes (recommended)</label>
                <textarea id="release-notes" rows={3} maxLength={2000} value={notes}
                  onChange={e => { setNotes(e.target.value); notesRef.current = e.target.value; }}
                  placeholder="e.g. Death certificate received from the family on 12 Oct 2026"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
              </div>
            </div>
          )}
          {confirm.dialogProps.kind === 'remove' && (
            <div>
              <label htmlFor="remove-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason (required)</label>
              <textarea id="remove-reason" rows={3} maxLength={1000} value={reason}
                onChange={e => { setReason(e.target.value); reasonRef.current = e.target.value; }}
                placeholder="e.g. Owner asked for it to be taken down while they re-record it"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
            </div>
          )}
        </ConfirmDialog>
      </motion.aside>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function VoiceWills() {
  const [stats, setStats] = useState(null);
  const [wills, setWills] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => { const t = setTimeout(() => setSearch(searchInput.trim()), 400); return () => clearTimeout(t); }, [searchInput]);
  useEffect(() => { setPage(1); }, [filter, search]);

  const loadStats = useCallback(() => { api.getAdminWillStats().then(r => setStats(r.data)).catch(() => {}); }, []);
  const loadWills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminWills({ page, limit: PAGE_SIZE, status: filter, search });
      setWills(res.data.wills || []);
      setPagination(res.data.pagination || { total: 0, totalPages: 1 });
      setError("");
    } catch (err) {
      setError(err.message || "Could not load voice wills");
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => { loadWills(); }, [loadWills]);
  useEffect(() => { loadStats(); }, [loadStats]);
  const refresh = () => { loadWills(); loadStats(); };

  const kpis = [
    { label: "Total wills", value: stats?.total, icon: FileText, color: "from-blue-500 to-cyan-500", filter: "all" },
    { label: "Due for release", value: stats?.due, icon: AlertTriangle, color: "from-red-500 to-orange-500", filter: "due", hint: "Release date has passed" },
    { label: "Awaiting release", value: stats?.awaiting, icon: Clock, color: "from-amber-500 to-yellow-500", filter: "pending" },
    { label: "Released", value: stats?.released, icon: CheckCircle, color: "from-green-500 to-emerald-500", filter: "released" },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500"><FileText className="w-6 h-6 text-white" /></div>
              <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-white">Voice wills</h1>
              {loading && <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Review wills, release them to beneficiaries, and track delivery.</p>
          </div>
          <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </motion.div>

      {stats?.due > 0 && filter !== 'due' && (
        <button onClick={() => setFilter('due')}
          className="w-full mb-6 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 flex items-center gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-800 dark:text-red-300">
            <strong>{stats.due} will{stats.due === 1 ? ' is' : 's are'} due for release.</strong> Their release date has passed — review and release when the condition is confirmed.
          </span>
        </button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <button key={k.label} onClick={() => setFilter(k.filter)} title={k.hint}
              className={`glass rounded-xl p-6 text-left transition-all hover:shadow-lg ${filter === k.filter ? 'ring-2 ring-brand-500' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{k.label}</p>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${k.color} text-white`}><Icon className="w-4 h-4" /></div>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {k.value === undefined ? <span className="inline-block w-12 h-7 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /> : Number(k.value).toLocaleString()}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="search" placeholder="Search by title, owner name, email, or recipient phone" value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {f.label}{f.id === 'removed' && stats?.removed ? ` (${stats.removed})` : ''}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="glass rounded-2xl p-10 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 dark:text-gray-300 mb-4">Couldn&apos;t load voice wills ({error}).</p>
          <button onClick={loadWills} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium">Try again</button>
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${loading ? 'opacity-60' : ''}`}>
            {wills.map(w => (
              <button key={w.id} onClick={() => setOpenId(w.id)}
                className={`glass rounded-2xl p-6 text-left card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${w.is_due ? 'ring-1 ring-red-300 dark:ring-red-800' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-gray-800 dark:text-white line-clamp-2">{w.title}</h3>
                  <StatusBadge will={w} />
                </div>
                <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <p className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> {w.owner_name || w.owner_email}</p>
                  <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Created {formatDate(w.created_at)}</p>
                  <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {w.is_released ? `Released ${formatDate(w.released_at)}` : releaseLabel(w)}</p>
                  <p className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    {w.beneficiary_names?.length
                      ? w.beneficiary_names.slice(0, 3).join(', ') + (w.beneficiary_names.length > 3 ? ` +${w.beneficiary_names.length - 3}` : '')
                      : w.contact_phone ? `Recipient ${w.contact_phone}` : 'No beneficiaries named'}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-gray-500">
                    {w.source === 'ivr' ? <><Phone className="w-3 h-3" /> Phone recording</> : <><Smartphone className="w-3 h-3" /> App recording</>}
                    {w.is_released && w.link_count > 0 && <> · <MessageSquare className="w-3 h-3" /> {w.opened_count}/{w.link_count} opened</>}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {!loading && wills.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">No voice wills here</h3>
              <p className="text-gray-600 dark:text-gray-400">{search ? 'Try a different search.' : 'Nothing matches this filter.'}</p>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{pagination.total.toLocaleString()} wills</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-gray-600 dark:text-gray-400">Page {page} of {pagination.totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40" aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-8 p-5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-900/10 flex items-start gap-3">
        <Shield className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Voice wills are sensitive. They stay private until released, releasing can&apos;t be undone, and every release, removal, restore and listen is recorded in the
          {' '}<Link href="/adminDashboard/security" className="font-medium text-brand-600 dark:text-brand-400">audit log</Link>.
        </p>
      </div>

      <AnimatePresence>
        {openId && <WillPanel key={openId} willId={openId} onClose={() => setOpenId(null)} onChanged={refresh} />}
      </AnimatePresence>
    </div>
  );
}
