'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, LogOut, Clock, AlertTriangle } from 'lucide-react';
import { api } from '@/utils/api';

export default function ImpersonationBanner() {
  const router = useRouter();
  const [impersonationData, setImpersonationData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Check if we're in impersonation mode
    const data = localStorage.getItem('impersonationData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setImpersonationData(parsed);

        // Calculate time left
        const expiresAt = new Date(parsed.expiresAt).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeLeft(remaining);
      } catch (e) {
        localStorage.removeItem('impersonationData');
        localStorage.removeItem('impersonationToken');
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      // Auto-exit when expired
      handleExit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleExit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleExit = useCallback(async (autoExpired = false) => {
    try {
      setExiting(true);

      // Call exit endpoint with the impersonation token
      const impToken = localStorage.getItem('impersonationToken');
      if (impToken) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/super-admin/impersonate/exit`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${impToken}` }
        }).catch(() => {}); // non-fatal
      }

      // Restore admin token
      const adminToken = localStorage.getItem('adminReturnToken');
      if (adminToken) {
        localStorage.setItem('token', adminToken);
      }

      // Clean up impersonation state
      localStorage.removeItem('impersonationToken');
      localStorage.removeItem('impersonationData');
      localStorage.removeItem('adminReturnToken');

      if (autoExpired) {
        alert('Impersonation session expired after 5 minutes. Returning to admin dashboard.');
      }

      // Return to super admin
      window.location.href = '/adminDashboard/super';

    } catch (err) {
      console.error('Exit impersonation error:', err);
      window.location.href = '/adminDashboard/super';
    }
  }, []);

  if (!impersonationData) return null;

  const minutes = Math.floor((timeLeft || 0) / 60);
  const seconds = ((timeLeft || 0) % 60).toString().padStart(2, '0');
  const isUrgent = (timeLeft || 0) < 60; // last minute

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] ${
      isUrgent
        ? 'bg-red-600'
        : 'bg-gradient-to-r from-orange-500 to-red-500'
    } text-white py-2 px-4 shadow-lg`}>
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isUrgent ? (
              <AlertTriangle className="w-4 h-4 animate-pulse flex-shrink-0" />
            ) : (
              <Shield className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-sm font-semibold">
              Viewing as {impersonationData.targetUser?.fullName || 'User'}
            </span>
          </div>
          <span className="text-orange-200 text-xs hidden md:block">
            {impersonationData.targetUser?.email}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Countdown */}
          <div className={`flex items-center gap-1.5 text-sm font-mono ${
            isUrgent ? 'text-red-100 animate-pulse' : 'text-orange-100'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{minutes}:{seconds}</span>
          </div>

          {/* Exit button */}
          <button
            onClick={() => handleExit(false)}
            disabled={exiting}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            {exiting ? 'Exiting...' : 'Exit'}
          </button>
        </div>
      </div>
    </div>
  );
}
