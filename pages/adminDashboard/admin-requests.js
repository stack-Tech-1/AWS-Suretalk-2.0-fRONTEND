// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\adminDashboard\admin-requests.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  AlertCircle,
  Filter,
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Eye,
  Download,
  RefreshCw,
  ChevronDown,
  FileText
} from 'lucide-react';
import { api } from '../../utils/api';
import Layout from "../../components/dashboard/Layout";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState({});
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  const filters = [
    { id: 'all', label: 'All Requests' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.getPendingRequests();
      const requestsData = response.data || [];
      setRequests(requestsData);
      
      // Calculate stats
      const pending = requestsData.filter(r => r.status === 'pending').length;
      const approved = requestsData.filter(r => r.status === 'approved').length;
      const rejected = requestsData.filter(r => r.status === 'rejected').length;
      
      setStats({
        pending,
        approved,
        rejected,
        total: requestsData.length
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      setProcessing(prev => ({ ...prev, [id]: 'approving' }));
      await api.approveAdminRequest(id);
      await fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessing(prev => ({ ...prev, [id]: 'rejecting' }));
      await api.rejectAdminRequest(id);
      await fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  const filteredRequests = requests.filter(request => {
    if (filter !== 'all' && request.status !== filter) {
      return false;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.full_name?.toLowerCase().includes(searchLower) ||
        request.email?.toLowerCase().includes(searchLower) ||
        request.phone?.includes(searchTerm) ||
        request.reason?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'approved': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'rejected': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const statsData = [
    { 
      label: 'Pending Requests', 
      value: stats.pending, 
      color: 'from-yellow-500 to-orange-500',
      icon: <Clock className="w-5 h-5" />
    },
    { 
      label: 'Approved', 
      value: stats.approved, 
      color: 'from-green-500 to-emerald-500',
      icon: <UserCheck className="w-5 h-5" />
    },
    { 
      label: 'Rejected', 
      value: stats.rejected, 
      color: 'from-red-500 to-pink-500',
      icon: <UserX className="w-5 h-5" />
    },
    { 
      label: 'Total Requests', 
      value: stats.total, 
      color: 'from-gray-500 to-gray-600',
      icon: <Users className="w-5 h-5" />
    },
  ];

  return (    
    <Layout type="admin">
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
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Admin Requests
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and review admin access requests from users
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 
                             text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 
                             dark:hover:bg-brand-900/20 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={fetchRequests}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                       text-white rounded-xl hover:shadow-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {statsData.map((stat, index) => (
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
                placeholder="Search requests by name, email, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filterItem) => (
              <button
                key={filterItem.id}
                onClick={() => setFilter(filterItem.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === filterItem.id
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {filterItem.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Requests Table */}
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
                  User
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Contact
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Reason
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading requests...</p>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="inline-flex flex-col items-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        No requests found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {searchTerm ? 'Try adjusting your search or filters' : 'No admin requests available'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request, index) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                          {request.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            {request.full_name || 'Unknown User'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">ID: {request.id}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Mail className="w-3 h-3" />
                          <span>{request.email}</span>
                        </div>
                        {request.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-3 h-3" />
                            <span>{request.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-800 dark:text-white">
                          {request.reason || 'No reason provided'}
                        </p>
                        {request.reason && request.reason.length > 80 && (
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="mt-1 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View full reason
                          </button>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </div>
                      {request.reviewed_by && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          By: {request.reviewed_by}
                        </p>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(request.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={processing[request.id]}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processing[request.id] === 'approving' ? (
                                <div className="w-3 h-3 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              disabled={processing[request.id]}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processing[request.id] === 'rejecting' ? (
                                <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            Details
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Management Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Approval Guidelines */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Approval Guidelines</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Verify Identity</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Confirm user identity through company email or phone verification
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Review Reason</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ensure the request reason aligns with business needs
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Security Check</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check for any security flags or previous violations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-300 
                             dark:border-gray-600 hover:border-green-500 transition-colors group">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">Approve All Pending</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Approve all pending requests</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-300 
                             dark:border-gray-600 hover:border-blue-500 transition-colors group">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">Export Report</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Download complete requests report</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-300 
                             dark:border-gray-600 hover:border-brand-500 transition-colors group">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-brand-500 group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">Update Settings</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Modify approval workflow</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-brand-500" />
            </button>
          </div>
        </div>

        {/* Security Metrics */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Security Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Response Time</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">4.2 hours</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approval Rate</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">68%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <button className="w-full px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                             text-white rounded-xl hover:shadow-lg transition-all">
              View Audit Trail
            </button>
          </div>
        </div>
      </motion.div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-semibold text-lg">
                  {selectedRequest.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {selectedRequest.full_name || 'Unknown User'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Admin Request Details</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800 dark:text-white">{selectedRequest.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Phone</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800 dark:text-white">
                      {selectedRequest.phone || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Request Reason
                </label>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <p className="text-gray-800 dark:text-white whitespace-pre-wrap">
                    {selectedRequest.reason || 'No reason provided'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Status</label>
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusIcon(selectedRequest.status)}
                    <span className="font-medium capitalize">{selectedRequest.status}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Request Date
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <p className="text-gray-800 dark:text-white">
                      {new Date(selectedRequest.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Request Time
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <p className="text-gray-800 dark:text-white">
                      {new Date(selectedRequest.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              {selectedRequest.reviewed_by && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Reviewed By
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <p className="text-gray-800 dark:text-white">{selectedRequest.reviewed_by}</p>
                    {selectedRequest.reviewed_at && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        On {new Date(selectedRequest.reviewed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                Close
              </button>
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                    className="px-6 py-3 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/50 border border-green-500/50 rounded-xl text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                    className="px-6 py-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 border border-red-500/50 rounded-xl text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Request
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}