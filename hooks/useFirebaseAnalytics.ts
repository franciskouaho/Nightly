import { useCallback } from 'react';
import analytics from '@react-native-firebase/analytics';

export const useFirebaseAnalytics = () => {
  // Événements de base
  const logEvent = useCallback(async (eventName: string, params?: Record<string, any>) => {
    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.error('Erreur lors de la journalisation de l\'événement Firebase:', error);
    }
  }, []);

  const logScreenView = useCallback(async (screenName: string, screenClass?: string) => {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass,
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation de la vue d\'écran Firebase:', error);
    }
  }, []);

  // Événements d'authentification
  const logLogin = useCallback(async (method: string) => {
    try {
      await analytics().logLogin({ method });
    } catch (error) {
      console.error('Erreur lors de la journalisation de la connexion Firebase:', error);
    }
  }, []);

  const logSignUp = useCallback(async (method: string) => {
    try {
      await analytics().logSignUp({ method });
    } catch (error) {
      console.error('Erreur lors de la journalisation de l\'inscription Firebase:', error);
    }
  }, []);

  // Événements d'engagement
  const logSearch = useCallback(async (searchTerm: string) => {
    try {
      await analytics().logSearch({ search_term: searchTerm });
    } catch (error) {
      console.error('Erreur lors de la journalisation de la recherche Firebase:', error);
    }
  }, []);

  const logSelectContent = useCallback(async (contentType: string, itemId: string) => {
    try {
      await analytics().logSelectContent({
        content_type: contentType,
        item_id: itemId,
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation de la sélection de contenu Firebase:', error);
    }
  }, []);

  const logShare = useCallback(async (contentType: string, itemId: string, method?: string) => {
    try {
      await analytics().logShare({
        content_type: contentType,
        item_id: itemId,
        method: method || 'unknown',
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation du partage Firebase:', error);
    }
  }, []);

  // Événements d'achat
  const logAddToCart = useCallback(async (currency: string, value: number, items: any[]) => {
    try {
      await analytics().logAddToCart({
        currency,
        value,
        items,
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation de l\'ajout au panier Firebase:', error);
    }
  }, []);

  const logBeginCheckout = useCallback(async (currency: string, value: number, items: any[]) => {
    try {
      await analytics().logBeginCheckout({
        currency,
        value,
        items,
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation du début de paiement Firebase:', error);
    }
  }, []);

  const logPurchase = useCallback(async (currency: string, value: number, items: any[], transactionId: string) => {
    try {
      await analytics().logPurchase({
        currency,
        value,
        items,
        transaction_id: transactionId,
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation de l\'achat Firebase:', error);
    }
  }, []);

  // Événements de progression
  const logLevelStart = useCallback(async (levelName: number) => {
    try {
      await analytics().logLevelStart({ level: levelName });
    } catch (error) {
      console.error('Erreur lors de la journalisation du début de niveau Firebase:', error);
    }
  }, []);

  const logLevelEnd = useCallback(async (levelName: number, success: boolean) => {
    try {
      await analytics().logLevelEnd({
        level: levelName,
        success: success ? 'success' : 'failure',
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation de la fin de niveau Firebase:', error);
    }
  }, []);

  const logLevelUp = useCallback(async (level: number, character?: string) => {
    try {
      await analytics().logLevelUp({
        level,
        character,
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation du passage de niveau Firebase:', error);
    }
  }, []);

  // Événements de tutoriel
  const logTutorialBegin = useCallback(async () => {
    try {
      await analytics().logTutorialBegin();
    } catch (error) {
      console.error('Erreur lors de la journalisation du début de tutoriel Firebase:', error);
    }
  }, []);

  const logTutorialComplete = useCallback(async () => {
    try {
      await analytics().logTutorialComplete();
    } catch (error) {
      console.error('Erreur lors de la journalisation de la fin de tutoriel Firebase:', error);
    }
  }, []);

  // Événements de notification
  const logNotificationOpen = useCallback(async (messageId: string, action?: string) => {
    try {
      await analytics().logEvent('notification_open', {
        message_id: messageId,
        action,
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation de l\'ouverture de notification Firebase:', error);
    }
  }, []);

  const logNotificationReceive = useCallback(async (messageId: string) => {
    try {
      await analytics().logEvent('notification_receive', {
        message_id: messageId,
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation de la réception de notification Firebase:', error);
    }
  }, []);

  // Configuration
  const setUserProperty = useCallback(async (name: string, value: string) => {
    try {
      await analytics().setUserProperty(name, value);
    } catch (error) {
      console.error('Erreur lors de la définition de la propriété utilisateur Firebase:', error);
    }
  }, []);

  const setAnalyticsCollectionEnabled = useCallback(async (enabled: boolean) => {
    try {
      await analytics().setAnalyticsCollectionEnabled(enabled);
    } catch (error) {
      console.error('Erreur lors de la modification de la collection d\'analytics Firebase:', error);
    }
  }, []);

  const setSessionTimeoutDuration = useCallback(async (milliseconds: number) => {
    try {
      await analytics().setSessionTimeoutDuration(milliseconds);
    } catch (error) {
      console.error('Erreur lors de la définition de la durée de session Firebase:', error);
    }
  }, []);

  return {
    // Événements de base
    logEvent,
    logScreenView,
    
    // Événements d'authentification
    logLogin,
    logSignUp,
    
    // Événements d'engagement
    logSearch,
    logSelectContent,
    logShare,
    
    // Événements d'achat
    logAddToCart,
    logBeginCheckout,
    logPurchase,
    
    // Événements de progression
    logLevelStart,
    logLevelEnd,
    logLevelUp,
    
    // Événements de tutoriel
    logTutorialBegin,
    logTutorialComplete,
    
    // Événements de notification
    logNotificationOpen,
    logNotificationReceive,
    
    // Configuration
    setUserProperty,
    setAnalyticsCollectionEnabled,
    setSessionTimeoutDuration,
  };
}; 