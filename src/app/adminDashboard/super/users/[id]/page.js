'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/utils/api';
import {
  ArrowLeft, User, Mic, Shield, Calendar, Activity,
  CreditCard, Phone, Mail, MapPin, Clock, Download,
  Play, Star, Lock, AlertTriangle, CheckCircle,
  BarChart2, TrendingUp, Zap, RefreshCw, Eye
} from 'lucide-react';

const TIER_LABELS = {
  LITE: 'Lite', ESSENTIAL: 'Essential', LEGACY_VAULT_PREMIUM: 'Premium'
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never';
const formatDateTime = (d) => d ? new Date(d).toLocaleString() : 'Never';
const formatDuration = (s) => { if (!s) return '0:00'; return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; };

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'recordings', label: 'Recordings', icon: Mic },
  { id: 'scheduled', label: 'Scheduled', icon: Calendar },
  { id: 'vault', label: 'Vault', icon: Shield },
  { id: 'footprint', label: 'Footprint', icon: Activity },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [footprint, setFootprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [footprintLoading, setFootprintLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState(null);
  const [resyncing, setResyncing] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const [exportLoading, setExportLoading] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const response = await api.request(`/super-admin/users/${params.id}/full`);
        if (response.success) setUserData(response.data);
        else setError(response.error);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [params.id]);

  useEffect(() => {
    if (activeTab === 'footprint' && !footprint) {
      const loadFootprint = async () => {
        try {
          setFootprintLoading(true);
          const response = await api.request(`/super-admin/users/${params.id}/footprint`);
          if (response.success) setFootprint(response.data);
        } catch (err) {
          console.error('Failed to load footprint:', err);
        } finally {
          setFootprintLoading(false);
        }
      };
      loadFootprint();
    }
  }, [activeTab, params.id, footprint]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading user data...</p>
      </div>
    </div>
  );

  if (error || !userData) return (
    <div className="text-center py-16">
      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">{error || 'User not found'}</p>
      <Link href="/adminDashboard/super" className="mt-4 inline-flex items-center gap-2 text-brand-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to users
      </Link>
    </div>
  );

  const { user, voiceNotes, contacts, scheduled, vault } = userData;

  const handleResync = async () => {
    if (!confirm('Re-sync this user from the IVR system? This will update their subscription data from DynamoDB.')) return;

    try {
      setResyncing(true);
      const response = await api.request(`/super-admin/users/${params.id}/resync`, {
        method: 'POST'
      });

      if (response.success) {
        const synced = response.data.syncedFields.join(', ');
        alert(`✅ Re-sync successful!\n\nUpdated fields: ${synced}\n\nRefreshing user data...`);
        const refreshed = await api.request(`/super-admin/users/${params.id}/full`);
        if (refreshed.success) setUserData(refreshed.data);
      } else {
        alert('Re-sync failed: ' + response.error);
      }
    } catch (err) {
      alert('Re-sync failed: ' + err.message);
    } finally {
      setResyncing(false);
    }
  };

  const handleImpersonate = async () => {
    if (!confirm(`Start impersonation session for ${userData.user.full_name}?\n\nYou will view the app as this user for 5 minutes. All actions will be logged.`)) return;
    try {
      setImpersonating(true);
      const response = await api.request(`/super-admin/users/${params.id}/impersonate`, { method: 'POST' });
      if (!response.success) throw new Error(response.error);
      const currentToken = localStorage.getItem('token');
      localStorage.setItem('adminReturnToken', currentToken);
      localStorage.setItem('impersonationToken', response.data.token);
      localStorage.setItem('impersonationData', JSON.stringify({
        targetUser: response.data.targetUser,
        expiresAt: response.data.expiresAt,
        startedAt: new Date().toISOString()
      }));
      localStorage.setItem('token', response.data.token);
      window.location.href = '/usersDashboard';
    } catch (err) {
      alert('Impersonation failed: ' + err.message);
      setImpersonating(false);
    }
  };

  const handleExport = async (type) => {
    try {
      setExportLoading(type);
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      let url, filename;
      if (type === 'full') {
        url = `${baseUrl}/super-admin/users/${params.id}/export/full`;
        filename = `user-${params.id}-full.json`;
      } else if (type === 'billing') {
        url = `${baseUrl}/super-admin/users/${params.id}/export/billing`;
        filename = `user-${params.id}-billing.csv`;
      } else if (type === 'voice-notes') {
        url = `${baseUrl}/super-admin/users/${params.id}/export/voice-notes`;
        filename = `user-${params.id}-voice-notes.csv`;
      }
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExportLoading('');
    }
  };

  return (
    <div className="page-enter max-w-5xl mx-auto">
      {/* Back button */}
      <Link href="/adminDashboard/super" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to users
      </Link>

      {/* User header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">{user.full_name?.charAt(0) || 'U'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.full_name || 'Unknown'}</h1>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                {TIER_LABELS[user.subscription_tier] || user.subscription_tier}
              </span>
              {user.is_suspended && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">Suspended</span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{user.email}</span>
              {user.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{user.phone}</span>}
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Joined {formatDate(user.created_at)}</span>
              <span className="flex items-center gap-1"><Activity className="w-4 h-4" />Last seen {formatDate(user.last_login)}</span>
            </div>
          </div>
          {/* Quick stats */}
          <div className="hidden md:flex gap-6 text-center flex-shrink-0">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.voice_note_count}</p>
              <p className="text-xs text-gray-500">Notes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.scheduled_count}</p>
              <p className="text-xs text-gray-500">Scheduled</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatBytes(user.storage_used_bytes)}</p>
              <p className="text-xs text-gray-500">Storage</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleImpersonate}
            disabled={impersonating || userData.user.is_admin}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-40"
            title={userData.user.is_admin ? 'Cannot impersonate admin accounts' : 'View dashboard as this user'}
          >
            {impersonating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            {impersonating ? 'Starting...' : 'Impersonate'}
          </button>
          <button
            onClick={handleResync}
            disabled={resyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-40"
            title="Re-sync subscription data from IVR/DynamoDB"
          >
            <RefreshCw className={`w-4 h-4 ${resyncing ? 'animate-spin' : ''}`} />
            {resyncing ? 'Syncing...' : 'Re-sync from IVR'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-brand'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Account Details</h3>
            <dl className="space-y-3">
              {[
                ['Full Name', user.full_name],
                ['Email', user.email],
                ['Phone', user.phone || 'Not set'],
                ['Source', user.source || 'app'],
                ['Email Verified', user.email_verified ? 'Yes' : 'No'],
                ['Account Created', formatDateTime(user.created_at)],
                ['Last Login', formatDateTime(user.last_login)],
                ['Is Admin', user.is_admin ? 'Yes' : 'No'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium text-right max-w-[200px] truncate">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Export Data</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { type: 'full', label: 'Full Data (JSON)' },
                  { type: 'billing', label: 'Billing (CSV)' },
                  { type: 'voice-notes', label: 'Voice Notes (CSV)' },
                ].map(({ type, label }) => (
                  <button
                    key={type}
                    onClick={() => handleExport(type)}
                    disabled={exportLoading === type}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
                  >
                    {exportLoading === type ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    {exportLoading === type ? 'Exporting...' : label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contacts ({contacts.length})</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {contacts.length === 0 ? (
                <p className="text-sm text-gray-400">No contacts added</p>
              ) : contacts.map(c => (
                <div key={c.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-gray-400 text-xs">{c.phone || c.email}</p>
                  </div>
                  {c.is_beneficiary && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">Beneficiary</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recordings tab */}
      {activeTab === 'recordings' && (
        <div className="space-y-3">
          {voiceNotes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No voice notes recorded</div>
          ) : voiceNotes.map(note => (
            <div key={note.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{note.title}</p>
                    {note.is_favorite && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                    {note.is_permanent && <Lock className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{formatDuration(note.duration_seconds)}</span>
                    <span>{formatBytes(note.file_size_bytes)}</span>
                    <span className="flex items-center gap-1"><Play className="w-3 h-3" />{note.play_count} plays</span>
                    <span>{note.source === 'ivr' ? 'IVR' : 'App'}</span>
                    <span>{formatDate(note.created_at)}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 ml-3">
                  {note.s3_bucket}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scheduled tab */}
      {activeTab === 'scheduled' && (
        <div className="space-y-3">
          {scheduled.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No scheduled messages</div>
          ) : scheduled.map(msg => (
            <div key={msg.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white mb-1">{msg.voice_note_title || 'IVR Recording'}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span>{msg.delivery_method}</span>
                    <span>{msg.recipient_email || msg.recipient_phone}</span>
                    <span>Scheduled: {formatDateTime(msg.scheduled_for)}</span>
                    {msg.delivered_at && <span>Delivered: {formatDateTime(msg.delivered_at)}</span>}
                    {msg.metadata?.source === 'ivr' && <span className="text-blue-500">Via IVR</span>}
                  </div>
                  {msg.error_message && <p className="text-xs text-red-500 mt-1">{msg.error_message}</p>}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  msg.delivery_status === 'delivered' ? 'bg-green-100 text-green-700' :
                  msg.delivery_status === 'failed' ? 'bg-red-100 text-red-700' :
                  msg.delivery_status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {msg.delivery_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vault tab */}
      {activeTab === 'vault' && (
        <div className="space-y-3">
          {vault.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No vault items</p>
            </div>
          ) : vault.map(item => (
            <div key={item.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                    {item.is_released && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Released
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span>Release: {item.release_condition || 'manual'}</span>
                    {item.release_date && <span>Date: {formatDate(item.release_date)}</span>}
                    {item.released_at && <span>Released: {formatDate(item.released_at)}</span>}
                    <span>Added: {formatDate(item.created_at)}</span>
                    {item.beneficiaries?.length > 0 && (
                      <span>{item.beneficiaries.length} beneficiar{item.beneficiaries.length === 1 ? 'y' : 'ies'}</span>
                    )}
                    {item.executors?.length > 0 && (
                      <span>{item.executors.length} executor{item.executors.length === 1 ? '' : 's'}</span>
                    )}
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footprint tab */}
      {activeTab === 'footprint' && (
        <div>
          {footprintLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : footprint ? (
            <div className="space-y-6">
              {/* Event breakdown */}
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Activity Breakdown (Last 90 Days)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {footprint.eventBreakdown.map(({ event_type, count }) => (
                    <div key={event_type} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{event_type.replace(/_/g, ' ')}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily activity */}
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Activity</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {footprint.dailySummary.map(day => (
                    <div key={day.date} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                      <span className="text-gray-500 dark:text-gray-400 w-28">{formatDate(day.date)}</span>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Play className="w-3 h-3 text-green-500" />{day.plays}</span>
                        <span className="flex items-center gap-1"><Mic className="w-3 h-3 text-blue-500" />{day.recordings}</span>
                        <span className="flex items-center gap-1"><Download className="w-3 h-3 text-purple-500" />{day.downloads}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-orange-500" />{day.schedules}</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">{day.total_events} events</span>
                    </div>
                  ))}
                  {footprint.dailySummary.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No activity in the last 90 days</p>
                  )}
                </div>
              </div>

              {/* Top played notes */}
              {footprint.topPlayed.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Most Played Recordings</h3>
                  <div className="space-y-2">
                    {footprint.topPlayed.map((note, i) => (
                      <div key={note.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <span className="text-lg font-bold text-gray-300 dark:text-gray-600 w-6">{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{note.title}</p>
                          <p className="text-xs text-gray-400">{formatDuration(note.duration_seconds)} • Added {formatDate(note.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{note.play_count}</p>
                          <p className="text-xs text-gray-400">plays</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw event log */}
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Raw Event Log ({footprint.events.length} events)</h3>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {footprint.events.map((event, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 text-xs rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                      <span className="text-gray-400 w-36 flex-shrink-0">{formatDateTime(event.created_at)}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{event.event_type.replace(/_/g, ' ')}</span>
                      {event.event_data && Object.keys(event.event_data).length > 0 && (
                        <span className="text-gray-400 truncate">{JSON.stringify(event.event_data)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Failed to load footprint data</div>
          )}
        </div>
      )}

      {/* Billing tab */}
      {activeTab === 'billing' && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Billing Information</h3>
          <dl className="space-y-3">
            {[
              ['Current Tier', TIER_LABELS[user.subscription_tier] || user.subscription_tier],
              ['Stripe Customer ID', user.stripe_customer_id || 'Not connected'],
              ['Stripe Subscription ID', user.stripe_subscription_id || 'None'],
              ['Subscription Status', user.stripe_subscription_status || 'Unknown'],
              ['Storage Limit', `${user.storage_limit_gb || 5} GB`],
              ['Storage Used', formatBytes(user.storage_used_bytes)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {!user.stripe_customer_id && (
            <div className="mt-4 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                No Stripe customer linked
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                This user subscribed via IVR. Click "Re-sync from IVR" above to pull their
                Stripe customer ID from DynamoDB.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
