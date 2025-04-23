import gameService from '@/services/queries/game';
import { GamePhase } from '@/types/gameTypes';

/**
 * Utilitaire pour gérer les transitions de phase du jeu
 */
export class GamePhaseManager {
  /**
   * Vérifie si tous les joueurs ont voté et force la transition vers la phase résultats si nécessaire
   * @param gameId ID du jeu
   * @returns Promise<boolean> indiquant si la transition a été tentée
   */
  static async checkAndTransitionToResults(gameId: string): Promise<boolean> {
    try {
      console.log(`🔍 GamePhaseManager: Vérification des votes pour le jeu ${gameId}`);
      
      // Récupérer l'état actuel du jeu
      const gameState = await gameService.getGameState(gameId);
      
      // Si le jeu n'est pas en phase vote, ne rien faire
      if (gameState?.game?.currentPhase !== 'vote') {
        console.log(`ℹ️ GamePhaseManager: Le jeu n'est pas en phase vote, pas de transition nécessaire`);
        return false;
      }
      
      // Vérifier si tous les joueurs ont voté
      const allVoted = gameState?.allPlayersVoted;
      
      if (allVoted) {
        console.log(`✅ GamePhaseManager: Tous les joueurs ont voté, transition vers résultats`);
        
        // Forcer la transition vers la phase résultats
        const success = await gameService.forcePhaseTransition(gameId, 'results');
        
        if (success) {
          console.log(`✅ GamePhaseManager: Transition vers résultats réussie`);
          return true;
        } else {
          console.warn(`⚠️ GamePhaseManager: Échec de la transition vers résultats`);
        }
      } else {
        console.log(`ℹ️ GamePhaseManager: Tous les joueurs n'ont pas encore voté`);
      }
      
      return false;
    } catch (error) {
      console.error(`❌ GamePhaseManager: Erreur lors de la vérification des votes:`, error);
      return false;
    }
  }

  /**
   * Vérifie périodiquement si tous les joueurs ont voté et force la transition vers résultats si nécessaire
   * @param gameId ID du jeu
   * @param interval Intervalle entre les vérifications (ms)
   * @param maxAttempts Nombre maximum de tentatives
   * @returns Fonction pour arrêter les vérifications
   */
  static startAutoTransitionToResults(
    gameId: string, 
    interval: number = 3000, 
    maxAttempts: number = 5
  ): () => void {
    console.log(`🔄 GamePhaseManager: Démarrage des vérifications automatiques pour le jeu ${gameId}`);
    
    let attempts = 0;
    
    const intervalId = setInterval(async () => {
      attempts++;
      
      console.log(`🔍 GamePhaseManager: Vérification ${attempts}/${maxAttempts}`);
      
      const success = await this.checkAndTransitionToResults(gameId);
      
      if (success || attempts >= maxAttempts) {
        clearInterval(intervalId);
        console.log(`✅ GamePhaseManager: Arrêt des vérifications automatiques`);
      }
    }, interval);
    
    // Retourner une fonction pour arrêter les vérifications
    return () => {
      clearInterval(intervalId);
      console.log(`❌ GamePhaseManager: Vérifications automatiques arrêtées manuellement`);
    };
  }
} 