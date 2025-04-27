import io, { Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import UserIdManager from '@/utils/userIdManager';

// Interface pour les informations de connexion
interface ISocketConnectionInfo {
  url: string;
  path: string;
  token: string;
}

/**
 * Gestionnaire de Socket.IO centralisé
 * Responsable de la connexion socket et des fonctionnalités de base
 */
class SocketManager {
  private socket: Socket | null = null;
  private initPromise: Promise<Socket> | null = null;
  private isInitializing: boolean = false;
  private reconnectAttempts: number = 0;
  private isConnecting: boolean = false;
  private activeRooms: Set<string> = new Set();
  private activeGames: Set<string> = new Set();
  private autoInit: boolean = false;
  
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private readonly RECONNECT_DELAY = 2000; // 2 secondes

  constructor() {
    // Désactiver l'initialisation automatique par défaut
    this.autoInit = false;
  }

  /**
   * Active ou désactive l'initialisation automatique
   */
  setAutoInit(enabled: boolean): void {
    this.autoInit = enabled;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔌 Initialisation automatique des sockets: ${enabled ? 'activée' : 'désactivée'}`);
    }
  }

  /**
   * Récupère l'instance du socket (méthode synchrone)
   */
  getSocketInstance(): Socket | null {
    return this.socket;
  }

  /**
   * Vérifie si le socket est connecté
   */
  isConnected(): boolean {
    return !!this.socket && this.socket.connected;
  }

  /**
   * Initialise la connexion socket
   */
  async initialize(forceInit: boolean = false): Promise<Socket> {
    // Si l'initialisation n'est pas forcée et autoInit est false, ne pas se connecter
    if (!forceInit && !this.autoInit) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔌 Initialisation Socket.IO reportée (pas de forceInit)');
      }
      throw new Error('Socket.IO initialization postponed - explicit initialization required');
    }

    // Si l'initialisation est déjà en cours, retourner la promesse existante
    if (this.initPromise) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔌 Connexion Socket.IO déjà en cours, attente...');
      }
      return this.initPromise;
    }

    // Si le socket existe déjà et est connecté, le retourner directement
    if (this.socket && this.socket.connected) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Socket.IO déjà initialisé et connecté');
      }
      return this.socket;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('🔌 Initialisation de la connexion Socket.IO...');
    }
    this.isInitializing = true;

    // Créer une promesse pour l'initialisation
    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        // Vérifier la connexion internet
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          this.isInitializing = false;
          this.initPromise = null;
          reject(new Error('Pas de connexion internet'));
          return;
        }

        // Récupérer l'ID utilisateur et le token
        const userId = await UserIdManager.getUserId();
        const token = await AsyncStorage.getItem('auth_token');

        // Initialiser le socket avec le SOCKET_URL configuré
        this.socket = io(SOCKET_URL, {
          transports: ['websocket'],
          timeout: 30000,
          reconnection: true,
          reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          autoConnect: true,
          auth: {
            userId,
            token: token ? `Bearer ${token}` : undefined
          },
          forceNew: true,
        });

        // Configurer les écouteurs d'événements
        this.setupEventListeners();

        // Résoudre la promesse une fois connecté
        this.socket.once('connect', () => {
          this.reconnectAttempts = 0;
          this.isInitializing = false;
          resolve(this.socket!);
        });

      } catch (error) {
        this.isInitializing = false;
        this.initPromise = null;
        reject(error);
      }
    });

    return this.initPromise;
  }

  /**
   * Configure les écouteurs d'événements sur le socket
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ Socket.IO connecté avec ID: ${this.socket?.id}`);
      }
      this.reconnectAttempts = 0;
    });

    this.socket.on('connect_error', (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`❌ Erreur de connexion Socket.IO:`, error);
      }

      if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
        this.reconnectAttempts++;
        setTimeout(() => {
          this.reconnect().catch(() => {/* Ignorer l'erreur ici */});
        }, this.RECONNECT_DELAY);
      }
    });

    this.socket.on('error', (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`❌ Erreur Socket:`, error);
      }
    });

    this.socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`🔌 Socket.IO déconnecté: ${reason}`);
      }
      
      if (reason === 'io server disconnect' || reason === 'transport close') {
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          this.reconnectAttempts++;
          setTimeout(() => {
            this.reconnect().catch(() => {/* Ignorer l'erreur ici */});
          }, this.RECONNECT_DELAY);
        }
      }
    });
  }

  /**
   * Récupère l'instance socket de manière asynchrone
   * Initialise la connexion si nécessaire et si autoInit ou forceInit est true
   */
  async getInstanceAsync(forceInit: boolean = false): Promise<Socket> {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }
    
    // Si l'initialisation n'est pas activée et pas forcée, renvoyer une erreur
    if (!this.autoInit && !forceInit) {
      throw new Error('Socket not initialized and autoInit is disabled');
    }
    
    // Si forceInit=true, utiliser ensureConnection pour être plus résilient
    if (forceInit) {
      return this.ensureConnection();
    }
    
    return this.initialize(forceInit);
  }

  /**
   * Assure qu'une connexion socket est établie
   * Tente plusieurs fois de se connecter en cas d'échec
   */
  private async ensureConnection(maxAttempts: number = 3): Promise<Socket> {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        // Activer l'auto-init pour cette tentative
        this.autoInit = true;

        // Si une initialisation est déjà en cours, attendre son résultat
        if (this.initPromise) {
          const socket = await this.initPromise;
          if (socket && socket.connected) {
            return socket;
          }
        }

        // Sinon initialiser une nouvelle connexion
        this.initPromise = null; // Réinitialiser pour forcer une nouvelle tentative
        const socket = await this.initialize(true);
        
        if (!socket) {
          throw new Error('Socket non initialisé');
        }

        if (!socket.connected) {
          socket.connect();
          
          // Attendre la connexion
          await new Promise<void>((resolve, reject) => {
            if (socket) {
              socket.once('connect', () => {
                resolve();
              });
            } else {
              reject(new Error('Socket non défini'));
            }
          });
        }
        
        if (socket && socket.connected) {
          return socket;
        } else {
          throw new Error('Socket non connecté après tentative de connexion');
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Attendre avant la prochaine tentative
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw lastError || new Error('Impossible d\'établir une connexion socket après plusieurs tentatives');
  }

  /**
   * Reconnecte le socket si déconnecté
   */
  async reconnect(): Promise<boolean> {
    try {
      if (this.socket && this.socket.connected) {
        return true;
      }
      
      // Limiter les tentatives de reconnexion
      if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
        this.reconnectAttempts = 0;
      }
      
      this.reconnectAttempts++;
      
      // Si déjà en initialisation, attendre le résultat
      if (this.isInitializing && this.initPromise) {
        try {
          const socket = await this.initPromise;
          if (socket && socket.connected) return true;
          
          // Si le socket n'est pas connecté après l'initialisation, essayer de le connecter
          if (socket) {
            socket.connect();
          
            // Attendre la connexion
            return await new Promise((resolve) => {
              socket.once('connect', () => {
                resolve(true);
              });

              // Capturons également l'erreur de connexion
              socket.once('connect_error', () => {
                resolve(false);
              });
            });
          }
          return false;
        } catch {
          // Continuer avec une nouvelle tentative
        }
      }
      
      // Si le socket existe mais est déconnecté, essayer de le reconnecter
      if (this.socket) {
        if (!this.socket.connected) {
          this.socket.connect();
          
          // Attendre la reconnexion
          return new Promise((resolve) => {
            if (this.socket) {
              this.socket.once('connect', () => {
                resolve(true);
              });

              this.socket.once('connect_error', () => {
                resolve(false);
              });
            } else {
              resolve(false);
            }
          });
        }
        return true;
      }
      
      // Sinon, initialiser une nouvelle connexion
      try {
        const socket = await this.ensureConnection();
        return socket.connected;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Rejoint une salle
   */
  async joinRoom(roomCode: string): Promise<boolean> {
    return this.ensureSocketConnection()
      .then(connected => {
        if (!connected || !this.socket) {
          return false;
        }
        
        return new Promise<boolean>((resolve) => {
          if (this.socket) {
            // Écouter l'événement de succès
            this.socket.once('room:joined', () => {
              this.activeRooms.add(roomCode);
              resolve(true);
            });
            
            // Écouter les erreurs
            this.socket.once('error', () => {
              resolve(false);
            });
            
            // Envoyer la requête pour rejoindre la room
            this.socket.emit('join-room', { data: { roomId: roomCode } }, (response: any) => {
              if (response && response.success !== false) {
                this.activeRooms.add(roomCode);
                resolve(true);
              } else {
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
        });
      })
      .catch(() => false);
  }

  /**
   * Quitte une salle
   */
  async leaveRoom(roomCode: string): Promise<boolean> {
    try {
      if (!this.socket || !this.socket.connected) {
        this.activeRooms.delete(roomCode);
        return false;
      }
      
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.emit('leave-room', { roomCode }, (response: any) => {
            this.activeRooms.delete(roomCode);
            resolve(response && response.success !== false);
          });
          
          // Si pas de callback disponible, considérer comme succès avec un autre événement
          this.socket.once('room:left', (data) => {
            this.activeRooms.delete(roomCode);
            if (data && data.roomCode === roomCode) {
              resolve(true);
            }
          });
        } else {
          this.activeRooms.delete(roomCode);
          resolve(false);
        }
      });
    } catch (error) {
      this.activeRooms.delete(roomCode);
      return false;
    }
  }

  /**
   * Rejoint un canal de jeu
   */
  async joinGame(gameId: string): Promise<boolean> {
    try {
      console.log(`🎮 Tentative de rejoindre le canal du jeu ${gameId}`);
      
      // S'assurer que la connexion est bien établie
      await this.ensureSocketConnection();
      
      const socket = this.getSocketInstance();
      if (!socket) {
        console.error("❌ Socket non disponible pour rejoindre le jeu");
        return false;
      }
      
      // Vérifier si déjà dans ce canal
      if (this.activeGames.has(gameId)) {
        console.log(`✅ Déjà dans le canal du jeu ${gameId}`);
        return true;
      }

      // Préparer les données pour l'événement
      const joinData = { gameId };
      
      return new Promise((resolve) => {
        // Définir un timeout pour éviter de bloquer indéfiniment
        const timeoutId = setTimeout(() => {
          console.error(`❌ Délai dépassé pour rejoindre le jeu ${gameId}`);
          resolve(false);
        }, 5000);
        
        // Tenter de rejoindre avec une promesse
        socket.emit('join-game', { data: joinData }, (response: any) => {
          clearTimeout(timeoutId);
          
          if (response && response.success) {
            this.activeGames.add(gameId);
            console.log(`✅ Canal du jeu ${gameId} rejoint avec succès`);
            resolve(true);
          } else {
            console.error(`❌ Erreur lors de la tentative de rejoindre le jeu ${gameId}:`, response?.error || 'Erreur inconnue');
            resolve(false);
          }
        });
        
        // Émettre un deuxième événement au format game:join pour compatibilité
        socket.emit('game:join', { gameId }, (response: any) => {
          // Ne pas résoudre ici car déjà fait dans l'autre émission
          console.log(`ℹ️ Réponse secondaire game:join:`, response);
        });
      });
    } catch (error) {
      console.error(`❌ Erreur lors de la tentative de rejoindre le jeu ${gameId}:`, error);
      return false;
    }
  }

  /**
   * Quitte un jeu
   */
  async leaveGame(gameId: string): Promise<boolean> {
    try {
      if (!this.socket || !this.socket.connected) {
        this.activeGames.delete(gameId);
        return false;
      }
      
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.emit('leave-game', { gameId }, (response: any) => {
            this.activeGames.delete(gameId);
            resolve(response && response.success !== false);
          });
          
          // Si pas de callback disponible, considérer comme succès avec un autre événement
          this.socket.once('game:left', (data) => {
            this.activeGames.delete(gameId);
            if (data && data.gameId === gameId) {
              resolve(true);
            }
          });
        } else {
          this.activeGames.delete(gameId);
          resolve(false);
        }
      });
    } catch {
      this.activeGames.delete(gameId);
      return false;
    }
  }

  /**
   * Force une vérification de la phase du jeu
   */
  async forcePhaseCheck(gameId: string): Promise<boolean> {
    try {
      if (!this.socket || !this.socket.connected) {
        await this.reconnect();
      }
      
      if (!this.socket || !this.socket.connected) {
        return false;
      }
      
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.emit('game:force_check', { gameId }, (response: any) => {
            resolve(response && response.success !== false);
          });
        } else {
          resolve(false);
        }
      });
    } catch {
      return false;
    }
  }

  /**
   * Vérifie si l'utilisateur est l'hôte d'un jeu
   */
  async isGameHost(gameId: string): Promise<boolean> {
    try {
      const userId = await UserIdManager.getUserId();
      if (!userId || !this.socket || !this.socket.connected) {
        return false;
      }
      
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.emit('game:check_host', { gameId, userId }, (response: any) => {
            resolve(response?.isHost || false);
          });
        } else {
          resolve(false);
        }
      });
    } catch {
      return false;
    }
  }

  /**
   * Nettoie la connexion, à appeler lors de la déconnexion de l'application
   */
  async cleanup(): Promise<void> {
    // Quitter toutes les salles actives
    for (const roomCode of this.activeRooms) {
      try {
        await this.leaveRoom(roomCode);
      } catch {}
    }
    
    // Quitter tous les jeux actifs
    for (const gameId of this.activeGames) {
      try {
        await this.leaveGame(gameId);
      } catch {}
    }
    
    // Déconnecter le socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Réinitialiser les propriétés
    this.initPromise = null;
    this.isInitializing = false;
    this.reconnectAttempts = 0;
    this.activeRooms.clear();
    this.activeGames.clear();
  }

  /**
   * Assure que la connexion socket est établie
   */
  private async ensureSocketConnection(): Promise<boolean> {
    // Si déjà connecté, on renvoie true immédiatement
    if (this.socket && this.socket.connected) {
      return true;
    }

    try {
      // Récupération du socket
      const connectionInfo = await this.getConnectionInfo();
      
      this.socket = io(connectionInfo.url, {
        path: connectionInfo.path,
        autoConnect: false,
        transports: ['websocket'],
        timeout: 30000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        query: {
          'token': connectionInfo.token
        }
      });

      // Définition des écouteurs d'événements
      if (this.socket) {
        this.setupEventListeners();
      }

      // Tentative de connexion
      return new Promise((resolve) => {
        this.isConnecting = true;
        
        if (this.socket) {
          this.socket.connect();

          // Cas de connexion réussie
          this.socket.once('connect', () => {
            this.isConnecting = false;
            resolve(true);
          });

          // En cas d'erreur de connexion
          this.socket.once('connect_error', () => {
            this.isConnecting = false;
            resolve(false);
          });
        } else {
          this.isConnecting = false;
          resolve(false);
        }
      });
    } catch {
      this.isConnecting = false;
      return false;
    }
  }

  /**
   * Récupère les informations de connexion
   */
  private async getConnectionInfo(): Promise<ISocketConnectionInfo> {
    const token = await AsyncStorage.getItem('auth_token') || '';
    
    return {
      url: SOCKET_URL,
      path: '',
      token: token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Utilitaire de diagnostic pour l'analyse des problèmes
   */
  diagnose(): Record<string, any> {
    return {
      isConnected: this.isConnected(),
      socketId: this.socket?.id || null,
      isInitializing: this.isInitializing,
      reconnectAttempts: this.reconnectAttempts,
      activeRooms: Array.from(this.activeRooms),
      activeGames: Array.from(this.activeGames),
      hasListeners: this.socket ? Object.keys(this.socket.listeners || {}).length > 0 : false,
    };
  }
}

// Création d'une instance unique
const socketManager = new SocketManager();

// Export pour maintenir la compatibilité avec le code existant
export default {
  initialize: (forceInit?: boolean) => socketManager.initialize(forceInit),
  getSocketInstance: () => socketManager.getSocketInstance(),
  getInstanceAsync: (forceInit?: boolean) => socketManager.getInstanceAsync(forceInit),
  isConnected: () => socketManager.isConnected(),
  setAutoInit: (enabled: boolean) => socketManager.setAutoInit(enabled),
  reconnect: () => socketManager.reconnect(),
  joinRoom: (roomCode: string) => socketManager.joinRoom(roomCode),
  leaveRoom: (roomCode: string) => socketManager.leaveRoom(roomCode),
  joinGame: (gameId: string) => socketManager.joinGame(gameId),
  joinGameChannel: (gameId: string) => socketManager.joinGame(gameId), // Aliasing for compatibility
  leaveGameChannel: (gameId: string) => socketManager.leaveGame(gameId), // Aliasing for compatibility
  forcePhaseCheck: (gameId: string) => socketManager.forcePhaseCheck(gameId),
  isGameHost: (gameId: string) => socketManager.isGameHost(gameId),
  cleanup: () => socketManager.cleanup(),
  diagnose: () => socketManager.diagnose()
}; 