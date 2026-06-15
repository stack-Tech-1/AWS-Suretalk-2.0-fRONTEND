//C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\src\app\usersDashboard\page.js
"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Mic, Users, Shield, Calendar, Play, 
  Download, Share2, Star, TrendingUp,
  Clock, Volume2, MoreVertical,
  Plus, Headphones, ArrowUpRight,
  Bell, Zap, ChevronRight, Activity
} from "lucide-react";
import {
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart,
  Pie, Cell
} from 'recharts';
import { api } from '@/utils/api';
import Link from 'next/link';
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { useAuth } from '@/contexts/AuthContext'; // ✅ Import useAuth
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardHome() {
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const analytics = useAnalyticsContext();
  
  // ✅ Use AuthContext instead of separate user state
  const { user, hasLegacyVault, loading: authLoading, refreshProfile } = useAuth();
  const { t } = useLanguage();

  // State for all dashboard data
  // ✅ Remove userData state - use AuthContext user instead
  const [analyticsData, setAnalyticsData] = useState(null);
  const [recentRecordings, setRecentRecordings] = useState([]);
  const [storageData, setStorageData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [quickStats, setQuickStats] = useState({
    voiceNotes: { value: "0", change: "+0%" },
    contacts: { value: "0/0", change: "+0" },
    vaultItems: { value: "0", change: "None yet" },
    scheduled: { value: "0", change: "None yet" }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // ✅ Wait for auth to load
    if (authLoading) return;

    try {
      setLoading(true);
      setError(null);

      // Fire all three independent requests in parallel — was sequential (waterfall)
      const [statsResponse, analyticsResponse, notesResponse] = await Promise.all([
        api.getUserDashboardStats(),
        api.getActivityAnalytics('week'),
        api.getVoiceNotes({ page: 1, limit: 4 })
      ]);

      // Process stats
      const actualStats = statsResponse.data?.stats || {};
      setDashboardStats(statsResponse.data);

      const voiceNotesTotal = parseInt(actualStats.voice_notes_total) || 0;
      const contactsTotal = parseInt(actualStats.contacts_total) || 0;
      const scheduledTotal = parseInt(actualStats.scheduled_messages_total) || 0;

      // Process analytics
      setAnalyticsData(analyticsResponse.data);
      if (analyticsResponse.data?.weekly) {
        setActivityData(analyticsResponse.data.weekly);
      }

      // Process voice notes
      const notesWithFormattedData = (notesResponse.data.voiceNotes || notesResponse.data.notes || []).map((note) => ({
        id: note.id,
        title: note.title || 'Untitled Recording',
        duration: formatDuration(note.duration_seconds || 0),
        date: formatDate(note.created_at),
        size: formatFileSize(note.file_size_bytes || 0),
        favorite: note.is_favorite || false,
        type: note.is_permanent ? 'legacy' : (note.tags?.includes('work') ? 'work' : 'personal'),
        tags: note.tags || [],
        playCount: note.play_count || 0
      }));

      setRecentRecordings(notesWithFormattedData);

      // Calculate storage usage
      const storageDistribution = calculateStorageDistribution(notesResponse.data.voiceNotes || notesResponse.data.notes || []);
      setStorageData(storageDistribution);

      setQuickStats({
        voiceNotes: {
          value: voiceNotesTotal.toString(),
          change: calculateChange(voiceNotesTotal, 0)
        },
        contacts: {
          value: `${contactsTotal}/${user?.contacts_limit || 0}`, // ✅ Use user from context
          change: `+${contactsTotal}`
        },
        vaultItems: {
          value: (parseInt(actualStats.wills_total) || 0).toString(),
          change: (parseInt(actualStats.wills_total) || 0) === 0 ? "None yet" : "Protected"
        },
        scheduled: {
          value: scheduledTotal.toString(),
          change: scheduledTotal === 0 ? "None yet" : `${scheduledTotal} pending`
        }
      });

      // Record dashboard view analytics
      analytics.recordEvent('page_view', {
        page: 'dashboard',
        section: 'overview'
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // Fallback to basic data if analytics fails
      await loadFallbackData();
    } finally {
      setLoading(false);
    }

    // Load billing separately — never blocks dashboard render
    loadBillingData();
  };

  const loadBillingData = async () => {
    try {
      setBillingLoading(true);
      const billingRes = await api.getSubscription();
      if (billingRes?.data) setSubscriptionInfo(billingRes.data);
    } catch (err) {
      console.warn('Billing data unavailable:', err.message);
      // Don't set global error — leave billing section empty
    } finally {
      setBillingLoading(false);
    }
  };

  // Fallback data loading if analytics fails
  const loadFallbackData = async () => {
    try {
      // ✅ No need to load profile - user is already in context
      // Just load basic data without analytics
      const notesResponse = await api.getVoiceNotes({ page: 1, limit: 4 });
      const notesWithFormattedData = (notesResponse.data.voiceNotes || notesResponse.data.notes || []).map((note) => ({
        id: note.id,
        title: note.title || 'Untitled Recording',
        duration: formatDuration(note.duration_seconds || 0),
        date: formatDate(note.created_at),
        size: formatFileSize(note.file_size_bytes || 0),
        favorite: note.is_favorite || false,
        type: note.is_permanent ? 'legacy' : 'personal',
        tags: note.tags || []
      }));
      
      setRecentRecordings(notesWithFormattedData);
      
      // Set basic activity data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const emptyData = days.map(day => ({
        day,
        notes: 0,
        listens: 0
      }));
      setActivityData(emptyData);

    } catch (fallbackError) {
      console.error('Fallback data loading failed:', fallbackError);
    }
  };

  // Helper function to get scheduled count
  const getScheduledCount = async () => {
    try {
      const scheduledResponse = await api.getScheduledMessages({ page: 1, limit: 1 });
      return scheduledResponse.data.pagination?.total || 0;
    } catch {
      return 0;
    }
  };

  // Helper functions (same as before but added here for completeness)
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Unknown date';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateChange = (current, previous) => {
    if (previous === 0) return '+0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
  };

  const calculateStorageDistribution = (notes) => {
    const totalBytes = notes.reduce((sum, note) => sum + (note.file_size_bytes || 0), 0);
    if (totalBytes === 0) return [];
    
    const vaultBytes = notes
      .filter(note => note.is_permanent)
      .reduce((sum, note) => sum + (note.file_size_bytes || 0), 0);
    const regularBytes = totalBytes - vaultBytes;
    
    const distribution = [];
    
    if (regularBytes > 0) {
      distribution.push({ 
        name: 'Voice Notes', 
        value: Math.round((regularBytes / totalBytes) * 100), 
        color: '#3b82f6' 
      });
    }
    
    if (vaultBytes > 0) {
      distribution.push({ 
        name: 'Vault Storage', 
        value: Math.round((vaultBytes / totalBytes) * 100), 
        color: '#8b5cf6' 
      });
    }
    
    return distribution;
  };

  // Handle audio playback with analytics
  const handlePlayAudio = async (recording) => {
    // Stop whatever is currently playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (playingAudio === recording.id) {
      setPlayingAudio(null);
      return;
    }

    try {
      await analytics.recordVoiceNoteEvent('voice_note_played', recording.id, {
        duration: recording.duration,
        title: recording.title
      });

      const downloadResponse = await api.getVoiceNoteDownloadUrl(recording.id);
      const audioUrl = downloadResponse.data.downloadUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('ended', () => setPlayingAudio(null));
      audio.addEventListener('error', () => {
        console.error('Audio playback error');
        setPlayingAudio(null);
      });

      await audio.play();
      setPlayingAudio(recording.id);
    } catch (error) {
      console.error('Failed to play audio:', error);
      setPlayingAudio(null);
    }
  };

  // Handle favorite toggle with analytics
  const handleToggleFavorite = async (recordingId, currentStatus, recordingTitle) => {
    try {
      await api.updateVoiceNote(recordingId, { isFavorite: !currentStatus });
      
      // Record favorite event
      await analytics.recordVoiceNoteEvent(
        'voice_note_favorited', 
        recordingId, 
        { 
          action: !currentStatus ? 'added' : 'removed',
          title: recordingTitle
        }
      );
      
      // Update local state
      setRecentRecordings(prev =>
        prev.map(rec =>
          rec.id === recordingId
            ? { ...rec, favorite: !currentStatus }
            : rec
        )
      );
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  };

  // Loading and error states (same as before)
  if (loading || authLoading) { // ✅ Check both loadings
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error</div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Stats cards data with real analytics
  const stats = [
    {
      icon: <Mic className="w-5 h-5" />,
      label: t('dash.voiceNotes'),
      value: quickStats.voiceNotes.value,
      change: quickStats.voiceNotes.change,
      color: "from-blue-500 to-cyan-500",
      trend: "up"
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: t('dash.contacts'),
      value: quickStats.contacts.value,
      change: quickStats.contacts.change,
      color: "from-green-500 to-emerald-500",
      trend: "up"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: t('dash.vault'),
      value: quickStats.vaultItems.value,
      change: quickStats.vaultItems.change,
      color: "from-purple-500 to-pink-500",
      trend: "secure"
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: t('dash.scheduled'),
      value: quickStats.scheduled.value,
      change: quickStats.scheduled.change,
      color: "from-orange-500 to-red-500",
      trend: "active"
    },
  ];

  // Quick actions with proper links
  const quickActions = [
    {
      icon: <Plus className="w-5 h-5" />,
      label: t('voice.record'),
      color: "bg-blue-500",
      href: "/usersDashboard/voice-notes?record=new"
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: t('contacts.addContact'),
      color: "bg-green-500",
      href: "/usersDashboard/contacts"
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: t('scheduled.createNew'),
      color: "bg-purple-500",
      href: "/usersDashboard/scheduled",
      availableFor: ['ESSENTIAL', 'LEGACY_VAULT_PREMIUM'],
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: t('vault.createWill'),
      color: "bg-red-500",
      href: "/usersDashboard/vault",
      availableFor: ['LEGACY_VAULT_PREMIUM'],
    },
  ];

  // Use real storage data from stats API — not approximated from 4 recent notes
  const storageUsedBytes = dashboardStats?.storage?.used_bytes || dashboardStats?.storageUsed || 0;
  const userName = user?.full_name?.split(' ')[0] || 'User';
  const storageLimitGB = user?.storage_limit_gb || 5;
  const storageLimitBytes = storageLimitGB * 1024 * 1024 * 1024;
  const storageUsedPercentage = Math.min((storageUsedBytes / storageLimitBytes) * 100, 100);
  const storageUsedGB = storageUsedBytes / (1024 * 1024 * 1024);

  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dash.greetingMorning');
    if (hour < 18) return t('dash.greetingAfternoon');
    return t('dash.greetingEvening');
  };

   return (
    <div className="page-enter">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
            {getGreeting()}, <span className="gradient-text">{userName}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {parseInt(quickStats.voiceNotes.value) > 0
              ? `You have ${quickStats.voiceNotes.value} voice ${parseInt(quickStats.voiceNotes.value) === 1 ? 'note' : 'notes'} — keep building your story.`
              : `Welcome! Start by recording your first voice message.`
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/usersDashboard/voice-notes?record=new"
            className="btn-audio flex items-center gap-2 text-sm py-2 px-4 rounded-xl"
          >
            <Mic className="w-4 h-4" />
            {t('voice.record')}
          </Link>
          <Link
            href="/usersDashboard/notifications"
            className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400"
            onClick={() => analytics.recordEvent('page_view', { page: 'notifications' })}
          >
            <Bell className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>

      {/* Stats Bento Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {/* Featured card — Voice Notes (col-span-2) */}
        <div className="col-span-2 card card-audio card-hover p-6 relative overflow-hidden">
          {/* Waveform decoration */}
          <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
            <div className="flex items-end gap-[3px] h-16 pr-4 pb-2">
              {[3,6,9,5,8,4,7,9,4,6,3,8,5,7,4,6,8,3,7,5].map((h, i) => (
                <div key={i} className="w-[3px] rounded-full bg-audio-500" style={{ height: `${h * 3}px` }} />
              ))}
            </div>
          </div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-audio-500/10">
              <Mic className="w-5 h-5 text-audio-500" style={{ color: '#0ea5e9' }} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full text-audio-600 bg-audio-50 dark:bg-audio-500/10 dark:text-audio-400">
              {quickStats.voiceNotes.change}
            </span>
          </div>
          <h3 className="text-4xl font-display font-bold text-gray-900 dark:text-white stat-number mb-1 relative z-10">
            {quickStats.voiceNotes.value}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm relative z-10">{t('dash.voiceNotes')}</p>
        </div>

        {/* Contacts */}
        <div className="card card-hover p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-green-500/10">
              <Users className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400">
              {quickStats.contacts.change}
            </span>
          </div>
          <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white stat-number mb-0.5">
            {quickStats.contacts.value}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('dash.contacts')}</p>
        </div>

        {/* Scheduled */}
        <div className="card card-hover p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10">
              <Calendar className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400">
              {quickStats.scheduled.change}
            </span>
          </div>
          <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white stat-number mb-0.5">
            {quickStats.scheduled.value}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('dash.scheduled')}</p>
        </div>

        {/* Wills — full width on mobile, normal on desktop */}
        {hasLegacyVault() && (
          <div className="col-span-2 lg:col-span-4 card card-glow p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl brand-gradient">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wide">Legacy Vault</span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white stat-number">
                  {quickStats.vaultItems.value}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">Voice Wills protected</span>
              </div>
            </div>
            <Link href="/usersDashboard/vault" className="ml-auto btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
              {t('common.edit')} <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts and Recent Recordings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Activity Chart with Real Analytics Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-5 h-5 text-brand-500" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('dash.activityOverview')}</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {analyticsData?.totals?.total_notes_created 
                    ? `Based on ${analyticsData.totals.total_notes_created} notes and ${analyticsData.totals.total_notes_played} listens`
                    : 'Your voice note activity this week'
                  }
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Notes Created</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Notes Played</span>
                </div>
              </div>
            </div>

            <div className="h-72">
              {activityData.length > 0 && activityData.some(day => day.notes > 0 || day.listens > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#9CA3AF"
                      tick={{ fill: '#6B7280' }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fill: '#6B7280' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        const label = name === 'notes' ? 'Notes Created' : 'Notes Played';
                        return [value, label];
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="listens" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.2}
                      name="listens"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="notes" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.2}
                      name="notes"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <Headphones className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('dash.noRecordings')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 text-center max-w-md mb-4">
                    {t('dash.createFirst')}
                  </p>
                  <Link
                    href="/usersDashboard/voice-notes?record=new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500
                               text-white rounded-xl hover:shadow-lg transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {t('dash.recordNow')}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Recordings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('dash.recentRecordings')}</h2>
                <p className="text-gray-600 dark:text-gray-400">{t('voice.subtitle')}</p>
              </div>
              <Link
                href="/usersDashboard/voice-notes?record=new"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500
                         text-white rounded-xl hover:shadow-lg transition-all"
                onClick={() => analytics.recordEvent('cta_click', { cta: 'new_recording' })}
              >
                <Plus className="w-4 h-4" />
                {t('voice.record')}
              </Link>
            </div>

            {recentRecordings.length > 0 ? (
              <>
                <div className="space-y-4 stagger-children">
                  {recentRecordings.map((recording) => (
                    <div
                      key={recording.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all group ${
                        playingAudio === recording.id
                          ? 'border-l-4 border-brand-500 border-t-brand-200 border-r-brand-200 border-b-brand-200 dark:border-l-brand-500 dark:border-t-brand-800 dark:border-r-brand-800 dark:border-b-brand-800 bg-brand-50/50 dark:bg-brand-950/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <button
                        onClick={() => handlePlayAudio(recording)}
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          playingAudio === recording.id
                            ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/30 scale-95'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-brand-500 hover:to-accent-500 hover:text-white hover:shadow-md'
                        }`}
                      >
                        {playingAudio === recording.id
                          ? <Headphones className="w-5 h-5" />
                          : <Play className="w-5 h-5 ml-0.5" />
                        }
                      </button>

                      <div className="flex-shrink-0 flex items-end gap-px opacity-20 group-hover:opacity-50 transition-opacity">
                        {[4,7,5,9,3,8,6,9,4,7].map((h, i) => (
                          <div
                            key={i}
                            className="w-px rounded-full bg-brand-500"
                            style={{ height: `${h * 2.5}px` }}
                          />
                        ))}
                      </div>

                      <Link
                        href={`/usersDashboard/voice-notes/${recording.id}`}
                        className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                        onClick={() => analytics.recordEvent('voice_note_click', { noteId: recording.id })}
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-800 dark:text-white truncate">
                            {recording.title}
                          </h3>
                          {recording.favorite && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            recording.type === 'legacy' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                            recording.type === 'work' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                            'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          }`}>
                            {recording.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            {recording.duration}
                          </span>
                          <span>{recording.size}</span>
                          <span>{recording.date}</span>
                          {recording.playCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              {recording.playCount}
                            </span>
                          )}
                        </div>
                      </Link>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleFavorite(recording.id, recording.favorite, recording.title)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title={recording.favorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          {recording.favorite ? 
                            <Star className="w-4 h-4 text-yellow-500 fill-current" /> : 
                            <Star className="w-4 h-4" />
                          }
                        </button>
                        <Link 
                          href={`/usersDashboard/voice-notes/${recording.id}`}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Link 
                    href="/usersDashboard/voice-notes" 
                    className="flex items-center justify-center gap-2 text-brand-600 hover:text-brand-700 transition-colors font-medium"
                    onClick={() => analytics.recordEvent('cta_click', { cta: 'view_all_recordings' })}
                  >
                    {t('common.viewAll')}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {t('dash.noRecordings')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('dash.createFirst')}
                </p>
                <Link
                  href="/usersDashboard/voice-notes?record=new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500
                           text-white rounded-xl hover:shadow-lg transition-all"
                  onClick={() => analytics.recordEvent('cta_click', { cta: 'record_first_note_empty' })}
                >
                  <Plus className="w-4 h-4" />
                  {t('dash.recordNow')}
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - Storage, Quick Actions, Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        >
          {/* Storage Usage */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t('dash.storageUsage')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {storageUsedGB.toFixed(2)} GB {t('common.of')} {storageLimitGB} GB {t('dash.usedOf')}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>

            {storageData.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={storageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {storageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex-1 space-y-3">
                  {storageData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                  <Volume2 className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start recording to see your storage usage here.
                </p>
              </div>
            )}

            <Link 
              href="/usersDashboard/billing"
              className="w-full mt-6 px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                       rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors font-medium block text-center"
              onClick={() => analytics.recordEvent('cta_click', { cta: 'view_storage' })}
            >
              {storageUsedPercentage >= 80 ? 'Upgrade Storage' : 'View Storage Details'}
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{t('dash.quickStats')}</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions
                .filter(action => !action.availableFor || action.availableFor.includes(user?.subscription_tier))
                .map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 
                           dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all 
                           hover:scale-[1.02] group"
                  onClick={() => analytics.recordEvent('quick_action_click', { action: action.label })}
                >
                  <div className={`p-3 rounded-xl ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Activity</h3>
              <Link 
                href="/usersDashboard/activity"
                className="text-sm text-brand-600 hover:text-brand-700"
                onClick={() => analytics.recordEvent('cta_click', { cta: 'view_all_activity' })}
              >
                View all
              </Link>
            </div>
            
            {analyticsData?.playStats?.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.playStats.slice(0, 3).map((stat, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 dark:text-white">
                        Played "{stat.title}"
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(stat.last_played) || 'Recently'}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                          {stat.recent_plays || stat.play_count} plays
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentRecordings.length > 0 ? (
              <div className="space-y-4">
                {recentRecordings.slice(0, 3).map((recording, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      recording.type === 'legacy' ? 'bg-purple-500' :
                      recording.type === 'work' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 dark:text-white">
                        Recorded "{recording.title}"
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{recording.date}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                          You
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Nothing yet</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Your activity will appear here as you record and listen.
                </p>
              </div>
            )}
          </div>

          {/* Plan Upgrade Card */}
          {billingLoading ? (
            <div className="rounded-2xl p-6 animate-pulse bg-gray-200 dark:bg-gray-700">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2" />
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
            </div>
          ) : subscriptionInfo?.currentTier !== 'LEGACY_VAULT_PREMIUM' ? (
            <div className="bg-gradient-to-r from-brand-600 to-accent-500 rounded-2xl p-6">
              <div className="text-white mb-4">
                <h3 className="text-lg font-bold mb-1">{t('dash.upgradePlan')}</h3>
                <p className="text-sm opacity-90">{t('vault.upgradeToPremium')}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Legacy Vault Premium</span>
                  <span className="text-white/80 text-sm">$9.99/mo</span>
                </div>
                <ul className="text-white/80 text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Permanent storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Voice Wills
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Scheduled legacy messages
                  </li>
                </ul>
              </div>

              <Link
                href="/usersDashboard/billing"
                className="w-full flex items-center justify-center gap-2 bg-white text-brand-600
                         py-3 rounded-xl font-medium hover:bg-gray-100 transition-all"
                onClick={() => analytics.recordEvent('cta_click', { cta: 'upgrade_from_dashboard' })}
              >
                <Zap className="w-4 h-4" />
                {t('common.upgrade')}
              </Link>
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>   
  );
}