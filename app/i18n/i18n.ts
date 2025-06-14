import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';

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

// Initialiser i18n
i18n.use(initReactI18next).init({
  resources,
  lng: 'fr', // La langue par défaut sera remplacée par LanguageContext
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
  },
  debug: true,
});

// Fonction pour changer la langue (utilisée par LanguageContext)
export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Erreur lors du changement de langue:', error);
    throw error;
  }
};

// Fonction pour récupérer le contenu d'un jeu dans la langue actuelle
export const getGameContent = async (gameId: string) => {
  try {
    const currentLanguage = i18n.language || 'fr';
    const db = getFirestore();
    
    // Récupération des règles du jeu
    const rulesDoc = await getDoc(doc(db, 'rules', gameId));
    let rules = [];
    
    if (rulesDoc.exists()) {
      const rulesData = rulesDoc.data() || { translations: {} };
      // Essayer d'obtenir les règles dans la langue actuelle, sinon utiliser le français
      rules = rulesData.translations[currentLanguage]?.rules || rulesData.translations['fr']?.rules || [];
    }
    
    // Récupération des questions du jeu
    const questionsDoc = await getDoc(doc(db, 'gameQuestions', gameId));
    let questions = [];
    
    if (questionsDoc.exists()) {
      const questionsData = questionsDoc.data() || { translations: {} };
      // Essayer d'obtenir les questions dans la langue actuelle, sinon utiliser le français
      questions = questionsData.translations[currentLanguage] || questionsData.translations['fr'] || [];
    }
    
    return {
      rules,
      questions
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération du contenu pour ${gameId}:`, error);
    return { rules: [], questions: [] };
  }
};

export default i18n; 