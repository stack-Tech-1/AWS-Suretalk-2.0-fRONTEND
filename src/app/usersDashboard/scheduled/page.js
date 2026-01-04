"use client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar,
  Clock,
  User,
  Bell,
  Edit,
  Trash2,
  Play,
  Pause,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Mail,
  MoreVertical,
  Loader2,
  RefreshCw,
  X,
  Eye,
  Phone,
  Users,
  Send,
  Archive,
  CalendarDays,
  CalendarClock,
  PhoneCall,
  MailCheck,
  Download,
  Share2,
  Copy,
  ExternalLink,
  Info,
  AlertTriangle,
  Shield,
  Zap,
  FileText,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from '@/utils/api';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format, parseISO, isBefore, isAfter, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function ScheduledMessages() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    total_messages: 0,
    scheduled: 0,
    delivered: 0,
    failed: 0,
    cancelled: 0,
    phone_messages: 0,
    email_messages: 0,
    upcoming: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [userTier, setUserTier] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [testForm, setTestForm] = useState({
    recipientEmail: '',
    recipientPhone: '',
    deliveryMethod: 'email'
  });
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);
  const initialLoadRef = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
        setSelectedMessage(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filters = [
    { id: "all", label: "All Messages", icon: CalendarDays },
    { id: "scheduled", label: "Scheduled", icon: CalendarClock },
    { id: "upcoming", label: "Upcoming", icon: Clock },
    { id: "sent", label: "Sent", icon: CheckCircle },
    { id: "failed", label: "Failed", icon: AlertCircle },
    { id: "cancelled", label: "Cancelled", icon: X },
  ];

  // Fetch user tier
  const fetchUserTier = async () => {
    try {
      const profileResponse = await api.getProfile();
      if (profileResponse.success) {
        setUserTier(profileResponse.data.subscription_tier);
        return profileResponse.data.subscription_tier;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user tier:', error);
      return null;
    }
  };

  // Fetch scheduled messages - FIXED VERSION
  const fetchScheduledMessages = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Determine status based on filter
      let status;
      if (selectedFilter === 'upcoming') {
        status = 'scheduled';
      } else if (selectedFilter !== 'all') {
        status = selectedFilter;
      }

      // Build query parameters
      const params = {
        page,
        limit: pagination.limit
      };

      // Only add status if it's defined and not undefined string
      if (status) {
        params.status = status;
      }

      // Only add search if there's actually a search query
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      console.log('Fetching scheduled messages with params:', params);

      // Fetch scheduled messages
      const response = await api.getScheduledMessages(params);

      if (response.success) {
        console.log('Scheduled messages response:', response);
        
        const messagesData = response.data?.messages || [];
        const paginationData = response.data?.pagination;
        
        // Add derived properties for easier UI handling
        const formattedMessages = messagesData.map(msg => ({
          ...msg,
          isUpcoming: msg.delivery_status === 'scheduled' && 
                     msg.scheduled_for && 
                     isAfter(parseISO(msg.scheduled_for), new Date()),
          formattedDate: formatDate(msg.scheduled_for),
          relativeTime: formatRelativeTime(msg.scheduled_for)
        }));
        
        setMessages(formattedMessages);
        
        if (paginationData) {
          setPagination({
            page: paginationData.page || page,
            limit: paginationData.limit || pagination.limit,
            total: paginationData.total || formattedMessages.length,
            totalPages: paginationData.totalPages || Math.ceil((paginationData.total || formattedMessages.length) / (paginationData.limit || pagination.limit))
          });
        } else {
          setPagination({
            page,
            limit: pagination.limit,
            total: formattedMessages.length,
            totalPages: Math.ceil(formattedMessages.length / pagination.limit)
          });
        }
      } else {
        throw new Error(response.error || 'Failed to fetch messages');
      }

    } catch (error) {
      console.error('Failed to fetch scheduled messages:', error);
      setError(error.message || 'Failed to load scheduled messages');
      toast.error(error.message || 'Failed to load scheduled messages');
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, searchQuery, pagination.limit]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      
      const statsResponse = await api.getScheduledMessagesCount();
      if (statsResponse.success) {
        const upcomingCount = messages.filter(msg => 
          msg.delivery_status === 'scheduled' && 
          msg.scheduled_for && 
          isAfter(parseISO(msg.scheduled_for), new Date())
        ).length;
        
        setStats({
          ...statsResponse.data,
          upcoming: upcomingCount
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [messages]);

  // Initial load - FIXED to prevent infinite loop
  useEffect(() => {
    if (initialLoadRef.current) return;
    
    initialLoadRef.current = true;
    
    const loadInitialData = async () => {
      try {
        await fetchUserTier();
        await fetchScheduledMessages();
      } catch (error) {
        console.error('Initial load failed:', error);
      }
    };
    
    loadInitialData();
  }, []);

  // Handle search with debounce - FIXED
  useEffect(() => {
    if (!initialLoadRef.current) return;
    
    const timeoutId = setTimeout(() => {
      fetchScheduledMessages(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchScheduledMessages]);

  // Handle filter change - FIXED
  useEffect(() => {
    if (!initialLoadRef.current) return;
    
    fetchScheduledMessages(1);
  }, [selectedFilter, fetchScheduledMessages]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy • h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '';
    }
  };

  // Get status info
  const getStatusInfo = (message) => {
    const scheduledDate = message.scheduled_for ? parseISO(message.scheduled_for) : null;
    const isUpcoming = scheduledDate && isAfter(scheduledDate, new Date());
    const isPastDue = scheduledDate && isBefore(scheduledDate, new Date()) && message.delivery_status === 'scheduled';

    switch (message.delivery_status) {
      case 'scheduled':
        if (isPastDue) {
          return {
            icon: AlertTriangle,
            color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
            label: 'Past Due'
          };
        }
        return {
          icon: isUpcoming ? CalendarClock : Clock,
          color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
          label: isUpcoming ? 'Upcoming' : 'Scheduled'
        };
      case 'delivered':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
          label: 'Delivered'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
          label: 'Failed'
        };
      case 'cancelled':
        return {
          icon: X,
          color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
          label: 'Cancelled'
        };
      case 'testing':
        return {
          icon: Send,
          color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
          label: 'Testing'
        };
      default:
        return {
          icon: Clock,
          color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
          label: message.delivery_status || 'Unknown'
        };
    }
  };

  // Get delivery method info
  const getDeliveryMethodInfo = (method) => {
    switch (method) {
      case 'phone':
        return {
          icon: Phone,
          color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500',
          label: 'Phone'
        };
      case 'email':
        return {
          icon: Mail,
          color: 'bg-green-100 dark:bg-green-900/30 text-green-500',
          label: 'Email'
        };
      case 'both':
        return {
          icon: Users,
          color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500',
          label: 'Both'
        };
      default:
        return {
          icon: Send,
          color: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
          label: method || 'Unknown'
        };
    }
  };

  // Handle cancel message
  const handleCancelMessage = async (messageId) => {
    try {
      setActionLoading(messageId);
      
      const response = await api.cancelScheduledMessage(messageId);
      if (response.success) {
        // Update local state
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, delivery_status: 'cancelled' }
            : msg
        ));
        
        toast.success('Message cancelled successfully');
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to cancel message:', error);
      toast.error(error.message || 'Failed to cancel message');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle send test
  const handleSendTest = async () => {
    if (!selectedMessage) return;

    try {
      setActionLoading('test');
      
      const response = await api.sendTestMessage({
        voiceNoteId: selectedMessage.voice_note_id,
        recipientEmail: testForm.deliveryMethod.includes('email') ? testForm.recipientEmail : undefined,
        recipientPhone: testForm.deliveryMethod.includes('sms') ? testForm.recipientPhone : undefined,
        deliveryMethod: testForm.deliveryMethod
      });

      if (response.success) {
        toast.success('Test message sent successfully');
        setShowTestModal(false);
        setTestForm({
          recipientEmail: '',
          recipientPhone: '',
          deliveryMethod: 'email'
        });
      }
    } catch (error) {
      console.error('Failed to send test:', error);
      toast.error(error.message || 'Failed to send test message');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle view details
  const handleViewDetails = (messageId) => {
    router.push(`/usersDashboard/scheduled/${messageId}`);
  };

  // Handle edit message
  const handleEditMessage = (messageId) => {
    router.push(`/usersDashboard/scheduled/${messageId}/edit`);
  };

  // Handle copy message info
  const handleCopyInfo = async (message) => {
    const info = `Message: ${message.voice_note_title || 'Voice Message'}
Recipient: ${message.recipient_name || message.recipient_phone || message.recipient_email}
Scheduled: ${formatDate(message.scheduled_for)}
Status: ${message.delivery_status}`;
    
    try {
      await navigator.clipboard.writeText(info);
      toast.success('Message info copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy info');
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchScheduledMessages(newPage);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchScheduledMessages(pagination.page);
  };

  // Also, let's fix the ApiClient request method to handle undefined params properly:
  // In your utils/api.js, update the getScheduledMessages method:
  
  /*
  // In utils/api.js, update the method:
  async getScheduledMessages(params = {}) {
    // Filter out undefined values
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== 'undefined')
    );
    
    const query = new URLSearchParams(filteredParams).toString();
    return this.request(`/scheduled${query ? `?${query}` : ''}`);
  }
  */

  // Render loading state
  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading scheduled messages...</p>
      </div>
    );
  }

  // Render error state
  if (error && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Error Loading Messages</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Scheduled Messages
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Plan and schedule voice messages to be delivered at future dates
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 
                       text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 
                       dark:hover:bg-gray-700 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <Link
              href="/usersDashboard/scheduled/create"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 
                       text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Schedule Message
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { 
            label: "Total Messages", 
            value: loadingStats ? '...' : stats.total_messages || 0, 
            icon: CalendarDays, 
            color: "from-blue-500 to-cyan-500" 
          },
          { 
            label: "Upcoming", 
            value: loadingStats ? '...' : stats.upcoming || 0, 
            icon: CalendarClock, 
            color: "from-green-500 to-emerald-500" 
          },
          { 
            label: "Sent", 
            value: loadingStats ? '...' : stats.delivered || 0, 
            icon: CheckCircle, 
            color: "from-purple-500 to-pink-500" 
          },
          { 
            label: "Failed", 
            value: loadingStats ? '...' : stats.failed || 0, 
            icon: AlertCircle, 
            color: "from-orange-500 to-red-500" 
          },
        ].map((stat, index) => (
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
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                  type="search"
                  placeholder="Search messages by title, recipient, or status..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                          bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 
                          focus:border-transparent transition-all"
                />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedFilter === filter.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Messages Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass rounded-2xl overflow-hidden"
      >
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {searchQuery ? 'No messages found' : 'No scheduled messages yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'Try a different search term or clear the search'
                : 'Start by scheduling your first voice message for future delivery'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Clear Search
              </button>
              <Link
                href="/usersDashboard/scheduled/create"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 
                         text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Schedule Your First Message
              </Link>
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
                      Recipient
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Scheduled For
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {messages.map((message) => {
                    const statusInfo = getStatusInfo(message);
                    const deliveryMethodInfo = getDeliveryMethodInfo(message.delivery_method);
                    const canCancel = message.delivery_status === 'scheduled' && message.isUpcoming;
                    const canEdit = message.delivery_status === 'scheduled';
                    const canTest = message.delivery_status === 'scheduled';

                    return (
                      <tr key={message.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${deliveryMethodInfo.color} bg-opacity-20`}>
                              <deliveryMethodInfo.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-800 dark:text-white">
                                  {message.voice_note_title || 'Untitled Message'}
                                </h4>
                                {message.is_permanent && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                    <Shield className="w-3 h-3 inline mr-1" />
                                    Permanent
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500">
                                  {formatRelativeTime(message.created_at)}
                                </span>
                                {message.voice_note_id && (
                                  <Link
                                    href={`/usersDashboard/voice-notes/${message.voice_note_id}`}
                                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                  >
                                    View Voice Note
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-800 dark:text-white">
                                {message.recipient_name || 
                                 (message.recipient_phone ? 'Phone Recipient' : 
                                  message.recipient_email ? 'Email Recipient' : 
                                  'No recipient')}
                              </span>
                            </div>
                            {(message.recipient_phone || message.recipient_email) && (
                              <div className="text-xs text-gray-500 space-y-1">
                                {message.recipient_phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {message.recipient_phone}
                                  </div>
                                )}
                                {message.recipient_email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {message.recipient_email}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-800 dark:text-white">
                                {message.formattedDate}
                              </span>
                            </div>
                            {message.scheduled_for && (
                              <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                                message.isUpcoming 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                              }`}>
                                {message.relativeTime}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium w-fit ${statusInfo.color}`}>
                            <statusInfo.icon className="w-4 h-4" />
                            {statusInfo.label}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2" ref={dropdownRef}>
                            <button
                              onClick={() => handleViewDetails(message.id)}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {canEdit && (
                              <button
                                onClick={() => handleEditMessage(message.id)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}

                            {canTest && (
                              <button
                                onClick={() => {
                                  setSelectedMessage(message);
                                  setShowTestModal(true);
                                }}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Send Test"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}

                            {canCancel && (
                              <button
                                onClick={() => setShowDeleteConfirm(message.id)}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                            <div className="relative">
                              <button
                                onClick={() => setDropdownOpen(dropdownOpen === message.id ? null : message.id)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {dropdownOpen === message.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                                >
                                  <button
                                    onClick={() => {
                                      handleViewDetails(message.id);
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                  </button>
                                  
                                  {canEdit && (
                                    <button
                                      onClick={() => {
                                        handleEditMessage(message.id);
                                        setDropdownOpen(null);
                                      }}
                                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                                    >
                                      <Edit className="w-4 h-4" />
                                      Edit Message
                                    </button>
                                  )}

                                  {canTest && (
                                    <button
                                      onClick={() => {
                                        setSelectedMessage(message);
                                        setShowTestModal(true);
                                        setDropdownOpen(null);
                                      }}
                                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                                    >
                                      <Send className="w-4 h-4" />
                                      Send Test
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      handleCopyInfo(message);
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Copy Info
                                  </button>

                                  {message.voice_note_id && (
                                    <Link
                                      href={`/usersDashboard/voice-notes/${message.voice_note_id}`}
                                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                                      onClick={() => setDropdownOpen(null)}
                                    >
                                      <Archive className="w-4 h-4" />
                                      View Voice Note
                                    </Link>
                                  )}

                                  {canCancel && (
                                    <button
                                      onClick={() => {
                                        setShowDeleteConfirm(message.id);
                                        setDropdownOpen(null);
                                      }}
                                      className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 flex items-center gap-3 border-t border-gray-200 dark:border-gray-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Cancel Message
                                    </button>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} messages
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            pagination.page === pageNum
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Dashboard Stats */}
      {messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Delivery Methods */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Delivery Methods</h3>
                <Share2 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Phone</p>
                      <p className="text-sm text-gray-500">Voice calls</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold">{stats.phone_messages || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Mail className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Email</p>
                      <p className="text-sm text-gray-500">Email delivery</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold">{stats.email_messages || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Users className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Both</p>
                      <p className="text-sm text-gray-500">Phone & Email</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold">
                    {Math.max(0, (stats.total_messages || 0) - (stats.phone_messages || 0) - (stats.email_messages || 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Activity</h3>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {messages.slice(0, 4).map((message, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      message.delivery_status === 'delivered' ? 'bg-green-500' :
                      message.delivery_status === 'failed' ? 'bg-red-500' :
                      message.delivery_status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {message.voice_note_title?.substring(0, 40) || 'Voice Message'}
                        {message.voice_note_title?.length > 40 && '...'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(message.scheduled_for || message.created_at)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          message.delivery_status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                          message.delivery_status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                        }`}>
                          {message.delivery_status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(message.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Quick Actions</h3>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="space-y-3">
                <Link
                  href="/usersDashboard/scheduled/create"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Schedule New Message</p>
                    <p className="text-sm opacity-90">Create and schedule a voice message</p>
                  </div>
                </Link>
                <Link
                  href="/usersDashboard/contacts"
                  className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <Users className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Manage Contacts</p>
                    <p className="text-sm text-gray-500">Add or update recipients</p>
                  </div>
                </Link>
                <Link
                  href="/usersDashboard/voice-notes"
                  className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">View Voice Notes</p>
                    <p className="text-sm text-gray-500">Browse your recordings</p>
                  </div>
                </Link>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors w-full"
                >
                  <RefreshCw className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Refresh List</p>
                    <p className="text-sm text-gray-500">Get latest updates</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Cancel Scheduled Message</h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to cancel this scheduled message? This action cannot be undone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Keep Scheduled
                </button>
                <button
                  onClick={() => handleCancelMessage(showDeleteConfirm)}
                  disabled={actionLoading === showDeleteConfirm}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading === showDeleteConfirm ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Cancel Message
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Message Modal */}
      <AnimatePresence>
        {showTestModal && selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Send className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Send Test Message</h3>
                    <p className="text-sm text-gray-500">Test your scheduled message</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTestModal(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Message</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedMessage.voice_note_title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Delivery Method
                  </label>
                  <div className="flex gap-2">
                    {['email', 'sms', 'both'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setTestForm(prev => ({ ...prev, deliveryMethod: method }))}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          testForm.deliveryMethod === method
                            ? method === 'email' ? 'bg-green-500 text-white' :
                              method === 'sms' ? 'bg-blue-500 text-white' :
                              'bg-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {method === 'email' ? 'Email' : method === 'sms' ? 'SMS' : 'Both'}
                      </button>
                    ))}
                  </div>
                </div>

                {testForm.deliveryMethod.includes('email') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Email Address
                    </label>
                    <input
                      type="email"
                      value={testForm.recipientEmail}
                      onChange={(e) => setTestForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                      placeholder="Enter email for test"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {testForm.deliveryMethod.includes('sms') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Phone Number
                    </label>
                    <input
                      type="tel"
                      value={testForm.recipientPhone}
                      onChange={(e) => setTestForm(prev => ({ ...prev, recipientPhone: e.target.value }))}
                      placeholder="Enter phone for test"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTestModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendTest}
                  disabled={actionLoading === 'test' || 
                    (testForm.deliveryMethod.includes('email') && !testForm.recipientEmail) ||
                    (testForm.deliveryMethod.includes('sms') && !testForm.recipientPhone)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading === 'test' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Test
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Activity icon component
function Activity(props) {
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
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}