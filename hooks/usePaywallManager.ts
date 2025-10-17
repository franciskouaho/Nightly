import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useRevenueCat from './useRevenueCat';
import { useAuth } from '@/contexts/AuthContext';

interface PaywallState {
  showPaywallA: boolean;
  showPaywallB: boolean;
  hasSeenPaywallA: boolean;
  hasSeenPaywallB: boolean;
  lastPaywallBShown: number | null;
  isInActiveGame: boolean;
  sessionId: string;
}

interface PaywallConfig {
  cooldownHours: number; // Cooldown entre les affichages du PaywallB
  maxPaywallBPerSession: number; // Max d'affichages du PaywallB par session
  originalAnnualPrice: number; // Prix original annuel pour calculer la réduction
  discountedAnnualPrice: number; // Prix réduit annuel
}

const DEFAULT_CONFIG: PaywallConfig = {
  cooldownHours: 24,
  maxPaywallBPerSession: 1,
  originalAnnualPrice: 59.99,
  discountedAnnualPrice: 29.99,
};

const STORAGE_KEYS = {
  HAS_SEEN_PAYWALL_A: 'has_seen_paywall_a',
  HAS_SEEN_PAYWALL_B: 'has_seen_paywall_b',
  LAST_PAYWALL_B_SHOWN: 'last_paywall_b_shown',
  SESSION_ID: 'session_id',
  PAYWALL_B_COUNT: 'paywall_b_count',
};

