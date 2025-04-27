import SocketService from '@/services/socketService';
import UserIdManager from '@/utils/userIdManager';

class GameWebSocketService {
  /**
   * Rejoint le canal de jeu avec Socket.IO
   */
  async joinGameChannel(gameId: string): Promise<boolean> {
    try {
      console.log(`🎮 [GameWebSocket] Tentative de rejoindre le jeu ${gameId}`);
      
      // Nous activons l'initialisation automatique des sockets pour les jeux
      SocketService.setAutoInit(true);
      console.log(`🔌 Initialisation automatique des sockets: activée`);
      
      // Récupérer une instance du socket (avec forceInit=true pour s'assurer qu'elle est disponible)
      console.log(`🔄 Récupération d'une instance socket avec forceInit=true`);
      const socket = await SocketService.getInstanceAsync(true);
      
      if (!socket) {
        console.error('❌ [GameWebSocket] Socket non disponible après tentative d\'initialisation');
        return false;
      }
      
      console.log(`🔌 État du socket: ${socket.connected ? 'connecté' : 'non connecté'}, ID: ${socket.id || 'non défini'}`);
      
      // Récupérer l'ID utilisateur pour le logging
      const userId = await UserIdManager.getUserId();
      console.log(`👤 [GameWebSocket] Tentative de jointure au jeu ${gameId} pour l'utilisateur ${userId || 'inconnu'}`);
      
      return new Promise((resolve) => {
        // Événement de succès via 'game:joined'
        socket.once('game:joined', (data) => {
          console.log(`✅ [GameWebSocket] Événement game:joined reçu pour le jeu ${gameId}`, data);
          resolve(true);
        });
        
        // Événement d'erreur
        socket.once('error', (error) => {
          console.error(`❌ [GameWebSocket] Événement d'erreur reçu:`, error);
          resolve(false);
        });
        
        // Émettre l'événement pour rejoindre le jeu
        console.log(`📣 [GameWebSocket] Émission de l'événement join-game pour ${gameId}`);
        socket.emit('join-game', { data: { gameId } }, (response: any) => {
          if (response && response.success !== false) {
            console.log(`✅ [GameWebSocket] Jeu ${gameId} rejoint avec succès via callback`);
            resolve(true);
          } else {
            console.warn(`⚠️ [GameWebSocket] Échec de rejoindre le jeu ${gameId}:`, response?.error || 'Raison inconnue');
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error(`❌ [GameWebSocket] Erreur lors de la tentative de rejoindre le jeu ${gameId}:`, error);
      return false;
    }
  }
  
  /**
   * Quitte le canal de jeu avec Socket.IO
   */
  async leaveGameChannel(gameId: string): Promise<boolean> {
    try {
      console.log(`🎮 GameWebSocketService: Tentative de quitter le canal de jeu ${gameId}`);
      
      // On vérifie d'abord si le socket est connecté
      if (!SocketService.isConnected()) {
        console.log(`ℹ️ Socket déjà déconnecté, rien à faire pour quitter ${gameId}`);
        return true;
      }
      
      const socket = SocketService.getSocketInstance();
      if (!socket) {
        console.warn('⚠️ Socket non disponible, considéré comme déjà quitté');
        return true;
      }
      
      return new Promise((resolve) => {
        // Émettre l'événement pour quitter le jeu
        socket.emit('leave-game', { gameId }, (response: any) => {
          if (response && response.success !== false) {
            console.log(`✅ Jeu ${gameId} quitté avec succès`);
            resolve(true);
          } else {
            console.warn(`⚠️ Échec de quitter le jeu ${gameId}:`, response?.error || 'Raison inconnue');
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error(`❌ Erreur lors de la tentative de quitter le jeu ${gameId}:`, error);
      return false;
    }
  }
  
  /**
   * Vérifie si l'utilisateur est l'hôte du jeu
   */
  async isUserHost(gameId: string): Promise<boolean> {
    try {
      console.log(`🎮 GameWebSocketService: Vérification si l'utilisateur est l'hôte du jeu ${gameId}`);
      
      // Récupérer l'ID utilisateur
      const userId = await UserIdManager.getUserId();
      if (!userId) {
        console.error('❌ ID utilisateur non disponible');
        return false;
      }
      
      // Si le socket n'est pas connecté, on ne peut pas vérifier
      if (!SocketService.isConnected()) {
        console.warn('⚠️ Socket non connecté, impossible de vérifier le statut d\'hôte');
        return false;
      }
      
      const socket = SocketService.getSocketInstance();
      if (!socket) {
        console.warn('⚠️ Socket non disponible, impossible de vérifier le statut d\'hôte');
        return false;
      }
      
      return new Promise((resolve) => {
        // Émettre l'événement pour vérifier si l'utilisateur est l'hôte
        socket.emit('game:check_host', { gameId, userId }, (response: any) => {
          resolve(response?.isHost || false);
        });
      });
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification du statut d'hôte:`, error);
      return false;
    }
  }
}

export default new GameWebSocketService();
