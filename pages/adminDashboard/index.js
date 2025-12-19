// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\adminDashboard\index.js
import { useEffect, useState } from "react";
import Layout from "../../components/dashboard/Layout";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { api } from "../../utils/api";
import { 
  Users, 
  BarChart3, 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Server,
  MessageSquare,
  Clock,
  Eye,
  Download,
  Settings,
  Bell,
  Zap,
  ChevronRight
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export default function AdminHome() {

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const profile = await api.getProfile();
  
        if (!profile.data.is_admin || profile.data.admin_status !== 'approved') {
          router.replace('/admin/login');
        }
      } catch {
        router.replace('/admin/login');
      }
    };
  
    checkAdmin();
  }, []);
  

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  
  // Stats cards data
  const stats = [
    {
      label: "Total Users",
      value: "1,247",
      change: "+12%",
      trend: "up",
      icon: <Users className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Premium Users",
      value: "312",
      change: "+8%",
      trend: "up",
      icon: <Shield className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Active Now",
      value: "89",
      change: "-3%",
      trend: "down",
      icon: <Activity className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Revenue",
      value: "$4,256",
      change: "+18%",
      trend: "up",
      icon: <DollarSign className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
    },
  ];

  // Revenue data
  const revenueData = [
    { month: 'Jan', revenue: 3200, users: 800 },
    { month: 'Feb', revenue: 3800, users: 920 },
    { month: 'Mar', revenue: 4100, users: 1050 },
    { month: 'Apr', revenue: 3800, users: 1100 },
    { month: 'May', revenue: 4256, users: 1247 },
  ];

  // System health data
  const systemHealth = [
    { service: 'API Gateway', status: 95, latency: '42ms', color: 'bg-green-500' },
    { service: 'Database', status: 98, latency: '12ms', color: 'bg-green-500' },
    { service: 'Storage', status: 82, latency: '85ms', color: 'bg-yellow-500' },
    { service: 'Twilio', status: 100, latency: '28ms', color: 'bg-green-500' },
    { service: 'Billing', status: 99, latency: '32ms', color: 'bg-green-500' },
  ];

  // Recent activity
  const recentActivity = [
    { 
      user: "John Doe", 
      action: "Created voice will", 
      time: "2 min ago", 
      status: "success",
      icon: <MessageSquare className="w-4 h-4" />
    },
    { 
      user: "Sarah Smith", 
      action: "Upgraded to Premium", 
      time: "15 min ago", 
      status: "success",
      icon: <Shield className="w-4 h-4" />
    },
    { 
      user: "Mike Johnson", 
      action: "Payment failed", 
      time: "1 hour ago", 
      status: "error",
      icon: <AlertTriangle className="w-4 h-4" />
    },
    { 
      user: "Emma Wilson", 
      action: "Scheduled message", 
      time: "2 hours ago", 
      status: "success",
      icon: <Clock className="w-4 h-4" />
    },
    { 
      user: "Robert Brown", 
      action: "Legacy message sent", 
      time: "3 hours ago", 
      status: "success",
      icon: <Bell className="w-4 h-4" />
    },
  ];

  // Quick actions
  const quickActions = [
    { icon: <Eye className="w-5 h-5" />, label: "View Logs", color: "bg-blue-500" },
    { icon: <Download className="w-5 h-5" />, label: "Export Data", color: "bg-green-500" },
    { icon: <Settings className="w-5 h-5" />, label: "System Settings", color: "bg-purple-500" },
    { icon: <Shield className="w-5 h-5" />, label: "Release Will", color: "bg-red-500" },
  ];

  return (    
    <Layout type="admin">
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
              Admin Control Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor system health, manage users, and review platform metrics.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl flex items-center gap-2">
              <Server className="w-5 h-5" />
              <span className="font-medium">System Active</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: Just now
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Revenue Chart and Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Revenue Growth</h2>
                <p className="text-gray-600 dark:text-gray-400">Monthly revenue vs user growth</p>
              </div>
              <div className="flex items-center gap-4">
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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
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
                    dataKey="users" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Activity</h2>
                <p className="text-gray-600 dark:text-gray-400">System-wide user activities</p>
              </div>
              <button className="flex items-center gap-2 text-brand-600 hover:text-brand-700 transition-colors font-medium">
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 
                           dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4
                      ${activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      <div className={activity.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                        {activity.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">{activity.user}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - System Health and Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        />
          {/* System Health */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">System Health</h2>
            <div className="space-y-6">
              {systemHealth.map((service, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${service.color}`} />
                      <span>{service.service}</span>
                    </div>
                    <span>{service.status}% • {service.latency}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        service.status >= 90 ? 'bg-green-500' :
                        service.status >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${service.status}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 
                           dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all 
                           hover:scale-[1.02] group"
                >
                  <div className={`p-3 rounded-xl ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-r from-brand-600 to-accent-500 rounded-2xl p-6">
            <div className="text-white mb-4">
              <h3 className="text-lg font-bold mb-1">System Status</h3>
              <p className="text-sm opacity-90">All systems operational</p>
            </div>
            
            <div className="space-y-3 mb-4">
              {[
                { label: 'API Requests', value: '1.2k/min', status: 'good' },
                { label: 'Storage Health', value: '98%', status: 'good' },
                { label: 'Backup Status', value: 'Up to date', status: 'good' },
                { label: 'Security Scan', value: 'No threats', status: 'good' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">{item.label}</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm 
                             text-white py-3 rounded-xl font-medium hover:bg-white/30 transition-all">
              <Zap className="w-4 h-4" />
              Run System Check
            </button>
          </div>
        </div>      
    </Layout>   
  );
}