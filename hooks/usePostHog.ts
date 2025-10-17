import { usePostHog as usePostHogOriginal } from 'posthog-react-native';
import { posthogEvents } from '@/config/posthog';

// Hook personnalisé pour PostHog avec des fonctions utilitaires
export function usePostHog() {
  const posthog = usePostHogOriginal();
  
  // Vérification de sécurité pour éviter les erreurs si PostHog n'est pas initialisé
  if (!posthog) {
    console.warn('PostHog not initialized yet');
    return {
      posthog: null,
      track: {
        login: () => {},
        logout: () => {},
        gameStart: () => {},
        gameEnd: () => {},
        screenView: () => {},
        error: () => {},
        custom: () => {},
      },
      identify: () => {},
      setUserProperties: () => {},
      getFeatureFlag: () => undefined,
      isFeatureEnabled: () => false,
      capture: () => {},
      alias: () => {},
      reset: () => {},
    };
  }

  // Fonctions utilitaires pour l'analytics
  const track = {
    // Événements d'authentification
    login: (method: string, success: boolean) => {
      const event = posthogEvents.login(method, success);
      posthog?.capture(event.event, event.properties);
    },
    
    logout: () => {
      const event = posthogEvents.logout();
      posthog?.capture(event.event, event.properties);
    },
    
    // Événements de jeu
    gameStart: (gameType: string, playerCount: number) => {
      const event = posthogEvents.gameStart(gameType, playerCount);
      posthog?.capture(event.event, event.properties);
    },
    
    gameEnd: (gameType: string, duration: number, score?: number) => {
      const event = posthogEvents.gameEnd(gameType, duration, score);
      posthog?.capture(event.event, event.properties);
    },
    
    
    // Événements de navigation
    screenView: (screenName: string) => {
      const event = posthogEvents.screenView(screenName);
      posthog?.capture(event.event, event.properties);
    },
    
    // Événements d'erreur
    error: (errorType: string, errorMessage: string, context?: any) => {
      const event = posthogEvents.error(errorType, errorMessage, context);
      posthog?.capture(event.event, event.properties);
    },
    
    // Événement personnalisé
    custom: (eventName: string, properties?: Record<string, any>) => {
      posthog?.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
    },
  };

  // Fonctions pour les propriétés utilisateur
  const identify = (userId: string, properties?: Record<string, any>) => {
    posthog?.identify(userId, properties);
  };

  const setUserProperties = (properties: Record<string, any>) => {
    // PostHog ne semble pas avoir de méthode directe pour définir les propriétés utilisateur
    // On peut utiliser capture avec des événements personnalisés ou identify
    posthog?.identify(posthog.getDistinctId(), properties);
  };

  // Fonctions pour les feature flags
  const getFeatureFlag = (key: string) => {
    return posthog?.getFeatureFlag(key);
  };

  const isFeatureEnabled = (key: string) => {
    return posthog?.isFeatureEnabled(key);
  };

  return {
    // Instance PostHog originale
    posthog,
    
    // Fonctions utilitaires
    track,
    identify,
    setUserProperties,
    getFeatureFlag,
    isFeatureEnabled,
    
    // Fonctions PostHog natives
    capture: posthog?.capture.bind(posthog),
    alias: posthog?.alias.bind(posthog),
    reset: posthog?.reset.bind(posthog),
  };
}
