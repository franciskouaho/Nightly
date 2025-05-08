import { useState } from 'react';
import * as InAppReview from 'react-native-in-app-review';

function useInAppReview() {
  const [isRequesting, setIsRequesting] = useState(false);

  const requestReview = async () => {
    if (isRequesting) return;
    
    try {
      setIsRequesting(true);
      
      // Vérifier si l'appareil est compatible avec les reviews in-app
      const isAvailable = await InAppReview.isAvailable();
      
      if (!isAvailable) {
        console.log('Les reviews in-app ne sont pas disponibles sur cet appareil');
        return;
      }

      // Demander la review
      await InAppReview.requestReview();
      console.log('Review demandée avec succès');
    } catch (error) {
      console.error('Erreur lors de la demande de review:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  return {
    requestReview,
    isRequesting
  };
} 

export default useInAppReview;