import { useCallback } from 'react';
import analytics from '@react-native-firebase/analytics';
import { usePostHog } from './usePostHog';

export function useBlindTestAnalytics() {
  const { track } = usePostHog();

  // Firebase Analytics - Démarrage du jeu
  const trackGameStart = useCallback(async (gameId: string, playerCount: number) => {
    try {
      await analytics().logEvent('blindtest_game_started', {
        game_id: gameId,
        player_count: playerCount,
        game_type: 'blindtest-generations',
        timestamp: new Date().toISOString(),
      });
      // PostHog
      track.custom('blindtest_game_started', {
        game_id: gameId,
        player_count: playerCount,
        game_type: 'blindtest-generations',
      });
    } catch (error) {
      console.error('Error tracking game start:', error);
    }
  }, [track]);

  // Firebase Analytics - Sélection de catégorie
  const trackCategorySelected = useCallback(async (
    gameId: string,
    categoryId: string,
    categoryLabel: string,
    userId: string
  ) => {
    try {
      await analytics().logEvent('blindtest_category_selected', {
        game_id: gameId,
        category_id: categoryId,
        category_label: categoryLabel,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
      // PostHog
      track.custom('blindtest_category_selected', {
        game_id: gameId,
        category_id: categoryId,
        category_label: categoryLabel,
        user_id: userId,
      });
    } catch (error) {
      console.error('Error tracking category selection:', error);
    }
  }, [track]);

  // Firebase Analytics - Question démarrée (audio joué)
  const trackQuestionStart = useCallback(async (
    gameId: string,
    questionId: string,
    categoryId: string,
    round: number
  ) => {
    try {
      await analytics().logEvent('blindtest_question_started', {
        game_id: gameId,
        question_id: questionId,
        category_id: categoryId,
        round,
        timestamp: new Date().toISOString(),
      });
      // PostHog
      track.custom('blindtest_question_started', {
        game_id: gameId,
        question_id: questionId,
        category_id: categoryId,
        round,
      });
    } catch (error) {
      console.error('Error tracking question start:', error);
    }
  }, [track]);

  // Firebase Analytics - Audio arrêté (buzzer pressé)
  const trackAudioPaused = useCallback(async (
    gameId: string,
    userId: string,
    questionId: string,
    timeElapsed: number
  ) => {
    try {
      await analytics().logEvent('blindtest_audio_paused', {
        game_id: gameId,
        user_id: userId,
        question_id: questionId,
        time_elapsed_seconds: timeElapsed,
        timestamp: new Date().toISOString(),
      });
      // PostHog
      track.custom('blindtest_audio_paused', {
        game_id: gameId,
        user_id: userId,
        question_id: questionId,
        time_elapsed_seconds: timeElapsed,
      });
    } catch (error) {
      console.error('Error tracking audio pause:', error);
    }
  }, [track]);

  // Firebase Analytics - Réponse correcte
  const trackCorrectAnswer = useCallback(async (
    gameId: string,
    userId: string,
    questionId: string,
    answer: string,
    timeToAnswer: number,
    round: number
  ) => {
    try {
      await analytics().logEvent('blindtest_correct_answer', {
        game_id: gameId,
        user_id: userId,
        question_id: questionId,
        answer,
        time_to_answer_seconds: timeToAnswer,
        round,
        timestamp: new Date().toISOString(),
      });
      // PostHog
      track.custom('blindtest_correct_answer', {
        game_id: gameId,
        user_id: userId,
        question_id: questionId,
        answer,
        time_to_answer_seconds: timeToAnswer,
        round,
      });
    } catch (error) {
      console.error('Error tracking correct answer:', error);
    }
  }, [track]);

  // Firebase Analytics - Réponse incorrecte
  const trackWrongAnswer = useCallback(async (
    gameId: string,
    userId: string,
    questionId: string,
    wrongAnswer: string,
    round: number
  ) => {
    try {
      await analytics().logEvent('blindtest_wrong_answer', {
        game_id: gameId,
        user_id: userId,
        question_id: questionId,
        wrong_answer: wrongAnswer,
        round,
        timestamp: new Date().toISOString(),
      });
      // PostHog
      track.custom('blindtest_wrong_answer', {
        game_id: gameId,
        user_id: userId,
        question_id: questionId,
        wrong_answer: wrongAnswer,
        round,
      });
    } catch (error) {
      console.error('Error tracking wrong answer:', error);
    }
  }, [track]);

  // Firebase Analytics - Fin de question (tous ont mal répondu)
  const trackQuestionSkipped = useCallback(async (
    gameId: string,
    questionId: string,
    round: number,
    allPlayersWrong: number
  ) => {
    try {
      await analytics().logEvent('blindtest_question_skipped', {
        game_id: gameId,
        question_id: questionId,
        round,
        all_players_wrong: allPlayersWrong,
        timestamp: new Date().toISOString(),
      });
      // PostHog
      track.custom('blindtest_question_skipped', {
        game_id: gameId,
        question_id: questionId,
        round,
        all_players_wrong: allPlayersWrong,
      });
    } catch (error) {
      console.error('Error tracking question skipped:', error);
    }
  }, [track]);

  // Firebase Analytics - Fin de partie
  const trackGameEnd = useCallback(async (
    gameId: string,
    totalRounds: number,
    duration: number,
    finalScores: Record<string, number>,
    winnerId?: string
  ) => {
    try {
      await analytics().logEvent('blindtest_game_ended', {
        game_id: gameId,
        total_rounds: totalRounds,
        duration_seconds: duration,
        final_scores: finalScores,
        winner_id: winnerId,
        game_type: 'blindtest-generations',
        timestamp: new Date().toISOString(),
      });
      // PostHog
      track.gameEnd('blindtest-generations', duration, Object.values(finalScores)[0]);
      track.custom('blindtest_game_ended', {
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

  // Firebase Analytics - Utilisation de la reconnaissance vocale
  const trackVoiceRecognitionUsed = useCallback(async (
    gameId: string,
    userId: string,
    questionId: string,
    success: boolean
  ) => {
    try {
      await analytics().logEvent('blindtest_voice_recognition_used', {
        game_id: gameId,
        user_id: userId,
        question_id: questionId,
        success,
        timestamp: new Date().toISOString(),
      });
      // PostHog
      track.custom('blindtest_voice_recognition_used', {
        game_id: gameId,
        user_id: userId,
        question_id: questionId,
        success,
      });
    } catch (error) {
      console.error('Error tracking voice recognition:', error);
    }
  }, [track]);

  return {
    trackGameStart,
    trackCategorySelected,
    trackQuestionStart,
    trackAudioPaused,
    trackCorrectAnswer,
    trackWrongAnswer,
    trackQuestionSkipped,
    trackGameEnd,
    trackVoiceRecognitionUsed,
  };
}

