import { useCallback } from 'react';
import analytics from '@react-native-firebase/analytics';
import { usePostHog } from './usePostHog';

export function useTrapAnswerAnalytics() {
  const { track } = usePostHog();

  const trackGameStart = useCallback(async (gameId: string, playerCount: number) => {
    try {
      await analytics().logEvent('trap_answer_game_started', {
        game_id: gameId,
        player_count: playerCount,
        game_type: 'trap-answer',
        timestamp: new Date().toISOString(),
      });
      track.custom('trap_answer_game_started', {
        game_id: gameId,
        player_count: playerCount,
        game_type: 'trap-answer',
      });
    } catch (error) {
      console.error('Error tracking game start:', error);
    }
  }, [track]);

  const trackQuestionStart = useCallback(async (
    gameId: string,
    questionId: string,
    round: number,
    targetPlayerId?: string
  ) => {
    try {
      await analytics().logEvent('trap_answer_question_started', {
        game_id: gameId,
        question_id: questionId,
        round,
        target_player_id: targetPlayerId,
        timestamp: new Date().toISOString(),
      });
      track.custom('trap_answer_question_started', {
        game_id: gameId,
        question_id: questionId,
        round,
        target_player_id: targetPlayerId,
      });
    } catch (error) {
      console.error('Error tracking question start:', error);
    }
  }, [track]);

  const trackAnswer = useCallback(async (
    gameId: string,
    playerId: string,
    questionId: string,
    isCorrect: boolean,
    answerText: string,
    round: number,
    isTrap: boolean
  ) => {
    try {
      await analytics().logEvent('trap_answer_answer', {
        game_id: gameId,
        player_id: playerId,
        question_id: questionId,
        is_correct: isCorrect,
        is_trap: isTrap,
        answer_text: answerText,
        round,
        timestamp: new Date().toISOString(),
      });
      track.custom('trap_answer_answer', {
        game_id: gameId,
        player_id: playerId,
        question_id: questionId,
        is_correct: isCorrect,
        is_trap: isTrap,
        answer_text: answerText,
        round,
      });
    } catch (error) {
      console.error('Error tracking answer:', error);
    }
  }, [track]);

  const trackRoundComplete = useCallback(async (
    gameId: string,
    round: number,
    totalRounds: number,
    correctAnswers: number,
    trapAnswers: number
  ) => {
    try {
      await analytics().logEvent('trap_answer_round_complete', {
        game_id: gameId,
        round,
        total_rounds: totalRounds,
        correct_answers: correctAnswers,
        trap_answers: trapAnswers,
        timestamp: new Date().toISOString(),
      });
      track.custom('trap_answer_round_complete', {
        game_id: gameId,
        round,
        total_rounds: totalRounds,
        correct_answers: correctAnswers,
        trap_answers: trapAnswers,
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
      await analytics().logEvent('trap_answer_game_ended', {
        game_id: gameId,
        total_rounds: totalRounds,
        duration_seconds: duration,
        final_scores: finalScores,
        winner_id: winnerId,
        game_type: 'trap-answer',
        timestamp: new Date().toISOString(),
      });
      track.gameEnd('trap-answer', duration, Object.values(finalScores)[0]);
      track.custom('trap_answer_game_ended', {
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
    trackAnswer,
    trackRoundComplete,
    trackGameEnd,
  };
}

