// src/hooks/useDashboardLayout.js
'use client';

import { useState, useEffect } from 'react';

export function useDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    sidebarOpen,
    setSidebarOpen,
    isMobile,
    sidebarCollapsed,
    setSidebarCollapsed,
    // Helper functions
    getMainMargin: () => {
      if (isMobile) return 'ml-0';
      if (sidebarCollapsed) return 'lg:ml-20';
      return 'lg:ml-64';
    },
    getSidebarWidth: () => {
      if (isMobile) return 'w-64';
      if (sidebarCollapsed) return 'lg:w-20';
      return 'lg:w-64';
    }
  };
}