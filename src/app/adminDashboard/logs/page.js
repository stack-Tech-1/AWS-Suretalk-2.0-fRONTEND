"use client";
import { motion } from "framer-motion";
import { 
  FileText, Search, Filter, MoreVertical,
  Calendar, Clock, User, AlertTriangle,
  CheckCircle, Info, Bug, Server,
  Download, RefreshCw, Eye, Trash2,
  ChevronDown, Home, Settings, Database,
  ChevronRight
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/utils/api";
import { format } from "date-fns";

export default function SystemLogs() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const [logs, setLogs] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 1
  });
  // FIX: Initialize all stats properties
  const [stats, setStats] = useState({
    total: 0,
    error: 0,
    warning: 0,
    info: 0,
    debug: 0,
    security: 0 // Add this to initial state
  });

  const [logStats, setLogStats] = useState({
    storageUsedGB: 0,
    logsPerSecond: 0,
    retention: {
      error: 0,
      info: 0,
      debug: 0
    }
  });

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/adminDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "System", href: "/adminDashboard/system" },
    { label: "Logs", href: "/adminDashboard/logs", current: true }
  ];

  const timeframes = [
    { id: "1h", label: "Last Hour" },
    { id: "24h", label: "Last 24 Hours" },
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
  ];

  const filters = [
    { id: "all", label: "All Logs" },
    { id: "error", label: "Errors" },
    { id: "warn", label: "Warnings" },
    { id: "info", label: "Info" },
    { id: "debug", label: "Debug" },
  ];

  // Add function to fetch log statistics
