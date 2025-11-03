import { useCallback } from 'react';
import analytics from '@react-native-firebase/analytics';

export function useDoubleDareAnalytics() {
  const trackLevelChoice = useCallback(async (level: 'hot' | 'extreme' | 'chaos', userId: string) => {
    try {
      await analytics().logEvent('double_dare_level_selected', {
        level,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking level choice:', error);
    }
  }, []);

  const trackModeChoice = useCallback(async (mode: 'versus' | 'fusion', userId: string) => {
    try {
      await analytics().logEvent('double_dare_mode_selected', {
        mode,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking mode choice:', error);
    }
  }, []);

  const trackDareCompleted = useCallback(async (
    level: 'hot' | 'extreme' | 'chaos',
    mode: 'versus' | 'fusion',
    completed: boolean,
    userId: string
  ) => {
    try {
      await analytics().logEvent('double_dare_dare_completed', {
        level,
        mode,
        completed,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking dare completion:', error);
    }
  }, []);

  const trackSafeWordUsed = useCallback(async (
    level: 'hot' | 'extreme' | 'chaos',
    mode: 'versus' | 'fusion',
    userId: string
  ) => {
    try {
      await analytics().logEvent('double_dare_safe_word_used', {
        level,
        mode,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking safe word usage:', error);
    }
  }, []);

  const trackGameCompleted = useCallback(async (
    totalRounds: number,
    averageLevel: string,
    averageMode: string,
    userId: string
  ) => {
    try {
      await analytics().logEvent('double_dare_game_completed', {
        total_rounds: totalRounds,
        average_level: averageLevel,
        average_mode: averageMode,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking game completion:', error);
    }
  }, []);

  return {
    trackLevelChoice,
    trackModeChoice,
    trackDareCompleted,
    trackSafeWordUsed,
    trackGameCompleted,
  };
}
