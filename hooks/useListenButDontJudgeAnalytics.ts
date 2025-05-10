import { useFirebaseAnalytics } from './useFirebaseAnalytics';

export const useListenButDontJudgeAnalytics = () => {
  const analytics = useFirebaseAnalytics();

  const trackStoryStart = async (gameId: string, playerId: string) => {
    await analytics.logEvent('listen_story_start', {
      game_id: gameId,
      player_id: playerId,
      timestamp: new Date().toISOString(),
    });
  };

  const trackStoryEnd = async (gameId: string, playerId: string, duration: number) => {
    await analytics.logEvent('listen_story_end', {
      game_id: gameId,
      player_id: playerId,
      duration,
      timestamp: new Date().toISOString(),
    });
  };

  const trackVote = async (gameId: string, voterId: string, votedPlayerId: string, vote: 'yes' | 'no') => {
    await analytics.logEvent('listen_vote', {
      game_id: gameId,
      voter_id: voterId,
      voted_player_id: votedPlayerId,
      vote,
      timestamp: new Date().toISOString(),
    });
  };

  const trackRoundComplete = async (gameId: string, round: number, totalRounds: number) => {
    await analytics.logEvent('listen_round_complete', {
      game_id: gameId,
      round,
      total_rounds: totalRounds,
      timestamp: new Date().toISOString(),
    });
  };

  const trackGameComplete = async (gameId: string, totalRounds: number, duration: number) => {
    await analytics.logEvent('listen_game_complete', {
      game_id: gameId,
      total_rounds: totalRounds,
      duration,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackStoryStart,
    trackStoryEnd,
    trackVote,
    trackRoundComplete,
    trackGameComplete,
  };
}; 