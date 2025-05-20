import { GameState } from '@/types/gameTypes';

export interface TrapAnswer {
  text: string;
  isCorrect: boolean;
  isTrap: boolean;
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

export interface TrapGameState extends Omit<GameState, 'currentQuestion'> {
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