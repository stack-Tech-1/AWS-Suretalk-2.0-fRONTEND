// src/app/adminDashboard/layout.js - UPDATED
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

export default function AdminDashboardLayout({ children }) {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Use our reusable layout hook
  const {
    sidebarOpen,
    setSidebarOpen,
    isMobile,
    sidebarCollapsed,
    setSidebarCollapsed,
    getMainMargin
  } = useDashboardLayout();

  // Wait for client-side mount
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!hasMounted) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get user profile
        const profile = await api.getProfile();
        
        // Check if user is admin AND approved
        if (!profile.data?.is_admin || profile.data?.admin_status !== 'approved') {
          router.replace('/admin/login');
          return;
        }
        
        setUserData(profile.data);
        
        // Get dashboard stats
        try {
          const dashboardResponse = await api.getAdminDashboardOverview();
          setStats(dashboardResponse.data || {});
        } catch (statsError) {
          console.warn('Could not fetch stats:', statsError);
          // Continue without stats
        }
        
      } catch (error) {
        console.error('Dashboard data fetch failed:', error);
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router, hasMounted]);

  // Show loading until mounted on client
  if (!hasMounted || loading) {
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
          type="admin"
          isOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onClose={() => setSidebarOpen(false)}
          userData={userData}
          stats={stats}
          loading={false}
        />
      </motion.aside>

      {/* Main Content Area */}
      <div className={`min-h-screen transition-all duration-300 ${getMainMargin()}`}>
        <Topbar 
          type="admin"
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
          userData={userData}
          loading={false}
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