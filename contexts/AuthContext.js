// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\suretalk-web\contexts\AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../utils/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return setLoading(false);
  
      const response = await api.getProfile();
      const userData = response.data;
  
      setUser(userData);
  
      const isAdmin = !!userData.is_admin;
      localStorage.setItem('isAdmin', String(isAdmin));
  
    } catch (err) {
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, adminLogin = false) => {
    const response = await api.login(email, password);
    const user = response.data.user;
  
    const isAdmin = !!user.is_admin;
  
    if (adminLogin && !isAdmin) {
      throw new Error('Admin access only');
    }
  
    if (!adminLogin && isAdmin) {
      throw new Error('Admins must use admin login');
    }
  
    setUser(user);
    localStorage.setItem('isAdmin', String(isAdmin));
  
    router.replace(isAdmin ? '/adminDashboard' : '/usersDashboard');
  };
  

  const logout = async () => {
    await api.logout();
    setUser(null);
    localStorage.removeItem('token');
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkUser,
    isAdmin: user?.is_admin || false,
    isAuthenticated: !!user,
    setUser, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};