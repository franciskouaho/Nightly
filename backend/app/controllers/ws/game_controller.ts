import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { answerValidator, voteValidator } from '#validators/game'
import socketService from '#services/socket_service'
import Redis from '@adonisjs/redis/services/main'

import Game from '#models/game'
import Room from '#models/room'
import Question from '#models/question'
import Answer from '#models/answer'

// Importation des services de jeu
import actionVeriteService from '#services/games/action_verite_service'
// Ajouter d'autres services de jeu ici lorsqu'ils seront créés

// Sélectionner un joueur cible aléatoire parmi les joueurs (sauf celui qui est déjà ciblé)
const selectRandomTargetPlayer = async (gameId: number, currentTargetPlayerId: number | null) => {
  const game = await Game.find(gameId)
  if (!game) throw new Error('Game not found')

  const room = await Room.find(game.roomId)
  if (!room) throw new Error('Room not found')

  const players = await room.related('players').query()
  if (players.length <= 1) throw new Error('Not enough players to select a target')

  const eligiblePlayers = players.filter((player) => player.id !== currentTargetPlayerId)
  const randomIndex = Math.floor(Math.random() * eligiblePlayers.length)
  return eligiblePlayers[randomIndex]
}

/**
 * Contrôleur générique pour les jeux
 * Délègue les opérations spécifiques aux services de jeu appropriés
 */
export default class GameController {
  /**
   * Map des services de jeu disponibles par type
   */
  private gameServices = {
    'action-verite': actionVeriteService,
    // Ajouter d'autres services ici
  }

  private readonly LOCK_TTL = 5 // 5 secondes pour les locks
  private readonly CACHE_TTL = 2 // 2 secondes pour le cache

  /**
   * Gestion des locks Redis pour les opérations concurrentes
   */
  private async acquireLock(key: string, ttl: number = this.LOCK_TTL): Promise<boolean> {
    try {
      return (await Redis.setex(key, ttl, Date.now().toString())) === 'OK'
    } catch (error) {
      return false
    }
  }

  private async releaseLock(key: string): Promise<void> {
    try {
      await Redis.del(key)
    } catch (error) {
      // Ignorer les erreurs de libération de lock
    }
  }

  /**
   * Sélectionner le service approprié pour un jeu
   */
  private async getGameService(gameMode: string) {
    const servicePromise = this.gameServices[gameMode]
    if (!servicePromise) {
      throw new Error(`Service non trouvé pour le mode de jeu: ${gameMode}`)
    }
    return await servicePromise
  }

  /**
   * Récupère l'état actuel du jeu
   */
  public async getGameState(gameId: string, userId: string): Promise<any> {
    try {
      const game = await Game.find(gameId)
      if (!game) {
        throw new Error('Jeu non trouvé')
      }

      const room = await Room.find(game.roomId)
      if (!room) {
        throw new Error('Salle non trouvée')
      }

      // Vérifier que l'utilisateur fait partie de la salle
      const isInRoom = await room.related('players').query().where('id', userId).first()
      if (!isInRoom) {
        throw new Error("Vous n'êtes pas dans cette partie")
      }

      // Obtenez le service approprié pour ce type de jeu
      const gameService = await this.getGameService(game.gameMode)

      // Récupérer l'état complet du jeu via le service spécifique
      return await gameService.getGameState(game.id)
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'état du jeu:", error)
      throw error
    }
  }

