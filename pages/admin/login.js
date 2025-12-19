// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\admin\login.js
import { useEffect, useState } from 'react'; 
import { motion } from "framer-motion";
import { Lock, Mail, Shield, Eye, EyeOff, AlertCircle, Key } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "../../utils/api";

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      if (!formData.email || !formData.password) {
        throw new Error("Please fill in all fields");
      }
  
      console.log('Attempting admin login with:', formData.email);
  
      const response = await api.login(formData.email, formData.password);
      console.log('Admin login response:', response);
  
      if (!response?.data?.user) {
        throw new Error('Invalid login response from server');
      }
  
      const userData = response.data.user;
  
      if (!userData.is_admin) {
        throw new Error('This account does not have admin privileges.');
      }
  
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
  
      console.log("Admin login successful, redirecting...");
      router.replace('/adminDashboard');
  
    } catch (error) {
      console.error("Admin login error:", error);
      setError(error.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };
  



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Security Badge */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 
                          border border-gray-700 flex items-center justify-center shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-accent-500/10 
                            rounded-2xl blur-xl" />
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full 
                            flex items-center justify-center shadow-lg">
                <Key className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl 
                      border border-gray-700/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              SureTalk Admin
            </h1>
            <p className="text-gray-400">
              Secure access to system administration
            </p>
          </div>
          
          {/* Security Notice */}
          <div className="mb-6 p-4 bg-gray-900/50 border border-gray-700 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-900/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-medium text-white text-sm">Security Notice</h3>
                <p className="text-gray-400 text-xs">
                  This area is restricted to authorized personnel only.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-300">
                {error}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-700 
                           bg-gray-900/50 text-white placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-brand-500 
                           focus:border-transparent transition-all"
                  placeholder="admin@suretalk.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-300">
                  Admin Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-1"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-700 
                           bg-gray-900/50 text-white placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-brand-500 
                           focus:border-transparent transition-all"
                  placeholder="••••••••••••"
                  required
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded flex items-center justify-center">
                    <Key className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Remember Me & Two-Factor */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-4 w-4 text-brand-500 focus:ring-brand-500 
                           border-gray-700 bg-gray-900 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-400">
                  Remember this device
                </label>
              </div>
              
              <button
                type="button"
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors 
                         flex items-center gap-1"
                disabled={loading}
              >
                <Shield className="w-4 h-4" />
                2FA Ready
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 
                       hover:from-gray-700 hover:to-gray-800
                       text-white font-medium rounded-xl border border-gray-700
                       hover:shadow-lg transform transition-all duration-300 
                       hover:-translate-y-0.5 disabled:opacity-50 
                       disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Secure Login
                </>
              )}
            </button>
          </form>

          {/* Audit Trail Note */}
          <div className="mt-8 p-4 bg-gray-900/30 border border-gray-700 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-1">
                  Session Monitoring Active
                </h4>
                <p className="text-xs text-gray-400">
                  All login attempts are logged and monitored for security purposes.
                </p>
              </div>
            </div>
          </div>

            <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
                Don’t have admin access?{" "}
                <Link
                href="/admin/register"
                className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                Request access
                </Link>
            </p>
            </div>


          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-800/50 text-gray-500">
                Quick Access
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full p-3 border border-gray-700 rounded-xl 
                       hover:bg-gray-800/50 transition-colors text-gray-300 
                       hover:text-white flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to User Login
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full p-3 border border-gray-700 rounded-xl 
                       hover:bg-gray-800/50 transition-colors text-gray-300 
                       hover:text-white flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Home
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                © 2024 SureTalk Systems. Restricted Access.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/admin/help" className="text-xs text-gray-500 hover:text-gray-400">
                  Support
                </Link>
                <Link href="/admin/audit" className="text-xs text-gray-500 hover:text-gray-400">
                  Audit Logs
                </Link>
                <Link href="/admin/recovery" className="text-xs text-gray-500 hover:text-gray-400">
                  Recovery
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Security Indicators */}
        <div className="mt-6 flex justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">SSL Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Monitored</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}