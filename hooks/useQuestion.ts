import { useState, useCallback } from 'react';
import { Question, GameType, Theme } from '@/types/game';
import { gameService } from '@/services/gameService';

interface UseQuestionProps {
  gameType: GameType;
  theme?: Theme;
  gameId?: number;
}

export const useQuestion = ({ gameType, theme = 'standard', gameId }: UseQuestionProps) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let question;
      if (gameId) {
        // Si on a un gameId, on récupère la question courante du jeu
        const response = await gameService.getCurrentQuestion(gameId);
        question = response.question;
      } else {
        // Sinon, on récupère une question aléatoire du type spécifié
        const response = await gameService.getGamesByType(gameType);
        question = response.questions[0]; // Prendre la première question pour l'exemple
      }

      setCurrentQuestion(question);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors de la récupération de la question:', err);
    } finally {
      setLoading(false);
    }
  }, [gameType, theme, gameId]);

  const skipQuestion = useCallback(() => {
    if (gameId) {
      // Si on a un gameId, on passe à la question suivante dans le jeu
      gameService.nextQuestion(gameId)
        .then(response => setCurrentQuestion(response.question))
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Une erreur est survenue');
          console.error('Erreur lors du passage à la question suivante:', err);
        });
    } else {
      // Sinon, on récupère simplement une nouvelle question
      fetchQuestion();
    }
  }, [gameId, fetchQuestion]);

  return {
    currentQuestion,
    loading,
    error,
    fetchQuestion,
    skipQuestion,
  };
}; 