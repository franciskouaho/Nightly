import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { answerValidator } from '#validators/game'
import socketService from '#services/socket_service'
import questionService from '#services/question_service'
import Redis from '@adonisjs/redis/services/main'
import { Socket } from 'socket.io'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

import Game from '#models/game'
import Question from '#models/question'
import Answer from '#models/answer'
import Vote from '#models/vote'
import Room from '#models/room'
import User from '#models/user'

interface GameData {
  currentPhase: string
  currentQuestion?: {
    targetPlayerId: string
  }
}

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

export default class GamesController {
  private redis = Redis
  private readonly LOCK_TTL = 5 // 5 secondes pour les locks
  private readonly CACHE_TTL = 2 // 2 secondes pour le cache

  /**
   * Gestion des locks Redis optimisée
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
   * Afficher les détails d'une partie en cours (optimisé)
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

      const game = await Game.query()
        .where('id', gameId)
        .preload('room', (roomQuery) => {
          roomQuery.preload('players')
        })
        .first()

      if (!game) {
        return response.notFound({ error: 'Partie non trouvée' })
      }

      const isPlayerInGame = game.room.players.some((player) => player.id === user.id)
      if (!isPlayerInGame) {
        return response.forbidden({ error: 'Vous ne faites pas partie de cette partie' })
      }

      const currentQuestion =
        game.currentRound > 0
          ? await Question.query()
              .where('game_id', game.id)
              .where('round_number', game.currentRound)
              .preload('targetPlayer')
              .first()
          : null

      const [answers, hasAnswered, hasVoted] = await Promise.all([
        currentQuestion
          ? Answer.query()
              .where('question_id', currentQuestion.id)
              .preload('user')
              .then((answers) =>
                answers.map((answer) => ({
                  ...answer.toJSON(),
                  isOwnAnswer: answer.userId === user.id,
                }))
              )
          : [],
        currentQuestion
          ? Answer.query()
              .where('question_id', currentQuestion.id)
              .where('user_id', user.id)
              .first()
              .then((answer) => answer !== null)
          : false,
        currentQuestion
          ? Vote.query()
              .where('question_id', currentQuestion.id)
              .where('voter_id', user.id)
              .first()
              .then((vote) => vote !== null)
          : false,
      ])

      const isTargetPlayer = currentQuestion ? currentQuestion.targetPlayerId === user.id : false

      // Calculate if all players have voted (similar to checkAndProgressToResults method)
      let allPlayersVoted = false
      if (currentQuestion && game.currentPhase === 'vote') {
        // In this game, only the target player needs to vote
        const targetHasVoted = await Vote.query()
          .where('question_id', currentQuestion.id)
          .where('voter_id', currentQuestion.targetPlayerId)
          .first()

        allPlayersVoted = targetHasVoted !== null
      }

      const gameData = {
        status: 'success',
        data: {
          game: {
            id: game.id,
            roomId: game.roomId,
            currentRound: game.currentRound,
            totalRounds: game.totalRounds,
            status: game.status,
            gameMode: game.gameMode,
            currentPhase: game.currentPhase,
            scores: game.scores || {},
            createdAt: game.createdAt,
          },
          room: {
            id: game.room.id,
            code: game.room.code,
            name: game.room.name,
            hostId: game.room.hostId,
          },
          players: game.room.players.map((player) => ({
            id: player.id,
            username: player.username,
            displayName: player.displayName,
            avatar: player.avatar,
            score: game.scores?.[player.id] || 0,
            isHost: player.id === game.room.hostId,
          })),
          currentQuestion: currentQuestion
            ? {
                id: currentQuestion.id,
                text: currentQuestion.text,
                roundNumber: currentQuestion.roundNumber,
                targetPlayer: currentQuestion.targetPlayer
                  ? {
                      id: currentQuestion.targetPlayer.id,
                      username: currentQuestion.targetPlayer.username,
                      displayName: currentQuestion.targetPlayer.displayName,
                      avatar: currentQuestion.targetPlayer.avatar,
                    }
                  : null,
              }
            : null,
          answers: answers.map((answer) => ({
            id: answer.id,
            content: answer.content,
            playerId: answer.userId,
            playerName: answer.user?.displayName || answer.user?.username || 'Joueur anonyme',
            votesCount: answer.votesCount || 0,
            isOwnAnswer: answer.isOwnAnswer || answer.userId === user.id,
          })),
          currentUserState: {
            hasAnswered,
            hasVoted,
            isTargetPlayer,
          },
          allPlayersVoted,
        },
      }

      // Mettre en cache
      await Redis.setex(`game:${gameId}`, this.CACHE_TTL, JSON.stringify(gameData))

      return response.ok(gameData)
    } catch (error) {
      return response.internalServerError({
        error: 'Une erreur est survenue lors de la récupération des détails de la partie',
        details: error.message,
      })
    }
  }

  /**
   * Soumettre une réponse à la question actuelle (optimisé)
   */
  async submitAnswer({ request, response, auth, params }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const gameId = params.id
      const lockKey = `answer:${gameId}:${user.id}`

      if (!(await this.acquireLock(lockKey, 3))) {
        return response.conflict({ error: 'Une soumission est déjà en cours' })
      }

      try {
        const payload = await request.validateUsing(answerValidator)
        const game = await Game.find(gameId)
        if (!game) return response.notFound({ error: 'Partie non trouvée' })
        if (game.status !== 'in_progress')
          return response.badRequest({ error: "La partie n'est pas en cours" })

        const question = await Question.query()
          .where('game_id', gameId)
          .where('round_number', game.currentRound)
          .first()

        if (!question) return response.notFound({ error: 'Question non trouvée' })
        if (question.targetPlayerId === user.id) {
          return response.badRequest({
            error: 'Vous êtes la cible de cette question et ne pouvez pas y répondre',
          })
        }

        const existingAnswer = await Answer.query()
          .where('question_id', question.id)
          .where('user_id', user.id)
          .first()

        if (existingAnswer)
          return response.conflict({ error: 'Vous avez déjà répondu à cette question' })

        const content = String(payload.content).trim()
        if (!content)
          return response.badRequest({ error: 'Le contenu de la réponse ne peut pas être vide' })

        const answer = await Answer.create({
          questionId: question.id,
          userId: user.id,
          content: content,
          votesCount: 0,
          isSelected: false,
        })

        const io = socketService.getInstance()
        io.to(`game:${gameId}`).emit('game:update', {
          type: 'new_answer',
          answer: {
            id: answer.id,
            content: answer.content,
            playerId: user.id,
            playerName: user.displayName || user.username,
          },
          instantTransition: true,
        })

        await this.checkAndProgressPhase(gameId, question.id)

        return response.created({
          status: 'success',
          message: 'Réponse soumise avec succès',
        })
      } finally {
        await this.releaseLock(lockKey)
      }
    } catch (error) {
      return response.internalServerError({
        error: 'Une erreur est survenue lors de la soumission de la réponse',
        details: error.message || 'Erreur inconnue',
      })
    }
  }

  /**
   * Vérifier et faire progresser la phase (optimisé)
   */
  private async checkAndProgressPhase(
    gameId: string | number,
    questionId: string | number
  ): Promise<boolean> {
    try {
      const game = await Game.find(gameId)
      if (!game) return false
      if (game.currentPhase === 'vote' || game.currentPhase === 'results') return false

      const question = await Question.findOrFail(questionId)
      const gameRoom = await Room.find(game.roomId)
      const gamePlayers = gameRoom ? await gameRoom.related('players').query() : []

      const answersCount = await Answer.query().where('question_id', questionId).count('* as count')
      const count = Number.parseInt(answersCount[0].$extras.count || '0', 10)
      const nonTargetPlayers = gamePlayers.filter(
        (player) => player.id !== question.targetPlayerId
      ).length

      if (count >= nonTargetPlayers) {
        game.currentPhase = 'vote'
        await game.save()

        const io = socketService.getInstance()
        const targetPlayer = gamePlayers.find((player) => player.id === question.targetPlayerId)

        if (targetPlayer) {
          const answers = await Answer.query()
            .where('question_id', questionId)
            .preload('user')
            .orderBy('created_at', 'asc')

          const answerData = answers.map((answer) => ({
            id: answer.id,
            content: answer.content,
            playerId: answer.userId,
            playerName: answer.user?.displayName || answer.user?.username || 'Joueur anonyme',
          }))

          io.to(`game:${gameId}`).emit('game:update', {
            type: 'target_player_vote',
            phase: 'vote',
            message: "C'est à votre tour de voter!",
            targetPlayerId: targetPlayer.id,
            questionId: questionId,
            answers: answerData,
            instantTransition: true,
          })
        }

        io.to(`game:${gameId}`).emit('game:update', {
          type: 'phase_change',
          phase: 'vote',
          message: 'Toutes les réponses ont été reçues. Place au vote!',
          targetPlayerId: question.targetPlayerId,
          instantTransition: true,
        })

        return true
      }

      return false
    } catch (error) {
      return false
    }
  }

  /**
   * Voter pour une réponse (optimisé)
   */
  public async submitVote({ request, response, auth, params }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const gameId = params.id
      const { answer_id, question_id, voter_id } = request.body()
      const lockKey = `vote:${gameId}:${voter_id}`

      if (!(await this.acquireLock(lockKey, 2))) {
        return response.conflict({ error: 'Un vote est déjà en cours' })
      }

      try {
        const [game, question, existingVote] = await Promise.all([
          Game.find(gameId),
          Question.findOrFail(question_id),
          Vote.query().where('question_id', question_id).where('voter_id', voter_id).first(),
        ])

        if (!game || game.status !== 'in_progress') {
          return response.badRequest({ error: 'Le jeu est invalide ou terminé.' })
        }

        if (!['vote', 'question'].includes(game.currentPhase)) {
          return response.badRequest({ error: "Ce n'est pas le moment de voter." })
        }

        if (existingVote) {
          return response.conflict({ error: 'Vous avez déjà voté.' })
        }

        const voterIdStr = String(voter_id)
        const targetPlayerIdStr = String(question.targetPlayerId)
        const isTarget = voterIdStr === targetPlayerIdStr

        if (!isTarget) {
          const hasAnswered = await Answer.query()
            .where('question_id', question_id)
            .where('user_id', voter_id)
            .first()

          if (!hasAnswered) {
            return response.badRequest({
              error: "Vous devez d'abord répondre à la question avant de voter.",
            })
          }
        }

        const [vote] = await Promise.all([
          Vote.create({
            questionId: question_id,
            voterId: voter_id,
            answerId: answer_id,
          }),
          game.currentPhase !== 'vote'
            ? game.merge({ currentPhase: 'vote' }).save()
            : Promise.resolve(),
        ])

        const io = socketService.getInstance()
        io.to(`game:${gameId}`).emit('game:update', {
          type: 'vote_submitted',
          playerId: voter_id,
          message: `${user.displayName || user.username} a voté !`,
          instantTransition: true,
        })

        this.checkAndProgressToResults(gameId, question_id).catch(console.error)

        return response.ok({
          status: 'success',
          message: 'Vote enregistré avec succès',
        })
      } finally {
        await this.releaseLock(lockKey)
      }
    } catch (error) {
      return response.internalServerError({
        error: "Une erreur s'est produite lors du vote.",
      })
    }
  }

  /**
   * Vérifier si tous les votes sont soumis et passer à la phase suivante (optimisé)
   */
  private async checkAndProgressToResults(
    gameId: string | number,
    questionId: number
  ): Promise<void> {
    try {
      const game = await Game.findOrFail(gameId)
      const question = await Question.findOrFail(questionId)

      // Check if the target player has voted
      const targetHasVoted = await Vote.query()
        .where('question_id', questionId)
        .where('voter_id', question.targetPlayerId)
        .first()

      const allPlayersVoted = targetHasVoted !== null

      if (allPlayersVoted) {
        game.currentPhase = 'results'
        await game.save()

        const io = socketService.getInstance()
        io.to(`game:${gameId}`).emit('game:update', {
          type: 'phase_change',
          phase: 'results',
          instantTransition: true,
        })
      }
    } catch (error) {
      // Ignorer les erreurs silencieusement
    }
  }

  /**
   * Passer au tour suivant ou terminer la partie (optimisé)
   */
  async nextRound({ response, auth, params }: HttpContext) {
    const gameId = params.id
    const lockKey = `game:${gameId}:phase_change`

    try {
      if (!(await this.acquireLock(lockKey, 5))) {
        return response.conflict({ error: 'Une transition de phase est déjà en cours' })
      }

      try {
        const user = await auth.authenticate()
        const game = await Game.find(gameId)
        if (!game) return response.notFound({ error: 'Partie non trouvée' })

        await game.load('room', (query) => {
          query.preload('players')
        })

        const room = await Room.find(game.roomId)
        if (!room) return response.notFound({ error: 'Salle non trouvée' })

        if (game.status !== 'in_progress') {
          return response.badRequest({ error: "La partie n'est pas en cours" })
        }

        const [currentQuestion, hasVotes] = await Promise.all([
          Question.query()
            .where('game_id', gameId)
            .where('round_number', game.currentRound)
            .first(),
          Vote.query().where('question_id', currentQuestion?.id).count('* as count').first(),
        ])

        const validPhases = ['results', 'vote']
        if (
          !validPhases.includes(game.currentPhase) ||
          (game.currentPhase === 'vote' && (!hasVotes || hasVotes.$extras.count === '0'))
        ) {
          return response.badRequest({
            error: 'Veuillez attendre la fin des votes avant de passer au tour suivant',
            details: {
              currentPhase: game.currentPhase,
              hasVotes: hasVotes ? Number(hasVotes.$extras.count) > 0 : false,
            },
          })
        }

        if (room.hostId !== user.id) {
          return response.forbidden({ error: "Seul l'hôte peut passer au tour suivant" })
        }

        const io = socketService.getInstance()

        if (game.currentRound >= game.totalRounds) {
          game.status = 'completed'
          game.completedAt = DateTime.now()
          await game.save()

          room.status = 'finished'
          room.endedAt = DateTime.now()
          await room.save()

          await this.updatePlayerStats(room.id, game)

          io.to(`game:${gameId}`).emit('game:update', {
            type: 'game_end',
            finalScores: game.scores,
          })

          return {
            status: 'success',
            message: 'La partie est terminée',
            data: {
              finalScores: game.scores,
            },
          }
        } else {
          game.currentRound += 1
          game.currentPhase = 'question'

          const targetPlayer = await selectRandomTargetPlayer(gameId, game.currentTargetPlayerId)
          game.currentTargetPlayerId = targetPlayer.id
          await game.save()

          const questionFromDB = await questionService.getRandomQuestionByTheme(game.gameMode)
          let questionText = ''

          if (questionFromDB) {
            questionText = questionService.formatQuestion(
              questionFromDB.text,
              targetPlayer.displayName || targetPlayer.username
            )
          } else {
            questionText = await this.generateFallbackQuestion(
              game.gameMode,
              targetPlayer.displayName || targetPlayer.username
            )
          }

          const question = await Question.create({
            text: questionText,
            theme: game.gameMode,
            gameId: game.id,
            roundNumber: game.currentRound,
            targetPlayerId: targetPlayer.id,
          })

          io.to(`game:${gameId}`).emit('game:update', {
            type: 'new_question',
            question: {
              id: question.id,
              text: question.text,
              roundNumber: question.roundNumber,
              targetPlayer: question.targetPlayer
                ? {
                    id: question.targetPlayer.id,
                    username: question.targetPlayer.username,
                    displayName: question.targetPlayer.displayName,
                    avatar: question.targetPlayer.avatar,
                  }
                : null,
            },
            instantTransition: true,
          })

          return {
            status: 'success',
            message: 'Le tour suivant a commencé',
            data: {
              currentRound: game.currentRound,
              totalRounds: game.totalRounds,
            },
          }
        }
      } finally {
        await this.releaseLock(lockKey)
      }
    } catch (error) {
      return response.internalServerError({
        error: 'Une erreur est survenue lors de la transition de tour',
        details: error.message,
      })
    }
  }
}
