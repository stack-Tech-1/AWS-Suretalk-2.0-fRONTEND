// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\src\contexts\AuthContext.js
"use client";
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔐 AUTH INITIALIZATION GUARD
  const hasCheckedUserRef = useRef(false);

  useEffect(() => {
    if (hasCheckedUserRef.current) return; // ⛔ block repeat runs
    hasCheckedUserRef.current = true;

    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.getProfile();
      const userData = response.data;

      setUser(userData);

      const isAdmin = !!userData.is_admin;
      localStorage.setItem('isAdmin', String(isAdmin));
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        // Network error — server unreachable, keep token so session survives reconnect
        console.warn('Auth check failed: network error, keeping session');
        return; // finally still runs setLoading(false)
      }
      // Actual auth failure (401 etc) — remove token only, not all of localStorage
      console.warn('Auth check failed, removing token');
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Refresh user profile (for manual updates after subscription changes, etc.)
  const refreshProfile = async () => {
    try {
      const response = await api.getProfile();
      setUser(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      throw err;
    }
  };

  const login = async (email, password, adminLogin = false) => {
    const response = await api.login(email, password);
    const userData = response.data.user;

    const isAdmin = !!userData.is_admin;

    if (adminLogin && !isAdmin) {
      throw new Error('Admin access only');
    }

    if (!adminLogin && isAdmin) {
      throw new Error('Admins must use admin login');
    }

    // 🔁 Reset guard for fresh session
    hasCheckedUserRef.current = true;

    setUser(userData);
    localStorage.setItem('isAdmin', String(isAdmin));

    await new Promise(resolve => setTimeout(resolve, 100));
    router.replace(isAdmin ? '/adminDashboard' : '/usersDashboard');
  };

  const logout = async () => {
    // 1. Capture token BEFORE clearing (needed to authenticate the backend call)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // 2. Clear everything IMMEDIATELY — no waiting
    try { api.removeToken(); } catch (e) {}
    try { api.clearCache(); } catch (e) {}
    try { localStorage.clear(); } catch (e) {
      ['token', 'refreshToken', 'user', 'adminToken', 'isAdmin', 'admin_session']
        .forEach(key => { try { localStorage.removeItem(key); } catch (e2) {} });
    }
    try { sessionStorage.setItem('just_logged_out', 'true'); } catch (e) {}

    // 3. Clear React state
    setUser(null);
    hasCheckedUserRef.current = false;

    // 4. Notify backend fire-and-forget using the captured token
    //    fetch() is used directly so we can pass the pre-captured token in the header.
    //    This is intentionally not awaited — it does not block the redirect.
    if (token) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      fetch(`${apiBase}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }).catch(() => {});
    }

    // 5. Hard redirect — token is already gone before this line
    window.location.href = '/login';
  };

  // 🎯 Helper methods for common checks
  const hasLegacyVault = () => {
    return user?.subscription_tier === 'LEGACY_VAULT_PREMIUM';
  };

  const isSubscriptionActive = () => {
    return user?.subscription_status === 'active';
  };

  const getStorageLimit = () => {
    return user?.storage_limit_gb || 5;
  };

  const getContactsLimit = () => {
    return user?.contacts_limit || 25;
  };

  const getVoiceNotesLimit = () => {
    return user?.voice_notes_limit || 100;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshProfile,
    isAdmin: user?.is_admin || false,
    isAuthenticated: !!user,
    // Helper methods
    hasLegacyVault,
    isSubscriptionActive,
    getStorageLimit,
    getContactsLimit,
    getVoiceNotesLimit,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};