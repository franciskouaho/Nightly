"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { changeLanguage as i18nChangeLanguage, getGameContent as getGameContentFromI18n } from '@/app/i18n/i18n';
import i18n from '@/app/i18n/i18n';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';

// Types pour les langues disponibles
export type Language = {
  id: string;
  name: string;
  countryCode: string;
  rtl: boolean;
};

// Liste des langues disponibles
export const LANGUAGES: Language[] = [
  { id: 'fr', name: 'Français', countryCode: 'FR', rtl: false },
  { id: 'en', name: 'English', countryCode: 'US', rtl: false },
  { id: 'es', name: 'Español', countryCode: 'ES', rtl: false },
  { id: 'de', name: 'Deutsch', countryCode: 'DE', rtl: false },
  { id: 'it', name: 'Italiano', countryCode: 'IT', rtl: false },
  { id: 'pt', name: 'Português', countryCode: 'PT', rtl: false },
  { id: 'ar', name: 'العربية', countryCode: 'SA', rtl: true },
];

// Type pour le contexte
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  isRTL: boolean;
  getLanguageByCode: (code: string) => Language | undefined;
  languages: Language[];
  getGameContent: (gameId: string) => Promise<{ rules: any[]; questions: any[] }>;
}

// Création du contexte
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider du contexte
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>('fr'); // Français par défaut
  
  const isRTL = LANGUAGES.find(lang => lang.id === language)?.rtl || false;
  
  // Charger la langue sauvegardée au démarrage
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        console.log('[DEBUG LanguageContext] Starting language load process');
        const savedLanguage = await AsyncStorage.getItem('@app_language');
        console.log('[DEBUG LanguageContext] Saved language from AsyncStorage:', savedLanguage);
        
        if (savedLanguage) {
          console.log('[DEBUG LanguageContext] Using saved language:', savedLanguage);
          setLanguageState(savedLanguage);
          await i18nChangeLanguage(savedLanguage);
        } else {
          console.log('[DEBUG LanguageContext] No saved language found, checking device language');
          const deviceLocale = Localization.locale || Localization.getLocales()?.[0]?.languageCode || 'fr';
          const deviceLanguage = typeof deviceLocale === 'string' ? deviceLocale.split('-')[0] : 'fr';
          console.log('[DEBUG LanguageContext] Device language:', deviceLanguage);
          
          const supportedLanguage = LANGUAGES.find(lang => lang.id === deviceLanguage);
          console.log('[DEBUG LanguageContext] Supported language found:', supportedLanguage);
          
          if (supportedLanguage) {
            console.log('[DEBUG LanguageContext] Setting language to:', supportedLanguage.id);
            setLanguageState(supportedLanguage.id);
            await AsyncStorage.setItem('@app_language', supportedLanguage.id);
            await i18nChangeLanguage(supportedLanguage.id);
          } else {
            console.log('[DEBUG LanguageContext] No supported language found, keeping default (fr)');
          }
        }
      } catch (error) {
        console.error('[DEBUG LanguageContext] Error during language load:', error);
      }
    };
    
    loadLanguage();
  }, []);
  
  // Fonction pour changer de langue
  const setLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem('@app_language', lang);
      await i18nChangeLanguage(lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
      throw error;
    }
  };
  
  // Fonction pour obtenir les infos d'une langue par son code
  const getLanguageByCode = (code: string): Language | undefined => {
    return LANGUAGES.find(lang => lang.id === code);
  };
  
  // Fonction pour récupérer le contenu du jeu dans la langue actuelle
  const getGameContent = async (gameId: string) => {
    const db = getFirestore();
    try {
      const currentLanguage = language || i18n.language || 'fr';
      console.log(`[DEBUG LanguageContext] Fetching game content for ${gameId} in ${currentLanguage}`);
      
      // Récupération des questions du jeu
      const questionsDoc = await getDoc(doc(db, 'gameQuestions', gameId));
      let questions = [];
      
      if (questionsDoc.exists()) {
        const questionsData = questionsDoc.data() || { translations: {} };
        console.log(`[DEBUG LanguageContext] Found questions data for ${gameId}`);
        
        // Essayer d'obtenir les questions dans la langue actuelle, sinon utiliser le français
        questions = questionsData.translations[currentLanguage] || questionsData.translations['fr'] || [];
        
        // Les questions sont transformées avec des IDs par les hooks spécifiques à chaque jeu
        console.log(`[DEBUG LanguageContext] Loaded ${questions.length} questions for ${gameId}`);
      } else {
        console.warn(`[DEBUG LanguageContext] No questions found for game ${gameId}`);
      }
      
      return {
        rules: [],
        questions
      };
    } catch (error) {
      console.error(`[DEBUG LanguageContext] Error fetching content for ${gameId}:`, error);
      return { rules: [], questions: [] };
    }
  };
  
  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        isRTL, 
        getLanguageByCode,
        languages: LANGUAGES,
        getGameContent
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage doit être utilisé à l\'intérieur d\'un LanguageProvider');
  }
  
  return context;
} 