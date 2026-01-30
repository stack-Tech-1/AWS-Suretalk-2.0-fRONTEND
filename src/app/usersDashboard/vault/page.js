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
  Clock3,
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

// ✅ MODULE-LEVEL FLAG - Persists across component remounts
let hasInitializedGlobal = false;

export default function LegacyVault() {
  const router = useRouter();
  const { user, hasLegacyVault, loading: authLoading } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showMarkPermanentModal, setShowMarkPermanentModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  // Use refs for abort controllers and flags
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const isFirstRenderRef = useRef(true); // ✅ Track first render after mount

  const filters = [
    { id: "all", label: "All Items" },
    { id: "permanent", label: "Permanent Voice Notes" },
    { id: "wills", label: "Voice Wills" },
    { id: "scheduled", label: "Scheduled" },
    { id: "protected", label: "Protected" },
  ];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ✅ Main fetch function
  const fetchVaultData = async (page = 1, forceRefresh = false) => {
    console.log('📡 FETCH VAULT DATA - page:', page, 'forceRefresh:', forceRefresh, 'isFetching:', isFetching);
    
    // Prevent concurrent fetches
    if (isFetching && !forceRefresh) {
      console.log('📡 FETCH BLOCKED - already fetching');
      return;
    }
    
    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setIsFetching(true);
      setLoading(true);
      setError(null);

      const apiOptions = { signal: abortControllerRef.current.signal };

      // Fetch data in parallel
      const fetchPromises = [];

      // Fetch vault items with pagination
      fetchPromises.push(
        api.getVaultItems({
          page,
          limit: 12,
          filter: selectedFilter === 'wills' ? 'wills' : undefined,
          search: searchQuery || undefined
        }, apiOptions)
      );

      // Fetch vault statistics
      fetchPromises.push(api.getVaultStats(apiOptions));

      // Fetch voice wills only if needed
      if (selectedFilter === 'wills' || selectedFilter === 'all') {
        setLoadingWills(true);
        fetchPromises.push(api.getVoiceWills(apiOptions));
      }

      // Wait for all promises
      const [vaultResponse, statsResponse, willsResponse] = await Promise.all(fetchPromises);

      // Check if component is still mounted
      if (!isMountedRef.current) return;

      // Process vault items response
      if (vaultResponse?.success) {
        setVaultItems(vaultResponse.data.items || []);
        setPagination(vaultResponse.data.pagination || {
          page,
          limit: 12,
          total: 0,
          totalPages: 1
        });
      }

      // Process stats response
      if (statsResponse?.success) {
        setStats(statsResponse.data);
      }

      // Process wills response
      if (willsResponse?.success) {
        setVoiceWills(willsResponse.data.wills || []);
      }

      setLoadingWills(false);

    } catch (error) {
      // Ignore abort errors
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }
      
      console.error('Failed to fetch vault data:', error);
      if (isMountedRef.current) {
        setError(error.message || 'Failed to load vault data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsFetching(false);
      }
    }
  };

  // ✅ Reset first render flag on mount
useEffect(() => {
  isFirstRenderRef.current = true;
}, []);

// ✅ Initial load - uses GLOBAL flag to prevent re-initialization
useEffect(() => {
  console.log('🔵 INITIAL LOAD EFFECT - authLoading:', authLoading, 'hasInitializedGlobal:', hasInitializedGlobal);
  
  // Wait for auth to finish loading
  if (authLoading) return;
  
  // ✅ Check GLOBAL flag
  if (hasInitializedGlobal) {
    console.log('🔵 SKIPPED - Already initialized globally');
    setLoading(false); // ✅ Stop loading if already initialized
    return;
  }
  
  // Check if user has access
  const hasAccess = hasLegacyVault();
  console.log('🔵 Has vault access:', hasAccess);
  
  // Only fetch if user has Legacy Vault access
  if (hasAccess) {
    console.log('🔵 INITIALIZING - Fetching vault data');
    hasInitializedGlobal = true; // ✅ Set GLOBAL flag
    fetchVaultData(1);
  } else {
    // User doesn't have access, stop loading
    setLoading(false);
    hasInitializedGlobal = true; // ✅ Set GLOBAL flag even without access
  }
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [authLoading]);

// ✅ Debounced search/filter - ONLY runs when user actually changes search/filter
useEffect(() => {
  console.log('🟢 SEARCH EFFECT - isFirstRender:', isFirstRenderRef.current, 'searchQuery:', searchQuery, 'selectedFilter:', selectedFilter);
  
  // ✅ Skip on first render after mount
  if (isFirstRenderRef.current) {
    console.log('🟢 SEARCH EFFECT - SKIPPED (first render)');
    isFirstRenderRef.current = false;
    return;
  }
  
  // Skip if not initialized yet
  if (!hasInitializedGlobal) {
    console.log('🟢 SEARCH EFFECT - SKIPPED (not initialized)');
    return;
  }
  
  // Don't search if auth is loading
  if (authLoading) {
    console.log('🟢 SEARCH EFFECT - SKIPPED (auth loading)');
    return;
  }
  
  // Check if user has access
  const hasAccess = hasLegacyVault();
  if (!hasAccess) {
    console.log('🟢 SEARCH EFFECT - SKIPPED (no access)');
    return;
  }
  
  console.log('🟢 SEARCH EFFECT - SCHEDULING FETCH');
  const timeout = setTimeout(() => {
    console.log('🟢 SEARCH EFFECT - EXECUTING FETCH');
    fetchVaultData(1, true);
  }, 400);

  return () => {
    console.log('🟢 SEARCH EFFECT - CLEANUP');
    clearTimeout(timeout);
  };
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchQuery, selectedFilter]);

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

  // Handle delete vault item
  const handleDelete = async (itemId, isWill = false) => {
    try {
      if (isWill) {
        setVoiceWills(prev => prev.filter(will => will.id !== itemId));
      } else {
        await api.deleteVoiceNote(itemId);
        setVaultItems(prev => prev.filter(item => item.id !== itemId));
        await fetchVaultData(pagination.page, true);
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
        setVaultItems(prev => prev.map(item =>
          item.id === selectedNote.id
            ? { ...item, is_permanent: true, retention_policy: 'permanent' }
            : item
        ));
        await fetchVaultData(pagination.page, true);
        setShowMarkPermanentModal(false);
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Mark as permanent failed:', error);
      setError('Failed to mark as permanent');
    }
  };

  // Handle upload to vault
  const handleUploadToVault = async () => {
    try {
      setUploading(true);
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

  // Filter items based on search (client-side filtering)
  const filteredItems = displayItems.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ✅ Show loading state while auth is loading
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

  // ✅ Check if user has access to vault (using AuthContext)
  if (!hasLegacyVault()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Shield className="w-20 h-20 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Legacy Vault Access Required</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          The Legacy Vault is available only for LEGACY_VAULT_PREMIUM subscribers.
          Upgrade your plan to access permanent storage and legacy features.
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

  // Loading state for vault data
  if (loading && vaultItems.length === 0 && voiceWills.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
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
          onClick={() => fetchVaultData(1, true)}
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
                disabled={isFetching}
              />
              {isFetching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                disabled={isFetching}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap disabled:opacity-50 ${
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
              disabled={isFetching}
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