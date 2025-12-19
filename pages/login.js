// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\suretalk-web\pages\login.js
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Smartphone, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "../utils/api";
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
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

      // Update the handleLogin function:
      const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
          if (!formData.email || !formData.password) {
            throw new Error("Please fill in all fields");
          }

          // Attempt regular user login
          const response = await api.login(formData.email, formData.password);
          const userData = response.data.user;
          
          // Check if user is admin
          const isAdmin = userData.is_admin || userData.isAdmin;
          
          // REJECT ADMIN ACCOUNTS
          if (isAdmin) {
            throw new Error('Admin accounts cannot login here. Please use the admin login portal.');
          }
          
          // Use the Auth Context login function (for non-admin users only)
          const result = await login(formData.email, formData.password, false);
          
          if (!result.success) {
            throw new Error(result.error || "Login failed");
          }

          // Store remember me preference
          if (formData.rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          }

        } catch (error) {
          console.error("Login error:", error);
          setError(error.message || "Login failed. Please check your credentials.");
        } finally {
          setLoading(false);
        }
      };

     
        
              

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo/Brand Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center shadow-lg">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              SureTalk
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Access your voice memories from anywhere
          </p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            Welcome Back
          </h2>
          
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 
                           focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 
                           focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-accent-500 
                       text-white font-medium rounded-xl hover:shadow-lg 
                       transform transition-all duration-300 hover:-translate-y-0.5 
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/50 dark:bg-gray-800/50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors 
                       flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              disabled={loading}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors 
                       flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Admin login Link */}
          <div className="text-center mt-4">
            <Link 
              href="/admin/login" 
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 
                        transition-colors inline-flex items-center gap-1"
            >
              <Shield className="w-4 h-4" />
              Admin Access
            </Link>
          </div>

          {/* Signup Link */}
          <p className="text-center mt-8 text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link 
              href="/signup" 
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2024 SureTalk. All rights reserved.</p>
          <p className="mt-1">
            <Link href="/privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link>
            {" · "}
            <Link href="/terms" className="hover:text-brand-600 transition-colors">Terms of Service</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}