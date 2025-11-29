import { useCallback } from 'react';
import analytics from '@react-native-firebase/analytics';
import { usePostHog } from './usePostHog';

export function useTwoLettersOneWordAnalytics() {
  const { track } = usePostHog();

  const trackGameStart = useCallback(async (gameId: string, playerCount: number) => {
    try {
      await analytics().logEvent('two_letters_one_word_game_started', {
        game_id: gameId,
        player_count: playerCount,
        game_type: 'two-letters-one-word',
        timestamp: new Date().toISOString(),
      });
      track.custom('two_letters_one_word_game_started', {
        game_id: gameId,
        player_count: playerCount,
        game_type: 'two-letters-one-word',
      });
    } catch (error) {
      console.error('Error tracking game start:', error);
    }
  }, [track]);

  const trackRoundStart = useCallback(async (
    gameId: string,
    round: number,
    letters: [string, string],
    theme: string
  ) => {
    try {
      await analytics().logEvent('two_letters_one_word_round_started', {
        game_id: gameId,
        round,
        letter1: letters[0],
        letter2: letters[1],
        theme,
        timestamp: new Date().toISOString(),
      });
      track.custom('two_letters_one_word_round_started', {
        game_id: gameId,
        round,
        letter1: letters[0],
        letter2: letters[1],
        theme,
      });
    } catch (error) {
      console.error('Error tracking round start:', error);
    }
  }, [track]);

  const trackWordSubmitted = useCallback(async (
    gameId: string,
    playerId: string,
    word: string,
    round: number,
    letters: [string, string],
    isValid: boolean
  ) => {
    try {
      await analytics().logEvent('two_letters_one_word_word_submitted', {
        game_id: gameId,
        player_id: playerId,
        word,
        round,
        letter1: letters[0],
        letter2: letters[1],
        is_valid: isValid,
        timestamp: new Date().toISOString(),
      });
      track.custom('two_letters_one_word_word_submitted', {
        game_id: gameId,
        player_id: playerId,
        word,
        round,
        letter1: letters[0],
        letter2: letters[1],
        is_valid: isValid,
      });
    } catch (error) {
      console.error('Error tracking word submitted:', error);
    }
  }, [track]);

  const trackDuel = useCallback(async (
    gameId: string,
    player1Id: string,
    player2Id: string,
    round: number,
    winnerId?: string
  ) => {
    try {
      await analytics().logEvent('two_letters_one_word_duel', {
        game_id: gameId,
        player1_id: player1Id,
        player2_id: player2Id,
        round,
        winner_id: winnerId,
        timestamp: new Date().toISOString(),
      });
      track.custom('two_letters_one_word_duel', {
        game_id: gameId,
        player1_id: player1Id,
        player2_id: player2Id,
        round,
        winner_id: winnerId,
      });
    } catch (error) {
      console.error('Error tracking duel:', error);
    }
  }, [track]);

  const trackRoundComplete = useCallback(async (
    gameId: string,
    round: number,
    totalRounds: number,
    wordsCount: number
  ) => {
    try {
      await analytics().logEvent('two_letters_one_word_round_complete', {
        game_id: gameId,
        round,
        total_rounds: totalRounds,
        words_count: wordsCount,
        timestamp: new Date().toISOString(),
      });
      track.custom('two_letters_one_word_round_complete', {
        game_id: gameId,
        round,
        total_rounds: totalRounds,
        words_count: wordsCount,
      });
    } catch (error) {
      console.error('Error tracking round complete:', error);
    }
  }, [track]);

  const trackGameEnd = useCallback(async (
    gameId: string,
    totalRounds: number,
    duration: number,
    finalScores: Record<string, number>,
    winnerId?: string
  ) => {
    try {
      await analytics().logEvent('two_letters_one_word_game_ended', {
        game_id: gameId,
        total_rounds: totalRounds,
        duration_seconds: duration,
        final_scores: finalScores,
        winner_id: winnerId,
        game_type: 'two-letters-one-word',
        timestamp: new Date().toISOString(),
      });
      track.gameEnd('two-letters-one-word', duration, Object.values(finalScores)[0]);
      track.custom('two_letters_one_word_game_ended', {
        game_id: gameId,
        total_rounds: totalRounds,
        duration_seconds: duration,
        final_scores: finalScores,
        winner_id: winnerId,
      });
    } catch (error) {
      console.error('Error tracking game end:', error);
    }
  }, [track]);

  return {
    trackGameStart,
    trackRoundStart,
    trackWordSubmitted,
    trackDuel,
    trackRoundComplete,
    trackGameEnd,
  };
}

