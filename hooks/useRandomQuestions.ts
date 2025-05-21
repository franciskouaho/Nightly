import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';

interface Question {
  id?: string;
  text?: string;
  question?: string;
  answer?: string;
  type?: string;
  theme?: string;
}

export function useRandomQuestions(gameType: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const { isRTL, i18n } = useLanguage();

  // Charger les questions depuis Firebase
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const db = getFirestore();
        const questionsRef = doc(db, 'gameQuestions', gameType);
        const questionsDoc = await getDoc(questionsRef);
        
        if (questionsDoc.exists()) {
          const questionsData = questionsDoc.data();
          const currentLanguage = isRTL ? 'ar' : (i18n.language || 'fr');
          const questions = questionsData?.translations?.[currentLanguage] || [];
          setQuestions(questions);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des questions:', error);
      }
    };

    fetchQuestions();
  }, [gameType, isRTL, i18n.language]);

  // Obtenir une question aléatoire qui n'a pas encore été posée
  const getRandomQuestion = (): Question | null => {
    if (questions.length === 0) return null;

    // Si toutes les questions ont été posées, réinitialiser
    if (askedQuestions.length >= questions.length) {
      setAskedQuestions([]);
    }

    // Filtrer les questions non posées
    const availableQuestions = questions.filter(q => !askedQuestions.includes(q.id || ''));
    
    if (availableQuestions.length === 0) return null;

    // Sélectionner une question aléatoire
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];

    // Ajouter la question à la liste des questions posées
    if (selectedQuestion.id) {
      setAskedQuestions(prev => [...prev, selectedQuestion.id!]);
    }

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