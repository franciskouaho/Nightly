// Définition des phases du jeu
export enum GamePhase {
  LOADING = 'loading',
  QUESTION = 'question',
  ANSWER = 'answer',
  VOTE = 'vote',
  RESULTS = 'results',
  WAITING = 'waiting',
  WAITING_FOR_VOTE = 'waiting_for_vote',
  TRANSITIONING = 'transitioning',
  FINISHED = 'finished',
  ERROR = 'error'
}

// Types de jeu possibles
export enum GameMode {
  STANDARD = 'standard',
  VERSUS = 'versus',
  TEAM = 'team'
}

// Types de jeux disponibles
export enum GameType {
  QUIZ = 'quiz',
  TRUTH_OR_DARE = 'truth-or-dare',
  HOT = 'hot',
  BLIND_TEST = 'blind-test'
}

// Statut du jeu
export enum GameStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
  ERROR = 'error'
}

// Interface pour un joueur
export interface Player {
  id: string | number;
  username: string;
  displayName?: string;
  avatar?: string;
  isHost?: boolean;
  score?: number;
  level?: number;
  isReady?: boolean;
}

// Interface pour une question
export interface Question {
  id: string | number;
  text: string;
  roundNumber?: number;
  targetPlayer?: Player;
  targetPlayerId?: string | number;
}

// Interface pour une réponse
export interface Answer {
  id: string | number;
  content: string;
  playerId?: string | number;
  playerName?: string;
  votesCount?: number;
  isOwnAnswer?: boolean;
  userId?: string | number;
  user?: {
    displayName?: string;
    username?: string;
  };
}

// Interface pour un vote
export interface Vote {
  id: string | number;
  answerId: string | number;
  questionId?: string | number;
  voterId: string | number;
  createdAt?: string;
}

// Interface pour une salle
export interface Room {
  id: string | number;
  code: string;
  name: string;
  hostId: string | number;
  status?: string;
  players?: Player[];
  gameType?: GameType; // Type du jeu qui sera joué dans cette salle
  maxPlayers?: number;
  host?: Player;
}

// Interface pour le timer
export interface Timer {
  duration: number;
  startTime: number;
}

// Interface pour un jeu
export interface Game {
  id: string | number;
  roomId?: string | number;
  hostId?: string | number;
  status: string;
  gameMode?: string;
  currentPhase: string;
  currentRound: number;
  totalRounds: number;
  scores: Record<string, number>;
  createdAt?: string;
  gameType?: GameType; // Type du jeu
}

// Interface pour l'état d'un jeu
export interface GameState {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  targetPlayer: Player | null;
  currentQuestion: Question | null;
  answers: Answer[];
  players: Player[];
  scores: Record<string, number>;
  timer: Timer | null;
  room: Room | null;
  currentUserState: {
    hasAnswered: boolean;
    hasVoted: boolean;
    isTargetPlayer: boolean;
  };
  game: Game;
  error?: string;
  allPlayersVoted?: boolean;
}

// Interface pour une action sur l'état du jeu
export interface GameAction {
  type: string;
  payload?: any;
}

// Interface pour les réponses WebSocket
export interface WebSocketResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

// Interface pour les événements de jeu
export interface GameEvent {
  type: 'phase_change' | 'new_answer' | 'new_vote' | 'target_player_vote' | 'game_end' | 'new_round' | 'phase_reminder' | 'player_joined' | 'player_left' | 'host_changed' | 'error';
  phase?: string;
  message?: string;
  [key: string]: any;
}

// Interface pour les informations de cache d'un état de jeu
export interface GameStateCache {
  state: GameState;
  timestamp: number;
}

// Interface pour les informations d'hôte
export interface HostInfo {
  hostId: string;
  timestamp: number;
}

// Interface pour la création d'une salle
export interface CreateRoomPayload {
  name: string;
  game_mode: string;
  gameType: GameType;
  max_players: number;
  total_rounds: number;
  is_private?: boolean;
  settings?: Record<string, any>;
}
