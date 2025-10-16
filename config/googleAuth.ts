// Configuration pour Google Authentication
export const GOOGLE_AUTH_CONFIG = {
  // Configuration temporaire pour le développement
  // Remplacez ces valeurs par vos vraies clés Google OAuth
  expoClientId: 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', 
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  
  // Scopes requis pour l'authentification
  scopes: ['openid', 'profile', 'email'],
  
  // URL de redirection temporaire
  redirectUri: 'https://auth.expo.io/@your-username/your-app-slug',
  
  // Mode développement (désactive Google Auth si pas configuré)
  isDevelopment: true,
};

// Instructions pour configurer Google Auth :
/*
1. Allez sur https://console.developers.google.com/
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ API
4. Créez des identifiants OAuth 2.0 :
   - Application type: Web application (pour webClientId)
   - Application type: iOS (pour iosClientId)
   - Application type: Android (pour androidClientId)
5. Pour Expo, créez aussi un client OAuth pour Expo
6. Configurez les URI de redirection autorisés
7. Remplacez les valeurs ci-dessus par vos vraies clés
*/
