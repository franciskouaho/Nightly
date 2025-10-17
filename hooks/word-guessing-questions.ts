import { Question } from '@/types/gameTypes';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface WordGuessingQuestion extends Question {
  word: string;
  forbiddenWords: string[];
  category: string;
  translations: {
    [key: string]: {
      word: string;
      forbiddenWords: string[];
    };
  };
}

// Fonction pour transformer les données de Firebase en format Question
export const transformQuestion = (question: any, index: number): WordGuessingQuestion => ({
  id: (index + 1).toString(),
  text: question.question || question.word,
  theme: question.type || question.category,
  roundNumber: index + 1,
  word: question.question || question.word,
  forbiddenWords: question.traps || question.forbiddenWords || [],
  category: question.type || question.category,
  translations: {}
});

// Hook personnalisé pour les questions de Word Guessing
export function useWordGuessingQuestions() {
  const [questions, setQuestions] = useState<WordGuessingQuestion[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<WordGuessingQuestion[]>([]);
  const { getGameContent, language } = useLanguage();

  // Charger les questions via getGameContent du LanguageContext
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log(`[DEBUG useWordGuessingQuestions] Fetching questions for word-guessing in ${language}`);
        const gameContent = await getGameContent('word-guessing');
        const rawQuestions = gameContent.questions;

        console.log('[DEBUG] Raw questions from getGameContent:', rawQuestions);

        const transformedQuestions = rawQuestions.map(transformQuestion);
        console.log('[DEBUG] Transformed questions (from useWordGuessingQuestions):', transformedQuestions);

        setQuestions(transformedQuestions);
        setAvailableQuestions([...transformedQuestions].sort(() => Math.random() - 0.5));
      } catch (error) {
        console.error('[DEBUG] Error loading questions in useWordGuessingQuestions:', error);
      }
    };

    fetchQuestions();
  }, [getGameContent, language]);

  // Obtenir une question aléatoire qui n'a pas encore été posée
  const getRandomQuestion = (): WordGuessingQuestion | null => {
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
export const getQuestions = async (currentLanguage: string = 'fr'): Promise<WordGuessingQuestion[]> => {
  try {
    const db = getFirestore();
    const questionsRef = doc(db, 'gameQuestions', 'word-guessing');
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