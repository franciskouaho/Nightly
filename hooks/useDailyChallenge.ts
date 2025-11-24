import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { trackDailyChallenge } from '@/services/couplesAnalytics';

export interface DailyChallenge {
  id: string;
  type: 'question' | 'dare' | 'activity';
  question: string;
  category: 'intimacy' | 'fun' | 'deep' | 'romantic';
  date: string; // YYYY-MM-DD
}

interface ChallengeResponse {
  userId: string;
  response: string;
  timestamp: string;
}

interface DailyChallengeData {
  challenge: DailyChallenge;
  date: string;
  completed: boolean;
  userResponses: ChallengeResponse[];
  completedAt?: string;
}

interface UseDailyChallengeReturn {
  todayChallenge: DailyChallenge | null;
  loading: boolean;
  error: string | null;
  hasCompletedToday: boolean;
  partnerResponse: string | null;
  userResponse: string | null;
  submitResponse: (response: string) => Promise<void>;
  skipChallenge: () => Promise<void>;
}

/**
 * Hook pour gérer les défis quotidiens du couple
 */
export function useDailyChallenge(partnerId?: string): UseDailyChallengeReturn {
  const { user } = useAuth();
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [partnerResponse, setPartnerResponse] = useState<string | null>(null);
  const [userResponse, setUserResponse] = useState<string | null>(null);

  // Charger le défi du jour au montage
  useEffect(() => {
    if (user?.uid && partnerId) {
      loadTodayChallenge();
    }
  }, [user?.uid, partnerId]);

  /**
   * Charger le défi du jour
   */
  const loadTodayChallenge = async () => {
    if (!user?.uid || !partnerId) return;

    try {
      setLoading(true);
      const db = getFirestore();
      const today = new Date().toISOString().split('T')[0];
      const coupleId = getCoupleId(user.uid, partnerId);

      // Récupérer le défi du jour pour ce couple
      const challengeRef = doc(db, 'coupleChallenges', `${coupleId}_${today}`);
      const challengeDoc = await getDoc(challengeRef);

      let challengeData: DailyChallengeData;

      if (challengeDoc.exists()) {
        // Le défi existe déjà
        challengeData = challengeDoc.data() as DailyChallengeData;
      } else {
        // Générer un nouveau défi pour aujourd'hui
        const newChallenge = generateDailyChallenge(today);
        challengeData = {
          challenge: newChallenge,
          date: today,
          completed: false,
          userResponses: [],
        };

        // Sauvegarder dans Firestore
        await setDoc(challengeRef, challengeData);
      }

      setTodayChallenge(challengeData.challenge);
      setHasCompletedToday(challengeData.completed);

      // Récupérer les réponses
      const userResp = challengeData.userResponses.find(r => r.userId === user.uid);
      const partnerResp = challengeData.userResponses.find(r => r.userId === partnerId);

      setUserResponse(userResp?.response || null);
      setPartnerResponse(partnerResp?.response || null);
    } catch (err: any) {
      console.error('Error loading daily challenge:', err);
      setError(err.message || 'Erreur lors du chargement du défi');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Soumettre une réponse au défi
   */
  const submitResponse = async (response: string) => {
    if (!user?.uid || !partnerId || !todayChallenge) return;

    try {
      setLoading(true);
      const db = getFirestore();
      const today = new Date().toISOString().split('T')[0];
      const coupleId = getCoupleId(user.uid, partnerId);
      const challengeRef = doc(db, 'coupleChallenges', `${coupleId}_${today}`);
      const challengeDoc = await getDoc(challengeRef);

      if (!challengeDoc.exists()) {
        throw new Error('Challenge not found');
      }

      const challengeData = challengeDoc.data() as DailyChallengeData;

      // Ajouter ou mettre à jour la réponse de l'utilisateur
      const newResponses = challengeData.userResponses.filter(r => r.userId !== user.uid);
      newResponses.push({
        userId: user.uid,
        response: response,
        timestamp: new Date().toISOString(),
      });

      // Vérifier si les deux partenaires ont répondu
      const partnerHasResponded = newResponses.some(r => r.userId === partnerId);
      const completed = newResponses.length === 2 && partnerHasResponded;

      // Mettre à jour Firestore
      await updateDoc(challengeRef, {
        userResponses: newResponses,
        completed: completed,
        completedAt: completed ? new Date().toISOString() : null,
      });

      setUserResponse(response);
      setHasCompletedToday(completed);

      // Track analytics
      await trackDailyChallenge(
        completed ? 'completed' : 'started',
        todayChallenge.type
      );

      // Si le défi est complété, on peut déclencher le streak
      // (cette logique devra être appelée depuis le composant)
    } catch (err: any) {
      console.error('Error submitting response:', err);
      setError(err.message || 'Erreur lors de l\'envoi de la réponse');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Passer le défi du jour
   */
  const skipChallenge = async () => {
    if (!user?.uid || !partnerId || !todayChallenge) return;

    try {
      await trackDailyChallenge('skipped', todayChallenge.type);
    } catch (err: any) {
      console.error('Error skipping challenge:', err);
    }
  };

  return {
    todayChallenge,
    loading,
    error,
    hasCompletedToday,
    partnerResponse,
    userResponse,
    submitResponse,
    skipChallenge,
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
 * Générer un défi quotidien basé sur la date
 * Utilise la date comme seed pour que le même défi soit généré pour un même jour
 */
function generateDailyChallenge(dateStr: string): DailyChallenge {
  // Liste de défis
  const challenges: Omit<DailyChallenge, 'id' | 'date'>[] = [
    // Questions d'intimité
    {
      type: 'question',
      question: "Qu'est-ce qui vous a fait tomber amoureux de moi ?",
      category: 'intimacy',
    },
    {
      type: 'question',
      question: "Quel est ton souvenir préféré avec moi ?",
      category: 'romantic',
    },
    {
      type: 'question',
      question: "Quelle est la chose la plus folle que tu ferais pour moi ?",
      category: 'intimacy',
    },
    // Questions profondes
    {
      type: 'question',
      question: "Qu'est-ce qui te rend le plus heureux dans notre relation ?",
      category: 'deep',
    },
    {
      type: 'question',
      question: "Si tu pouvais changer une chose dans notre relation, ce serait quoi ?",
      category: 'deep',
    },
    {
      type: 'question',
      question: "Comment imagines-tu notre avenir ensemble ?",
      category: 'deep',
    },
    // Questions fun
    {
      type: 'question',
      question: "Si on partait en voyage demain, où irions-nous ?",
      category: 'fun',
    },
    {
      type: 'question',
      question: "Quel surnom secret tu aimerais me donner ?",
      category: 'fun',
    },
    {
      type: 'question',
      question: "Quelle est la chose la plus drôle que j'ai faite ?",
      category: 'fun',
    },
    // Dares et activités
    {
      type: 'dare',
      question: "Envoyez-vous une photo de votre plus beau sourire",
      category: 'fun',
    },
    {
      type: 'dare',
      question: "Écrivez un message d'amour de 3 mots chacun",
      category: 'romantic',
    },
    {
      type: 'activity',
      question: "Partagez une chanson qui vous rappelle votre partenaire",
      category: 'romantic',
    },
    {
      type: 'dare',
      question: "Racontez votre meilleur souvenir ensemble en une phrase",
      category: 'intimacy',
    },
    {
      type: 'activity',
      question: "Planifiez votre prochain rendez-vous ensemble",
      category: 'romantic',
    },
    // Plus de questions d'intimité
    {
      type: 'question',
      question: "Quelle partie de mon corps préfères-tu ?",
      category: 'intimacy',
    },
    {
      type: 'question',
      question: "Quel est ton fantasme secret avec moi ?",
      category: 'intimacy',
    },
    {
      type: 'question',
      question: "Qu'est-ce qui te fait te sentir aimé(e) dans notre relation ?",
      category: 'romantic',
    },
    // Plus de questions fun
    {
      type: 'question',
      question: "Si tu devais me décrire en 3 emojis, lesquels choisirais-tu ?",
      category: 'fun',
    },
    {
      type: 'question',
      question: "Quel super-pouvoir voudrais-tu que j'aie ?",
      category: 'fun',
    },
    {
      type: 'question',
      question: "Quelle est la chose la plus embarrassante que je t'ai vu faire ?",
      category: 'fun',
    },
    // Questions romantiques
    {
      type: 'question',
      question: "À quel moment as-tu su que tu m'aimais ?",
      category: 'romantic',
    },
    {
      type: 'question',
      question: "Qu'est-ce que tu admires le plus chez moi ?",
      category: 'romantic',
    },
    {
      type: 'question',
      question: "Comment te sens-tu quand on est ensemble ?",
      category: 'romantic',
    },
    // Plus de dares
    {
      type: 'dare',
      question: "Envoyez-vous chacun un compliment surprise",
      category: 'romantic',
    },
    {
      type: 'dare',
      question: "Partagez un secret que personne d'autre ne connaît",
      category: 'deep',
    },
    {
      type: 'activity',
      question: "Choisissez ensemble un film ou une série à regarder ce soir",
      category: 'fun',
    },
    {
      type: 'activity',
      question: "Créez une playlist de 5 chansons qui représentent votre amour",
      category: 'romantic',
    },
    // Questions profondes supplémentaires
    {
      type: 'question',
      question: "Quelle est ta plus grande peur dans notre relation ?",
      category: 'deep',
    },
    {
      type: 'question',
      question: "Comment puis-je te soutenir mieux au quotidien ?",
      category: 'deep',
    },
    {
      type: 'question',
      question: "Qu'est-ce qui te fait te sentir le plus proche de moi ?",
      category: 'deep',
    },
  ];

  // Utiliser la date comme seed pour un "random" déterministe
  const seed = dateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const index = seed % challenges.length;
  const selectedChallenge = challenges[index];

  return {
    id: `challenge_${dateStr}_${index}`,
    date: dateStr,
    ...selectedChallenge,
  };
}
