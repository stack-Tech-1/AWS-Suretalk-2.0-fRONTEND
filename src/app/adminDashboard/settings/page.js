"use client";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Settings as SettingsIcon, Wrench, ShieldCheck, Gauge, Activity, AlertTriangle,
  AlertCircle, CheckCircle, Loader2, RefreshCw, Zap, Save
} from "lucide-react";
import { api } from "@/utils/api";
import { toast } from "@/components/ui/Toast";

const timeAgo = (date) => {
  if (!date) return '—';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  return `${Math.floor(seconds / 3600)} h ago`;
};

const SERVICE_STATUS = {
  ok: { label: 'Operational', dot: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
  slow: { label: 'Slow', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  down: { label: 'Down', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
};

function Toggle({ checked, onChange, disabled, danger = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? (danger ? 'bg-red-500' : 'bg-green-500') : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function Card({ icon: Icon, iconClass, title, subtitle, children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-start gap-3 mb-5">
        <Icon className={`w-6 h-6 mt-0.5 ${iconClass}`} />
        <div>
          <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

export default function AdminSettings() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(null); // key being saved
  const [confirmMaintenance, setConfirmMaintenance] = useState(false);
  const [message, setMessage] = useState('');
  const [twoFaError, setTwoFaError] = useState('');
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.getSettings();
      setData(res.data);
      setMessage(res.data.settings.maintenanceMessage || '');
      setLoadError('');
    } catch (err) {
      setLoadError(err.message || 'Could not load settings');
    }
  }, []);

  const loadHealth = useCallback(async (refresh = false) => {
    setChecking(true);
    try {
      const res = await api.getServiceStatus({ refresh });
      setHealth(res.data);
    } catch (err) {
      toast.error(err.message || 'Could not check services');
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { load(); loadHealth(); }, [load, loadHealth]);

  const save = async (key, value) => {
    setSaving(key);
    try {
      const res = await api.updateSetting(key, value);
      setData(prev => ({ ...prev, settings: { ...prev.settings, [key]: res.data.value } }));
      return res.data.value;
    } finally {
      setSaving(null);
    }
  };

  const setMaintenance = async (on) => {
    try {
      await save('maintenanceMode', on);
      setConfirmMaintenance(false);
      if (on) toast.warning('Maintenance mode is on. Users now see the maintenance screen.', 'Maintenance on');
      else toast.success('Maintenance mode is off. The app is open again.', 'Maintenance off');
    } catch (err) {
      toast.error(err.message || 'Could not change maintenance mode');
    }
  };

  const saveMessage = async () => {
    try {
      await save('maintenanceMessage', message.trim());
      toast.success('Maintenance message saved');
    } catch (err) {
      toast.error(err.message || 'Could not save the message');
    }
  };

  const setRequire2FA = async (on) => {
    setTwoFaError('');
    try {
      await save('require2FA', on);
      toast.success(on ? 'All admins now need two-step verification.' : 'Two-step verification is now optional for admins.');
      load(); // refresh the "admins without 2FA" count
    } catch (err) {
      setTwoFaError(err.message || 'Could not change this setting');
    }
  };

  if (!data && !loadError) {
    return <div className="flex justify-center py-32"><Loader2 className="w-10 h-10 animate-spin text-brand-500" /></div>;
  }

  if (!data) {
    return (
      <div role="alert" className="p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 flex items-center justify-between gap-3">
        <span className="text-sm text-red-700 dark:text-red-300">Couldn&apos;t load settings ({loadError}).</span>
        <button onClick={load} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium">Try again</button>
      </div>
    );
  }

  const { settings, limits, admins } = data;
  const messageChanged = message.trim() !== (settings.maintenanceMessage || '').trim();

  return (
    <div className="max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Platform-wide switches. Changes take effect within about 15 seconds.</p>
      </motion.div>

      <div className="space-y-6">
        {/* Maintenance mode */}
        <Card icon={Wrench} iconClass="text-amber-500" title="Maintenance mode"
          subtitle="Temporarily close the app to users while you work on it.">
          <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${settings.maintenanceMode
            ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
            : 'border-gray-200 dark:border-gray-700'}`}>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                {settings.maintenanceMode ? 'Maintenance mode is ON' : 'Maintenance mode is off'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {settings.maintenanceMode
                  ? 'Users see the maintenance screen and can\'t sign in or use the app.'
                  : 'The app is open to everyone.'}
              </p>
            </div>
            <Toggle
              label="Maintenance mode"
              checked={settings.maintenanceMode}
              danger
              disabled={saving === 'maintenanceMode'}
              onChange={() => settings.maintenanceMode ? setMaintenance(false) : setConfirmMaintenance(true)}
            />
          </div>

          {confirmMaintenance && !settings.maintenanceMode && (
            <div className="mt-4 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-1">Turn on maintenance mode?</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
                Everyone using the website or app will be moved to the maintenance screen within about 15 seconds.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmMaintenance(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cancel
                </button>
                <button onClick={() => setMaintenance(true)} disabled={saving === 'maintenanceMode'}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60">
                  {saving === 'maintenanceMode' && <Loader2 className="w-4 h-4 animate-spin" />} Turn on
                </button>
              </div>
            </div>
          )}

          <div className="mt-5">
            <label htmlFor="maintenance-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message shown to users
            </label>
            <textarea
              id="maintenance-message"
              rows={3}
              maxLength={500}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <div className="flex items-center justify-between gap-3 mt-2">
              <p className="text-xs text-gray-500">
                If you keep the default message, Spanish-speaking users see it in Spanish. A custom message is shown exactly as written.
              </p>
              <button onClick={saveMessage} disabled={!messageChanged || !message.trim() || saving === 'maintenanceMessage'}
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-accent-500 text-white text-sm font-medium disabled:opacity-50">
                {saving === 'maintenanceMessage' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save message
              </button>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Keeps working during maintenance</p>
            Admin console · phone line (IVR) · scheduled calls and SMS · message links opened by recipients · Stripe payments and Twilio callbacks
          </div>
        </Card>

        {/* Admin 2FA */}
        <Card icon={ShieldCheck} iconClass="text-green-500" title="Admin security" delay={0.05}
          subtitle="Rules for everyone who can sign in to the admin console.">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Require two-step verification for all admins</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Admins without it are sent to set it up and can&apos;t use the admin console until they do.
              </p>
            </div>
            <Toggle
              label="Require two-step verification for all admins"
              checked={settings.require2FA}
              disabled={saving === 'require2FA'}
              onChange={() => setRequire2FA(!settings.require2FA)}
            />
          </div>

          {twoFaError && (
            <div role="alert" className="mt-4 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {twoFaError}{' '}
                <Link href="/adminDashboard/security" className="font-semibold underline">Go to Security &amp; audit</Link>
              </p>
            </div>
          )}

          <p className={`mt-4 text-sm flex items-center gap-2 ${admins.without_2fa > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>
            {admins.without_2fa > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {admins.without_2fa > 0
              ? `${admins.without_2fa} of ${admins.total} admin${admins.total === 1 ? '' : 's'} haven't turned on two-step verification yet.`
              : `All ${admins.total} admin${admins.total === 1 ? ' has' : 's have'} two-step verification on.`}
          </p>
        </Card>

        {/* Current limits (read-only) */}
        <Card icon={Gauge} iconClass="text-blue-500" title="Current limits" delay={0.1}
          subtitle="Protection limits the server is enforcing right now. For information only.">
          <dl className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            {[
              ['Requests per network (IP)', `${limits.generalPerIp.toLocaleString()} per ${limits.windowMinutes} min`, limits.generalOverridden && 'set by GENERAL_RATE_LIMIT'],
              ['Requests per signed-in user', `${limits.perUser.toLocaleString()} per ${limits.windowMinutes} min`, limits.perUserOverridden && 'set by PER_USER_RATE_LIMIT'],
              ['Failed sign-ins per network', `${limits.failedLoginsPerIp} per 15 min`],
              ['Sign-up / reset emails and SMS per network', `${limits.messageSendsPerHour} per hour`],
              ['Largest file upload', `${limits.uploadMaxMb} MB`],
            ].map(([label, value, note]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-3">
                <dt className="text-gray-600 dark:text-gray-400">{label}</dt>
                <dd className="text-right">
                  <span className="font-medium text-gray-800 dark:text-white">{value}</span>
                  {note && <span className="block text-xs text-gray-500">{note}</span>}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-gray-500 mt-3">
            To change the request limits, edit <code>GENERAL_RATE_LIMIT</code> or <code>PER_USER_RATE_LIMIT</code> in AppRunner&apos;s environment settings.
          </p>
        </Card>

        {/* Live service status */}
        <Card icon={Activity} iconClass="text-purple-500" title="Service status" delay={0.15}
          subtitle={health ? `Live checks · last run ${timeAgo(health.checkedAt)}` : 'Checking services...'}>
          <div className="space-y-3">
            {health?.services?.map(service => {
              const s = SERVICE_STATUS[service.status] || SERVICE_STATUS.down;
              return (
                <div key={service.service} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{service.service}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`font-medium ${s.text}`}>{s.label}</span>
                    {service.status !== 'down' && service.latency_ms !== null && <span className="text-gray-500"> · {service.latency_ms}ms</span>}
                    {service.status === 'down' && service.error && <p className="text-xs text-red-500">{service.error}</p>}
                  </div>
                </div>
              );
            })}
            {!health && <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>}
          </div>
          <button onClick={() => loadHealth(true)} disabled={checking}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-60">
            {checking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {checking ? 'Checking...' : 'Run system check'}
          </button>
        </Card>
      </div>
    </div>
  );
}
