import React, { useState, useEffect } from 'react';
import type { SupportedLocale } from './types';
import { I18N_STRINGS } from './translations';
import { getInitialLocale, saveLocale } from './locale';
import { I18nContext } from './context';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => getInitialLocale());

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-Hans';
  }, [locale]);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    saveLocale(newLocale);
  };

  const toggleLocale = () => {
    const next = locale === 'en' ? 'zh-Hans' : 'en';
    setLocale(next);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = I18N_STRINGS[locale] || I18N_STRINGS.en;
    let text = dict[key] || I18N_STRINGS.en[key] || key;

    if (params) {
      for (const [k, val] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(val));
      }
    }

    return text;
  };

  const formatErrorCode = (errorCode?: string, fallbackMessage?: string): string => {
    if (!errorCode) return fallbackMessage || t('err.bad_request');
    const key = `err.${errorCode}`;
    const dict = I18N_STRINGS[locale] || I18N_STRINGS.en;
    if (dict[key]) return dict[key];
    if (I18N_STRINGS.en[key]) return I18N_STRINGS.en[key];
    return fallbackMessage || errorCode;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, toggleLocale, t, formatErrorCode }}>
      {children}
    </I18nContext.Provider>
  );
};
