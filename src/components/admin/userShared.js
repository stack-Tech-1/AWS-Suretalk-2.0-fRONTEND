"use client";
// Shared bits for the admin user pages (list, details, edit, create)
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

// Must match TIER_LIMITS in the backend (routes/adminUsers.js, routes/billing.js)
export const PLANS = [
  { id: "LITE", label: "Lite", price: "Free", storageGb: 1, contacts: 3, voiceNotes: 3 },
  { id: "ESSENTIAL", label: "Essential", price: "$4.99/mo", storageGb: 5, contacts: 9, voiceNotes: 100 },
  { id: "LEGACY_VAULT_PREMIUM", label: "Premium", price: "$9.99/mo", storageGb: 50, contacts: 25, voiceNotes: 500 },
];

export const planInfo = (tier) => {
  const plan = PLANS.find(p => p.id === tier) || (tier === 'PREMIUM' ? PLANS[2] : null);
  const colors = {
    LEGACY_VAULT_PREMIUM: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    ESSENTIAL: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    LITE: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  };
  return { label: plan?.label || tier || 'Unknown', color: colors[plan?.id] || colors.LITE, plan };
};

const STATUS = {
  active: { label: 'Active', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  trialing: { label: 'Trial', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  past_due: { label: 'Payment due', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  suspended: { label: 'Deactivated', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
};

export const statusInfo = (status) =>
  STATUS[status] || { label: status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ') : 'Unknown', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' };

export const isActiveStatus = (status) => ['active', 'trialing', 'past_due'].includes(status);

export const timeAgo = (date) => {
  if (!date) return 'Never';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) { const h = Math.floor(seconds / 3600); return `${h} hour${h === 1 ? '' : 's'} ago`; }
  const d = Math.floor(seconds / 86400);
  if (d < 30) return `${d} day${d === 1 ? '' : 's'} ago`;
  return formatDate(date);
};

export const formatDate = (value, withTime = false) => value
  ? new Date(value).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {})
    })
  : '—';

export const formatBytes = (bytes) => {
  const n = Number(bytes || 0);
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = n / 1024, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
};

export const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// Confirmation dialog used instead of window.confirm/prompt.
// children can hold extra options (e.g. a checkbox or plan picker).
export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, busy = false, confirmDisabled = false, onConfirm, onCancel, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !busy && onCancel()} />
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="confirm-title"
            initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              {danger && <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />}
              <div>
                <h3 id="confirm-title" className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                {message && <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{message}</div>}
              </div>
            </div>
            {children}
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={onCancel} disabled={busy}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                Cancel
              </button>
              <button type="button" onClick={onConfirm} disabled={busy || confirmDisabled}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white inline-flex items-center gap-2 disabled:opacity-50 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-brand-600 to-accent-500'}`}>
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Holds the state for one confirm dialog: open(config) → dialog props
export function useConfirm() {
  const [config, setConfig] = useState(null);
  const [busy, setBusy] = useState(false);
  const close = () => { if (!busy) setConfig(null); };
  const run = async () => {
    if (!config?.onConfirm) return;
    setBusy(true);
    try {
      const keepOpen = await config.onConfirm();
      if (!keepOpen) setConfig(null);
    } finally {
      setBusy(false);
    }
  };
  return {
    open: (c) => setConfig(c),
    // config first, so the wrapped onConfirm (spinner + close) wins over the raw one
    dialogProps: { ...(config || {}), open: !!config, busy, onCancel: close, onConfirm: run },
  };
}
