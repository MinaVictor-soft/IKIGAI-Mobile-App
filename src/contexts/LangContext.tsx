import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import { translations, Lang } from '../i18n/translations';

interface LangContextType {
  lang: Lang;
  isRTL: boolean;
  t: (key: string) => string;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextType | null>(null);

const LANG_KEY = 'ikigai_lang';

// Platform-safe storage for language preference
async function getLangPref(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.localStorage.getItem(LANG_KEY) : null;
  }
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return AsyncStorage.getItem(LANG_KEY);
}

async function setLangPref(lang: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem(LANG_KEY, lang);
    return;
  }
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  await AsyncStorage.setItem(LANG_KEY, lang);
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar'); // Arabic default

  useEffect(() => {
    // Load saved language preference
    getLangPref().then((saved) => {
      if (saved === 'en' || saved === 'ar') {
        setLangState(saved);
        applyRTL(saved);
      } else {
        applyRTL('ar');
      }
    });
  }, []);

  const applyRTL = (language: Lang) => {
    const shouldBeRTL = language === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
  };

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    setLangPref(newLang);
    applyRTL(newLang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[lang][key] || translations['en'][key] || key;
    },
    [lang]
  );

  const isRTL = lang === 'ar';

  return (
    <LangContext.Provider value={{ lang, isRTL, t, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within LangProvider');
  }
  return context;
}
