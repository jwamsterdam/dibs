import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enZones from './locales/en/zones.json';
import nlCommon from './locales/nl/common.json';
import nlZones from './locales/nl/zones.json';

export const defaultNS = 'common';

export const resources = {
  en: { common: enCommon, zones: enZones },
  nl: { common: nlCommon, zones: nlZones },
} as const;

export const i18n = i18next.createInstance();

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'nl'],
    defaultNS,
    interpolation: { escapeValue: false },
  });
