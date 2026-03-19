'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/utils/api';
import {
  Users, Search, Filter, Shield, AlertTriangle,
  CheckCircle, XCircle, X, RefreshCw, ChevronLeft,
  ChevronRight, Eye, Edit, Ban, Zap, Mic,
  Calendar, HardDrive, Phone, Mail, Download
} from 'lucide-react';

const TIER_COLORS = {
  LITE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  ESSENTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  LEGACY_VAULT_PREMIUM: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
};

const TIER_LABELS = {
  LITE: 'Lite',
  ESSENTIAL: 'Essential',
  LEGACY_VAULT_PREMIUM: 'Premium'
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [overview, setOverview] = useState(null);
  const [deadLetters, setDeadLetters] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [actionLoading, setActionLoading] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({
    userId: '',
    slotNumber: '',
    contact: '',
    voiceMessage: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [syncHealth, setSyncHealth] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page, limit: 20,
        ...(search && { search }),
        ...(tierFilter && { tier: tierFilter }),
        ...(statusFilter && { status: statusFilter })
      });
      const response = await api.request(`/super-admin/users?${params}`);
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, tierFilter, statusFilter]);

  const fetchOverview = async () => {
    try {
      const response = await api.request('/super-admin/overview');
      if (response.success) setOverview(response.data);
    } catch (err) {
      console.error('Failed to fetch overview:', err);
    }
  };

  const fetchDeadLetters = async () => {
    try {
      const response = await api.request('/super-admin/sync/dead-letters');
      if (response.success) setDeadLetters(response.data.deadLetters);
    } catch (err) {
      console.error('Failed to fetch dead letters:', err);
    }
  };

  const fetchSyncHealth = async () => {
    try {
      const response = await api.request('/super-admin/sync-health');
      if (response.success) setSyncHealth(response.data);
    } catch (err) {
      console.error('Failed to fetch sync health:', err);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const response = await api.request('/super-admin/system-health');
      if (response.success) setSystemHealth(response.data);
    } catch (err) {
      console.error('Failed to fetch system health:', err);
    }
  };

  const fetchRevenue = async () => {
    try {
      const response = await api.request('/super-admin/revenue');
      if (response.success) setRevenue(response.data);
    } catch (err) {
      console.error('Failed to fetch revenue:', err);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      await api.exportSuperAdminUsers();
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    fetchOverview();
    fetchDeadLetters();
  }, [fetchUsers]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(1), 400);
    return () => clearTimeout(timeout);
  }, [search, tierFilter, statusFilter]);

  useEffect(() => {
    if (activeTab === 'sync-monitor' && !syncHealth) fetchSyncHealth();
    if (activeTab === 'system-health' && !systemHealth) fetchSystemHealth();
    if (activeTab === 'revenue' && !revenue) fetchRevenue();
  }, [activeTab]);

  const handleTierChange = async (userId, newTier) => {
    const reason = prompt(`Reason for changing tier to ${newTier}:`);
    if (!reason) return;
    try {
      setActionLoading(userId);
      await api.request(`/super-admin/users/${userId}/tier`, {
        method: 'PUT',
        body: JSON.stringify({ tier: newTier, reason })
      });
      fetchUsers(pagination.page);
    } catch (err) {
      alert('Failed to update tier: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (userId, currentlySuspended) => {
    const action = currentlySuspended ? 'reactivate' : 'suspend';
    const reason = prompt(`Reason to ${action} this account:`);
    if (!reason) return;
    try {
      setActionLoading(userId);
      await api.request(`/super-admin/users/${userId}/suspend`, {
        method: 'PUT',
        body: JSON.stringify({ suspend: !currentlySuspended, reason })
      });
      fetchUsers(pagination.page);
    } catch (err) {
      alert('Failed to update account: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetrySync = async (syncId) => {
    try {
      setActionLoading(syncId);
      await api.request(`/super-admin/sync/${syncId}/retry`, { method: 'POST' });
      fetchDeadLetters();
    } catch (err) {
      alert('Failed to retry: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (item) => {
    const payload = item.payload || {};
    setEditForm({
      userId: payload.userId || '',
      slotNumber: payload.slotNumber || '',
      contact: payload.contact || '',
      voiceMessage: payload.voiceMessage || ''
    });
    setEditModal(item);
    setEditError('');
  };

  const handleEditRetry = async () => {
    if (!editModal) return;
    const slot = parseInt(editForm.slotNumber);
    if (isNaN(slot) || slot < 1 || slot > 15) {
      setEditError('Slot number must be between 1 and 15');
      return;
    }
    if (!editForm.userId || !editForm.voiceMessage) {
      setEditError('userId and voiceMessage are required');
      return;
    }
    try {
      setEditLoading(true);
      setEditError('');
      await api.request(`/super-admin/sync/${editModal.id}/edit-retry`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      setEditModal(null);
      fetchDeadLetters();
    } catch (err) {
      setEditError(err.message || 'Failed to update sync item');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Full system access & monitoring</p>
          </div>
        </div>
        <button
          onClick={() => { fetchUsers(pagination.page); fetchOverview(); fetchDeadLetters(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Overview stats */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger-children">
          <div className="card p-4">
            <p className="text-xs text-gray-500 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white stat-number">{overview.users.total_users}</p>
            <p className="text-xs text-green-600 mt-1">+{overview.users.new_this_week} this week</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 mb-1">Active Today</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white stat-number">{overview.users.active_today}</p>
            <p className="text-xs text-gray-400 mt-1">{overview.users.suspended_users} suspended</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 mb-1">Voice Notes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white stat-number">{overview.content.total_voice_notes}</p>
            <p className="text-xs text-gray-400 mt-1">{formatBytes(overview.content.total_storage_bytes)} total</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 mb-1">Dead Syncs</p>
            <p className={`text-2xl font-bold stat-number ${overview.sync.dead_count > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
              {overview.sync.dead_count}
            </p>
            <p className="text-xs text-gray-400 mt-1">{overview.sync.pending_count} pending</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {(() => {
        const MAIN_TABS = [
          { id: 'users', label: 'Users' },
          { id: 'dead-letters', label: `Dead Letters${deadLetters.length > 0 ? ` (${deadLetters.length})` : ''}` },
          { id: 'activity', label: 'Activity' },
          { id: 'sync-monitor', label: 'Sync Monitor' },
          { id: 'system-health', label: 'System Health' },
          { id: 'revenue', label: 'Revenue' },
        ];
        return (
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {MAIN_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        );
      })()}

      {/* Users tab */}
      {activeTab === 'users' && (
        <div>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Tiers</option>
              <option value="LITE">Lite</option>
              <option value="ESSENTIAL">Essential</option>
              <option value="LEGACY_VAULT_PREMIUM">Premium</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {exportLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export CSV
            </button>
          </div>

          {/* User list */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card p-4 h-20 skeleton" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className={`card p-4 ${user.is_suspended ? 'opacity-60 border-red-200 dark:border-red-800' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {user.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{user.full_name || 'Unknown'}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS[user.subscription_tier] || TIER_COLORS.LITE}`}>
                            {TIER_LABELS[user.subscription_tier] || user.subscription_tier}
                          </span>
                          {user.is_suspended && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                              Suspended
                            </span>
                          )}
                          {user.is_super_admin && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              Super Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1"><Mic className="w-3 h-3" />{user.voice_note_count} notes</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{user.contact_count} contacts</span>
                          <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{formatBytes(user.storage_used_bytes)}</span>
                          <span>Joined {formatDate(user.created_at)}</span>
                          {user.last_login && <span>Last seen {formatDate(user.last_login)}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/adminDashboard/super/users/${user.id}`}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="View full profile"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Link>

                      <select
                        value={user.subscription_tier}
                        onChange={e => handleTierChange(user.id, e.target.value)}
                        disabled={actionLoading === user.id}
                        className="text-xs px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        title="Change tier"
                      >
                        <option value="LITE">Lite</option>
                        <option value="ESSENTIAL">Essential</option>
                        <option value="LEGACY_VAULT_PREMIUM">Premium</option>
                      </select>

                      <button
                        onClick={() => handleSuspend(user.id, user.is_suspended)}
                        disabled={actionLoading === user.id || user.is_super_admin}
                        className={`p-2 rounded-lg transition-colors ${
                          user.is_suspended
                            ? 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600'
                            : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500'
                        } disabled:opacity-40`}
                        title={user.is_suspended ? 'Reactivate account' : 'Suspend account'}
                      >
                        {user.is_suspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {users.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  No users found matching your filters.
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
              </span>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dead letters tab */}
      {activeTab === 'dead-letters' && (
        <div className="space-y-3">
          {deadLetters.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No dead sync items. All syncs are healthy.</p>
            </div>
          ) : (
            deadLetters.map(item => (
              <div key={item.id} className="card p-4 border-red-200 dark:border-red-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="font-medium text-gray-900 dark:text-white">{item.event_type}</p>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        Dead after {item.attempts} attempts
                      </span>
                    </div>
                    <p className="text-sm text-red-500 mb-1">{item.error_message}</p>
                    <p className="text-xs text-gray-400">
                      Last attempt: {item.last_attempt_at ? new Date(item.last_attempt_at).toLocaleString() : 'Never'}
                    </p>
                    <pre className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-auto max-h-24">
                      {JSON.stringify(item.payload, null, 2)}
                    </pre>
                  </div>
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleRetrySync(item.id)}
                    disabled={actionLoading === item.id}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 transition-colors disabled:opacity-40 flex-shrink-0"
                  >
                    <RefreshCw className={`w-3 h-3 ${actionLoading === item.id ? 'animate-spin' : ''}`} />
                    Retry
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Activity tab */}
      {activeTab === 'activity' && overview && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent System Activity</h3>
          <div className="space-y-2">
            {overview.recentActivity.map((event, i) => (
              <div key={i} className="card p-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{event.full_name || event.email}</span>
                    {' '}<span className="text-gray-500">{event.event_type.replace(/_/g, ' ')}</span>
                  </p>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(event.created_at).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync Monitor tab */}
      {activeTab === 'sync-monitor' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Sync Monitor</h3>
          {!syncHealth ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
              <div className="card p-4">
                <p className="text-xs text-gray-500 mb-1">Total Sync Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white stat-number">{syncHealth.total ?? '—'}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 stat-number">{syncHealth.pending ?? '—'}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600 stat-number">{syncHealth.completed ?? '—'}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-500 mb-1">Failed / Dead</p>
                <p className={`text-2xl font-bold stat-number ${(syncHealth.dead ?? 0) > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                  {syncHealth.dead ?? '—'}
                </p>
              </div>
              {syncHealth.byEvent && (
                <div className="card p-4 md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">By Event Type</p>
                  <div className="space-y-2">
                    {Object.entries(syncHealth.byEvent).map(([event, counts]) => (
                      <div key={event} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">{event}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-green-600">{counts.completed ?? 0} ok</span>
                          <span className="text-yellow-600">{counts.pending ?? 0} pending</span>
                          <span className="text-red-600">{counts.dead ?? 0} dead</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* System Health tab */}
      {activeTab === 'system-health' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">System Health</h3>
          {!systemHealth ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
              {Object.entries(systemHealth).map(([key, value]) => (
                <div key={key} className="card p-4">
                  <p className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                  {typeof value === 'object' && value !== null ? (
                    <div className="space-y-1 mt-2">
                      {Object.entries(value).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}</span>
                          <span className={`font-medium ${
                            v === 'ok' || v === true || v === 'healthy' ? 'text-green-600' :
                            v === 'degraded' || v === 'warning' ? 'text-yellow-600' :
                            v === 'error' || v === false || v === 'unhealthy' ? 'text-red-600' :
                            'text-gray-900 dark:text-white'
                          }`}>
                            {String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-lg font-bold stat-number ${
                      value === 'ok' || value === true || value === 'healthy' ? 'text-green-600' :
                      value === 'degraded' || value === 'warning' ? 'text-yellow-600' :
                      value === 'error' || value === false || value === 'unhealthy' ? 'text-red-600' :
                      'text-gray-900 dark:text-white'
                    }`}>
                      {String(value)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Revenue tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Revenue</h3>
          {!revenue ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : (
            <div className="space-y-6 stagger-children">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                  <p className="text-xs text-gray-500 mb-1">MRR</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white stat-number">
                    {revenue.mrr != null ? `$${Number(revenue.mrr).toLocaleString()}` : '—'}
                  </p>
                </div>
                <div className="card p-4">
                  <p className="text-xs text-gray-500 mb-1">ARR</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white stat-number">
                    {revenue.arr != null ? `$${Number(revenue.arr).toLocaleString()}` : '—'}
                  </p>
                </div>
                <div className="card p-4">
                  <p className="text-xs text-gray-500 mb-1">Paying Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white stat-number">
                    {revenue.paying_users ?? '—'}
                  </p>
                </div>
                <div className="card p-4">
                  <p className="text-xs text-gray-500 mb-1">Churn Rate</p>
                  <p className={`text-2xl font-bold stat-number ${(revenue.churn_rate ?? 0) > 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {revenue.churn_rate != null ? `${revenue.churn_rate}%` : '—'}
                  </p>
                </div>
              </div>

              {/* By tier */}
              {revenue.byTier && (
                <div className="card p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Revenue by Tier</p>
                  <div className="space-y-3">
                    {Object.entries(revenue.byTier).map(([tier, data]) => (
                      <div key={tier} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS[tier] || TIER_COLORS.LITE}`}>
                            {TIER_LABELS[tier] || tier}
                          </span>
                          <span className="text-sm text-gray-500">{data.count ?? 0} users</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {data.mrr != null ? `$${Number(data.mrr).toLocaleString()}/mo` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent transactions */}
              {revenue.recentTransactions && revenue.recentTransactions.length > 0 && (
                <div className="card p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Transactions</p>
                  <div className="space-y-2">
                    {revenue.recentTransactions.map((tx, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-gray-900 dark:text-white truncate">{tx.user_email || tx.user_id}</span>
                          <span className="text-gray-400 text-xs flex-shrink-0">{tx.event}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount != null ? `$${Math.abs(tx.amount).toFixed(2)}` : '—'}
                          </span>
                          <span className="text-gray-400 text-xs">{formatDate(tx.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit & Retry modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditModal(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit & Retry Sync</h3>
                <p className="text-sm text-gray-500 mt-0.5">Fix the payload then retry the sync</p>
              </div>
              <button
                onClick={() => setEditModal(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="mb-4 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                <span className="font-medium">Event:</span> {editModal.event_type}
                <span className="ml-2 text-orange-500">• {editModal.attempts} failed attempts</span>
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">{editModal.error_message}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User ID (phone number) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.userId}
                  onChange={e => setEditForm(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="+2348167721999"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slot Number (1-15) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={editForm.slotNumber}
                  onChange={e => setEditForm(prev => ({ ...prev, slotNumber: e.target.value }))}
                  placeholder="e.g. 1"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-gray-400 mt-1">Which IVR keypad slot this recording maps to</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={editForm.contact}
                  onChange={e => setEditForm(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="+2348012345678 or leave empty"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty if no contact attached</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Voice Message URL (S3 or recording) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.voiceMessage}
                  onChange={e => setEditForm(prev => ({ ...prev, voiceMessage: e.target.value }))}
                  placeholder="https://suertalk-voice-notes.s3..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            {editError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>
              </div>
            )}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditRetry}
                disabled={editLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white text-sm font-semibold hover:shadow-brand transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {editLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Save & Retry
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
