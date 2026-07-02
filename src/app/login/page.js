"use client";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Smartphone, Eye, EyeOff, AlertCircle, Shield, CheckCircle, Mic, Heart, Globe } from "lucide-react";
import LogoIcon from "@/components/common/LogoIcon";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../utils/api";
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from '@/components/ui/Toast';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

// Features are rendered inside LoginInner where t() is available

const WAVE_HEIGHTS = [28, 40, 52, 36, 48, 56, 32, 44, 52, 38, 48, 30];

function LoginInner() {
  useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const FEATURES = [
    { icon: Mic,   text: t('auth.feature1') },
    { icon: Heart, text: t('auth.feature2') },
    { icon: Globe, text: t('auth.feature3') },
  ];
  const searchParams = useSearchParams();
  const activated = searchParams.get('activated');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [tempToken, setTempToken] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });

  useEffect(() => {
    const justLoggedOut = sessionStorage.getItem('just_logged_out');
    if (justLoggedOut) {
      sessionStorage.removeItem('just_logged_out');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    api.getProfile().then(response => {
      if (response?.data?.is_admin) router.push('/adminDashboard');
      else router.push('/usersDashboard');
    }).catch(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!formData.email || !formData.password) throw new Error("Please fill in all fields");
      const response = await api.login(formData.email, formData.password);
      if (response.requiresTwoFactor) {
        setTempToken(response.tempToken);
        setStep(2);
        setLoading(false);
        return;
      }
      const userData = response.data.user;
      if (userData.is_admin || userData.isAdmin) {
        throw new Error('Admin accounts cannot login here. Please use the admin login portal.');
      }
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', formData.email);
      }
      window.location.href = '/usersDashboard';
    } catch (error) {
      console.error("Login error:", error);
      if (error.message.includes('Please verify your email address')) {
        setError('Email not verified. Please check your inbox for verification link.');
        setTimeout(() => {
          if (confirm('Would you like us to resend the verification email?')) {
            api.resendVerification({ email: formData.email })
              .then(() => toast.success('Verification email resent! Please check your inbox.', 'Email Sent'))
              .catch(err => toast.error('Failed to resend: ' + err.message));
          }
        }, 1000);
      } else if (error.message.includes('Admin accounts cannot login here')) {
        setError(error.message);
      } else if (error.message.includes('Invalid credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(error.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (twoFaCode.length !== 6) throw new Error('Please enter the 6-digit code');
      const response = await api.verifyTwoFactorLogin(tempToken, twoFaCode);
      const { token, refreshToken } = response.data;
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', formData.email);
      }
      window.location.href = '/usersDashboard';
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all";

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[10%] w-48 h-48 bg-brand-400/10 rounded-full blur-2xl animate-pulse-slow" />
        <div className="absolute bottom-[30%] right-[10%] w-56 h-56 bg-accent-400/10 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="grid md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl"
        >
          {/* ── Left branding panel (desktop only) ──────────────────── */}
          <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-brand-600 to-accent-600 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse-slow" />

            {/* Logo */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <LogoIcon size={44} />
                <span className="text-3xl font-bold text-white">SureTalk</span>
              </div>
              <p className="text-white/75 text-base leading-snug">
                {t('auth.tagline')}
              </p>
            </div>

            {/* Waveform */}
            <div className="relative z-10 flex items-end gap-1 h-14 my-8">
              {WAVE_HEIGHTS.map((h, i) => (
                <span
                  key={i}
                  className="waveform-bar flex-1 bg-white/50 rounded-full"
                  style={{ height: `${h}px`, animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </div>

            {/* Feature bullets */}
            <div className="relative z-10 space-y-4">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right form panel ─────────────────────────────────────── */}
          <div className="glass md:rounded-none rounded-3xl px-8 py-10 flex flex-col justify-center">
            {/* Mobile-only logo */}
            <div className="flex md:hidden items-center justify-center gap-3 mb-6">
              <LogoIcon size={36} />
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
                SureTalk
              </span>
            </div>

            <AnimatePresence mode="wait">
              {/* ── 2FA step ──────────────────────────────────────────── */}
              {step === 2 ? (
                <motion.div
                  key="2fa"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('auth.2faTitle')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('auth.2faSubtitle')}
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
                    </motion.div>
                  )}

                  <form onSubmit={handleVerify2FA} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('auth.2faLabel')}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={twoFaCode}
                        onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className={`${inputClass} text-center text-2xl tracking-widest`}
                        placeholder="000000"
                        autoFocus
                        disabled={loading}
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={loading || twoFaCode.length !== 6}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-accent-500 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><Shield className="w-5 h-5" /> {t('auth.verifySignIn')}</>
                      )}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError(''); setTwoFaCode(''); }}
                      className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      {t('auth.backToLogin')}
                    </button>
                  </form>
                </motion.div>
              ) : (
                /* ── Login step ───────────────────────────────────────── */
                <motion.div
                  key="login"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -24 }}
                >
                  <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                    {t('auth.welcomeBack')}
                  </motion.h2>

                  {activated === 'true' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-700 dark:text-green-400">
                        Account activated! Sign in with your new credentials.
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
                    </motion.div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('auth.emailLabel')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`${inputClass} pl-11 pr-4`}
                          placeholder={t('auth.emailPlaceholder')}
                          required
                          disabled={loading}
                        />
                      </div>
                    </motion.div>

                    {/* Password */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('auth.passwordLabel')}
                        </label>
                        <Link href="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700 transition-colors">
                          {t('auth.forgotPassword')}
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`${inputClass} pl-11 pr-12`}
                          placeholder={t('auth.passwordPlaceholder')}
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Remember me */}
                    <motion.div variants={itemVariants} className="flex items-center">
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
                        {t('auth.rememberMe')}
                      </label>
                    </motion.div>

                    {/* Submit */}
                    <motion.div variants={itemVariants}>
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t('auth.signingIn')}
                          </>
                        ) : (
                          <><Lock className="w-5 h-5" /> {t('auth.signIn')}</>
                        )}
                      </motion.button>
                    </motion.div>
                  </form>

                  {/* Divider */}
                  <motion.div variants={itemVariants} className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white/50 dark:bg-gray-800/50 text-gray-500">{t('auth.orContinueWith')}</span>
                    </div>
                  </motion.div>

                  {/* Google (full-width) */}
                  <motion.div variants={itemVariants}>
                    <button
                      type="button"
                      disabled={loading}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 font-medium text-gray-700 dark:text-gray-300"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {t('auth.continueGoogle')}
                    </button>
                  </motion.div>

                  {/* Admin link */}
                  <motion.div variants={itemVariants} className="text-center mt-4">
                    <Link
                      href="/admin/login"
                      className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors inline-flex items-center gap-1"
                    >
                      <Shield className="w-4 h-4" />
                      {t('auth.adminAccess')}
                    </Link>
                  </motion.div>

                  {/* Signup */}
                  <motion.p variants={itemVariants} className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    {t('auth.noAccount')}{" "}
                    <Link href="/signup" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                      {t('auth.createAccount')}
                    </Link>
                  </motion.p>

                  {/* IVR claim */}
                  <motion.div variants={itemVariants} className="text-center mt-3">
                    <Link
                      href="/claim-account"
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-1"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      {t('auth.activatedViaPhone')}
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>{t('auth.copyright')}</p>
          <p className="mt-1">
            <Link href="/privacy" className="hover:text-brand-600 transition-colors">{t('auth.privacy')}</Link>
            {" · "}
            <Link href="/terms" className="hover:text-brand-600 transition-colors">{t('auth.terms')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
