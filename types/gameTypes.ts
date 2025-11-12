export interface Player {
  id: string;
  name: string;
  avatar?: string;
  displayName?: string;
  username?: string;
}

export interface Question {
  id: string;
  text: string;
  theme: string;
  roundNumber: number;
  type?: "coquin" | "sage";
  answer?: string;
  intensity?: "soft" | "tension" | "extreme";
  level?: "hot" | "extreme" | "chaos"; // For double-dare
  mode?: "versus" | "fusion"; // For double-dare game modes
}

export interface Answer {
  id: string;
  text: string;
  playerId: string;
  playerName: string;
  isOwnAnswer?: boolean;
}

export enum GamePhase {
  LOADING = "loading",
  CHOIX = "choix",
  QUESTION = "question",
  WAITING = "waiting",
  VOTE = "vote",
  WAITING_FOR_VOTE = "waiting_for_vote",
  RESULTS = "results",
  END = "end",
}

export type GameMode =
  | "never-have-i-ever-hot"
  | "never-have-i-ever-classic"
  | "truth-or-dare"
  | "genius-or-liar"
  | "trap-answer"
  | "listen-but-don-t-judge"
  | "quiz-halloween"
  | "forbidden-desire"
  | "double-dare"
  | "word-guessing"
  | "pile-ou-face";

export interface GameState {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  targetPlayer: Player | null;
  currentQuestion: Question | null;
  answers: Answer[];
  players: Player[];
  scores: Record<string, number>;
  theme: string;
  timer: number | null;
  currentUserState?: {
    isTargetPlayer: boolean;
    hasAnswered: boolean;
    hasVoted: boolean;
  };
  game?: {
    currentPhase: string;
    currentRound: number;
    totalRounds: number;
    scores: Record<string, number>;
    gameMode: string;
    hostId?: string;
  };
  allPlayersVoted?: boolean;
  currentPlayerId?: string;
  gameMode?: string;
  naughtyAnswers?: Record<string, number>;
}
