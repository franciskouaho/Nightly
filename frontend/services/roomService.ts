import axios from '@/config/axios'; // Remplace l'importation de api
import AsyncStorage from '@react-native-async-storage/async-storage';
import SocketService from './socketService';
import NetInfo from '@react-native-community/netinfo';

export interface CreateRoomPayload {
  name: string;
  game_mode: string;
  is_private?: boolean;
  max_players?: number;
  total_rounds?: number;
}

class RoomService {
  static async createRoom(payload: CreateRoomPayload) {
    try {
      console.log('🏗️ Création de salle avec payload:', payload);

      // Vérification de la connexion internet
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.error('❌ Pas de connexion internet disponible');
        throw new Error('Pas de connexion internet. Veuillez vérifier votre connexion et réessayer.');
      }

      // Plus besoin de gérer l'authentification ici, c'est fait dans l'intercepteur
      console.log('🌐 Envoi de la requête de création de salle');
      const response = await axios.post('/rooms', payload);
      console.log('✅ Salle créée avec succès:', response.data?.status);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de la salle:', error);
      
      if (error.message.includes('Network Error')) {
        console.error('❌ Erreur réseau détectée. Détails supplémentaires:');
        console.error('- URL API configurée:', axios.defaults.baseURL);
        console.error('- Timeout configuré:', axios.defaults.timeout, 'ms');
        
        // Vérifier l'état de la connexion
        const netInfo = await NetInfo.fetch();
        console.error(`- État connexion: ${netInfo.isConnected ? 'Connecté' : 'Non connecté'} (${netInfo.type})`);
      }
      
      throw error;
    }
  }

  static async joinRoom(roomCode: string) {
    try {
      console.log(`🚪 Tentative de rejoindre la salle ${roomCode}`);
      
      // Vérification de la connexion internet
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.error('❌ Pas de connexion internet disponible');
        throw new Error('Pas de connexion internet. Veuillez vérifier votre connexion et réessayer.');
      }

      console.log(`🌐 Envoi de la requête pour rejoindre la salle ${roomCode}`);
      
      // Première étape : vérifier l'état de la connexion WebSocket mais sans dépendre du résultat
      const isSocketConnected = SocketService.isConnected();
      console.log(`🔌 État de la connexion WebSocket: ${isSocketConnected ? 'Connecté' : 'Non connecté'}`);
      
      // Deuxième étape : effectuer la requête HTTP (sans besoin de gérer manuellement l'authentification)
      const response = await axios.post(`/rooms/${roomCode}/join`, {});
      console.log('✅ Salle rejointe avec succès:', response.data?.status);
      
      // Troisième étape : essayer de rejoindre la salle via WebSocket
      try {
        // Utilisation directe du service WebSocket au lieu d'un import dynamique
        SocketService.joinRoom(roomCode);
        console.log(`✅ Demande WebSocket pour rejoindre la salle ${roomCode} envoyée`);
      } catch (socketError) {
        // Ne pas faire échouer l'opération à cause d'une erreur WebSocket
        console.error('❌ Erreur WebSocket ignorée:', socketError);
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ Erreur lors de la tentative de rejoindre la salle ${roomCode}:`, error);
      throw error;
    }
  }
  
  static async startGame(roomCode: string) {
    try {
      console.log(`🎮 RoomService.startGame: Tentative de démarrage de la partie dans la salle ${roomCode}`);
      
      // Vérification de la connexion internet
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.error('❌ Pas de connexion internet disponible');
        throw new Error('Pas de connexion internet. Veuillez vérifier votre connexion et réessayer.');
      }

      // Récupérer et définir le token d'autorisation
      const token = await AsyncStorage.getItem('@auth_token');
      console.log(`🔑 Token pour startGame: ${token ? token.substring(0, 15) + '...' : 'manquant'}`);
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ Token ajouté aux headers de axios');
      }
      
      // Récupérer et définir l'ID utilisateur
      const userId = await AsyncStorage.getItem('@current_user_id');
      console.log(`👤 User ID pour startGame: ${userId || 'non défini'}`);
      if (userId) {
        axios.defaults.headers.userId = userId;
        console.log('✅ UserID ajouté aux headers de axios');
      }
      
      // Définir l'URL complète pour le débogage
      const fullUrl = `${axios.defaults.baseURL}/rooms/${roomCode}/start`;
      console.log(`🌐 URL complète de la requête: ${fullUrl}`);
      
      // Afficher les headers avant de faire la requête
      console.log(`🔍 Headers pour startGame: ${JSON.stringify(axios.defaults.headers)}`);

      console.log(`🌐 Envoi de la requête POST pour démarrer la partie dans la salle ${roomCode}`);
      const response = await axios.post(`/rooms/${roomCode}/start`, {});
      console.log('✅ Partie démarrée avec succès:', response.data);
      
      // Essayer de rejoindre le jeu via WebSocket
      try {
        await SocketService.joinGame(String(response.data.data.gameId));
        console.log(`✅ Demande WebSocket pour rejoindre le jeu ${response.data.data.gameId} envoyée`);
      } catch (socketError) {
        // Ne pas faire échouer l'opération à cause d'une erreur WebSocket
        console.error('❌ Erreur WebSocket ignorée lors de la jonction au jeu:', socketError);
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ Erreur lors du démarrage de la partie dans la salle ${roomCode}:`, error);
      
      // Extraire et afficher les détails de l'erreur
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data: ${JSON.stringify(error.response.data)}`);
        console.error(`Headers: ${JSON.stringify(error.response.headers)}`);
      } else if (error.request) {
        console.error(`Aucune réponse reçue: ${JSON.stringify(error.request)}`);
      }
      
      // Essayer d'extraire un message d'erreur spécifique
      let errorMessage = 'Erreur lors du démarrage de la partie.';
      if (error.response?.data?.error || error.response?.data?.message) {
        errorMessage = error.response.data.error || error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error(`Message d'erreur: ${errorMessage}`);
      throw error;
    }
  }

  static async leaveRoom(roomCode: string) {
    try {
      console.log(`🚪 Tentative de quitter la salle ${roomCode}`);
      
      // Vérification de la connexion internet
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.error('❌ Pas de connexion internet disponible');
        throw new Error('Pas de connexion internet. Veuillez vérifier votre connexion et réessayer.');
      }

      console.log(`🌐 Envoi de la requête pour quitter la salle ${roomCode}`);
      const response = await axios.post(`/rooms/${roomCode}/leave`, {});
      console.log('✅ Salle quittée avec succès:', response.data?.status);
      
      // Essayer de quitter la salle via WebSocket
      try {
        await SocketService.leaveRoom(roomCode);
        console.log(`✅ Demande WebSocket pour quitter la salle ${roomCode} envoyée`);
      } catch (socketError) {
        // Ne pas faire échouer l'opération à cause d'une erreur WebSocket
        console.error('❌ Erreur WebSocket ignorée:', socketError);
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ Erreur lors de la tentative de quitter la salle ${roomCode}:`, error);
      throw error;
    }
  }
  
  static async toggleReadyStatus(roomCode: string, isReady: boolean) {
    try {
      console.log(`🔄 Mise à jour du statut dans la salle ${roomCode}: ${isReady ? 'prêt' : 'pas prêt'}`);
      
      // Vérification de la connexion internet
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.error('❌ Pas de connexion internet disponible');
        throw new Error('Pas de connexion internet. Veuillez vérifier votre connexion et réessayer.');
      }

      console.log(`🌐 Envoi de la requête pour mettre à jour le statut`);
      const response = await axios.post(`/rooms/${roomCode}/ready`, { isReady });
      console.log('✅ Statut mis à jour avec succès:', response.data?.status);
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ Erreur lors de la mise à jour du statut:`, error);
      throw error;
    }
  }
}

export default RoomService;