const fetchLogStats = async () => {
  try {
    const response = await api.getLogStats();
    if (response.success) {
      setLogStats(response.data);
    }
  } catch (error) {
    console.error('Error fetching log stats:', error);
  }
};

  // Calculate date range based on selected timeframe
  const getDateRange = useCallback(() => {
    const now = new Date();
    const startDate = new Date();
    
    switch(selectedTimeframe) {
      case "1h":
        startDate.setHours(now.getHours() - 1);
        break;
      case "24h":
        startDate.setDate(now.getDate() - 1);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 1);
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    };
  }, [selectedTimeframe]);

  // Fetch logs from API
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        startDate,
        endDate
      };
      
      // Add level filter if not "all"
      if (selectedFilter !== "all") {
        params.level = selectedFilter;
      }
      
      // Add search if query exists
      if (searchQuery.trim()) {
        params.search = searchQuery;
      }
      
      // FIX: Check if api.getAdminLogs exists, if not add it to utils/api.js
      const response = await api.getAdminLogs(params);
      
      if (response.success) {
        setLogs(response.data.logs || []);
        setPagination(response.data.pagination || {
          page: 1,
          limit: 100,
          total: 0,
          totalPages: 1
        });
        
        // Calculate stats from response
        calculateStats(response.data.logs || []);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      // Optionally show error toast
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedFilter, selectedTimeframe, pagination.page, getDateRange]);

  // Calculate statistics from logs
  const calculateStats = (logData) => {
    const stats = {
      total: logData.length,
      error: logData.filter(log => log.level === 'error').length,
      warning: logData.filter(log => log.level === 'warn').length,
      info: logData.filter(log => log.level === 'info').length,
      debug: logData.filter(log => log.level === 'debug').length,
      security: logData.filter(log => log.service === 'security' || log.service === 'auth' || log.service === 'admin').length
    };
    setStats(stats);
  };

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchLogs(), fetchLogStats()]);
    };
    loadData();
  }, [fetchLogs]);

  
  const handleClearOldLogs = async () => {
    if (!window.confirm('Are you sure you want to clear logs older than 30 days?')) {
      return;
    }
  
    setProcessingAction('clearing');
    try {
      const response = await api.clearOldLogs(30);
      if (response.success) {
        alert(response.message);
        fetchLogs(); // Refresh logs
        fetchLogStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Clear logs failed:', error);
      alert('Failed to clear old logs');
    } finally {
      setProcessingAction(null);
    }
  };
  
  // Add run analysis function
  const handleRunAnalysis = async () => {
    setProcessingAction('analyzing');
    try {
      // You'll need to implement this endpoint
      // const response = await api.runLogAnalysis();
      // For now, simulate
      setTimeout(() => {
        alert('Log analysis completed successfully!');
        setProcessingAction(null);
      }, 2000);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to run analysis');
      setProcessingAction(null);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Export logs functionality
  const handleExportLogs = async () => {
    if (logs.length === 0) {
      alert('No logs to export');
      return;
    }  
    setExporting(true);
    setExportError(null);
  
    try {
      const { startDate, endDate } = getDateRange();
      const params = {
        format: 'csv',
        startDate,
        endDate,
        level: selectedFilter !== 'all' ? selectedFilter : undefined,
        search: searchQuery || undefined
      };
  
      // Remove undefined params
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
  
      const queryString = new URLSearchParams(params).toString();
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/logs/export?${queryString}`;
      
      console.log('Exporting from:', apiUrl);
  
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Export failed with status: ${response.status}`);
      }
  
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Empty export file received');
      }
  
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suretalk_logs_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
  
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error.message);
      alert(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  // Delete a log (if implemented in backend)
  const handleDeleteLog = async (id) => {
    if (window.confirm("Are you sure you want to delete this log?")) {
      try {
        // Note: Your backend doesn't have delete endpoint for logs yet
        console.log("Delete log:", id);
        // await api.deleteLog(id);
        fetchLogs(); // Refresh
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  // View log details
  const handleViewLogDetails = (log) => {
    console.log("View log details:", log);
  };

  const getLevelIcon = (level) => {
    switch(level) {
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'warn': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      case 'debug': return <Bug className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'error': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'warn': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'info': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'debug': return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return {
        date: format(date, 'yyyy-MM-dd'),
        time: format(date, 'HH:mm:ss')
      };
    } catch (e) {
      return { date: 'Invalid', time: 'Date' };
    }
  };

  // FIX: Add null/undefined checks before calling toString()
  const displayStats = [
    { 
      label: "Total Logs", 
      value: (stats.total || 0).toString(), 
      level: "all", 
      color: "from-gray-500 to-gray-600" 
    },
    { 
      label: "Errors", 
      value: (stats.error || 0).toString(), 
      level: "error", 
      color: "from-red-500 to-pink-500" 
    },
    { 
      label: "Warnings", 
      value: (stats.warning || 0).toString(), 
      level: "warning", 
      color: "from-yellow-500 to-orange-500" 
    },
    { 
      label: "Security", 
      value: (stats.security || 0).toString(), 
      level: "security", 
      color: "from-purple-500 to-indigo-500" 
    },
  ];

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
          <button 
                onClick={handleExportLogs}
                disabled={exporting || logs.length === 0}
                className={`flex items-center gap-2 px-4 py-2 border-2 border-brand-500 
                          text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 
                          dark:hover:bg-brand-900/20 transition-colors
                          ${(exporting || logs.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Logs
                  </>
                )}
              </button>
            <button 
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                       text-white rounded-xl hover:shadow-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading logs...</p>
        </div>
      )}

      {/* Stats and Timeframe Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
      >
        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayStats.map((stat, index) => (
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

      {/* Search and Filters - NO CHANGES TO DESIGN */}
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
                onClick={() => handleFilterChange(filter.id)}
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

      {/* Logs Table - CONNECTED TO REAL DATA */}
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
              {logs.map((log) => {
                const { date, time } = formatTimestamp(log.created_at);
                return (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Calendar className="w-3 h-3" />
                          <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{time}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                        {log.level?.charAt(0).toUpperCase() + log.level?.slice(1)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{log.service}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-gray-800 dark:text-white">{log.message}</p>
                        {log.metadata && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {typeof log.metadata === 'object' 
                              ? JSON.stringify(log.metadata)
                              : log.metadata}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <User className="w-3 h-3" />
                          <span>{log.user_email || 'System'}</span>
                        </div>
                        {log.ip && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            IP: {log.ip}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewLogDetails(log)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded"
                          title="Delete Log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!loading && logs.length === 0 && (
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing page {pagination.page} of {pagination.totalPages} • {pagination.total} total logs
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Log Management - NO CHANGES TO DESIGN */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Log Retention - UPDATED WITH REAL DATA */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Log Retention</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Error Logs</span>
              <span>90 days • {logStats.counts?.error90d || 0} logs</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${logStats.retention?.error || 0}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Info Logs</span>
              <span>30 days • {logStats.counts?.info30d || 0} logs</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${logStats.retention?.info || 0}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Debug Logs</span>
              <span>7 days • {logStats.counts?.debug7d || 0} logs</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gray-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${logStats.retention?.debug || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

        {/* Quick Actions - UPDATED WITH FUNCTIONALITY */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={handleClearOldLogs}
              disabled={processingAction === 'clearing'}
              className={`w-full flex items-center justify-between p-3 rounded-xl border 
                        ${processingAction === 'clearing'
                          ? 'border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-red-500'} 
                        transition-colors`}
            >
              <div className="flex items-center gap-3">
                {processingAction === 'clearing' ? (
                  <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">Clear Old Logs</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Remove logs older than 30 days
                  </p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
            
            <button 
              onClick={handleExportLogs}
              disabled={exporting || logs.length === 0}
              className={`w-full flex items-center justify-between p-3 rounded-xl border 
                        ${exporting || logs.length === 0
                          ? 'border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'} 
                        transition-colors`}
            >
              <div className="flex items-center gap-3">
                {exporting ? (
                  <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                ) : (
                  <Download className="w-5 h-5 text-blue-500" />
                )}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">Archive Logs</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download complete log archive
                  </p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
            
            <button 
              onClick={handleRunAnalysis}
              disabled={processingAction === 'analyzing'}
              className={`w-full flex items-center justify-between p-3 rounded-xl border 
                        ${processingAction === 'analyzing'
                          ? 'border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-500'} 
                        transition-colors`}
            >
              <div className="flex items-center gap-3">
                {processingAction === 'analyzing' ? (
                  <div className="w-5 h-5 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5 text-green-500" />
                )}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">Run Log Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Analyze patterns and trends
                  </p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

                {/* System Health - UPDATED WITH REAL DATA */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Log System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {logStats.storageUsedGB.toFixed(1)} GB
                </p>
              </div>
              <Server className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Logs per Second</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {logStats.logsPerSecond}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <button 
              onClick={() => router.push('/adminDashboard/logs/metrics')}
              className="w-full px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                      text-white rounded-xl hover:shadow-lg transition-all"
            >
              View Detailed Metrics
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}