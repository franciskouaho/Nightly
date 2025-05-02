import api from '@/config/axios';
import { Answer, GameState } from '@/types/gameTypes';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserIdManager from '@/utils/userIdManager';
import gameWebSocketService from '@/services/gameWebSocketService';
import GameStateHelper from '@/utils/gameStateHelper';
import SocketService from '@/services/socketService';

const PHASE_ORDER = {
  question: ['question'],
  answer: ['answer'],
  vote: ['vote'],
  results: ['results'],
  waiting: ['waiting']
} as const;

type GamePhase = keyof typeof PHASE_ORDER;

class GameService {
  // Cache pour stocker temporairement les états des jeux
  private gameStateCache: Map<string, {state: any, timestamp: number}> = new Map();
  private socketEnabled: boolean = true;
  private socketFailCounter: number = 0;
  private readonly MAX_SOCKET_FAILS = 3;
  private readonly SOCKET_RESET_INTERVAL = 30000; // 30 secondes
  private readonly CACHE_TTL = 5000; // 5 secondes
  private readonly REQUEST_TIMEOUT = 5000; // 5 secondes

  // Liste des phases valides du jeu
  private readonly VALID_PHASES = ['question', 'answer', 'vote', 'results', 'waiting'] as const;
  private readonly PHASE_TRANSITIONS: Record<string, string[]> = {
    'question': ['answer'],
    'answer': ['vote', 'waiting'],
    'vote': ['results'],
    'results': ['question'],
    'waiting': ['question', 'answer', 'vote']
  };

  private readonly phaseOrder = PHASE_ORDER;

  constructor() {
    // Vérifier périodiquement si on peut réactiver le socket
    setInterval(() => {
      if (!this.socketEnabled && this.socketFailCounter < this.MAX_SOCKET_FAILS) {
        this.socketEnabled = true;
      }
    }, this.SOCKET_RESET_INTERVAL);
  }

  // Vérifier si une phase est valide
  private isValidPhase(phase: string): boolean {
    return this.VALID_PHASES.includes(phase as any);
  }

  // Vérifier si une transition de phase est valide
  private isValidTransition(from: string, to: string): boolean {
    if (!this.isValidPhase(from) || !this.isValidPhase(to)) {
      return false;
    }
    return this.PHASE_TRANSITIONS[from]?.includes(to) || false;
  }

