// /app/usersDashboard/settings/phone-line/page.js
// Phone line access: shows whether the user has a phone-line account and lets them create one
// by choosing a 4-digit PIN (routes/users.js /phone-line). The phone line uses their 10-digit
// phone number as the ID callers type in.
"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PhoneCall, CheckCircle, AlertCircle, Loader2, KeyRound, Hash } from "lucide-react";
import { api } from "@/utils/api";
import { toast } from '@/components/ui/Toast';
import { useLanguage } from '@/contexts/LanguageContext';

// SureTalk's phone line (Twilio number used by the IVR flow)
const PHONE_LINE_NUMBER = "+1 (864) 727-7476";

const formatId = (phone) => {
  const d = String(phone || '').replace(/\D/g, '');
  const ten = d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
  return ten.length === 10 ? `${ten.slice(0, 3)} ${ten.slice(3, 6)} ${ten.slice(6)}` : phone;
};

export default function PhoneLineSettings() {
  const { t } = useLanguage();
  const [status, setStatus] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await api.getPhoneLineStatus();
      setStatus(res.data);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pinValid = /^\d{4}$/.test(pin);
  const matches = pin === confirmPin;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!pinValid) return setError(t('pl.pinFormat'));
    if (!matches) return setError(t('pl.pinMismatch'));
    setSaving(true);
    try {
      await api.createPhoneLinePin(pin);
      toast.success(t('pl.success'));
      setPin('');
      setConfirmPin('');
      setStatus(s => ({ ...s, hasAccount: true }));
    } catch (err) {
      const code = err?.data?.code;
      const message = code === 'WEAK_PIN' ? t('pl.weakPin')
        : code === 'ALREADY_EXISTS' ? t('pl.alreadyExists')
        : code === 'NOT_US' ? t('pl.notUs')
        : err?.status === 429 ? t('pl.tooMany')
        : t('pl.error');
      setError(message);
      if (code === 'ALREADY_EXISTS') setStatus(s => ({ ...s, hasAccount: true }));
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all";

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/usersDashboard/settings" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('pl.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('pl.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Phone number to call — always useful */}
      <div className="p-4 mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center gap-3">
        <PhoneCall className="w-5 h-5 text-brand-500 flex-shrink-0" />
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('pl.callNumber')}</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white select-all">{PHONE_LINE_NUMBER}</p>
        </div>
      </div>

      {!status && !loadError && (
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" /> {t('pl.checking')}
        </div>
      )}

      {loadError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-red-300">{t('pl.error')}</p>
          </div>
          <button onClick={load} className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl text-sm">
            {t('pl.retry')}
          </button>
        </div>
      )}

      {status && !status.supported && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-amber-800 dark:text-amber-200">{status.reason === 'no_phone' ? t('pl.noPhone') : t('pl.notUs')}</p>
              {status.reason === 'no_phone' && (
                <Link href="/usersDashboard/settings/profile" className="inline-block mt-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
                  {t('pl.goProfile')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {status?.supported && (
        <>
          <div className="p-4 mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center gap-3">
            <Hash className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('pl.yourId')}</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white tabular-nums">{formatId(status.phone)}</p>
              <p className="text-xs text-gray-500">{t('pl.idHint')}</p>
            </div>
          </div>

          {status.hasAccount ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">{t('pl.ready')}</p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">{t('pl.readyDesc')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{t('pl.forgotPin')}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('pl.setTitle')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('pl.setDesc')}</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="pl-pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pl.pin')}</label>
                <input id="pl-pin" type="password" inputMode="numeric" autoComplete="new-password" maxLength={4}
                  value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className={inputClass} />
              </div>
              <div>
                <label htmlFor="pl-pin-confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pl.confirmPin')}</label>
                <input id="pl-pin-confirm" type="password" inputMode="numeric" autoComplete="new-password" maxLength={4}
                  value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className={inputClass} />
                {confirmPin.length === 4 && !matches && (
                  <p className="text-xs mt-2 text-red-600 dark:text-red-400">{t('pl.pinMismatch')}</p>
                )}
              </div>

              <button type="submit" disabled={saving || !pinValid || !matches}
                className="w-full px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> {t('pl.creating')}</> : <><KeyRound className="w-5 h-5" /> {t('pl.create')}</>}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
