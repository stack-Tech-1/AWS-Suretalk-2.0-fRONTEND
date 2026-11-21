"use client";
// Private page opened from a voice will reminder text.
//   Owner:           enters their phone PIN, then postpones 30 days or picks a new date.
//   Trusted contact: gets a one-time code by text, then postpones 30 days.
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarClock, AlertCircle, CheckCircle2, RefreshCw, Lock, Loader2 } from "lucide-react";
import LogoIcon from "@/components/common/LogoIcon";
import { useLanguage } from "@/contexts/LanguageContext";

const API = process.env.NEXT_PUBLIC_API_URL;
const pad = (n) => String(n).padStart(2, '0');
const dateInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const field = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400";
const primary = "w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 disabled:opacity-50 flex items-center justify-center gap-2";

export default function WillPostponePage() {
  const { t, locale } = useLanguage();
  const { token } = useParams();
  const [state, setState] = useState({ status: 'loading' }); // loading | ready | gone | error | done
  const [action, setAction] = useState('postpone');         // postpone | date
  const [date, setDate] = useState('');
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [codeSentTo, setCodeSentTo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch(`${API}/will-release/link/${token}`, { cache: 'no-store' });
      const body = await res.json().catch(() => ({}));
      if (res.ok) return setState({ status: 'ready', data: body.data });
      if (res.status >= 500) return setState({ status: 'error' });
      setState({ status: 'gone', error: body.error });
    } catch {
      setState({ status: 'error' });
    }
  }, [token]);

  useEffect(() => { if (token) load(); }, [token, load]);

  const post = async (path, payload) => {
    const res = await fetch(`${API}/will-release/link/${token}/${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload || {}),
    });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body };
  };

  const sendCode = async () => {
    setBusy(true); setMessage(null);
    try {
      const r = await post('send-code');
      if (r.ok) setCodeSentTo(r.body.data.sentTo);
      else setMessage(r.body.error || t('willPostpone.error'));
    } catch { setMessage(t('willPostpone.error')); }
    setBusy(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = state.data;
    if (action === 'date' && !date) return setMessage(t('willPostpone.pickDate'));
    setBusy(true); setMessage(null);
    try {
      const r = await post('postpone', {
        action, ...(action === 'date' && { date }),
        ...(data.audience === 'owner' ? { pin } : { code }),
      });
      if (r.ok) setState({ status: 'done', data: { ...data, ...r.body.data } });
      else if (r.status === 410) setState({ status: 'gone', error: r.body.error });
      else setMessage(r.body.error || t('willPostpone.error'));
    } catch { setMessage(t('willPostpone.error')); }
    setBusy(false);
  };

  const data = state.data;
  const shownDate = (d) => new Date(d).toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const minDate = dateInput(addDays(new Date(), 4));

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
              <p className="text-sm">{t('willPostpone.loading')}</p>
            </div>
          )}

          {(state.status === 'gone' || state.status === 'error') && (
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-300" />
              <h1 className="font-display text-2xl font-bold mb-2">
                {state.status === 'gone' ? t('willPostpone.goneTitle') : t('willPostpone.error')}
              </h1>
              {state.error && <p className="text-slate-300 text-sm leading-relaxed">{state.error}</p>}
              {state.status === 'error' && (
                <button onClick={load} className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 font-semibold">{t('willLink.retry')}</button>
              )}
              <p className="text-slate-400 text-xs mt-6">{t('willPostpone.callUs')}</p>
            </div>
          )}

          {state.status === 'done' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <CheckCircle2 className="w-14 h-14 mx-auto mb-4 text-emerald-300" />
              <h1 className="font-display text-2xl font-bold mb-2">{t('willPostpone.doneTitle')}</h1>
              <p className="text-slate-300">{t('willPostpone.doneBody', { date: shownDate(data.releaseDate) })}</p>
              <p className="text-slate-400 text-sm mt-4">{t('willPostpone.doneNote')}</p>
            </motion.div>
          )}

          {state.status === 'ready' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-7">
                <CalendarClock className="w-12 h-12 mx-auto mb-4 text-indigo-300" />
                <h1 className="font-display text-2xl font-bold mb-2">
                  {data.audience === 'owner' ? t('willPostpone.ownerTitle') : t('willPostpone.trustedTitle', { owner: data.ownerFirstName || t('willPostpone.someone') })}
                </h1>
                <p className="text-slate-300 text-sm">{t('willPostpone.currentDate', { date: shownDate(data.releaseDate) })}</p>
              </div>

              {data.trustedLimitReached ? (
                <p className="text-center text-orange-200 text-sm">{t('willPostpone.trustedLimit')}</p>
              ) : (
                <form onSubmit={submit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl">
                  {data.canPickDate && (
                    <fieldset className="space-y-2">
                      <legend className="sr-only">{t('willPostpone.chooseAction')}</legend>
                      {[['postpone', t('willPostpone.optPostpone', { days: data.postponeDays })], ['date', t('willPostpone.optDate')]].map(([value, label]) => (
                        <label key={value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${action === value ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/10'}`}>
                          <input type="radio" name="action" value={value} checked={action === value} onChange={() => setAction(value)} className="accent-indigo-400" />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </fieldset>
                  )}

                  {action === 'date' && (
                    <div>
                      <label htmlFor="newDate" className="block text-sm text-slate-300 mb-1.5">{t('willPostpone.newDate')}</label>
                      <input id="newDate" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className={field} required />
                      <p className="text-xs text-slate-400 mt-1">{t('willPostpone.minDateNote')}</p>
                    </div>
                  )}

                  {data.audience === 'owner' ? (
                    <div>
                      <label htmlFor="pin" className="block text-sm text-slate-300 mb-1.5">{t('willPostpone.pinLabel')}</label>
                      <input id="pin" type="password" inputMode="numeric" autoComplete="off" maxLength={4} value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} className={`${field} tracking-[0.5em] text-center text-lg`} required />
                      <p className="text-xs text-slate-400 mt-1">{t('willPostpone.pinNote')}</p>
                    </div>
                  ) : !codeSentTo ? (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300">{t('willPostpone.codeIntro', { phone: data.trustedPhone })}</p>
                      <button type="button" onClick={sendCode} disabled={busy} className={primary}>
                        {busy && <Loader2 className="w-4 h-4 animate-spin" />}{t('willPostpone.sendCode')}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="code" className="block text-sm text-slate-300 mb-1.5">{t('willPostpone.codeLabel', { phone: codeSentTo })}</label>
                      <input id="code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className={`${field} tracking-[0.4em] text-center text-lg`} required />
                      <button type="button" onClick={sendCode} disabled={busy} className="mt-2 text-xs text-indigo-300 hover:underline">{t('willPostpone.resend')}</button>
                    </div>
                  )}

                  {message && <p role="alert" className="text-sm text-red-300">{message}</p>}

                  {(data.audience === 'owner' || codeSentTo) && (
                    <button type="submit" disabled={busy || (data.audience === 'owner' ? pin.length !== 4 : code.length !== 6)} className={primary}>
                      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                      {action === 'date' ? t('willPostpone.saveDate') : t('willPostpone.postponeBtn', { days: data.postponeDays })}
                    </button>
                  )}
                </form>
              )}

              <div className="text-center text-xs text-slate-400 mt-6 space-y-1">
                <p className="flex items-center justify-center gap-1.5"><Lock className="w-3.5 h-3.5" /> {t('willPostpone.private')}</p>
                <p>{t('willPostpone.doNothing')}</p>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <footer className="text-center py-6 text-slate-500 text-xs">© {new Date().getFullYear()} SureTalk</footer>
    </div>
  );
}
