// Dashboard prompt to set up phone-line access (Settings → Phone line).
// Shown only to people with a US (+1) number and no phone-line account yet. "Not now" hides it
// on this device for 14 days; once they have an account it never asks the server again.
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PhoneCall, X } from "lucide-react";
import { api } from "@/utils/api";
import { useLanguage } from "@/contexts/LanguageContext";

const READY_KEY = 'suretalk-phone-line-ready';
const SNOOZE_KEY = 'suretalk-phone-line-snoozed-until';
const SNOOZE_DAYS = 14;

const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, value) => { try { localStorage.setItem(key, value); } catch {} };

export default function PhoneLineSetupCard() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (read(READY_KEY) === '1') return;
    if (Number(read(SNOOZE_KEY) || 0) > Date.now()) return;
    let cancelled = false;
    api.getPhoneLineStatus()
      .then((res) => {
        if (cancelled) return;
        const s = res?.data;
        if (s?.hasAccount) { write(READY_KEY, '1'); return; }
        if (s?.supported) setShow(true);
      })
      .catch(() => {}); // phone line unreachable: just don't show the card
    return () => { cancelled = true; };
  }, []);

  if (!show) return null;

  const snooze = () => {
    write(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 24 * 3600 * 1000));
    setShow(false);
  };

  return (
    <div className="mb-8 relative overflow-hidden rounded-2xl border border-brand-200 dark:border-brand-800/60 bg-gradient-to-r from-brand-50 to-accent-50 dark:from-brand-900/30 dark:to-accent-900/20 p-5 md:p-6">
      <button
        onClick={snooze}
        aria-label={t('dash.phoneLater')}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pr-6">
        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center flex-shrink-0">
          <PhoneCall className="w-6 h-6 text-brand-600 dark:text-brand-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dash.phoneTitle')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t('dash.phoneDesc')}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={snooze} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            {t('dash.phoneLater')}
          </button>
          <Link
            href="/usersDashboard/settings/phone-line"
            className="px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white text-sm font-medium rounded-xl hover:shadow-lg"
          >
            {t('dash.phoneCta')}
          </Link>
        </div>
      </div>
    </div>
  );
}
