import socketManager from '@/services/socket/socketManager';
import { Player } from '@/types/roomTypes';

/**
 * Service pour gérer les interactions WebSocket spécifiques aux salles
 */
class RoomSocketService {
  /**
   * Rejoint une salle via WebSocket
   */
  async joinRoom(roomCode: string): Promise<boolean> {
    try {
      // Activer l'initialisation automatique des sockets
      socketManager.setAutoInit(true);
      
      // Obtenir une instance socket
      const socket = await socketManager.getInstanceAsync(true);
      if (!socket) return false;
      
      // Rejoindre la salle
      return await socketManager.joinRoom(roomCode);
    } catch (error) {
      return false;
    }
  }

  /**
   * Quitte une salle via WebSocket
   */
  async leaveRoom(roomCode: string): Promise<boolean> {
    return socketManager.leaveRoom(roomCode);
  }

  /**
   * Change le statut "prêt" d'un joueur dans la salle
   */
  async toggleReady(roomCode: string, isReady: boolean, userId: string): Promise<boolean> {
    const socket = socketManager.getSocketInstance();
    if (!socket || !socket.connected) return false;
    
    return new Promise((resolve) => {
      socket.emit('room:toggle_ready', { roomCode, isReady, userId }, (response: any) => {
        resolve(response && response.success !== false);
      });
    });
  }

  /**
   * Démarre une partie dans une salle
   */
  async startGame(roomCode: string): Promise<{ success: boolean; gameId?: string }> {
    const socket = socketManager.getSocketInstance();
    if (!socket || !socket.connected) return { success: false };
    
    return new Promise((resolve) => {
      socket.emit('room:start_game', { roomCode }, (response: any) => {
        if (response && response.success && response.gameId) {
          resolve({ success: true, gameId: response.gameId });
        } else {
          resolve({ success: false });
        }
      });
    });
  }

  /**
   * S'abonne aux événements de mise à jour d'une salle
   */
  subscribeToRoomUpdates(
    roomCode: string, 
    onPlayersUpdate: (players: Player[]) => void,
    onPlayerJoin: (player: Player) => void,
    onPlayerLeave: (playerId: string | number) => void,
    onGameStart: (data: { gameId: string }) => void
  ): () => void {
    const socket = socketManager.getSocketInstance();
    if (!socket) return () => {};
    
    const handleRoomUpdate = (data: any) => {
      if (!data) return;
      
      switch (data.type) {
        case 'players':
          if (Array.isArray(data.players)) {
            onPlayersUpdate(data.players);
          }
          break;
        case 'player_joined':
          if (data.player) {
            onPlayerJoin(data.player);
          }
          break;
        case 'player_left':
          if (data.playerId) {
            onPlayerLeave(data.playerId);
          }
          break;
        case 'game_started':
          if (data.gameId) {
            onGameStart({ gameId: data.gameId });
          }
          break;
      }
    };
    
    socket.on('room:update', handleRoomUpdate);
    
    // Fonction de nettoyage
    return () => {
      const currentSocket = socketManager.getSocketInstance();
      if (currentSocket) {
        currentSocket.off('room:update', handleRoomUpdate);
      }
    };
  }

  /**
   * Vérifier si l'utilisateur est l'hôte de la salle
   */
  async isRoomHost(roomCode: string, userId: string): Promise<boolean> {
    const socket = socketManager.getSocketInstance();
    if (!socket || !socket.connected) return false;
    
    return new Promise((resolve) => {
      socket.emit('room:check_host', { roomCode, userId }, (response: any) => {
        resolve(response?.isHost || false);
      });
    });
  }
}

export default new RoomSocketService(); 