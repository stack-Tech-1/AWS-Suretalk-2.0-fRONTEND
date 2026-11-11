"use client";
// Public page: change the phone ID (number) or the 4-digit PIN used on the SureTalk phone line.
// Works for phone-line customers and app customers. Every change needs a 6-digit code sent to the
// number (or the account's email); a new number must also confirm its own code. Backend: /api/pin-reset.
// Open with ?lang=es for Spanish (the phone line sends that link to Spanish callers).
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Smartphone, Mail, KeyRound, AlertCircle, CheckCircle, ArrowLeft, Phone } from "lucide-react";
import { api } from "@/utils/api";
import { useLanguage } from "@/contexts/LanguageContext";

const TEXT = {
  en: {
    title: "Change your phone ID or PIN",
    subtitle: "Your ID is the 10-digit phone number you use when you call SureTalk.",
    phoneLabel: "Your phone number (ID)",
    continue: "Continue",
    checking: "Checking…",
    howCode: "How should we send your code?",
    bySms: (end) => `Text message to the number ending ${end}`,
    byEmail: (e) => `Email to ${e}`,
    sendCode: "Send code",
    sending: "Sending…",
    enterCode: "Enter your code",
    sentTo: (to) => `We sent a 6-digit code to ${to}. It expires in 10 minutes.`,
    resend: "Send a new code",
    resendIn: (s) => `New code in ${s}s`,
    verify: "Verify code",
    verifying: "Verifying…",
    whatChange: "What would you like to change?",
    changePin: "Set a new PIN",
    changePinHint: "Choose a new 4-digit PIN for calling in.",
    changeNumber: "Change my phone number (ID)",
    changeNumberHint: "Move your account, recordings and plan to a new number.",
    newPin: "New 4-digit PIN",
    confirmPin: "Type the PIN again",
    savePin: "Save my new PIN",
    saving: "Saving…",
    pinsDiffer: "The two PINs are not the same.",
    pinFormat: "Your PIN must be exactly 4 digits.",
    newNumber: "Your new phone number",
    sendNewCode: "Text a code to the new number",
    newCodeSent: (to) => `We sent a 6-digit code to ${to}. Enter it to confirm the new number.`,
    newCodeLabel: "Code sent to the new number",
    moveAccount: "Move my account",
    moving: "Moving…",
    donePin: "Your new PIN is saved.",
    donePinCreated: "Your phone access is ready.",
    donePinHint: "Call SureTalk, choose Existing Customer, and sign in with your phone number and your new PIN.",
    doneNumber: (n) => `Your account now uses ${n}.`,
    doneNumberHint: "From now on, call in with your new number as your ID and your usual PIN.",
    back: "Back",
    startOver: "Start over",
    noAccountHelp: "Don't have an account yet?",
    signUp: "Sign up",
    help: "Need help?",
    language: "Español",
  },
  es: {
    title: "Cambie su ID o PIN telefónico",
    subtitle: "Su ID es el número de teléfono de 10 dígitos que usa cuando llama a SureTalk.",
    phoneLabel: "Su número de teléfono (ID)",
    continue: "Continuar",
    checking: "Verificando…",
    howCode: "¿Cómo le enviamos su código?",
    bySms: (end) => `Mensaje de texto al número que termina en ${end}`,
    byEmail: (e) => `Correo electrónico a ${e}`,
    sendCode: "Enviar código",
    sending: "Enviando…",
    enterCode: "Ingrese su código",
    sentTo: (to) => `Enviamos un código de 6 dígitos a ${to}. Vence en 10 minutos.`,
    resend: "Enviar un código nuevo",
    resendIn: (s) => `Nuevo código en ${s} s`,
    verify: "Verificar código",
    verifying: "Verificando…",
    whatChange: "¿Qué desea cambiar?",
    changePin: "Crear un PIN nuevo",
    changePinHint: "Elija un PIN nuevo de 4 dígitos para llamar.",
    changeNumber: "Cambiar mi número de teléfono (ID)",
    changeNumberHint: "Pase su cuenta, grabaciones y plan a un número nuevo.",
    newPin: "PIN nuevo de 4 dígitos",
    confirmPin: "Escriba el PIN otra vez",
    savePin: "Guardar mi PIN nuevo",
    saving: "Guardando…",
    pinsDiffer: "Los dos PIN no son iguales.",
    pinFormat: "Su PIN debe tener exactamente 4 dígitos.",
    newNumber: "Su número de teléfono nuevo",
    sendNewCode: "Enviar un código al número nuevo",
    newCodeSent: (to) => `Enviamos un código de 6 dígitos a ${to}. Ingréselo para confirmar el número nuevo.`,
    newCodeLabel: "Código enviado al número nuevo",
    moveAccount: "Pasar mi cuenta",
    moving: "Pasando…",
    donePin: "Su PIN nuevo está guardado.",
    donePinCreated: "Su acceso telefónico está listo.",
    donePinHint: "Llame a SureTalk, elija Cliente existente e inicie sesión con su número de teléfono y su PIN nuevo.",
    doneNumber: (n) => `Su cuenta ahora usa ${n}.`,
    doneNumberHint: "A partir de ahora, llame con su número nuevo como ID y su PIN de siempre.",
    back: "Atrás",
    startOver: "Empezar de nuevo",
    noAccountHelp: "¿Todavía no tiene una cuenta?",
    signUp: "Regístrese",
    help: "¿Necesita ayuda?",
    language: "English",
  },
};

