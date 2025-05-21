import * as StoreReview from 'expo-store-review';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_REVIEWED_KEY = '@nightly_has_reviewed';

export const useInAppReview = () => {
  const hasUserReviewed = async () => {
    try {
      const hasReviewed = await AsyncStorage.getItem(HAS_REVIEWED_KEY);
      return hasReviewed === 'true';
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de review:', error);
      return false;
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
        await AsyncStorage.setItem(HAS_REVIEWED_KEY, 'true');
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

      if (Platform.OS === 'ios') {
        const itunesItemId = 'VOTRE_ITUNES_ITEM_ID';
        await Linking.openURL(
          `https://apps.apple.com/app/apple-store/id${itunesItemId}?action=write-review`
        );
      } else if (Platform.OS === 'android') {
        const androidPackageName = 'VOTRE_PACKAGE_NAME';
        await Linking.openURL(
          `https://play.google.com/store/apps/details?id=${androidPackageName}&showAllReviews=true`
        );
      }
      await AsyncStorage.setItem(HAS_REVIEWED_KEY, 'true');
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du store:', error);
    }
  };

  return { requestReview, openStoreReview, hasUserReviewed };
}; 