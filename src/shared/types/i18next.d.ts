import 'i18next';
import type { defaultNS } from '@/shared/i18n';
import type enCommon from '@/shared/i18n/locales/en/common.json';

export interface I18nResources {
  common: typeof enCommon;
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: I18nResources;
  }
}
