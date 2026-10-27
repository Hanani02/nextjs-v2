'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translations, type Language, type TranslationDictionary } from '@/locales/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof TranslationDictionary, fallback?: string) => string;
  dictionary: TranslationDictionary;
  isId: boolean;
  isEn: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'portfolio-language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default language is 'id' (Bahasa Indonesia) as requested
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === 'id' || saved === 'en') {
        setLanguageState(saved);
        document.documentElement.lang = saved;
      } else {
        localStorage.setItem(STORAGE_KEY, 'id');
        document.documentElement.lang = 'id';
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next: Language = prev === 'id' ? 'en' : 'id';
      try {
        localStorage.setItem(STORAGE_KEY, next);
        document.documentElement.lang = next;
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const dictionary = useMemo(() => {
    return translations[language] || translations.id;
  }, [language]);

  const t = useCallback(
    (key: keyof TranslationDictionary, fallback?: string): string => {
      const dict = translations[language] || translations.id;
      return dict[key] || fallback || key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      dictionary,
      isId: language === 'id',
      isEn: language === 'en',
    }),
    [language, setLanguage, toggleLanguage, t, dictionary]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for components rendered outside LanguageProvider
    const defaultDict = translations.id;
    return {
      language: 'id',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key, fallback) => defaultDict[key] || fallback || key,
      dictionary: defaultDict,
      isId: true,
      isEn: false,
    };
  }
  return context;
}
