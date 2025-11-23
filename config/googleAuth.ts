// Configuration pour Google Authentication
// Pour @react-native-google-signin/google-signin, seul le webClientId est nécessaire
export const GOOGLE_AUTH_CONFIG = {
  // Web Client ID du projet Firebase (utilisé pour iOS et Android)
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '939461087699-rjimn8st7pb69lcgc98f8bni50qeufpj.apps.googleusercontent.com',
};