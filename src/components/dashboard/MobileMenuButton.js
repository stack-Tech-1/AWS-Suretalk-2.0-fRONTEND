// src/components/dashboard/MobileMenuButton.js
'use client';

import { motion } from 'framer-motion';

export default function MobileMenuButton({ sidebarOpen, setSidebarOpen }) {
  return (
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
          className={`w-6 h-6 transition-transform duration-200 ${sidebarOpen ? 'rotate-180' : ''}`}
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
        
        <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-brand-500 to-accent-500 opacity-20" />
      </div>
      
      <div className="absolute right-16 mb-1 px-3 py-1 bg-gray-900 text-white text-xs 
                    rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    pointer-events-none whitespace-nowrap">
        {sidebarOpen ? 'Close menu' : 'Open menu'}
      </div>
    </motion.button>
  );
}