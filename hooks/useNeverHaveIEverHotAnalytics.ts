import { useFirebaseAnalytics } from './useFirebaseAnalytics';

export const useNeverHaveIEverHotAnalytics = () => {
  const analytics = useFirebaseAnalytics();

  const trackQuestionStart = async (gameId: string, questionId: string) => {
    await analytics.logEvent('never_have_i_ever_question_start', {
      game_id: gameId,
      question_id: questionId,
      timestamp: new Date().toISOString(),
    });
  };

  const trackPlayerResponse = async (gameId: string, playerId: string, response: 'yes' | 'no') => {
    await analytics.logEvent('never_have_i_ever_response', {
      game_id: gameId,
      player_id: playerId,
      response,
      timestamp: new Date().toISOString(),
    });
  };

  const trackRoundComplete = async (gameId: string, round: number, totalRounds: number, responses: { yes: number, no: number }) => {
    await analytics.logEvent('never_have_i_ever_round_complete', {
      game_id: gameId,
      round,
      total_rounds: totalRounds,
      yes_responses: responses.yes,
      no_responses: responses.no,
      timestamp: new Date().toISOString(),
    });
  };

  const trackGameComplete = async (gameId: string, totalRounds: number, duration: number) => {
    await analytics.logEvent('never_have_i_ever_game_complete', {
      game_id: gameId,
      total_rounds: totalRounds,
      duration,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackQuestionStart,
    trackPlayerResponse,
    trackRoundComplete,
    trackGameComplete,
  };
}; 