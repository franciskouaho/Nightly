import { ExtensionStorage } from '@bacons/apple-targets';
import { getFirestore, doc, getDoc, onSnapshot } from '@react-native-firebase/firestore';

// Instance du storage pour l'App Group
const APP_GROUP_ID = 'group.com.emplica.nightly.data';
const storage = new ExtensionStorage(APP_GROUP_ID);

export interface WidgetData {
  currentStreak: number;
  longestStreak: number;
  distance: string | null;
  distanceKm: number | null;
  partnerName: string | null;
  daysTogether: number;
  hasActiveChallenge: boolean;
  challengeText: string;
}

/**
 * Service pour gérer les données du widget et Live Activity
 */
export class WidgetService {
  /**
   * Mettre à jour les données du widget
   */
  static async updateWidgetData(data: Partial<WidgetData>) {
    try {
      // Sauvegarder les données dans l'App Group
      if (data.currentStreak !== undefined) {
        storage.set('currentStreak', data.currentStreak);
      }
      
      if (data.longestStreak !== undefined) {
        storage.set('longestStreak', data.longestStreak);
      }
      
      if (data.distance !== undefined) {
        storage.set('distance', data.distance || 'N/A');
      }
      
      if (data.partnerName !== undefined) {
        storage.set('partnerName', data.partnerName || '');
      }
      
      if (data.daysTogether !== undefined) {
        storage.set('daysTogether', data.daysTogether);
      }
      
      if (data.hasActiveChallenge !== undefined) {
        storage.set('hasActiveChallenge', data.hasActiveChallenge ? 'true' : 'false');
      }
      
      if (data.challengeText !== undefined) {
        storage.set('challengeText', data.challengeText || '');
      }
      
      // Recharger le widget pour afficher les nouvelles données
      ExtensionStorage.reloadWidget();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du widget:', error);
    }
  }

