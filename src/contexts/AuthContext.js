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
      console.warn('Auth check failed, clearing session');
      localStorage.clear();
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

    router.replace(isAdmin ? '/adminDashboard' : '/usersDashboard');
  };

  const logout = async () => {
    await api.logout();
    localStorage.clear();
    setUser(null);

    // 🔄 allow auth check again after logout
    hasCheckedUserRef.current = false;

    router.push('/login');
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