import { useFirebaseAnalytics } from './useFirebaseAnalytics';

export const useGameAnalytics = () => {
  const analytics = useFirebaseAnalytics();

  const trackGameStart = async (gameId: string, gameType: string) => {
    await analytics.logEvent('game_start', {
      game_id: gameId,
      game_type: gameType,
      timestamp: new Date().toISOString(),
    });
  };

  const trackGameEnd = async (gameId: string, score: number, duration: number) => {
    await analytics.logEvent('game_end', {
      game_id: gameId,
      score,
      duration,
      timestamp: new Date().toISOString(),
    });
  };

  const trackQuestionAnswered = async (gameId: string, questionId: string, isCorrect: boolean) => {
    await analytics.logEvent('question_answered', {
      game_id: gameId,
      question_id: questionId,
      is_correct: isCorrect,
      timestamp: new Date().toISOString(),
    });
  };

  const trackLevelProgress = async (level: number, score: number) => {
    await analytics.logLevelUp(level);
    await analytics.logEvent('level_progress', {
      level,
      score,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackGameStart,
    trackGameEnd,
    trackQuestionAnswered,
    trackLevelProgress,
  };
}; 