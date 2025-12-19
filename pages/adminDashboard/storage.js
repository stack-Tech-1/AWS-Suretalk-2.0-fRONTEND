// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\adminDashboard\storage.js
import Layout from "../../components/dashboard/Layout";
import { motion } from "framer-motion";
import { 
  Database,
  HardDrive,
  Download,
  Upload,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Server,
  Clock,
  DollarSign,
  PieChart,
  BarChart3,
  MoreVertical,
  RefreshCw,
  Settings
} from "lucide-react";
import { useState } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function StorageManagement() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");

  const timeframes = [
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
    { id: "90d", label: "Last 90 Days" },
    { id: "1y", label: "Last Year" },
  ];

  const storageData = [
    { name: 'Voice Notes', value: 45, color: '#3b82f6' },
    { name: 'Legacy Vault', value: 30, color: '#8b5cf6' },
    { name: 'System Logs', value: 15, color: '#10b981' },
    { name: 'Backups', value: 10, color: '#f59e0b' },
  ];

  const costData = [
    { month: 'Jan', cost: 320, usage: 120 },
    { month: 'Feb', cost: 380, usage: 145 },
    { month: 'Mar', cost: 410, usage: 165 },
    { month: 'Apr', cost: 380, usage: 155 },
    { month: 'May', cost: 425, usage: 185 },
    { month: 'Jun', cost: 480, usage: 210 },
  ];

  const storageStats = [
    {
      label: "Total Storage",
      value: "4.8 TB",
      change: "+12%",
      icon: HardDrive,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Monthly Cost",
      value: "$425",
      change: "+8%",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Active Users",
      value: "1,247",
      change: "+5%",
      icon: Server,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Storage Health",
      value: "98%",
      change: "+2%",
      icon: CheckCircle,
      color: "from-orange-500 to-red-500",
    },
  ];

  const storageBuckets = [
    {
      name: "suertalk-voice-notes",
      region: "us-east-1",
      size: "2.1 TB",
      objects: "124,567",
      cost: "$215",
      status: "healthy",
      lastBackup: "2 hours ago",
    },
    {
      name: "suertalk-legacy-vault",
      region: "us-east-1",
      size: "1.8 TB",
      objects: "45,231",
      cost: "$145",
      status: "healthy",
      lastBackup: "4 hours ago",
    },
    {
      name: "suertalk-legacy-wills",
      region: "us-east-1",
      size: "0.6 TB",
      objects: "12,456",
      cost: "$45",
      status: "warning",
      lastBackup: "1 day ago",
    },
    {
      name: "suertalk-backups",
      region: "us-west-2",
      size: "0.3 TB",
      objects: "8,912",
      cost: "$20",
      status: "healthy",
      lastBackup: "Now",
    },
  ];

  const lifecycleRules = [
    {
      name: "Voice Notes Auto-Delete",
      description: "Delete notes older than 180 days (LITE tier)",
      status: "active",
      transitions: 3,
      lastRun: "Yesterday",
    },
    {
      name: "Legacy Vault Archive",
      description: "Move to Glacier after 90 days",
      status: "active",
      transitions: 2,
      lastRun: "Today",
    },
    {
      name: "Log Retention",
      description: "Keep logs for 30 days, then delete",
      status: "active",
      transitions: 1,
      lastRun: "2 hours ago",
    },
    {
      name: "Temp Files Cleanup",
      description: "Delete temporary files after 7 days",
      status: "paused",
      transitions: 1,
      lastRun: "1 week ago",
    },
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
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Storage Management
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor storage usage, costs, and manage lifecycle policies
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 
                             text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 
                             dark:hover:bg-brand-900/20 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                             text-white rounded-xl hover:shadow-lg transition-all">
              <Settings className="w-4 h-4" />
              Configure
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
        {storageStats.map((stat, index) => (
          <div 
            key={index}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                <div className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className={`flex items-center text-sm font-medium ${
              stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${stat.change.startsWith('+') ? '' : 'rotate-180'}`} />
              {stat.change}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
      >
        {/* Storage Distribution */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Storage Distribution</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">By content type</p>
            </div>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={storageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                >
                  {storageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Over Time */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Storage Cost Trend</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 6 months</p>
            </div>
            <div className="flex gap-2">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.id}
                  onClick={() => setSelectedTimeframe(timeframe.id)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${
                    selectedTimeframe === timeframe.id
                      ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData}>
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
                <Legend />
                <Bar dataKey="cost" fill="#3B82F6" name="Cost ($)" />
                <Bar dataKey="usage" fill="#10B981" name="Usage (GB)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Storage Buckets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Storage Buckets</h3>
            <p className="text-gray-600 dark:text-gray-400">AWS S3 bucket details and status</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 
                           text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 
                           dark:hover:bg-brand-900/20 transition-colors">
            <Upload className="w-4 h-4" />
            Upload Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {storageBuckets.map((bucket) => (
            <div key={bucket.name} className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <h4 className="font-bold text-gray-800 dark:text-white">{bucket.name}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{bucket.region}</span>
                    <span>{bucket.objects} objects</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  bucket.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                }`}>
                  {bucket.status === 'healthy' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  {bucket.status.charAt(0).toUpperCase() + bucket.status.slice(1)}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Storage Used</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{bucket.size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Cost</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{bucket.cost}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Backup</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{bucket.lastBackup}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex-1 px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                               rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors 
                               flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Details
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Lifecycle Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Lifecycle Rules</h3>
            <p className="text-gray-600 dark:text-gray-400">Automated storage management policies</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                           text-white rounded-xl hover:shadow-lg transition-all">
            <Settings className="w-4 h-4" />
            Add Rule
          </button>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Rule Name
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Transitions
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Last Run
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {lifecycleRules.map((rule) => (
                  <tr key={rule.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800 dark:text-white">{rule.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${
                        rule.status === 'active' ? 
                          'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {rule.status === 'active' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-800 dark:text-white">{rule.transitions}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{rule.lastRun}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded">
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}