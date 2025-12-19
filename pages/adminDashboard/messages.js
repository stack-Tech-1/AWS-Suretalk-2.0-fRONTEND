// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\adminDashboard\messages.js
import Layout from "../../components/dashboard/Layout";
import { motion } from "framer-motion";
import { 
  Clock,
  Search,
  Filter,
  MoreVertical,
  User,
  Calendar,
  Bell,
  Mail,
  Play,
  Pause,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function ScheduledMessages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Messages" },
    { id: "upcoming", label: "Upcoming" },
    { id: "sent", label: "Sent" },
    { id: "failed", label: "Failed" },
    { id: "paused", label: "Paused" },
  ];

  const deliveryData = [
    { hour: '00:00', sent: 4, failed: 0 },
    { hour: '04:00', sent: 8, failed: 1 },
    { hour: '08:00', sent: 15, failed: 2 },
    { hour: '12:00', sent: 22, failed: 1 },
    { hour: '16:00', sent: 18, failed: 0 },
    { hour: '20:00', sent: 12, failed: 1 },
  ];

  const messages = [
    {
      id: 1,
      title: "Birthday Surprise",
      user: "John Doe",
      recipient: "Sarah Johnson",
      scheduledFor: "2024-12-25 10:00",
      status: "scheduled",
      method: "phone",
      attempts: 0,
      priority: "high",
    },
    {
      id: 2,
      title: "Anniversary Message",
      user: "Sarah Smith",
      recipient: "Michael Chen",
      scheduledFor: "2025-03-20 14:30",
      status: "scheduled",
      method: "phone",
      attempts: 0,
      priority: "medium",
    },
    {
      id: 3,
      title: "Project Completion",
      user: "Michael Chen",
      recipient: "Team Members",
      scheduledFor: "2025-01-15 09:00",
      status: "upcoming",
      method: "email",
      attempts: 0,
      priority: "low",
    },
    {
      id: 4,
      title: "Christmas Greeting",
      user: "Emma Wilson",
      recipient: "Family Group",
      scheduledFor: "2024-12-25 08:00",
      status: "sent",
      method: "phone",
      attempts: 1,
      priority: "high",
    },
    {
      id: 5,
      title: "Legacy Instructions",
      user: "Robert Brown",
      recipient: "Executor",
      scheduledFor: "Conditional",
      status: "paused",
      method: "email",
      attempts: 0,
      priority: "critical",
    },
    {
      id: 6,
      title: "Meeting Reminder",
      user: "Jessica Davis",
      recipient: "Client",
      scheduledFor: "2025-01-10 15:00",
      status: "failed",
      method: "phone",
      attempts: 3,
      priority: "medium",
    },
  ];

  const filteredMessages = messages.filter(message => {
    if (selectedFilter === "all") return true;
    return message.status === selectedFilter;
  }).filter(message => 
    message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.recipient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Messages", value: "156", color: "from-blue-500 to-cyan-500" },
    { label: "Pending", value: "24", color: "from-yellow-500 to-orange-500" },
    { label: "Success Rate", value: "98.2%", color: "from-green-500 to-emerald-500" },
    { label: "Failed Today", value: "2", color: "from-red-500 to-pink-500" },
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
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Scheduled Messages
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage all scheduled voice message deliveries
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
              <Play className="w-4 h-4" />
              Run Dispatcher
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats and Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
      >
        {/* Stats Grid */}
        <div className="lg:col-span-1 grid grid-cols-2 gap-4">
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
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Today's Delivery Performance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Messages sent vs failed by hour</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Failed</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deliveryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.75rem'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sent" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="failed" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
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
                placeholder="Search messages by title, user, or recipient..."
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
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Messages Table */}
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
                  Message
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  User
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Scheduled For
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Priority
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMessages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`p-1 rounded ${
                          message.method === 'phone' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'
                        }`}>
                          {message.method === 'phone' ? (
                            <Bell className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Mail className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {message.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        To: {message.recipient}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{message.user}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{message.scheduledFor}</span>
                    </div>
                    {message.attempts > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Attempts: {message.attempts}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${
                      message.status === 'scheduled' || message.status === 'upcoming' ? 
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      message.status === 'sent' ? 
                        'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      message.status === 'failed' ? 
                        'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {message.status === 'sent' && <CheckCircle className="w-3 h-3" />}
                      {message.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                      message.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                      message.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                      message.priority === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      {message.status === 'scheduled' || message.status === 'upcoming' ? (
                        <>
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <Play className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <Pause className="w-4 h-4" />
                          </button>
                        </>
                      ) : message.status === 'paused' ? (
                        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                          <Play className="w-4 h-4" />
                        </button>
                      ) : null}
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
        {filteredMessages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No scheduled messages found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </motion.div>
    </Layout>
  );
}