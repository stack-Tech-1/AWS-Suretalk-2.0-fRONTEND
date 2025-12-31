import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useDashboardData } from "../../hooks/useDashboardData";

export default function Layout({ children, type = "user" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { userData, statsData, sidebarStats, loading, isAdmin } = useDashboardData();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(false);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Calculate main content width based on sidebar state
  const getMainWidth = () => {
    if (isMobile) return "w-full";
    if (sidebarCollapsed) return "lg:w-[calc(100%-5rem)]";
    return "lg:w-[calc(100%-16rem)]";
  };

  // Calculate main content margin
  const getMainMargin = () => {
    if (isMobile) return "ml-0";
    if (sidebarCollapsed) return "lg:ml-20";
    return "lg:ml-64";
  };

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
          type={isAdmin ? "admin" : "user"} 
          isOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onClose={() => setSidebarOpen(false)}
          userData={userData}
          stats={sidebarStats}
          loading={loading}
        />
      </motion.aside>

       {/* Main Content Area */}
       <div className={`min-h-screen transition-all duration-300 ${getMainMargin()}`}>
        {/* Topbar */}
        <Topbar 
          type={isAdmin ? "admin" : "user"}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
          userData={userData}        
          loading={loading}          
        />
        
        {/* Main Content */}
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
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-6 right-6 z-50 lg:hidden w-14 h-14 
                   bg-gradient-to-r from-brand-500 to-accent-500 
                   text-white rounded-full shadow-2xl 
                   flex items-center justify-center hover:scale-105
                   active:scale-95 transition-all duration-200
                   group"
        >
          <div className="relative">
            <svg
              className={`w-6 h-6 transition-transform duration-200 ${
                sidebarOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
            
            {/* Ripple effect */}
            <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-brand-500 to-accent-500 opacity-20" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-16 mb-1 px-3 py-1 bg-gray-900 text-white text-xs 
                        rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        pointer-events-none whitespace-nowrap">
            {sidebarOpen ? 'Close menu' : 'Open menu'}
          </div>
        </motion.button>
      )}
    </div>
  );
}