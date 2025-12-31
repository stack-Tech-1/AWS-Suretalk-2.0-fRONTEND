"use client";
import { motion } from "framer-motion";
import { 
  FileText, Search, Filter, MoreVertical, User,
  Calendar, Shield, AlertTriangle, CheckCircle,
  Clock, Eye, Play, Download, Trash2, Lock,
  Unlock, Home, ChevronRight, RefreshCw,
  BarChart3, FileDown, Users, AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../utils/api";
import Link from "next/link";

export default function VoiceWills() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [wills, setWills] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [releaseLoading, setReleaseLoading] = useState({});
  const [downloadLoading, setDownloadLoading] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12, // 12 items per page for grid layout
    total: 0,
    totalPages: 1
  });

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/adminDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Voice Wills", href: "/adminDashboard/wills", icon: <FileText className="w-4 h-4" />, current: true }
  ];

  const filters = [
    { id: "all", label: "All Wills" },
    { id: "pending", label: "Pending" },
    { id: "released", label: "Released" },
  ];

  // Fetch wills data
  useEffect(() => {
    fetchWillsData();
  }, [pagination.page, selectedFilter, searchQuery]);

  const fetchWillsData = async () => {
    try {
      setLoading(true);
      
      // Check admin access
      const profile = await api.getProfile();
      if (!profile.data.is_admin || profile.data.admin_status !== 'approved') {
        router.replace('/admin/login');
        return;
      }

      // Fetch wills with filters
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: selectedFilter !== 'all' ? selectedFilter : undefined,
        search: searchQuery || undefined
      };

      const response = await api.getAdminWills(params);
      setWills(response.data.wills || []);
      setPagination(response.data.pagination || pagination);
      
      // Fetch admin dashboard stats for will statistics
      try {
        const statsResponse = await api.getAdminDashboardStats();
        if (statsResponse.data) {
          setStats({
            totalWills: statsResponse.data.wills?.total || 0,
            pendingWills: statsResponse.data.wills?.pending || 0,
            releasedWills: (statsResponse.data.wills?.total || 0) - (statsResponse.data.wills?.pending || 0),
            lockedWills: 0 // You might want to add a locked status in your backend
          });
        }
      } catch (statsError) {
        console.error("Failed to fetch stats:", statsError);
        // Calculate stats from current data as fallback
        calculateStatsFromData(response.data.wills || []);
      }

    } catch (error) {
      console.error("Failed to fetch wills:", error);
      // Fallback to mock data only in development
      if (process.env.NODE_ENV === 'development') {
        setWills([
          {
            id: "1",
            title: "Last Will & Testament",
            user_name: "John Doe",
            user_email: "john@example.com",
            created_at: "2024-12-05T00:00:00.000Z",
            release_date: null,
            is_released: false,
            file_size_bytes: 23592960, // 22.5 MB
            beneficiaryNames: ["Alice Doe", "Bob Doe", "Charlie Doe"],
            release_condition: "manual",
            s3_key: "wills/will-1.mp3",
            s3_bucket: "suretalk-wills"
          },
        ]);
        setStats({
          totalWills: 42,
          pendingWills: 8,
          releasedWills: 24,
          lockedWills: 10
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from data
  const calculateStatsFromData = (willsData) => {
    const totalWills = willsData.length;
    const pendingWills = willsData.filter(will => !will.is_released).length;
    const releasedWills = willsData.filter(will => will.is_released).length;
    
    setStats({
      totalWills,
      pendingWills,
      releasedWills,
      lockedWills: 0
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Conditional";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format time ago
  const timeAgo = (date) => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  // Handle release will
  const handleReleaseWill = async (id, title) => {
    if (!confirm(`Are you sure you want to release "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setReleaseLoading(prev => ({ ...prev, [id]: true }));
      const releaseNotes = prompt("Enter release notes (optional):");
      
      await api.releaseVoiceWill(id, releaseNotes || "");
      
      // Refresh data
      fetchWillsData();
      
      alert("Voice will released successfully!");
    } catch (error) {
      console.error("Failed to release will:", error);
      alert(`Failed to release will: ${error.message}`);
    } finally {
      setReleaseLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle download will
  const handleDownloadWill = async (id, s3Key, s3Bucket, title) => {
    try {
      setDownloadLoading(prev => ({ ...prev, [id]: true }));
      
      // Get download URL from backend
      const downloadResponse = await api.getDownloadUrl(s3Key, s3Bucket, 3600);
      
      if (downloadResponse.data?.downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadResponse.data.downloadUrl;
        link.download = `${title.replace(/\s+/g, '_')}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error("No download URL received");
      }
    } catch (error) {
      console.error("Failed to download will:", error);
      alert(`Failed to download will: ${error.message}`);
    } finally {
      setDownloadLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle delete will (placeholder - you might want to implement this)
  const handleDeleteWill = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action is permanent.`)) {
      return;
    }
    
    // Note: You'll need to implement a delete endpoint in your backend
    // For now, just show a message
    alert("Delete functionality requires backend implementation. Please add a DELETE endpoint at /admin/wills/:id");
  };

  // Handle view details
  const handleViewDetails = (will) => {
    // You can implement a detailed view modal or page
    console.log("View details for will:", will);
    alert(`Will Details:\nTitle: ${will.title}\nUser: ${will.user_name}\nStatus: ${will.is_released ? 'Released' : 'Pending'}\nBeneficiaries: ${will.beneficiaryNames?.join(', ') || 'None'}`);
  };

  // Handle play will (placeholder - could stream audio)
  const handlePlayWill = async (id, s3Key, s3Bucket) => {
    try {
      // Get download URL for playback
      const downloadResponse = await api.getDownloadUrl(s3Key, s3Bucket, 3600);
      
      if (downloadResponse.data?.downloadUrl) {
        // Open in new tab for playback
        window.open(downloadResponse.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error("Failed to play will:", error);
      alert("Failed to load audio for playback");
    }
  };

  // Calculate stats for display
  const calculateDisplayStats = () => {
    const totalWills = stats?.totalWills || wills.length;
    const pendingWills = stats?.pendingWills || wills.filter(w => !w.is_released).length;
    const releasedWills = stats?.releasedWills || wills.filter(w => w.is_released).length;
    const lockedWills = stats?.lockedWills || 0;

    return [
      { 
        label: "Total Wills", 
        value: totalWills.toLocaleString(), 
        color: "from-blue-500 to-cyan-500",
        icon: <FileText className="w-5 h-5" />
      },
      { 
        label: "Pending Release", 
        value: pendingWills.toLocaleString(), 
        color: "from-yellow-500 to-orange-500",
        icon: <Clock className="w-5 h-5" />
      },
      { 
        label: "Released", 
        value: releasedWills.toLocaleString(), 
        color: "from-green-500 to-emerald-500",
        icon: <CheckCircle className="w-5 h-5" />
      },
      { 
        label: "Locked", 
        value: lockedWills.toLocaleString(), 
        color: "from-purple-500 to-pink-500",
        icon: <Lock className="w-5 h-5" />
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
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Voice Wills
                </h1>
                {loading && (
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                )}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and review all voice wills in the system
            </p>
          </div>
          <button 
            onClick={fetchWillsData}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                     text-white rounded-xl hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {calculateDisplayStats().map((stat, index) => (
          <div 
            key={index}
            className="glass rounded-xl p-6"
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
                placeholder="Search wills by title, user, or email..."
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

      {/* Loading State */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center py-16"
        >
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading voice wills...</p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Wills Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {wills.map((will) => {
              const status = will.is_released ? 'released' : 'pending';
              const size = formatFileSize(will.file_size_bytes);
              const createdAt = formatDate(will.created_at);
              const expires = will.release_date ? formatDate(will.release_date) : 
                            will.release_condition === 'manual' ? 'Conditional' : 'Never';
              const beneficiaries = will.beneficiaryNames?.length || 0;
              
              return (
                <div
                  key={will.id}
                  className="glass rounded-2xl p-6 card-hover group"
                >
                  {/* Will Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {will.title || 'Untitled Will'}
                        </h3>
                        <Lock className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{will.user_name || will.user_email || 'Unknown User'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleViewDetails(will)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Will Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                        status === 'released' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                      }`}>
                        {status === 'pending' && <Clock className="w-3 h-3" />}
                        {status === 'released' && <CheckCircle className="w-3 h-3" />}
                        {status === 'locked' && <Shield className="w-3 h-3" />}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Expires</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">{expires}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Size</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">{size}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Beneficiaries</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">{beneficiaries}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {status === 'pending' ? (
                      <button 
                        onClick={() => handleReleaseWill(will.id, will.title)}
                        disabled={releaseLoading[will.id]}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 
                                 text-white rounded-xl hover:shadow-lg transition-all 
                                 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {releaseLoading[will.id] ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                        {releaseLoading[will.id] ? 'Releasing...' : 'Release Now'}
                      </button>
                    ) : status === 'released' ? (
                      <button 
                        onClick={() => handleViewDetails(will)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 
                                 text-white rounded-xl hover:shadow-lg transition-all 
                                 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Record
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleViewDetails(will)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 
                                 text-white rounded-xl hover:shadow-lg transition-all 
                                 flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        View Details
                      </button>
                    )}
                    <button 
                      onClick={() => handlePlayWill(will.id, will.s3_key, will.s3_bucket)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      title="Play Recording"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDownloadWill(will.id, will.s3_key, will.s3_bucket, will.title)}
                      disabled={downloadLoading[will.id]}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50"
                      title="Download"
                    >
                      {downloadLoading[will.id] ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                    <button 
                      onClick={() => handleDeleteWill(will.id, will.title)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Empty State */}
          {wills.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                No voice wills found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search or filters.
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex items-center justify-between"
            >
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} wills
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
            </motion.div>
          )}
        </>
      )}

      {/* Legal Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 p-6 bg-gradient-to-r from-purple-900/10 to-pink-900/10 
                   dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 
                   dark:border-purple-800"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              Legal & Compliance Notice
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Voice wills are sensitive legal documents. Only authorized administrators with proper 
              clearance should access or release these documents. All access is logged and monitored 
              for compliance purposes.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>All access is logged</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                <span>Encrypted storage</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" />
                <span>Multi-party verification required</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}