const digitsOnly = (v) => v.replace(/\D/g, "").slice(0, 10);
const pretty = (d) => (d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d);
const INPUT = "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-gray-900 dark:text-white";

function Spinner() {
  return <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}

// US number box with a fixed +1 in front; stores the 10 digits only
function PhoneInput({ id, value, onChange, disabled }) {
  return (
    <div className="relative">
      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-300 font-medium z-10 pointer-events-none">+1</span>
      <input id={id} type="tel" inputMode="numeric" autoComplete="tel-national" value={value}
        onChange={(e) => onChange(digitsOnly(e.target.value))} className={`${INPUT} pl-20`} placeholder="(555) 000-0000" disabled={disabled} />
    </div>
  );
}

export default function ResetPinPage() {
  const { lang, setLang } = useLanguage();
  const L = TEXT[lang === "es" ? "es" : "en"];

  // step: phone -> method -> code -> choose -> pin | number -> done
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [info, setInfo] = useState(null);         // { hasPhoneLine, hasApp, email }
  const [via, setVia] = useState("sms");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newSentTo, setNewSentTo] = useState("");
  const [newCode, setNewCode] = useState("");
  const [done, setDone] = useState(null);         // { kind: 'pin'|'number', created?, number? }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    if ((q === "es" || q === "en") && q !== lang) setLang(q);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimer(60);
    timerRef.current = setInterval(() => setTimer((s) => { if (s <= 1) { clearInterval(timerRef.current); return 0; } return s - 1; }), 1000);
  };

  const call = async (endpoint, body) => {
    setError("");
    setLoading(true);
    try {
      return await api.request(`/pin-reset/${endpoint}`, { method: "POST", body: JSON.stringify(body) });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const lookup = async (e) => {
    e.preventDefault();
    const r = await call("lookup", { phone });
    if (r) { setInfo(r.data); setVia("sms"); setStep("method"); }
  };
  const sendCode = async (e) => {
    e?.preventDefault();
    const r = await call("send-code", { phone, via });
    if (r) { setSentTo(r.data.to); setCode(""); setStep("code"); startTimer(); }
  };
  const checkCode = async (e) => {
    e.preventDefault();
    const r = await call("check-code", { phone, code });
    if (r) setStep("choose");
  };
  const savePin = async (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) return setError(L.pinFormat);
    if (pin !== pin2) return setError(L.pinsDiffer);
    const r = await call("set-pin", { phone, code, pin });
    if (r) { setDone({ kind: "pin", created: r.data.created }); setStep("done"); }
  };
  const sendNewNumberCode = async (e) => {
    e.preventDefault();
    const r = await call("send-new-number-code", { phone, code, newPhone });
    if (r) { setNewSentTo(r.data.to); setNewCode(""); }
  };
  const moveAccount = async (e) => {
    e.preventDefault();
    const r = await call("change-number", { phone, code, newPhone, newCode });
    if (r) { setDone({ kind: "number", number: pretty(newPhone) }); setStep("done"); }
  };
  const startOver = () => {
    setStep("phone"); setInfo(null); setCode(""); setPin(""); setPin2(""); setNewPhone(""); setNewSentTo(""); setNewCode(""); setDone(null); setError("");
  };

  const input = INPUT;
  const codeInput = "w-full text-center text-3xl font-mono tracking-[0.5em] py-4 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-gray-900 dark:text-white";
  const btn = "w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-accent-500 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const backBtn = "w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors";
  const label = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image unoptimized src="https://i.postimg.cc/9MbyJVL4/cropped-fulllogo-edited.webp" alt="SureTalk Logo" width={40} height={40} className="object-contain" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">SureTalk</h1>
          </div>
          <button type="button" onClick={() => setLang(lang === "es" ? "en" : "es")} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            {L.language}
          </button>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 text-center">{step === "done" ? "SureTalk" : L.title}</h2>
          {step === "phone" && <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">{L.subtitle}</p>}
          {step !== "phone" && <div className="mb-6" />}

          {error && (
            <div role="alert" className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
            </div>
          )}

          {step === "phone" && (
            <form onSubmit={lookup} className="space-y-6">
              <div>
                <label htmlFor="phone" className={label}>{L.phoneLabel}</label>
                <PhoneInput id="phone" value={phone} onChange={setPhone} disabled={loading} />
              </div>
              <button type="submit" disabled={loading || phone.length !== 10} className={btn}>
                {loading ? <><Spinner />{L.checking}</> : L.continue}
              </button>
              <p className="text-center text-sm text-gray-500">
                {L.noAccountHelp}{" "}
                <Link href="/signup" className="text-brand-600 hover:text-brand-700 font-medium">{L.signUp}</Link>
              </p>
            </form>
          )}

          {step === "method" && info && (
            <form onSubmit={sendCode} className="space-y-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{L.howCode}</p>
              {[{ id: "sms", icon: Smartphone, text: L.bySms(phone.slice(-4)) }, ...(info.email ? [{ id: "email", icon: Mail, text: L.byEmail(info.email) }] : [])].map((o) => (
                <label key={o.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${via === o.id ? "border-brand-500 bg-brand-50/60 dark:bg-brand-900/20" : "border-gray-300 dark:border-gray-600"}`}>
                  <input type="radio" name="via" value={o.id} checked={via === o.id} onChange={() => setVia(o.id)} className="accent-brand-600" />
                  <o.icon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-800 dark:text-gray-200">{o.text}</span>
                </label>
              ))}
              <button type="submit" disabled={loading} className={btn}>{loading ? <><Spinner />{L.sending}</> : L.sendCode}</button>
              <button type="button" onClick={() => { setStep("phone"); setError(""); }} className={backBtn}><ArrowLeft className="w-4 h-4" />{L.back}</button>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={checkCode} className="space-y-6">
              <div>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">{L.sentTo(sentTo)}</p>
                <label htmlFor="code" className="sr-only">{L.enterCode}</label>
                <input id="code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className={codeInput} placeholder="······" disabled={loading} autoFocus />
                <div className="text-sm text-center mt-3">
                  {timer > 0 ? <span className="text-gray-500">{L.resendIn(timer)}</span>
                    : <button type="button" onClick={() => sendCode()} className="text-brand-600 hover:text-brand-700 font-medium" disabled={loading}>{L.resend}</button>}
                </div>
              </div>
              <button type="submit" disabled={loading || code.length !== 6} className={btn}>{loading ? <><Spinner />{L.verifying}</> : L.verify}</button>
              <button type="button" onClick={() => { setStep("method"); setError(""); }} className={backBtn}><ArrowLeft className="w-4 h-4" />{L.back}</button>
            </form>
          )}

          {step === "choose" && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{L.whatChange}</p>
              {[{ id: "pin", icon: KeyRound, title: L.changePin, hint: L.changePinHint }, { id: "number", icon: Phone, title: L.changeNumber, hint: L.changeNumberHint }].map((o) => (
                <button key={o.id} type="button" onClick={() => { setError(""); setStep(o.id); }}
                  className="w-full text-left flex items-start gap-3 p-4 rounded-xl border border-gray-300 dark:border-gray-600 hover:border-brand-500 hover:bg-brand-50/60 dark:hover:bg-brand-900/20 transition-all">
                  <o.icon className="w-5 h-5 text-brand-600 mt-0.5" />
                  <span>
                    <span className="block font-medium text-gray-800 dark:text-gray-100">{o.title}</span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">{o.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === "pin" && (
            <form onSubmit={savePin} className="space-y-5">
              <div>
                <label htmlFor="pin" className={label}>{L.newPin}</label>
                <input id="pin" type="password" inputMode="numeric" autoComplete="new-password" maxLength={4} value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} className={`${input} text-center text-2xl tracking-[0.6em] font-mono`} disabled={loading} autoFocus />
              </div>
              <div>
                <label htmlFor="pin2" className={label}>{L.confirmPin}</label>
                <input id="pin2" type="password" inputMode="numeric" autoComplete="new-password" maxLength={4} value={pin2}
                  onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} className={`${input} text-center text-2xl tracking-[0.6em] font-mono`} disabled={loading} />
              </div>
              <button type="submit" disabled={loading || pin.length !== 4 || pin2.length !== 4} className={btn}>{loading ? <><Spinner />{L.saving}</> : L.savePin}</button>
              <button type="button" onClick={() => { setStep("choose"); setError(""); }} className={backBtn}><ArrowLeft className="w-4 h-4" />{L.back}</button>
            </form>
          )}

          {step === "number" && (
            <form onSubmit={newSentTo ? moveAccount : sendNewNumberCode} className="space-y-5">
              <div>
                <label htmlFor="newPhone" className={label}>{L.newNumber}</label>
                <PhoneInput id="newPhone" value={newPhone} onChange={(v) => { setNewPhone(v); setNewSentTo(""); }} disabled={loading} />
              </div>
              {newSentTo && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{L.newCodeSent(newSentTo)}</p>
                  <label htmlFor="newCode" className={label}>{L.newCodeLabel}</label>
                  <input id="newCode" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={newCode}
                    onChange={(e) => setNewCode(e.target.value.replace(/\D/g, ""))} className={codeInput} placeholder="······" disabled={loading} autoFocus />
                </div>
              )}
              <button type="submit" disabled={loading || newPhone.length !== 10 || (newSentTo && newCode.length !== 6)} className={btn}>
                {loading ? <><Spinner />{newSentTo ? L.moving : L.sending}</> : newSentTo ? L.moveAccount : L.sendNewCode}
              </button>
              <button type="button" onClick={() => { setStep("choose"); setError(""); }} className={backBtn}><ArrowLeft className="w-4 h-4" />{L.back}</button>
            </form>
          )}

          {step === "done" && done && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {done.kind === "pin" ? (done.created ? L.donePinCreated : L.donePin) : L.doneNumber(done.number)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{done.kind === "pin" ? L.donePinHint : L.doneNumberHint}</p>
              <button type="button" onClick={startOver} className={backBtn}>{L.startOver}</button>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          {L.help} <a href="mailto:contact@suretalknow.com" className="text-brand-600 hover:text-brand-700">contact@suretalknow.com</a>
        </div>
      </div>
    </div>
  );
}
