"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Mail, Lock, User, Eye, EyeOff,
  AlertCircle, CheckCircle, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";

const STEP_LABELS = ['Phone', 'Verify', 'Profile'];

function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEP_LABELS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
              ${step > i + 1
                ? 'bg-green-500 text-white'
                : step === i + 1
                  ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
          >
            {step > i + 1 ? '✓' : i + 1}
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={`w-8 h-0.5 transition-all duration-300 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ClaimAccount() {
  const router = useRouter();

  // Multi-step state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Step 1
  const [phone, setPhone] = useState("");

  // Step 2
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const timerRef = useRef(null);
  const otpInputRef = useRef(null);

  // Step 3
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-focus OTP input when entering step 2
  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  const startOtpTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setOtpTimer(60);
    timerRef.current = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    try {
      await api.request('/auth/send-claim-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      startOtpTimer();
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    }
  };

  // Step 1: Check phone
  const handleCheckPhone = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.request('/auth/check-phone', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      if (!response.success || response.data?.isIvrUser === false) {
        setError("No IVR account found for this number. Please sign up instead.");
        return;
      }
      setStep(2);
      sendOtp();
    } catch (err) {
      setError(err.message || "No IVR account found for this number. Please sign up instead.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Move to profile
  const handleVerifyContinue = (e) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setStep(3);
  };

  // Step 3: Submit
  const handleActivate = async (e) => {
    e.preventDefault();
    setError("");

    if (!profileData.fullName || !profileData.email || !profileData.password || !profileData.confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (profileData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (profileData.password !== profileData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.request('/auth/claim-account', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          otp,
          fullName: profileData.fullName,
          email: profileData.email,
          password: profileData.password,
        }),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login?activated=true');
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to activate account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-gray-900 dark:text-white";
  const btnClass = "w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-accent-500 text-white font-medium rounded-xl hover:shadow-lg transform transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

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
            <img
              src="https://i.postimg.cc/9MbyJVL4/cropped-fulllogo-edited.webp"
              alt="SureTalk Logo"
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              SureTalk
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Activate your web account
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <StepIndicator step={step} />

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-700 dark:text-green-400">
                  Account activated! Redirecting to login…
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Step 1: Phone ─── */}
          {step === 1 && (
            <form onSubmit={handleCheckPhone} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 text-center">
                  Activate Your Account
                </h2>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
                  Enter the phone number you registered with via phone call
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+1 (555) 000-0000"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading || !phone} className={btnClass}>
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Checking…
                  </>
                ) : (
                  'Continue'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {/* ─── Step 2: OTP ─── */}
          {step === 2 && (
            <form onSubmit={handleVerifyContinue} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 text-center">
                  Verify Your Number
                </h2>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
                  Enter the 6-digit code sent to <span className="font-medium text-gray-700 dark:text-gray-200">{phone}</span>
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-3xl font-mono tracking-[0.5em] py-4 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  placeholder="······"
                  disabled={loading}
                />

                <div className="text-sm text-center">
                  {otpTimer > 0 ? (
                    <span className="text-gray-500">Resend in {otpTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setError(""); sendOtp(); }}
                      className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={btnClass}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying…
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp(""); setError(""); if (timerRef.current) clearInterval(timerRef.current); }}
                className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </form>
          )}

          {/* ─── Step 3: Profile ─── */}
          {step === 3 && (
            <form onSubmit={handleActivate} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 text-center">
                  Complete Your Profile
                </h2>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
                  Set up your SureTalk web account
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={e => setProfileData(p => ({ ...p, fullName: e.target.value }))}
                    className={inputClass}
                    placeholder="Jane Smith"
                    required
                    disabled={loading || success}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))}
                    className={inputClass}
                    placeholder="you@example.com"
                    required
                    disabled={loading || success}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={profileData.password}
                    onChange={e => setProfileData(p => ({ ...p, password: e.target.value }))}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    placeholder="At least 8 characters"
                    required
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={profileData.confirmPassword}
                    onChange={e => setProfileData(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    placeholder="Repeat your password"
                    required
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className={btnClass}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Activating…
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Activated!
                  </>
                ) : (
                  'Activate Account'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep(2); setError(""); }}
                className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                disabled={loading || success}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </form>
          )}
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
