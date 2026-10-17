"use client";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { HardDrive, DollarSign, Files, Phone, RefreshCw, AlertTriangle, AlertCircle, Info, Users, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/utils/api";
import { formatBytes, planInfo } from "@/components/admin/userShared";

const BUCKET_COLORS = { 'Voice notes': 'bg-blue-500', 'Legacy Vault': 'bg-purple-500', 'Voice wills': 'bg-emerald-500' };

export default function StorageOverview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.getAdminStorageOverview();
      setData(r.data);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load storage");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!data && loading) {
    return <div className="flex justify-center py-32"><RefreshCw className="w-10 h-10 text-brand-500 animate-spin" /></div>;
  }
  if (!data) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-gray-700 dark:text-gray-300 mb-4">Couldn&apos;t load storage ({error}).</p>
        <button onClick={load} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium">Try again</button>
      </div>
    );
  }

  const { totals, buckets, twilioOnly, wills, byTier, topUsers, nearOrOverLimit, monthly } = data;
  const monthlyChart = monthly.map(m => ({
    label: new Date(`${m.key}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
    mb: Math.round((m.bytes / (1024 * 1024)) * 10) / 10,
    files: m.files,
  }));
  const over = nearOrOverLimit.filter(u => u.percent_used >= 100);

  const cards = [
    { label: "Stored in S3", value: formatBytes(totals.bytes), detail: `${totals.files.toLocaleString()} recordings`, icon: HardDrive, color: "from-blue-500 to-cyan-500" },
    { label: "Estimated S3 cost", value: `$${totals.estimatedMonthlyCostUsd.toFixed(2)}/mo`, detail: `At $${totals.pricePerGbUsd}/GB (Frankfurt)`, icon: DollarSign, color: "from-green-500 to-emerald-500" },
    { label: "Phone recordings (Twilio)", value: twilioOnly.files.toLocaleString(), detail: 'Stored by Twilio, not in S3', icon: Phone, color: "from-indigo-500 to-violet-500" },
    { label: "Users at or over limit", value: nearOrOverLimit.length.toLocaleString(), detail: over.length ? `${over.length} over their limit` : '90% or more of their plan', icon: AlertTriangle, color: "from-orange-500 to-red-500", alert: over.length > 0 },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500"><HardDrive className="w-6 h-6 text-white" /></div>
              <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-white">Storage</h1>
              {loading && <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />}
            </div>
            <p className="text-gray-600 dark:text-gray-400">How much your users have stored, where, and who&apos;s close to their limit.</p>
          </div>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{k.label}</p>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${k.color} text-white`}><Icon className="w-4 h-4" /></div>
              </div>
              <p className={`text-2xl font-bold ${k.alert ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>{k.value}</p>
              <p className="text-xs text-gray-500 mt-2">{k.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-gray-800 dark:text-white mb-4">Where it&apos;s stored</h2>
          {buckets.length ? (
            <>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-5">
                {buckets.map(b => (
                  <div key={b.bucket} className={BUCKET_COLORS[b.label] || 'bg-gray-400'} style={{ width: `${totals.bytes ? (b.bytes / totals.bytes) * 100 : 0}%` }} title={b.label} />
                ))}
              </div>
              <ul className="space-y-3 text-sm">
                {buckets.map(b => (
                  <li key={b.bucket} className="flex items-start justify-between gap-3">
                    <span className="flex items-start gap-2">
                      <span className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${BUCKET_COLORS[b.label] || 'bg-gray-400'}`} />
                      <span><span className="font-medium text-gray-800 dark:text-white">{b.label}</span><span className="block text-xs text-gray-500 break-all">{b.bucket}</span></span>
                    </span>
                    <span className="text-right flex-shrink-0">
                      <span className="font-medium text-gray-800 dark:text-white">{formatBytes(b.bytes)}</span>
                      <span className="block text-xs text-gray-500">{b.files.toLocaleString()} files</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : <p className="text-sm text-gray-500">No recordings stored in S3 yet.</p>}
          <p className="text-xs text-gray-500 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-start gap-2">
            <FileText className="w-4 h-4 flex-shrink-0" />
            {wills.total.toLocaleString()} voice wills ({wills.phone.toLocaleString()} recorded by phone){wills.backups ? `, ${wills.backups} backed up to S3 after removal` : ''}.
          </p>
        </div>

        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-gray-800 dark:text-white">New uploads per month</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Recordings added to S3 over the last 12 months (MB)</p>
          <div className="h-56">
            {monthlyChart.some(m => m.files) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" strokeOpacity={0.25} vertical={false} />
                  <XAxis dataKey="label" stroke="#9CA3AF" tickLine={false} />
                  <YAxis stroke="#9CA3AF" tickLine={false} width={40} />
                  <Tooltip cursor={{ fill: 'rgba(156,163,175,0.1)' }} contentStyle={{ borderRadius: '0.75rem' }}
                    formatter={(value, name, item) => [`${value} MB · ${item.payload.files} files`, 'Uploaded']} />
                  <Bar dataKey="mb" fill="#0EA5E9" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-sm text-gray-500">No uploads in the last 12 months</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-500" /> At or over their limit</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Users using 90% or more of their plan&apos;s storage. They may not be able to record more.</p>
          {nearOrOverLimit.length ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {nearOrOverLimit.map(u => (
                <li key={u.id} className="py-2.5 flex items-center justify-between gap-3">
                  <Link href={`/adminDashboard/users/${u.id}`} className="min-w-0">
                    <span className="font-medium text-gray-800 dark:text-white hover:text-brand-600 truncate block">{u.full_name || u.email}</span>
                    <span className="text-xs text-gray-500">{planInfo(u.subscription_tier).label} · {formatBytes(u.bytes)} of {u.storage_limit_gb} GB</span>
                  </Link>
                  <span className={`text-sm font-semibold flex-shrink-0 ${u.percent_used >= 100 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>{u.percent_used}%</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-500">Nobody is close to their limit.</p>}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> Top users by storage</h2>
          {topUsers.length ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {topUsers.map(u => (
                <li key={u.id} className="py-2.5 flex items-center justify-between gap-3">
                  <Link href={`/adminDashboard/users/${u.id}`} className="min-w-0">
                    <span className="font-medium text-gray-800 dark:text-white hover:text-brand-600 truncate block">{u.full_name || u.email}</span>
                    <span className="text-xs text-gray-500">{planInfo(u.subscription_tier).label} · {u.files} recording{u.files === 1 ? '' : 's'}</span>
                  </Link>
                  <span className="text-right flex-shrink-0">
                    <span className="font-medium text-gray-800 dark:text-white">{formatBytes(u.bytes)}</span>
                    {u.percent_used !== null && <span className="block text-xs text-gray-500">{u.percent_used}% of limit</span>}
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-500">No stored recordings yet.</p>}
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mb-8">
        <h2 className="font-display text-lg font-bold text-gray-800 dark:text-white mb-4">Storage by plan</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead className="text-left text-gray-500"><tr><th className="py-2 font-medium">Plan</th><th className="py-2 font-medium">Users</th><th className="py-2 font-medium">Stored</th><th className="py-2 font-medium">Average per user</th></tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-200">
              {byTier.map(t => (
                <tr key={t.tier}>
                  <td className="py-2.5"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${planInfo(t.tier).color}`}>{planInfo(t.tier).label}</span></td>
                  <td className="py-2.5">{t.users.toLocaleString()}</td>
                  <td className="py-2.5">{formatBytes(t.bytes)}</td>
                  <td className="py-2.5">{formatBytes(t.users ? t.bytes / t.users : 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/10 flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p>
          These figures come from the app&apos;s records of each recording, so they match what users see. The real bill is in AWS Billing.
          Rules such as moving old recordings to cheaper storage are set on each bucket in the <strong>AWS S3 console</strong> (Management → Lifecycle rules), where they take effect.
        </p>
      </div>
    </div>
  );
}
