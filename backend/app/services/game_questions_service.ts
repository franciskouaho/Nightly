import db from '@adonisjs/lucid/services/db'

/**
 * Service de gestion des questions de jeu
 */
class GameQuestionsService {
  /**
   * Récupérer une question aléatoire pour un jeu spécifique
   */
  async getRandomQuestion(gameType: string, category?: string, difficulty?: string) {
    const query = db.from('questions').where('game_type', gameType)

    if (category) {
      query.where('category', category)
    }

    if (difficulty) {
      query.where('difficulty', difficulty)
    }

    return query.orderByRaw('RANDOM()').first()
  }

  /**
   * Récupérer un lot de questions pour un jeu spécifique
   */
  async getQuestionsBatch(gameType: string, category?: string, count: number = 10) {
    const query = db.from('questions').where('game_type', gameType)

    if (category) {
      query.where('category', category)
    }

    return query.orderByRaw('RANDOM()').limit(count)
  }

  /**
   * Récupérer les questions d'action ou vérité
   */
  async getTruthOrDareQuestion(type?: string, difficulty?: string) {
    const query = db.from('questions').where('game_type', 'truth-or-dare')

    if (type && ['action', 'verite'].includes(type)) {
      query.where('category', type)
    }

    if (difficulty) {
      query.where('difficulty', difficulty)
    }

    return query.orderByRaw('RANDOM()').first()
  }
}

export default new GameQuestionsService()
