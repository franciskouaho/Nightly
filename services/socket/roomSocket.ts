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
    try {
      console.log(`🎮 RoomSocketService: Tentative de démarrage de la partie dans la salle ${roomCode}`);
      
      // Vérifier si un socket existe et est connecté
      let socket = socketManager.getSocketInstance();
      
      // Si pas de socket ou pas connecté, tenter de l'initialiser
      if (!socket || !socket.connected) {
        console.log(`🔄 RoomSocketService: Socket non connecté, tentative d'initialisation...`);
        try {
          socket = await socketManager.getInstanceAsync(true);
          
          // Vérifier si l'initialisation a réussi
          if (!socket || !socket.connected) {
            console.error(`❌ RoomSocketService: Échec d'initialisation du socket`);
            return { success: false };
          }
          
          console.log(`✅ RoomSocketService: Socket initialisé avec succès (${socket.id})`);
          
          // Tenter de rejoindre la salle avant de démarrer la partie
          const joinResult = await socketManager.joinRoom(roomCode);
          if (!joinResult) {
            console.warn(`⚠️ RoomSocketService: Impossible de rejoindre la salle ${roomCode}, mais on continue`);
          } else {
            console.log(`✅ RoomSocketService: Salle ${roomCode} rejointe avec succès`);
          }
        } catch (error) {
          console.error(`❌ RoomSocketService: Erreur lors de l'initialisation du socket:`, error);
          return { success: false };
        }
      }
      
      // Vérifier à nouveau si le socket est disponible après les tentatives
      socket = socketManager.getSocketInstance();
      if (!socket || !socket.connected) {
        console.error(`❌ RoomSocketService: Socket toujours non disponible après les tentatives`);
        return { success: false };
      }
      
      console.log(`🚀 RoomSocketService: Émission de l'événement room:start_game pour ${roomCode}`);
      
      return new Promise((resolve) => {
        // Ajouter un timeout pour éviter de bloquer indéfiniment
        const timeout = setTimeout(() => {
          console.warn(`⚠️ RoomSocketService: Timeout lors du démarrage de la partie dans ${roomCode}`);
          resolve({ success: false });
        }, 10000);
        
        socket!.emit('room:start_game', { roomCode }, (response: any) => {
          clearTimeout(timeout);
          
          if (response && response.success && response.gameId) {
            console.log(`✅ RoomSocketService: Partie démarrée avec succès dans ${roomCode}, gameId: ${response.gameId}`);
            resolve({ success: true, gameId: response.gameId });
          } else {
            console.warn(`⚠️ RoomSocketService: Échec du démarrage de la partie dans ${roomCode}:`, response);
            resolve({ success: false });
          }
        });
        
        // Écouter également l'événement game_started en cas de problème avec le callback
        socket!.once('game:started', (data: any) => {
          clearTimeout(timeout);
          
          if (data && data.gameId) {
            console.log(`✅ RoomSocketService: Partie démarrée avec succès via l'événement game:started, gameId: ${data.gameId}`);
            resolve({ success: true, gameId: data.gameId });
          }
        });
      });
    } catch (error) {
      console.error(`❌ RoomSocketService: Exception lors du démarrage de la partie:`, error);
      return { success: false };
    }
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