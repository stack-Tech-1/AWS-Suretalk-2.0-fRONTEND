// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\src\app\adminDashboard\messages\page.js
"use client";
import { motion } from "framer-motion";
import { 
  Clock, Search, Filter, MoreVertical, User,
  Calendar, Bell, Mail, Play, Pause, Eye,
  Download, Trash2, CheckCircle, AlertCircle,
  ChevronDown, BarChart3, RefreshCw, ChevronRight,
  Home, FolderOpen, Settings, FileDown
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from "../../../utils/api";

export default function AdminScheduledMessages() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [deliveryData, setDeliveryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1
  });
  
  // Export state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportLoading, setExportLoading] = useState(false);

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/adminDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Scheduled Messages", href: "/adminDashboard/messages", icon: <Clock className="w-4 h-4" />, current: true }
  ];

  const filters = [
    { id: "all", label: "All Messages" },
    { id: "scheduled", label: "Scheduled" },
    { id: "delivered", label: "Delivered" },
    { id: "failed", label: "Failed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "paused", label: "Paused" },
  ];

  // Fetch messages data
  useEffect(() => {
    fetchMessagesData();
    fetchStatsData();
  }, [pagination.page, selectedFilter, searchQuery]);

  const fetchMessagesData = async () => {
    try {
      setLoading(true);
      
      // Check admin access
      const profile = await api.getProfile();
      if (!profile.data.is_admin || profile.data.admin_status !== 'approved') {
        router.replace('/admin/login');
        return;
      }

      // Fetch messages with filters
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(selectedFilter !== 'all' && { status: selectedFilter }),
        ...(searchQuery && { search: searchQuery })
      };

      const response = await api.getAdminScheduledMessages(params);
      setMessages(response.data.messages || []);
      setPagination(response.data.pagination || pagination);

    } catch (error) {
      console.error("Failed to fetch scheduled messages:", error);
      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        setMessages([
          {
            id: "1",
            title: "Birthday Surprise",
            user: "John Doe",
            recipient: "Sarah Johnson",
            scheduledFor: "2024-12-25T10:00:00.000Z",
            status: "scheduled",
            method: "phone",
            attempts: 0,
            priority: "high",
            createdAt: "2024-11-28T00:00:00.000Z"
          },
          {
            id: "2",
            title: "Anniversary Message",
            user: "Sarah Smith",
            recipient: "Michael Chen",
            scheduledFor: "2025-03-20T14:30:00.000Z",
            status: "scheduled",
            method: "phone",
            attempts: 0,
            priority: "medium",
            createdAt: "2024-11-25T00:00:00.000Z"
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStatsData = async () => {
    try {
      setStatsLoading(true);
      const response = await api.getAdminScheduledMessagesStats({ period: 'today' });
      
      if (response.data) {
        setStats({
          totalMessages: response.data.total_messages || 0,
          scheduled: response.data.scheduled || 0,
          successRate: response.data.success_rate || 0,
          failedToday: response.data.failed || 0
        });
        
        // Format delivery data for chart
        if (response.data.deliveryData) {
          const formattedData = response.data.deliveryData.map(item => ({
            hour: item.hour,
            sent: item.sent || 0,
            failed: item.failed || 0
          }));
          setDeliveryData(formattedData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      // Fallback mock stats
      if (process.env.NODE_ENV === 'development') {
        setStats({
          totalMessages: 156,
          scheduled: 24,
          successRate: 98.2,
          failedToday: 2
        });
        setDeliveryData([
          { hour: '00:00', sent: 4, failed: 0 },
          { hour: '04:00', sent: 8, failed: 1 },
          { hour: '08:00', sent: 15, failed: 2 },
          { hour: '12:00', sent: 22, failed: 1 },
          { hour: '16:00', sent: 18, failed: 0 },
          { hour: '20:00', sent: 12, failed: 1 },
        ]);
      }
    } finally {
      setStatsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.updateScheduledMessageStatus(id, newStatus);
      alert(`Message status updated to ${newStatus}`);
      fetchMessagesData(); // Refresh data
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(`Failed to update status: ${error.message}`);
    }
  };

  // Handle cancellation
  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this message?")) return;
    
    try {
      await api.cancelScheduledMessage(id);
      alert("Message cancelled successfully");
      fetchMessagesData(); // Refresh data
    } catch (error) {
      console.error("Failed to cancel message:", error);
      alert(`Failed to cancel message: ${error.message}`);
    }
  };

  // Handle export
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const filters = {
        status: selectedFilter !== 'all' ? selectedFilter : undefined,
        search: searchQuery || undefined
      };
      
      // Remove undefined filters
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const response = await api.exportScheduledMessages(exportFormat, filters);
      
      if (exportFormat === 'csv') {
        // Download CSV file
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scheduled_messages_export_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // For JSON, you might want to display or download
        console.log("JSON Export:", response);
        alert(`Exported ${response.data?.length || 0} messages as JSON`);
      }
      
      setShowExportModal(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export scheduled messages");
    } finally {
      setExportLoading(false);
    }
  };

  // Replace the calculateStats function with this:

const calculateStats = () => {
  // Safely parse all values from stats
  const totalMessages = parseInt(stats?.totalMessages) || 0;
  const scheduled = parseInt(stats?.scheduled) || 0;
  
  // Handle success rate carefully - it's coming as a string
  let successRate = 0;
  if (stats?.successRate !== undefined && stats?.successRate !== null) {
    if (typeof stats.successRate === 'string') {
      successRate = parseFloat(stats.successRate) || 0;
    } else if (typeof stats.successRate === 'number') {
      successRate = stats.successRate;
    }
  }
  
  const failedToday = parseInt(stats?.failedToday) || 0;

  return [
    { 
      label: "Total Messages", 
      value: totalMessages.toLocaleString(), 
      color: "from-blue-500 to-cyan-500",
      icon: <BarChart3 className="w-5 h-5" />
    },
    { 
      label: "Pending", 
      value: scheduled.toLocaleString(), 
      color: "from-yellow-500 to-orange-500",
      icon: <Clock className="w-5 h-5" />
    },
    { 
      label: "Success Rate", 
      value: `${successRate.toFixed(1)}%`, 
      color: "from-green-500 to-emerald-500",
      icon: <CheckCircle className="w-5 h-5" />
    },
    { 
      label: "Failed Today", 
      value: failedToday.toLocaleString(), 
      color: "from-red-500 to-pink-500",
      icon: <AlertCircle className="w-5 h-5" />
    },
  ];
};

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
                <Link
                  href={crumb.href}
                  className={`flex items-center gap-2 text-sm ${
                    crumb.current 
                      ? 'font-semibold text-brand-600 dark:text-brand-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  {crumb.icon}
                  {crumb.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </motion.div>

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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Scheduled Messages
                </h1>
                {loading && (
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                )}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage all scheduled voice message deliveries
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowExportModal(true)}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 
                       text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 
                       dark:hover:bg-brand-900/20 transition-colors disabled:opacity-50"
            >
              {exportLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export Logs
            </button>
            <button 
              onClick={fetchMessagesData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                       text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
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
          {calculateStats().map((stat, index) => (
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
                    {stat.icon}
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
            {statsLoading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
              </div>
            ) : (
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
            )}
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
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading scheduled messages...</p>
            </div>
          </div>
        ) : (
          <>
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
                  {messages.map((message) => (
                    <tr key={message.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 px-6">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`p-1 rounded ${
                              message.method === 'phone' ? 'bg-blue-100 dark:bg-blue-900/30' : 
                              message.method === 'email' ? 'bg-green-100 dark:bg-green-900/30' :
                              'bg-purple-100 dark:bg-purple-900/30'
                            }`}>
                              {message.method === 'phone' ? (
                                <Bell className="w-4 h-4 text-blue-500" />
                              ) : message.method === 'email' ? (
                                <Mail className="w-4 h-4 text-green-500" />
                              ) : (
                                <Mail className="w-4 h-4 text-purple-500" />
                              )}
                            </div>
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {message.title || 'Untitled Message'}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            To: {message.recipient || 'Unknown'}
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
                          <span className="text-gray-700 dark:text-gray-300">{formatDate(message.scheduledFor)}</span>
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
                          message.status === 'delivered' ? 
                            'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          message.status === 'failed' ? 
                            'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          message.status === 'cancelled' ?
                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' :
                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {message.status === 'delivered' && <CheckCircle className="w-3 h-3" />}
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
                          {message.priority?.charAt(0).toUpperCase() + message.priority?.slice(1) || 'Medium'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => router.push(`/adminDashboard/messages/${message.id}`)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {message.status === 'scheduled' ? (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(message.id, 'delivered')}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                title="Mark as Delivered"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(message.id, 'paused')}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                title="Pause Message"
                              >
                                <Pause className="w-4 h-4 text-yellow-500" />
                              </button>
                            </>
                          ) : message.status === 'paused' ? (
                            <button 
                              onClick={() => handleStatusUpdate(message.id, 'scheduled')}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title="Resume Message"
                            >
                              <Play className="w-4 h-4 text-green-500" />
                            </button>
                          ) : null}
                          {(message.status === 'scheduled' || message.status === 'paused') && (
                            <button 
                              onClick={() => handleCancel(message.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded"
                              title="Cancel Message"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {messages.length === 0 && (
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} messages
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      pagination.page === 1
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      pagination.page >= pagination.totalPages
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Export Modal */}
      {showExportModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowExportModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-y-auto flex-1">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Export Scheduled Messages</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Export scheduled message data with current filters and search.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Export Format
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setExportFormat('csv')}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            exportFormat === 'csv'
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-800 dark:text-white mb-1">CSV</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Excel, Numbers, Sheets</div>
                        </button>
                        <button
                          onClick={() => setExportFormat('json')}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            exportFormat === 'json'
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-800 dark:text-white mb-1">JSON</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">API, Developers</div>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Filters
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <span className="font-medium">{selectedFilter}</span>
                          </div>
                          {searchQuery && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Search:</span>
                              <span className="font-medium">{searchQuery}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Messages:</span>
                            <span className="font-medium">{messages.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 
                               text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExport}
                      disabled={exportLoading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                               text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {exportLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Exporting...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" />
                          Export Now
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}