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
      throw new Error('Vous n\'êtes pas dans cette partie')
    }

    // Récupérer les questions du jeu
    const questions = await Question.query()
      .where('game_id', gameId)
      .orderBy('round_number', 'asc')

    // Récupérer les votes
    const votes = await Vote.query()
      .whereIn('question_id', questions.map(q => q.id))

    return {
      game: game.toJSON(),
      room: room.toJSON(),
      questions: questions.map(q => q.toJSON()),
      votes: votes.map(v => v.toJSON()),
      currentPhase: game.currentPhase,
      currentRound: game.currentRound,
      status: game.status
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'état du jeu:', error)
    throw error
  }
}

async show({ response, params }: HttpContext) {
  try {
    const game = await Game.findOrFail(params.id)
    await game.load('questions')
    await game.load('players')

    // Notifier les joueurs via Socket.IO
    socketService.emitToGame(game.id, 'game:update', {
      type: 'game_state',
      game: game.toJSON(),
    })

    return response.ok(game)
  } catch (error) {
    console.error('Erreur lors de la récupération du jeu:', error)
    return response.notFound({ error: 'Jeu non trouvé' })
  }
}

async submitAnswer({ request, response, auth, params }: HttpContext) {
  try {
    const user = await auth.authenticate()
    const { answer } = request.only(['answer'])
    const game = await Game.findOrFail(params.id)

    // Vérifier si le joueur peut soumettre une réponse
    if (game.currentPlayerId !== user.id) {
      return response.forbidden({ error: "Ce n'est pas votre tour" })
    }

    // Enregistrer la réponse
    await game.related('answers').create({
      playerId: user.id,
      answer,
    })

    // Notifier les joueurs via Socket.IO
    socketService.emitToGame(game.id, 'game:update', {
      type: 'answer_submitted',
      playerId: user.id,
      answer,
    })

    return response.ok({ status: 'success' })
  } catch (error) {
    console.error('Erreur lors de la soumission de la réponse:', error)
    return response.internalServerError({
      error: 'Une erreur est survenue lors de la soumission de la réponse',
    })
  }
} 