"use client";
// Release date, postpone, trusted contact and history for a voice will on the automatic release rules.
// Shown on the will's page only when will.release_flow === 'auto'.
import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Loader2, UserCheck, History, PauseCircle } from 'lucide-react';
import { api } from '@/utils/api';
import { toast } from '@/components/ui/Toast';
import { useLanguage } from '@/contexts/LanguageContext';

const pad = (n) => String(n).padStart(2, '0');
const dateInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const input = 'w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500';
const button = 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50';

export default function WillReleaseCard({ willId }) {
  const { t, locale } = useLanguage();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null); // 'postpone' | 'date' | 'trusted'
  const [newDate, setNewDate] = useState('');
  const [editTrusted, setEditTrusted] = useState(false);
  const [trusted, setTrusted] = useState({ name: '', phone: '', email: '' });

  const load = useCallback(async () => {
    try {
      const res = await api.getWillRelease(willId);
      if (res?.success) {
        setInfo(res.data);
        const tc = res.data.trustedContact;
        setTrusted({ name: tc?.name || '', phone: tc?.phone || '', email: tc?.email || '' });
      }
    } catch { /* card simply doesn't show */ }
    setLoading(false);
  }, [willId]);

  useEffect(() => { load(); }, [load]);

  const shown = (d) => new Date(d).toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const change = async (body, kind) => {
    setBusy(kind);
    try {
      const res = await api.changeWillReleaseDate(willId, body);
      if (!res?.success) throw new Error(res?.error);
      toast.success(t('willAuto.dateChanged', { date: shown(res.data.releaseDate) }));
      setNewDate('');
      await load();
    } catch (err) {
      toast.error(err.message || t('willAuto.changeError'));
    }
    setBusy(null);
  };

  const saveTrusted = async (remove = false) => {
    setBusy('trusted');
    try {
      const res = await api.setWillTrustedContact(willId, remove ? { name: '', phone: '', email: '' } : trusted);
      if (!res?.success) throw new Error(res?.error);
      toast.success(remove ? t('willAuto.trustedRemoved') : t('willAuto.trustedSaved'));
      setEditTrusted(false);
      await load();
    } catch (err) {
      toast.error(err.message || t('willAuto.changeError'));
    }
    setBusy(null);
  };

  if (loading || !info || info.flow !== 'auto') return null;

  const eventLabel = (e) => {
    const key = `willAuto.event.${e.event}`;
    const label = t(key, { date: e.new_date ? shown(e.new_date) : '' });
    return label === key ? e.event : label;
  };

  return (
    <div className="glass rounded-2xl p-6 lg:col-span-2">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-purple-500" /> {t('willAuto.cardTitle')}
      </h2>

      {info.released ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">{t('willAuto.releasedNote')}</p>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{shown(info.releaseDate)}</p>
          {info.paused ? (
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-300 flex items-center gap-1.5"><PauseCircle className="w-4 h-4" /> {t('willAuto.pausedNote')}</p>
          ) : (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{info.warningsSent > 0 ? t('willAuto.remindersStarted') : t('willAuto.remindersLater')}</p>
          )}

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => change({ action: 'postpone' }, 'postpone')} disabled={!!busy}
              className={`${button} bg-purple-600 hover:bg-purple-700 text-white`}>
              {busy === 'postpone' && <Loader2 className="w-4 h-4 animate-spin" />} {t('willAuto.postponeBtn', { days: info.postponeDays })}
            </button>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (newDate) change({ action: 'date', date: newDate }, 'date'); }}>
              <input type="date" min={dateInput(addDays(new Date(), 4))} value={newDate} onChange={(e) => setNewDate(e.target.value)}
                aria-label={t('willAuto.newDateLabel')} className={input} />
              <button type="submit" disabled={!!busy || !newDate} className={`${button} border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 whitespace-nowrap`}>
                {busy === 'date' && <Loader2 className="w-4 h-4 animate-spin" />} {t('willAuto.setDateBtn')}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-1"><UserCheck className="w-4 h-4 text-purple-500" /> {t('willAuto.trustedTitle')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('willAuto.trustedHint')}</p>
            {!editTrusted ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-gray-800 dark:text-white">
                  {info.trustedContact ? [info.trustedContact.name, info.trustedContact.phone, info.trustedContact.email].filter(Boolean).join(' · ') : t('willAuto.noTrusted')}
                </p>
                <button onClick={() => setEditTrusted(true)} className="text-sm text-purple-600 dark:text-purple-300 hover:underline">
                  {info.trustedContact ? t('common.edit') : t('willAuto.addTrusted')}
                </button>
                {info.trustedContact && (
                  <button onClick={() => saveTrusted(true)} disabled={!!busy} className="text-sm text-red-600 dark:text-red-400 hover:underline">{t('willAuto.removeTrusted')}</button>
                )}
              </div>
            ) : (
              <form className="grid grid-cols-1 sm:grid-cols-4 gap-2" onSubmit={(e) => { e.preventDefault(); saveTrusted(false); }}>
                <input className={input} placeholder={t('willAuto.trustedName')} aria-label={t('willAuto.trustedName')} value={trusted.name} onChange={(e) => setTrusted({ ...trusted, name: e.target.value })} />
                <input className={input} type="tel" required placeholder={t('willAuto.trustedPhone')} aria-label={t('willAuto.trustedPhone')} value={trusted.phone} onChange={(e) => setTrusted({ ...trusted, phone: e.target.value })} />
                <input className={input} type="email" placeholder={t('willAuto.trustedEmail')} aria-label={t('willAuto.trustedEmail')} value={trusted.email} onChange={(e) => setTrusted({ ...trusted, email: e.target.value })} />
                <div className="flex gap-2">
                  <button type="submit" disabled={!!busy} className={`${button} bg-purple-600 hover:bg-purple-700 text-white flex-1`}>
                    {busy === 'trusted' && <Loader2 className="w-4 h-4 animate-spin" />} {t('common.save')}
                  </button>
                  <button type="button" onClick={() => setEditTrusted(false)} className={`${button} border border-gray-300 dark:border-gray-600`}>{t('common.cancel')}</button>
                </div>
                <p className="sm:col-span-4 text-xs text-gray-500 dark:text-gray-400">{t('consent.recipientWill')}</p>
              </form>
            )}
          </div>
        </>
      )}

      {info.history?.length > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-2"><History className="w-4 h-4 text-purple-500" /> {t('willAuto.historyTitle')}</h3>
          <ul className="space-y-1.5">
            {info.history.slice(0, 8).map((e, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex justify-between gap-4">
                <span>{eventLabel(e)}</span>
                <span className="text-xs whitespace-nowrap">{new Date(e.created_at).toLocaleDateString(locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
