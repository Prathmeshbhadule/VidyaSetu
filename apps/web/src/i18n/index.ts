import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations, SupportedLanguage } from '@vidya-setu/shared';

const savedLang =
  (typeof localStorage !== 'undefined'
    ? (localStorage.getItem('vidya_language') as SupportedLanguage)
    : null) || 'hi';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translations.en },
    hi: { translation: translations.hi },
    mr: { translation: translations.mr },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export function setLanguage(lang: SupportedLanguage) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('vidya_language', lang);
  }
  i18n.changeLanguage(lang);
}

export default i18n;
