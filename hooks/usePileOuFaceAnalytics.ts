import { useFirebaseAnalytics } from './useFirebaseAnalytics';
import { useGameAnalytics } from './useGameAnalytics';

export const usePileOuFaceAnalytics = () => {
  const gameAnalytics = useGameAnalytics();
  const analytics = useFirebaseAnalytics();

  const trackPlayerSelection = async (gameId: string, selectedPlayerId: string) => {
    await analytics.logEvent('pile_ou_face_player_selection', {
      game_id: gameId,
      selected_player_id: selectedPlayerId,
      timestamp: new Date().toISOString(),
    });
  };

  const trackCoinFlip = async (gameId: string, result: 'pile' | 'face', questionRevealed: boolean) => {
    await analytics.logEvent('pile_ou_face_coin_flip', {
      game_id: gameId,
      result,
      question_revealed: questionRevealed,
      timestamp: new Date().toISOString(),
    });
  };

  const trackQuestionRevealed = async (gameId: string, questionType: string) => {
    await analytics.logEvent('pile_ou_face_question_revealed', {
      game_id: gameId,
      question_type: questionType,
      timestamp: new Date().toISOString(),
    });
  };

  const trackRoundComplete = async (gameId: string, round: number, totalRounds: number) => {
    await analytics.logEvent('pile_ou_face_round_complete', {
      game_id: gameId,
      round,
      total_rounds: totalRounds,
      timestamp: new Date().toISOString(),
    });
  };

  const trackGameComplete = async (gameId: string, totalRounds: number, duration: number) => {
    await gameAnalytics.trackGameEnd(gameId, 0, duration);
    await analytics.logEvent('pile_ou_face_game_complete', {
      game_id: gameId,
      total_rounds: totalRounds,
      duration,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackPlayerSelection,
    trackCoinFlip,
    trackQuestionRevealed,
    trackRoundComplete,
    trackGameComplete,
  };
};
