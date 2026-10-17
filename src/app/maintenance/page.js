"use client";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, RefreshCw } from "lucide-react";
import LogoIcon from "@/components/common/LogoIcon";
import { api } from "@/utils/api";
import { useLanguage } from "@/contexts/LanguageContext";

const CHECK_EVERY_MS = 60 * 1000;
// The server's built-in message; when it hasn't been customised, show the translated version instead
const DEFAULT_SERVER_MESSAGE = "We're doing some maintenance and will be back shortly.";

export default function MaintenancePage() {
  const { t } = useLanguage();
  const [message, setMessage] = useState(null);
  const [checking, setChecking] = useState(false);

  // Goes back to where the visitor came from as soon as maintenance is switched off
  const check = useCallback(async () => {
    setChecking(true);
    try {
      const res = await api.getMaintenanceStatus();
      if (!res.data?.maintenance) {
        // Back to the page they were on — unless that was this screen (e.g. after a refresh)
        let target = '/';
        try {
          const ref = document.referrer ? new URL(document.referrer) : null;
          if (ref && ref.origin === window.location.origin && !ref.pathname.startsWith('/maintenance')) target = ref.href;
        } catch {
          // unreadable referrer — go home
        }
        window.location.replace(target);
        return;
      }
      if (res.data.message) setMessage(res.data.message);
    } catch {
      // Server unreachable — stay on this page and try again later
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    check();
    const timer = setInterval(check, CHECK_EVERY_MS);
    return () => clearInterval(timer);
  }, [check]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md glass rounded-3xl shadow-2xl px-8 py-10 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <LogoIcon size={36} />
          <span className="font-display text-2xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">SureTalk</span>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Wrench className="w-8 h-8 text-white" />
        </div>

        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('maint.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{!message || message === DEFAULT_SERVER_MESSAGE ? t('maint.defaultMessage') : message}</p>

        <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
          {t('maint.safe')}
        </p>

        <button
          onClick={check}
          disabled={checking}
          className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          {checking ? t('maint.checking') : t('maint.checkAgain')}
        </button>
        <p className="text-xs text-gray-400 mt-3">{t('maint.autoCheck')}</p>
      </motion.div>
    </div>
  );
}
