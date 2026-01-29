// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\src\app\usersDashboard\notifications\page.js
"use client";
import { motion } from "framer-motion";
import { 
  Bell,
  BellOff,
  CheckCircle,
  Trash2,
  Filter,
  Archive,
  Volume2,
  MessageSquare,
  Shield,
  AlertTriangle,
  Settings,
  Clock,
  Search,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Mail,
  Smartphone,
  Zap,
  Check,
  Plus,
  User,
  CreditCard
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { toast } from "react-hot-toast";
import { useAuth } from '@/contexts/AuthContext'; // ✅ Import useAuth
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // ✅ Use AuthContext
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true
  });

  // Load notifications on component mount
  useEffect(() => {
    if (!authLoading) {
      loadNotifications();
    }
  }, [filter, typeFilter, authLoading]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        ...(filter !== 'all' && { unreadOnly: filter === 'unread' })
      });
      
      const response = await api.request(`/notifications?${params}`);
      if (response.success) {
        setNotifications(response.data.notifications);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          hasMore: response.data.notifications.length === prev.limit
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.request('/notifications/stats');
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
    return null;
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.request(`/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.request('/notifications/mark-all-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.request(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
      setSelectedNotifications(prev => prev.filter(selectedId => selectedId !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedNotifications.length === 0) {
      toast.error('No notifications selected');
      return;
    }

    try {
      if (action === 'mark-read') {
        await Promise.all(
          selectedNotifications.map(id => 
            api.request(`/notifications/${id}/read`, { method: 'POST' })
          )
        );
        setNotifications(prev => prev.map(n => 
          selectedNotifications.includes(n.id) ? { ...n, is_read: true } : n
        ));
        toast.success(`${selectedNotifications.length} notifications marked as read`);
      } else if (action === 'delete') {
        await Promise.all(
          selectedNotifications.map(id => 
            api.request(`/notifications/${id}`, { method: 'DELETE' })
          )
        );
        setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
        toast.success(`${selectedNotifications.length} notifications deleted`);
      }
      
      setSelectedNotifications([]);
    } catch (error) {
      toast.error(`Failed to ${action} notifications`);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')) {
      return;
    }

    try {
      await api.request('/notifications', { method: 'DELETE' });
      setNotifications([]);
      setSelectedNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { className: "w-5 h-5" };
    
    switch (type) {
      case 'voice_note':
        return <Volume2 {...iconProps} className="text-blue-500" />;
      case 'message':
        return <MessageSquare {...iconProps} className="text-green-500" />;
      case 'legacy_vault':
        return <Shield {...iconProps} className="text-purple-500" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="text-yellow-500" />;
      case 'success':
        return <CheckCircle {...iconProps} className="text-green-500" />;
      case 'system':
        return <Settings {...iconProps} className="text-gray-500" />;
      case 'contact':
        return <User {...iconProps} className="text-pink-500" />;
      case 'billing':
        return <CreditCard {...iconProps} className="text-indigo-500" />;
      default:
        return <Bell {...iconProps} className="text-brand-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      urgent: 'bg-gradient-to-r from-red-500 to-pink-500',
      high: 'bg-gradient-to-r from-orange-500 to-yellow-500',
      normal: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      low: 'bg-gradient-to-r from-gray-500 to-gray-600'
    };
    
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full text-white ${colors[priority] || colors.normal}`}>
        {priority}
      </span>
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    if (typeFilter !== 'all' && notification.type !== typeFilter) {
      return false;
    }
    
    if (filter === 'unread' && notification.is_read) {
      return false;
    }
    if (filter === 'read' && !notification.is_read) {
      return false;
    }
    
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // ✅ Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with your activity and system alerts
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={loadNotifications}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 text-white hover:shadow-lg"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - Add user-specific info if needed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {['total', 'unread', 'voice_notes', 'messages'].map((stat, index) => (
          <motion.div
            key={stat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {stat.replace('_', ' ')}
                </p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                  {Math.floor(Math.random() * 100)}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-br from-brand-500/10 to-accent-500/10">
                <Bell className="w-6 h-6 text-brand-500" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Menu */}
      {showFilterMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 dark:text-white">Filters</h3>
            <button
              onClick={() => setShowFilterMenu(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'unread', 'read'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg transition-all capitalize ${
                      filter === status
                        ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'voice_note', 'message', 'legacy_vault', 'system'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-4 py-2 rounded-lg transition-all capitalize ${
                      typeFilter === type
                        ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'urgent', 'high', 'normal', 'low'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => {/* Add priority filter logic */}}
                    className={`px-4 py-2 rounded-lg transition-all capitalize ${
                      false // Change this to your priority filter logic
                        ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search and Bulk Actions */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-300 dark:border-gray-600 
                       bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                       focus:border-transparent transition-all"
            />
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {selectedNotifications.length === notifications.length ? 'Deselect All' : 'Select All'}
            </button>
            
            {selectedNotifications.length > 0 && (
              <>
                <button
                  onClick={() => handleBulkAction('mark-read')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  Mark Read
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
            
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 text-white hover:shadow-lg"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All Read
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500/10 to-accent-500/10 flex items-center justify-center mx-auto mb-6">
            <BellOff className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            No notifications found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery 
              ? `No notifications match "${searchQuery}"`
              : 'You\'re all caught up! No new notifications.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg"
            >
              Clear Search
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`glass rounded-2xl p-6 transition-all hover:shadow-lg ${
                !notification.is_read ? 'border-l-4 border-brand-500' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox for bulk actions */}
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedNotifications(prev => [...prev, notification.id]);
                    } else {
                      setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                    }
                  }}
                  className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 
                           text-brand-500 focus:ring-brand-500"
                />
                
                {/* Notification Icon */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-brand-500/10 to-accent-500/10">
                  {getNotificationIcon(notification.type)}
                </div>
                
                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className={`font-bold truncate ${
                        notification.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-800 dark:text-white'
                      }`}>
                        {notification.title}
                      </h3>
                      {getPriorityBadge(notification.priority)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(notification.created_at)}
                      </span>
                      {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {notification.message}
                  </p>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm hover:shadow-md"
                      >
                        <Eye className="w-3 h-3" />
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm hover:shadow-md"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                    {notification.data?.url && (
                      <a
                        href={notification.data.url}
                        className="flex items-center gap-2 px-3 py-1 rounded-lg border border-brand-500 text-brand-600 dark:text-brand-400 text-sm hover:bg-brand-50 dark:hover:bg-brand-900/20"
                      >
                        View Details
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State Placeholder - Remove when you have real data */}
      {notifications.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-6">
            <Bell className="w-12 h-12 text-brand-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Welcome to Notifications
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This is where you'll see updates about your voice notes, messages, and system alerts.
            <br />
            Notifications will appear here when you create voice notes, schedule messages, or when there are system updates.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-6 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg">
              Create First Voice Note
            </button>
            <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              Explore Features
            </button>
          </div>
        </motion.div>
      )}

      {/* Settings Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 glass rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Notification Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Push Notifications</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications in your browser</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gradient-to-r from-brand-500 to-accent-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Email Notifications</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gradient-to-r from-brand-500 to-accent-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Sound Alerts</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Play sound for new notifications</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Desktop Notifications</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Show notifications on your desktop</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gradient-to-r from-brand-500 to-accent-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full px-4 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg">
            Save Notification Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Helper function to format time
function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}


// ChevronRight icon component
function ChevronRight(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}