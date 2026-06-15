'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function VoiceMessagePlayer() {
  const { t } = useLanguage();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [messageData, setMessageData] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const loadMessage = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_URL}/play/public/${params.token}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 410) {
            setExpired(true);
          } else {
            setError(data.error || 'This voice message could not be found');
          }
          return;
        }

        setMessageData(data.data);
      } catch (err) {
        setError('Failed to load voice message. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMessage();
  }, [params.token]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;
    setCurrentTime(current);
    setProgress(total ? (current / total) * 100 : 0);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => setPlaying(false);

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const daysUntilExpiry = messageData?.expiresAt
    ? Math.max(0, Math.ceil((new Date(messageData.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col">

      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">SureTalk</span>
        </div>
        <Link
          href="/register"
          className="text-sm text-indigo-300 hover:text-white transition-colors font-medium"
        >
          Create your own →
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Loading */}
          {loading && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
              <p className="text-indigo-200 text-sm">{t('play.subtitle')}</p>
            </div>
          )}

          {/* Expired */}
          {expired && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('play.expired')}</h2>
              <p className="text-slate-400 mb-8">{t('play.expired')}</p>
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                Try SureTalk Free
              </Link>
            </div>
          )}

          {/* Error */}
          {error && !expired && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('play.notFound')}</h2>
              <p className="text-slate-400 mb-8">{error}</p>
              <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                Go to SureTalk
              </Link>
            </div>
          )}

          {/* Player */}
          {messageData && !loading && (
            <div className="animate-fade-in">

              {/* Sender card */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/25">
                  <span className="text-3xl font-bold text-white">
                    {messageData.senderName?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <p className="text-indigo-300 text-sm font-medium uppercase tracking-widest mb-1">{t('play.from')}</p>
                <h1 className="text-2xl font-bold text-white">{messageData.senderName || 'Someone'}</h1>
                {messageData.customMessage && (
                  <p className="mt-3 text-slate-300 text-sm leading-relaxed max-w-sm mx-auto px-4">
                    "{messageData.customMessage}"
                  </p>
                )}
              </div>

              {/* Audio player card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6 shadow-2xl">

                {messageData.audioUrl && (
                  <audio
                    ref={audioRef}
                    src={messageData.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                    preload="metadata"
                  />
                )}

                {/* Play button */}
                <div className="flex justify-center mb-6">
                  <button
                    onClick={togglePlay}
                    disabled={!messageData.canPlay}
                    className={`
                      w-20 h-20 rounded-full flex items-center justify-center
                      transition-all duration-300 shadow-xl
                      ${messageData.canPlay
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 hover:scale-110 hover:shadow-indigo-500/40 active:scale-95 cursor-pointer'
                        : 'bg-slate-700 cursor-not-allowed opacity-50'
                      }
                    `}
                  >
                    {playing ? (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Progress bar */}
                <div
                  className="w-full h-2 bg-white/10 rounded-full cursor-pointer mb-3 overflow-hidden"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Time display */}
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || messageData.duration)}</span>
                </div>

                {!messageData.canPlay && (
                  <p className="text-center text-orange-400 text-xs mt-3">Audio temporarily unavailable</p>
                )}
              </div>

              {/* Expiry notice */}
              <p className="text-center text-slate-500 text-xs mb-8">
                {daysUntilExpiry > 0
                  ? `This message is available for ${daysUntilExpiry} more day${daysUntilExpiry !== 1 ? 's' : ''}`
                  : 'This message expires soon'
                }
              </p>

              {/* CTA */}
              <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
                <p className="text-white font-semibold mb-1">{t('play.secureMessage')}</p>
                <p className="text-slate-400 text-sm mb-4">{t('play.poweredBy')}</p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 transition-all duration-200"
                >
                  Get Started Free
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-slate-600 text-xs">
        <p>© {new Date().getFullYear()} SureTalk. Powered by voice.</p>
      </footer>
    </div>
  );
}
