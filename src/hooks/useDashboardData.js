// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\hooks\useDashboardData.js
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function useDashboardData() {
  const [userData, setUserData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);

      // Profile fetch — essential; failure sets main error
      let user = null;
      try {
        const profileResponse = await api.getProfile();
        user = profileResponse.data;
        setUserData(user);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError(err.message || 'Failed to load profile');
        if (process.env.NODE_ENV === 'development') {
          user = {
            email: 'admin@suretalk.com',
            full_name: 'System Admin',
            is_admin: true,
            subscription_tier: 'LEGACY_VAULT_PREMIUM'
          };
          setUserData(user);
          setError(null);
        }
      }

      // Stats fetch — non-essential; failure leaves sidebar at zeros
      if (user) {
        try {
          let statsResponse;
          if (user.is_admin) {
            try {
              statsResponse = await api.request('/admin/dashboard/stats');
            } catch {
              statsResponse = await api.request('/users/stats');
            }
          } else {
            statsResponse = await api.request('/users/stats');
          }
          setStatsData(statsResponse.data);
          setStatsError(null);
        } catch (err) {
          console.error('Failed to fetch stats:', err);
          setStatsError(err.message || 'Failed to load stats');
          if (process.env.NODE_ENV === 'development') {
            setStatsData({
              users: 45,
              wills: { total: 8, pending: 2 },
              scheduledMessages: { total: 12, scheduled: 4 },
              pendingRequests: 4,
              systemLogs: 120
            });
          }
        }
      }

      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  // Format stats for sidebar based on user type
  // In useDashboardData.js, update the getSidebarStats function:
const getSidebarStats = () => {
    if (!userData || !statsData) return null;
    
    if (userData.is_admin) {
      const willsTotal = statsData?.wills?.total ?? 0;
      const willsPending = statsData?.wills?.pending ?? 0;
      
      return {
        users: statsData.users || 0,
        wills: {
          total: willsTotal,
          pending: willsPending
        },
        scheduled: {
          total: statsData.scheduledMessages?.total || 0,
          scheduled: statsData.scheduledMessages?.scheduled || statsData.scheduled || 0
        },
        pendingRequests: statsData.pendingRequests || 0,
        logs: statsData.systemLogs || 0
      };
    } else {
      // Regular user stats
      return {
        voiceNotes: statsData.stats?.voice_notes_total || 0,
        contacts: statsData.stats?.contacts_total || 0,
        vault: statsData.stats?.wills_total || 0,
        scheduled: statsData.stats?.scheduled_messages_total || 0
      };
    }
  };

  // ✅ CRITICAL: Return the data object
  return {
    userData,
    statsData,
    sidebarStats: getSidebarStats(),
    loading,
    error,
    statsError,
    isAdmin: userData?.is_admin || false
  };
}