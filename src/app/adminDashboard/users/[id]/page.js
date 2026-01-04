"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../../components/dashboard/Layout";
import { motion } from "framer-motion";
import { api } from "../../../../utils/api";
import Link from "next/link";
import { 
  ArrowLeft, Users, Mail, Phone, Calendar, Shield,
  CreditCard, Activity, HardDrive, MessageSquare,
  Clock, FileText, Download, Edit, Trash2, MoreVertical,
  CheckCircle, XCircle, User, BarChart3, Globe,
  Settings, RefreshCw, AlertCircle, ChevronRight,
  Home, Eye, LogOut, UserCheck, UserX, Filter, Mic 
} from "lucide-react";

export default function UserDetail() {
  const router = useRouter();
  const params = useParams(); // ✅ CORRECT: useParams
  const { id } = params; // ✅ CORRECT: Get id from params  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getUserDetails(id);
      setUser(response.data);

      
      
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      setError(err.message || "Failed to load user details");
      
      // Fallback mock data for development
      if (process.env.NODE_ENV === 'development') {
        setUser({
          user: {
            id: id,
            email: "john@example.com",
            phone: "+1 (555) 123-4567",
            full_name: "John Doe",
            subscription_tier: "LEGACY_VAULT_PREMIUM",
            subscription_status: "active",
            profile_image_url: null,
            storage_limit_gb: 1000,
            contacts_limit: 50,
            voice_notes_limit: 1000,
            created_at: "2024-01-15T00:00:00.000Z",
            last_login: new Date(Date.now() - 7200000).toISOString(),
            is_admin: false,
            admin_status: "none",
            note_count: 24,
            contact_count: 8,
            will_count: 3,
            scheduled_count: 5
          },
          voiceNotes: [
            { id: 1, title: "Family Memories", duration_seconds: 180, file_size_bytes: 5242880, created_at: "2024-05-15T10:30:00.000Z" },
            { id: 2, title: "Business Meeting", duration_seconds: 300, file_size_bytes: 7340032, created_at: "2024-05-10T14:20:00.000Z" }
          ],
          contacts: [
            { id: 1, name: "Sarah Smith", phone: "+1 (555) 987-6543", email: "sarah@example.com", relationship: "Spouse" },
            { id: 2, name: "Michael Chen", phone: "+1 (555) 456-7890", email: "michael@example.com", relationship: "Friend" }
          ],
          billingHistory: [
            { id: 1, amount_cents: 999, currency: "USD", description: "Premium Subscription", status: "paid", created_at: "2024-05-01T00:00:00.000Z" }
          ]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function for activity log
const timeAgo = (date) => {
  if (!date) return "Never";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDeleteUser = async () => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await api.deleteUser(id);
        router.push('/adminDashboard/users');
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <Layout type="admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading user details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout type="admin">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">User Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "The requested user could not be found."}</p>
          <Link
            href="/adminDashboard/users"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Link>
        </div>
      </Layout>
    );
  }

  const userData = user.user;
  const tabs = [
    { id: "overview", label: "Overview", icon: <User className="w-4 h-4" /> },
    { id: "voice-notes", label: "Voice Notes", icon: <MessageSquare className="w-4 h-4" />, count: userData.note_count },
    { id: "contacts", label: "Contacts", icon: <Users className="w-4 h-4" />, count: userData.contact_count },
    { id: "billing", label: "Billing History", icon: <CreditCard className="w-4 h-4" />, count: user.billingHistory?.length },
    { id: "activity", label: "Activity Log", icon: <Activity className="w-4 h-4" /> },
  ];
    // Breadcrumb items
const breadcrumbs = [
    { label: "Dashboard", href: "/adminDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "User Management", href: "/adminDashboard/users", icon: <Users className="w-4 h-4" /> },
    { label: userData?.full_name || "User Details", href: `/adminDashboard/users/${id}`, icon: <User className="w-4 h-4" />, current: true }
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

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Info Card */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">User Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Full Name</label>
                      <p className="text-lg font-medium text-gray-800 dark:text-white">{userData.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Email Address</label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-800 dark:text-white">{userData.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Phone Number</label>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-800 dark:text-white">{userData.phone || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Account Created</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-800 dark:text-white">{formatDate(userData.created_at)}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Last Login</label>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-800 dark:text-white">
                          {userData.last_login ? formatDate(userData.last_login) : "Never"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Admin Status</label>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-800 dark:text-white">
                          {userData.is_admin ? "Administrator" : "Regular User"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription & Usage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Subscription Card */}
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Subscription</h2>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      userData.subscription_status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {userData.subscription_status?.toUpperCase()}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Current Plan</label>
                      <div className="flex items-center gap-2 mt-1">
                        <CreditCard className="w-5 h-5 text-purple-500" />
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          {userData.subscription_tier?.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400">Voice Notes</label>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{userData.voice_notes_limit}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400">Contacts</label>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{userData.contacts_limit}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400">Storage</label>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{userData.storage_limit_gb} GB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Usage Statistics</h2>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Voice Notes</span>
                        <span className="font-medium">{userData.note_count || 0} / {userData.voice_notes_limit}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-brand-500 h-2 rounded-full"
                          style={{ width: `${((userData.note_count || 0) / userData.voice_notes_limit) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Contacts</span>
                        <span className="font-medium">{userData.contact_count || 0} / {userData.contacts_limit}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${((userData.contact_count || 0) / userData.contacts_limit) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Voice Wills</span>
                        <span className="font-medium">{userData.will_count || 0}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Scheduled Messages</span>
                        <span className="font-medium">{userData.scheduled_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Recent Activity */}
            <div className="space-y-8">
              {/* Account Actions */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium">View Voice Notes</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="font-medium">Manage Contacts</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="font-medium">Voice Wills</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                        <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="font-medium">Scheduled Messages</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* System Info */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">System Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">User ID</span>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{userData.id}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Account Status</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      userData.subscription_status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {userData.subscription_status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Admin Access</span>
                    {userData.is_admin ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email Verified</span>
                    {userData.email_verified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "voice-notes" && (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Voice Notes</h2>
                <p className="text-gray-600 dark:text-gray-400">{user.voiceNotes?.length || 0} voice notes</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all">
                <Download className="w-4 h-4" />
                Export All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Title</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Duration</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Size</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Created</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {user.voiceNotes?.map((note) => (
                    <tr key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white">{note.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{formatDuration(note.duration_seconds)}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{formatFileSize(note.file_size_bytes)}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{formatDate(note.created_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add other tabs (contacts, billing, activity) similarly */}

        {activeTab === "contacts" && (
  <div className="glass rounded-2xl p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Contacts</h2>
        <p className="text-gray-600 dark:text-gray-400">{user.contacts?.length || 0} contacts</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all">
        <Download className="w-4 h-4" />
        Export Contacts
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Relationship</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {user.contacts?.map((contact) => (
            <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-800 dark:text-white">{contact.name}</span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{contact.phone || "N/A"}</td>
              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{contact.email || "N/A"}</td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {contact.relationship || "Not specified"}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button 
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="View Contact"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Edit Contact"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

{activeTab === "billing" && (
  <div className="glass rounded-2xl p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Billing History</h2>
        <p className="text-gray-600 dark:text-gray-400">{user.billingHistory?.length || 0} transactions</p>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all">
          <CreditCard className="w-4 h-4" />
          View Invoices
        </button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Invoice</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {user.billingHistory?.map((bill) => {
            const amount = (bill.amount_cents / 100).toFixed(2);
            return (
              <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{formatDate(bill.created_at)}</td>
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-800 dark:text-white">{bill.description}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Transaction ID: {bill.id}</div>
                </td>
                <td className="py-3 px-4">
                  <div className={`font-bold ${bill.status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${amount} {bill.currency}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    bill.status === 'paid' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : bill.status === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {bill.status?.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    
    {/* Billing Summary */}
    <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Billing Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            ${user.billingHistory?.reduce((sum, bill) => sum + (bill.amount_cents / 100), 0).toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
          <div className="text-sm text-gray-600 dark:text-gray-400">Successful Payments</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {user.billingHistory?.filter(bill => bill.status === 'paid').length || 0}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
          <div className="text-sm text-gray-600 dark:text-gray-400">Current Plan</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {userData?.subscription_tier?.replace(/_/g, ' ') || 'None'}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{activeTab === "activity" && (
  <div className="glass rounded-2xl p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Activity Log</h2>
        <p className="text-gray-600 dark:text-gray-400">Recent user activities and system events</p>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>
    </div>
    
    {/* Activity Timeline */}
    <div className="space-y-4">
      {/* You can add mock activity data or fetch from API */}
      {[
        {
          id: 1,
          type: 'login',
          description: 'User logged in from new device',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          icon: <Shield className="w-5 h-5" />,
          color: 'bg-blue-500'
        },
        {
          id: 2,
          type: 'voice_note',
          description: 'Recorded new voice note "Family Memories"',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          icon: <Mic className="w-5 h-5" />,
          color: 'bg-purple-500'
        },
        {
          id: 3,
          type: 'contact',
          description: 'Added new contact: Sarah Smith',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          icon: <Users className="w-5 h-5" />,
          color: 'bg-green-500'
        },
        {
          id: 4,
          type: 'subscription',
          description: 'Upgraded to Premium plan',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          icon: <CreditCard className="w-5 h-5" />,
          color: 'bg-amber-500'
        },
        {
          id: 5,
          type: 'settings',
          description: 'Changed account password',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          icon: <Settings className="w-5 h-5" />,
          color: 'bg-gray-500'
        }
      ].map((activity) => (
        <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
          <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center flex-shrink-0`}>
            <div className="text-white">
              {activity.icon}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">{activity.description}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {activity.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Activity Stats */}
    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Logins</div>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">24</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
        <div className="text-sm text-gray-600 dark:text-gray-400">Voice Notes Created</div>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">{userData?.note_count || 0}</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
        <div className="text-sm text-gray-600 dark:text-gray-400">Last Active</div>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          {userData?.last_login ? timeAgo(userData.last_login) : 'Never'}
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
        <div className="text-sm text-gray-600 dark:text-gray-400">Account Age</div>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          {userData?.created_at ? Math.floor((new Date() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24)) : 0} days
        </div>
      </div>
    </div>
  </div>
)}
      </motion.div>
    </div>
  );
}