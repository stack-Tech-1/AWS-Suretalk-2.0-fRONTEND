import Layout from "../../components/dashboard/Layout";
import { motion } from "framer-motion";
import { Users, BarChart3, Shield, Activity, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminHome() {
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
      icon: <Activity className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Storage Used",
      value: "128 GB",
      change: "+5%",
      trend: "up",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
    },
  ];

  const recentActivity = [
    { user: "John Doe", action: "Created voice will", time: "2 min ago", status: "success" },
    { user: "Sarah Smith", action: "Upgraded to Premium", time: "15 min ago", status: "success" },
    { user: "Mike Johnson", action: "Payment failed", time: "1 hour ago", status: "error" },
    { user: "Emma Wilson", action: "Scheduled message", time: "2 hours ago", status: "success" },
    { user: "Robert Brown", action: "Legacy message sent", time: "3 hours ago", status: "success" },
  ];

  return (
    <Layout type="admin">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Control Center
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor system health, manage users, and review platform metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} 
                            flex items-center justify-center`}>
                <div className="text-white">
                  {stat.icon}
                </div>
              </div>
              <div className={`flex items-center text-sm font-medium
                ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                {stat.change}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <button className="text-brand-600 hover:text-brand-700 text-sm font-medium">
                View All →
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg 
                           hover:bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4
                      ${activity.status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {activity.status === 'success' ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{activity.user}</h3>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">System Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>API Response Time</span>
                  <span>42ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Storage Health</span>
                  <span>98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Twilio Status</span>
                  <span>Active</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-6">
            <h2 className="text-white text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-white/20 hover:bg-white/30 text-white 
                               py-3 rounded-lg font-medium transition-colors">
                Release Voice Will
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white 
                               py-3 rounded-lg font-medium transition-colors">
                View Pending Messages
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white 
                               py-3 rounded-lg font-medium transition-colors">
                Run System Check
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}