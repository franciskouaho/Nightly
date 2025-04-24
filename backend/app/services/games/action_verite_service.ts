import BaseGameService from './base_game_service.js'
import questionService from '#services/question_service'
import socketService from '#services/socket_service'
import Game from '#models/game'
import Room from '#models/room'
import QuestionModel from '#models/question'
import AnswerModel from '#models/answer'
import { GameMode } from '#types/game'

interface ActionVeriteQuestion {
  id: string
  type: 'action' | 'verite'
  content: string
  round: number
  playerId: number
  playerName: string
  createdAt: string
}

interface ActionVeriteAnswer {
  id: string
  questionId: string
  playerId: number
  playerName: string
  content: string
  createdAt: string
}

interface ActionVeriteVote {
  questionId: string
  answerId: string
  voterId: number
}

interface ActionVeriteGameState {
  id: number
  status: string
  currentRound: number
  totalRounds: number
  currentPhase: string
  currentTurn: number
  scores: Record<string, number>
  players: {
    id: number
    displayName: string | null
    avatar: string | null
  }[]
  questions: ActionVeriteQuestion[]
  answers: ActionVeriteAnswer[]
  votes: ActionVeriteVote[]
  timeLeft?: number
}

/**
 * Service pour le jeu Action ou Vérité
 */
class ActionVeriteService extends BaseGameService {
  /**
   * Nom unique du type de jeu
   */
  get gameMode(): GameMode {
    return 'action-verite'
  }

  /**
   * Description du jeu
   */
  get description(): string {
    return "Un jeu classique d'action ou vérité où les joueurs doivent répondre à des questions ou effectuer des actions"
  }

  /**
   * Questions prédéfinies par type
   */
  private readonly predefinedQuestions = {
    action: [
      'Fais 10 pompes devant tout le monde',
      'Imite un animal pendant 30 secondes',
      "Chante le début d'une chanson de ton choix",
      'Fais le poirier contre un mur',
      "Récite l'alphabet à l'envers",
      'Fais une danse improvisée pendant 20 secondes',
      "Appelle un ami et dis-lui que tu l'aimes bien",
      'Fais 5 tours sur toi-même puis marche droit',
      'Raconte une blague',
      "Mets un glaçon dans ton t-shirt jusqu'à ce qu'il fonde",
      'Fais une grimace et garde-la pendant 30 secondes',
      "Fais semblant d'être une statue pendant 1 minute",
      'Envoie un message bizarre à une personne aléatoire de ton téléphone',
      'Fais comme si tu étais à la plage pendant 30 secondes',
      'Imite une célébrité connue pendant 30 secondes',
      'Mange quelque chose sans utiliser tes mains',
      'Parle avec un accent étranger pendant 2 minutes',
      'Fais un compliment à chaque joueur',
      'Invente une histoire en 30 secondes',
      'Danse comme si personne ne te regardait',
      'Fais le tour de la pièce en marchant comme un crabe',
      'Parle en rimes pendant 2 minutes',
      'Imite un personnage de dessin animé de ton enfance',
      "Fais semblant d'être un présentateur météo pendant 1 minute",
      'Invente un slogan publicitaire pour le joueur à ta droite',
    ],
    verite: [
      'Quel est ton plus grand regret ?',
      'Quelle est la chose la plus embarrassante que tu aies jamais faite ?',
      'Quel est ton plus grand secret ?',
      'As-tu déjà triché à un examen ?',
      'Quelle est la chose la plus folle que tu aies faite par amour ?',
      'Quel est ton plus grand rêve dans la vie ?',
      'Quelle est ta plus grande peur ?',
      'As-tu déjà volé quelque chose ?',
      'Quelle est la chose la plus bizarre que tu aies mangée ?',
      'Quel est ton talent caché ?',
      'Raconte ton pire rendez-vous amoureux',
      'Quelle est la chose la plus chère que tu aies achetée ?',
      'Quelle est ta plus grande addiction ?',
      'Quel est ton film préféré et pourquoi ?',
      'Quelle est la chose la plus difficile que tu aies surmontée ?',
      'Quelle est ta plus grande réussite ?',
      'Raconte ton moment le plus gênant en public',
      'Quelle est ta plus grande qualité selon toi ?',
      'Quel est ton plus grand défaut ?',
      'Quelle est ta chanson préférée du moment ?',
      'Quelle est la chose la plus courageuse que tu aies jamais faite ?',
      'Si tu pouvais changer une chose dans ta vie, que serait-elle ?',
      "Quel est ton souvenir d'enfance le plus marquant ?",
      'Quelle personne admires-tu le plus et pourquoi ?',
      'Quel est ton plus grand rêve non réalisé ?',
    ],
  }

  /**
   * Initialiser une nouvelle partie d'Action ou Vérité
   */
  async initializeGame(gameId: number): Promise<boolean> {
    try {
      const game = await Game.find(gameId)
      if (!game) return false

      // Mettre à jour l'état initial du jeu
      game.currentPhase = 'question'
      game.currentRound = 1
      game.status = 'in_progress'
      await game.save()

      // Préparer la première manche
      return this.prepareNewRound(gameId, 1)
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation du jeu Action ou Vérité:", error)
      return false
    }
  }

