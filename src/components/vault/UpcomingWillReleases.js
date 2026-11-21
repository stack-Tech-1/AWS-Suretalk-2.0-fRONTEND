"use client";
// Voice wills with a release date, shown in the Scheduled list. Each will has one date, kept on the
// will itself; "Change" opens the will's page, so a will never has a second schedule.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, ChevronRight } from 'lucide-react';
import { api } from '@/utils/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UpcomingWillReleases() {
  const { t, locale } = useLanguage();
  const [wills, setWills] = useState([]);

  useEffect(() => {
    let active = true;
    api.getVoiceWills()
      .then(res => {
        if (!active || !res?.success) return;
        const upcoming = (res.data?.wills || [])
          .filter(w => w.release_flow === 'auto' && !w.is_released && w.release_date)
          .sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
        setWills(upcoming);
      })
      .catch(() => {}); // no Legacy Vault plan, or no wills: nothing to show
    return () => { active = false; };
  }, []);

  if (!wills.length) return null;

  return (
    <section className="glass rounded-2xl p-5 mb-6" aria-labelledby="will-releases-title">
      <h2 id="will-releases-title" className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
        <Shield className="w-5 h-5 text-purple-500" /> {t('willAuto.scheduledTitle')}
      </h2>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {wills.map(w => (
          <li key={w.id}>
            <Link href={`/usersDashboard/vault/wills/${w.id}`}
              className="flex items-center justify-between gap-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 -mx-2">
              <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-800 dark:text-white truncate">{w.title || t('vault.voiceWill')}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {w.release_state === 'paused'
                    ? t('willAuto.pausedShort')
                    : t('willAuto.releasesOn', { date: new Date(w.release_date).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' }) })}
                </span>
              </span>
              <span className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-300 whitespace-nowrap">
                {t('willAuto.changeLink')} <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
