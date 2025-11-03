import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_COUNTER_KEY = '@nightly_free_sessions_count';
const LAST_SESSION_DATE_KEY = '@nightly_last_session_date';
const MAX_FREE_SESSIONS = 3; // Nombre de sessions gratuites avant de montrer le paywall

/**
 * Service de tracking des sessions gratuites
 * Permet de compter combien de parties gratuites l'utilisateur a jouées
 */

/**
 * Récupère le nombre de sessions gratuites jouées
 */
export const getFreeSessionsCount = async (): Promise<number> => {
  try {
    const count = await AsyncStorage.getItem(SESSION_COUNTER_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Erreur lors de la récupération du compteur de sessions:', error);
    return 0;
  }
};

/**
 * Incrémente le compteur de sessions gratuites
 */
export const incrementFreeSessionsCount = async (): Promise<number> => {
  try {
    const currentCount = await getFreeSessionsCount();
    const newCount = currentCount + 1;
    await AsyncStorage.setItem(SESSION_COUNTER_KEY, newCount.toString());

    // Enregistrer la date de la dernière session
    await AsyncStorage.setItem(LAST_SESSION_DATE_KEY, new Date().toISOString());

    console.log(`📊 Sessions gratuites jouées: ${newCount}/${MAX_FREE_SESSIONS}`);
    return newCount;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation du compteur:', error);
    return 0;
  }
};

/**
 * Réinitialise le compteur de sessions (quand l'utilisateur s'abonne)
 */
export const resetFreeSessionsCount = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_COUNTER_KEY);
    await AsyncStorage.removeItem(LAST_SESSION_DATE_KEY);
    console.log('✅ Compteur de sessions réinitialisé');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du compteur:', error);
  }
};

/**
 * Vérifie si l'utilisateur a atteint la limite de sessions gratuites
 */
export const hasReachedFreeSessionLimit = async (): Promise<boolean> => {
  try {
    const count = await getFreeSessionsCount();
    return count >= MAX_FREE_SESSIONS;
  } catch (error) {
    console.error('Erreur lors de la vérification de la limite:', error);
    return false;
  }
};

/**
 * Vérifie si on doit afficher le paywall après cette session
 */
export const shouldShowPaywallAfterSession = async (): Promise<boolean> => {
  try {
    const count = await getFreeSessionsCount();
    // Afficher le paywall après la 2ème ou 3ème session
    return count >= 2;
  } catch (error) {
    console.error('Erreur lors de la vérification du paywall:', error);
    return false;
  }
};

/**
 * Récupère la date de la dernière session
 */
export const getLastSessionDate = async (): Promise<Date | null> => {
  try {
    const dateStr = await AsyncStorage.getItem(LAST_SESSION_DATE_KEY);
    return dateStr ? new Date(dateStr) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la date:', error);
    return null;
  }
};

/**
 * Obtient le nombre de sessions restantes avant le paywall
 */
export const getRemainingFreeSessions = async (): Promise<number> => {
  try {
    const count = await getFreeSessionsCount();
    return Math.max(0, MAX_FREE_SESSIONS - count);
  } catch (error) {
    console.error('Erreur lors du calcul des sessions restantes:', error);
    return 0;
  }
};
