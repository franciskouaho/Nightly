import { useGameAnalytics } from './useGameAnalytics';

export const useTruthOrDareAnalytics = () => {
  const gameAnalytics = useGameAnalytics();

  const trackChoice = async (gameId: string, choice: 'verite' | 'action') => {
    await gameAnalytics.logEvent('truth_or_dare_choice', {
      game_id: gameId,
      choice,
      timestamp: new Date().toISOString(),
    });
  };

  const trackVote = async (gameId: string, vote: 'yes' | 'no', playerId: string) => {
    await gameAnalytics.logEvent('truth_or_dare_vote', {
      game_id: gameId,
      vote,
      player_id: playerId,
      timestamp: new Date().toISOString(),
    });
  };

  const trackRoundComplete = async (gameId: string, round: number, totalRounds: number) => {
    await gameAnalytics.logEvent('truth_or_dare_round_complete', {
      game_id: gameId,
      round,
      total_rounds: totalRounds,
      timestamp: new Date().toISOString(),
    });
  };

  const trackGameComplete = async (gameId: string, totalRounds: number, duration: number) => {
    await gameAnalytics.trackGameEnd(gameId, 0, duration);
    await gameAnalytics.logEvent('truth_or_dare_game_complete', {
      game_id: gameId,
      total_rounds: totalRounds,
      duration,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackChoice,
    trackVote,
    trackRoundComplete,
    trackGameComplete,
  };
}; 