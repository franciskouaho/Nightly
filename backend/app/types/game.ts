export type GameMode = 'action-verite' | 'on-ecoute-mais-on-ne-juge-pas' | 'quiz' | 'personnalite'

export type GamePhase = 'waiting' | 'question' | 'answer' | 'vote' | 'results' | 'finished'

export interface GameSettings {
  rounds?: number
  timePerQuestion?: number
  timePerVote?: number
  allowCustomQuestions?: boolean
  difficulty?: 'easy' | 'medium' | 'hard'
  categories?: string[]
}

export interface PlayerGameState {
  id: number | string
  username: string
  displayName?: string
  isHost: boolean
  isReady: boolean
  hasAnswered?: boolean
  hasVoted?: boolean
  score?: number
  streak?: number
  isTargetPlayer?: boolean
}

export interface GameState {
  id: number | string
  roomId: number | string
  mode: GameMode
  status: 'waiting' | 'in_progress' | 'finished'
  currentPhase: GamePhase
  currentRound: number
  totalRounds: number
  currentTargetPlayerId?: number | string
  currentQuestionId?: number | string
  scores: Record<string, number>
  settings?: GameSettings
  startedAt?: string
  endedAt?: string
}
