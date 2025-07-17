import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enAuth from './locales/en/auth.json';
import enAgent from './locales/en/agent.json';
import enSales from './locales/en/sales.json';
import enReports from './locales/en/reports.json';

import frCommon from './locales/fr/common.json';
import frDashboard from './locales/fr/dashboard.json';
import frAuth from './locales/fr/auth.json';
import frAgent from './locales/fr/agent.json';
import frSales from './locales/fr/sales.json';
import frReports from './locales/fr/reports.json';

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    auth: enAuth,
    agent: enAgent,
    sales: enSales,
    reports: enReports,
  },
  fr: {
    common: frCommon,
    dashboard: frDashboard,
    auth: frAuth,
    agent: frAgent,
    sales: frSales,
    reports: frReports,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: true,
    },
  });

// Update HTML lang attribute when language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;