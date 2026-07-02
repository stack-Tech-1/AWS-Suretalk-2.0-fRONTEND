"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import LogoIcon from "@/components/common/LogoIcon";

export default function Navbar({ type = "landing" }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="https://suretalknow.com" className="flex items-center space-x-2">
            <LogoIcon size={40} />
            <span className="text-xl font-bold text-gray-800 dark:text-white">SureTalk</span>
          </Link>

          {type === "landing" && (
            <div className="flex items-center space-x-6">
              <a href="/#features" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium hidden md:block transition-colors text-sm">
                {t('nav.features')}
              </a>
              <a href="/#pricing" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium hidden md:block transition-colors text-sm">
                {t('nav.pricing')}
              </a>
              <Link
                href="/legacy-vault"
                className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium hidden md:block transition-colors text-sm"
              >
                {t('nav.legacyVault')}
              </Link>
              <Link
                href="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors text-sm"
              >
                {t('nav.signIn')}
              </Link>
              <button
                onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
                className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title={lang === 'en' ? t('nav.switchToSpanish') : t('nav.switchToEnglish')}
              >
                {lang === 'en' ? 'ES' : 'EN'}
              </button>
              <Link
                href="/signup"
                className="btn-primary px-5 py-2 text-sm"
              >
                {t('nav.startFree')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
