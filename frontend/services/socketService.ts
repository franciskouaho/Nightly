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
      console.log('🔌 Initialisation Socket.IO reportée (pas de forceInit)');
      throw new Error('Socket.IO initialization postponed - explicit initialization required');
    }

    // Si l'initialisation est déjà en cours, retourner la promesse existante
    if (this.initPromise) {
      console.log('🔌 Connexion Socket.IO déjà en cours, attente...');
      return this.initPromise;
    }

    // Si le socket existe déjà et est connecté, le retourner directement
    if (this.socket && this.socket.connected) {
      console.log('✅ Socket.IO déjà initialisé et connecté');
      return this.socket;
    }

    console.log('🔌 Initialisation de la connexion Socket.IO...');
    this.isInitializing = true;

    // Créer une promesse pour l'initialisation
    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        // Vérifier la connexion internet
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          console.error('❌ Pas de connexion internet disponible');
          this.isInitializing = false;
          this.initPromise = null;
          reject(new Error('Pas de connexion internet'));
          return;
        }

        // Récupérer l'ID utilisateur et le token
        const userId = await UserIdManager.getUserId();
        const token = await AsyncStorage.getItem('auth_token');
        console.log(`👤 Initialisation socket avec ID utilisateur: ${userId || 'non défini'}`);

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
          console.log(`✅ Socket.IO connecté avec ID: ${this.socket?.id}`);
          this.reconnectAttempts = 0;
          this.isInitializing = false;
          resolve(this.socket!);
        });

        this.socket.on('connect_error', (error) => {
          console.error(`❌ Erreur de connexion Socket.IO:`, error);
          this.isInitializing = false;
          this.initPromise = null;
          
          // Tenter une reconnexion automatique
          if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS}`);
            setTimeout(() => {
              this.reconnect().catch(err => {
                console.error('❌ Échec de reconnexion automatique:', err);
              });
            }, this.RECONNECT_DELAY);
          }
          
          reject(error);
        });

        this.socket.on('error', (error) => {
          console.error(`❌ Erreur Socket (non gérée):`, error);
          this.isInitializing = false;
          this.initPromise = null;
          reject(error);
        });

        // Écouter les événements de déconnexion
        this.socket.on('disconnect', (reason) => {
          console.warn(`🔌 Socket.IO déconnecté: ${reason}`);
          
          // Essayer de se reconnecter automatiquement si la déconnexion n'est pas volontaire
          if (reason === 'io server disconnect' || reason === 'transport close') {
            if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
              this.reconnectAttempts++;
              console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS}`);
              setTimeout(() => {
                this.reconnect().catch(err => {
                  console.error('❌ Échec de reconnexion automatique:', err);
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
        console.error('❌ Erreur lors de l\'initialisation Socket.IO:', error);
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
      console.log(`🔄 Tentative de connexion socket ${attempts}/${maxAttempts}`);

      try {
        // Activer l'auto-init pour cette tentative
        this.autoInit = true;

        // Si une initialisation est déjà en cours, attendre son résultat
        if (this.initPromise) {
          const socket = await this.initPromise;
          if (socket && socket.connected) {
            console.log(`✅ Connexion socket réussie à la tentative ${attempts}`);
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
          console.log(`🔌 Socket créé mais pas connecté, tentative de connexion...`);
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
          console.log(`✅ Connexion socket établie avec succès`);
          return socket;
        } else {
          throw new Error('Socket non connecté après tentative de connexion');
        }
      } catch (error) {
        console.warn(`⚠️ Échec de la tentative ${attempts}:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Attendre avant la prochaine tentative
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw lastError || new Error('Impossible d\'établir une connexion socket après plusieurs tentatives');
  }

  /**
   * Active ou désactive l'initialisation automatique des sockets
   */
  setAutoInit(enabled: boolean): void {
    this.autoInit = enabled;
    console.log(`🔌 Initialisation automatique des sockets: ${enabled ? 'activée' : 'désactivée'}`);
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
      console.log('🔌 Demande d\'instance socket sans initialisation forcée, connexion différée');
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
      console.log('🔄 Tentative de reconnexion Socket.IO...');
      
      if (this.socket && this.socket.connected) {
        console.log('✅ Déjà connecté, reconnexion non nécessaire');
        return true;
      }
      
      // Limiter les tentatives de reconnexion
      if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
        console.error(`❌ Nombre maximum de tentatives de reconnexion atteint (${this.MAX_RECONNECT_ATTEMPTS})`);
        // Reset et essayer encore une fois au lieu de rejeter
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
          console.error('❌ Échec de l\'initialisation en cours:', error);
          // Continuer avec une nouvelle tentative
        }
      }
      
      // Si le socket existe mais est déconnecté, essayer de le reconnecter
      if (this.socket) {
        if (!this.socket.connected) {
          console.log('🔌 Reconnexion du socket existant...');
          this.socket.connect();
          
          // Attendre la reconnexion
          return new Promise((resolve) => {
            const timeout = setTimeout(() => {
              resolve(false);
            }, 5000);
            
            if (this.socket) {
              this.socket.once('connect', () => {
                clearTimeout(timeout);
                console.log('✅ Socket reconnecté avec succès');
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
        console.error('❌ Échec de la connexion forcée:', e);
        return false;
      }
    } catch (error) {
      console.error('❌ Échec de reconnexion:', error);
      return false;
    }
  }

  /**
   * Tente de rejoindre une salle avec plusieurs tentatives
   */
  async reconnectToRoom(roomCode: string, maxAttempts: number = 3): Promise<boolean> {
    console.log(`🔄 Tentative de rejoindre la salle ${roomCode} avec ${maxAttempts} essais max`);
    
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        
        // S'assurer que le socket est connecté
        if (!this.isConnected()) {
          console.log(`🔌 Socket non connecté, tentative de reconnexion (${attempts}/${maxAttempts})...`);
          const reconnected = await this.reconnect();
          if (!reconnected) {
            console.warn(`⚠️ Échec de reconnexion à la tentative ${attempts}/${maxAttempts}`);
            
            // Attendre un peu avant de réessayer
            await new Promise(resolve => setTimeout(resolve, this.RECONNECT_DELAY));
            continue;
          }
        }
        
        // Tenter de rejoindre la salle
        const success = await this.joinRoom(roomCode);
        if (success) {
          console.log(`✅ Salle ${roomCode} rejointe avec succès à la tentative ${attempts}/${maxAttempts}`);
          return true;
        }
        
        console.warn(`⚠️ Échec de jointure à la salle à la tentative ${attempts}/${maxAttempts}`);
        
        // Attendre un peu avant de réessayer
        await new Promise(resolve => setTimeout(resolve, this.RECONNECT_DELAY));
      } catch (error) {
        console.error(`❌ Erreur lors de la tentative ${attempts}/${maxAttempts} de rejoindre la salle:`, error);
        
        // Attendre un peu avant de réessayer
        await new Promise(resolve => setTimeout(resolve, this.RECONNECT_DELAY));
      }
    }
    
    console.error(`❌ Échec de rejoindre la salle ${roomCode} après ${maxAttempts} tentatives`);
    return false;
  }

  /**
   * Rejoint une salle
   */
  async joinRoom(roomCode: string): Promise<boolean> {
    console.log(`🚪 [SocketService] Tentative de rejoindre la room ${roomCode}`);
    
    return this.ensureSocketConnection()
      .then(connected => {
        if (!connected) {
          console.error(`❌ [SocketService] Impossible de rejoindre la room ${roomCode} - socket non connecté`);
          return false;
        }
        
        if (!this.socket) {
          console.error(`❌ [SocketService] Socket non disponible pour rejoindre la room ${roomCode}`);
          return false;
        }
        
        console.log(`📡 [SocketService] Socket connecté (${this.socket?.id}), émission de l'événement join-room`);
        
        return new Promise<boolean>((resolve) => {
          // Écouter l'événement de succès
          if (this.socket) {
            this.socket.once('room:joined', (data) => {
              console.log(`✅ [SocketService] Room ${roomCode} rejointe avec succès:`, data);
              resolve(true);
            });
            
            // Écouter les erreurs
            this.socket.once('error', (error) => {
              console.error(`❌ [SocketService] Erreur socket lors de la tentative de rejoindre la room:`, error);
              resolve(false);
            });
            
            // Envoyer la requête pour rejoindre la room
            this.socket.emit('join-room', { data: { roomId: roomCode } }, (response: any) => {
              if (response && response.success !== false) {
                console.log(`✅ [SocketService] Room ${roomCode} rejointe avec succès via callback:`, response);
                resolve(true);
              } else {
                console.warn(`⚠️ [SocketService] Échec de rejoindre la room ${roomCode}:`, response?.error || 'Raison inconnue');
                resolve(false);
              }
            });
          } else {
            console.error(`❌ [SocketService] Socket non disponible pour écouter les événements`);
            resolve(false);
          }
        });
      })
      .catch(error => {
        console.error(`❌ [SocketService] Exception lors de la tentative de rejoindre la room ${roomCode}:`, error);
        return false;
      });
  }

  /**
   * Quitte une salle
   */
  async leaveRoom(roomCode: string): Promise<boolean> {
    try {
      console.log(`🚪 Tentative de quitter la salle ${roomCode}`);
      
      if (!this.socket || !this.socket.connected) {
        console.warn('⚠️ Socket non connecté, impossible de quitter la salle');
        this.activeRooms.delete(roomCode);
        return false;
      }
      
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.emit('leave-room', { roomCode }, (response: any) => {
            this.activeRooms.delete(roomCode);
            
            if (response && response.success !== false) {
              console.log(`✅ Salle ${roomCode} quittée avec succès`);
              resolve(true);
            } else {
              console.warn(`⚠️ Échec de quitter la salle ${roomCode}:`, response?.error || 'Raison inconnue');
              resolve(false);
            }
          });
          
          // Si pas de callback disponible, considérer comme succès avec un autre événement
          this.socket.once('room:left', (data) => {
            this.activeRooms.delete(roomCode);
            
            if (data && data.roomCode === roomCode) {
              console.log(`✅ Salle ${roomCode} quittée avec succès (via événement)`);
              resolve(true);
            }
          });
        } else {
          this.activeRooms.delete(roomCode);
          console.warn('⚠️ Socket non disponible, impossible de quitter la salle');
          resolve(false);
        }
      });
    } catch (error) {
      console.error(`❌ Erreur lors de la tentative de quitter la salle ${roomCode}:`, error);
      this.activeRooms.delete(roomCode);
      return false;
    }
  }

  /**
   * Rejoint un jeu
   */
  async joinGame(gameId: string): Promise<boolean> {
    try {
      console.log(`🎮 Tentative de rejoindre le jeu ${gameId}`);
      
      if (!this.socket || !this.socket.connected) {
        console.warn('⚠️ Socket non connecté, tentative de reconnexion...');
        await this.reconnect();
      }
      
      if (!this.socket || !this.socket.connected) {
        throw new Error('Socket non connecté après tentative de reconnexion');
      }
      
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.emit('join-game', { gameId }, (response: any) => {
            if (response && response.success !== false) {
              console.log(`✅ Jeu ${gameId} rejoint avec succès`);
              resolve(true);
            } else {
              console.warn(`⚠️ Échec de rejoindre le jeu ${gameId}:`, response?.error || 'Raison inconnue');
              resolve(false);
            }
          });
          
          // Si pas de callback disponible, considérer comme succès avec un autre événement
          this.socket.once('game:joined', (data) => {
            if (data && data.gameId === gameId) {
              console.log(`✅ Jeu ${gameId} rejoint avec succès (via événement)`);
              resolve(true);
            }
          });
        } else {
          console.error('❌ Socket non disponible pour rejoindre le jeu');
          resolve(false);
        }
      });
    } catch (error) {
      console.error(`❌ Erreur lors de la tentative de rejoindre le jeu ${gameId}:`, error);
      return false;
    }
  }

  /**
   * Tente de rejoindre un canal de jeu (game channel)
   */
  async joinGameChannel(gameId: string): Promise<boolean> {
    try {
      console.log(`🎮 SocketService: Tentative de rejoindre le canal de jeu ${gameId}`);
      
      if (!this.socket || !this.socket.connected) {
        console.warn('⚠️ Socket non connecté, tentative de reconnexion...');
        await this.reconnect();
      }
      
      if (!this.socket || !this.socket.connected) {
        throw new Error('Socket non connecté après tentative de reconnexion');
      }
      
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.emit('join-game', { gameId }, (response: any) => {
            if (response && response.success !== false) {
              console.log(`✅ Jeu ${gameId} rejoint avec succès`);
              resolve(true);
            } else {
              console.warn(`⚠️ Échec de rejoindre le jeu ${gameId}:`, response?.error || 'Raison inconnue');
              resolve(false);
            }
          });
          
          // Si pas de callback disponible, considérer comme succès avec un autre événement
          this.socket.once('game:joined', (data) => {
            if (data && data.gameId === gameId) {
              console.log(`✅ Jeu ${gameId} rejoint avec succès (via événement)`);
              resolve(true);
            }
          });
        } else {
          console.error('❌ Socket non disponible pour rejoindre le jeu');
          resolve(false);
        }
      });
    } catch (error) {
      console.error(`❌ Erreur lors de la tentative de rejoindre le jeu ${gameId}:`, error);
      return false;
    }
  }

  /**
   * Quitte un canal de jeu 
   */
  async leaveGameChannel(gameId: string): Promise<boolean> {
    try {
      console.log(`🎮 SocketService: Tentative de quitter le canal de jeu ${gameId}`);
      
      if (!this.socket || !this.socket.connected) {
        console.warn('⚠️ Socket non connecté, impossible de quitter le jeu');
        return false;
      }
      
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.emit('leave-game', { gameId }, (response: any) => {
            if (response && response.success !== false) {
              console.log(`✅ Jeu ${gameId} quitté avec succès`);
              resolve(true);
            } else {
              console.warn(`⚠️ Échec de quitter le jeu ${gameId}:`, response?.error || 'Raison inconnue');
              resolve(false);
            }
          });
          
          // Si pas de callback disponible, considérer comme succès avec un autre événement
          this.socket.once('game:left', (data) => {
            if (data && data.gameId === gameId) {
              console.log(`✅ Jeu ${gameId} quitté avec succès (via événement)`);
              resolve(true);
            }
          });
        } else {
          console.error('❌ Socket non disponible pour quitter le jeu');
          resolve(false);
        }
      });
    } catch (error) {
      console.error(`❌ Erreur lors de la tentative de quitter le jeu ${gameId}:`, error);
      return false;
    }
  }

  /**
   * Force une vérification de la phase du jeu
   */
  async forcePhaseCheck(gameId: string): Promise<boolean> {
    try {
      console.log(`🔄 SocketService: Forçage de la vérification de phase pour le jeu ${gameId}`);
      
      if (!this.socket || !this.socket.connected) {
        console.warn('⚠️ Socket non connecté, tentative de reconnexion...');
        await this.reconnect();
      }
      
      if (!this.socket || !this.socket.connected) {
        throw new Error('Socket non connecté après tentative de reconnexion');
      }
      
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.emit('game:force_check', { gameId }, (response: any) => {
            if (response && response.success !== false) {
              console.log(`✅ Vérification forcée avec succès pour le jeu ${gameId}`);
              resolve(true);
            } else {
              console.warn(`⚠️ Échec de la vérification forcée:`, response?.error || 'Raison inconnue');
              resolve(false);
            }
          });
        } else {
          console.error('❌ Socket non disponible pour forcer la vérification');
          resolve(false);
        }
      });
    } catch (error) {
      console.error(`❌ Erreur lors du forçage de vérification:`, error);
      return false;
    }
  }

  /**
   * Nettoie la connexion, à appeler lors de la déconnexion de l'application
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Nettoyage de la connexion socket...');
    
    // Quitter toutes les salles actives
    for (const roomCode of this.activeRooms) {
      try {
        await this.leaveRoom(roomCode);
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la tentative de quitter la salle ${roomCode}:`, error);
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
    
    console.log('✅ Nettoyage socket terminé');
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
          console.log('🔌 Socket déjà connecté');
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
    console.log('🔄 [SocketService] Tentative de connexion WebSocket...');
    
    // Si déjà connecté, on renvoie true immédiatement
    if (this.socket && this.socket.connected) {
      console.log('✅ [SocketService] Socket déjà connecté, ID:', this.socket.id);
      return true;
    }

    // Préparer les informations pour la connexion
    console.log('🔧 [SocketService] Préparation des paramètres de connexion');
    const connectionInfo: ISocketConnectionInfo = await this.getConnectionInfo();
    console.log(`🔧 [SocketService] Paramètres: URL=${connectionInfo.url}, Path=${connectionInfo.path}`);
    
    try {
      // Récupération du socket
      console.log('📡 [SocketService] Initialisation de Socket.IO avec l\'URL:', connectionInfo.url);
      this.socket = io(connectionInfo.url, {
        path: connectionInfo.path,
        autoConnect: false,
        transports: ['websocket'],
        timeout: 30000,  // Augmenté à 30 secondes
        // forceNew: true,
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
          if (this.socket) {
            console.log(`✅ [SocketService] Connexion établie avec succès! ID Socket: ${this.socket.id}`);
          }
          this.isConnecting = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error(`❌ [SocketService] Erreur de connexion:`, error);
          this.isConnecting = false;
        });

        this.socket.on('disconnect', (reason) => {
          console.warn(`⚠️ [SocketService] Déconnexion du socket (${reason})`);
        });

        this.socket.on('error', (error) => {
          console.error(`❌ [SocketService] Erreur socket:`, error);
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`🔄 [SocketService] Tentative de reconnexion #${attemptNumber}`);
        });

        this.socket.on('reconnect_error', (error) => {
          console.error(`❌ [SocketService] Erreur de reconnexion:`, error);
        });

        this.socket.on('reconnect_failed', () => {
          console.error(`❌ [SocketService] Échec de toutes les tentatives de reconnexion`);
        });
      }

      // Tentative de connexion avec promesse
      return new Promise((resolve) => {
        this.isConnecting = true;
        console.log('🔌 [SocketService] Lancement de la connexion socket...');
        if (this.socket) {
          this.socket.connect();

          // Cas de connexion réussie
          this.socket.once('connect', () => {
            if (this.socket) {
              console.log(`✅ [SocketService] Événement connect reçu, ID: ${this.socket.id}`);
            }
            this.isConnecting = false;
            resolve(true);
          });

          // En cas d'erreur de connexion
          this.socket.once('connect_error', (error) => {
            console.error(`❌ [SocketService] Erreur lors de la connexion:`, error);
            this.isConnecting = false;
            resolve(false);
          });
        } else {
          console.error(`❌ [SocketService] Socket non initialisé`);
          this.isConnecting = false;
          resolve(false);
        }
      });
    } catch (error) {
      console.error(`❌ [SocketService] Exception lors de la connexion:`, error);
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