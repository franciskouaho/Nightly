import * as StoreReview from 'expo-store-review';
import { Linking, Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

const HAS_REVIEWED_KEY = '@nightly_has_reviewed';
const LAST_REVIEW_ATTEMPT_KEY = '@nightly_last_review_attempt';

export const useInAppReview = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // L'application est revenue au premier plan
        checkIfReviewWasSubmitted();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
        await markReviewAsDone();
        await AsyncStorage.removeItem(LAST_REVIEW_ATTEMPT_KEY);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la review:', error);
    }
  };

  const requestReview = async () => {
    try {
      const hasReviewed = await hasUserReviewed();
      if (hasReviewed) {
        return;
      }

      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      }
    } catch (error) {
      console.error('Erreur lors de la demande de review:', error);
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

      if (Platform.OS === 'ios') {
        const itunesItemId = '6745452775';
        await Linking.openURL(
          `https://apps.apple.com/app/apple-store/id${itunesItemId}?action=write-review`
        );
      } else if (Platform.OS === 'android') {
        const androidPackageName = 'com.emplica.nightly';
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
    } catch (error) {
      console.error('Erreur lors du marquage de la review:', error);
    }
  };

  return { requestReview, openStoreReview, hasUserReviewed, markReviewAsDone };
}; 