import * as StoreReview from 'expo-store-review';
import { Linking, Platform } from 'react-native';

export const useInAppReview = () => {
  const requestReview = async () => {
    try {
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
      if (Platform.OS === 'ios') {
        const itunesItemId = 'VOTRE_ITUNES_ITEM_ID'; // À remplacer par votre ID
        await Linking.openURL(
          `https://apps.apple.com/app/apple-store/id${itunesItemId}?action=write-review`
        );
      } else if (Platform.OS === 'android') {
        const androidPackageName = 'VOTRE_PACKAGE_NAME'; // À remplacer par votre nom de package
        await Linking.openURL(
          `https://play.google.com/store/apps/details?id=${androidPackageName}&showAllReviews=true`
        );
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du store:', error);
    }
  };

  return { requestReview, openStoreReview };
}; 