import { Player as BasePlayer } from './gameTypes';

/**
 * Types de questions pour Truth or Dare (Action ou Vérité)
 */
export enum QuestionType {
  TRUTH = 'truth',
  DARE = 'dare'
}

/**
 * Niveaux de difficulté
 */
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

/**
 * Interface pour une question de Truth or Dare
 */
export interface TruthOrDareQuestion {
  id: string;
  type: QuestionType;
  text: string;
  level: DifficultyLevel;
}

/**
 * Interface pour un joueur de Truth or Dare, étendant le joueur de base
 */
export interface TruthOrDarePlayer extends BasePlayer {
  id: string;  // Assure que l'ID est une chaîne
  truthCount?: number;
  dareCount?: number;
  skipCount?: number;
  isReady?: boolean; // Indique si le joueur est prêt à commencer la partie
  level?: number;    // Niveau du joueur
}

/**
 * Interface pour le contexte du jeu Truth or Dare
 */
export interface TruthOrDareContext {
  currentQuestion: TruthOrDareQuestion | null;
  players: TruthOrDarePlayer[];
  currentPlayerIndex: number;
  history: string[];
  truthCount: number;
  dareCount: number;
  isHost: boolean;
  roomId: string;
}

/**
 * Interface pour les événements socket de Truth or Dare
 */
export interface TruthOrDareSocketEvents {
  'truth-or-dare:new-question': (data: { question: TruthOrDareQuestion }) => void;
  'truth-or-dare:player-turn': (data: { playerIndex: number }) => void;
  'truth-or-dare:player-joined': (data: { player: TruthOrDarePlayer }) => void;
  'truth-or-dare:player-left': (data: { playerId: string }) => void;
  'truth-or-dare:game-state': (data: { context: TruthOrDareContext }) => void;
} 