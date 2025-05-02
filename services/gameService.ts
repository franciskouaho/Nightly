import api from '@/config/axios';
import { GameType } from '@/types/game';

const GAME_TYPE_TO_MODE: Record<GameType, string> = {
  'truth-or-dare': 'action-verite',
  'would-you-rather': 'on-ecoute-mais-on-ne-juge-pas',
};

export const gameService = {
  async createGame(gameType: GameType, roomId: number) {
    const response = await api.post('/games', {
      gameMode: GAME_TYPE_TO_MODE[gameType],
      roomId,
    });
    return response.data;
  },

  async getGamesByType(gameType: GameType) {
    const response = await api.get('/games', {
      params: {
        gameMode: GAME_TYPE_TO_MODE[gameType],
        status: 'in_progress'
      },
    });
    return response.data;
  },

  async getGameById(gameId: number) {
    const response = await api.get(`/games/${gameId}`);
    return response.data;
  },

  async getCurrentQuestion(gameId: number) {
    const response = await api.get(`/games/${gameId}/current-question`);
    return response.data;
  },

  async nextQuestion(gameId: number) {
    const response = await api.post(`/games/${gameId}/next-question`);
    return response.data;
  },
}; 