import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { GameState, GamePhase } from '@/types/gameTypes';

class GameService {
  private unsubscribe: (() => void) | null = null;

  async getGameState(gameId: string): Promise<GameState> {
    try {
      const gameRef = doc(db, 'games', gameId);
      const gameDoc = await getDoc(gameRef);
      
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }

      const gameData = gameDoc.data();
      return this.formatGameState(gameData);
    } catch (error) {
      console.error('Error getting game state:', error);
      throw error;
    }
  }

  subscribeToGameState(gameId: string, callback: (state: GameState) => void): () => void {
    const gameRef = doc(db, 'games', gameId);
    
    // Se désabonner de l'écoute précédente si elle existe
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // Créer une nouvelle écoute
    this.unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const gameData = doc.data();
        callback(this.formatGameState(gameData));
      }
    });

    return () => {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    };
  }

  private formatGameState(gameData: any): GameState {
    return {
      phase: gameData.phase as GamePhase,
      currentRound: gameData.currentRound || 1,
      totalRounds: gameData.totalRounds || 5,
      targetPlayer: gameData.targetPlayer || null,
      currentQuestion: gameData.currentQuestion || null,
      answers: gameData.answers || [],
      players: gameData.players || [],
      scores: gameData.scores || {},
      theme: gameData.theme || 'standard',
      timer: gameData.timer || null,
      currentUserState: gameData.currentUserState || {
        isTargetPlayer: false,
        hasAnswered: false,
        hasVoted: false
      },
      game: {
        currentPhase: gameData.currentPhase || 'loading',
        currentRound: gameData.currentRound || 1,
        totalRounds: gameData.totalRounds || 5,
        scores: gameData.scores || {},
        gameMode: gameData.gameMode || 'standard',
        hostId: gameData.hostId
      }
    };
  }

  async submitAnswer(gameId: string, questionId: string, answer: string): Promise<void> {
    try {
      const gameRef = doc(db, 'games', gameId);
      const gameDoc = await getDoc(gameRef);
      
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }

      const gameData = gameDoc.data();
      const answers = gameData.answers || [];
      
      // Vérifier si l'utilisateur a déjà répondu
      const hasAnswered = answers.some((answer: { playerId: string }) => 
        answer.playerId === this.getCurrentUserId()
      );
      
      if (hasAnswered) {
        throw new Error('You have already answered this question');
      }

      // Ajouter la nouvelle réponse
      const newAnswer = {
        id: Date.now().toString(),
        text: answer,
        playerId: this.getCurrentUserId(),
        playerName: this.getCurrentUserName(),
        questionId
      };

      await updateDoc(gameRef, {
        answers: [...answers, newAnswer]
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  async submitVote(gameId: string, answerId: string): Promise<void> {
    try {
      const gameRef = doc(db, 'games', gameId);
      const gameDoc = await getDoc(gameRef);
      
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }

      const gameData = gameDoc.data();
      const votes = gameData.votes || [];
      
      // Vérifier si l'utilisateur a déjà voté
      const hasVoted = votes.some((vote: { playerId: string }) => 
        vote.playerId === this.getCurrentUserId()
      );
      
      if (hasVoted) {
        throw new Error('You have already voted');
      }

      // Ajouter le nouveau vote
      const newVote = {
        answerId,
        playerId: this.getCurrentUserId(),
        timestamp: Date.now()
      };

      await updateDoc(gameRef, {
        votes: [...votes, newVote]
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  }

  private getCurrentUserId(): string {
    // À implémenter avec votre système d'authentification Firebase
    return 'current-user-id';
  }

  private getCurrentUserName(): string {
    // À implémenter avec votre système d'authentification Firebase
    return 'Current User';
  }

  async forcePhaseTransition(gameId: string, phase: string): Promise<boolean> {
    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        currentPhase: phase
      });
      return true;
    } catch (error) {
      console.error('Error forcing phase transition:', error);
      return false;
    }
  }
}

export default new GameService(); 