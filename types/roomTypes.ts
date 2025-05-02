export interface Room {
  id: string;
  roomCode: string;
  name: string;
  gameType: string;
  max_players: number;
  players: Player[];
  host: Player;
  status: 'waiting' | 'playing' | 'finished';
}

export interface Player {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  isHost: boolean;
  isReady: boolean;
  level?: number;
}

export interface CreateRoomPayload {
  gameType: string;
  max_players: number;
  name: string;
} 