"use client";
// Private page a beneficiary opens from the SMS/email sent when an admin releases a voice will
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Pause, Lock, Clock, AlertCircle, RefreshCw } from "lucide-react";
import LogoIcon from "@/components/common/LogoIcon";
import { useLanguage } from "@/contexts/LanguageContext";

const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return '0:00';
  return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
};

export default function ReleasedWillPage() {
  const { t } = useLanguage();
  const { token } = useParams();
  const [state, setState] = useState({ status: 'loading' }); // loading | ready | expired | unavailable | error
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ current: 0, total: 0 });
  const audioRef = useRef(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/play/will/${token}`, { cache: 'no-store' });
      const body = await res.json().catch(() => ({}));
      if (res.status === 410) return setState({ status: 'expired' });
      if (!res.ok) return setState({ status: res.status === 404 ? 'unavailable' : 'error' });
      setState({ status: 'ready', data: body.data });
    } catch {
      setState({ status: 'error' });
    }
  }, [token]);

  useEffect(() => { if (token) load(); }, [token, load]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause(); else a.play().catch(() => {});
  };

  const seek = (e) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration;
  };

  const data = state.data;
  const daysLeft = data?.expiresAt ? Math.ceil((new Date(data.expiresAt) - Date.now()) / 86400000) : 0;
  const progress = time.total ? (time.current / time.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col text-white">
      <header className="px-6 py-5 flex items-center gap-3">
        <LogoIcon size={32} />
        <span className="font-display font-bold text-lg">SureTalk</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {state.status === 'loading' && (
            <div className="text-center text-indigo-200">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
              <p className="text-sm">{t('willLink.loading')}</p>
            </div>
          )}

          {['expired', 'unavailable', 'error'].includes(state.status) && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                {state.status === 'expired' ? <Clock className="w-8 h-8 text-orange-300" /> : <AlertCircle className="w-8 h-8 text-red-300" />}
              </div>
              <h1 className="font-display text-2xl font-bold mb-2">
                {state.status === 'expired' ? t('willLink.expiredTitle') : state.status === 'unavailable' ? t('willLink.unavailableTitle') : t('willLink.loadError')}
              </h1>
              {state.status !== 'error' && (
                <p className="text-slate-300 text-sm leading-relaxed">
                  {state.status === 'expired' ? t('willLink.expiredBody') : t('willLink.unavailableBody')}
                </p>
              )}
              {state.status === 'error' && (
                <button onClick={load} className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 font-semibold">{t('willLink.retry')}</button>
              )}
            </div>
          )}

          {state.status === 'ready' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/25">
                  <span className="text-3xl font-bold">{(data.ownerName || 'S').charAt(0).toUpperCase()}</span>
                </div>
                <p className="text-indigo-300 text-xs font-medium uppercase tracking-widest mb-1">{t('willLink.from')}</p>
                <h1 className="font-display text-2xl font-bold">{data.ownerName}</h1>
                {data.title && <p className="text-slate-300 mt-1">{data.title}</p>}
                <p className="mt-4 text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">{t('willLink.intro', { owner: data.ownerName })}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6 shadow-2xl">
                {data.audioUrl && (
                  <audio ref={audioRef} src={data.audioUrl} preload="metadata"
                    onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
                    onLoadedMetadata={(e) => setTime(tm => ({ ...tm, total: e.currentTarget.duration }))}
                    onTimeUpdate={(e) => setTime({ current: e.currentTarget.currentTime, total: e.currentTarget.duration })} />
                )}
                <div className="flex justify-center mb-6">
                  <button onClick={toggle} disabled={!data.canPlay} aria-label={playing ? t('willLink.pause') : t('willLink.play')}
                    className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100">
                    {playing ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </button>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full cursor-pointer mb-2 overflow-hidden" onClick={seek} role="presentation">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{formatTime(time.current)}</span><span>{formatTime(time.total)}</span>
                </div>
                {!data.canPlay && <p className="text-center text-orange-300 text-xs mt-3">{t('willLink.audioUnavailable')}</p>}
              </div>

              <div className="text-center text-xs text-slate-400 space-y-1">
                <p className="flex items-center justify-center gap-1.5"><Lock className="w-3.5 h-3.5" /> {t('willLink.private')}</p>
                <p>{daysLeft > 1 ? t('willLink.daysLeft', { count: daysLeft }) : daysLeft === 1 ? t('willLink.oneDayLeft') : t('willLink.expiresSoon')}</p>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <footer className="text-center py-6 text-slate-500 text-xs">© {new Date().getFullYear()} SureTalk</footer>
    </div>
  );
}