  /**
   * Synchroniser les données du couple avec le widget depuis Firebase
   */
  static async syncCoupleData(
    userId: string,
    partnerId: string | null | undefined,
    streak: { currentStreak: number; longestStreak: number } | null,
    distance: string | null,
    daysTogether: number,
    challenge: { hasActive: boolean; text: string } | null
  ) {
    if (!partnerId || !userId) {
      // Pas de partenaire, vider les données du widget
      await this.updateWidgetData({
        currentStreak: 0,
        longestStreak: 0,
        distance: null,
        partnerName: null,
        daysTogether: 0,
        hasActiveChallenge: false,
        challengeText: '',
      });
      return;
    }

    try {
      const db = getFirestore();
      
      // Récupérer les données du partenaire depuis Firebase
      const partnerRef = doc(db, 'users', partnerId);
      const partnerDoc = await getDoc(partnerRef);

      let partnerName = '';
      let partnerCreatedAt = new Date();
      
      if (partnerDoc.exists()) {
        const partnerData = partnerDoc.data();
        partnerName = (partnerData?.pseudo || '').toUpperCase();
        partnerCreatedAt = partnerData?.createdAt 
          ? new Date(partnerData.createdAt) 
          : new Date();
      }

      // Récupérer les données de l'utilisateur pour calculer daysTogether
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      let userCreatedAt = new Date();
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userCreatedAt = userData?.createdAt 
          ? new Date(userData.createdAt) 
          : new Date();
      }

      // Récupérer le coupleId pour accéder aux données du couple
      const coupleId = getCoupleId(userId, partnerId);
      const coupleRef = doc(db, 'couples', coupleId);
      const coupleDoc = await getDoc(coupleRef);
      
      // Récupérer daysTogether depuis le document couple (comme dans l'app)
      // PRIORISER la valeur passée depuis l'app (daysTogether)
      // Utiliser Firebase seulement comme fallback si la valeur n'est pas fournie
      let daysTogetherFromCouple = daysTogether;
      let currentStreak = streak?.currentStreak || 0;
      let longestStreak = streak?.longestStreak || 0;
      
      if (coupleDoc.exists()) {
        const coupleData = coupleDoc.data();
        
        // Utiliser daysTogether depuis le document couple SEULEMENT si pas fourni depuis l'app
        if (daysTogetherFromCouple === 0 && coupleData?.daysTogether !== undefined) {
          daysTogetherFromCouple = coupleData.daysTogether;
        }
        
        // Récupérer le streak depuis Firebase si pas fourni
        if (!streak) {
          currentStreak = coupleData?.currentStreak || 0;
          longestStreak = coupleData?.longestStreak || 0;
        }
      }
      
      // Si daysTogether n'est toujours pas défini, calculer depuis les dates de création
      if (daysTogetherFromCouple === 0) {
        const earliestDate = userCreatedAt < partnerCreatedAt ? userCreatedAt : partnerCreatedAt;
        daysTogetherFromCouple = Math.floor(
          (new Date().getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      // Récupérer le défi quotidien depuis Firebase si pas fourni
      let hasActiveChallenge = challenge?.hasActive || false;
      let challengeText = challenge?.text || '';

      if (!challenge) {
        const today = new Date().toISOString().split('T')[0];
        const challengeRef = doc(db, 'coupleChallenges', `${coupleId}_${today}`);
        const challengeDoc = await getDoc(challengeRef);
        
        if (challengeDoc.exists()) {
          const challengeData = challengeDoc.data();
          hasActiveChallenge = !challengeData?.completed && challengeData?.challenge;
          challengeText = challengeData?.challenge?.question || '';
        }
      }

      // Récupérer la distance depuis Firebase si pas fournie
      let distanceToUse = distance;
      
      if (!distanceToUse) {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const partnerRef = doc(db, 'users', partnerId);
        const partnerDoc = await getDoc(partnerRef);

        if (userDoc.exists() && partnerDoc.exists()) {
          const userData = userDoc.data();
          const partnerData = partnerDoc.data();

          if (userData?.locationSharingEnabled && partnerData?.locationSharingEnabled) {
            const userLocation = userData?.location;
            const partnerLocation = partnerData?.location;

            if (userLocation && partnerLocation) {
              // Calculer la distance avec Haversine (formule simplifiée)
              const distanceKm = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                partnerLocation.latitude,
                partnerLocation.longitude
              );

              // Formater la distance
              if (distanceKm < 1) {
                distanceToUse = `${Math.round(distanceKm * 1000)}m`;
              } else if (distanceKm < 10) {
                distanceToUse = `${distanceKm.toFixed(1)}km`;
              } else {
                distanceToUse = `${Math.round(distanceKm)}km`;
              }
            }
          }
        }
      }

      // Mettre à jour le widget avec toutes les données depuis Firebase
      await this.updateWidgetData({
        currentStreak,
        longestStreak,
        distance: distanceToUse || null,
        partnerName: partnerName || null,
        daysTogether: daysTogetherFromCouple,
        hasActiveChallenge,
        challengeText,
      });

      console.log('✅ Widget synchronisé avec Firebase:', {
        currentStreak,
        longestStreak,
        distance: distanceToUse,
        partnerName,
        daysTogether: daysTogetherFromCouple,
        hasActiveChallenge,
      });
    } catch (error) {
      console.error('Erreur lors de la synchronisation des données du couple:', error);
    }
  }

  /**
   * Écouter les changements depuis Firebase et mettre à jour le widget automatiquement
   */
  static setupCoupleDataListener(
    userId: string,
    partnerId: string | null | undefined
  ) {
    if (!partnerId || !userId) {
      // Pas de partenaire, vider les données
      this.syncCoupleData(userId, null, null, null, 0, null);
      return () => {};
    }

    const db = getFirestore();
    const unsubscribes: Array<() => void> = [];
    
    // Écouter les changements du partenaire (nom, localisation)
    const partnerRef = doc(db, 'users', partnerId);
    const unsubscribePartner = onSnapshot(
      partnerRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          // Récupérer daysTogether depuis le document couple avant de synchroniser
          const coupleId = getCoupleId(userId, partnerId);
          const coupleRef = doc(db, 'couples', coupleId);
          const coupleDoc = await getDoc(coupleRef);
          const daysTogether = coupleDoc.exists() ? (coupleDoc.data()?.daysTogether || 0) : 0;
          
          // Re-synchroniser toutes les données quand le partenaire change
          await this.syncCoupleData(userId, partnerId, null, null, daysTogether, null);
        }
      },
      (error) => {
        console.error('Erreur lors de l\'écoute des changements du partenaire:', error);
      }
    );
    unsubscribes.push(unsubscribePartner);

