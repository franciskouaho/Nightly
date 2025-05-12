import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as InAppReview from 'react-native-in-app-review';

export const useInAppReview = () => {
  const requestReview = async () => {
    try {
      if (Platform.OS === 'ios') {
        const isAvailable = await InAppReview.isAvailable();
        if (isAvailable) {
          await InAppReview.requestReview();
        }
      } else if (Platform.OS === 'android') {
        const isAvailable = await InAppReview.isAvailable();
        if (isAvailable) {
          await InAppReview.requestReview();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la demande de review:', error);
    }
  };

  return { requestReview };
}; 