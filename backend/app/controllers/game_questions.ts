import { HttpContext } from '@adonisjs/core/http'
import gameQuestionsService from '#services/game_questions_service'

// Constantes HTTP
const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}

export default class GameQuestionsController {
  /**
   * Récupérer une question aléatoire pour un jeu spécifique
   */
  async getRandomQuestion({ request, response }: HttpContext) {
    try {
      const { gameType, category, difficulty } = request.qs()

      if (!gameType) {
        return response.status(HTTP_STATUS.BAD_REQUEST).json({
          message: 'Le paramètre gameType est requis',
        })
      }

      const question = await gameQuestionsService.getRandomQuestion(gameType, category, difficulty)

      if (!question) {
        return response.status(HTTP_STATUS.NOT_FOUND).json({
          message: 'Aucune question trouvée pour ces critères',
        })
      }

      return response.json(question)
    } catch (error) {
      console.error("Erreur lors de la récupération d'une question aléatoire:", error)
      return response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: 'Une erreur est survenue lors de la récupération de la question',
      })
    }
  }

  /**
   * Récupérer un lot de questions pour un jeu spécifique
   */
  async getQuestionsBatch({ request, response }: HttpContext) {
    try {
      const { gameType, category, count = 10 } = request.qs()

      if (!gameType) {
        return response.status(HTTP_STATUS.BAD_REQUEST).json({
          message: 'Le paramètre gameType est requis',
        })
      }

      const questions = await gameQuestionsService.getQuestionsBatch(gameType, category, count)

      if (questions.length === 0) {
        return response.status(HTTP_STATUS.NOT_FOUND).json({
          message: 'Aucune question trouvée pour ces critères',
        })
      }

      return response.json(questions)
    } catch (error) {
      console.error('Erreur lors de la récupération des questions:', error)
      return response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: 'Une erreur est survenue lors de la récupération des questions',
      })
    }
  }

  /**
   * Récupérer les questions d'action ou vérité
   */
  async getTruthOrDareQuestions({ request, response }: HttpContext) {
    try {
      const { type, difficulty } = request.qs()

      // Vérifier que le type est valide
      if (type && !['action', 'verite'].includes(type)) {
        return response.status(HTTP_STATUS.BAD_REQUEST).json({
          message: 'Le type doit être "action" ou "verite"',
        })
      }

      const question = await gameQuestionsService.getTruthOrDareQuestion(type, difficulty)

      if (!question) {
        return response.status(HTTP_STATUS.NOT_FOUND).json({
          message: 'Aucune question trouvée pour ces critères',
        })
      }

      return response.json(question)
    } catch (error) {
      console.error("Erreur lors de la récupération d'une question d'action ou vérité:", error)
      return response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: 'Une erreur est survenue lors de la récupération de la question',
      })
    }
  }
}
