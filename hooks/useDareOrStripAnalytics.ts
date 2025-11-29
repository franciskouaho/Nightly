import { useCallback } from 'react';
import analytics from '@react-native-firebase/analytics';
import { usePostHog } from './usePostHog';

export function useDareOrStripAnalytics() {
  const { track } = usePostHog();

  const trackGameStart = useCallback(async (gameId: string, playerCount: number) => {
    try {
      await analytics().logEvent('dare_or_strip_game_started', {
        game_id: gameId,
        player_count: playerCount,
        game_type: 'dare-or-strip',
        timestamp: new Date().toISOString(),
      });
      track.custom('dare_or_strip_game_started', {
        game_id: gameId,
        player_count: playerCount,
        game_type: 'dare-or-strip',
      });
    } catch (error) {
      console.error('Error tracking game start:', error);
    }
  }, [track]);

  const trackDareStart = useCallback(async (
    gameId: string,
    questionId: string,
    playerId: string,
    round: number
  ) => {
    try {
      await analytics().logEvent('dare_or_strip_dare_started', {
        game_id: gameId,
        question_id: questionId,
        player_id: playerId,
        round,
        timestamp: new Date().toISOString(),
      });
      track.custom('dare_or_strip_dare_started', {
        game_id: gameId,
        question_id: questionId,
        player_id: playerId,
        round,
      });
    } catch (error) {
      console.error('Error tracking dare start:', error);
    }
  }, [track]);

  const trackDareCompleted = useCallback(async (
    gameId: string,
    playerId: string,
    questionId: string,
    round: number,
    completed: boolean
  ) => {
    try {
      await analytics().logEvent('dare_or_strip_dare_completed', {
        game_id: gameId,
        player_id: playerId,
        question_id: questionId,
        round,
        completed,
        timestamp: new Date().toISOString(),
      });
      track.custom('dare_or_strip_dare_completed', {
        game_id: gameId,
        player_id: playerId,
        question_id: questionId,
        round,
        completed,
      });
    } catch (error) {
      console.error('Error tracking dare completed:', error);
    }
  }, [track]);

  const trackJokerUsed = useCallback(async (
    gameId: string,
    playerId: string,
    round: number
  ) => {
    try {
      await analytics().logEvent('dare_or_strip_joker_used', {
        game_id: gameId,
        player_id: playerId,
        round,
        timestamp: new Date().toISOString(),
      });
      track.custom('dare_or_strip_joker_used', {
        game_id: gameId,
        player_id: playerId,
        round,
      });
    } catch (error) {
      console.error('Error tracking joker used:', error);
    }
  }, [track]);

  const trackRoundComplete = useCallback(async (
    gameId: string,
    round: number,
    totalRounds: number
  ) => {
    try {
      await analytics().logEvent('dare_or_strip_round_complete', {
        game_id: gameId,
        round,
        total_rounds: totalRounds,
        timestamp: new Date().toISOString(),
      });
      track.custom('dare_or_strip_round_complete', {
        game_id: gameId,
        round,
        total_rounds: totalRounds,
      });
    } catch (error) {
      console.error('Error tracking round complete:', error);
    }
  }, [track]);

  const trackGameEnd = useCallback(async (
    gameId: string,
    totalRounds: number,
    duration: number,
    finalScores?: Record<string, number>
  ) => {
    try {
      await analytics().logEvent('dare_or_strip_game_ended', {
        game_id: gameId,
        total_rounds: totalRounds,
        duration_seconds: duration,
        final_scores: finalScores,
        game_type: 'dare-or-strip',
        timestamp: new Date().toISOString(),
      });
      track.gameEnd('dare-or-strip', duration);
      track.custom('dare_or_strip_game_ended', {
        game_id: gameId,
        total_rounds: totalRounds,
        duration_seconds: duration,
        final_scores: finalScores,
      });
    } catch (error) {
      console.error('Error tracking game end:', error);
    }
  }, [track]);

  return {
    trackGameStart,
    trackDareStart,
    trackDareCompleted,
    trackJokerUsed,
    trackRoundComplete,
    trackGameEnd,
  };
}

