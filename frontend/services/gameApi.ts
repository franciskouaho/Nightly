import api from '@/config/axios';

interface VotePayload {
  answer_id: string | number;
  question_id: string | number;
  voter_id: string | number;
  prevent_auto_progress?: boolean;
}

export const gameApi = {
  submitVote: async (gameId: string | number, payload: VotePayload) => {
    try {
      const response = await api.post(
        `/games/${gameId}/vote`,
        payload,
        {
          headers: {
            'X-Priority': 'high',
            'X-Vote-Request': 'true',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  },
}; 