import type { SupportedLocale } from './types';

export const LOCALE_STORAGE_KEY = 'loong_locale';

/**
 * 遵循 SPEC_I18N 铁律：未手动设定过语言时，默认一律为英语 ('en')
 */
export function getInitialLocale(): SupportedLocale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === 'zh-Hans' || saved === 'zh') {
      return 'zh-Hans';
    }
  } catch {
    // ignore
  }
  return 'en';
}

export function saveLocale(locale: SupportedLocale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
  document.documentElement.lang = locale === 'en' ? 'en' : 'zh-Hans';
}
