import api from '@/config/axios';
import SocketService from '@/services/socketService';
import { GameType } from '@/types/gameTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  // List all available rooms
  async getRooms(): Promise<Room[]> {
    try {
      const url = `/rooms`;
      const response = await api.get(url);
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  }

  // Get details of a specific room
  async getRoomByCode(roomCode: string): Promise<Room> {
    try {
      const url = `/rooms/${roomCode}`;
      const response = await api.get(url);
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  }

  // Create a new room
  async createRoom(payload: CreateRoomPayload): Promise<Room> {
    try {
      // Simplified format without complex transformations
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
      const response = await api.post(url, formattedPayload);
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  }

  // Join a room
  async joinRoom(roomCode: string): Promise<{ status: string; message: string }> {
    try {
      const url = `/rooms/${roomCode}/join`;
      
      try {
        const response = await api.post(url, {});
        
        // Also join via WebSocket after HTTP success using try/catch
        try {
          SocketService.joinRoom(roomCode);
        } catch (socketError) {
          // Socket error ignored
        }
        
        return response.data;
      } catch (axiosError: any) {
        throw axiosError;
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Leave a room
  async leaveRoom(roomCode: string): Promise<{ status: string; message: string }> {
    try {
      const url = `/rooms/${roomCode}/leave`;
      const response = await api.post(url, {});
      
      // Also leave the room via WebSocket
      try {
        SocketService.leaveRoom(roomCode);
      } catch (socketError) {
        // Socket error ignored
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  // Change a player's ready status in a room
  async toggleReadyStatus(roomCode: string, isReady: boolean): Promise<any> {
    try {
      // Check parameters
      if (!roomCode) {
        throw new Error('Missing room code');
      }
      
      // Build request body
      const payload = { is_ready: isReady }; // Backend expects "is_ready" (with underscore)
      
      const response = await api.post(`/rooms/${roomCode}/ready`, payload);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  // Start the game
  async startGame(roomCode: string): Promise<{ status: string; message: string; data: { gameId: number } }> {
    try {
      // Check parameters
      if (!roomCode) {
        throw new Error('Missing room code');
      }
            
      // Try to join via socket before starting the game
      try {
        await SocketService.joinRoom(roomCode);
      } catch (socketError) {
        // Continuer même en cas d'erreur socket
      }
      
      // Make the start request with error handling
      try {
        console.log(`===== 🔴 IMPORTANT: REQUÊTE START ENVOYÉE À ${url} =====`);
        const response = await api.post(`/rooms/${roomCode}/start`);
        console.log(`===== 🔴 IMPORTANT: RÉPONSE REÇUE =====`, response.data);
        
        // Try to establish WebSocket connection to the game
        if (response.data?.data?.gameId) {
          try {
            await SocketService.joinGame(String(response.data.data.gameId));
          } catch (gameSocketError) {
            // Ignorer les erreurs de socket
          }
        }
        
        return response.data;
      } catch (startError: any) {
        throw startError;
      }
    } catch (error: any) {
      throw error;
    }
  }
}

// Export a singleton instance of RoomService
export const roomService = new RoomService();

