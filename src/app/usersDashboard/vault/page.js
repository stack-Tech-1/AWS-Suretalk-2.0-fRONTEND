//C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\src\app\usersDashboard\vault\page.js
"use client";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Clock,
  Calendar,
  Download,
  Share2,
  MoreVertical,
  Plus,
  Search,
  Eye,
  AlertTriangle,
  Key,
  Archive,
  CheckCircle,
  X,
  Trash2,
  Play,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileAudio,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { api } from '@/utils/api';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export default function VoiceWills() {
  const router = useRouter();
  const { user, hasLegacyVault, loading: authLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voiceWills, setVoiceWills] = useState([]);
  const [stats, setStats] = useState({
    total_wills: 0,
    totalStorageBytes: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const isFirstRenderRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchWillsData = async (page = 1, forceRefresh = false) => {
    if (isFetching && !forceRefresh) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsFetching(true);
      setLoading(true);
      setError(null);

      const apiOptions = { signal: abortControllerRef.current.signal };
      const willsResponse = await api.getVoiceWills(apiOptions);

      if (!isMountedRef.current) return;

      if (willsResponse?.success) {
        const wills = willsResponse.data.wills || [];
        setVoiceWills(wills);
        setStats({
          total_wills: wills.length,
          totalStorageBytes: wills.reduce((sum, w) => sum + (w.file_size_bytes || 0), 0)
        });
        setPagination(willsResponse.data.pagination || {
          page,
          limit: 12,
          total: wills.length,
          totalPages: 1
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      if (isMountedRef.current) {
        setError(error.message || 'Failed to load voice wills');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsFetching(false);
      }
    }
  };

  // Initial load — runs on every mount so soft navigation always fetches fresh data
  useEffect(() => {
    if (authLoading) return;

    const hasAccess = hasLegacyVault();
    if (hasAccess) {
      fetchWillsData(1);
    } else {
      setLoading(false);
    }

    const timer = setTimeout(() => {
      isFirstRenderRef.current = false;
    }, 500);
    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // Debounced search — only runs when user changes search after initial load
  useEffect(() => {
    if (isFirstRenderRef.current) return;
    if (authLoading) return;

    const hasAccess = hasLegacyVault();
    if (!hasAccess) return;

    const timeout = setTimeout(() => {
      fetchWillsData(1, true);
    }, 400);

    return () => clearTimeout(timeout);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const formatFileSize = (bytes) => {
    if (bytes === null || bytes === undefined || isNaN(bytes) || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const safeStorage = (bytes) => {
    if (!bytes || isNaN(bytes) || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusInfo = (will) => {
    if (will.is_released || will.status === 'released') {
      return {
        icon: Clock,
        color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
        label: 'Released'
      };
    }
    return {
      icon: CheckCircle,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      label: 'Active'
    };
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchWillsData(newPage);
    }
  };

  const handleDownload = async (item) => {
    try {
      if (item.downloadUrl) {
        window.open(item.downloadUrl, '_blank');
      } else if (item.s3_key && item.s3_bucket) {
        const response = await api.getDownloadUrl(item.s3_key, item.s3_bucket, 3600);
        if (response.success && response.data.downloadUrl) {
          window.open(response.data.downloadUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download file');
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await api.deleteVoiceWill(itemId);
      setVoiceWills(prev => prev.filter(will => will.id !== itemId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete voice will');
    }
  };

  // Map voice wills for display
  const displayItems = voiceWills.map(will => ({
    ...will,
    type: 'will',
    title: will.title || 'Voice Will',
    description: will.description || 'Legacy voice will',
    size: formatFileSize(will.file_size_bytes || 0),
    createdAt: formatDate(will.created_at),
    expires: will.release_condition === 'date' && will.release_date
      ? format(new Date(will.release_date), 'PPpp')
      : 'Conditional',
    encrypted: true,
    status: will.is_released ? 'released' : 'active',
    tags: ['will', 'legacy', 'protected']
  }));

  // Client-side search filter
  const filteredItems = displayItems.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!hasLegacyVault()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Shield className="w-20 h-20 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Voice Wills Access Required</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          Voice Wills are available only for LEGACY_VAULT_PREMIUM subscribers.
          Upgrade your plan to create and manage your legacy voice messages.
        </p>
        <Link
          href="/usersDashboard/billing"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
                   text-white rounded-xl hover:shadow-lg transition-all font-medium"
        >
          Upgrade to Premium
        </Link>
      </div>
    );
  }

  if (loading && voiceWills.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading voice wills...</p>
        </div>
      </div>
    );
  }

  if (error && voiceWills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Error Loading Voice Wills</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">{error}</p>
        <button
          onClick={() => fetchWillsData(1, true)}
          className="px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 flex items-center gap-2"
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter">
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
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <FileAudio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Voice Wills
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {stats.total_wills || 0} voice {stats.total_wills === 1 ? 'will' : 'wills'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/usersDashboard/voice-notes?record=new&type=will"
              className="btn-primary brand-glow-hover flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Voice Will
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-8 stagger-children"
      >
        {[
          { label: "Voice Wills", value: stats.total_wills || 0, icon: FileAudio, color: "from-purple-500 to-pink-500" },
          { label: "Storage Used", value: safeStorage(stats?.totalStorageBytes || 0), icon: Archive, color: "from-orange-500 to-red-500" },
        ].map((stat, index) => (
          <div
            key={index}
            className="card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white stat-number">{stat.value}</p>
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

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            placeholder="Search voice wills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500
                     focus:border-transparent transition-all"
            disabled={isFetching}
          />
          {isFetching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
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
      )}

      {/* Voice Wills Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <FileAudio className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {searchQuery ? 'No voice wills found' : 'No voice wills yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery
                ? 'Try a different search term or clear the search'
                : 'Create your first voice will to preserve your legacy messages.'
              }
            </p>
            {!searchQuery && (
              <Link
                href="/usersDashboard/voice-notes?record=new&type=will"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600
                         text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Voice Will
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredItems.map((item) => {
                const statusInfo = getStatusInfo(item);
                return (
                  <div
                    key={item.id}
                    className="card card-hover press-effect group p-6"
                  >
                    {/* Item Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-800 dark:text-white truncate">
                            {item.title}
                          </h3>
                          {item.encrypted && (
                            <Lock className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.tags?.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                                       rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setShowDeleteConfirm(item.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {showDeleteConfirm === item.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                            <button
                              onClick={() => handleDownload(item)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                            <Link
                              href={`/usersDashboard/vault/wills/${item.id}`}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Archive className="w-4 h-4" />
                          <span>{item.size}</span>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
                          <statusInfo.icon className="w-3 h-3" />
                          {statusInfo.label}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Added {item.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Expires: {item.expires}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/usersDashboard/vault/wills/${item.id}`}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500
                                 text-white rounded-xl hover:shadow-lg transition-all
                                 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || isFetching}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                           disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Previous
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
                        disabled={isFetching}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          pagination.page === pageNum
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                        } ${isFetching ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || isFetching}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                           disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Security Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 p-6 bg-gradient-to-r from-purple-900/10 to-pink-900/10
                   dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200
                   dark:border-purple-800"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              Bank-Level Security
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your voice wills are protected with AES-256 encryption, secure key management,
              and automated backups. All data is encrypted at rest and in transit.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Lock, label: "AES-256 Encryption", color: "text-green-500" },
                { icon: Shield, label: "Secure Key Mgmt", color: "text-blue-500" },
                { icon: Archive, label: "Auto Backup", color: "text-purple-500" },
                { icon: AlertTriangle, label: "Access Logs", color: "text-yellow-500" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
          >
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white text-center mb-2">
              Delete Voice Will
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Are you sure you want to delete this voice will? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600
                         text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
