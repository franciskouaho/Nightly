import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Question } from '@/types/gameTypes'; // Assuming Question interface is imported from types

interface GameQuestionsData {
  [key: string]: Question[];
}

export function useRandomQuestions(gameMode: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Get translation functions and i18n instance
  const { t, i18n } = useTranslation();
  // Get custom language context for game content
  const languageContext = useLanguage();

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
      if (!languageContext || !languageContext.getGameContent) {
        console.error("Language context or getGameContent not available in useRandomQuestions");
        setQuestions([]);
        setIsLoadingQuestions(false);
        return;
      }

      try {
        const gameContent = await languageContext.getGameContent(gameMode);
        if (gameContent && gameContent.questions && gameContent.questions.length > 0) {
          console.log('[DEBUG useRandomQuestions] Questions fetched:', gameContent.questions.length);
          console.log('[DEBUG useRandomQuestions] Fetched question IDs:', gameContent.questions.map(q => q.id));
          setQuestions(gameContent.questions);
          
          // Ne pas réinitialiser askedQuestions ici, on le fera uniquement quand le jeu le demande explicitement
          // via resetAskedQuestions
        } else {
          console.warn(`[DEBUG useRandomQuestions] No questions found for game mode: ${gameMode}`);
          setQuestions([]);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestions([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [gameMode, languageContext]);

  const getRandomQuestion = useCallback((): Question | null => {
    console.log('[DEBUG useRandomQuestions] getRandomQuestion called');
    console.log('[DEBUG useRandomQuestions] Current questions count:', questions.length);
    console.log('[DEBUG useRandomQuestions] Asked questions count:', askedQuestions.length);
    console.log('[DEBUG useRandomQuestions] Asked question IDs:', askedQuestions);

    if (questions.length === 0) {
      console.warn("[DEBUG useRandomQuestions] No questions available to get random question");
      return null;
    }

    // Si toutes les questions ont été posées, on réinitialise la liste
    if (askedQuestions.length >= questions.length) {
      console.log('[DEBUG useRandomQuestions] All questions have been asked, resetting askedQuestions');
      setAskedQuestions([]);
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      return randomQuestion || null;
    }

    const availableQuestions = questions.filter(q => !askedQuestions.includes(q.id));
    console.log('[DEBUG useRandomQuestions] Available questions count:', availableQuestions.length);

    if (availableQuestions.length === 0) {
      console.warn("[DEBUG useRandomQuestions] No available questions found");
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];

    if (selectedQuestion) {
      console.log('[DEBUG useRandomQuestions] Selected question id:', selectedQuestion.id);
      setAskedQuestions(prev => {
        const newAsked = [...prev, selectedQuestion.id];
        console.log('[DEBUG useRandomQuestions] Added ID to askedQuestions:', selectedQuestion.id);
        console.log('[DEBUG useRandomQuestions] New askedQuestions array:', newAsked);
        return newAsked;
      });
      return selectedQuestion;
    } else {
      console.error("[DEBUG useRandomQuestions] Selected question is undefined unexpectedly");
      return null;
    }
  }, [questions, askedQuestions]);

  const resetAskedQuestions = useCallback(() => {
    console.log('[DEBUG useRandomQuestions] resetAskedQuestions called');
    setAskedQuestions([]);
  }, []);

  return {
    questions,
    getRandomQuestion,
    resetAskedQuestions,
    isLoadingQuestions
  };
} 