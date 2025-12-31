// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\hooks\useDashboardData.js
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function useDashboardData() {
  const [userData, setUserData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // 1. Fetch user profile
        const profileResponse = await api.getProfile();
        const user = profileResponse.data;
        
        // 2. Fetch appropriate stats based on user type
        let statsResponse;
        if (user.is_admin) {
          // Try to fetch admin stats, fallback to user stats if endpoint doesn't exist yet
          try {
            statsResponse = await api.request('/admin/dashboard/stats');
          } catch (err) {
            console.log('Admin stats endpoint not ready, using user stats');
            statsResponse = await api.request('/users/stats');
          }
        } else {
          statsResponse = await api.request('/users/stats');
        }
        
        setUserData(user);
        setStatsData(statsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
        
        // Fallback to mock data for development
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data due to API error');
          setUserData({
            email: 'admin@suretalk.com',
            full_name: 'System Admin',
            is_admin: true,
            subscription_tier: 'LEGACY_VAULT_PREMIUM'
          });
          setStatsData({
            users: 45,
            wills: 8,
            scheduledMessages: { total: 12, scheduled: 4 },
            pendingRequests: 4,
            systemLogs: 120
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Format stats for sidebar based on user type
  // In useDashboardData.js, update the getSidebarStats function:
const getSidebarStats = () => {
    if (!userData || !statsData) return null;
    
    if (userData.is_admin) {
      // Fix the nested wills structure
      let willsTotal = 0;
      let willsPending = 0;
      
      if (statsData.wills) {
        if (typeof statsData.wills === 'object') {
          if (statsData.wills.total && typeof statsData.wills.total === 'object') {
            willsTotal = statsData.wills.total.total || 0;
            willsPending = statsData.wills.total.pending || 0;
          } else {
            willsTotal = statsData.wills.total || 0;
            willsPending = statsData.wills.pending || 0;
          }
        } else {
          willsTotal = statsData.wills;
        }
      }
      
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
    isAdmin: userData?.is_admin || false
  };
}