  /**
   * Préparer une nouvelle manche d'Action ou Vérité
   */
  async prepareNewRound(gameId: number, roundNumber: number): Promise<boolean> {
    try {
      const game = await Game.find(gameId)
      if (!game) return false

      const room = await Room.find(game.roomId)
      if (!room) return false

      // Charger les joueurs de la salle
      const players = await room.related('players').query()
      if (players.length < 2) return false

      // Sélectionner un joueur cible aléatoire, différent du joueur précédent si possible
      let targetPlayer = null
      if (players.length > 1) {
        const previousTargetId = await this.getPreviousTargetId(gameId)
        const eligiblePlayers = previousTargetId
          ? players.filter((p) => p.id !== previousTargetId)
          : players

        const randomIndex = Math.floor(Math.random() * eligiblePlayers.length)
        targetPlayer = eligiblePlayers[randomIndex]
      } else {
        targetPlayer = players[0]
      }

      // Récupérer une question aléatoire du thème
      const questionFromDB = await questionService.getRandomQuestionByTheme('action-verite')

      if (!questionFromDB) {
        console.error('❌ Aucune question trouvée pour le jeu Action ou Vérité')
        return false
      }

      // Créer la question pour cette manche
      const question = await QuestionModel.create({
        text: questionFromDB.text,
        gameId: game.id,
        roundNumber: roundNumber,
        targetPlayerId: targetPlayer.id,
        theme: this.gameMode,
      })

      // Mettre à jour l'état du jeu
      game.currentPhase = 'question'
      game.currentRound = roundNumber
      game.currentTargetPlayerId = targetPlayer.id
      await game.save()

      // Notifier tous les joueurs de la nouvelle manche
      socketService.emitToGame(String(gameId), 'game:update', {
        type: 'new_round',
        round: roundNumber,
        phase: 'question',
        question: {
          id: question.id,
          text: question.text,
          targetPlayer: {
            id: targetPlayer.id,
            username: targetPlayer.username,
            displayName: targetPlayer.displayName,
          },
        },
        instantTransition: true,
      })

      return true
    } catch (error) {
      console.error(
        "❌ Erreur lors de la préparation d'une nouvelle manche Action ou Vérité:",
        error
      )
      return false
    }
  }

  /**
   * Récupérer le joueur cible de la manche précédente
   */
  private async getPreviousTargetId(gameId: number): Promise<number | null> {
    try {
      const latestQuestion = await QuestionModel.query()
        .where('game_id', gameId)
        .orderBy('round_number', 'desc')
        .first()

      return latestQuestion ? latestQuestion.targetPlayerId : null
    } catch (error) {
      return null
    }
  }

  /**
   * Gérer la soumission d'une réponse dans le jeu Action ou Vérité
   */
  async handleAnswer(params: object): Promise<object | null> {
    const { answer, gameId, roomId } = params as {
      answer: {
        hasAnswered: boolean
      }
      gameId: string
      roomId: string
    }

    return this.lockAndExecute(`handle-answer-${gameId}`, async () => {
      try {
        const game = await Game.find(gameId)
        if (!game || game.status !== 'in_progress') return null

        if (!['question', 'answer'].includes(game.currentPhase)) {
          return null // Ce n'est pas le moment de répondre
        }

        // Trouver la question en cours
        const currentQuestion = await QuestionModel.query()
          .where('game_id', gameId)
          .where('round_number', game.currentRound)
          .first()

        if (!currentQuestion) return null

        // Vérifier si c'est le joueur cible
        const isTargetPlayer = currentQuestion.targetPlayerId === answer.userId

        // Dans Action ou Vérité, seul le joueur cible répond
        if (!isTargetPlayer) {
          return null
        }

        // Vérifier si le joueur a déjà répondu
        const existingAnswer = await AnswerModel.query()
          .where('question_id', currentQuestion.id)
          .where('user_id', answer.userId)
          .first()

        if (existingAnswer) return null // Déjà répondu

        // Créer la réponse
        await AnswerModel.create({
          questionId: currentQuestion.id,
          userId: answer.userId,
          content: answer.content,
        })

        // Passer à la phase suivante
        if (game.currentPhase === 'question') {
          game.currentPhase = 'results'
          await game.save()

          // Notifier les joueurs du changement de phase
          socketService.emitToGame(String(gameId), 'game:update', {
            type: 'phase_change',
            phase: 'results',
            message: 'Réponse soumise !',
            playerId: answer.userId,
            answer: answer.content,
            instantTransition: true,
          })
        }

        return {
          hasAnswered: true,
          answer: answer.content,
        }
      } catch (error) {
        console.error("❌ Erreur lors de la soumission d'une réponse Action ou Vérité:", error)
        return null
      }
    }) as Promise<object | null>
  }

