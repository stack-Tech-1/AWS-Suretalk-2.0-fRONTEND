// Create new file: src/app/admin/secure-login/page.js
"use client";
import { useEffect, useState } from 'react'; 
import { motion } from "framer-motion";
import { 
  Lock, Mail, Shield, Eye, EyeOff, AlertCircle, Key, 
  Clock, Globe, Cpu, Fingerprint, QrCode, Smartphone, Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "../../../utils/api";

export default function SecureAdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Credentials, 2: 2FA
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [clientIP, setClientIP] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [tempAuthToken, setTempAuthToken] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberDevice: false
  });

  // Get client IP
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setClientIP(data.ip))
      .catch(() => setClientIP("Unknown"));
    
    // Check if we're returning from 2FA step
    const storedTempToken = sessionStorage.getItem('admin_temp_token');
    if (storedTempToken) {
      setTempAuthToken(storedTempToken);
      setStep(2);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }
  
      // Enhanced validation - SET ERROR instead of THROWING
      if (formData.password.length < 10) {
        setError("Admin password must be at least 12 characters");
        setLoading(false);
        return;
      }
  
      // Optional: Add password strength validation
      const passwordStrength = checkPasswordStrength(formData.password);
      if (!passwordStrength.isStrong) {
        setError(passwordStrength.message);
        setLoading(false);
        return;
      }
  
      // FIX: Build loginData conditionally
    const loginData = {
      email: formData.email,
      password: formData.password,
      // Only add captchaToken if requiresCaptcha is true AND captchaToken has value
      ...(requiresCaptcha && captchaToken && { captchaToken }),
      clientIP: clientIP
    };

    console.log('Sending login data:', loginData); // Debug log

  
      const response = await api.request('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify(loginData)
      });
  
      if (response.requiresTwoFactor) {
        // Store temp token and proceed to 2FA
        sessionStorage.setItem('admin_temp_token', response.tempToken);
        setTempAuthToken(response.tempToken);
        setStep(2);
      } else {
        // Complete login
        handleCompleteLogin(response);
      }
  
    } catch (error) {
      console.error("Admin login error:", error);

      // Check for pending admin error
      if (error.message && error.message.includes('Admin access pending approval')) {
        // Redirect to pending approval page
        localStorage.setItem('pending_admin_email', formData.email);
        router.push('/admin/pending');
        setLoading(false);
        return;
      }
      
      // User-friendly error messages
      let userMessage = error.message || "Authentication failed";
      
      // Map backend errors to user-friendly messages
      const errorMap = {
        'Invalid credentials': 'Invalid email or password',
        'User not found': 'Account not found',
        'Account locked': 'Account temporarily locked. Try again later.',
        'Too many attempts': 'Too many login attempts. Please wait and try again.',
        'Network Error': 'Connection error. Please check your internet.',
        'Timeout': 'Request timeout. Please try again.',
      };
      
      // Check if error matches any in our map
      for (const [key, value] of Object.entries(errorMap)) {
        if (error.message.includes(key)) {
          userMessage = value;
          break;
        }
      }
      
      setError(userMessage);
      
      // Show captcha after 3 failed attempts
      if (error.message.includes('attempt') || error.message.includes('failed')) {
        setRequiresCaptcha(true);
      }
      
      setLoading(false);
    }
  };
  
  // Optional helper function for password strength
  const checkPasswordStrength = (password) => {
    const requirements = {
      minLength: password.length >= 12,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    const passed = Object.values(requirements).filter(Boolean).length;
    
    if (passed === 5) {
      return { isStrong: true, message: "Strong password" };
    }
    
    const missing = [];
    if (!requirements.minLength) missing.push("at least 12 characters");
    if (!requirements.hasUpperCase) missing.push("an uppercase letter");
    if (!requirements.hasLowerCase) missing.push("a lowercase letter");
    if (!requirements.hasNumbers) missing.push("a number");
    if (!requirements.hasSpecialChars) missing.push("a special character");
    
    return {
      isStrong: false,
      message: `Password must contain: ${missing.join(", ")}`
    };
  };

  const handle2FALogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!twoFactorToken || twoFactorToken.length !== 6) {
        throw new Error("Please enter a valid 6-digit 2FA code");
      }

      const response = await api.request('/auth/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({
          tempToken: tempAuthToken,
          twoFactorToken: twoFactorToken
        })
      });

      handleCompleteLogin(response);

    } catch (error) {
      console.error("2FA verification error:", error);
      setError(error.message || "2FA verification failed");
      setLoading(false);
    }
  };

  const handleCompleteLogin = (response) => {
    // Store session info
    const sessionData = {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      sessionToken: response.data.sessionToken,
      user: response.data.user,
      loginTime: new Date().toISOString(),
      loginIP: clientIP,
      deviceFingerprint: generateDeviceFingerprint()
    };
  
    // CRITICAL: Store the token in BOTH places
    localStorage.setItem('admin_session', JSON.stringify(sessionData));
    
    // ADD THIS LINE - Store token for API requests
    localStorage.setItem('token', response.data.token);
    
    // Set session cookie with HttpOnly flag (would be done server-side in production)
    document.cookie = `admin_token=${response.data.token}; path=/; secure; samesite=strict`;
    
    // Clear temp token
    sessionStorage.removeItem('admin_temp_token');
    
    // Log successful login
    console.log('Admin login successful:', {
      user: response.data.user.email,
      time: new Date().toISOString(),
      ip: clientIP
    });
    
    // Redirect to admin dashboard
    router.replace('/adminDashboard');
  };

  const generateDeviceFingerprint = () => {
    const fingerprint = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${window.screen.width}x${window.screen.height}`,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'unspecified'
    };
    
    return btoa(JSON.stringify(fingerprint));
  };

  const resetLogin = () => {
    setStep(1);
    setTwoFactorToken("");
    setTempAuthToken("");
    setRequiresCaptcha(false);
    sessionStorage.removeItem('admin_temp_token');
  };

  const handleEmergencyAccess = () => {
    // Implement emergency access request
    router.push('/admin/emergency-access');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-gray-800/40 backdrop-blur-2xl 
                  rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden"
      >
        {/* Security header */}
        <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 
                            border border-blue-500/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SureTalk Admin</h1>
                <p className="text-sm text-gray-400">Secure Gateway v2.0</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 rounded-full border border-gray-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-300">SECURE</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Security context */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">IP:</span>
              </div>
              <p className="text-sm text-white font-mono mt-1 truncate" title={clientIP}>
                {clientIP?.substring(0, 15) || 'Detecting...'}
              </p>
            </div>
            
            <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Level:</span>
              </div>
              <p className="text-sm text-white font-medium mt-1">Admin Only</p>
            </div>
            
            <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">Step:</span>
              </div>
              <p className="text-sm text-white font-medium mt-1">{step}/2</p>
            </div>
          </div>

          {/* ADD ERROR DISPLAY HERE */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-300">
                  {error}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: Credentials */}
          {step === 1 && (
            <form onSubmit={handleCredentialsLogin} className="space-y-5">
              {requiresCaptcha && (
                <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-300">Security Check Required</span>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-300 mb-2">Complete the security check:</p>
                    <div className="text-center">
                      <div className="text-lg font-mono bg-gray-800 p-3 rounded-lg mb-3">
                        {Math.floor(Math.random() * 90 + 10)} + {Math.floor(Math.random() * 90 + 10)} = ?
                      </div>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-center"
                        placeholder="Enter sum"
                        onChange={(e) => setCaptchaToken(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Admin Email
                    <span className="text-xs text-red-400 ml-auto">*Restricted</span>
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl
                           text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@suretalk.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Master Password
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl
                             text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                             focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                    placeholder="••••••••••••"
                    required
                    minLength={12}
                    disabled={loading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Key className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Minimum 12 characters with mixed case, numbers, and symbols
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberDevice"
                  name="rememberDevice"
                  checked={formData.rememberDevice}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-4 w-4 text-blue-500 bg-gray-900 border-gray-700 rounded 
                           focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <label htmlFor="rememberDevice" className="ml-2 text-sm text-gray-400">
                  Trust this device for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 
                         hover:from-blue-500 hover:to-blue-600 active:scale-[0.99]
                         text-white font-semibold rounded-xl border border-blue-500/30
                         hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 
                         disabled:opacity-50 disabled:cursor-not-allowed 
                         flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-400/20 to-blue-500/0 
                              group-hover:translate-x-full transition-transform duration-1000" />
                
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Authenticate</span>
                  </>
                )}
              </button>

              <div className="space-y-4 mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700/50"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-800/50 text-gray-500">
                      Need Admin Access?
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => router.push('/admin/register')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 
                          hover:from-gray-700 hover:to-gray-800
                          text-white font-medium rounded-xl border border-gray-700
                          hover:shadow-lg transition-all duration-300 
                          hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5 text-gray-400" />
                  Request Admin Access
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleEmergencyAccess}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Emergency Access Request
                </button>
              </div>
            </form>
          )}

          {/* Step 2: 2FA */}
          {step === 2 && (
            <form onSubmit={handle2FALogin} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-600/20 
                              border border-blue-500/30 flex items-center justify-center">
                  <Fingerprint className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Two-Factor Authentication</h2>
                <p className="text-sm text-gray-400 mt-2">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                  2FA Verification Code
                </label>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl font-bold bg-gray-900 border-2 
                               border-gray-700 rounded-lg text-white focus:border-blue-500 
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          // Auto-focus next input
                          const nextInput = e.target.nextElementSibling;
                          if (nextInput) nextInput.focus();
                          
                          // Update token
                          const newToken = twoFactorToken.split('');
                          newToken[index] = value;
                          setTwoFactorToken(newToken.join(''));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !e.target.value) {
                          // Focus previous input on backspace
                          const prevInput = e.target.previousElementSibling;
                          if (prevInput) prevInput.focus();
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetLogin}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 
                           rounded-xl border border-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || twoFactorToken.length !== 6}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 
                           hover:from-green-500 hover:to-emerald-500 text-white font-semibold 
                           rounded-xl border border-green-500/30 transition-all 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    'Verify & Login'
                  )}
                </button>
              </div>

              <div className="text-center space-y-3">
                <button
                  type="button"
                  onClick={() => router.push('/admin/2fa/setup')}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors block"
                >
                  <QrCode className="w-4 h-4 inline mr-1" />
                  Setup 2FA
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/2fa/recovery')}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors block"
                >
                  <Smartphone className="w-4 h-4 inline mr-1" />
                  Lost 2FA Device?
                </button>
              </div>
            </form>
          )}

          {/* Security footer */}
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="text-center space-y-3">
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.push('/admin/audit')}
                  className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                >
                  View Audit Logs
                </button>
                <button
                  onClick={() => router.push('/admin/help')}
                  className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                >
                  Security Guide
                </button>
                <button
                  onClick={() => window.open('https://status.suretalk.com', '_blank')}
                  className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                >
                  System Status
                </button>
              </div>
              <p className="text-xs text-gray-500">
                <span className="text-red-400">⚠️</span> All access attempts are logged and monitored
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}