export type Theme = 'standard' | 'crazy' | 'fun' | 'dark' | 'personal';

export interface Question {
  id: number;
  text: string;
  theme: Theme;
  roundNumber?: number;
  targetPlayerId?: number;
}

export interface GameState {
  currentRound: number;
  currentQuestion?: Question;
  players: Player[];
  gameType: GameType;
  status: GameStatus;
}

export interface Player {
  id: number;
  name: string;
  score?: number;
  isActive: boolean;
}

export type GameType = 'truth-or-dare' | 'would-you-rather';

export type GameStatus = 'waiting' | 'playing' | 'finished'; 