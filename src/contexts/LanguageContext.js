"use client";
import { createContext, useContext, useState, useCallback } from 'react';
import en from '@/translations/en';
import es from '@/translations/es';

const translations = { en, es };

// Locale used for dates/numbers (Intl / toLocaleDateString) per UI language
const LOCALES = { en: 'en-US', es: 'es' };

const LanguageContext = createContext({
  lang: 'en',
  locale: 'en-US',
  setLang: () => {},
  t: (key) => key,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    try {
      return localStorage.getItem('suretalk-lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = useCallback((code) => {
    setLangState(code);
    try { localStorage.setItem('suretalk-lang', code); } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
    }
  }, []);

  // t('key') or t('key', { count: 3 }) — replaces {count} placeholders in the string
  const t = useCallback((key, vars) => {
    const text = translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
  }, [lang]);

  const locale = LOCALES[lang] || 'en-US';

  return (
    <LanguageContext.Provider value={{ lang, locale, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
