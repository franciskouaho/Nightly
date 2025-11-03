import { useFirebaseAnalytics } from './useFirebaseAnalytics';
import { useGameAnalytics } from './useGameAnalytics';

export const useForbiddenDesireAnalytics = () => {
  const gameAnalytics = useGameAnalytics();
  const analytics = useFirebaseAnalytics();

  const trackIntensityChoice = async (gameId: string, intensity: 'soft' | 'tension' | 'extreme') => {
    await analytics.logEvent('forbidden_desire_intensity_choice', {
      game_id: gameId,
      intensity,
      timestamp: new Date().toISOString(),
    });
  };

  const trackAnswer = async (gameId: string, answered: boolean, intensity: string) => {
    await analytics.logEvent('forbidden_desire_answer', {
      game_id: gameId,
      answered,
      intensity,
      timestamp: new Date().toISOString(),
    });
  };

  const trackChallengeImposed = async (gameId: string, intensity: string) => {
    await analytics.logEvent('forbidden_desire_challenge_imposed', {
      game_id: gameId,
      intensity,
      timestamp: new Date().toISOString(),
    });
  };

  const trackRoundComplete = async (gameId: string, round: number, totalRounds: number) => {
    await analytics.logEvent('forbidden_desire_round_complete', {
      game_id: gameId,
      round,
      total_rounds: totalRounds,
      timestamp: new Date().toISOString(),
    });
  };

  const trackGameComplete = async (gameId: string, totalRounds: number, duration: number) => {
    await gameAnalytics.trackGameEnd(gameId, 0, duration);
    await analytics.logEvent('forbidden_desire_game_complete', {
      game_id: gameId,
      total_rounds: totalRounds,
      duration,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackIntensityChoice,
    trackAnswer,
    trackChallengeImposed,
    trackRoundComplete,
    trackGameComplete,
  };
};
