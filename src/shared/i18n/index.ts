import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enPortfolio from './locales/en/portfolio.json';
import enZones from './locales/en/zones.json';
import nlCommon from './locales/nl/common.json';
import nlPortfolio from './locales/nl/portfolio.json';
import nlZones from './locales/nl/zones.json';

export const defaultNS = 'common';

export const resources = {
  en: { common: enCommon, portfolio: enPortfolio, zones: enZones },
  nl: { common: nlCommon, portfolio: nlPortfolio, zones: nlZones },
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
