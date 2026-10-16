"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowLeft, Copy, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { toast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TwoFactorSetup() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    const startSetup = async () => {
      try {
        const res = await api.setupTwoFactor();
        if (!res?.success) throw new Error(res?.error || t('tfa.setupFailed'));
        setQrCode(res.data.qrCode);
        setSecret(res.data.secret);
      } catch (err) {
        setError(err.message || t('tfa.startError'));
      } finally {
        setLoading(false);
      }
    };
    startSetup();
  }, []);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (code.length !== 6) {
      setError(t('tfa.enterCode'));
      return;
    }
    setVerifying(true);
    try {
      const res = await api.verifyTwoFactorSetup(code);
      if (!res?.success) throw new Error(res?.error || t('tfa.invalidCodeShort'));
      setBackupCodes(res.data.backupCodes);
      setStep(3);
    } catch (err) {
      setError(err.message || t('set.invalidCode'));
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    const text = [
      t('tfa.fileTitle'),
      `${t('tfa.fileGenerated')}: ${new Date().toLocaleDateString(locale)}`,
      t('tfa.fileKeepSafe'),
      '',
      ...backupCodes.map((c, i) => `${i + 1}. ${c}`)
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suretalk-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-enter max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        {step < 3 && (
          <Link href="/usersDashboard/settings" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tfa.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {step === 1 && t('tfa.step1')}
            {step === 2 && t('tfa.step2')}
            {step === 3 && t('tfa.step3')}
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step > s ? 'bg-green-500 text-white'
              : step === s ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {step > s ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 w-12 ${step > s ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1 — QR Code */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card p-6 space-y-6">
              {loading ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                  <p className="text-sm text-gray-500">{t('tfa.generating')}</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {t('tfa.openApp')} <strong>Google Authenticator</strong>, <strong>Authy</strong> {t('tfa.orAnyApp')}
                    </p>
                    <div className="inline-block p-3 bg-white rounded-2xl shadow-md">
                      <Image unoptimized src={qrCode} alt={t('tfa.qrAlt')} width={180} height={180} />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
                      {t('tfa.cantScan')}
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                      <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-200 break-all">{secret}</code>
                      <button
                        onClick={handleCopySecret}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                        title={t('tfa.copySecret')}
                      >
                        {copiedSecret ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold hover:shadow-brand transition-all"
                  >
                    {t('tfa.scanned')} →
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2 — Verify Code */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card p-6">
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('tfa.enterCodeLabel')}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                    className="w-full text-center text-3xl tracking-widest py-4 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="000000"
                    autoFocus
                    disabled={verifying}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={verifying || code.length !== 6}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold hover:shadow-brand transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {t('tfa.verifying')}</>
                  ) : (
                    <><Shield className="w-5 h-5" /> {t('tfa.verifyEnable')}</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setCode(''); setError(''); }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  ← {t('tfa.backToQr')}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Step 3 — Backup Codes */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="card p-6 space-y-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t('tfa.saveCodesWarning')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((c, i) => (
                  <div key={i} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-center font-mono text-sm text-gray-800 dark:text-gray-200">
                    {c}
                  </div>
                ))}
              </div>

              <button
                onClick={handleDownloadBackupCodes}
                className="w-full py-3 rounded-xl border-2 border-brand-500 text-brand-600 dark:text-brand-400 font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" /> {t('tfa.downloadCodes')}
              </button>

              <button
                onClick={() => {
                  toast.success(t('tfa.enabled'), t('tfa.enabledTitle'));
                  router.push('/usersDashboard/settings');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold hover:shadow-brand transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> {t('tfa.done')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
