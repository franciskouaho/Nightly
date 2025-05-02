import SocketService from '@/services/socketService';
import UserIdManager from '@/utils/userIdManager';

class GameWebSocketService {
  /**
   * Rejoint le canal de jeu avec Socket.IO
   */
  async joinGameChannel(gameId: string): Promise<boolean> {
    try {
      // Nous activons l'initialisation automatique des sockets pour les jeux
      SocketService.setAutoInit(true);
      
      // Récupérer une instance du socket (avec forceInit=true pour s'assurer qu'elle est disponible)
      const socket = await SocketService.getInstanceAsync(true);
      
      if (!socket) {
        return false;
      }
      
      // Récupérer l'ID utilisateur pour le logging
      const userId = await UserIdManager.getUserId();
      
      return new Promise((resolve) => {
        // Événement de succès via 'game:joined'
        socket.once('game:joined', (data) => {
          resolve(true);
        });
        
        // Événement d'erreur
        socket.once('error', (error) => {
          resolve(false);
        });
        
        // Émettre l'événement pour rejoindre le jeu
        socket.emit('join-game', { data: { gameId } }, (response: any) => {
          if (response && response.success !== false) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Quitte le canal de jeu avec Socket.IO
   */
  async leaveGameChannel(gameId: string): Promise<boolean> {
    try {
      // On vérifie d'abord si le socket est connecté
      if (!SocketService.isConnected()) {
        return true;
      }
      
      const socket = SocketService.getSocketInstance();
      if (!socket) {
        return true;
      }
      
      return new Promise((resolve) => {
        // Émettre l'événement pour quitter le jeu
        socket.emit('leave-game', { gameId }, (response: any) => {
          if (response && response.success !== false) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Vérifie si l'utilisateur est l'hôte du jeu
   */
  async isUserHost(gameId: string): Promise<boolean> {
    try {
      // Récupérer l'ID utilisateur
      const userId = await UserIdManager.getUserId();
      if (!userId) {
        return false;
      }
      
      // Si le socket n'est pas connecté, on ne peut pas vérifier
      if (!SocketService.isConnected()) {
        return false;
      }
      
      const socket = SocketService.getSocketInstance();
      if (!socket) {
        return false;
      }
      
      return new Promise((resolve) => {
        // Émettre l'événement pour vérifier si l'utilisateur est l'hôte
        socket.emit('game:check_host', { gameId, userId }, (response: any) => {
          resolve(response?.isHost || false);
        });
      });
    } catch (error) {
      return false;
    }
  }
}

export default new GameWebSocketService();
