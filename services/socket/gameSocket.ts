import socketManager from '@/services/socket/socketManager';
import { 
  GameState, 
  Question as GameQuestion, 
  Vote as GameVote,
  Game, 
  Player, 
  Answer, 
  Vote, 
  GamePhase, 
  GameAction, 
  GameEvent 
} from '@/types/gameTypes';

// Type personnalisé pour les données d'un tour puisqu'il n'est pas explicitement défini dans les types
interface GameRound {
  roundNumber: number;
  question?: GameQuestion;
  answers?: Array<any>;
  votes?: Array<GameVote>;
}

/**
 * Service pour gérer les interactions WebSocket spécifiques aux jeux
 */
class GameSocketService {
  /**
   * Rejoint un canal de jeu via WebSocket
   */
  async joinGameChannel(gameId: string): Promise<boolean> {
    try {
      // Activer l'initialisation automatique des sockets
      socketManager.setAutoInit(true);
      
      // Obtenir une instance socket
      const socket = await socketManager.getInstanceAsync(true);
      if (!socket) return false;
      
      // Rejoindre le canal de jeu
      return await socketManager.joinGameChannel(gameId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Quitte un canal de jeu via WebSocket
   */
  async leaveGameChannel(gameId: string): Promise<boolean> {
    return socketManager.leaveGameChannel(gameId);
  }

  /**
   * Soumet une réponse à une question de jeu
   */
  async submitAnswer(gameId: string, answer: string): Promise<boolean> {
    const socket = socketManager.getSocketInstance();
    if (!socket || !socket.connected) return false;
    
    return new Promise((resolve) => {
      socket.emit('game:submit_answer', { gameId, answer }, (response: any) => {
        resolve(response && response.success !== false);
      });
    });
  }

  /**
   * Soumet un vote pour une réponse
   */
  async submitVote(gameId: string, answerId: string | number): Promise<boolean> {
    const socket = socketManager.getSocketInstance();
    if (!socket || !socket.connected) return false;
    
    return new Promise((resolve) => {
      socket.emit('game:submit_vote', { gameId, answerId }, (response: any) => {
        resolve(response && response.success !== false);
      });
    });
  }

  /**
   * Passer au tour suivant
   */
  async nextRound(gameId: string): Promise<boolean> {
    const socket = socketManager.getSocketInstance();
    if (!socket || !socket.connected) return false;
    
    return new Promise((resolve) => {
      socket.emit('game:next_round', { gameId }, (response: any) => {
        resolve(response && response.success !== false);
      });
    });
  }

  /**
   * Récupère l'état actuel du jeu
   */
  async getGameState(gameId: string): Promise<GameState | null> {
    const socket = socketManager.getSocketInstance();
    if (!socket || !socket.connected) return null;
    
    return new Promise((resolve) => {
      socket.emit('game:state', { gameId }, (response: any) => {
        if (response && response.success && response.state) {
          resolve(response.state as GameState);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * S'abonne aux événements de mise à jour d'un jeu
   */
  subscribeToGameUpdates(
    gameId: string,
    onStateUpdate: (state: GameState) => void,
    onNewQuestion: (question: GameQuestion) => void,
    onNewAnswer: (answer: { playerId: string; answer: string }) => void,
    onNewVote: (vote: GameVote) => void,
    onRoundEnd: (roundData: GameRound) => void,
    onGameEnd: (result: any) => void
  ): () => void {
    const socket = socketManager.getSocketInstance();
    if (!socket) return () => {};
    
    const handleGameUpdate = (data: any) => {
      if (!data) return;
      
      switch (data.type) {
        case 'state_update':
          if (data.state) {
            onStateUpdate(data.state);
          }
          break;
        case 'new_question':
          if (data.question) {
            onNewQuestion(data.question);
          }
          break;
        case 'new_answer':
          if (data.playerId && data.answer) {
            onNewAnswer({ playerId: data.playerId, answer: data.answer });
          }
          break;
        case 'new_vote':
          if (data.vote) {
            onNewVote(data.vote);
          }
          break;
        case 'round_end':
          if (data.round) {
            onRoundEnd(data.round);
          }
          break;
        case 'game_end':
          if (data.result) {
            onGameEnd(data.result);
          }
          break;
      }
    };
    
    socket.on('game:update', handleGameUpdate);
    
    // Fonction de nettoyage
    return () => {
      const currentSocket = socketManager.getSocketInstance();
      if (currentSocket) {
        currentSocket.off('game:update', handleGameUpdate);
      }
    };
  }

  /**
   * Vérifier si l'utilisateur est l'hôte du jeu
   */
  async isUserHost(gameId: string, userId: string): Promise<boolean> {
    const socket = socketManager.getSocketInstance();
    if (!socket || !socket.connected) return false;
    
    return new Promise((resolve) => {
      socket.emit('game:check_host', { gameId, userId }, (response: any) => {
        resolve(response?.isHost || false);
      });
    });
  }
}

export default new GameSocketService(); 