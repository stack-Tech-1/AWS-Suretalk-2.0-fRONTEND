// src/app/usersDashboard/layout.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import MobileMenuButton from '@/components/dashboard/MobileMenuButton';
import LoadingScreen from '@/components/dashboard/LoadingScreen';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { api } from '@/utils/api';
import { pushManager } from '@/utils/pushManager';
import { useAnalyticsContext } from '@/contexts/AnalyticsContext';
import { useAuth } from '@/contexts/AuthContext'; // ✅ Import useAuth

export default function UsersDashboardLayout({ children }) {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth(); // ✅ Use AuthContext
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [pushInitiated, setPushInitiated] = useState(false);
  const analytics = useAnalyticsContext();
  
  const {
    sidebarOpen,
    setSidebarOpen,
    isMobile,
    sidebarCollapsed,
    setSidebarCollapsed,
    getMainMargin
  } = useDashboardLayout();

  // ✅ Check auth state and redirect if needed
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    // Redirect admin users
    if (isAdmin) {
      router.replace('/adminDashboard');
      return;
    }

    // Redirect unauthenticated users
    if (!user) {
      router.replace('/login');
      return;
    }

    // User is authenticated and not admin, load stats
    loadDashboardStats();
  }, [authLoading, user, isAdmin, router]);

  // ✅ Fetch only dashboard stats (not user profile)
  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const statsResponse = await api.getUserDashboardStats();
      setStats(statsResponse.data || {});
    } catch (error) {
      console.warn('Could not fetch user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize push notifications when user is authenticated
  useEffect(() => {
    if (user && !pushInitiated) {
      initializePushNotifications();
    }
  }, [user, pushInitiated]);

  const initializePushNotifications = async () => {
    try {
      console.log('Initializing push notifications for user...');
      const result = await pushManager.initialize();
      
      if (result.supported && result.subscribed) {
        console.log('Push notifications initialized and subscribed');
        analytics.recordEvent('push_notifications_initialized', {
          userId: user?.id,
          subscribed: true
        });
      }
      
      setPushInitiated(true);
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      setPushInitiated(true);
    }
  };

  // ✅ Show loading while auth is checking
  if (authLoading) {
    return <LoadingScreen />;
  }

  // ✅ Don't render layout if redirecting
  if (!user || isAdmin) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: isMobile ? -280 : 0 }}
        animate={{ 
          x: (sidebarOpen || !isMobile) ? 0 : -280,
          width: sidebarCollapsed && !isMobile ? '5rem' : '16rem'
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          width: { duration: 0.3 }
        }}
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 shadow-2xl
          ${isMobile ? 'w-64 top-16 bottom-0' : ''}`}
      >
        <Sidebar 
          type="user"
          isOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onClose={() => setSidebarOpen(false)}
          userData={user} // ✅ Pass user from AuthContext
          stats={stats}
          loading={loading}
        />
      </motion.aside>

      {/* Main Content Area */}
      <div className={`min-h-screen transition-all duration-300 ${getMainMargin()}`}>
        <Topbar 
          type="user"
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
          userData={user} // ✅ Pass user from AuthContext
          loading={loading}
        />
        
        <main className="pt-16">
          <div className="p-4 md:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Floating Mobile Menu Button */}
      {isMobile && (
        <MobileMenuButton 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}
    </div>
  );
}