import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { TrapQuestion } from "@/types/types";
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

// Fonction pour transformer les données de Firebase en format TrapQuestion
const transformQuestion = (question: any, index: number): TrapQuestion => ({
  id: `q_${Date.now()}_${index}`,
  text: question.question,
  theme: question.type,
  roundNumber: 1,
  question: question.question,
  answers: [
    { text: question.answer, isCorrect: true, isTrap: false },
    ...question.traps.map((trap: string) => ({
      text: trap,
      isCorrect: false,
      isTrap: true
    }))
  ].sort(() => Math.random() - 0.5) // Mélanger les réponses ici
});

// Hook personnalisé pour les questions de Trap Answer
export function useTrapAnswerQuestions() {
  const [questions, setQuestions] = useState<TrapQuestion[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<TrapQuestion[]>([]);
  const { isRTL, language } = useLanguage();

  // Charger les questions depuis Firebase
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const db = getFirestore();
        const questionsRef = doc(db, 'gameQuestions', 'trap-answer');
        const questionsDoc = await getDoc(questionsRef);
        
        if (questionsDoc.exists()) {
          const questionsData = questionsDoc.data();
          const currentLanguage = isRTL ? 'ar' : (language || 'fr');
          const rawQuestions = questionsData?.translations?.[currentLanguage] || [];
          
          console.log('[DEBUG] Raw questions from Firebase:', rawQuestions);
          
          // Transformer les questions au format TrapQuestion
          const transformedQuestions = rawQuestions.map(transformQuestion);
          console.log('[DEBUG] Transformed questions:', transformedQuestions);
          
          setQuestions(transformedQuestions);
          setAvailableQuestions([...transformedQuestions].sort(() => Math.random() - 0.5));
        } else {
          console.error('[DEBUG] No questions found in Firebase');
        }
      } catch (error) {
        console.error('[DEBUG] Error loading questions:', error);
      }
    };

    fetchQuestions();
  }, [isRTL, language]);

  // Obtenir une question aléatoire qui n'a pas encore été posée
  const getRandomQuestion = (): TrapQuestion | null => {
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
export const getQuestions = async (currentLanguage: string = 'fr'): Promise<TrapQuestion[]> => {
  try {
    const db = getFirestore();
    const questionsRef = doc(db, 'gameQuestions', 'trap-answer');
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
