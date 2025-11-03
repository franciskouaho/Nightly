import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePaywall } from '@/contexts/PaywallContext';
import {
  incrementFreeSessionsCount,
  shouldShowPaywallAfterSession,
  getFreeSessionsCount,
} from '@/services/sessionTrackingService';

/**
 * Hook pour gérer l'affichage du paywall après une partie gratuite
 * À utiliser dans les écrans de jeu quand la partie se termine
 *
 * @param gameId - L'ID du jeu (ex: 'truth-or-dare', 'trap-answer')
 * @param isGameEnded - Boolean indiquant si la partie est terminée
 */
export const useGameEndPaywall = (gameId: string, isGameEnded: boolean) => {
  const { user } = useAuth();
  const { showPaywallA, isProMember } = usePaywall();
  const hasTriggeredPaywall = useRef(false);

  // Déterminer si le jeu est gratuit
  const FREE_GAMES = ['truth-or-dare', 'trap-answer'];
  const isFreeGame = FREE_GAMES.includes(gameId);

  useEffect(() => {
    const handleGameEnd = async () => {
      // Ne rien faire si :
      // - L'utilisateur a déjà un abonnement
      // - Le jeu n'est pas gratuit
      // - La partie n'est pas terminée
      // - On a déjà déclenché le paywall
      if (
        user?.hasActiveSubscription ||
        isProMember ||
        !isFreeGame ||
        !isGameEnded ||
        hasTriggeredPaywall.current
      ) {
        return;
      }

      try {
        // Incrémenter le compteur de sessions
        const newCount = await incrementFreeSessionsCount();

        console.log(`🎮 Partie gratuite terminée (${gameId}) - Sessions: ${newCount}`);

        // Vérifier si on doit montrer le paywall
        const shouldShow = await shouldShowPaywallAfterSession();

        if (shouldShow) {
          console.log('💰 Affichage du paywall après la partie gratuite');

          // Marquer comme déclenché pour éviter les doublons
          hasTriggeredPaywall.current = true;

          // Attendre un peu avant d'afficher le paywall (pour une meilleure UX)
          setTimeout(() => {
            showPaywallA();
          }, 1500);
        } else {
          const remaining = 3 - newCount;
          console.log(`✅ ${remaining} partie(s) gratuite(s) restante(s) avant le paywall`);
        }
      } catch (error) {
        console.error('Erreur lors de la gestion du paywall de fin de partie:', error);
      }
    };

    handleGameEnd();
  }, [isGameEnded, user?.hasActiveSubscription, isProMember, gameId, isFreeGame, showPaywallA]);

  return {
    hasTriggeredPaywall: hasTriggeredPaywall.current,
  };
};

/**
 * Hook pour afficher un message du type "Plus que X parties gratuites"
 */
export const useFreeSessionsRemaining = () => {
  const { user } = useAuth();
  const { isProMember } = usePaywall();

  const getFreeSessionsRemaining = async (): Promise<number | null> => {
    // Si l'utilisateur est abonné, pas besoin de compter
    if (user?.hasActiveSubscription || isProMember) {
      return null;
    }

    try {
      const count = await getFreeSessionsCount();
      return Math.max(0, 3 - count);
    } catch (error) {
      console.error('Erreur lors du calcul des sessions restantes:', error);
      return null;
    }
  };

  return { getFreeSessionsRemaining };
};
