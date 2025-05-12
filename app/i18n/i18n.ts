import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import des traductions
import fr from './locales/fr';
import en from './locales/en';
import es from './locales/es';
import de from './locales/de';
import it from './locales/it';
import pt from './locales/pt';
import ar from './locales/ar';

const resources = {
  fr: {
    translation: fr,
  },
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  de: {
    translation: de,
  },
  it: {
    translation: it,
  },
  pt: {
    translation: pt,
  },
  ar: {
    translation: ar,
  },
};

// Fonction pour initialiser i18n
const initI18n = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('@app_language');
    const deviceLanguage = Localization.locale.split('-')[0];
    const initialLanguage = savedLanguage || deviceLanguage;

    await i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: initialLanguage,
        fallbackLng: 'fr',
        interpolation: {
          escapeValue: false,
        },
      });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de i18n:', error);
  }
};

// Initialiser i18n
initI18n();

// Fonction pour changer la langue
export const changeLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem('@app_language', language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Erreur lors du changement de langue:', error);
    throw error;
  }
};

// Fonction pour récupérer la langue sauvegardée
export const getSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('@app_language');
    if (savedLanguage) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la langue:', error);
  }
};

export default i18n; 