  /**
   * Gérer la soumission d'un vote - dans Action ou Vérité, il n'y a pas vraiment de vote
   * mais on implémente quand même pour la cohérence de l'interface
   */
  async handleVote(gameId: number, voterId: number, answerId: number): Promise<boolean> {
    // Dans Action ou Vérité, nous n'avons pas vraiment besoin de votes
    // Cette méthode est implémentée pour la compatibilité avec l'interface BaseGameService
    return true
  }

  /**
   * Vérifier si toutes les réponses ont été reçues (dans Action ou Vérité, c'est toujours un seul joueur)
   */
  async checkAllAnswersReceived(gameId: number, questionId: number): Promise<boolean> {
    try {
      const question = await QuestionModel.find(questionId)
      if (!question) return false

      // Dans Action ou Vérité, nous n'attendons qu'une réponse du joueur cible
      const answer = await AnswerModel.query()
        .where('question_id', questionId)
        .where('user_id', question.targetPlayerId)
        .first()

      return answer !== null
    } catch (error) {
      return false
    }
  }

  /**
   * Vérifier si tous les votes ont été reçus - pas applicable pour Action ou Vérité
   */
  async checkAllVotesReceived(gameId: number, questionId: number): Promise<boolean> {
    // Dans Action ou Vérité, il n'y a pas de phase de vote
    return true
  }

  /**
   * Obtenir l'état complet du jeu
   */
  async getGameState(gameId: number): Promise<ActionVeriteGameState> {
    // Récupérer le jeu
    const game = await Game.query()
      .where('id', gameId)
      .preload('room', (roomQuery) => {
        roomQuery.preload('players')
      })
      .firstOrFail()

    // Formater les données des joueurs
    const players = game.room.players.map((player) => ({
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar,
    }))

    // Récupérer les métadonnées du jeu
    const metadata = game.$attributes.metadata || {}

    return {
      id: game.id,
      status: game.status,
      currentRound: game.currentRound,
      totalRounds: game.totalRounds,
      currentPhase: game.currentPhase,
      currentTurn: game.$attributes.currentTurn || 0,
      scores: game.scores || {},
      players,
      questions: metadata.questions || [],
      answers: metadata.answers || [],
      votes: metadata.votes || [],
      timeLeft: metadata.timeLeft,
    }
  }

  /**
   * Soumettre une question (Action ou Vérité)
   * Cette méthode gère la soumission d'une question par un joueur
   */
  async submitQuestion(params: object): Promise<object | null> {
    const { question, gameId, roomId } = params as {
      question: {
        text: string
        category: string
      }
      gameId: string
      roomId: string
    }

    return this.lockAndExecute(`submit-question-${gameId}`, async () => {
      try {
        // Récupérer le jeu
        const game = await Game.find(gameId)
        if (!game) {
          console.error(`❌ Jeu ${gameId} non trouvé lors de la soumission d'une question`)
          return null
        }

        // Vérifier que le jeu est en phase de question
        if (game.currentPhase !== 'question') {
          console.error(
            `❌ Le jeu n'est pas en phase de question, phase actuelle: ${game.currentPhase}`
          )
          return null
        }

        // Récupérer les informations du joueur
        const room = await Room.find(game.roomId)
        if (!room) return null

        const player = await room.related('players').query().where('id', question.playerId).first()
        if (!player) {
          console.error(`❌ Joueur ${question.playerId} non trouvé dans la partie`)
          return null
        }

        // Créer une nouvelle question
        const questionModel = await QuestionModel.create({
          text: question.text,
          gameId: game.id,
          roundNumber: game.currentRound,
          targetPlayerId: question.playerId,
          theme: this.gameMode,
        })

        // Passer à la phase de réponse
        game.currentPhase = 'answer'
        await game.save()

        // Notifier les joueurs
        socketService.emitToGame(String(gameId), 'game:update', {
          type: 'question_submitted',
          message: `${player.displayName} a choisi ${question.category === 'action' ? 'Action' : 'Vérité'} !`,
          data: {
            question: {
              id: questionModel.id,
              type: question.category,
              content: question.text,
              targetPlayer: {
                id: player.id,
                username: player.username,
                displayName: player.displayName,
              },
            },
            phase: 'answer',
          },
        })

        return {
          question: {
            id: questionModel.id,
            type: question.category,
            content: question.text,
            targetPlayer: {
              id: player.id,
              username: player.username,
              displayName: player.displayName,
            },
          },
          phase: 'answer',
        }
      } catch (error) {
        console.error("❌ Erreur lors de la soumission d'une question:", error)
        return null
      }
    }) as Promise<object | null>
  }

  /**
   * Méthode utilitaire pour verrouiller les opérations critiques
   * Utilise le withLock de la classe parent
   */
  private async lockAndExecute<T>(lockKey: string, callback: () => Promise<T>): Promise<T | null> {
    try {
      return await this.withLock(lockKey, this.LOCK_TTL, callback)
    } catch (error) {
      console.error(`❌ Erreur lors de l'exécution avec verrou pour ${lockKey}:`, error)
      throw error
    }
  }
}

// Singleton
export default new ActionVeriteService()
