import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { TrapQuestion } from "@/types/types";
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

// Fonction pour transformer les données de Firebase en format TrapQuestion
const transformQuestion = (question: any, index: number): TrapQuestion => ({
  id: (index + 1).toString(),
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
  ]
});

// Hook personnalisé pour les questions de Trap Answer
export function useTrapAnswerQuestions() {
  const [questions, setQuestions] = useState<TrapQuestion[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
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
          
          // Transformer les questions au format TrapQuestion
          const transformedQuestions = rawQuestions.map(transformQuestion);
          setQuestions(transformedQuestions);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des questions:', error);
      }
    };

    fetchQuestions();
  }, [isRTL, language]);

  // Obtenir une question aléatoire qui n'a pas encore été posée
  const getRandomQuestion = (): TrapQuestion | null => {
    if (questions.length === 0) return null;

    // Si toutes les questions ont été posées, réinitialiser
    if (askedQuestions.length >= questions.length) {
      setAskedQuestions([]);
    }

    // Filtrer les questions non posées
    const availableQuestions = questions.filter((q: TrapQuestion) => !askedQuestions.includes(q.id));
    
    if (availableQuestions.length === 0) return null;

    // Sélectionner une question aléatoire
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];

    if (!selectedQuestion) return null;

    // Ajouter la question à la liste des questions posées
    setAskedQuestions((prev: string[]) => [...prev, selectedQuestion.id]);

    return selectedQuestion;
  };

  // Réinitialiser l'historique des questions posées
  const resetAskedQuestions = () => {
    setAskedQuestions([]);
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
