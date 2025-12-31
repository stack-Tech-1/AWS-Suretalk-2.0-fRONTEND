"use client";
import { motion } from "framer-motion";
import { 
  Users, Search, Filter, MoreVertical, Mail, Phone,
  Calendar, Shield, CreditCard, TrendingUp, ChevronDown,
  UserPlus, Download, Eye, Edit, Trash2, RefreshCw,
  AlertCircle, Check, ChevronRight, Home, FolderOpen,
  CheckSquare, Square, Settings, User as UserIcon,
  FileDown, Users as UsersIcon, CreditCard as CreditCardIcon
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../utils/api";
import Link from "next/link";

export default function AdminUsers() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1
  });
  
  // Bulk actions state
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Export state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportInProgress, setExportInProgress] = useState(false);

  const filters = [
    { id: "all", label: "All Users" },
    { id: "LITE", label: "Lite" },
    { id: "ESSENTIAL", label: "Essential" },
    { id: "LEGACY_VAULT_PREMIUM", label: "Premium" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
  ];

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/adminDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "User Management", href: "/adminDashboard/users", icon: <UsersIcon className="w-4 h-4" />, current: true }
  ];

  // Fetch users data
  useEffect(() => {
    fetchUsersData();
  }, [pagination.page, selectedFilter, searchQuery]);

  const fetchUsersData = async () => {
    try {
      setLoading(true);
      
      // Check admin access
      const profile = await api.getProfile();
      if (!profile.data.is_admin || profile.data.admin_status !== 'approved') {
        router.replace('/admin/login');
        return;
      }

      // Fetch users with filters
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(selectedFilter !== 'all' && selectedFilter !== 'active' && selectedFilter !== 'inactive' && {
          tier: selectedFilter
        }),
        ...(selectedFilter === 'active' && { status: 'active' }),
        ...(selectedFilter === 'inactive' && { status: 'inactive' }),
        ...(searchQuery && { search: searchQuery })
      };

      const response = await api.getAdminUsers(params);
      setUsers(response.data.users || []);
      setPagination(response.data.pagination || pagination);
      
      // Reset selected users when data changes
      setSelectedUsers([]);

      // Fetch dashboard overview for stats
      const dashboardResponse = await api.getAdminDashboardOverview();
      if (dashboardResponse.data) {
        setStats({
          totalUsers: dashboardResponse.data.userStats?.total_users || 0,
          premiumUsers: dashboardResponse.data.userStats?.premium_users || 0,
          mrr: dashboardResponse.data.revenue?.current_month_revenue || 0,
          activeToday: dashboardResponse.data.userStats?.active_today || 0
        });
      }

    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        setUsers([
          {
            id: "1",
            full_name: "John Doe",
            email: "john@example.com",
            phone: "+1 (555) 123-4567",
            subscription_tier: "LEGACY_VAULT_PREMIUM",
            subscription_status: "active",
            created_at: "2024-01-15T00:00:00.000Z",
            last_login: new Date(Date.now() - 7200000).toISOString(),
            note_count: 24,
            contact_count: 8
          },
          {
            id: "2",
            full_name: "Sarah Smith",
            email: "sarah@example.com",
            phone: "+1 (555) 987-6543",
            subscription_tier: "ESSENTIAL",
            subscription_status: "active",
            created_at: "2024-02-28T00:00:00.000Z",
            last_login: new Date(Date.now() - 86400000).toISOString(),
            note_count: 12,
            contact_count: 5
          },
        ]);
        setStats({
          totalUsers: 1247,
          premiumUsers: 312,
          mrr: 4256,
          activeToday: 89
        });
      }
    } finally {
      setLoading(false);
    }
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get plan color and icon
  const getPlanInfo = (tier) => {
    switch(tier) {
      case 'LEGACY_VAULT_PREMIUM':
        return {
          color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
          icon: <Shield className="w-3 h-3" />,
          label: 'Premium'
        };
      case 'ESSENTIAL':
        return {
          color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
          icon: <CreditCard className="w-3 h-3" />,
          label: 'Essential'
        };
      case 'LITE':
        return {
          color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
          icon: null,
          label: 'Lite'
        };
      default:
        return {
          color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
          icon: null,
          label: tier || 'Unknown'
        };
    }
  };

  // Handle user selection
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action, data) => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one user");
      return;
    }

    setBulkActionLoading(true);
    try {
      await api.bulkUpdateUsers(selectedUsers, action, data);
      alert(`Bulk ${action} completed successfully!`);
      fetchUsersData(); // Refresh data
      setSelectedUsers([]);
    } catch (error) {
      console.error("Bulk action failed:", error);
      alert(`Failed to perform bulk action: ${error.message}`);
    } finally {
      setBulkActionLoading(false);
      setShowBulkActions(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const filters = {
        tier: selectedFilter !== 'all' ? selectedFilter : undefined,
        status: ['active', 'inactive'].includes(selectedFilter) ? selectedFilter : undefined,
        search: searchQuery || undefined
      };
      
      // Remove undefined filters
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const response = await api.exportUsers(exportFormat, filters);
      
      if (exportFormat === 'csv') {
        // Download CSV file
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // For JSON, you might want to display or download
        console.log("JSON Export:", response);
        alert(`Exported ${response.data?.length || 0} users as JSON`);
      }
      
      setShowExportModal(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export users");
    } finally {
      setExportLoading(false);
    }
  };

  // Calculate user stats
  const calculateUserStats = () => {
    const totalUsers = stats?.totalUsers || users.length;
    const premiumUsers = stats?.premiumUsers || users.filter(u => u.subscription_tier === 'LEGACY_VAULT_PREMIUM').length;
    const mrr = stats?.mrr || 4256;
    const activeToday = stats?.activeToday || users.filter(u => {
      if (!u.last_login) return false;
      const lastLogin = new Date(u.last_login);
      const today = new Date();
      return lastLogin.toDateString() === today.toDateString();
    }).length;

    return [
      { 
        label: "Total Users", 
        value: totalUsers.toLocaleString(), 
        change: "+12%",
        color: "from-blue-500 to-cyan-500",
        icon: <Users className="w-5 h-5" />
      },
      { 
        label: "Premium Users", 
        value: premiumUsers.toLocaleString(), 
        change: "+8%", 
        color: "from-purple-500 to-pink-500",
        icon: <CreditCardIcon className="w-5 h-5" />
      },
      { 
        label: "MRR", 
        value: `$${mrr.toLocaleString()}`, 
        change: "+18%", 
        color: "from-green-500 to-emerald-500",
        icon: <TrendingUp className="w-5 h-5" />
      },
      { 
        label: "Active Today", 
        value: activeToday.toLocaleString(), 
        change: "-3%", 
        color: "from-orange-500 to-red-500",
        icon: <UserIcon className="w-5 h-5" />
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  User Management
                </h1>
                {loading && (
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                )}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Manage {stats?.totalUsers?.toLocaleString() || "all"} SureTalk users, subscriptions, and account details
            </p>
          </div>
          <div className="flex gap-3">
            {/* Bulk Actions Button */}
            {selectedUsers.length > 0 && (
              <div className="relative">
                <button 
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 
                           text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Bulk Actions ({selectedUsers.length})
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showBulkActions && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowBulkActions(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl 
                                  border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-white">Bulk Actions</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUsers.length} users selected</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            const tier = prompt("Enter new subscription tier (LITE, ESSENTIAL, LEGACY_VAULT_PREMIUM):");
                            if (tier) handleBulkAction('change-plan', { subscriptionTier: tier });
                          }}
                          disabled={bulkActionLoading}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 
                                   hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          <CreditCard className="w-4 h-4" />
                          Change Plan
                        </button>
                        <button
                          onClick={() => {
                            const status = prompt("Enter new status (active, inactive, suspended, canceled):");
                            if (status) handleBulkAction('change-status', { subscriptionStatus: status });
                          }}
                          disabled={bulkActionLoading}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 
                                   hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          <Settings className="w-4 h-4" />
                          Change Status
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
                              handleBulkAction('delete');
                            }
                          }}
                          disabled={bulkActionLoading}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 
                                   hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Selected
                        </button>
                        <button
                          onClick={() => {
                            // Export selected users
                            const selectedUserData = users.filter(u => selectedUsers.includes(u.id));
                            const csvContent = convertToCSV(selectedUserData);
                            downloadCSV(csvContent, `selected_users_${Date.now()}.csv`);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 
                                   hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <FileDown className="w-4 h-4" />
                          Export Selected
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
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
              Export
            </button>
            <button 
              onClick={() => router.push('/adminDashboard/users/new')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                       text-white rounded-xl hover:shadow-lg transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {calculateUserStats().map((stat, index) => (
          <div 
            key={index}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
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
            <div className={`flex items-center text-sm font-medium ${
              stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${stat.change.startsWith('+') ? '' : 'rotate-180'}`} />
              {stat.change}
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
                placeholder="Search users by name, email, or phone..."
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
                    ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Selected Users Banner */}
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 
                   border border-blue-200 dark:border-blue-800 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-800 dark:text-white">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <button
              onClick={() => setSelectedUsers([])}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Clear selection
            </button>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
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
              <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="py-4 px-6 text-left">
                      <div className="flex items-center">
                        <button
                          onClick={handleSelectAll}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          {selectedUsers.length === users.length ? (
                            <CheckSquare className="w-4 h-4 text-brand-500" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      User
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Contact
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Plan
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Usage
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-800 dark:text-gray-300">
                      Joined
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => {
                    const planInfo = getPlanInfo(user.subscription_tier);
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                      <tr 
                        key={user.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                      >
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleSelectUser(user.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-brand-500" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 
                                          flex items-center justify-center">
                              <span className="font-bold text-white text-sm">
                                {user.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 dark:text-white">
                                {user.full_name || 'Unknown User'}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  Last active: {timeAgo(user.last_login)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{user.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${planInfo.color}`}>
                            {planInfo.icon}
                            {planInfo.label}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${
                            user.subscription_status === 'active' ? 
                              'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                              'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
                            {user.subscription_status?.charAt(0).toUpperCase() + user.subscription_status?.slice(1) || 'Unknown'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Notes: {user.note_count || 0}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Contacts: {user.contact_count || 0}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {formatDate(user.created_at)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => router.push(`/adminDashboard/users/${user.id}`)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title="View User"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => router.push(`/adminDashboard/users/${user.id}/edit`)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this user?")) {
                                  api.deleteUser(user.id)
                                    .then(() => fetchUsersData())
                                    .catch(err => console.error("Delete failed:", err));
                                }
                              }}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
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
            {users.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  No users found
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
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Export Users</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Export user data with current filters and search.
            </p>
            
            <div className="space-y-4 mb-6">
              {/* ... format selection ... */}
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
              
              {/* ... current filters ... */}
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
                      <span className="text-gray-600 dark:text-gray-400">Total Users:</span>
                      <span className="font-medium">{users.length}</span>
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
)}    </div>
  );
}

// Helper functions for CSV export
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

function downloadCSV(csvContent, fileName) {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}