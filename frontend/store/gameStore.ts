import { create } from 'zustand';
import { GameState, GamePhase, GameMode, Player, Question, Answer, Vote, Room } from '@/types/gameTypes';
import { gameApi } from '@/services/gameApi';

interface GameStore extends GameState {
  // Actions pour gérer l'état du jeu
  setGameState: (state: Partial<GameState>) => void;
  setPhase: (phase: GamePhase) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setTargetPlayer: (player: Player | null) => void;
  addAnswer: (answer: Answer) => void;
  addVote: (vote: Vote) => void;
  updatePlayerScore: (playerId: string | number, score: number) => void;
  setRoom: (room: Room | null) => void;
  setPlayers: (players: Player[]) => void;
  setTimer: (duration: number) => void;
  clearTimer: () => void;
  resetGame: () => void;
  setError: (error: string | undefined) => void;
  submitVote: (answerId: string | number, questionId: string | number, voterId: string | number) => Promise<void>;
  updateGamePhase: (phase: GamePhase, instantTransition: boolean) => void;
  syncGameState: (gameData: any) => void;
}

const initialState: GameState = {
  phase: GamePhase.LOADING,
  currentRound: 0,
  totalRounds: 0,
  targetPlayer: null,
  currentQuestion: null,
  answers: [],
  players: [],
  scores: {},
  timer: null,
  room: null,
  currentUserState: {
    hasAnswered: false,
    hasVoted: false,
    isTargetPlayer: false,
  },
  game: {
    id: '',
    status: '',
    currentPhase: '',
    currentRound: 0,
    totalRounds: 0,
    scores: {},
  },
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setGameState: (state) => set((prev) => ({ ...prev, ...state })),

  setPhase: (phase) => set((prev) => ({ ...prev, phase })),

  setCurrentQuestion: (question) => set((prev) => ({ ...prev, currentQuestion: question })),

  setTargetPlayer: (player) => set((prev) => ({ ...prev, targetPlayer: player })),

  addAnswer: (answer) => set((prev) => ({
    ...prev,
    answers: [...prev.answers, answer],
  })),

  addVote: (vote) => set((prev) => ({
    ...prev,
    answers: prev.answers.map((answer) =>
      answer.id === vote.answerId
        ? { ...answer, votesCount: (answer.votesCount || 0) + 1 }
        : answer
    ),
    currentUserState: {
      ...prev.currentUserState,
      hasVoted: true,
    },
  })),

  updatePlayerScore: (playerId, score) => set((prev) => ({
    ...prev,
    scores: { ...prev.scores, [playerId]: score },
  })),

  setRoom: (room) => set((prev) => ({ ...prev, room })),

  setPlayers: (players) => set((prev) => ({ ...prev, players })),

  setTimer: (duration) => set((prev) => ({
    ...prev,
    timer: {
      duration,
      startTime: Date.now(),
    },
  })),

  clearTimer: () => set((prev) => ({ ...prev, timer: null })),

  resetGame: () => set(initialState),

  setError: (error) => set((prev) => ({ ...prev, error })),

  submitVote: async (answerId, questionId, voterId) => {
    try {
      const state = get();
      if (!state.game?.id) {
        throw new Error('Game ID not found');
      }

      await gameApi.submitVote(state.game.id, {
        answer_id: answerId,
        question_id: questionId,
        voter_id: voterId,
        prevent_auto_progress: true,
      });

      set((prev) => ({
        ...prev,
        currentUserState: {
          ...prev.currentUserState,
          hasVoted: true,
        },
        phase: GamePhase.WAITING,
      }));
    } catch (error) {
      console.error('Error submitting vote:', error);
      set((prev) => ({ ...prev, error: 'Failed to submit vote' }));
      throw error;
    }
  },

  updateGamePhase: (phase: GamePhase, instantTransition: boolean = false) => {
    const state = get();
    const currentPhase = state.game?.currentPhase;

    // Ne pas mettre à jour si la phase est la même
    if (currentPhase === phase) return;

    console.log(`🎮 Mise à jour de la phase: ${currentPhase} -> ${phase} (instantané: ${instantTransition})`);

    set((prev) => ({
      ...prev,
      game: {
        ...prev.game,
        currentPhase: phase,
      },
      phase: instantTransition ? phase : GamePhase.TRANSITIONING,
    }));

    // Si la transition n'est pas instantanée, programmer le changement de phase
    if (!instantTransition) {
      setTimeout(() => {
        set((prev) => ({
          ...prev,
          phase,
        }));
      }, 500);
    }
  },

  syncGameState: (gameData: any) => {
    const currentState = get();
    
    set((prev) => ({
      ...prev,
      game: {
        ...prev.game,
        ...gameData.game,
      },
      currentQuestion: gameData.currentQuestion || prev.currentQuestion,
      answers: gameData.answers || prev.answers,
      players: gameData.players || prev.players,
      scores: gameData.game?.scores || prev.scores,
      currentUserState: {
        ...prev.currentUserState,
        ...gameData.currentUserState,
      },
    }));

    // Mettre à jour la phase si nécessaire
    if (gameData.game?.currentPhase !== currentState.game?.currentPhase) {
      get().updateGamePhase(gameData.game.currentPhase, true);
    }
  },
})); 