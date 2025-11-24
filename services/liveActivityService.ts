import { Platform } from 'react-native';
import { getFirestore, doc, onSnapshot } from '@react-native-firebase/firestore';

/**
 * Service pour gérer les Live Activities (parties en cours)
 * Note: Les Live Activities doivent être démarrées depuis le code natif Swift
 * Ce service fournit les utilitaires pour gérer les données nécessaires
 */

export interface LiveActivityGameData {
  roomId: string;
  roomCode: string;
  gameName: string;
  playerCount: number;
  currentRound: number;
  totalRounds: number;
  timeRemaining?: string;
  status: 'playing' | 'waiting' | 'finished';
}

/**
 * Service pour gérer les Live Activities
 */
export class LiveActivityService {
  /**
   * Préparer les données pour démarrer une Live Activity
   * Ces données seront utilisées par le code Swift pour démarrer l'activité
   */
  static prepareActivityData(data: LiveActivityGameData) {
    if (Platform.OS !== 'ios') {
      console.warn('Live Activities are only available on iOS');
      return;
    }

    // Sauvegarder les données dans l'App Group pour que le widget puisse y accéder
    // Le code Swift démarrera l'activité via ActivityKit
    const APP_GROUP_ID = 'group.com.emplica.nightly.data';
    
    // Pour démarrer une Live Activity depuis React Native, il faut utiliser
    // un module natif ou un bridge. Pour l'instant, on prépare juste les données.
    // TODO: Créer un module natif pour démarrer les Live Activities
    
    console.log('Preparing Live Activity data:', data);
    
    // Option 1: Utiliser un EventEmitter pour communiquer avec le code natif
    // Option 2: Sauvegarder dans l'App Group et laisser le code Swift les lire
    
    // Pour l'instant, on utilise AsyncStorage ou un autre mécanisme
    // pour que le code Swift puisse démarrer l'activité
  }

  /**
   * Mettre à jour une Live Activity existante
   */
  static updateActivity(roomId: string, updates: Partial<LiveActivityGameData>) {
    if (Platform.OS !== 'ios') {
      return;
    }

    // Même principe, utiliser un bridge natif ou sauvegarder dans l'App Group
    console.log('Updating Live Activity:', roomId, updates);
  }

  /**
   * Arrêter une Live Activity
   */
  static endActivity(roomId: string) {
    if (Platform.OS !== 'ios') {
      return;
    }

    console.log('Ending Live Activity:', roomId);
  }

  /**
   * Écouter les changements d'une partie et mettre à jour la Live Activity
   */
  static setupGameListener(roomId: string, onUpdate: (data: LiveActivityGameData) => void) {
    const db = getFirestore();
    const roomRef = doc(db, 'rooms', roomId);

    return onSnapshot(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const roomData = snapshot.data();
          
          const activityData: LiveActivityGameData = {
            roomId: roomId,
            roomCode: roomData.code || '',
            gameName: roomData.gameName || 'Partie',
            playerCount: roomData.players?.length || 0,
            currentRound: roomData.currentRound || 1,
            totalRounds: roomData.totalRounds || 1,
            status: roomData.status || 'waiting',
          };

          // Mettre à jour la Live Activity
          this.updateActivity(roomId, activityData);
          
          // Appeler le callback
          onUpdate(activityData);
        }
      },
      (error) => {
        console.error('Erreur lors de l\'écoute de la partie:', error);
      }
    );
  }
}

