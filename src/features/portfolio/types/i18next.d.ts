import type enPortfolio from '@/shared/i18n/locales/en/portfolio.json';

declare module '@/shared/types/i18next' {
  interface I18nResources {
    portfolio: typeof enPortfolio;
  }
}
