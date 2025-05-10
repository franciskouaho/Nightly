import { useFirebaseAnalytics } from './useFirebaseAnalytics';

export const useGeniusOrLiarAnalytics = () => {
  const analytics = useFirebaseAnalytics();

  const trackQuestionStart = async (gameId: string, playerId: string, questionId: string) => {
    await analytics.logEvent('genius_question_start', {
      game_id: gameId,
      player_id: playerId,
      question_id: questionId,
      timestamp: new Date().toISOString(),
    });
  };

  const trackAnswer = async (gameId: string, playerId: string, answer: string) => {
    await analytics.logEvent('genius_answer', {
      game_id: gameId,
      player_id: playerId,
      answer,
      timestamp: new Date().toISOString(),
    });
  };

  const trackVote = async (gameId: string, voterId: string, votedPlayerId: string, vote: 'genius' | 'liar') => {
    await analytics.logEvent('genius_vote', {
      game_id: gameId,
      voter_id: voterId,
      voted_player_id: votedPlayerId,
      vote,
      timestamp: new Date().toISOString(),
    });
  };

  const trackRoundComplete = async (gameId: string, round: number, totalRounds: number, wasCorrect: boolean) => {
    await analytics.logEvent('genius_round_complete', {
      game_id: gameId,
      round,
      total_rounds: totalRounds,
      was_correct: wasCorrect,
      timestamp: new Date().toISOString(),
    });
  };

  const trackGameComplete = async (gameId: string, totalRounds: number, duration: number, finalScore: number) => {
    await analytics.logEvent('genius_game_complete', {
      game_id: gameId,
      total_rounds: totalRounds,
      duration,
      final_score: finalScore,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackQuestionStart,
    trackAnswer,
    trackVote,
    trackRoundComplete,
    trackGameComplete,
  };
}; 