  // Ajoute une méthode dédiée pour le fallback REST
  private async fetchGameStateViaRest(gameId: string | number, userId: string) {
    // Si gameId est une chaîne et correspond à un type de jeu spécial
    if (typeof gameId === 'string' && gameId === 'truth-or-dare') {
      const url = '/games';
      if (userId && api && api.defaults) {
        api.defaults.headers.userId = String(userId);
      }
      // Rechercher le jeu par mode de jeu
      const response = await api.get(url, {
        params: {
          gameMode: 'action-verite',
          status: 'in_progress'
        }
      });
      
      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('Aucun jeu action-vérité en cours trouvé');
      }
      
      // Utiliser le premier jeu trouvé
      const gameData = response.data.data[0];
      this.gameStateCache.set(String(gameId), {
        state: gameData,
        timestamp: Date.now()
      });
      return gameData;
    } else {
      // Cas normal avec ID numérique
      const url = `/games/${gameId}`;
      if (userId && api && api.defaults) {
        api.defaults.headers.userId = String(userId);
      }
      const response = await api.get(url);
      const gameData = response.data.data;
      this.gameStateCache.set(String(gameId), {
        state: gameData,
        timestamp: Date.now()
      });
      return gameData;
    }
  }

  // Récupérer l'état actuel du jeu, priorité au WebSocket
  async getGameState(gameId: string | number, retryCount = 0, maxRetries = 3): Promise<GameState> {
    const userId = await UserIdManager.getUserId();
    if (!userId) {
      throw new Error("ID utilisateur non disponible");
    }

    // Vérifier si on a des données en cache récentes
    const cachedData = this.gameStateCache.get(String(gameId));
    if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_TTL) {
      return cachedData.state;
    }

    // Récupérer l'état via API REST
    try {
      const gameData = await this.fetchGameStateViaRest(gameId, userId);
      
      // Mettre à jour le cache
      this.gameStateCache.set(String(gameId), {
        state: gameData,
        timestamp: Date.now()
      });

      return gameData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Persiste l'état du jeu dans AsyncStorage
   */
  private async persistGameState(gameId: string, state: GameState): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `game_state_${gameId}`, 
        JSON.stringify({
          state,
          timestamp: Date.now()
        })
      );
    } catch (error) {
    }
  }

  /**
   * Récupère l'état du jeu depuis AsyncStorage
   */
  private async loadPersistedGameState(gameId: string): Promise<GameState | null> {
    try {
      const savedState = await AsyncStorage.getItem(`game_state_${gameId}`);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        
        // Vérifier si l'état n'est pas trop ancien (moins de 5 minutes)
        if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          return parsed.state;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Soumettre une réponse à une question directement via HTTP REST
   */
  async submitAnswer(gameId: string, questionId: string, content: string) {
    try {
      // Récupérer l'ID utilisateur
      const userId = await UserIdManager.getUserId();
      
      // Utiliser directement HTTP REST pour une fiabilité maximale
      const response = await api.post(`/games/${gameId}/answer`, {
        question_id: questionId,
        content: content,
        user_id: userId,
      }, {
        timeout: 5000
      });
      
      if (response.data?.status === 'success') {
        return true;
      } else {
        throw new Error(response.data?.error || 'Échec de la soumission via HTTP');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Soumet un vote pour une réponse
   * @param gameId ID du jeu
   * @param answerId ID de la réponse choisie
   * @returns Promise résolue quand le vote est soumis
   */
  async submitVote(gameId: string, answerId: string): Promise<void> {
    try {
      const userId = await UserIdManager.getUserId();
      
      if (!userId) {
        throw new Error("ID utilisateur non disponible");
      }

      // Récupérer l'état du jeu pour obtenir l'ID de la question actuelle
      const gameState = await this.getGameState(gameId);
      const currentQuestion = gameState.currentQuestion;
      
      if (!currentQuestion || !currentQuestion.id) {
        throw new Error("Question actuelle non trouvée");
      }
      
      const response = await api.post(`/games/${gameId}/vote`, {
        answer_id: answerId,
        question_id: currentQuestion.id,
        voter_id: userId,
      }, {
        timeout: 5000
      });
      
      if (response.data?.status === 'success') {
        return;
      } else {
        throw new Error(response.data?.error || 'Échec de la soumission du vote');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * @returns Promise résolue quand la phase 'results' est atteinte
   */
  async waitForResultsPhase(gameId: string): Promise<void> {
    try {
      const startTime = Date.now();
      const maxWaitTime = 10000; // 10 secondes au lieu de 15
      
      while (Date.now() - startTime < maxWaitTime) {
        const gameState = await this.getGameState(gameId, 1);
        
        if (gameState?.game?.currentPhase === 'results') {
          return;
        }
        
        await new Promise(res => setTimeout(res, 500)); // 500ms au lieu de 1000ms
      }
      
      throw new Error('Timeout en attendant la phase de résultats');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Vérifier si un utilisateur est l'hôte d'une salle ou d'un jeu
   */
  async isUserRoomHost(gameId: string | number, userId: string | number): Promise<boolean> {
    try {
      await gameWebSocketService.ensureSocketConnection(String(gameId));
      
      // Utiliser la méthode d'instance au lieu de la méthode statique
      return await gameWebSocketService.isUserHost(String(gameId));
    } catch (error) {
      return false;
    }
  }

  /**
   * Passer au tour suivant via HTTP uniquement
   */
  async nextRound(gameId: string, forceAdvance: boolean = false): Promise<any> {
    try {
      // Invalider immédiatement le cache pour forcer un rechargement après
      this.gameStateCache.delete(gameId);
      
      // Récupérer l'ID utilisateur
      const userId = await UserIdManager.getUserId();
      if (!userId) {
        throw new Error("ID utilisateur non disponible");
      }
      
      // Faire la requête HTTP directement
      const response = await api.post(`/games/${gameId}/next-round`, {
        user_id: userId,
        force_advance: forceAdvance
      }, {
        headers: {
          'X-Direct-Method': 'true'
        },
        timeout: 8000 // timeout plus long pour assurer une chance de succès
      });
      
      if (response.data?.status === 'success') {
        // Forcer un rafraîchissement des données après un court délai
        setTimeout(() => this.getGameState(gameId), 500);
        return response.data;
      } else {
        throw new Error(response.data?.message || "Échec du passage au tour suivant");
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Force une transition de phase spécifique
   */
  async forcePhaseTransition(gameId: string, targetPhase: string): Promise<boolean> {
    try {
      // Utiliser notre utilitaire de transition de phase
      const success = await GameStateHelper.forcePhaseTransition(gameId, targetPhase);
      
      if (success) {
        // Invalider le cache
        this.gameStateCache.delete(gameId);
        // Recharger les données
        await this.getGameState(gameId);
      }
      
      return success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Force la transition vers la phase vote pour l'utilisateur ciblé
   */
  async forceVotePhaseForTarget(gameId: string): Promise<boolean> {
    try {
      // Utiliser notre utilitaire dédié
      const success = await GameStateHelper.forceVotePhaseForTarget(gameId);
      
      if (success) {
        // Invalider le cache pour forcer un rafraîchissement
        this.gameStateCache.delete(gameId);
        // Recharger les données
        await this.getGameState(gameId);
      }
      
      return success;
    } catch (error) {
      return false;
    }
  }

  // Ressynchroniser la connection WebSocket si nécessaire
  async ensureSocketConnection(gameId: string): Promise<boolean> {
    try {
      // Vérifier d'abord la connexion internet
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        return false;
      }

      // Tenter la connexion WebSocket
      let connected = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!connected && attempts < maxAttempts) {
        attempts++;

        try {
          const socket = await gameWebSocketService.ensureSocketConnection(gameId);
          connected = socket && socket.connected;
          if (connected) {
            return true;
          }
        } catch (error) {
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      if (!connected) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Force la vérification de la phase du jeu
   */
  async forcePhaseCheck(gameId: string): Promise<boolean> {
    try {
      // S'assurer que la connexion WebSocket est active
      await gameWebSocketService.ensureSocketConnection(gameId);
      
      return await gameWebSocketService.forceCheckPhase(gameId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Force la transition vers la phase answer
   */
  async forceTransitionToAnswer(gameId: string): Promise<boolean> {
    try {
      // S'assurer que la connexion WebSocket est active
      await this.ensureSocketConnection(gameId);
      
      // Utiliser directement socketService au lieu de GameWebSocketService
      const socket = await SocketService.getInstanceAsync();
      
      return new Promise((resolve) => {
        // Définir un timeout de 5 secondes
        const timeout = setTimeout(() => {
          resolve(false);
        }, this.REQUEST_TIMEOUT);
        
        // Émettre l'événement pour forcer la phase answer
        safeEmit(socket, 'game:force_phase', {
          gameId,
          targetPhase: 'answer'
        }, (response: any) => {
          clearTimeout(timeout);
          resolve(response?.success || false);
        });
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Nettoyer le cache interne
   */
  clearCache(gameId?: string) {
    if (gameId) {
      this.gameStateCache.delete(gameId);
    } else {
      this.gameStateCache.clear();
    }
  }
}

const gameService = new GameService();
export default gameService;

// Fonction utilitaire pour sécuriser les emits
function safeEmit(socket: any, ...args: any[]) {
  if (!socket || !socket.connected) {
    return;
  }
  socket.emit(...args);
}
