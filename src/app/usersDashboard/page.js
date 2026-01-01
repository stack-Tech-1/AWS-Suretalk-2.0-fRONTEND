"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mic, 
  Users, 
  Shield, 
  Calendar, 
  Play, 
  Download, 
  Share2, 
  Star, 
  TrendingUp,
  Clock,
  Volume2,
  MoreVertical,
  Plus,
  Headphones,
  ArrowUpRight,
  Bell,
  Zap,
  ChevronRight
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function DashboardHome() {
  const [playingAudio, setPlayingAudio] = useState(null);

  // Stats cards data
  const stats = [
    { 
      icon: <Mic className="w-5 h-5" />, 
      label: "Voice Notes", 
      value: "24", 
      change: "+12%", 
      color: "from-blue-500 to-cyan-500",
      trend: "up"
    },
    { 
      icon: <Users className="w-5 h-5" />, 
      label: "Contacts", 
      value: "7/9", 
      change: "+2", 
      color: "from-green-500 to-emerald-500",
      trend: "up"
    },
    { 
      icon: <Shield className="w-5 h-5" />, 
      label: "Vault Items", 
      value: "3", 
      change: "Protected", 
      color: "from-purple-500 to-pink-500",
      trend: "secure"
    },
    { 
      icon: <Calendar className="w-5 h-5" />, 
      label: "Scheduled", 
      value: "2", 
      change: "Upcoming", 
      color: "from-orange-500 to-red-500",
      trend: "active"
    },
  ];

  // Activity chart data
  const activityData = [
    { day: 'Mon', notes: 4, listens: 12 },
    { day: 'Tue', notes: 2, listens: 8 },
    { day: 'Wed', notes: 6, listens: 15 },
    { day: 'Thu', notes: 3, listens: 10 },
    { day: 'Fri', notes: 7, listens: 18 },
    { day: 'Sat', notes: 5, listens: 14 },
    { day: 'Sun', notes: 8, listens: 20 },
  ];

  // Storage distribution data
  const storageData = [
    { name: 'Voice Notes', value: 45, color: '#3b82f6' },
    { name: 'Vault Storage', value: 30, color: '#8b5cf6' },
    { name: 'Backups', value: 15, color: '#10b981' },
    { name: 'System', value: 10, color: '#f59e0b' },
  ];

  // Recent recordings
  const recentRecordings = [
    { 
      id: 1, 
      title: "Birthday Message for Mom", 
      duration: "2:45", 
      date: "Today, 10:30 AM", 
      size: "3.2 MB",
      favorite: true,
      type: "personal"
    },
    { 
      id: 2, 
      title: "Project Meeting Notes", 
      duration: "5:12", 
      date: "Yesterday, 3:15 PM", 
      size: "7.1 MB",
      favorite: false,
      type: "work"
    },
    { 
      id: 3, 
      title: "Voice Will - Important", 
      duration: "8:30", 
      date: "Dec 5, 2024", 
      size: "12.4 MB",
      favorite: true,
      type: "legacy"
    },
    { 
      id: 4, 
      title: "Daily Journal Entry", 
      duration: "1:23", 
      date: "Dec 4, 2024", 
      size: "2.1 MB",
      favorite: false,
      type: "personal"
    },
  ];

  // Quick actions
  const quickActions = [
    { icon: <Plus className="w-5 h-5" />, label: "New Recording", color: "bg-blue-500" },
    { icon: <Users className="w-5 h-5" />, label: "Add Contact", color: "bg-green-500" },
    { icon: <Calendar className="w-5 h-5" />, label: "Schedule Message", color: "bg-purple-500" },
    { icon: <Shield className="w-5 h-5" />, label: "Secure in Vault", color: "bg-red-500" },
  ];

  return (    
    <div>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Welcome back, <span className="gradient-text">John!</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              You have 2 scheduled messages and 3 new voice notes to review.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Premium Plan</span>
            </div>
            <button className="px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                           rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
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
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' :
                stat.trend === 'secure' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' :
                'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{stat.value}</h3>
            <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts and Recent Recordings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Weekly Activity</h2>
                <p className="text-gray-600 dark:text-gray-400">Voice notes recorded vs listened</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Listens</span>
                </div>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
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
                    dataKey="listens" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="notes" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Recordings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Recordings</h2>
                <p className="text-gray-600 dark:text-gray-400">Your latest voice notes</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                               text-white rounded-xl hover:shadow-lg transition-all">
                <Plus className="w-4 h-4" />
                New Recording
              </button>
            </div>

            <div className="space-y-4">
              {recentRecordings.map((recording) => (
                <div 
                  key={recording.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 
                           hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                >
                  <button
                    onClick={() => setPlayingAudio(playingAudio === recording.id ? null : recording.id)}
                    className={`p-3 rounded-xl transition-all ${
                      playingAudio === recording.id 
                        ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-brand-500 hover:to-accent-500 hover:text-white'
                    }`}
                  >
                    {playingAudio === recording.id ? 
                      <Headphones className="w-5 h-5" /> : 
                      <Play className="w-5 h-5" />
                    }
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-800 dark:text-white truncate">
                        {recording.title}
                      </h3>
                      {recording.favorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        recording.type === 'legacy' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                        recording.type === 'work' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      }`}>
                        {recording.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        {recording.duration}
                      </span>
                      <span>{recording.size}</span>
                      <span>{recording.date}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <a href="/dashboard/voice-notes" className="flex items-center justify-center gap-2 
                text-brand-600 hover:text-brand-700 transition-colors font-medium">
                View all recordings
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Storage, Quick Actions, Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        >
          {/* Storage Usage with Pie Chart */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Storage Usage</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">2.4 GB of 5 GB used</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>

            <div className="flex items-center gap-6">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={storageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {storageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 space-y-3">
                {storageData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full mt-6 px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                           rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors font-medium">
              Upgrade Storage
            </button>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
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

          {/* Recent Activity */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { time: "10:30 AM", action: "Recorded new voice note", user: "You", color: "bg-blue-500" },
                { time: "Yesterday", action: "Added new contact", user: "You", color: "bg-green-500" },
                { time: "Dec 5", action: "Scheduled legacy message", user: "You", color: "bg-purple-500" },
                { time: "Dec 4", action: "Upgraded to Premium", user: "System", color: "bg-yellow-500" },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-2 rounded-full ${activity.color}`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-white">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                        {activity.user}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Upgrade Card */}
          <div className="bg-gradient-to-r from-brand-600 to-accent-500 rounded-2xl p-6">
            <div className="text-white mb-4">
              <h3 className="text-lg font-bold mb-1">Upgrade to Legacy Vault</h3>
              <p className="text-sm opacity-90">Get permanent storage & advanced features</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Legacy Vault Premium</span>
                <span className="text-white/80 text-sm">$9.99/mo</span>
              </div>
              <ul className="text-white/80 text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Permanent storage
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Voice Wills
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Scheduled legacy messages
                </li>
              </ul>
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 bg-white text-brand-600 
                             py-3 rounded-xl font-medium hover:bg-gray-100 transition-all">
              <Zap className="w-4 h-4" />
              Upgrade Now
            </button>
          </div>
        </motion.div>
      </div>
    </div>   
  );
}