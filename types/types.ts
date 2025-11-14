import { GameState } from "@/types/gameTypes";

export interface TrapAnswer {
  text: string;
  isCorrect: boolean;
  isTrap: boolean;
}

export interface PointsTransaction {
  amount: number;
  reason: string;
  timestamp: any;
  gameId?: string;
}

export interface TrapQuestion {
  id: string;
  text: string;
  theme: string;
  roundNumber: number;
  question: string;
  answers: TrapAnswer[];
}

export interface TrapPlayerAnswer {
  answer: string;
  isCorrect: boolean;
  isTrap: boolean;
}

export interface TrapGameState extends Omit<GameState, "currentQuestion"> {
  currentQuestion: TrapQuestion | null;
  questions: TrapQuestion[];
  playerAnswers: {
    [playerId: string]: TrapPlayerAnswer;
  };
  askedQuestionIds: string[];
  history?: {
    [playerId: string]: number[];
  };
}

export interface PileOuFaceQuestion {
  id: string;
  text: string;
  theme: string;
  roundNumber: number;
  type?: "sympa" | "trash" | "mechant";
}

export interface PileOuFaceGameState
  extends Omit<GameState, "currentQuestion" | "currentPlayerId" | "phase"> {
  phase: string; // Custom phases: 'loading', 'question', 'coin-flip', 'reveal', 'results', 'end'
  currentQuestion: PileOuFaceQuestion | null;
  currentPlayerId: string | null;
  selectedPlayerName: string | null;
  coinFlipResult: "pile" | "face" | null;
  questionRevealed: boolean;
  askedQuestionIds: string[];
  isFlipping: boolean; // État synchronisé pour l'animation de la pièce
  coinFlipHistory: Array<"pile" | "face">; // Historique pour équilibrer les résultats
}
