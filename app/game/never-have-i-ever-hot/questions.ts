import { Question } from '@/types/gameTypes';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Fonction pour transformer les données de Firebase en format Question
const transformQuestion = (question: any, index: number): Question => ({
  id: (index + 1).toString(),
  text: question.text,
  theme: question.type,
  roundNumber: index + 1
});

// Hook personnalisé pour les questions de Never Have I Ever Hot
export function useNeverHaveIEverHotQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const { isRTL, language } = useLanguage();

  // Charger les questions depuis Firebase
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const db = getFirestore();
        const questionsRef = doc(db, 'gameQuestions', 'never-have-i-ever-hot');
        const questionsDoc = await getDoc(questionsRef);
        
        if (questionsDoc.exists()) {
          const questionsData = questionsDoc.data();
          const currentLanguage = isRTL ? 'ar' : (language || 'fr');
          const rawQuestions = questionsData?.translations?.[currentLanguage] || [];
          
          // Transformer les questions au format Question
          const transformedQuestions = rawQuestions.map(transformQuestion);
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
    const questionsRef = doc(db, 'gameQuestions', 'never-have-i-ever-hot');
    const questionsDoc = await getDoc(questionsRef);

    if (questionsDoc.exists()) {
      const questionsData = questionsDoc.data();
      const rawQuestions = questionsData?.translations?.[currentLanguage] || [];
      return rawQuestions.map(transformQuestion);
    } else {
      console.error("No questions found in Firebase");
      return [];
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
}; 