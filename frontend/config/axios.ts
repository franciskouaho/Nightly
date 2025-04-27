import axios from 'axios';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration pour les appels API

// Détection de l'environnement d'exécution
const isExpo = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL;
const isAndroidEmulator = Platform.OS === 'android';
const isIosSimulator = Platform.OS === 'ios';

// Définir l'URL de base de l'API en fonction de l'environnement
let apiBaseUrl = '';
let socketBaseUrl = '';

if (isExpo) {
  // Utiliser la variable d'environnement d'Expo si disponible
  apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || '';
  socketBaseUrl = process.env.EXPO_PUBLIC_WS_URL || '';
} else if (isAndroidEmulator) {
  // Adresse spéciale pour l'émulateur Android (10.0.2.2 pointe vers localhost de la machine hôte)
  apiBaseUrl = 'http://10.0.2.2:3333';
  socketBaseUrl = 'http://10.0.2.2:3333';
} else if (isIosSimulator) {
  // Pour le simulateur iOS, localhost fonctionne car il partage le réseau de l'hôte
  apiBaseUrl = 'http://localhost:3333';
  socketBaseUrl = 'http://localhost:3333';
} else {
  // Par défaut, utiliser localhost
  apiBaseUrl = 'http://localhost:3333';
  socketBaseUrl = 'http://localhost:3333';
}

// URL de base pour les requêtes API REST
export const API_URL = `${apiBaseUrl}/api/v1`;

// URL pour les connexions WebSocket
export const SOCKET_URL = API_URL.replace('/api/v1', '');

// Vérifier périodiquement la connectivité
NetInfo.addEventListener(state => {
  // Logs supprimés
});

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Méthode pour récupérer et stocker l'ID utilisateur actuel
export const storeUserIdInApiHeaders = async () => {
  try {
    // Essayer de récupérer l'ID utilisateur depuis le stockage local
    const userData = await AsyncStorage.getItem('@user_data');
    if (userData) {
      const user = JSON.parse(userData);
      if (user && user.id) {
        // Stocker l'ID utilisateur dans les en-têtes globaux
        api.defaults.headers.userId = user.id;
        return user.id;
      }
    }
    return null;
  } catch (err) {
    return null;
  }
};

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(async config => {
  try {
    // Vérifier la connexion internet
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('Pas de connexion internet. Veuillez vérifier votre connexion et réessayer.');
    }
    
    // Récupérer le token depuis AsyncStorage
    const token = await AsyncStorage.getItem('@auth_token');
    
    // Si le token existe, l'ajouter aux headers
    if (token) {
      // Utiliser la méthode set() pour ajouter le token aux headers
      if (config.headers) {
        // L'API Axios moderne utilise set() pour les headers
        config.headers.set('Authorization', `Bearer ${token}`);
      }

      // S'assurer que l'ID utilisateur est également disponible
      if (!api.defaults.headers.userId) {
        await storeUserIdInApiHeaders();
      }
    }
    
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
}, error => {
  return Promise.reject(error);
});

// Intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    // Gérer spécifiquement les erreurs d'authentification (401)
    if (error.response && error.response.status === 401) {
      const originalRequest = error.config;
      
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        // Supprimer le token invalide
        await AsyncStorage.removeItem('@auth_token');
      }
    }
    
    return Promise.reject(error);
  }
);

// Initialiser l'ID utilisateur au démarrage de l'application
storeUserIdInApiHeaders();

export default api;
