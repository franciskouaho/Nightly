import { useAuth } from "@/contexts/AuthContext";
import { 
  getFirestore, 
  doc, 
  updateDoc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  limit as firestoreLimit
} from "@react-native-firebase/firestore";

// Types pour la configuration des points
type GameMode = 'genius-or-liar' | 'never-have-i-ever-hot' | 'truth-or-dare' | 'the-hidden-village' | 'trap-answer' | 'listen-but-don-t-judge' | 'word-guessing';

interface PointsConfig {
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
  [key: string]: number;
}

// Configuration des points pour chaque jeu
const GAME_POINTS_CONFIG: Record<GameMode, PointsConfig> = {
  'genius-or-liar': {
    firstPlace: 30,
    secondPlace: 20,
    thirdPlace: 10,
    correctAnswer: 2,
    wrongAnswer: -1,
    correctAccusation: 1,
    wrongAccusation: -1,
    bonusAccusedCorrectly: 1
  },
  'never-have-i-ever-hot': {
    firstPlace: 30,
    secondPlace: 20,
    thirdPlace: 10,
    correctAnswer: 1,
    wrongAnswer: 0
  },
  'truth-or-dare': {
    firstPlace: 20,
    secondPlace: 15,
    thirdPlace: 10,
    completedTask: 1,
    refusedTask: 0
  },
  'the-hidden-village': {
    firstPlace: 40,
    secondPlace: 25,
    thirdPlace: 15,
    traitorWin: 30,
    villagerWin: 20,
    correctVote: 2,
    wrongVote: -1
  },
  'trap-answer': {
    firstPlace: 25,
    secondPlace: 15,
    thirdPlace: 10,
    correctAnswer: 2,
    trapAnswer: -1
  },
  'listen-but-don-t-judge': {
    firstPlace: 25,
    secondPlace: 15,
    thirdPlace: 10,
    winningVote: 2,
    losingVote: 0
  },
  'word-guessing': {
    firstPlace: 30,
    secondPlace: 20,
    thirdPlace: 10,
  }
};

interface Player {
  id: string;
  name: string;
}

export const usePoints = () => {
  const { user } = useAuth();

  const addPointsToUser = async (userId: string, pointsToAdd: number, reason?: string) => {
    if (!userId) {
      console.error("User ID is required to add points.");
      return;
    }

    const db = getFirestore();
    const userRef = doc(db, "users", userId);

    try {
      // Get the current user document
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentPoints = userData?.points || 0;
        const newPoints = currentPoints + pointsToAdd;

        // Update the points field in Firestore
        await updateDoc(userRef, {
          points: newPoints,
        });

        // Log the transaction
        await addDoc(collection(db, "pointTransactions"), {
          userId,
          amount: pointsToAdd,
          previousBalance: currentPoints,
          newBalance: newPoints,
          reason: reason || "Manual adjustment",
          timestamp: serverTimestamp(),
        });

        console.log(`Successfully added ${pointsToAdd} points to user ${userId}. New total: ${newPoints}`);
        return newPoints;
      } else {
        console.error(`User document with ID ${userId} not found.`);
        return null;
      }
    } catch (error) {
      console.error("Error adding points to user:", error);
      return null;
    }
  };

  const getUserPoints = async (userId: string) => {
    if (!userId) {
      console.error("User ID is required to get points.");
      return 0;
    }

    const db = getFirestore();
    const userRef = doc(db, "users", userId);

    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data()?.points || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error getting user points:", error);
      return 0;
    }
  };

  const hasEnoughPoints = async (userId: string, requiredPoints: number) => {
    const currentPoints = await getUserPoints(userId);
    return currentPoints >= requiredPoints;
  };

  const getPointTransactions = async (userId: string, limit = 10) => {
    if (!userId) {
      console.error("User ID is required to get transactions.");
      return [];
    }

    const db = getFirestore();
    try {
      const transactionsRef = collection(db, "pointTransactions");
      const q = query(
        transactionsRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        firestoreLimit(limit)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting point transactions:", error);
      return [];
    }
  };

  // Nouvelle fonction pour attribuer les points de fin de partie
  const awardGamePoints = async (gameId: string, gameMode: GameMode, players: Player[], scores: Record<string, number>) => {
    if (!gameId || !gameMode || !players || !scores) {
      console.error("Missing required parameters for awarding game points");
      return;
    }

    const gameConfig = GAME_POINTS_CONFIG[gameMode];
    if (!gameConfig) {
      console.error(`No point configuration found for game mode: ${gameMode}`);
      return;
    }

    // Trier les joueurs par score
    const sortedPlayers = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

    // Attribuer les points aux 3 premiers
    for (let i = 0; i < Math.min(3, sortedPlayers.length); i++) {
      const player = sortedPlayers[i];
      if (!player) continue;

      const points = i === 0 ? gameConfig.firstPlace : 
                    i === 1 ? gameConfig.secondPlace : 
                    gameConfig.thirdPlace;

      await addPointsToUser(
        player.id,
        points,
        `${gameMode} - ${i + 1}${i === 0 ? 'er' : 'ème'} place`
      );
    }
  };

  return {
    addPointsToUser,
    getUserPoints,
    hasEnoughPoints,
    getPointTransactions,
    awardGamePoints,
    GAME_POINTS_CONFIG
  };
}; 