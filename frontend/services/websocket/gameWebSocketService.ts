public async submitVote(gameId: number, answerId: number, questionId: number, voterId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!this.socket) {
      reject(new Error('Socket non connecté'))
      return
    }

    const timeout = setTimeout(() => {
      reject(new Error('Timeout lors de la soumission du vote'))
    }, 5000)

    this.socket.emit('vote', {
      game_id: gameId,
      answer_id: answerId,
      question_id: questionId,
      voter_id: voterId
    }, (response: any) => {
      clearTimeout(timeout)
      if (response.error) {
        reject(new Error(response.error))
      } else {
        resolve(response)
      }
    })
  })
} 