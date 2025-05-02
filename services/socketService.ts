import io, { Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import UserIdManager from '@/utils/userIdManager';

// Add this interface definition at the top of the file, near other interfaces
interface ISocketConnectionInfo {
  url: string;
  path: string;
  token: string;
}

class SocketService {
  private socket: Socket | null = null;
  private initPromise: Promise<Socket> | null = null;
  private activeRooms: Set<string> = new Set();
  private isInitializing: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 2000; // 2 secondes
  private autoInit: boolean = false; // Nouvelle propriété pour contrôler l'initialisation auto
  private isConnecting: boolean = false;
  private authService: any = null; // Add authService property

  /**
   * Initialise la connexion socket
   * Si vous voulez éviter les connexions automatiques, passez forceInit=true
   */
  async initialize(forceInit: boolean = false): Promise<Socket> {
    // Si l'initialisation n'est pas forcée et autoInit est false, ne pas se connecter
    if (!forceInit && !this.autoInit) {
      throw new Error('Socket.IO initialization postponed - explicit initialization required');
    }

    // Si l'initialisation est déjà en cours, retourner la promesse existante
    if (this.initPromise) {
      return this.initPromise;
    }

    // Si le socket existe déjà et est connecté, le retourner directement
    if (this.socket && this.socket.connected) {
      return this.socket;
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
        const token = await AsyncStorage.getItem('@auth_token');

        // Initialiser le socket avec le SOCKET_URL configuré
        this.socket = io(SOCKET_URL, {
          transports: ['websocket'],
          timeout: 30000, // Augmenté à 30 secondes
          reconnection: true,
          reconnectionAttempts: 10, // Augmenté à 10 tentatives
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          autoConnect: true,
          auth: {
            userId,
            token: token ? `Bearer ${token}` : undefined
          },
          forceNew: true,
        });

        // Écouter les événements de connexion
        this.socket.on('connect', () => {
          this.reconnectAttempts = 0;
          this.isInitializing = false;
          resolve(this.socket!);
        });

        this.socket.on('connect_error', (error) => {
          this.isInitializing = false;
          this.initPromise = null;
          
          // Tenter une reconnexion automatique
          if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            setTimeout(() => {
              this.reconnect().catch(err => {
              });
            }, this.RECONNECT_DELAY);
          }
          
          reject(error);
        });

        this.socket.on('error', (error) => {
          this.isInitializing = false;
          this.initPromise = null;
          reject(error);
        });

        // Écouter les événements de déconnexion
        this.socket.on('disconnect', (reason) => {
          // Essayer de se reconnecter automatiquement si la déconnexion n'est pas volontaire
          if (reason === 'io server disconnect' || reason === 'transport close') {
            if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
              this.reconnectAttempts++;
              setTimeout(() => {
                this.reconnect().catch(err => {
                });
              }, this.RECONNECT_DELAY);
            }
          }
        });

        // Nettoyer le timeout si la connexion réussit
        this.socket.once('connect', () => {
          // Connexion réussie
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
   * Assure qu'une connexion socket est établie
   * Tente plusieurs fois de se connecter en cas d'échec
   */
  async ensureConnection(maxAttempts: number = 3): Promise<Socket> {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
      attempts++;

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
    }

    throw lastError || new Error('Impossible d\'établir une connexion socket après plusieurs tentatives');
  }

  /**
   * Active ou désactive l'initialisation automatique des sockets
   */
  setAutoInit(enabled: boolean): void {
    this.autoInit = enabled;
  }

  /**
   * Récupère l'instance du socket (méthode synchrone)
   */
  getSocketInstance(): Socket | null {
    return this.socket;
  }

  /**
   * Récupère une instance socket de manière asynchrone (recommandé)
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
    
    // Si nous sommes dans un contexte critique (forceInit=true),
    // utiliser ensureConnection pour être plus résilient
    if (forceInit) {
      return this.ensureConnection();
    }
    
    return this.initialize(forceInit);
  }

  /**
   * Vérifie si le socket est connecté
   */
  isConnected(): boolean {
    return !!this.socket && this.socket.connected;
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
          
            // Attendre la connexion avec un timeout
            return await new Promise((resolve) => {
              const timeout = setTimeout(() => {
                resolve(false);
              }, 5000);
              
              socket.once('connect', () => {
                clearTimeout(timeout);
                resolve(true);
              });
            });
          }
          return false;
        } catch (error) {
        }
      }
      
      // Si le socket existe mais est déconnecté, essayer de le reconnecter
      if (this.socket) {
        if (!this.socket.connected) {
          this.socket.connect();
          
          // Attendre la reconnexion
          return new Promise((resolve) => {
            const timeout = setTimeout(() => {
              resolve(false);
            }, 5000);
            
            if (this.socket) {
              this.socket.once('connect', () => {
                clearTimeout(timeout);
                resolve(true);
              });
            } else {
              clearTimeout(timeout);
              resolve(false);
            }
          });
        }
        return true;
      }
      
      // Sinon, initialiser une nouvelle connexion et essayer
      // avec ensureConnection qui est plus robuste
      try {
        const socket = await this.ensureConnection();
        return socket.connected;
      } catch (e) {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Tente de rejoindre une salle avec plusieurs tentatives
   */
  async reconnectToRoom(roomCode: string, maxAttempts: number = 3): Promise<boolean> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        
        // S'assurer que le socket est connecté
        if (!this.isConnected()) {
          await this.reconnect();
        }
        
        // Tenter de rejoindre la salle
        const success = await this.joinRoom(roomCode);
        if (success) {
          return true;
        }
        
        await new Promise(resolve => setTimeout(resolve, this.RECONNECT_DELAY));
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, this.RECONNECT_DELAY));
      }
    }
    
    return false;
  }

  /**
   * Rejoint une salle
   */
  async joinRoom(roomCode: string): Promise<boolean> {
    if (this.socket && this.socket.connected) {
      return new Promise<boolean>((resolve) => {
        if (this.socket) {
          // Écouter l'événement de succès
          this.socket.once('room:joined', (data) => {
            resolve(true);
          });
          
          // Écouter les erreurs
          this.socket.once('error', (error) => {
            resolve(false);
          });
          
          // Envoyer la requête pour rejoindre la room
          this.socket.emit('join-room', { data: { roomId: roomCode } }, (response: any) => {
            if (response && response.success !== false) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      });
    }
    
    // Si le socket n'est pas connecté, on établit la connexion d'abord
    return this.ensureSocketConnection()
      .then(connected => {
        if (!connected) {
          return false;
        }
        
        if (!this.socket) {
          return false;
        }
        
        return new Promise<boolean>((resolve) => {
          // Écouter l'événement de succès
          if (this.socket) {
            this.socket.once('room:joined', (data) => {
              resolve(true);
            });
            
            // Écouter les erreurs
            this.socket.once('error', (error) => {
              resolve(false);
            });
            
            // Ajouter un timeout pour éviter de bloquer indéfiniment
            const timeout = setTimeout(() => {
              resolve(false);
            }, 5000);
            
            // Envoyer la requête pour rejoindre la room
            this.socket.emit('join-room', { data: { roomId: roomCode } }, (response: any) => {
              clearTimeout(timeout);
              if (response && response.success !== false) {
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
      .catch(error => {
        return false;
      });
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
            
            if (response && response.success !== false) {
              resolve(true);
            } else {
              resolve(false);
            }
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
   * Rejoint un jeu
   */
  async joinGame(gameId: string): Promise<boolean> {
    try {
      if (!this.socket || !this.socket.connected) {
        await this.reconnect();
      }
      
      if (!this.socket || !this.socket.connected) {
        throw new Error('Socket non connecté après tentative de reconnexion');
      }
      
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.emit('join-game', { gameId }, (response: any) => {
            if (response && response.success !== false) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
          
          // Si pas de callback disponible, considérer comme succès avec un autre événement
          this.socket.once('game:joined', (data) => {
            if (data && data.gameId === gameId) {
              resolve(true);
            }
          });
        } else {
          resolve(false);
        }
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Tente de rejoindre un canal de jeu (game channel)
   */
  async joinGameChannel(gameId: string): Promise<boolean> {
    try {
      if (!this.socket || !this.socket.connected) {
        await this.reconnect();
      }
      
      if (!this.socket || !this.socket.connected) {
        throw new Error('Socket non connecté après tentative de reconnexion');
      }
      
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.emit('join-game', { gameId }, (response: any) => {
            if (response && response.success !== false) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
          
          // Si pas de callback disponible, considérer comme succès avec un autre événement
          this.socket.once('game:joined', (data) => {
            if (data && data.gameId === gameId) {
              resolve(true);
            }
          });
        } else {
          resolve(false);
        }
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Quitte un canal de jeu 
   */
  async leaveGameChannel(gameId: string): Promise<boolean> {
    try {
      if (!this.socket || !this.socket.connected) {
        return false;
      }
      
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.emit('leave-game', { gameId }, (response: any) => {
            if (response && response.success !== false) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
          
          // Si pas de callback disponible, considérer comme succès avec un autre événement
          this.socket.once('game:left', (data) => {
            if (data && data.gameId === gameId) {
              resolve(true);
            }
          });
        } else {
          resolve(false);
        }
      });
    } catch (error) {
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
        throw new Error('Socket non connecté après tentative de reconnexion');
      }
      
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.emit('game:force_check', { gameId }, (response: any) => {
            if (response && response.success !== false) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      });
    } catch (error) {
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
      } catch (error) {
      }
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
      hasListeners: this.socket ? Object.keys(this.socket.listeners).length > 0 : false,
    };
  }

  private async connectWithRetry(maxRetries = 3, retryDelay = 5000) {
    let retryCount = 0;
    
    const connect = async () => {
      try {
        if (this.socket?.connected) {
          return;
        }

        console.log(`🔄 Tentative de connexion socket ${retryCount + 1}/${maxRetries}`);
        
        // Vérifier la connexion internet avant de tenter la connexion
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          throw new Error('Pas de connexion internet');
        }

        this.socket = io(SOCKET_URL, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: maxRetries,
          reconnectionDelay: retryDelay,
          timeout: 30000, // Augmenté à 30 secondes
          forceNew: true, // Forcer une nouvelle connexion
        });

        if (this.socket) {
          this.socket.on('connect', () => {
            console.log('✅ Socket connecté');
            retryCount = 0;
          });

          this.socket.on('connect_error', (error) => {
            console.error('❌ Erreur de connexion Socket.IO:', error);
            
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`⏳ Nouvelle tentative dans ${retryDelay/1000} secondes...`);
              setTimeout(connect, retryDelay);
            } else {
              console.error('❌ Nombre maximum de tentatives atteint');
            }
          });

          this.socket.on('disconnect', (reason) => {
            console.warn('🔌 Socket.IO déconnecté:', reason);
            
            if (reason === 'io server disconnect' || reason === 'transport close') {
              // Le serveur a déconnecté le socket, on peut essayer de se reconnecter
              if (this.socket) {
                this.socket.connect();
              }
            }
          });
        }

        // Attendre la connexion
        await new Promise((resolve, reject) => {
          if (this.socket) {
            this.socket.once('connect', () => {
              resolve(true);
            });
          } else {
            reject(new Error('Socket non initialisé'));
          }
        });

      } catch (error) {
        console.error('❌ Erreur lors de la connexion socket:', error);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`⏳ Nouvelle tentative dans ${retryDelay/1000} secondes...`);
          setTimeout(connect, retryDelay);
        } else {
          throw error;
        }
      }
    };

    await connect();
  }

  private async ensureSocketConnection(): Promise<boolean> {
    // Si déjà connecté, on renvoie true immédiatement
    if (this.socket && this.socket.connected) {
      return true;
    }

    // Préparer les informations pour la connexion
    const connectionInfo: ISocketConnectionInfo = await this.getConnectionInfo();
    
    try {
      // Récupération du socket
      this.socket = io(connectionInfo.url, {
        path: connectionInfo.path,
        autoConnect: false,
        transports: ['websocket'],
        timeout: 30000,  // Augmenté à 30 secondes
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10, // Augmenté à 10 tentatives
        query: {
          'token': connectionInfo.token
        }
      });

      // Définition des écouteurs d'événements
      if (this.socket) {
        this.socket.on('connect', () => {
          this.isConnecting = false;
        });

        this.socket.on('connect_error', (error) => {
          this.isConnecting = false;
        });

        this.socket.on('disconnect', (reason) => {
          // No action needed
        });

        this.socket.on('error', (error) => {
          // No action needed
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
          // No action needed
        });

        this.socket.on('reconnect_error', (error) => {
          // No action needed
        });

        this.socket.on('reconnect_failed', () => {
          // No action needed
        });
      }

      // Tentative de connexion avec promesse
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
          this.socket.once('connect_error', (error) => {
            this.isConnecting = false;
            resolve(false);
          });
        } else {
          this.isConnecting = false;
          resolve(false);
        }
      });
    } catch (error) {
      this.isConnecting = false;
      return false;
    }
  }

  private async getConnectionInfo(): Promise<ISocketConnectionInfo> {
    // Implementation of getConnectionInfo method
    // This method should return an object containing the necessary connection information
    return {
      url: SOCKET_URL,
      path: '',
      token: '' // Empty token since we're not using authService
    };
  }
}

// Création d'une instance unique
const socketServiceInstance = new SocketService();

// Désactiver l'initialisation automatique par défaut
socketServiceInstance.setAutoInit(false);

// Export des méthodes pour maintenir la compatibilité avec le code existant
export default {
  initialize: (forceInit?: boolean) => socketServiceInstance.initialize(forceInit),
  getSocketInstance: () => socketServiceInstance.getSocketInstance(),
  getInstanceAsync: (forceInit?: boolean) => socketServiceInstance.getInstanceAsync(forceInit),
  isConnected: () => socketServiceInstance.isConnected(),
  setAutoInit: (enabled: boolean) => socketServiceInstance.setAutoInit(enabled),
  reconnect: () => socketServiceInstance.reconnect(),
  reconnectToRoom: (roomCode: string, maxAttempts?: number) => 
    socketServiceInstance.reconnectToRoom(roomCode, maxAttempts),
  joinRoom: (roomCode: string) => socketServiceInstance.joinRoom(roomCode),
  leaveRoom: (roomCode: string) => socketServiceInstance.leaveRoom(roomCode),
  joinGame: (gameId: string) => socketServiceInstance.joinGame(gameId),
  joinGameChannel: (gameId: string) => socketServiceInstance.joinGameChannel(gameId),
  leaveGameChannel: (gameId: string) => socketServiceInstance.leaveGameChannel(gameId),
  forcePhaseCheck: (gameId: string) => socketServiceInstance.forcePhaseCheck(gameId),
  cleanup: () => socketServiceInstance.cleanup(),
  diagnose: () => socketServiceInstance.diagnose()
};