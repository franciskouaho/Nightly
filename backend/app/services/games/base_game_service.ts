import { DateTime } from 'luxon'
import socketService from '#services/socket_service'
import Redis from '@adonisjs/redis/services/main'
import Game from '#models/game'
import { GameMode, GamePhase, GameState } from '#types/game'

/**
 * Service de base pour tous les types de jeux
 * Fournit les fonctionnalités communes à tous les jeux
 */
export default abstract class BaseGameService {
  protected readonly LOCK_TTL = 5 // 5 secondes pour les locks
  protected readonly CACHE_TTL = 60 // 60 secondes pour le cache

  /**
   * Nom unique du type de jeu
   */
  abstract get gameMode(): GameMode

  /**
   * Description du jeu
   */
  abstract get description(): string

  /**
   * Initialiser une nouvelle partie
   */
  abstract async initializeGame(gameId: number): Promise<boolean>

  /**
   * Préparer une nouvelle manche
   */
  abstract async prepareNewRound(gameId: number, roundNumber: number): Promise<boolean>

  /**
   * Gérer la soumission d'une réponse (spécifique au type de jeu)
   */
  abstract async handleAnswer(gameId: number, userId: number, answer: string): Promise<boolean>

  /**
   * Gérer la soumission d'un vote (spécifique au type de jeu)
   */
  abstract async handleVote(gameId: number, voterId: number, answerId: number): Promise<boolean>

  /**
   * Déterminer si toutes les réponses ont été reçues
   */
  abstract async checkAllAnswersReceived(gameId: number, questionId: number): Promise<boolean>

  /**
   * Déterminer si tous les votes ont été reçus
   */
  abstract async checkAllVotesReceived(gameId: number, questionId: number): Promise<boolean>

  /**
   * Méthode pour mettre à jour l'état du jeu
   */
  protected async updateGameState(
    gameId: number,
    update: Partial<GameState>
  ): Promise<Game | null> {
    try {
      const game = await Game.find(gameId)
      if (!game) return null

      // Mettre à jour les propriétés du jeu
      game.merge(update)
      await game.save()

      // Mettre à jour le cache Redis si nécessaire
      await Redis.setex(`game:${gameId}:state`, this.CACHE_TTL, JSON.stringify(game.toJSON()))

      return game
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de l'état du jeu:", error)
      return null
    }
  }

  /**
   * Passer à la phase suivante du jeu
   */
  protected async progressToNextPhase(gameId: number, currentPhase: GamePhase): Promise<GamePhase> {
    const phaseSequence: GamePhase[] = [
      'waiting',
      'question',
      'answer',
      'vote',
      'results',
      'finished',
    ]
    const currentIndex = phaseSequence.indexOf(currentPhase)

    if (currentIndex === -1 || currentIndex === phaseSequence.length - 1) {
      return currentPhase // Phase invalide ou dernière phase
    }

    const nextPhase = phaseSequence[currentIndex + 1]
    await this.updateGameState(gameId, { currentPhase: nextPhase })

    // Notifier les joueurs du changement de phase
    socketService.emitToGame(String(gameId), 'game:update', {
      type: 'phase_change',
      phase: nextPhase,
      instantTransition: true,
    })

    return nextPhase
  }

  /**
   * Obtenir l'état actuel complet du jeu
   */
  async getGameState(gameId: number): Promise<GameState | null> {
    try {
      // Vérifier le cache Redis d'abord
      const cachedState = await Redis.get(`game:${gameId}:state`)

      if (cachedState) {
        return JSON.parse(cachedState)
      }

      // Récupérer les données de la base
      const game = await Game.find(gameId)
      if (!game) return null

      const result = game.toJSON() as GameState

      // Mettre en cache pour les prochaines demandes
      await Redis.setex(`game:${gameId}:state`, this.CACHE_TTL, JSON.stringify(result))

      return result
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'état du jeu:", error)
      return null
    }
  }

  /**
   * Gestion des locks Redis pour les opérations concurrentes
   */
  protected async acquireLock(key: string, ttl: number = this.LOCK_TTL): Promise<boolean> {
    try {
      return (await Redis.setex(`lock:${key}`, ttl, DateTime.now().toISO())) === 'OK'
    } catch (error) {
      console.error("❌ Erreur lors de l'acquisition du lock:", error)
      return false
    }
  }

  /**
   * Libération des locks Redis
   */
  protected async releaseLock(key: string): Promise<void> {
    try {
      await Redis.del(`lock:${key}`)
    } catch (error) {
      console.error('❌ Erreur lors de la libération du lock:', error)
    }
  }

  /**
   * Exécuter une fonction avec un lock Redis
   */
  protected async withLock<T>(
    lockKey: string,
    fn: () => Promise<T>,
    ttl: number = this.LOCK_TTL
  ): Promise<T | null> {
    if (!(await this.acquireLock(lockKey, ttl))) {
      console.warn(`⚠️ Impossible d'acquérir le lock pour ${lockKey}`)
      return null
    }

    try {
      return await fn()
    } finally {
      await this.releaseLock(lockKey)
    }
  }
}
