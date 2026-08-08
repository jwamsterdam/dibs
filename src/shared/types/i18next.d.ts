import 'i18next';
import type { defaultNS, resources } from '@/shared/i18n';
import type enPortfolio from '@/shared/i18n/locales/en/portfolio.json';

// Type-safe translation keys: missing/misspelled keys become compile errors.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'] & {
      portfolio: typeof enPortfolio;
    };
  }
}