export default function usePaywallManager(config: Partial<PaywallConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { isProMember } = useRevenueCat();
  const { user } = useAuth();
  
  const [paywallState, setPaywallState] = useState<PaywallState>({
    showPaywallA: false,
    showPaywallB: false,
    hasSeenPaywallA: false,
    hasSeenPaywallB: false,
    lastPaywallBShown: null,
    isInActiveGame: false,
    sessionId: '',
  });

  // Générer un ID de session unique
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Charger l'état depuis AsyncStorage
  const loadPaywallState = useCallback(async () => {
    try {
      const [
        hasSeenPaywallA,
        hasSeenPaywallB,
        lastPaywallBShown,
        sessionId,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_PAYWALL_A),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_PAYWALL_B),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_PAYWALL_B_SHOWN),
        AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID),
      ]);

      const currentSessionId = sessionId || generateSessionId();
      
      setPaywallState(prev => ({
        ...prev,
        hasSeenPaywallA: hasSeenPaywallA === 'true',
        hasSeenPaywallB: hasSeenPaywallB === 'true',
        lastPaywallBShown: lastPaywallBShown ? parseInt(lastPaywallBShown) : null,
        sessionId: currentSessionId,
      }));

      // Sauvegarder le nouvel ID de session si nécessaire
      if (!sessionId) {
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, currentSessionId);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'état paywall:', error);
    }
  }, [generateSessionId]);

  // Sauvegarder l'état dans AsyncStorage
  const savePaywallState = useCallback(async (updates: Partial<PaywallState>) => {
    try {
      const newState = { ...paywallState, ...updates };
      setPaywallState(newState);

      // Sauvegarder les changements pertinents
      if (updates.hasSeenPaywallA !== undefined) {
        await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_PAYWALL_A, updates.hasSeenPaywallA.toString());
      }
      if (updates.hasSeenPaywallB !== undefined) {
        await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_PAYWALL_B, updates.hasSeenPaywallB.toString());
      }
      if (updates.lastPaywallBShown !== undefined) {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_PAYWALL_B_SHOWN, updates.lastPaywallBShown.toString());
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'état paywall:', error);
    }
  }, [paywallState]);

  // Vérifier si on peut afficher le PaywallB
  const canShowPaywallB = useCallback(async () => {
    if (isProMember || paywallState.isInActiveGame) {
      return false;
    }

    // Vérifier le cooldown
    if (paywallState.lastPaywallBShown) {
      const hoursSinceLastShow = (Date.now() - paywallState.lastPaywallBShown) / (1000 * 60 * 60);
      if (hoursSinceLastShow < finalConfig.cooldownHours) {
        return false;
      }
    }

    // Vérifier le nombre d'affichages dans cette session
    try {
      const countStr = await AsyncStorage.getItem(`${STORAGE_KEYS.PAYWALL_B_COUNT}_${paywallState.sessionId}`);
      const count = countStr ? parseInt(countStr) : 0;
      if (count >= finalConfig.maxPaywallBPerSession) {
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du compteur PaywallB:', error);
    }

    return true;
  }, [isProMember, paywallState, finalConfig]);

  // Afficher le PaywallA (plan court)
  const showPaywallA = useCallback(() => {
    if (isProMember) return;
    
    setPaywallState(prev => ({
      ...prev,
      showPaywallA: true,
      hasSeenPaywallA: true,
    }));
  }, [isProMember]);

  // Afficher le PaywallB (plan annuel)
  const showPaywallB = useCallback(async () => {
    if (isProMember) return;
    
    const canShow = await canShowPaywallB();
    if (!canShow) return;

    setPaywallState(prev => ({
      ...prev,
      showPaywallB: true,
      hasSeenPaywallB: true,
      lastPaywallBShown: Date.now(),
    }));

    // Incrémenter le compteur de session
    try {
      const countStr = await AsyncStorage.getItem(`${STORAGE_KEYS.PAYWALL_B_COUNT}_${paywallState.sessionId}`);
      const count = countStr ? parseInt(countStr) : 0;
      await AsyncStorage.setItem(`${STORAGE_KEYS.PAYWALL_B_COUNT}_${paywallState.sessionId}`, (count + 1).toString());
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation du compteur PaywallB:', error);
    }
  }, [isProMember, canShowPaywallB, paywallState.sessionId]);

  // Fermer le PaywallA
  const closePaywallA = useCallback(() => {
    setPaywallState(prev => ({
      ...prev,
      showPaywallA: false,
    }));
  }, []);

  // Fermer le PaywallB
  const closePaywallB = useCallback(() => {
    setPaywallState(prev => ({
      ...prev,
      showPaywallB: false,
    }));
  }, []);

  // Gérer la fermeture du PaywallA (suggérer l'annuel)
  const handlePaywallAClose = useCallback(async () => {
    closePaywallA();
    
    // Attendre un peu avant de suggérer l'annuel
    setTimeout(async () => {
      await showPaywallB();
    }, 1000);
  }, [closePaywallA, showPaywallB]);

  // Marquer qu'on est dans une partie active
  const setInActiveGame = useCallback((inGame: boolean) => {
    setPaywallState(prev => ({
      ...prev,
      isInActiveGame: inGame,
    }));
  }, []);

  // Réinitialiser l'état (pour les tests ou reset)
  const resetPaywallState = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.HAS_SEEN_PAYWALL_A),
        AsyncStorage.removeItem(STORAGE_KEYS.HAS_SEEN_PAYWALL_B),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_PAYWALL_B_SHOWN),
        AsyncStorage.removeItem(STORAGE_KEYS.SESSION_ID),
      ]);
      
      setPaywallState({
        showPaywallA: false,
        showPaywallB: false,
        hasSeenPaywallA: false,
        hasSeenPaywallB: false,
        lastPaywallBShown: null,
        isInActiveGame: false,
        sessionId: generateSessionId(),
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de l\'état paywall:', error);
    }
  }, [generateSessionId]);

  // Calculer le pourcentage de réduction
  const discountPercentage = Math.round(
    (1 - finalConfig.discountedAnnualPrice / finalConfig.originalAnnualPrice) * 100
  );

  // Charger l'état au montage
  useEffect(() => {
    loadPaywallState();
  }, [loadPaywallState]);

  return {
    // État
    paywallState,
    isProMember,
    
    // Actions
    showPaywallA,
    showPaywallB,
    closePaywallA,
    closePaywallB,
    handlePaywallAClose,
    setInActiveGame,
    resetPaywallState,
    
    // Configuration
    config: finalConfig,
    discountPercentage,
    
    // Calculs
    originalPrice: finalConfig.originalAnnualPrice,
    discountedPrice: finalConfig.discountedAnnualPrice,
  };
}
