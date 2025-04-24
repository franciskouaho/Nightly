import { Server } from 'socket.io'
import { Server as HttpServer } from 'node:http'
import app from '@adonisjs/core/services/app'
import { Logger } from '@adonisjs/core/logger'
import { createAdapter } from '@socket.io/redis-adapter'
import redisProvider from '#providers/redis_provider'

interface RoomData {
  roomCode: string
}

interface GameData {
  gameId: string
}

interface SocketData {
  data: {
    roomCode?: string
    gameId?: string
    userId?: string
  }
}
interface MockContext {
  params: { id: string }
  auth: { authenticate: () => Promise<{ id: string }> }
  response: {
    ok: (data: any) => any
    notFound: (data: any) => any
    forbidden: (data: any) => any
    badRequest: (data: any) => any
    internalServerError: (data: any) => any
  }
}

class SocketService {
  private static instance: SocketService
  private io: Server | null = null
  private httpServer: HttpServer | null = null

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  public initialize(server: HttpServer) {
    if (this.io) {
      Logger.info('Socket.IO déjà initialisé')
      return
    }

    this.io = new Server(server, {
      cors: {
        origin: app.config.get('app.frontendUrl'),
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    })

    this.setupEventHandlers()
    Logger.info('Socket.IO initialisé avec succès')
  }

  private setupEventHandlers() {
    if (!this.io) return

    this.io.on('connection', (socket) => {
      Logger.info(`Nouvelle connexion Socket.IO: ${socket.id}`)

      socket.on('join:room', (roomCode: string) => {
        socket.join(`room:${roomCode}`)
        Logger.info(`Socket ${socket.id} a rejoint la salle ${roomCode}`)
      })

      socket.on('leave:room', (roomCode: string) => {
        socket.leave(`room:${roomCode}`)
        Logger.info(`Socket ${socket.id} a quitté la salle ${roomCode}`)
      })

      socket.on('disconnect', () => {
        Logger.info(`Socket ${socket.id} déconnecté`)
      })
    })
  }

  public getIO(): Server | null {
    return this.io
  }

  public emitToRoom(roomCode: string, event: string, data: any) {
    if (!this.io) {
      Logger.error('Socket.IO non initialisé')
      return
    }
    this.io.to(`room:${roomCode}`).emit(event, data)
  }

  public emitToGame(gameId: string, event: string, data: any) {
    if (!this.io) {
      Logger.error('Socket.IO non initialisé')
      return
    }
    this.io.to(`game:${gameId}`).emit(event, data)
  }

  // Méthodes pour la gestion des locks Redis
  private async acquireLock(key: string, ttl: number = 30): Promise<boolean> {
    try {
      const result = await redisProvider.getClient().set(key, Date.now().toString(), {
        NX: true,
        EX: ttl,
      })
      return result === 'OK'
    } catch (error) {
      console.error("❌ Erreur lors de l'acquisition du lock:", error)
      return false
    }
  }

  private async releaseLock(key: string): Promise<void> {
    try {
      await redisProvider.getClient().del(key)
    } catch (error) {
      console.error('❌ Erreur lors de la libération du lock:', error)
    }
  }

  // Méthode utilitaire pour gérer un lock avec un timeout
  public async withLock<T>(
    key: string,
    callback: () => Promise<T>,
    ttl: number = 30
  ): Promise<T | null> {
    const lockAcquired = await this.acquireLock(key, ttl)

    if (!lockAcquired) {
      console.warn(`⚠️ Impossible d'acquérir le lock pour ${key}`)
      return null
    }

    try {
      return await callback()
    } finally {
      await this.releaseLock(key)
    }
  }

  async init(httpServer: HttpServer) {
    if (this.io) {
      console.log('⚠️ Socket.IO déjà initialisé')
      return
    }

    console.log('🔌 Initialisation du serveur Socket.IO...')

    // Configuration CORS
    const corsOptions = {
      origin:
        process.env.NODE_ENV === 'production'
          ? [process.env.FRONTEND_URL || 'http://localhost:3000']
          : '*',
      methods: ['GET', 'POST'],
      credentials: true,
    }

    // Initialisation du serveur Socket.IO
    this.io = new Server(httpServer, {
      cors: corsOptions,
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 45000,
      maxHttpBufferSize: 1e6,
    })

    try {
      // Configuration de l'adaptateur Redis
      const pubClient = await redisProvider.getClient()
      const subClient = await pubClient.duplicate()

      // Attendre que les clients Redis soient prêts
      await Promise.all([
        new Promise<void>((resolve) => {
          if (pubClient.status === 'ready') {
            resolve()
          } else {
            pubClient.on('ready', () => resolve())
          }
        }),
        new Promise<void>((resolve) => {
          if (subClient.status === 'ready') {
            resolve()
          } else {
            subClient.on('ready', () => resolve())
          }
        }),
      ])

      console.log('✅ Clients Redis prêts pour Socket.IO')
      this.io.adapter(createAdapter(pubClient, subClient))
      console.log('✅ Adaptateur Redis configuré pour Socket.IO')

      // Middleware d'authentification
      this.io.use(async (socket, next) => {
        try {
          console.log('🔐 Tentative de connexion Socket.IO...')
          const authToken = socket.handshake.auth.token
          console.log('🔑 Token reçu:', authToken ? 'présent' : 'absent')

          if (!authToken) {
            console.error("❌ Token d'authentification manquant")
            return next(new Error("Token d'authentification manquant"))
          }

          // Extraire le token du format Bearer
          const token = authToken.replace('Bearer ', '')

          // Vérifier le token avec AdonisJS
          const { default: User } = await import('#models/user')
          const tokenInstance = await User.accessTokens.verify(token)

          if (!tokenInstance || !tokenInstance.user_id) {
            console.error('❌ Token invalide ou expiré')
            return next(new Error('Token invalide ou expiré'))
          }

          // Récupérer l'utilisateur
          const user = await User.find(tokenInstance.user_id)
          if (!user) {
            console.error('❌ Utilisateur non trouvé')
            return next(new Error('Utilisateur non trouvé'))
          }

          console.log(`✅ Utilisateur authentifié: ${user.id}`)
          socket.data.user = user
          next()
        } catch (error) {
          console.error("❌ Erreur d'authentification:", error)
          next(new Error("Erreur d'authentification"))
        }
      })

      // Gestion des connexions
      this.io.on('connection', (socket) => {
        console.log(`✅ Nouvelle connexion Socket.IO: ${socket.id}`)

        // Gestion des erreurs de connexion
        socket.on('error', (error) => {
          console.error(`❌ Erreur Socket.IO:`, error)
        })

        // Gestion de la déconnexion
        socket.on('disconnect', (reason) => {
          console.log(`⚠️ Déconnexion Socket.IO: ${socket.id} (${reason})`)
        })

        // Événement de rejoindre une salle
        socket.on('join-room', async (data: RoomData, callback) => {
          try {
            if (!data.roomCode) {
              throw new Error('Code de salle manquant')
            }

            console.log(`🎮 Tentative de rejoindre la salle: ${data.roomCode}`)
            const room = await this.getRoom(data.roomCode)

            if (!room) {
              throw new Error('Salle non trouvée')
            }

            socket.join(data.roomCode)
            console.log(`✅ Client ${socket.id} a rejoint la salle ${data.roomCode}`)

            callback({ success: true })
          } catch (error) {
            console.error('❌ Erreur lors du join-room:', error)
            callback({ success: false, error: error.message })
          }
        })

        socket.on('leave-room', async (data: SocketData) => {
          try {
            const roomCode = data.data?.roomCode
            if (!roomCode) {
              socket.emit('error', { message: 'Code de salle manquant' })
              return
            }

            const roomChannel = `room:${roomCode}`
            await socket.leave(roomChannel)
            console.log(`🚪 Client ${socket.id} a quitté la salle ${roomCode}`)
            socket.emit('room:left', { roomCode })
          } catch (error) {
            console.error('❌ Erreur lors de la sortie de la salle:', error)
            socket.emit('error', { message: 'Erreur lors de la sortie de la salle' })
          }
        })

        socket.on('join-game', async (data: SocketData) => {
          try {
            const { gameId } = data.data
            if (!gameId) {
              socket.emit('error', { message: 'ID du jeu manquant' })
              return
            }

            const gameChannel = `game:${gameId}`
            await socket.join(gameChannel)
            console.log(`🎮 Client ${socket.id} a rejoint le jeu ${gameId}`)
            socket.emit('game:joined', { gameId })
          } catch (error) {
            console.error('❌ Erreur lors de la jointure au jeu:', error)
            socket.emit('error', { message: 'Erreur lors de la jointure au jeu' })
          }
        })

        socket.on('leave-game', async (data: GameData) => {
          try {
            const gameId = data.gameId
            const gameChannel = `game:${gameId}`

            await socket.leave(gameChannel)
            console.log(`🎮 Client ${socket.id} a quitté le jeu ${gameId}`)
            socket.emit('game:left', { gameId })
          } catch (error) {
            console.error('❌ Erreur lors du départ du jeu:', error)
            socket.emit('error', { message: 'Erreur lors du départ du jeu' })
          }
        })

        // Nouveau gestionnaire pour le passage au tour suivant via WebSocket
        socket.on('game:next_round', async (data, callback) => {
          // Répondre immédiatement au client sans attendre la fin du traitement
          if (typeof callback === 'function') {
            callback({
              success: true,
              message: 'Traitement du passage au tour suivant en cours...',
            })
          }

          try {
            console.log(
              `🎮 [WebSocket] Demande de passage au tour suivant pour le jeu ${data.gameId}`
            )

            // Récupérer l'ID utilisateur depuis l'authentification avec fallbacks multiples
            const userId =
              socket.handshake.auth?.userId ||
              socket.handshake.headers?.userId ||
              socket.handshake.query?.userId ||
              data.userId // Ajout de data.userId comme source

            if (!userId) {
              console.error(
                `❌ [WebSocket] ID utilisateur non fourni pour le passage au tour suivant`
              )
              if (typeof callback === 'function') {
                callback({
                  success: false,
                  error: 'ID utilisateur non fourni',
                })
              }
              return
            }

            console.log(`👤 [WebSocket] Utilisateur ${userId} demande le passage au tour suivant`)

            // Récupérer les modèles nécessaires
            const Game = (await import('#models/game')).default
            const Room = (await import('#models/room')).default
            const Question = (await import('#models/question')).default
            const Vote = (await import('#models/vote')).default

            // Récupérer le jeu
            const game = await Game.find(data.gameId)

            if (!game) {
              console.error(`❌ [WebSocket] Jeu ${data.gameId} non trouvé`)
              if (typeof callback === 'function') {
                callback({
                  success: false,
                  error: 'Jeu non trouvé',
                })
              }
              return
            }

            // Récupérer la salle pour vérifier l'hôte
            const room = await Room.find(game.roomId)
            if (!room) {
              console.error(`❌ [WebSocket] Salle non trouvée pour le jeu ${data.gameId}`)
              if (typeof callback === 'function') {
                callback({
                  success: false,
                  error: 'Salle non trouvée',
                })
              }
              return
            }

            // Vérifier si l'utilisateur est l'hôte (en convertissant en string pour comparaison sûre)
            const isHost = String(room.hostId) === String(userId)
            console.log(
              `👑 [WebSocket] Vérification hôte: hostId=${room.hostId}, userId=${userId}, isHost=${isHost}`
            )

            if (!isHost && !data.forceAdvance) {
              console.error(
                `❌ [WebSocket] L'utilisateur ${userId} n'est pas l'hôte (${room.hostId}) de la partie`
              )

              // Si l'option forceAdvance est définie à true, l'utilisateur est un administrateur
              if (data.isAdmin) {
                console.log(`⚠️ [WebSocket] Passage forcé par administrateur ${userId}`)
              } else {
                if (typeof callback === 'function') {
                  callback({
                    success: false,
                    error: "Seul l'hôte peut passer au tour suivant",
                    details: {
                      userId: userId,
                      hostId: room.hostId,
                    },
                  })
                }
                return
              }
            }

            // Vérifier que la partie est en cours
            if (game.status !== 'in_progress') {
              console.error(`❌ [WebSocket] La partie ${data.gameId} n'est pas en cours`)
              if (typeof callback === 'function') {
                callback({
                  success: false,
                  error: "La partie n'est pas en cours",
                })
              }
              return
            }

            // Vérifier que nous sommes dans une phase valide
            const validPhases = ['results', 'vote']
            if (!validPhases.includes(game.currentPhase) && !data.forceAdvance) {
              console.error(
                `❌ [WebSocket] Phase incorrecte pour le passage au tour suivant: ${game.currentPhase}`
              )
              if (typeof callback === 'function') {
                callback({
                  success: false,
                  error:
                    'Veuillez attendre la fin de la phase actuelle avant de passer au tour suivant',
                  details: {
                    currentPhase: game.currentPhase,
                  },
                })
              }
              return
            }

            // Si en phase vote, vérifier qu'il y a eu des votes sauf si forceAdvance=true
            if (game.currentPhase === 'vote' && !data.forceAdvance) {
              const currentQuestion = await Question.query()
                .where('game_id', data.gameId)
                .where('round_number', game.currentRound)
                .first()

              if (!currentQuestion) {
                console.error(
                  `❌ [WebSocket] Question non trouvée pour le jeu ${data.gameId}, tour ${game.currentRound}`
                )
                if (typeof callback === 'function') {
                  callback({
                    success: false,
                    error: 'Question non trouvée',
                  })
                }
                return
              }

              const votes = await Vote.query()
                .where('question_id', currentQuestion.id)
                .count('* as count')
              const voteCount = Number.parseInt(votes[0].$extras.count || '0', 10)

              if (voteCount === 0) {
                console.error(`❌ [WebSocket] Aucun vote pour la question ${currentQuestion.id}`)

                // Si forceAdvance est true, continuer malgré tout
                if (data.forceAdvance) {
                  console.log(
                    `⚠️ [WebSocket] Passage forcé au tour suivant malgré l'absence de votes`
                  )
                } else {
                  if (typeof callback === 'function') {
                    callback({
                      success: false,
                      error: 'Veuillez attendre la fin des votes avant de passer au tour suivant',
                      details: {
                        currentPhase: game.currentPhase,
                        hasVotes: false,
                      },
                    })
                  }
                  return
                }
              }
            }

            // Importer le contrôleur de jeu
            const GameController = (await import('#controllers/ws/game_controller')).default
            const controller = new GameController()

            try {
              // Tenter le passage au tour suivant directement via le contrôleur
              console.log(
                `🚀 [WebSocket] Exécution de nextRound via le contrôleur pour ${data.gameId}`
              )

              // Créer un contexte minimal pour appeler la méthode du contrôleur
              const mockContext: MockContext = {
                params: { id: data.gameId },
                auth: {
                  authenticate: async () => ({ id: userId }),
                },
                response: {
                  ok: (data: any) => {
                    console.log(`✅ [WebSocket] nextRound exécuté avec succès:`, data)

                    // Confirmer spécifiquement l'action next_round à tout le monde
                    socket.emit('next_round:confirmation', {
                      success: true,
                      message: data.message || 'Nouveau tour démarré',
                      gameId: data.gameId,
                      round: game.currentRound + 1,
                      data: data.data,
                    })

                    if (this.io) {
                      this.io.to(`game:${data.gameId}`).emit('game:update', {
                        type: 'phase_change',
                        phase: 'question', // Phase par défaut au début d'un tour
                        round: game.currentRound + 1,
                        message: 'Nouveau tour commencé',
                      })
                    }

                    return data
                  },
                  notFound: (data: any) => {
                    console.error(`❌ [WebSocket] Ressource non trouvée:`, data)
                    socket.emit('next_round:error', {
                      success: false,
                      error: 'Ressource non trouvée',
                    })
                    return data
                  },
                  forbidden: (data: any) => {
                    console.error(`❌ [WebSocket] Accès interdit:`, data)
                    socket.emit('next_round:error', {
                      success: false,
                      error: data.error || 'Accès interdit',
                    })
                    return data
                  },
                  badRequest: (data: any) => {
                    console.error(`❌ [WebSocket] Requête invalide:`, data)
                    socket.emit('next_round:error', {
                      success: false,
                      error: data.error || 'Requête invalide',
                    })
                    return data
                  },
                  internalServerError: (data: any) => {
                    console.error(`❌ [WebSocket] Erreur serveur:`, data)
                    socket.emit('next_round:error', {
                      success: false,
                      error: data.error || 'Erreur serveur',
                    })
                    return data
                  },
                },
              }

              // Appeler directement la méthode du contrôleur avec notre contexte
              await controller.nextRound(mockContext)

              console.log(`✅ [WebSocket] Traitement nextRound terminé pour ${data.gameId}`)
            } catch (controllerError) {
              console.error(`❌ [WebSocket] Erreur lors de l'appel au contrôleur:`, controllerError)
              socket.emit('next_round:error', {
                success: false,
                error: controllerError.message || 'Erreur lors du passage au tour suivant',
              })
            }
          } catch (error) {
            console.error(`❌ [WebSocket] Erreur lors du passage au tour suivant:`, error)
            socket.emit('next_round:error', {
              success: false,
              error: error.message || 'Une erreur est survenue lors du passage au tour suivant',
            })

            if (typeof callback === 'function' && !callback.called) {
              callback.called = true
              callback({
                success: false,
                error: 'Une erreur est survenue lors du passage au tour suivant',
              })
            }
          }
        })

        // Gestionnaire pour récupérer l'état du jeu
        socket.on('game:get_state', async (data, callback) => {
          try {
            console.log(
              `🎮 [WebSocket] Demande d'état du jeu ${data.gameId} par ${data.userId || 'utilisateur inconnu'}`
            )

            // Récupérer l'ID utilisateur depuis l'authentification avec fallbacks multiples
            const userId =
              socket.handshake.auth?.userId ||
              socket.handshake.headers?.userId ||
              socket.handshake.query?.userId ||
              data.userId

            if (!userId) {
              console.error(
                `❌ [WebSocket] ID utilisateur non fourni pour la récupération d'état de jeu`
              )
              if (typeof callback === 'function') {
                callback({
                  success: false,
                  error: 'ID utilisateur non fourni',
                })
              }
              return
            }

            // Importer le contrôleur de jeu
            const GameController = (await import('#controllers/ws/game_controller')).default
            const controller = new GameController()

            try {
              // Récupérer l'état du jeu via la méthode du contrôleur
              const gameState = await controller.getGameState(data.gameId, userId)

              console.log(`🎮 [WebSocket] État du jeu récupéré pour ${data.gameId}`)

              if (typeof callback === 'function') {
                callback({
                  success: true,
                  data: gameState,
                })
              }
            } catch (error) {
              console.error(
                `❌ [WebSocket] Erreur lors de la récupération de l'état du jeu:`,
                error
              )
              if (typeof callback === 'function') {
                callback({
                  success: false,
                  error: error.message || "Erreur lors de la récupération de l'état du jeu",
                })
              }
            }
          } catch (error) {
            console.error(`❌ [WebSocket] Erreur lors de la récupération de l'état du jeu:`, error)
            if (typeof callback === 'function') {
              callback({
                success: false,
                error: error.message || "Erreur lors de la récupération de l'état du jeu",
              })
            }
          }
        })
      })
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation de Socket.IO:", error)
      throw error
    }
  }
}

export default SocketService.getInstance()
