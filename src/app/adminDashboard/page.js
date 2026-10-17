"use client"
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../utils/api";
import {
  Users, Shield, Activity, DollarSign, Server, ChevronRight, ArrowUpRight,
  CheckCircle, AlertCircle, AlertTriangle, Zap, Eye, Settings, FileText,
  HardDrive, Mic, CalendarClock, ShieldAlert, RefreshCw
} from "lucide-react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const REFRESH_MS = 60 * 1000;

const timeAgo = (date) => {
  if (!date) return '—';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  const days = Math.floor(seconds / 86400);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const money = (value, decimals = 2) =>
  `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

const formatBytes = (bytes) => {
  const n = Number(bytes || 0);
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
};

const STATUS_STYLES = {
  operational: { label: 'All systems operational', pill: 'from-green-500 to-emerald-500' },
  degraded: { label: 'Some services slow', pill: 'from-amber-500 to-orange-500' },
  issues: { label: 'Service issues detected', pill: 'from-red-500 to-orange-500' },
};

const SERVICE_STATUS = {
  ok: { label: 'Operational', dot: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
  slow: { label: 'Slow', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  down: { label: 'Down', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
};

const ACTIVITY_STYLES = {
  info: { icon: CheckCircle, wrap: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400' },
  warning: { icon: AlertTriangle, wrap: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
  error: { icon: AlertCircle, wrap: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' },
};

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 dark:text-white mb-1">{label}</p>
      <p className="text-brand-600 dark:text-brand-400">Revenue: {money(row.revenue)}</p>
      <p className="text-gray-500 dark:text-gray-400">{row.transactions} payment{row.transactions === 1 ? '' : 's'}</p>
      <p className="text-emerald-600 dark:text-emerald-400">New users: {row.new_users}</p>
    </div>
  );
}

export default function AdminHome() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [, setTick] = useState(0);

  const load = useCallback(async ({ refresh = false } = {}) => {
    try {
      const response = await api.getAdminDashboardOverview({ refresh });
      setData(response.data);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      console.error("Dashboard data fetch failed:", err);
      setError(err.message || 'Could not load dashboard data');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await api.getProfile();
        if (!profile.data?.is_admin || profile.data?.admin_status !== 'approved') {
          router.replace('/admin/login');
          return;
        }
        if (!cancelled) setUser(profile.data);
      } catch {
        router.replace('/admin/login');
        return;
      }
      await load();
      if (!cancelled) setLoading(false);
    })();

    const refresh = setInterval(() => load(), REFRESH_MS);
    const tick = setInterval(() => setTick(t => t + 1), 15000); // keeps "updated x ago" current
    return () => { cancelled = true; clearInterval(refresh); clearInterval(tick); };
  }, [load, router]);

  const runSystemCheck = async () => {
    setChecking(true);
    await load({ refresh: true });
    setChecking(false);
  };

  const userStats = data?.userStats || {};
  const revenue = data?.revenue || {};
  const platform = data?.platform || {};
  const status = STATUS_STYLES[data?.systemStatus] || STATUS_STYLES.operational;

  const premiumShare = userStats.total_users ? Math.round((userStats.premium_users / userStats.total_users) * 100) : 0;
  const premiumGain = (userStats.premium_users || 0) - (userStats.premium_users_30d_ago || 0);
  const revenueChange = revenue.last_month_to_date_revenue > 0
    ? Math.round(((revenue.current_month_revenue - revenue.last_month_to_date_revenue) / revenue.last_month_to_date_revenue) * 100)
    : null;

  const statCardLinkClass = "group block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 rounded-2xl";
  const statCardArrowClass = "w-3.5 h-3.5 shrink-0 transition-all duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:-translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0";

  const stats = [
    {
      label: "Total users",
      value: (userStats.total_users ?? 0).toLocaleString(),
      detail: `+${(userStats.new_users_30d ?? 0).toLocaleString()} in the last 30 days`,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      href: "/adminDashboard/users",
    },
    {
      label: "Premium users",
      value: (userStats.premium_users ?? 0).toLocaleString(),
      detail: `${premiumShare}% of users · ${premiumGain >= 0 ? '+' : ''}${premiumGain} in 30 days`,
      icon: Shield,
      color: "from-purple-500 to-pink-500",
      href: "/adminDashboard/users",
    },
    {
      label: "Active now",
      value: (userStats.active_now ?? 0).toLocaleString(),
      detail: userStats.activity_source === 'last_login'
        ? `${(userStats.active_today ?? 0).toLocaleString()} signed in today`
        : `${(userStats.active_today ?? 0).toLocaleString()} active today`,
      hint: userStats.activity_source === 'last_login'
        ? 'Based on sign-ins until database update 011 is applied'
        : 'Used the app in the last 15 minutes',
      icon: Activity,
      color: "from-green-500 to-emerald-500",
      href: "/adminDashboard/users",
    },
    {
      label: "Revenue this month",
      value: money(revenue.current_month_revenue),
      detail: `Last month: ${money(revenue.last_month_revenue)}`,
      badge: revenueChange,
      hint: revenue.source === 'database'
        ? 'From saved payment records (Stripe unavailable)'
        : 'From Stripe paid invoices (USD), compared with the same days last month',
      icon: DollarSign,
      color: "from-orange-500 to-red-500",
    },
  ];

  const quickActions = [
    { icon: Users, label: "Manage users", color: "bg-blue-500", href: "/adminDashboard/users" },
    { icon: Eye, label: "View logs", color: "bg-purple-500", href: "/adminDashboard/logs" },
    { icon: FileText, label: "Voice wills", color: "bg-red-500", href: "/adminDashboard/wills" },
    { icon: Settings, label: "Settings", color: "bg-gray-600", href: "/adminDashboard/settings" },
  ];

  const platformRows = [
    { icon: HardDrive, label: "Storage used", value: formatBytes(platform.storage_bytes) },
    { icon: Mic, label: "Voice notes", value: (platform.voice_notes ?? 0).toLocaleString() },
    { icon: CalendarClock, label: "Messages waiting to send", value: (platform.scheduled_pending ?? 0).toLocaleString(), href: "/adminDashboard/messages" },
    { icon: AlertTriangle, label: "Delivery problems (24h)", value: (platform.delivery_problems_24h ?? 0).toLocaleString(), alert: platform.delivery_problems_24h > 0, href: "/adminDashboard/messages" },
    { icon: ShieldAlert, label: "Failed sign-ins (24h)", value: (platform.failed_logins_24h ?? 0).toLocaleString(), alert: platform.failed_logins_24h > 20, href: "/adminDashboard/logs" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-white">
              Welcome back, {user?.full_name || "Administrator"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Here&apos;s what&apos;s happening across SureTalk right now.
            </p>
          </div>
          {data && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-white bg-gradient-to-r ${status.pill}`}>
                <Server className="w-5 h-5" />
                <span className="font-medium">{status.label}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Updated {timeAgo(lastUpdated)}</div>
            </div>
          )}
        </div>
      </motion.div>

      {error && (
        <div role="alert" className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>
              {data ? 'Couldn\'t refresh the dashboard — showing the last loaded numbers.' : 'Couldn\'t load the dashboard.'} ({error})
            </span>
          </div>
          <button onClick={() => load()} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium">
            Try again
          </button>
        </div>
      )}

      {data && (
        <>
          {/* KPI cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              const card = (
                <div className="glass rounded-2xl p-6 card-hover h-full" title={stat.hint}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {stat.badge !== undefined && stat.badge !== null && (
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${stat.badge >= 0
                        ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                        {stat.badge >= 0 ? '+' : ''}{stat.badge}%
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{stat.value}</h3>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    {stat.label}
                    {stat.href && <ArrowUpRight className={`${statCardArrowClass} text-brand-500`} />}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{stat.detail}</p>
                </div>
              );
              return stat.href
                ? <Link key={stat.label} href={stat.href} className={statCardLinkClass}>{card}</Link>
                : <div key={stat.label}>{card}</div>;
            })}
          </motion.div>

          <div className="space-y-8">
            {/* Revenue & sign-ups */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="glass rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white">Revenue growth</h2>
                  <p className="text-gray-600 dark:text-gray-400">Monthly revenue and new sign-ups, last 6 months</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-brand-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">New users</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-[300px]">
                {data.monthlyRevenue?.some(m => m.revenue > 0 || m.new_users > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.monthlyRevenue} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" strokeOpacity={0.25} vertical={false} />
                      <XAxis dataKey="month" stroke="#9CA3AF" tickLine={false} />
                      <YAxis yAxisId="revenue" stroke="#9CA3AF" tickLine={false} width={60}
                        tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`} />
                      <YAxis yAxisId="users" orientation="right" stroke="#9CA3AF" tickLine={false} allowDecimals={false} width={40} />
                      <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(156,163,175,0.1)' }} />
                      <Bar yAxisId="revenue" dataKey="revenue" fill="#5B4CF5" radius={[6, 6, 0, 0]} maxBarSize={48} />
                      <Line yAxisId="users" type="monotone" dataKey="new_users" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No payments or sign-ups in the last 6 months yet
                  </div>
                )}
              </div>
              {revenue.other_currencies?.length > 0 && (
                <p className="text-xs text-gray-500 mt-3">
                  Shows USD payments only. Payments in {revenue.other_currencies.join(', ')} aren&apos;t included.
                </p>
              )}
            </motion.div>

            {/* Recent activity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="glass rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white">Recent activity</h2>
                  <p className="text-gray-600 dark:text-gray-400">Latest events across the platform</p>
                </div>
                <Link href="/adminDashboard/logs" className="flex items-center gap-2 text-brand-600 hover:text-brand-700 transition-colors font-medium mt-2 sm:mt-0">
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {data.recentActivity?.length > 0 ? data.recentActivity.map((activity) => {
                  const style = ACTIVITY_STYLES[activity.status] || ACTIVITY_STYLES.info;
                  const Icon = style.icon;
                  return (
                    <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${style.wrap}`}>
                          <Icon className={`w-5 h-5 ${style.color}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-800 dark:text-white truncate">
                            {activity.user_name || activity.user_email || "System"}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.action}
                            {activity.service && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                {activity.service}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 sm:text-right flex-shrink-0">{timeAgo(activity.time)}</div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-gray-500">No activity in the last 7 days</div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* System health */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="glass rounded-2xl p-6 flex flex-col">
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white">System health</h2>
                <p className="text-xs text-gray-500 mt-1">Live checks · last run {timeAgo(data.healthCheckedAt)}</p>
              </div>
              <div className="space-y-4 flex-1">
                {data.systemHealth?.map((service) => {
                  const s = SERVICE_STATUS[service.status] || SERVICE_STATUS.down;
                  return (
                    <div key={service.service} className="flex items-center justify-between gap-3 text-sm" title={service.error || undefined}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{service.service}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`font-medium ${s.text}`}>{s.label}</span>
                        {service.latency_ms !== null && service.status !== 'down' && (
                          <span className="text-gray-500 dark:text-gray-400"> · {service.latency_ms}ms</span>
                        )}
                        {service.status === 'down' && service.error && (
                          <p className="text-xs text-red-500 max-w-[11rem] truncate">{service.error}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={runSystemCheck}
                disabled={checking}
                className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all disabled:opacity-60"
              >
                {checking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {checking ? 'Checking...' : 'Run system check'}
              </button>
            </motion.div>

            {/* Quick actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="glass rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white mb-6">Quick actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all hover:scale-[1.02] group"
                    >
                      <div className={`p-3 rounded-xl ${action.color} text-white mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Platform numbers */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-gradient-to-br from-brand-600 to-accent-500 rounded-2xl p-6 text-white">
              <h3 className="font-display text-lg font-bold mb-1">Platform</h3>
              <p className="text-sm text-white/80 mb-5">Usage and things that may need attention</p>
              <div className="space-y-1">
                {platformRows.map((row) => {
                  const Icon = row.icon;
                  const content = (
                    <>
                      <span className="flex items-center gap-2 text-white/85 text-sm">
                        <Icon className="w-4 h-4" />
                        {row.label}
                      </span>
                      <span className={`font-semibold ${row.alert ? 'px-2 py-0.5 rounded-full bg-white text-red-600' : ''}`}>{row.value}</span>
                    </>
                  );
                  return row.href ? (
                    <Link key={row.label} href={row.href} className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-white/10 transition-colors">
                      {content}
                    </Link>
                  ) : (
                    <div key={row.label} className="flex items-center justify-between py-2">{content}</div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
