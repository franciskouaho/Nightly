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
  private readonly SOCKET_RESET_INTERVAL = 60000; // 1 minute

  // Liste des phases valides du jeu
  private readonly VALID_PHASES = ['question', 'answer', 'vote', 'results', 'waiting'] as const;
  private readonly PHASE_TRANSITIONS = {
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
  async getGameState(gameId: string, retryCount = 0, maxRetries = 3, forceWebSocket = true) {
    console.log(`🎮 GameService: Récupération de l'état du jeu ${gameId}${forceWebSocket ? ' (WebSocket forcé)' : ''}`);

    // Récupérer l'ID utilisateur
    const userId = await UserIdManager.getUserId();
    if (!userId) {
      throw new Error("ID utilisateur non disponible");
    }

    // Fallback REST immédiat si WebSocket désactivé
    if (!this.socketEnabled && !forceWebSocket) {
      console.warn("⚠️ WebSocket désactivé, fallback immédiat à l'API REST");
      return this.fetchGameStateViaRest(gameId, userId);
    }

    // Vérifier si on a des données en cache récentes avant de passer à l'API REST
    const cachedData = this.gameStateCache.get(gameId);
    if (cachedData && Date.now() - cachedData.timestamp < 5000 && !forceWebSocket) { // Cache très récent (5 secondes)
      console.log(`🗄️ GameService: Utilisation du cache récent pour ${gameId} au lieu de l'API REST`);
      return cachedData.state;
    }

    // Essayer d'abord via WebSocket (nouvelle méthode préférée) si le socket est activé
    if (this.socketEnabled || forceWebSocket) {
      try {
        // Vérifier que la connexion WebSocket est bien établie avant de continuer
        const socket = await gameWebSocketService.ensureSocketConnection(gameId);
        
        console.log(`🔌 Tentative de récupération via WebSocket pour ${gameId}`);
        const gameData = await gameWebSocketService.getGameState(gameId);
        
        // Réinitialiser le compteur d'échecs puisque ça a fonctionné
        this.socketFailCounter = 0;
        this.socketEnabled = true;
        
        // Correction du statut isTargetPlayer si nécessaire
        if (gameData.currentQuestion?.targetPlayer && userId) {
          const targetId = String(gameData.currentQuestion.targetPlayer.id);
          const userIdStr = String(userId);
          
          const isReallyTarget = targetId === userIdStr;
          
          if (gameData.currentUserState && gameData.currentUserState.isTargetPlayer !== isReallyTarget) {
            console.log(`🔧 Correction d'incohérence isTargetPlayer: ${gameData.currentUserState.isTargetPlayer} => ${isReallyTarget}`);
            gameData.currentUserState.isTargetPlayer = isReallyTarget;
          }
        }

        // Mettre à jour le cache
        this.gameStateCache.set(gameId, {
          state: gameData,
          timestamp: Date.now()
        });

        return gameData;
      } catch (wsError) {
        console.error(`❌ Erreur lors de la récupération via WebSocket:`, wsError);
        
        // Incrémenter le compteur d'échecs du WebSocket
        this.socketFailCounter++;
        
        // Si on a dépassé le nombre maximum de échecs, désactiver temporairement le WebSocket
        if (this.socketFailCounter >= this.MAX_SOCKET_FAILS) {
          console.warn(`⚠️ Trop d'échecs WebSocket (${this.socketFailCounter}). WebSocket temporairement désactivé.`);
          this.socketEnabled = false;
        }
        
        // Si forceWebSocket est activé, on réessaie encore une fois sans forcage avant de passer au REST
        if (forceWebSocket) {
          console.log('🔄 Nouvelle tentative sans forcage WebSocket...');
          return this.getGameState(gameId, retryCount, maxRetries, false);
        }
      }
    }
    
    // Fallback via REST API comme avant
    console.log(`🔄 Fallback à l'API REST pour récupérer l'état du jeu ${gameId}`);
    
    // Le reste du code reste le même
    const url = `/games/${gameId}`;
    console.log('🔐 API Request: GET', url);
    
    // Appliquer l'ID utilisateur aux headers de manière sécurisée
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
    
    console.log('✅ GameService: État du jeu', gameId, 'récupéré avec succès');
    return gameData;
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
        timeout: 8000  // Augmenter le timeout pour assurer la réception
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
      console.log(`🗳️ Soumission du vote pour la réponse ${answerId} dans le jeu ${gameId}`);
      
      // Tenter d'abord via WebSocket
      try {
        const socket = await gameWebSocketService.ensureSocketConnection(gameId);
        socket.emit('game:vote', { gameId, answerId });
        return;
      } catch (error) {
        console.error(`❌ Erreur lors de la soumission du vote via WebSocket:`, error);
        throw new Error('Impossible de soumettre le vote : connexion WebSocket indisponible');
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la soumission du vote:`, error);
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
      console.log(`⏳ Attente de la phase 'results' pour le jeu ${gameId}`);
      
      // Tenter d'abord via WebSocket
      try {
        const socket = await gameWebSocketService.ensureSocketConnection(gameId);
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout en attente de la phase results'));
          }, 30000);

          socket.once('game:phase_changed', (data: { phase: string }) => {
            if (data.phase === 'results') {
              clearTimeout(timeout);
              resolve();
            }
          });
        });
      } catch (error) {
        console.error(`❌ Erreur lors de l'attente de la phase via WebSocket:`, error);
        throw new Error('Impossible d\'attendre la phase results : connexion WebSocket indisponible');
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'attente de la phase results:`, error);
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
        timeout: 12000 // timeout plus long pour assurer une chance de succès
      });
      
      console.log(`✅ Réponse du serveur pour passage au tour suivant:`, response.data);
      
      if (response.data?.status === 'success') {
        // Forcer un rafraîchissement des données après un court délai
        setTimeout(() => this.getGameState(gameId, 0, 1, true), 800);
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
      console.log(`🔄 [GameService] Tentative de forcer la phase ${targetPhase} pour le jeu ${gameId}`);
      
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
  async ensureSocketConnection(gameId: string) {
    try {
      return await gameWebSocketService.ensureSocketConnection(gameId);
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
      
      return new Promise((resolve, reject) => {
        // Définir un timeout de 5 secondes
        const timeout = setTimeout(() => {
          reject(new Error('Timeout dépassé pour la transition forcée'));
        }, 5000);
        
        // Émettre l'événement pour forcer la phase answer
        safeEmit(socket, 'game:force_phase', {
          gameId,
          targetPhase: 'answer'
        }, (response: any) => {
          clearTimeout(timeout);
          
          if (response && response.success) {
            console.log(`✅ [GameService] Transition forcée réussie vers phase answer`);
            resolve(true);
          } else {
            console.error(`❌ [GameService] Échec de la transition forcée:`, response?.error || 'Raison inconnue');
            resolve(false);
          }
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
