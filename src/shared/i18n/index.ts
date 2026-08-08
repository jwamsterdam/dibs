import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import nlCommon from './locales/nl/common.json';

export const defaultNS = 'common';

const supportedLngs = ['en', 'nl'] as const;

type SupportedLanguage = (typeof supportedLngs)[number];
type TranslationResource = Record<string, unknown>;
type TranslationModule = {
  readonly default: TranslationResource;
};

const lazyNamespaceLoaders = {
  portfolio: {
    en: () => import('./locales/en/portfolio.json') as Promise<TranslationModule>,
    nl: () => import('./locales/nl/portfolio.json') as Promise<TranslationModule>,
  },
} as const satisfies Record<
  string,
  Record<SupportedLanguage, () => Promise<TranslationModule>>
>;

export const resources = {
  en: { common: enCommon },
  nl: { common: nlCommon },
} as const;

export const i18n = i18next.createInstance();

export type LazyNamespace = keyof typeof lazyNamespaceLoaders;

export async function loadNamespace(namespace: LazyNamespace): Promise<void> {
  const loaders = lazyNamespaceLoaders[namespace];

  await Promise.all(
    supportedLngs.map(async (language) => {
      if (i18n.hasResourceBundle(language, namespace)) {
        return;
      }

      const module = await loaders[language]();
      i18n.addResourceBundle(language, namespace, module.default, true, true);
    }),
  );
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs,
    defaultNS,
    interpolation: { escapeValue: false },
  });
