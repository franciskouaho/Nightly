import { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, updateDoc, increment } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
  id: string;
  pseudo: string;
  displayName: string;
  avatar: string;
  totalPoints: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  rank: number;
}

interface GameResult {
  userId: string; // ID de l'utilisateur pour lequel mettre à jour les stats
  gameId?: string;
  points: number;
  won: boolean;
  timestamp: Date;
}

export default function useLeaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  const fetchLeaderboard = async (limitCount: number = 50) => {
    try {
      setLoading(true);
      const db = getFirestore();
      const usersRef = collection(db, 'users');
      // Utiliser gamePoints au lieu de points pour le leaderboard (séparé de l'argent)
      const q = query(
        usersRef,
        orderBy('gamePoints', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const leaderboardData: LeaderboardEntry[] = [];
      
      querySnapshot.forEach((doc, index) => {
        const userData = doc.data();
        // Utiliser gamePoints (points de jeu) au lieu de points (argent)
        const gamePoints = userData.gamePoints || 0;
        if (gamePoints > 0 || (userData.gamesPlayed || 0) > 0) {
          const gamesPlayed = userData.gamesPlayed || 0;
          const gamesWon = userData.gamesWon || 0;
          
          leaderboardData.push({
            id: doc.id,
            pseudo: userData.pseudo || 'Joueur',
            displayName: userData.pseudo || userData.displayName || 'Joueur',
            avatar: userData.avatar || 'default',
            totalPoints: gamePoints, // Utiliser gamePoints au lieu de points
            gamesPlayed,
            gamesWon,
            winRate: gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0,
            rank: index + 1,
          });
        }
      });
      
      setLeaderboard(leaderboardData);
      
      // Trouver le rang de l'utilisateur actuel
      if (user?.uid) {
        const currentUserIndex = leaderboardData.findIndex(entry => entry.id === user.uid);
        setUserRank(currentUserIndex >= 0 ? currentUserIndex + 1 : null);
      }
      
      return leaderboardData;
    } catch (error) {
      console.error('Erreur lors du chargement du leaderboard:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateUserStats = async (gameResult: GameResult) => {
    if (!gameResult.userId) {
      console.error('updateUserStats: userId is required');
      return;
    }

    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', gameResult.userId);
      
      const updateData: any = {
        gamePoints: increment(gameResult.points), // Utiliser gamePoints au lieu de points (séparé de l'argent)
        gamesPlayed: increment(1),
        lastGamePlayed: gameResult.timestamp,
      };

      if (gameResult.won) {
        updateData.gamesWon = increment(1);
      }

      await updateDoc(userRef, updateData);
      
      console.log(`✅ Stats mises à jour pour l'utilisateur ${gameResult.userId}: +${gameResult.points} gamePoints, partie jouée: +1`);
      
      // Recharger le leaderboard après mise à jour
      await fetchLeaderboard();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats:', error);
    }
  };

  const getUserStats = async (userId: string) => {
    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDocs(collection(db, 'users'));
      
      const userData = userDoc.docs.find(doc => doc.id === userId)?.data();
      if (userData) {
        const gamesPlayed = userData.gamesPlayed || 0;
        const gamesWon = userData.gamesWon || 0;
        
        return {
          totalPoints: userData.gamePoints || 0, // Utiliser gamePoints au lieu de points
          gamesPlayed,
          gamesWon,
          winRate: gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0,
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      return null;
    }
  };

  const getTopPlayers = (count: number = 10) => {
    return leaderboard.slice(0, count);
  };

  const getPlayersAroundUser = (range: number = 5) => {
    if (!userRank) return [];
    
    const startIndex = Math.max(0, userRank - range - 1);
    const endIndex = Math.min(leaderboard.length, userRank + range);
    
    return leaderboard.slice(startIndex, endIndex);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return {
    leaderboard,
    loading,
    userRank,
    fetchLeaderboard,
    updateUserStats,
    getUserStats,
    getTopPlayers,
    getPlayersAroundUser,
  };
}
