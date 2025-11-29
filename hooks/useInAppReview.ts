import * as StoreReview from 'expo-store-review';
import { Linking, Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState, useCallback } from 'react';
import analytics from '@react-native-firebase/analytics';
import { usePostHog } from './usePostHog';

const HAS_REVIEWED_KEY = '@nightly_has_reviewed';
const LAST_REVIEW_ATTEMPT_KEY = '@nightly_last_review_attempt';
const GAMES_PLAYED_SINCE_LAST_REVIEW_KEY = '@nightly_games_played_since_review';
const REVIEW_DECLINED_COUNT_KEY = '@nightly_review_declined_count';
const LAST_REVIEW_DECLINE_KEY = '@nightly_last_review_decline';

// Constantes - Demande à chaque fois qu'il revient sur l'app si pas voté
const DAYS_AFTER_DECLINE = 1; // Attendre 1 jour après un refus avant de redemander

export const useInAppReview = () => {
  const appState = useRef(AppState.currentState);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { track } = usePostHog();

  // Tracking analytics pour le review
  const trackReviewEvent = useCallback(async (eventName: string, properties?: Record<string, any>) => {
    try {
      await analytics().logEvent(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
      track.custom(eventName, properties || {});
    } catch (error) {
      console.error('Erreur lors du tracking review:', error);
    }
  }, [track]);

  const hasUserReviewed = async () => {
    try {
      const hasReviewed = await AsyncStorage.getItem(HAS_REVIEWED_KEY);
      return hasReviewed === 'true';
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de review:', error);
      return false;
    }
  };

  const checkIfReviewWasSubmitted = async () => {
    try {
      const lastAttempt = await AsyncStorage.getItem(LAST_REVIEW_ATTEMPT_KEY);
      if (!lastAttempt) return;

      const now = Date.now();
      const timeSinceLastAttempt = now - parseInt(lastAttempt);

      // Si l'utilisateur est revenu à l'app après avoir ouvert le store
      // et qu'il a passé plus de 30 secondes, on considère qu'il a peut-être fait une review
      if (timeSinceLastAttempt > 30000) {
        await trackReviewEvent('app_review_completed', {
          time_since_attempt_seconds: timeSinceLastAttempt / 1000,
        });
        await markReviewAsDone();
        await AsyncStorage.removeItem(LAST_REVIEW_ATTEMPT_KEY);
        await AsyncStorage.removeItem(GAMES_PLAYED_SINCE_LAST_REVIEW_KEY);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la review:', error);
    }
  };

  const incrementGamesPlayed = async () => {
    try {
      const current = await AsyncStorage.getItem(GAMES_PLAYED_SINCE_LAST_REVIEW_KEY);
      const gamesCount = current ? parseInt(current) + 1 : 1;
      await AsyncStorage.setItem(GAMES_PLAYED_SINCE_LAST_REVIEW_KEY, gamesCount.toString());
      
      // Tracking du compteur de jeux
      await trackReviewEvent('app_review_games_incremented', {
        games_count: gamesCount,
      });
      
      return gamesCount;
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des jeux:', error);
      return 0;
    }
  };

  const getGamesPlayedSinceLastReview = async () => {
    try {
      const current = await AsyncStorage.getItem(GAMES_PLAYED_SINCE_LAST_REVIEW_KEY);
      return current ? parseInt(current) : 0;
    } catch (error) {
      return 0;
    }
  };

  const canShowReview = async (): Promise<boolean> => {
    try {
      // Si l'utilisateur a déjà fait une review, on ne redemande jamais
      const hasReviewed = await hasUserReviewed();
      if (hasReviewed) {
        return false;
      }

      // Vérifier si l'utilisateur a refusé récemment
      const lastDeclineStr = await AsyncStorage.getItem(LAST_REVIEW_DECLINE_KEY);
      if (lastDeclineStr) {
        const daysSinceLastDecline = (Date.now() - parseInt(lastDeclineStr)) / (1000 * 60 * 60 * 24);
        // Attendre 1 jour après un refus avant de redemander
        if (daysSinceLastDecline < DAYS_AFTER_DECLINE) {
          return false;
        }
        // Après 1 jour, on peut redemander - réinitialiser le compteur
        await AsyncStorage.removeItem(REVIEW_DECLINED_COUNT_KEY);
        await AsyncStorage.removeItem(LAST_REVIEW_DECLINE_KEY);
      }

      // Si pas de refus récent, on peut demander à chaque fois
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de canShowReview:', error);
      return false;
    }
  };

  const requestReviewNative = async (): Promise<boolean> => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        // Enregistrer la tentative
        await AsyncStorage.setItem(LAST_REVIEW_ATTEMPT_KEY, Date.now().toString());
        
        // Tracking : review natif demandé
        await trackReviewEvent('app_review_native_requested', {});
        
        await StoreReview.requestReview();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la demande de review native:', error);
      return false;
    }
  };

  const requestReview = useCallback(async (showModalFirst: boolean = true): Promise<boolean> => {
    try {
      const canShow = await canShowReview();
      if (!canShow) {
        return false;
      }

      // Si on veut montrer la modal custom d'abord
      if (showModalFirst) {
        // Tracking : modal affichée
        await trackReviewEvent('app_review_modal_shown', {
          games_played: await getGamesPlayedSinceLastReview(),
          trigger: 'app_open',
        });
        setShowReviewModal(true);
        return true;
      }

      // Sinon, directement le review natif
      return await requestReviewNative();
    } catch (error) {
      console.error('Erreur lors de la demande de review:', error);
      return false;
    }
  }, [trackReviewEvent, getGamesPlayedSinceLastReview]);

  // Vérifier et demander le review quand l'app s'ouvre
  const checkAndRequestReviewOnAppOpen = useCallback(async () => {
    const canShow = await canShowReview();
    if (canShow) {
      // Attendre un peu avant d'afficher pour laisser l'app se charger
      setTimeout(async () => {
        await requestReview(true);
      }, 2000); // 2 secondes après l'ouverture
    }
  }, [requestReview]);

  useEffect(() => {
    // Vérifier au démarrage initial de l'app
    checkIfReviewWasSubmitted();
    checkAndRequestReviewOnAppOpen();
    
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // L'application est revenue au premier plan
        checkIfReviewWasSubmitted();
        // Vérifier si on peut demander le review quand l'app revient au premier plan
        checkAndRequestReviewOnAppOpen();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkAndRequestReviewOnAppOpen]);

  const handleRateNow = async () => {
    try {
      await AsyncStorage.setItem(LAST_REVIEW_ATTEMPT_KEY, Date.now().toString());
      
      // Tracking : utilisateur a cliqué sur "Noter maintenant"
      await trackReviewEvent('app_review_accepted', {
        games_played: await getGamesPlayedSinceLastReview(),
      });
      
      // Essayer d'abord le review natif
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        // Fallback: ouvrir le store directement
        await openStoreReview();
      }
      
      // Réinitialiser les compteurs
      await AsyncStorage.removeItem(GAMES_PLAYED_SINCE_LAST_REVIEW_KEY);
      await AsyncStorage.removeItem(REVIEW_DECLINED_COUNT_KEY);
      await AsyncStorage.removeItem(LAST_REVIEW_DECLINE_KEY);
    } catch (error) {
      console.error('Erreur lors du rating:', error);
    }
  };

  const handleMaybeLater = async () => {
    try {
      // Incrémenter le compteur de refus
      const declineCountStr = await AsyncStorage.getItem(REVIEW_DECLINED_COUNT_KEY);
      const declineCount = declineCountStr ? parseInt(declineCountStr) + 1 : 1;
      await AsyncStorage.setItem(REVIEW_DECLINED_COUNT_KEY, declineCount.toString());
      await AsyncStorage.setItem(LAST_REVIEW_DECLINE_KEY, Date.now().toString());
      
      // Tracking : utilisateur a refusé
      await trackReviewEvent('app_review_declined', {
        decline_count: declineCount,
        games_played: await getGamesPlayedSinceLastReview(),
      });
      
      // Ne pas supprimer le compteur de jeux pour redemander plus tard
    } catch (error) {
      console.error('Erreur lors du refus:', error);
    }
  };

  const openStoreReview = async () => {
    try {
      const hasReviewed = await hasUserReviewed();
      if (hasReviewed) {
        return;
      }

      // On enregistre le moment où l'utilisateur ouvre le store
      await AsyncStorage.setItem(LAST_REVIEW_ATTEMPT_KEY, Date.now().toString());
      
      // Tracking : ouverture du store
      await trackReviewEvent('app_review_store_opened', {
        platform: Platform.OS,
      });

      if (Platform.OS === 'ios') {
        const itunesItemId = '6745452775';
        await Linking.openURL(
          `https://apps.apple.com/app/apple-store/id${itunesItemId}?action=write-review`
        );
      } else if (Platform.OS === 'android') {
        const androidPackageName = 'com.emplica.nightly.android';
        await Linking.openURL(
          `https://play.google.com/store/apps/details?id=${androidPackageName}&showAllReviews=true`
        );
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du store:', error);
    }
  };

  const markReviewAsDone = async () => {
    try {
      await AsyncStorage.setItem(HAS_REVIEWED_KEY, 'true');
      await AsyncStorage.removeItem(GAMES_PLAYED_SINCE_LAST_REVIEW_KEY);
      await AsyncStorage.removeItem(REVIEW_DECLINED_COUNT_KEY);
      await AsyncStorage.removeItem(LAST_REVIEW_DECLINE_KEY);
      
      // Tracking : review marquée comme complétée
      await trackReviewEvent('app_review_marked_done', {});
    } catch (error) {
      console.error('Erreur lors du marquage de la review:', error);
    }
  };

  return {
    requestReview,
    requestReviewNative,
    openStoreReview,
    hasUserReviewed,
    markReviewAsDone,
    incrementGamesPlayed,
    showReviewModal,
    setShowReviewModal,
    handleRateNow,
    handleMaybeLater,
    checkAndRequestReviewOnAppOpen,
  };
};