  /**
   * Afficher les détails d'un jeu
   */
  async show({ params, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const gameId = params.id

      // Utiliser Redis pour le cache
      const cachedGame = await Redis.get(`game:${gameId}`)
      if (cachedGame) {
        const gameData = JSON.parse(cachedGame)
        return response.ok(gameData)
      }

      // Obtenir les détails du jeu
      const game = await Game.query()
        .where('id', gameId)
        .preload('room', (roomQuery) => {
          roomQuery.preload('players')
        })
        .first()

      if (!game) {
        return response.notFound({ error: 'Partie non trouvée' })
      }

      // Vérifier que l'utilisateur fait partie de la salle
      const isPlayerInGame = game.room.players.some((player) => player.id === user.id)
      if (!isPlayerInGame) {
        return response.forbidden({ error: 'Vous ne faites pas partie de cette partie' })
      }

      // Obtenir le service approprié pour ce type de jeu
      const gameService = await this.getGameService(game.gameMode)

      // Récupérer l'état complet du jeu via le service spécifique
      const gameState = await gameService.getGameState(game.id)

      // Mettre en cache
      await Redis.setex(`game:${gameId}`, this.CACHE_TTL, JSON.stringify(gameState))

      return response.ok({
        status: 'success',
        data: gameState,
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la partie:', error)
      return response.internalServerError({
        error: 'Une erreur est survenue lors de la récupération des détails de la partie',
      })
    }
  }

  /**
   * Soumettre une réponse à une question
   */
  async submitAnswer({ request, response, auth, params }: HttpContext) {
    const user = await auth.authenticate()
    const gameId = params.id

    try {
      await this.acquireLock(`game:${gameId}:answer`)

      // Valider la réponse
      const payload = await request.validateUsing(answerValidator)

      // Récupérer le jeu
      const game = await Game.find(gameId)
      if (!game) {
        return response.notFound({ error: 'Partie non trouvée' })
      }

      // Vérifier que l'utilisateur fait partie de la partie
      const room = await Room.find(game.roomId)
      if (!room) {
        return response.notFound({ error: 'Salle non trouvée' })
      }

      const isInRoom = await room.related('players').query().where('user_id', user.id).first()
      if (!isInRoom) {
        return response.forbidden({ error: 'Vous ne faites pas partie de cette partie' })
      }

      // Obtenir le service approprié pour ce type de jeu
      const gameService = await this.getGameService(game.gameMode)

      // Déléguer la soumission de réponse au service spécifique
      const result = await gameService.handleAnswer({
        gameId: game.id,
        userId: user.id,
        answer: payload.content,
      })

      if (!result) {
        return response.badRequest({
          error:
            'Impossible de soumettre votre réponse. Vérifiez que vous êtes autorisé à répondre à ce moment.',
        })
      }

      return response.ok({
        status: 'success',
        message: 'Réponse soumise avec succès',
        data: result,
      })
    } catch (error) {
      console.error('Erreur lors de la soumission de la réponse:', error)
      return response.internalServerError({
        error: 'Une erreur est survenue lors de la soumission de la réponse',
      })
    } finally {
      await this.releaseLock(`game:${gameId}:answer`)
    }
  }

  /**
   * Soumettre un vote pour une réponse
   */
  async submitVote({ request, response, auth, params }: HttpContext) {
    const user = await auth.authenticate()
    const gameId = params.id

    try {
      await this.acquireLock(`game:${gameId}:vote`)

      // Valider le vote
      const payload = await request.validateUsing(voteValidator)

      // Récupérer le jeu
      const game = await Game.find(gameId)
      if (!game) {
        return response.notFound({ error: 'Partie non trouvée' })
      }

      // Vérifier que l'utilisateur fait partie de la partie
      const room = await Room.find(game.roomId)
      if (!room) {
        return response.notFound({ error: 'Salle non trouvée' })
      }

      const isInRoom = await room.related('players').query().where('user_id', user.id).first()
      if (!isInRoom) {
        return response.forbidden({ error: 'Vous ne faites pas partie de cette partie' })
      }

      // Obtenir le service approprié pour ce type de jeu
      const gameService = await this.getGameService(game.gameMode)

      // Déléguer la soumission du vote au service spécifique
      const success = await gameService.handleVote(game.id, user.id, payload.answerId)

      if (!success) {
        return response.badRequest({
          error:
            'Impossible de soumettre votre vote. Vérifiez que vous êtes autorisé à voter à ce moment.',
        })
      }

      return response.ok({
        status: 'success',
        message: 'Vote soumis avec succès',
      })
    } catch (error) {
      console.error('Erreur lors de la soumission du vote:', error)
      return response.internalServerError({
        error: 'Une erreur est survenue lors de la soumission du vote',
      })
    } finally {
      await this.releaseLock(`game:${gameId}:vote`)
    }
  }

  /**
   * Passer à la manche suivante
   */
  async nextRound({ response, auth, params }: HttpContext) {
    const user = await auth.authenticate()
    const gameId = params.id

    try {
      await this.acquireLock(`game:${gameId}:next-round`)

      // Récupérer le jeu
      const game = await Game.find(gameId)
      if (!game) {
        return response.notFound({ error: 'Partie non trouvée' })
      }

      // Vérifier que l'utilisateur est l'hôte de la partie
      const room = await Room.find(game.roomId)
      if (!room) {
        return response.notFound({ error: 'Salle non trouvée' })
      }

      if (room.hostId !== user.id) {
        return response.forbidden({ error: "Seul l'hôte peut passer à la manche suivante" })
      }

      // Obtenir le service approprié pour ce type de jeu
      const gameService = await this.getGameService(game.gameMode)

      // Préparer la prochaine manche
      const nextRound = game.currentRound + 1

      // Vérifier si on a atteint le nombre total de manches
      if (nextRound > game.totalRounds) {
        // Terminer la partie
        game.status = 'completed'
        game.completedAt = DateTime.now()
        await game.save()

        // Notifier les joueurs
        socketService.emitToGame(String(game.id), 'game:update', {
          type: 'game_completed',
          message: 'La partie est terminée !',
          data: {
            status: 'completed',
            scores: game.scores,
            completedAt: game.completedAt,
          },
        })

        return response.ok({
          status: 'success',
          message: 'La partie est terminée',
          data: {
            status: 'completed',
            scores: game.scores,
          },
        })
      }

      // Lancer la prochaine manche
      const success = await gameService.prepareNewRound(game.id, nextRound)

      if (!success) {
        return response.badRequest({
          error: 'Impossible de passer à la manche suivante.',
        })
      }

      return response.ok({
        status: 'success',
        message: 'Manche suivante commencée avec succès',
      })
    } catch (error) {
      console.error('Erreur lors du passage à la manche suivante:', error)
      return response.internalServerError({
        error: 'Une erreur est survenue lors du passage à la manche suivante',
      })
    } finally {
      await this.releaseLock(`game:${gameId}:next-round`)
    }
  }

  /**
   * Récupérer l'historique des questions et réponses d'un jeu
   */
  async getGameHistory({ response, params }: HttpContext) {
    const gameId = params.id

    try {
      // Récupérer le jeu
      const game = await Game.find(gameId)
      if (!game) {
        return response.notFound({ error: 'Partie non trouvée' })
      }

      // Récupérer les questions
      const questions = await Question.query()
        .where('game_id', gameId)
        .orderBy('round_number', 'asc')
        .preload('targetPlayer')

      // Récupérer les réponses et les votes pour chaque question
      const questionsWithAnswers = await Promise.all(
        questions.map(async (question) => {
          const questionAnswers = await Answer.query()
            .where('question_id', question.id)
            .preload('user')
            .preload('votes', (vq) => vq.preload('voter'))

          return {
            id: question.id,
            text: question.text,
            roundNumber: question.roundNumber,
            targetPlayer: question.targetPlayer
              ? {
                  id: question.targetPlayer.id,
                  username: question.targetPlayer.username,
                  displayName: question.targetPlayer.displayName,
                }
              : null,
            answers: questionAnswers.map((answer) => ({
              id: answer.id,
              content: answer.content,
              player: {
                id: answer.user.id,
                username: answer.user.username,
                displayName: answer.user.displayName,
              },
              votes: answer.votes.map((vote) => ({
                id: vote.id,
                voter: {
                  id: vote.voter.id,
                  username: vote.voter.username,
                  displayName: vote.voter.displayName,
                },
              })),
            })),
          }
        })
      )

      return response.ok({
        status: 'success',
        data: {
          game: {
            id: game.id,
            status: game.status,
            currentRound: game.currentRound,
            totalRounds: game.totalRounds,
            gameMode: game.gameMode,
            scores: game.scores,
            createdAt: game.createdAt,
            completedAt: game.completedAt,
          },
          questions: questionsWithAnswers,
        },
      })
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique du jeu:", error)
      return response.internalServerError({
        error: "Une erreur est survenue lors de la récupération de l'historique du jeu",
      })
    }
  }
}
