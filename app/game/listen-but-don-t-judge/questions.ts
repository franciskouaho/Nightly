import { Question } from '@/types/gameTypes';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Fonction pour transformer les données de Firebase en format Question
// Accepte soit un objet (pour des structures futures) soit une chaîne (pour la structure actuelle)
const transformQuestion = (questionData: any, index: number): Question => {
  if (typeof questionData === 'string') {
    // Si c'est une chaîne, utilisez-la comme texte
    return {
      id: (index + 1).toString(), // Générer un ID basé sur l'index si pas d'ID
      text: questionData,
      theme: 'general', // Thème par défaut pour les questions en chaîne
      roundNumber: index + 1, // Numéro de round basé sur l'index si pas de numéro
    };
  } else if (typeof questionData === 'object' && questionData !== null) {
    // Si c'est un objet, essayez d'extraire les propriétés
    return {
      id: questionData.id ? String(questionData.id) : (index + 1).toString(),
      text: questionData.text || 'Aucun texte disponible', // Utilisez la propriété text
      theme: questionData.type || questionData.theme || 'general', // Utilisez type ou theme
      roundNumber: questionData.roundNumber !== undefined ? questionData.roundNumber : index + 1,
    };
  } else {
    // Cas inattendu
     console.warn('Format de question inattendu:', questionData);
     return {
        id: (index + 1).toString(),
        text: 'Aucun texte disponible - Format invalide',
        theme: 'error',
        roundNumber: index + 1
     };
  }
};

// Hook personnalisé pour les questions de Listen But Don't Judge
export function useListenButDontJudgeQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const { isRTL, language } = useLanguage();

  // Charger les questions depuis Firebase
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const db = getFirestore();
        const questionsRef = doc(db, 'gameQuestions', 'listen-but-don-t-judge');
        const questionsDoc = await getDoc(questionsRef);
        
        if (questionsDoc.exists()) {
          const questionsData = questionsDoc.data();
          const currentLanguage = isRTL ? 'ar' : (language || 'fr');
          const rawQuestionsArray = questionsData?.translations?.[currentLanguage];
          let transformedQuestions: Question[] = [];
          if (Array.isArray(rawQuestionsArray)) {
            transformedQuestions = rawQuestionsArray.map((q: any, index: number) => transformQuestion(q, index));
          }
          
          // Transformer les questions au format Question
          setQuestions(transformedQuestions);
          setAvailableQuestions(transformedQuestions);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des questions:', error);
      }
    };

    fetchQuestions();
  }, [isRTL, language]);

  // Obtenir une question aléatoire qui n'a pas encore été posée
  const getRandomQuestion = (): Question | null => {
    if (availableQuestions.length === 0) {
      // Si toutes les questions ont été posées, réinitialiser avec toutes les questions mélangées
      const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
      setAvailableQuestions(shuffledQuestions);
      setAskedQuestions([]);
      // Tenter de prendre une question de la liste nouvellement mélangée
      const randomIndex = Math.floor(Math.random() * shuffledQuestions.length);
      const selectedQuestion = shuffledQuestions[randomIndex];
      if (!selectedQuestion) return null; // Safety check

      // Ajouter la question à la liste des questions posées
      setAskedQuestions((prev: string[]) => [...prev, selectedQuestion.id]);
      return selectedQuestion;
    }

    // Sélectionner une question aléatoire parmi les questions disponibles
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];

    if (!selectedQuestion) return null;

    // Retirer la question sélectionnée des questions disponibles
    const newAvailableQuestions = availableQuestions.filter((_, index) => index !== randomIndex);
    setAvailableQuestions(newAvailableQuestions);

    // Ajouter la question à la liste des questions posées
    setAskedQuestions((prev: string[]) => [...prev, selectedQuestion.id]);

    return selectedQuestion;
  };

  // Réinitialiser l'historique des questions posées et mélanger à nouveau
  const resetAskedQuestions = () => {
    setAskedQuestions([]);
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    setAvailableQuestions(shuffledQuestions);
  };

  return {
    questions,
    getRandomQuestion,
    resetAskedQuestions,
    askedQuestions
  };
}

// Fonction de compatibilité pour le code existant
export const getQuestions = async (currentLanguage: string = 'fr'): Promise<Question[]> => {
  try {
    const db = getFirestore();
    const questionsRef = doc(db, 'gameQuestions', 'listen-but-don-t-judge');
    const questionsDoc = await getDoc(questionsRef);

    if (questionsDoc.exists()) {
      const questionsData = questionsDoc.data();
      const rawQuestionsArray = questionsData?.translations?.[currentLanguage];
      if (Array.isArray(rawQuestionsArray)) {
        // Utiliser transformQuestion pour chaque élément du tableau
        return rawQuestionsArray.map((q: any, index: number) => transformQuestion(q, index));
      } else {
         console.error("No questions array found for language", currentLanguage);
        return [];
      }
    } else {
      console.error("No questions found in Firebase");
      return [];
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
}; 