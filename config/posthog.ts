// Configuration PostHog pour Nightly
import { PostHog } from "posthog-react-native";
import Constants from "expo-constants";

// Configuration PostHog EU
export const POSTHOG_CONFIG = {
  apiKey: "phc_z8yLZKPz4orGGZQlGTh4FIap9nSMAUiwQJYbSjdvaf6",
  host: "https://eu.i.posthog.com",
  options: {
    // Configuration pour React Native
    enableFeatureFlags: true,
    enableSessionRecording: false, // Désactivé pour les performances
    enableAutocapture: true,
    capturePageViews: true,
    capturePageLeave: true,

    // Configuration spécifique mobile
    disableGeoip: false,
    disableSessionRecording: true,

    // Personnalisation
    appVersion: Constants.expoConfig?.version, // Version de l'app depuis app.json
    appBuild: Constants.expoConfig?.android?.versionCode || Constants.expoConfig?.ios?.buildNumber , // Version code depuis app.json

    // Debug (désactiver en production)
    debug: __DEV__,

    // Configuration des événements (spécifique à React Native)
    autocapture: {
      // Les options DOM ne s'appliquent pas à React Native
      // On garde seulement les options pertinentes
    },
  },
};

// Instance PostHog globale
let posthogInstance: PostHog | null = null;

export const getPostHogInstance = (): PostHog | null => {
  return posthogInstance;
};

export const setPostHogInstance = (instance: PostHog): void => {
  posthogInstance = instance;
};

// Fonctions utilitaires pour l'analytics
export const posthogEvents = {
  // Événements d'authentification
  login: (method: string, success: boolean) => ({
    event: "user_login",
    properties: {
      method,
      success,
      timestamp: new Date().toISOString(),
    },
  }),

  logout: () => ({
    event: "user_logout",
    properties: {
      timestamp: new Date().toISOString(),
    },
  }),

  // Événements de jeu
  gameStart: (gameType: string, playerCount: number) => ({
    event: "game_started",
    properties: {
      game_type: gameType,
      player_count: playerCount,
      timestamp: new Date().toISOString(),
    },
  }),

  gameEnd: (gameType: string, duration: number, score?: number) => {
    const properties: Record<string, any> = {
      game_type: gameType,
      duration_seconds: duration,
      timestamp: new Date().toISOString(),
    };

    if (score !== undefined) {
      properties.final_score = score;
    }

    return {
      event: "game_ended",
      properties,
    };
  },

  // Événements de navigation
  screenView: (screenName: string) => ({
    event: "screen_viewed",
    properties: {
      screen_name: screenName,
      timestamp: new Date().toISOString(),
    },
  }),

  // Événements d'erreur
  error: (errorType: string, errorMessage: string, context?: any) => ({
    event: "app_error",
    properties: {
      error_type: errorType,
      error_message: errorMessage,
      context,
      timestamp: new Date().toISOString(),
    },
  }),
};
