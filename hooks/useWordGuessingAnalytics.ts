import { useCallback } from 'react';
import analytics from '@react-native-firebase/analytics';
import { usePostHog } from './usePostHog';

export function useWordGuessingAnalytics() {
  const { track } = usePostHog();

  const trackGameStart = useCallback(async (gameId: string, playerCount: number) => {
    try {
      await analytics().logEvent('word_guessing_game_started', {
        game_id: gameId,
        player_count: playerCount,
        game_type: 'word-guessing',
        timestamp: new Date().toISOString(),
      });
      track.custom('word_guessing_game_started', {
        game_id: gameId,
        player_count: playerCount,
        game_type: 'word-guessing',
      });
    } catch (error) {
      console.error('Error tracking game start:', error);
    }
  }, [track]);

  const trackQuestionStart = useCallback(async (
    gameId: string,
    questionId: string,
    round: number,
    hint: string
  ) => {
    try {
      await analytics().logEvent('word_guessing_question_started', {
        game_id: gameId,
        question_id: questionId,
        round,
        hint,
        timestamp: new Date().toISOString(),
      });
      track.custom('word_guessing_question_started', {
        game_id: gameId,
        question_id: questionId,
        round,
        hint,
      });
    } catch (error) {
      console.error('Error tracking question start:', error);
    }
  }, [track]);

  const trackGuess = useCallback(async (
    gameId: string,
    playerId: string,
    questionId: string,
    guess: string,
    isCorrect: boolean,
    round: number,
    timeToAnswer: number
  ) => {
    try {
      await analytics().logEvent('word_guessing_guess', {
        game_id: gameId,
        player_id: playerId,
        question_id: questionId,
        guess,
        is_correct: isCorrect,
        round,
        time_to_answer_seconds: timeToAnswer,
        timestamp: new Date().toISOString(),
      });
      track.custom('word_guessing_guess', {
        game_id: gameId,
        player_id: playerId,
        question_id: questionId,
        guess,
        is_correct: isCorrect,
        round,
        time_to_answer_seconds: timeToAnswer,
      });
    } catch (error) {
      console.error('Error tracking guess:', error);
    }
  }, [track]);

  const trackHintUsed = useCallback(async (
    gameId: string,
    playerId: string,
    questionId: string,
    hintType: string
  ) => {
    try {
      await analytics().logEvent('word_guessing_hint_used', {
        game_id: gameId,
        player_id: playerId,
        question_id: questionId,
        hint_type: hintType,
        timestamp: new Date().toISOString(),
      });
      track.custom('word_guessing_hint_used', {
        game_id: gameId,
        player_id: playerId,
        question_id: questionId,
        hint_type: hintType,
      });
    } catch (error) {
      console.error('Error tracking hint used:', error);
    }
  }, [track]);

  const trackRoundComplete = useCallback(async (
    gameId: string,
    round: number,
    totalRounds: number,
    correctGuesses: number
  ) => {
    try {
      await analytics().logEvent('word_guessing_round_complete', {
        game_id: gameId,
        round,
        total_rounds: totalRounds,
        correct_guesses: correctGuesses,
        timestamp: new Date().toISOString(),
      });
      track.custom('word_guessing_round_complete', {
        game_id: gameId,
        round,
        total_rounds: totalRounds,
        correct_guesses: correctGuesses,
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
      await analytics().logEvent('word_guessing_game_ended', {
        game_id: gameId,
        total_rounds: totalRounds,
        duration_seconds: duration,
        final_scores: finalScores,
        winner_id: winnerId,
        game_type: 'word-guessing',
        timestamp: new Date().toISOString(),
      });
      track.gameEnd('word-guessing', duration, Object.values(finalScores)[0]);
      track.custom('word_guessing_game_ended', {
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
    trackQuestionStart,
    trackGuess,
    trackHintUsed,
    trackRoundComplete,
    trackGameEnd,
  };
}

