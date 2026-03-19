'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/utils/api';
import {
  Users, Search, Filter, Shield, AlertTriangle,
  CheckCircle, XCircle, RefreshCw, ChevronLeft,
  ChevronRight, Eye, Edit, Ban, Zap, Mic,
  Calendar, HardDrive, Phone, Mail
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

  useEffect(() => {
    fetchUsers(1);
    fetchOverview();
    fetchDeadLetters();
  }, [fetchUsers]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(1), 400);
    return () => clearTimeout(timeout);
  }, [search, tierFilter, statusFilter]);

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
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {['users', 'dead-letters', 'activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab === 'dead-letters' ? `Dead Letters ${deadLetters.length > 0 ? `(${deadLetters.length})` : ''}` : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

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
    </div>
  );
}
