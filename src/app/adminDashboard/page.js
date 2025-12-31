"use client"
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "../../utils/api";
import Link from "next/link";
import { 
  Users, BarChart3, Shield, Activity, TrendingUp, AlertTriangle,
  DollarSign, Server, MessageSquare, Clock, Eye, Download, Settings,
  Bell, Zap, ChevronRight, User, FileText, Archive, CheckCircle, 
  AlertCircle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

export default function AdminHome() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Get user profile
        const profile = await api.getProfile();

        // Check if user is admin AND approved
        if (!profile.data.is_admin || profile.data.admin_status !== 'approved') {
          router.replace('/admin/login');
          return;
        }

        setUser(profile.data);

        // 2. Get dashboard data
        const dashboardResponse = await api.getAdminDashboardOverview();
        setDashboardData(dashboardResponse.data);
        setLastUpdated(new Date());
        
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
        
        // Fallback to mock data for development
        if (process.env.NODE_ENV === 'development') {
          setDashboardData({
            userStats: {
              total_users: 1247,
              premium_users: 312,
              active_now: 89,
              active_users: 856
            },
            revenue: {
              current_month_revenue: 4256,
              transaction_count: 142
            },
            monthlyRevenue: [
              { month: 'Jan', month_num: 1, revenue: 3200, active_users: 800 },
              { month: 'Feb', month_num: 2, revenue: 3800, active_users: 920 },
              { month: 'Mar', month_num: 3, revenue: 4100, active_users: 1050 },
              { month: 'Apr', month_num: 4, revenue: 3800, active_users: 1100 },
              { month: 'May', month_num: 5, revenue: 4256, active_users: 1247 },
            ],
            recentActivity: [
              { user_name: "John Doe", action: "Created voice will", time: new Date(Date.now() - 120000), status: "info" },
              { user_name: "Sarah Smith", action: "Upgraded to Premium", time: new Date(Date.now() - 900000), status: "info" },
              { user_name: "Mike Johnson", action: "Payment failed", time: new Date(Date.now() - 3600000), status: "error" },
              { user_name: "Emma Wilson", action: "Scheduled message", time: new Date(Date.now() - 7200000), status: "info" },
              { user_name: "Robert Brown", action: "Legacy message sent", time: new Date(Date.now() - 10800000), status: "info" },
            ],
            systemHealth: [
              { service: 'API Gateway', avg_latency_ms: 42, health_percentage: 95, status_color: 'bg-green-500' },
              { service: 'Database', avg_latency_ms: 12, health_percentage: 98, status_color: 'bg-green-500' },
              { service: 'Storage', avg_latency_ms: 85, health_percentage: 82, status_color: 'bg-yellow-500' },
              { service: 'Twilio', avg_latency_ms: 28, health_percentage: 100, status_color: 'bg-green-500' },
              { service: 'Billing', avg_latency_ms: 32, health_percentage: 99, status_color: 'bg-green-500' },
            ],
            apiMetrics: { requests_last_minute: 1200 },
            storageMetrics: { total_files: 12543, total_bytes: 15472839475, recent_files: 42 },
            systemStatus: 'operational'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  
  // Format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  // Stats cards data from real data
  const stats = dashboardData ? [
    {
      label: "Total Users",
      value: dashboardData.userStats.total_users.toLocaleString(),
      change: "+12%", // You can calculate this from historical data
      trend: "up",
      icon: <Users className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Premium Users",
      value: dashboardData.userStats.premium_users?.toLocaleString() || "312",
      change: "+8%",
      trend: "up",
      icon: <Shield className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Active Now",
      value: dashboardData.userStats.active_now?.toLocaleString() || "89",
      change: "-3%",
      trend: "down",
      icon: <Activity className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Revenue",
      value: `$${dashboardData.revenue.current_month_revenue.toLocaleString()}`,
      change: "+18%",
      trend: "up",
      icon: <DollarSign className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
    },
  ] : [];

  // Quick actions with real links
  const quickActions = [
    { 
      icon: <Eye className="w-5 h-5" />, 
      label: "View Logs", 
      color: "bg-blue-500",
      href: "/adminDashboard/logs" 
    },
    { 
      icon: <Download className="w-5 h-5" />, 
      label: "Export Data", 
      color: "bg-green-500",
      href: "/adminDashboard/export",
      onClick: () => {
        // Add export functionality
        console.log('Export data');
      }
    },
    { 
      icon: <Settings className="w-5 h-5" />, 
      label: "System Settings", 
      color: "bg-purple-500",
      href: "/adminDashboard/settings" 
    },
    { 
      icon: <Shield className="w-5 h-5" />, 
      label: "Release Will", 
      color: "bg-red-500",
      href: "/adminDashboard/wills" 
    },
  ];

  return (       
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Welcome back, {user?.full_name || "Administrator"} 
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor system health, manage {dashboardData?.userStats.total_users || "1,247"} users, 
              and review platform metrics in real-time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
              dashboardData?.systemStatus === 'operational' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
            }`}>
              <Server className="w-5 h-5" />
              <span className="font-medium">
                {dashboardData?.systemStatus === 'operational' ? 'System Active' : 'System Issues'}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {timeAgo(lastUpdated)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="glass rounded-2xl p-6 card-hover"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                <div className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                  {stat.icon}
                </div>
              </div>
              <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-full
                ${stat.trend === 'up' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 
                  'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                {stat.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{stat.value}</h3>
            <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Main Content - Full width for Revenue and Activity */}
      <div className="space-y-8">
        {/* Revenue Chart - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Revenue Growth</h2>
              <p className="text-gray-600 dark:text-gray-400">Monthly revenue vs user growth</p>
            </div>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Users</span>
              </div>
            </div>
          </div>

          <div className="w-full h-[300px]">
            {dashboardData?.monthlyRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.75rem'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="active_users" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No revenue data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Activity</h2>
              <p className="text-gray-600 dark:text-gray-400">System-wide user activities</p>
            </div>
            <Link 
              href="/adminDashboard/logs"
              className="flex items-center gap-2 text-brand-600 hover:text-brand-700 transition-colors font-medium mt-2 sm:mt-0"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {dashboardData?.recentActivity?.map((activity, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-200 
                         dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center mb-2 sm:mb-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4
                    ${activity.status === 'info' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <div className={activity.status === 'info' ? 'text-green-600' : 'text-red-600'}>
                      {activity.status === 'info' ? 
                        <CheckCircle className="w-5 h-5" /> : 
                        <AlertCircle className="w-5 h-5" />
                      }
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">{activity.user_name || "System"}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 sm:text-right">
                  {timeAgo(activity.time)}
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                No recent activity
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Sidebar Content - System Health, Quick Actions, System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">System Health</h2>
          <div className="space-y-6">
            {dashboardData?.systemHealth?.map((service, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${service.status_color}`} />
                    <span className="font-medium">{service.service}</span>
                  </div>
                  <span>{service.health_percentage}% • {service.avg_latency_ms}ms</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      service.health_percentage >= 90 ? 'bg-green-500' :
                      service.health_percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${service.health_percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              action.href ? (
                <Link
                  key={index}
                  href={action.href}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 
                           dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all 
                           hover:scale-[1.02] group"
                >
                  <div className={`p-3 rounded-xl ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 
                           dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all 
                           hover:scale-[1.02] group"
                >
                  <div className={`p-3 rounded-xl ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </button>
              )
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-r from-brand-600 to-accent-500 rounded-2xl p-6"
        >
          <div className="text-white mb-4">
            <h3 className="text-lg font-bold mb-1">System Status</h3>
            <p className="text-sm opacity-90">
              {dashboardData?.systemStatus === 'operational' 
                ? 'All systems operational' 
                : 'System experiencing issues'}
            </p>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">API Requests</span>
              <span className="text-white font-medium">
                {dashboardData?.apiMetrics?.requests_last_minute 
                  ? `${Math.round(dashboardData.apiMetrics.requests_last_minute / 100) / 10}k/min`
                  : '1.2k/min'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Storage Health</span>
              <span className="text-white font-medium">
                {dashboardData?.storageMetrics?.total_bytes 
                  ? `${Math.round((dashboardData.storageMetrics.recent_files / dashboardData.storageMetrics.total_files) * 100)}%`
                  : '98%'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Backup Status</span>
              <span className="text-white font-medium">Up to date</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Security Scan</span>
              <span className="text-white font-medium">No threats</span>
            </div>
          </div>
          
          <button 
            onClick={() => {
              // Add system check functionality
              console.log('Running system check...');
            }}
            className="w-full flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm 
                     text-white py-3 rounded-xl font-medium hover:bg-white/30 transition-all"
          >
            <Zap className="w-4 h-4" />
            Run System Check
          </button>
        </motion.div>
      </div>    
    </div>  
  );
}