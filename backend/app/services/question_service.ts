import QuestionBank from '#models/question_bank'

type QuestionTheme =
  | 'standard'
  | 'crazy'
  | 'fun'
  | 'dark'
  | 'personal'
  | 'action-verite'
  | 'on-ecoute-mais-on-ne-juge-pas'

class QuestionService {
  /**
   * Récupère une question aléatoire par thème
   */
  async getRandomQuestionByTheme(theme: QuestionTheme): Promise<QuestionBank | null> {
    try {
      // Obtenir une question aléatoire du thème spécifié qui est active
      const query = QuestionBank.query()
        .where('theme', theme)
        .where('is_active', true)
        .orderByRaw('RANDOM()')
        .limit(1)

      const question = await query.first()

      // Si aucune question n'est trouvée pour ce thème, essayez le thème standard
      if (!question && theme !== 'standard') {
        console.log(
          `Aucune question trouvée pour le thème: ${theme}, utilisation du thème standard`
        )
        return this.getRandomQuestionByTheme('standard')
      }

      // Si on a trouvé une question, incrémenter son compteur d'utilisation
      if (question) {
        question.usageCount += 1
        await question.save()
      }

      return question
    } catch (error) {
      console.error("Erreur lors de la récupération d'une question aléatoire:", error)
      return null
    }
  }

  /**
   * Formatte une question en remplaçant les placeholders
   */
  formatQuestion(questionText: string, playerName: string): string {
    // Si c'est une question Action ou Vérité, ne pas remplacer le placeholder
    // car ces questions n'ont pas de joueur cible
    if (questionText.startsWith('ACTION:') || questionText.startsWith('VÉRITÉ:')) {
      return questionText
    }
    return questionText.replace('{playerName}', playerName)
  }

  /**
   * Détermine le type de question pour le mode Action ou Vérité
   */
  getActionVeriteType(questionText: string): 'action' | 'verite' | null {
    if (questionText.startsWith('ACTION:')) {
      return 'action'
    } else if (questionText.startsWith('VÉRITÉ:')) {
      return 'verite'
    }
    return null
  }

  // Pour l'API admin
  getQuestionsQuery() {
    return QuestionBank.query()
  }

  async getQuestionById(id: number) {
    return QuestionBank.find(id)
  }

  async createQuestion(data: { text: string; theme: QuestionTheme; createdByUserId?: number }) {
    return QuestionBank.create({
      text: data.text,
      theme: data.theme,
      isActive: true,
      usageCount: 0,
      createdByUserId: data.createdByUserId,
    })
  }

  async updateQuestion(
    id: number,
    data: { text?: string; theme?: QuestionTheme; isActive?: boolean }
  ) {
    const question = await QuestionBank.find(id)
    if (!question) return null

    if (data.text !== undefined) question.text = data.text
    if (data.theme !== undefined) question.theme = data.theme
    if (data.isActive !== undefined) question.isActive = data.isActive

    await question.save()
    return question
  }

  async deleteQuestion(id: number) {
    const question = await QuestionBank.find(id)
    if (!question) return false

    await question.delete()
    return true
  }
}

export default new QuestionService()
