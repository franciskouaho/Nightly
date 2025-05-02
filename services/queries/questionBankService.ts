import api from '@/config/axios';
import { GameType } from '@/types/gameTypes';

// Types de question disponibles
export type QuestionCategory = 'standard' | 'action' | 'verite' | 'hot' | 'blind_test';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: number | string;
  text: string;
  category: QuestionCategory;
  gameType: GameType;
  difficulty?: QuestionDifficulty;
  answer?: string;
  metadata?: Record<string, any>;
}

class QuestionBankService {
  /**
   * Récupérer une question aléatoire pour un jeu et une catégorie spécifiques
   */
  async getRandomQuestion(
    gameType: GameType, 
    category?: QuestionCategory,
    difficulty?: QuestionDifficulty
  ): Promise<Question> {
    try {
      const params: Record<string, any> = { gameType };
      
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;
      
      const response = await api.get('/public/questions/random', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération d\'une question aléatoire:', error);
      
      // Renvoyer une question par défaut en cas d'erreur
      return {
        id: 'default',
        text: 'Question par défaut en cas d\'erreur de connexion...',
        category: category || 'standard',
        gameType,
        difficulty: difficulty || 'medium'
      };
    }
  }
  
  /**
   * Récupérer une question "Action ou Vérité" spécifique
   */
  async getTruthOrDareQuestion(type: 'action' | 'verite', difficulty?: QuestionDifficulty): Promise<Question> {
    return this.getRandomQuestion(
      GameType.TRUTH_OR_DARE, 
      type as QuestionCategory,
      difficulty
    );
  }
  
  /**
   * Récupérer une question pour le jeu Hot
   */
  async getHotQuestion(difficulty?: QuestionDifficulty): Promise<Question> {
    return this.getRandomQuestion(
      GameType.HOT,
      'hot',
      difficulty
    );
  }
  
  /**
   * Récupérer une question pour le Quiz
   */
  async getQuizQuestion(difficulty?: QuestionDifficulty): Promise<Question> {
    return this.getRandomQuestion(
      GameType.QUIZ,
      'standard',
      difficulty
    );
  }
  
  /**
   * Récupérer des questions pour un jeu spécifique (lot de questions)
   */
  async getQuestionsForGame(
    gameType: GameType,
    category?: QuestionCategory,
    count: number = 10
  ): Promise<Question[]> {
    try {
      const params: Record<string, any> = { gameType, count };
      
      if (category) params.category = category;
      
      const response = await api.get('/api/questions/batch', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des questions:', error);
      
      // Générer des questions factices en cas d'erreur
      return Array.from({ length: count }, (_, i) => ({
        id: `default-${i}`,
        text: `Question par défaut #${i+1} en cas d'erreur de connexion...`,
        category: category || 'standard',
        gameType,
        difficulty: 'medium' as QuestionDifficulty
      }));
    }
  }
}

export default new QuestionBankService(); 