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
  Filter,
  Eye,
  EyeOff,
  AlertTriangle,
  Key,
  Archive,
  Clock3,
  CheckCircle,
  X,
  Edit,
  Trash2,
  Play,
  Info,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileAudio,
  Mic,
  Zap,
  Crown,
  LockKeyhole
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { api } from '@/utils/api';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format } from 'date-fns';

export default function LegacyVault() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingWills, setLoadingWills] = useState(false);
  const [error, setError] = useState(null);
  const [vaultItems, setVaultItems] = useState([]);
  const [voiceWills, setVoiceWills] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    vaultItems: 0,
    wills: 0,
    totalStorageBytes: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });
  const [userTier, setUserTier] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showMarkPermanentModal, setShowMarkPermanentModal] = useState(false);
  const [showCreateWillModal, setShowCreateWillModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [uploading, setUploading] = useState(false);

  const filters = [
    { id: "all", label: "All Items" },
    { id: "permanent", label: "Permanent Voice Notes" },
    { id: "wills", label: "Voice Wills" },
    { id: "scheduled", label: "Scheduled" },
    { id: "protected", label: "Protected" },
  ];

  // Check user tier first
  const checkUserTier = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const profileResponse = await api.getProfile();
      if (profileResponse.success) {
        const tier = profileResponse.data.subscription_tier;
        setUserTier(tier);
        
        // If user is not PREMIUM, don't try to load vault data
        if (tier !== 'LEGACY_VAULT_PREMIUM') {
          setLoading(false);
          setLoadingProfile(false);
          return false;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to verify account tier');
      return false;
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // Fetch vault data only for PREMIUM users
  const fetchVaultData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // First check if user is PREMIUM
      const isPremium = await checkUserTier();
      if (!isPremium) {
        setLoading(false);
        return;
      }

      // Fetch vault items with pagination
      const vaultResponse = await api.getVaultItems({
        page,
        limit: pagination.limit,
        filter: selectedFilter === 'wills' ? 'wills' : undefined,
        search: searchQuery || undefined
      });

      if (vaultResponse.success) {
        setVaultItems(vaultResponse.data.items || []);
        setPagination(vaultResponse.data.pagination || {
          page,
          limit: pagination.limit,
          total: 0,
          totalPages: 1
        });
      }

      // Fetch voice wills if needed
      if (selectedFilter === 'wills' || selectedFilter === 'all') {
        setLoadingWills(true);
        const willsResponse = await api.getVoiceWills();
        if (willsResponse.success) {
          setVoiceWills(willsResponse.data.wills || []);
        }
        setLoadingWills(false);
      }

      // Fetch vault statistics
      const statsResponse = await api.getVaultStats();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

    } catch (error) {
      console.error('Failed to fetch vault data:', error);
      // Don't show error if it's just tier restriction
      if (!error.message.includes('LEGACY_VAULT_PREMIUM')) {
        setError(error.message || 'Failed to load vault data');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, searchQuery, pagination.limit, checkUserTier]);

  // Initial load
  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading && userTier === 'LEGACY_VAULT_PREMIUM') {
        fetchVaultData(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchVaultData, loading, userTier]);

  // Handle filter change
  useEffect(() => {
    if (!loading && userTier === 'LEGACY_VAULT_PREMIUM') {
      fetchVaultData(1);
    }
  }, [selectedFilter, fetchVaultData, loading, userTier]);
 
  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  // Get status color and icon
  const getStatusInfo = (item) => {
    if (item.is_released) {
      return {
        icon: CheckCircle,
        color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        label: 'Released'
      };
    } else if (item.scheduled_for && new Date(item.scheduled_for) > new Date()) {
      return {
        icon: Clock3,
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        label: 'Scheduled'
      };
    } else if (item.is_permanent) {
      return {
        icon: Shield,
        color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        label: 'Permanent'
      };
    } else {
      return {
        icon: CheckCircle,
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
        label: 'Active'
      };
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchVaultData(newPage);
    }
  };

  // Handle download
  const handleDownload = async (item) => {
    try {
      // For vault items that have downloadUrl from API
      if (item.downloadUrl) {
        window.open(item.downloadUrl, '_blank');
      } else if (item.s3_key && item.s3_bucket) {
        // Generate download URL
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

  // Handle delete vault item
  const handleDelete = async (itemId, isWill = false) => {
    try {
      if (isWill) {
        // TODO: Implement delete voice will if endpoint exists
        // For now, just remove from state
        setVoiceWills(prev => prev.filter(will => will.id !== itemId));
      } else {
        // For voice notes, use the voice note delete endpoint
        await api.deleteVoiceNote(itemId);
        setVaultItems(prev => prev.filter(item => item.id !== itemId));
        // Refresh stats
        const statsResponse = await api.getVaultStats();
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      }
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete item');
    }
  };

  // Handle mark as permanent
  const handleMarkAsPermanent = async () => {
    if (!selectedNote) return;

    try {
      const response = await api.markAsPermanent(selectedNote.id);
      if (response.success) {
        // Update the item in state
        setVaultItems(prev => prev.map(item =>
          item.id === selectedNote.id
            ? { ...item, is_permanent: true, retention_policy: 'permanent' }
            : item
        ));
        // Refresh stats
        const statsResponse = await api.getVaultStats();
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
        setShowMarkPermanentModal(false);
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Mark as permanent failed:', error);
      setError('Failed to mark as permanent');
    }
  };

  // Handle create voice will
  const handleCreateWill = async (formData) => {
    try {
      // This would open a modal or navigate to will creation page
      // For now, just navigate to a new page
      router.push('/usersDashboard/vault/create-will');
    } catch (error) {
      console.error('Create will failed:', error);
      setError('Failed to create voice will');
    }
  };

  // Handle upload to vault
  const handleUploadToVault = async () => {
    try {
      setUploading(true);
      // This would open file selection and upload flow
      // For now, navigate to voice notes page with vault flag
      router.push('/usersDashboard/voice-notes?destination=vault');
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload to vault');
    } finally {
      setUploading(false);
    }
  };

  // Combined items for display
  const getDisplayItems = () => {
    if (selectedFilter === 'wills') {
      return voiceWills.map(will => ({
        ...will,
        type: 'will',
        title: will.title,
        description: will.description || 'Voice will',
        size: formatFileSize(will.file_size_bytes),
        createdAt: formatDate(will.created_at),
        expires: will.release_condition === 'date' 
          ? format(new Date(will.release_date), 'PPpp')
          : 'Conditional',
        encrypted: true,
        status: will.is_released ? 'released' : 'active',
        tags: ['will', 'legacy', 'protected']
      }));
    }

    return vaultItems.map(item => ({
      ...item,
      type: item.is_permanent ? 'permanent' : 'voice_note',
      title: item.title,
      description: item.description || 'Voice recording',
      size: formatFileSize(item.file_size_bytes),
      createdAt: formatDate(item.created_at),
      expires: item.is_permanent ? 'Never' : 'Standard',
      encrypted: item.is_permanent || item.s3_bucket?.includes('vault'),
      status: getStatusInfo(item).label.toLowerCase(),
      tags: item.tags || [],
      duration: item.duration_seconds ? 
        `${Math.floor(item.duration_seconds / 60)}:${(item.duration_seconds % 60).toString().padStart(2, '0')}` : 
        '0:00'
    }));
  };

  const displayItems = getDisplayItems();

  // Filter items based on search
  const filteredItems = displayItems.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading vault data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && vaultItems.length === 0 && voiceWills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Error Loading Vault</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">{error}</p>
        <button
          onClick={() => fetchVaultData()}
          className="px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 flex items-center gap-2"
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
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Legacy Vault
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {stats.totalItems} items • {formatFileSize(stats.total_storage_bytes || 0)} protected
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowMarkPermanentModal(true)}
              className="px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                       rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors font-medium"
            >
              Mark as Permanent
            </button>
            <button
              onClick={handleUploadToVault}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                       text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add to Vault
            </button>
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
          { label: "Total Items", value: stats.totalItems || 0, icon: Archive, color: "from-blue-500 to-cyan-500" },
          { label: "Permanent Notes", value: stats.vault_items || 0, icon: Shield, color: "from-green-500 to-emerald-500" },
          { label: "Voice Wills", value: stats.total_wills || 0, icon: FileAudio, color: "from-purple-500 to-pink-500" },
          { label: "Storage Used", value: formatFileSize(stats.total_storage_bytes || 0), icon: Archive, color: "from-orange-500 to-red-500" },
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
                placeholder="Search vault items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
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

      {/* Vault Items Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl">
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {searchQuery ? 'No items found' : 'Your vault is empty'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'Try a different search term or clear the search'
                : 'Start by adding voice notes to your legacy vault for permanent protection'
              }
            </p>
            <button
              onClick={handleUploadToVault}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                       text-white rounded-xl hover:shadow-lg transition-all"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredItems.map((item) => {
                const statusInfo = getStatusInfo(item);
                return (
                  <div
                    key={item.id}
                    className="glass rounded-2xl p-6 card-hover group"
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
                          {item.tags?.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                                         rounded-full text-xs">
                              +{item.tags.length - 3}
                            </span>
                          )}
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
                              href={`/usersDashboard/voice-notes/${item.id}`}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                            <button
                              onClick={() => handleDelete(item.id, item.type === 'will')}
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
                          {item.duration && (
                            <>
                              <span className="mx-1">•</span>
                              <Play className="w-4 h-4" />
                              <span>{item.duration}</span>
                            </>
                          )}
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
                        href={`/usersDashboard/${item.type === 'will' ? 'vault/wills' : 'voice-notes'}/${item.id}`}
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
                        onClick={() => {
                          // TODO: Implement share functionality
                          console.log('Share item:', item.id);
                        }}
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
                  disabled={pagination.page === 1}
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
                        className={`w-10 h-10 rounded-lg ${
                          pagination.page === pageNum
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
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
              Your legacy vault is protected with AES-256 encryption, secure key management, 
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

      {/* Modals */}
      {/* Mark as Permanent Modal */}
      {showMarkPermanentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Mark as Permanent</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Select a voice note to move to vault</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* TODO: Add voice note selection */}
              <p className="text-gray-600 dark:text-gray-400 py-4 text-center">
                Voice note selection will be implemented here
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMarkPermanentModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsPermanent}
                disabled={!selectedNote}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                         text-white rounded-xl hover:shadow-lg disabled:opacity-50"
              >
                Mark Permanent
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
              Delete Item
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Are you sure you want to delete this item? This action cannot be undone.
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
                onClick={() => {
                  const item = [...vaultItems, ...voiceWills].find(i => i.id === showDeleteConfirm);
                  handleDelete(showDeleteConfirm, item?.type === 'will');
                }}
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