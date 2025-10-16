// Configuration pour Google Authentication
export const GOOGLE_AUTH_CONFIG = {
  // Clés récupérées depuis google-services.json et GoogleService-Info.plist
  expoClientId: '939461087699-rjimn8st7pb69lcgc98f8bni50qeufpj.apps.googleusercontent.com', // Android Web Client
  iosClientId: '939461087699-r50qjj71i1jiau3jjep078ki03taugb5.apps.googleusercontent.com', // iOS Client
  androidClientId: '939461087699-rjimn8st7pb69lcgc98f8bni50qeufpj.apps.googleusercontent.com', // Android Client
  webClientId: '939461087699-rjimn8st7pb69lcgc98f8bni50qeufpj.apps.googleusercontent.com', // Web Client
  
  // Scopes requis pour l'authentification
  scopes: ['openid', 'profile', 'email'],
  
  // URL de redirection Expo
  redirectUri: 'https://auth.expo.io/@iamfrancisco/nightly',
  
  // Mode développement (désactive Google Auth si pas configuré)
  isDevelopment: false, // Activé maintenant que nous avons les vraies clés
};