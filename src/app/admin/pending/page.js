"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Shield, Mail, AlertCircle, 
  RefreshCw, LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PendingAdminStatus() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get email from localStorage or query params
    const pendingEmail = localStorage.getItem('pending_admin_email');
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  const handleCheckStatus = async () => {
    setLoading(true);
    // Call API to check status
    // If approved, redirect to login
    // If still pending, show message
    setTimeout(() => setLoading(false), 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('pending_admin_email');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Access Pending</h1>
                <p className="text-sm text-gray-600">Your request is under review</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {email && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">Requested for:</span>
                  <span className="font-mono">{email}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-800">Review Process</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your admin access request is currently being reviewed by our team.
                    This process typically takes 24-48 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-800">What happens next?</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Once approved, you'll receive an email notification and can log in
                    using the credentials you provided.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleCheckStatus}
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white 
                         rounded-lg font-medium transition-colors flex items-center 
                         justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Checking Status...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Check Approval Status
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 
                         rounded-lg font-medium transition-colors flex items-center 
                         justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Return to Login
              </button>
            </div>

            {/* Contact Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Need help? Contact{' '}
                <a href="mailto:admin@suretalk.com" className="text-blue-600 hover:underline">
                  admin@suretalk.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}