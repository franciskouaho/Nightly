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
  private readonly CACHE_TTL = 1000; // 1 seconde
  private readonly REQUEST_TIMEOUT = 5000; // 5 secondes au lieu de 2

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
        console.log('🔄 GameService: Tentative de réactivation du WebSocket');
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
      console.error(`❌ Phase invalide détectée: ${from} -> ${to}`);
      return false;
    }
    return this.PHASE_TRANSITIONS[from]?.includes(to) || false;
  }

  // Ajoute une méthode dédiée pour le fallback REST
  private async fetchGameStateViaRest(gameId: string, userId: string) {
    const url = `/games/${gameId}`;
    console.log('🔐 API Request: GET', url);
    if (userId && api && api.defaults) {
      api.defaults.headers.userId = String(userId);
    }
    const response = await api.get(url);
    const gameData = response.data.data;
    // Mettre à jour le cache
    this.gameStateCache.set(gameId, {
      state: gameData,
      timestamp: Date.now()
    });
    console.log('✅ GameService: État du jeu', gameId, 'récupéré avec succès (REST)');
    return gameData;
  }

  // Récupérer l'état actuel du jeu, priorité au WebSocket
  async getGameState(gameId: string, retryCount = 0, maxRetries = 3): Promise<GameState> {
    console.log(`🎮 GameService: Récupération de l'état du jeu ${gameId} via API REST`);

    // Récupérer l'ID utilisateur
    const userId = await UserIdManager.getUserId();
    if (!userId) {
      throw new Error("ID utilisateur non disponible");
    }

    // Vérifier si on a des données en cache récentes
    const cachedData = this.gameStateCache.get(gameId);
    if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_TTL) {
      console.log(`🗄️ GameService: Utilisation du cache récent pour ${gameId}`);
      return cachedData.state;
    }

    // Récupérer l'état via API REST
    try {
      const gameData = await this.fetchGameStateViaRest(gameId, userId);
      
      // Mettre à jour le cache
      this.gameStateCache.set(gameId, {
        state: gameData,
        timestamp: Date.now()
      });

      return gameData;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération via API REST:`, error);
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
      console.warn('⚠️ Erreur lors de la persistence de l\'état du jeu:', error);
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
      console.warn('⚠️ Erreur lors de la récupération de l\'état persitant du jeu:', error);
      return null;
    }
  }

  /**
   * Soumettre une réponse à une question directement via HTTP REST
   */
  async submitAnswer(gameId: string, questionId: string, content: string) {
    console.log(`🎮 GameService: Soumission de réponse pour le jeu ${gameId}, question ${questionId}`);
    
    try {
      // Récupérer l'ID utilisateur
      const userId = await UserIdManager.getUserId();
      console.log(`👤 GameService: Soumission de réponse par utilisateur ${userId}`);
      
      // Utiliser directement HTTP REST pour une fiabilité maximale
      console.log('🌐 Envoi de la réponse via HTTP REST...');
      
      const response = await api.post(`/games/${gameId}/answer`, {
        question_id: questionId,
        content: content,
        user_id: userId,
      }, {
        timeout: 5000
      });
      
      if (response.data?.status === 'success') {
        console.log('✅ Réponse soumise avec succès via HTTP');
        return true;
      } else {
        console.error('❌ Réponse du serveur inattendue:', response.data);
        throw new Error(response.data?.error || 'Échec de la soumission via HTTP');
      }
    } catch (error) {
      console.error('❌ GameService: Erreur lors de la soumission de la réponse:', error);
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
      console.log(`🎮 [GameService] Début de la soumission du vote pour le jeu ${gameId}, réponse ${answerId}`);
      
      const socket = await gameWebSocketService.ensureSocketConnection(gameId);
      const userId = await UserIdManager.getUserId();
      
      if (!userId) {
        throw new Error("ID utilisateur non disponible");
      }
      
      return new Promise((resolve, reject) => {
        console.log(`⏱️ [GameService] Démarrage du timeout de ${this.REQUEST_TIMEOUT}ms pour le vote`);
        
        const timeout = setTimeout(() => {
          console.error(`❌ [GameService] Timeout de soumission du vote après ${this.REQUEST_TIMEOUT}ms`);
          reject(new Error('Timeout de soumission du vote'));
        }, this.REQUEST_TIMEOUT);
        
        console.log(`📤 [GameService] Émission du vote via WebSocket`);
        socket.emit('game:submit_vote', { gameId, answerId, userId }, (response: { success: boolean; error?: string }) => {
          clearTimeout(timeout);
          if (response?.success) {
            console.log(`✅ [GameService] Vote soumis avec succès`);
            resolve();
          } else {
            console.error(`❌ [GameService] Échec de la soumission du vote:`, response?.error);
            reject(new Error(response?.error || "Échec de la soumission du vote"));
          }
        });
      });
    } catch (error) {
      console.error(`❌ [GameService] Erreur lors de la soumission du vote:`, error);
      throw error;
    }
  }

  /**
   * Attend que la phase 'results' soit atteinte
   * @param gameId ID du jeu
   * @returns Promise résolue quand la phase 'results' est atteinte
   */
  async waitForResultsPhase(gameId: string): Promise<void> {
    try {
      const startTime = Date.now();
      const maxWaitTime = 10000; // 10 secondes au lieu de 15
      
      while (Date.now() - startTime < maxWaitTime) {
        const gameState = await this.getGameState(gameId, true);
        
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
      console.log(`👑 Vérification si utilisateur ${userId} est l'hôte de ${gameId}`);
      
      // S'assurer que la connexion WebSocket est active
      await gameWebSocketService.ensureSocketConnection(String(gameId));
      
      // Utiliser la méthode d'instance au lieu de la méthode statique
      return await gameWebSocketService.isUserHost(String(gameId));
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification de l'hôte:`, error);
      return false;
    }
  }

  /**
   * Passer au tour suivant via HTTP uniquement
   */
  async nextRound(gameId: string, forceAdvance: boolean = false): Promise<any> {
    try {
      console.log(`🌐 Passage au tour suivant via HTTP direct pour le jeu ${gameId}`);
      
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
      
      console.log(`✅ Réponse du serveur pour passage au tour suivant:`, response.data);
      
      if (response.data?.status === 'success') {
        // Forcer un rafraîchissement des données après un court délai
        setTimeout(() => this.getGameState(gameId, 0, 1, true), 500);
        return response.data;
      } else {
        throw new Error(response.data?.message || "Échec du passage au tour suivant");
      }
    } catch (error) {
      console.error(`❌ Erreur lors du passage au tour suivant:`, error);
      throw error;
    }
  }

  /**
   * Force une transition de phase spécifique
   */
  async forcePhaseTransition(gameId: string, targetPhase: string): Promise<boolean> {
    try {
      console.log(`🎯 [GameService] Tentative de forcer la phase ${targetPhase} pour le jeu ${gameId}`);
      
      // Utiliser notre utilitaire de transition de phase
      const success = await GameStateHelper.forcePhaseTransition(gameId, targetPhase);
      
      if (success) {
        // Invalider le cache
        this.gameStateCache.delete(gameId);
        // Recharger les données
        await this.getGameState(gameId, 0, 1, true);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ [GameService] Erreur lors de la transition forcée:`, error);
      return false;
    }
  }

  /**
   * Force la transition vers la phase vote pour l'utilisateur ciblé
   */
  async forceVotePhaseForTarget(gameId: string): Promise<boolean> {
    try {
      console.log(`🎯 [GameService] Tentative de forcer la phase vote pour la cible du jeu ${gameId}`);
      
      // Utiliser notre utilitaire dédié
      const success = await GameStateHelper.forceVotePhaseForTarget(gameId);
      
      if (success) {
        // Invalider le cache pour forcer un rafraîchissement
        this.gameStateCache.delete(gameId);
        // Recharger les données
        await this.getGameState(gameId, 0, 1, true);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ [GameService] Erreur lors du forçage de phase vote pour la cible:`, error);
      return false;
    }
  }

  // Ressynchroniser la connection WebSocket si nécessaire
  async ensureSocketConnection(gameId: string): Promise<boolean> {
    try {
      // Vérifier d'abord la connexion internet
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.error('❌ Pas de connexion internet disponible');
        return false;
      }

      // Tenter la connexion WebSocket
      let connected = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!connected && attempts < maxAttempts) {
        attempts++;
        console.log(`🔄 Tentative de connexion WebSocket ${attempts}/${maxAttempts}`);

        try {
          const socket = await gameWebSocketService.ensureSocketConnection(gameId);
          connected = socket && socket.connected;
          if (connected) {
            console.log('✅ Connexion WebSocket établie avec succès');
            return true;
          }
        } catch (error) {
          console.error(`❌ Erreur lors de la tentative ${attempts}:`, error);
          
          // Attendre avant la prochaine tentative
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      if (!connected) {
        console.error('❌ Échec de la connexion WebSocket après plusieurs tentatives');
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la connexion WebSocket:', error);
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
      console.error('❌ Erreur lors de la vérification forcée de la phase:', error);
      return false;
    }
  }

  /**
   * Force la transition vers la phase answer
   */
  async forceTransitionToAnswer(gameId: string): Promise<boolean> {
    try {
      console.log(`🔄 [GameService] Tentative de forcer la phase answer pour le jeu ${gameId}`);
      
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
      console.error(`❌ [GameService] Erreur lors de la transition forcée:`, error);
      return false;
    }
  }

  /**
   * Nettoyer le cache interne
   */
  clearCache(gameId?: string) {
    if (gameId) {
      this.gameStateCache.delete(gameId);
      console.log(`🧹 Cache effacé pour le jeu ${gameId}`);
    } else {
      this.gameStateCache.clear();
      console.log('🧹 Cache entièrement effacé');
    }
  }
}

const gameService = new GameService();
export default gameService;

// Fonction utilitaire pour sécuriser les emits
function safeEmit(socket: any, ...args: any[]) {
  if (!socket || !socket.connected) {
    console.error('❌ [WebSocket] Tentative d\'emit sur un socket non connecté ou undefined', { socket });
    return;
  }
  socket.emit(...args);
}
