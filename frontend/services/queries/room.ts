import axios from '@/config/axios';
import SocketService from '@/services/socketService';
import { GameType } from '@/types/gameTypes';

export interface Room {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  startedAt?: string;
  status?: 'waiting' | 'playing' | 'finished';
  maxPlayers?: number;
  gameMode?: string;
  gameType?: string;
  host: {
    id: number;
    username: string;
    displayName?: string;
    avatar?: string;
  };
  players?: Array<{
    id: number;
    username: string;
    displayName?: string;
    isHost?: boolean;
    isReady?: boolean;
    avatar?: string;
    level?: number;
  }>;
}

export interface CreateRoomPayload {
  name: string;
  game_mode: string;
  gameType?: GameType;
  is_private?: boolean;
  max_players?: number;
  total_rounds?: number;
  settings?: Record<string, any>;
}

export interface ReadyStatusPayload {
  is_ready: boolean;
}

class RoomService {  
  // Liste toutes les salles disponibles
  async getRooms(): Promise<Room[]> {
    console.log('📋 Récupération de la liste des salles');
    try {
      const url = `/rooms`;
      console.log('🌐 Envoi requête GET:', url);
      
      const response = await axios.get(url);
      
      console.log('✅ Réponse salles reçue:', response.status);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des salles:', error);
      throw error;
    }
  }

  // Récupère les détails d'une salle spécifique
  async getRoomByCode(roomCode: string): Promise<Room> {
    console.log(`🔍 Récupération des détails de la salle ${roomCode}`);
    try {
      const url = `/rooms/${roomCode}`;
      console.log('🌐 Envoi requête GET:', url);
      
      const response = await axios.get(url);
      
      console.log('✅ Détails de la salle reçus:', response.status);
      return response.data.data;
    } catch (error: any) {
      console.error(`❌ Erreur lors de la récupération de la salle ${roomCode}:`, error);
      throw error;
    }
  }

  // Crée une nouvelle salle
  async createRoom(payload: CreateRoomPayload): Promise<Room> {
    console.log('🏗️ Création d\'une nouvelle salle avec payload:', payload);
    try {
      // Format simplifié sans transformations complexes
      const formattedPayload = {
        name: payload.name,
        game_mode: payload.game_mode,
        game_type: payload.gameType || GameType.QUIZ,
        max_players: payload.max_players || 6,
        total_rounds: payload.total_rounds || 5,
        is_private: payload.is_private || false,
        settings: payload.settings || {}
      };
      
      const url = `/rooms`;
      console.log('🌐 Envoi requête POST:', url, formattedPayload);
      
      const response = await axios.post(url, formattedPayload);
      
      console.log('✅ Salle créée avec succès:', response.status);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de la salle:', error);
      throw error;
    }
  }

  // Rejoindre une salle
  async joinRoom(roomCode: string): Promise<{ status: string; message: string }> {
    console.log(`🚪 Tentative de rejoindre la salle ${roomCode}`);
    try {
      const url = `/rooms/${roomCode}/join`;
      console.log('🌐 Envoi requête POST:', url);
      
      try {
        const response = await axios.post(url, {});
        
        console.log('✅ Salle rejointe avec succès:', response.status);
        
        // Rejoindre également via WebSocket après succès HTTP en utilisant try/catch
        try {
          SocketService.joinRoom(roomCode);
          console.log(`✅ Demande WebSocket pour rejoindre la salle ${roomCode} envoyée`);
        } catch (socketError) {
          console.error('❌ Erreur WebSocket ignorée:', socketError);
        }
        
        return response.data;
      } catch (axiosError: any) {
        console.error(`❌ Erreur HTTP lors de la tentative de rejoindre la salle ${roomCode}:`, 
          axiosError.response?.status || 'Sans statut', 
          axiosError.response?.data || axiosError.message);
        throw axiosError;
      }
    } catch (error: any) {
      console.error(`❌ Erreur lors de la tentative de rejoindre la salle ${roomCode}:`, error);
      throw error;
    }
  }

  // Quitter une salle
  async leaveRoom(roomCode: string): Promise<{ status: string; message: string }> {
    console.log(`🚶 Tentative de quitter la salle ${roomCode}`);
    try {
      const url = `/rooms/${roomCode}/leave`;
      console.log('🌐 Envoi requête POST:', url);
      
      const response = await axios.post(url, {});
      
      console.log('✅ Salle quittée avec succès:', response.status);
      
      // Également quitter la salle via WebSocket
      try {
        SocketService.leaveRoom(roomCode);
        console.log(`✅ Demande WebSocket pour quitter la salle ${roomCode} envoyée`);
      } catch (socketError) {
        console.error('❌ Erreur WebSocket ignorée lors de la tentative de quitter:', socketError);
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ Erreur lors de la tentative de quitter la salle ${roomCode}:`, error);
      throw error;
    }
  }

  // Change le statut "prêt" d'un joueur dans une salle
  async toggleReadyStatus(roomCode: string, isReady: boolean): Promise<any> {
    console.log(`🔄 Changement du statut dans la salle ${roomCode}: ${isReady ? 'prêt' : 'pas prêt'}`);
    try {
      // Vérification des paramètres
      if (!roomCode) {
        console.error('❌ Code de salle manquant pour toggleReadyStatus');
        throw new Error('Code de salle manquant');
      }
      
      // Construction du corps de la requête
      const payload = { is_ready: isReady }; // Le backend attend "is_ready" (avec un underscore)
      
      // Log détaillé de la requête
      console.log(`🌐 Envoi requête POST pour status:`, { url: `/rooms/${roomCode}/ready`, payload, headers: axios.defaults.headers });
      
      const response = await axios.post(`/rooms/${roomCode}/ready`, payload);
      
      console.log(`✅ Statut mis à jour avec succès dans la salle ${roomCode}:`, response.status);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Erreur lors de la mise à jour du statut dans la salle ${roomCode}:`, error);
      // Log détaillé en cas d'erreur axios
      if (error.response) {
        console.error('Détails erreur:', { 
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw error;
    }
  }

  // Démarrer la partie
  async startGame(roomCode: string): Promise<{ status: string; message: string; data: { gameId: number } }> {
    console.log(`🚀 Tentative de démarrage de la partie dans la salle ${roomCode}`);
    try {
      // Vérification des paramètres
      if (!roomCode) {
        console.error('❌ Code de salle manquant pour startGame');
        throw new Error('Code de salle manquant');
      }
      
      const url = `/rooms/${roomCode}/start`;
      
      // Log détaillé de la requête
      console.log('🌐 Envoi requête POST pour démarrage:', { url, headers: axios.defaults.headers });
      
      // Récupérer la salle avant de démarrer pour vérifier l'état des joueurs
      console.log('🔍 Vérification de l\'état de la salle avant démarrage');
      const roomCheck = await this.getRoomByCode(roomCode);
      
      if (roomCheck && roomCheck.players) {
        const notReady = roomCheck.players.filter(p => !p.isHost && !p.isReady);
        if (notReady.length > 0) {
          console.warn(`⚠️ ${notReady.length} joueurs ne sont pas prêts:`, notReady.map(p => p.username));
        } else {
          console.log('✅ Tous les joueurs sont prêts!');
        }
      }
      
      const response = await axios.post(url, {});
      
      console.log('✅ Partie démarrée avec succès:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Erreur lors du démarrage de la partie dans la salle ${roomCode}:`, error);
      // Log détaillé en cas d'erreur axios
      if (error.response) {
        console.error('Détails erreur:', { 
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw error;
    }
  }
}

export const roomService = new RoomService();
