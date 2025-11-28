import { useState, useEffect, useCallback } from 'react';
import { getFirestore, doc, updateDoc, getDoc, setDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { trackStreakIncreased, trackStreakLost } from '@/services/couplesAnalytics';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  lastActivityTimestamp: number | null;
  weekActivity: WeekActivity[];
}

interface WeekActivity {
  day: string; // 'Su', 'Mo', 'Tu', etc.
  active: boolean;
  date: string; // ISO date string
  streakNumber: number; // The streak count on that day
}

interface UseCoupleStreakReturn {
  currentStreak: number;
  longestStreak: number;
  weekActivity: WeekActivity[];
  loading: boolean;
  error: string | null;
  recordActivity: () => Promise<void>;
  checkAndUpdateStreak: () => Promise<void>;
}

/**
 * Hook pour gérer le streak du couple
 * Le streak augmente quand les deux partenaires font une activité ensemble chaque jour
 */
export function useCoupleStreak(partnerId?: string): UseCoupleStreakReturn {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weekActivity, setWeekActivity] = useState<WeekActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le streak au montage
  useEffect(() => {
    if (user?.uid && partnerId) {
      loadStreak();
    }
  }, [user?.uid, partnerId]);

  /**
   * Charger les données de streak depuis Firestore
   */
  const loadStreak = async () => {
    if (!user?.uid || !partnerId) return;

    try {
      setLoading(true);
      const db = getFirestore();

      // Le streak est stocké dans un document couple séparé
      const coupleId = getCoupleId(user.uid, partnerId);
      const coupleRef = doc(db, 'couples', coupleId);
      const coupleDoc = await getDoc(coupleRef);

      if (coupleDoc.exists()) {
        const data = coupleDoc.data() as StreakData;
        setCurrentStreak(data.currentStreak || 0);
        setLongestStreak(data.longestStreak || 0);

        // Générer l'activité de la semaine
        const week = generateWeekActivity(data);
        setWeekActivity(week);
      } else {
        // Initialiser le streak pour ce couple
        await initializeStreak(coupleId);
      }
    } catch (err: any) {
      console.error('Error loading streak:', err);
      setError(err.message || 'Erreur lors du chargement du streak');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialiser le streak pour un nouveau couple
   */
  const initializeStreak = async (coupleId: string) => {
    const db = getFirestore();
    const coupleRef = doc(db, 'couples', coupleId);

    const initialData: StreakData & { userIds: string[] } = {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      lastActivityTimestamp: null,
      weekActivity: [],
      userIds: user?.uid && partnerId ? [user.uid, partnerId].sort() : [],
    };

    await setDoc(coupleRef, initialData);
    setCurrentStreak(0);
    setLongestStreak(0);
    setWeekActivity(generateWeekActivity(initialData));
  };

  /**
   * Enregistrer une activité (utilisé quand le couple fait le défi quotidien)
   */
  const recordActivity = async () => {
    if (!user?.uid || !partnerId) return;

    try {
      setLoading(true);
      const db = getFirestore();
      const coupleId = getCoupleId(user.uid, partnerId);
      const coupleRef = doc(db, 'couples', coupleId);
      const coupleDoc = await getDoc(coupleRef);

      if (!coupleDoc.exists()) {
        await initializeStreak(coupleId);
        return;
      }

      const data = coupleDoc.data() as StreakData;
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const lastActivityDate = data.lastActivityDate;

      // Vérifier si une activité a déjà été enregistrée aujourd'hui
      if (lastActivityDate === today) {
        console.log('Activity already recorded today');
        return;
      }

      let newStreak = data.currentStreak;
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Vérifier si le streak doit continuer ou être réinitialisé
      if (lastActivityDate === yesterdayStr) {
        // Activité hier, le streak continue
        newStreak += 1;
        await trackStreakIncreased(newStreak);
      } else if (lastActivityDate === null) {
        // Première activité
        newStreak = 1;
        await trackStreakIncreased(newStreak);
      } else {
        // Pas d'activité hier, le streak est perdu
        if (data.currentStreak > 0) {
          await trackStreakLost(data.currentStreak);
        }
        newStreak = 1;
      }

      const newLongestStreak = Math.max(newStreak, data.longestStreak || 0);

      // Mettre à jour Firestore
      await updateDoc(coupleRef, {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: today,
        lastActivityTimestamp: now.getTime(),
      });

      setCurrentStreak(newStreak);
      setLongestStreak(newLongestStreak);

      // Recharger pour mettre à jour l'activité de la semaine
      await loadStreak();
    } catch (err: any) {
      console.error('Error recording activity:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement de l\'activité');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vérifier et mettre à jour le streak (appelé au lancement de l'app)
   */
  const checkAndUpdateStreak = async () => {
    if (!user?.uid || !partnerId) return;

    try {
      const db = getFirestore();
      const coupleId = getCoupleId(user.uid, partnerId);
      const coupleRef = doc(db, 'couples', coupleId);
      const coupleDoc = await getDoc(coupleRef);

      if (!coupleDoc.exists()) {
        return;
      }

      const data = coupleDoc.data() as StreakData;
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const lastActivityDate = data.lastActivityDate;

      if (!lastActivityDate) {
        return;
      }

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Si la dernière activité n'était pas hier ou aujourd'hui, le streak est perdu
      if (lastActivityDate !== today && lastActivityDate !== yesterdayStr) {
        if (data.currentStreak > 0) {
          await trackStreakLost(data.currentStreak);
          await updateDoc(coupleRef, {
            currentStreak: 0,
          });
          setCurrentStreak(0);
        }
      }
    } catch (err: any) {
      console.error('Error checking streak:', err);
    }
  };

  return {
    currentStreak,
    longestStreak,
    weekActivity,
    loading,
    error,
    recordActivity,
    checkAndUpdateStreak,
  };
}

/**
 * Générer un ID unique pour le couple (toujours dans le même ordre)
 */
function getCoupleId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

/**
 * Générer l'activité de la semaine pour l'affichage
 */
function generateWeekActivity(data: StreakData): WeekActivity[] {
  const today = new Date();
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const weekActivity: WeekActivity[] = [];

  // Générer les 7 derniers jours
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = dayNames[date.getDay()];

    // Vérifier si ce jour a une activité
    let active = false;
    let streakNumber = 0;

    if (data.lastActivityDate) {
      const lastActivityDate = new Date(data.lastActivityDate);
      const daysDiff = Math.floor(
        (lastActivityDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Si ce jour est dans le streak actuel
      if (daysDiff >= 0 && daysDiff < data.currentStreak) {
        active = true;
        streakNumber = data.currentStreak - daysDiff;
      }
    }

    weekActivity.push({
      day: dayName,
      active,
      date: dateStr,
      streakNumber: active ? streakNumber : 0,
    });
  }

  return weekActivity;
}
