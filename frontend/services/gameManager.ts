import { GameType, GameMode } from '@/types/gameTypes';
import { router } from 'expo-router';
import { useCreateRoom } from '@/hooks/useRooms';
import api from '@/config/axios';

// Configuration des différents jeux disponibles
export interface GameConfig {
  id: GameType;
  name: string;
  description: string;
  availableModes: GameMode[];
  icon: string;
  routePath: string;
  minPlayers: number;
  maxPlayers: number;
  isAvailable: boolean;
}

// Les modes disponibles pour chaque type de jeu
export interface GameModeConfig {
  id: GameMode | string;
  name: string;
  description: string;
  icon: string;
}

// Liste des jeux disponibles
export const GAMES: GameConfig[] = [
  {
    id: GameType.QUIZ,
    name: 'Quiz',
    description: 'Jouez à un quiz avec vos amis',
    availableModes: [GameMode.STANDARD, GameMode.VERSUS, GameMode.TEAM],
    icon: 'help-circle',
    routePath: '/game',
    minPlayers: 2,
    maxPlayers: 10,
    isAvailable: true
  },
  {
    id: GameType.TRUTH_OR_DARE,
    name: 'Action ou Vérité',
    description: 'Action ou Vérité avec vos amis',
    availableModes: [GameMode.STANDARD],
    icon: 'flame',
    routePath: '/game/truth-or-dare',
    minPlayers: 2,
    maxPlayers: 20,
    isAvailable: true
  },
  {
    id: GameType.HOT,
    name: 'Hot',
    description: 'Questions pimentées',
    availableModes: [GameMode.STANDARD],
    icon: 'thermometer',
    routePath: '/game/hot',
    minPlayers: 2,
    maxPlayers: 20,
    isAvailable: true
  },
  {
    id: GameType.BLIND_TEST,
    name: 'Blind Test',
    description: 'Testez vos connaissances musicales',
    availableModes: [GameMode.STANDARD, GameMode.TEAM],
    icon: 'musical-notes',
    routePath: '/game/blind-test',
    minPlayers: 2,
    maxPlayers: 10,
    isAvailable: false // Pas encore implémenté
  }
];

// Liste des modes de jeu
export const GAME_MODES: Record<string, GameModeConfig> = {
  [GameMode.STANDARD]: {
    id: GameMode.STANDARD,
    name: 'Standard',
    description: 'Mode de jeu classique',
    icon: 'people'
  },
  [GameMode.VERSUS]: {
    id: GameMode.VERSUS,
    name: 'Versus',
    description: 'Jouez les uns contre les autres',
    icon: 'flash'
  },
  [GameMode.TEAM]: {
    id: GameMode.TEAM,
    name: 'Équipes',
    description: 'Jouez en équipes',
    icon: 'people-circle'
  },
  'action': {
    id: 'action',
    name: 'Action',
    description: 'Mode action pour Action ou Vérité',
    icon: 'body'
  },
  'verite': {
    id: 'verite',
    name: 'Vérité',
    description: 'Mode vérité pour Action ou Vérité',
    icon: 'chatbubble'
  }
};

class GameManager {
  /**
   * Obtenir la configuration d'un jeu par son type
   */
  getGameConfig(gameType: GameType): GameConfig | undefined {
    return GAMES.find(game => game.id === gameType);
  }

  /**
   * Obtenir tous les jeux disponibles
   */
  getAvailableGames(): GameConfig[] {
    return GAMES.filter(game => game.isAvailable);
  }

  /**
   * Obtenir les modes disponibles pour un type de jeu
   */
  getAvailableModes(gameType: GameType): GameModeConfig[] {
    const game = this.getGameConfig(gameType);
    if (!game) return [];
    
    return game.availableModes
      .map(modeId => GAME_MODES[modeId])
      .filter((mode): mode is GameModeConfig => mode !== undefined);
  }

  /**
   * Obtenir la configuration d'un mode de jeu
   */
  getModeConfig(modeId: GameMode | string): GameModeConfig | undefined {
    return GAME_MODES[modeId];
  }

  /**
   * Rediriger vers le jeu approprié
   */
  async navigateToGame(gameId: string, mode?: string, options?: any) {
    const game = this.getGameConfig(gameId as GameType);
    
    if (!game) {
      console.error(`Game type ${gameId} not found`);
      return;
    }

    if (game.id === GameType.TRUTH_OR_DARE) {
      try {
        console.log('Création directe d\'une salle Action ou Vérité...');
        const response = await api.post('/rooms', {
          game_type: 'truth-or-dare',
          game_mode: 'action-verite',
          name: 'Action ou Vérité',
          max_players: 8,
          total_rounds: 10,
          is_private: false,
          settings: {}
        });

        if (response.data?.data?.code) {
          console.log(`Redirection vers la salle ${response.data.data.code}`);
          router.replace(`/room/${response.data.data.code}`);
        }
      } catch (error) {
        console.error('Erreur lors de la création de la salle:', error);
      }
    } else if (game.id === GameType.QUIZ) {
      router.push({
        pathname: `/game/[id]` as any,
        params: { id: options?.id || 'new', mode: mode || GameMode.STANDARD, ...options }
      });
    } else {
      // Redirection par défaut avec les paramètres fournis
      router.push({
        pathname: game.routePath as any,
        params: { ...options, mode }
      });
    }
  }
}

export default new GameManager(); 