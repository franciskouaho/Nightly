import { useCallback, useEffect } from 'react';
import { usePaywall } from '@/contexts/PaywallContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  FREE_GAMES_COUNT: 'free_games_count',
  LAST_PAYWALL_SHOWN: 'last_paywall_shown_timestamp',
  FIRST_GAME_TIMESTAMP: 'first_game_timestamp',
};

interface SmartPaywallConfig {
  showAfterGames?: number; // Afficher après N parties gratuites (défaut: 2)
  showAfterMinutes?: number; // Afficher après N minutes d'utilisation (défaut: 15)
  cooldownMinutes?: number; // Cooldown entre les affichages (défaut: 60)
}

export function useSmartPaywall(config: SmartPaywallConfig = {}) {
  const { showPaywallA, isProMember } = usePaywall();

  const finalConfig = {
    showAfterGames: config.showAfterGames || 2,
    showAfterMinutes: config.showAfterMinutes || 15,
    cooldownMinutes: config.cooldownMinutes || 60,
  };

  /**
   * Vérifie si on peut afficher le paywall (cooldown respecté)
   */
  const canShowPaywall = useCallback(async (): Promise<boolean> => {
    if (isProMember) return false;

    try {
      const lastShownStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PAYWALL_SHOWN);
      if (!lastShownStr) return true;

      const lastShown = parseInt(lastShownStr);
      const minutesSinceLastShow = (Date.now() - lastShown) / (1000 * 60);

      return minutesSinceLastShow >= finalConfig.cooldownMinutes;
    } catch (error) {
      console.error('Erreur vérification cooldown paywall:', error);
      return true;
    }
  }, [isProMember, finalConfig.cooldownMinutes]);

  /**
   * Incrémente le compteur de parties gratuites jouées
   */
  const trackFreeGamePlayed = useCallback(async (): Promise<void> => {
    if (isProMember) return;

    try {
      const countStr = await AsyncStorage.getItem(STORAGE_KEYS.FREE_GAMES_COUNT);
      const count = countStr ? parseInt(countStr) : 0;
      const newCount = count + 1;

      await AsyncStorage.setItem(STORAGE_KEYS.FREE_GAMES_COUNT, newCount.toString());

      console.log(`📊 Parties gratuites jouées: ${newCount}`);

      // Enregistrer le timestamp de la première partie si pas déjà fait
      const firstGameStr = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_GAME_TIMESTAMP);
      if (!firstGameStr) {
        await AsyncStorage.setItem(STORAGE_KEYS.FIRST_GAME_TIMESTAMP, Date.now().toString());
      }
    } catch (error) {
      console.error('Erreur tracking partie gratuite:', error);
    }
  }, [isProMember]);

  /**
   * Vérifie et affiche le paywall si les conditions sont remplies
   * Appelé après la fin d'une partie gratuite
   */
  const checkAndShowPaywall = useCallback(async (reason: string = 'end_game'): Promise<boolean> => {
    if (isProMember) return false;

    const canShow = await canShowPaywall();
    if (!canShow) {
      console.log('⏳ Paywall en cooldown, pas d\'affichage');
      return false;
    }

    try {
      const countStr = await AsyncStorage.getItem(STORAGE_KEYS.FREE_GAMES_COUNT);
      const count = countStr ? parseInt(countStr) : 0;

      const firstGameStr = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_GAME_TIMESTAMP);
      const firstGameTime = firstGameStr ? parseInt(firstGameStr) : Date.now();
      const minutesSinceFirstGame = (Date.now() - firstGameTime) / (1000 * 60);

      // Conditions pour afficher le paywall
      const shouldShowByGameCount = count >= finalConfig.showAfterGames;
      const shouldShowByTime = minutesSinceFirstGame >= finalConfig.showAfterMinutes;

      if (shouldShowByGameCount || shouldShowByTime) {
        console.log(`💰 Affichage paywall: ${reason} (parties: ${count}, minutes: ${Math.floor(minutesSinceFirstGame)})`);

        // Enregistrer le timestamp d'affichage
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_PAYWALL_SHOWN, Date.now().toString());

        // Afficher avec un petit délai pour une meilleure UX
        setTimeout(() => {
          showPaywallA();
        }, 1500);

        return true;
      }

      console.log(`⏳ Pas encore: ${finalConfig.showAfterGames - count} parties ou ${Math.ceil(finalConfig.showAfterMinutes - minutesSinceFirstGame)} minutes restantes`);
      return false;
    } catch (error) {
      console.error('Erreur vérification paywall:', error);
      return false;
    }
  }, [isProMember, canShowPaywall, showPaywallA, finalConfig]);

  /**
   * Hook appelé après chaque partie gratuite
   * Incrémente le compteur et vérifie si on doit afficher le paywall
   */
  const onFreeGameCompleted = useCallback(async () => {
    await trackFreeGamePlayed();
    await checkAndShowPaywall('end_game');
  }, [trackFreeGamePlayed, checkAndShowPaywall]);

  /**
   * Réinitialise les compteurs (pour tests ou reset)
   */
  const resetPaywallTracking = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.FREE_GAMES_COUNT),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_PAYWALL_SHOWN),
        AsyncStorage.removeItem(STORAGE_KEYS.FIRST_GAME_TIMESTAMP),
      ]);
      console.log('🔄 Tracking paywall réinitialisé');
    } catch (error) {
      console.error('Erreur reset tracking:', error);
    }
  }, []);

  /**
   * Affiche les stats actuelles (pour debug)
   */
  const getPaywallStats = useCallback(async () => {
    try {
      const [countStr, lastShownStr, firstGameStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.FREE_GAMES_COUNT),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_PAYWALL_SHOWN),
        AsyncStorage.getItem(STORAGE_KEYS.FIRST_GAME_TIMESTAMP),
      ]);

      const count = countStr ? parseInt(countStr) : 0;
      const lastShown = lastShownStr ? new Date(parseInt(lastShownStr)) : null;
      const firstGame = firstGameStr ? new Date(parseInt(firstGameStr)) : null;

      return {
        freeGamesPlayed: count,
        lastPaywallShown: lastShown,
        firstGamePlayed: firstGame,
        isProMember,
      };
    } catch (error) {
      console.error('Erreur récupération stats:', error);
      return null;
    }
  }, [isProMember]);

  return {
    onFreeGameCompleted,
    checkAndShowPaywall,
    trackFreeGamePlayed,
    resetPaywallTracking,
    getPaywallStats,
    canShowPaywall,
  };
}
