import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { TrapQuestion } from "@/types/types";
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

// Fonction pour transformer les données de Firebase en format TrapQuestion
const transformQuestion = (question: any, index: number): TrapQuestion => ({
  id: `q_${index}`,
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
    })),
  ].sort(() => Math.random() - 0.5), // Mélanger les réponses ici
});

// Hook personnalisé pour les questions de Trap Answer
export function useTrapAnswerQuestions() {
  const [questions, setQuestions] = useState<TrapQuestion[]>([]);
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
          const currentLanguage = isRTL ? 'ar' : language || 'fr';
          const rawQuestions = questionsData?.translations?.[currentLanguage] || [];
          
          console.log('[DEBUG] Raw questions from Firebase:', rawQuestions);
          
          // Transformer les questions au format TrapQuestion
          const transformedQuestions = rawQuestions.map((q: any, i: number) => {
            const transformed = transformQuestion(q, i);
            console.log('[DEBUG] Generated Question ID:', transformed.id);
            return transformed;
          });
          console.log('[DEBUG] Transformed questions:', transformedQuestions);
          
          setQuestions(transformedQuestions);
        } else {
          console.error('[DEBUG] No questions found in Firebase');
        }
      } catch (error) {
        console.error('[DEBUG] Error loading questions:', error);
      }
    };

    fetchQuestions();
  }, [isRTL, language]);

  return {
    questions,
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
