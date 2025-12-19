// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\adminDashboard\logs.js
import Layout from "../../components/dashboard/Layout";
import { motion } from "framer-motion";
import { 
  FileText,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Info,
  Bug,
  Server,
  Download,
  RefreshCw,
  Eye,
  Trash2,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

export default function SystemLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");

  const timeframes = [
    { id: "1h", label: "Last Hour" },
    { id: "24h", label: "Last 24 Hours" },
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
  ];

  const filters = [
    { id: "all", label: "All Logs" },
    { id: "error", label: "Errors" },
    { id: "warning", label: "Warnings" },
    { id: "info", label: "Info" },
    { id: "debug", label: "Debug" },
    { id: "security", label: "Security" },
  ];

  const logs = [
    {
      id: 1,
      timestamp: "2024-12-09 14:32:15",
      level: "error",
      service: "API Gateway",
      message: "Failed to process voice recording upload",
      user: "john@example.com",
      ip: "192.168.1.100",
      details: "Timeout after 30 seconds",
    },
    {
      id: 2,
      timestamp: "2024-12-09 14:30:22",
      level: "warning",
      service: "Database",
      message: "Connection pool nearing capacity",
      user: "system",
      ip: "127.0.0.1",
      details: "85% of connections in use",
    },
    {
      id: 3,
      timestamp: "2024-12-09 14:28:45",
      level: "info",
      service: "Twilio",
      message: "Scheduled message delivered successfully",
      user: "sarah@example.com",
      ip: "192.168.1.101",
      details: "Message ID: MSG-12345",
    },
    {
      id: 4,
      timestamp: "2024-12-09 14:25:10",
      level: "security",
      service: "Authentication",
      message: "Failed login attempt",
      user: "unknown",
      ip: "203.0.113.5",
      details: "3 attempts from same IP",
    },
    {
      id: 5,
      timestamp: "2024-12-09 14:22:33",
      level: "debug",
      service: "Storage",
      message: "File upload completed",
      user: "michael@example.com",
      ip: "192.168.1.102",
      details: "File size: 15.2MB",
    },
    {
      id: 6,
      timestamp: "2024-12-09 14:20:15",
      level: "error",
      service: "Billing",
      message: "Payment processing failed",
      user: "emma@example.com",
      ip: "192.168.1.103",
      details: "Card declined",
    },
  ];

  const filteredLogs = logs.filter(log => {
    if (selectedFilter === "all") return true;
    return log.level === selectedFilter;
  }).filter(log => 
    log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.ip.includes(searchQuery)
  );

  const stats = [
    { label: "Total Logs", value: "12,457", level: "all", color: "from-gray-500 to-gray-600" },
    { label: "Errors", value: "42", level: "error", color: "from-red-500 to-pink-500" },
    { label: "Warnings", value: "128", level: "warning", color: "from-yellow-500 to-orange-500" },
    { label: "Security", value: "8", level: "security", color: "from-purple-500 to-indigo-500" },
  ];

  const getLevelIcon = (level) => {
    switch(level) {
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      case 'debug': return <Bug className="w-4 h-4" />;
      case 'security': return <Server className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'error': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'info': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'debug': return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
      case 'security': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

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
              <div className="p-2 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                System Logs
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor system activity, errors, and security events
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 
                             text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 
                             dark:hover:bg-brand-900/20 transition-colors">
              <Download className="w-4 h-4" />
              Export Logs
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                             text-white rounded-xl hover:shadow-lg transition-all">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats and Timeframe Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
      >
        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                  <div className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                    {getLevelIcon(stat.level)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeframe Selector */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Time Range</h3>
          <div className="flex flex-wrap gap-2">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe.id}
                onClick={() => setSelectedTimeframe(timeframe.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTimeframe === timeframe.id
                    ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search logs by message, service, user, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Timestamp
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Level
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Service
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Message
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  User
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Calendar className="w-3 h-3" />
                        <span>{log.timestamp.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{log.timestamp.split(' ')[1]}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${getLevelColor(log.level)}`}>
                      {getLevelIcon(log.level)}
                      {log.level.charAt(0).toUpperCase() + log.level.slice(1)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{log.service}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm text-gray-800 dark:text-white">{log.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{log.details}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <User className="w-3 h-3" />
                        <span>{log.user}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        IP: {log.ip}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No logs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search, filters, or timeframe.
            </p>
          </div>
        )}
      </motion.div>

      {/* Log Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Log Retention */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Log Retention</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Error Logs</span>
                <span>90 days</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Info Logs</span>
                <span>30 days</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Debug Logs</span>
                <span>7 days</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-300 
                             dark:border-gray-600 hover:border-red-500 transition-colors">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">Clear Old Logs</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remove logs older than 30 days</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-300 
                             dark:border-gray-600 hover:border-blue-500 transition-colors">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">Archive Logs</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Download complete log archive</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-300 
                             dark:border-gray-600 hover:border-green-500 transition-colors">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">Run Log Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Analyze patterns and trends</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Log System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">4.2 GB</p>
              </div>
              <Server className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Logs per Second</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">24.5</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <button className="w-full px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                             text-white rounded-xl hover:shadow-lg transition-all">
              View Detailed Metrics
            </button>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}