    // Écouter les changements de l'utilisateur (localisation)
    const userRef = doc(db, 'users', userId);
    const unsubscribeUser = onSnapshot(
      userRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          // Récupérer daysTogether depuis le document couple avant de synchroniser
          const coupleId = getCoupleId(userId, partnerId);
          const coupleRef = doc(db, 'couples', coupleId);
          const coupleDoc = await getDoc(coupleRef);
          const daysTogether = coupleDoc.exists() ? (coupleDoc.data()?.daysTogether || 0) : 0;
          
          // Re-synchroniser toutes les données quand l'utilisateur change
          await this.syncCoupleData(userId, partnerId, null, null, daysTogether, null);
        }
      },
      (error) => {
        console.error('Erreur lors de l\'écoute des changements de l\'utilisateur:', error);
      }
    );
    unsubscribes.push(unsubscribeUser);

    // Écouter les changements du couple (streak)
    const coupleId = getCoupleId(userId, partnerId);
    const coupleRef = doc(db, 'couples', coupleId);
    const unsubscribeCouple = onSnapshot(
      coupleRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const coupleData = snapshot.data();
          const currentStreak = coupleData?.currentStreak || 0;
          const longestStreak = coupleData?.longestStreak || 0;
          // IMPORTANT: Utiliser daysTogether depuis le document couple (pas 0)
          const daysTogether = coupleData?.daysTogether || 0;
          
          // Mettre à jour uniquement le streak
          storage.set('currentStreak', currentStreak);
          storage.set('longestStreak', longestStreak);
          ExtensionStorage.reloadWidget();
          
          // Re-synchroniser toutes les données pour s'assurer que tout est à jour
          // Passer daysTogether depuis le document couple pour éviter de récupérer une mauvaise valeur
          await this.syncCoupleData(userId, partnerId, { currentStreak, longestStreak }, null, daysTogether, null);
        }
      },
      (error) => {
        console.error('Erreur lors de l\'écoute des changements du couple:', error);
      }
    );
    unsubscribes.push(unsubscribeCouple);

    // Écouter les changements du défi quotidien
    const today = new Date().toISOString().split('T')[0];
    const challengeRef = doc(db, 'coupleChallenges', `${coupleId}_${today}`);
    const unsubscribeChallenge = onSnapshot(
      challengeRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const challengeData = snapshot.data();
          const hasActiveChallenge = !challengeData?.completed && challengeData?.challenge;
          const challengeText = challengeData?.challenge?.question || '';
          
          storage.set('hasActiveChallenge', hasActiveChallenge);
          storage.set('challengeText', challengeText);
          ExtensionStorage.reloadWidget();
        }
      },
      (error) => {
        console.error('Erreur lors de l\'écoute des changements du défi:', error);
      }
    );
    unsubscribes.push(unsubscribeChallenge);

    // Retourner une fonction pour se désabonner
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }

  /**
   * Récupérer les données actuelles du widget
   */
  static async getWidgetData(): Promise<WidgetData> {
    const currentStreakStr = storage.get('currentStreak');
    const longestStreakStr = storage.get('longestStreak');
    const daysTogetherStr = storage.get('daysTogether');
    const hasActiveChallengeStr = storage.get('hasActiveChallenge');
    
    return {
      currentStreak: currentStreakStr ? parseInt(currentStreakStr) : 0,
      longestStreak: longestStreakStr ? parseInt(longestStreakStr) : 0,
      distance: storage.get('distance'),
      distanceKm: null,
      partnerName: storage.get('partnerName'),
      daysTogether: daysTogetherStr ? parseInt(daysTogetherStr) : 0,
      hasActiveChallenge: hasActiveChallengeStr === 'true',
      challengeText: storage.get('challengeText') || '',
    };
  }
}

/**
 * Helper pour générer l'ID du couple
 */
function getCoupleId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

/**
 * Calculer la distance entre deux coordonnées GPS avec la formule de Haversine
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convertir des degrés en radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

