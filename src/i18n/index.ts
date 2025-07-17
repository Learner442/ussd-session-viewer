import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Define translations directly in the config to avoid import issues
const enTranslations = {
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "edit": "Edit",
    "delete": "Delete",
    "add": "Add",
    "search": "Search",
    "filter": "Filter",
    "export": "Export",
    "download": "Download",
    "view": "View",
    "status": "Status",
    "actions": "Actions",
    "yes": "Yes",
    "no": "No",
    "confirm": "Confirm",
    "success": "Success",
    "error": "Error",
    "warning": "Warning",
    "info": "Information"
  },
  "salesAgent": {
    "title": "Sales Agent Module",
    "subtitle": "Performance indicators and transaction-volume-based rewards for sales agents",
    "tabs": {
      "management": "Agent Management",
      "performance": "Performance Table",
      "reporting": "Advanced Reports",
      "commissions": "Commissions",
      "charts": "Charts",
      "performanceManagement": "Performance Mgmt",
      "analytics": "Analytics"
    },
    "metrics": {
      "totalAgents": "Total Agents",
      "totalRevenue": "Total Revenue",
      "totalCommissions": "Total Commissions",
      "activeUsers": "Active Users",
      "conversionRate": "Conversion Rate",
      "averageDealSize": "Average Deal Size"
    },
    "filters": {
      "timePeriod": "Time Period",
      "region": "Region",
      "agentStatus": "Agent Status",
      "userType": "User Type"
    }
  },
  "language": {
    "english": "English",
    "french": "Français",
    "switchTo": "Switch to"
  },
  "reporting": {
    "exportReport": "Export Report"
  }
};

const frTranslations = {
  "common": {
    "loading": "Chargement...",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "edit": "Modifier",
    "delete": "Supprimer",
    "add": "Ajouter",
    "search": "Rechercher",
    "filter": "Filtrer",
    "export": "Exporter",
    "download": "Télécharger",
    "view": "Voir",
    "status": "Statut",
    "actions": "Actions",
    "yes": "Oui",
    "no": "Non",
    "confirm": "Confirmer",
    "success": "Succès",
    "error": "Erreur",
    "warning": "Avertissement",
    "info": "Information"
  },
  "salesAgent": {
    "title": "Module Agent Commercial",
    "subtitle": "Indicateurs de performance et récompenses basées sur le volume des transactions pour les agents commerciaux",
    "tabs": {
      "management": "Gestion des Agents",
      "performance": "Tableau de Performance",
      "reporting": "Rapports Avancés",
      "commissions": "Commissions",
      "charts": "Graphiques",
      "performanceManagement": "Gestion Perf.",
      "analytics": "Analytiques"
    },
    "metrics": {
      "totalAgents": "Total des Agents",
      "totalRevenue": "Chiffre d'Affaires Total",
      "totalCommissions": "Commissions Totales",
      "activeUsers": "Utilisateurs Actifs",
      "conversionRate": "Taux de Conversion",
      "averageDealSize": "Taille Moyenne des Transactions"
    },
    "filters": {
      "timePeriod": "Période",
      "region": "Région",
      "agentStatus": "Statut Agent",
      "userType": "Type d'Utilisateur"
    }
  },
  "language": {
    "english": "English",
    "french": "Français",
    "switchTo": "Passer à"
  },
  "reporting": {
    "exportReport": "Exporter le Rapport"
  }
};

const resources = {
  en: {
    translation: enTranslations
  },
  fr: {
    translation: frTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en', // Set default language explicitly
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false // Disable suspense to avoid loading issues
    }
  });

export default i18n;