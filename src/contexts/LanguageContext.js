"use client";
import { createContext, useContext, useState, useCallback } from 'react';
import en from '@/translations/en';
import es from '@/translations/es';

const translations = { en, es };

const LanguageContext = createContext({
  lang: 'en',
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

  const t = useCallback((key) => {
    return translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
