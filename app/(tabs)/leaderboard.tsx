import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, updateDoc, increment, onSnapshot } from '@react-native-firebase/firestore';
import HalloweenDecorations from '@/components/HalloweenDecorations';
import { useRouter } from 'expo-router';

interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  totalPoints: number;
  gamesPlayed: number;
  winRate: number;
  rank: number;
}

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);



  // Fonction pour mettre à jour les statistiques d'un utilisateur
  const updateUserStats = async (userId: string, points: number, won: boolean = false) => {
    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', userId);
      
      const updateData: any = {
        totalPoints: increment(points),
        gamesPlayed: increment(1),
        lastGamePlayed: new Date(),
      };

      if (won) {
        updateData.gamesWon = increment(1);
      }

      await updateDoc(userRef, updateData);
      console.log('📊 Stats mises à jour pour l\'utilisateur:', userId, 'Points:', points, 'Victoire:', won);
      
      // Le listener temps réel se chargera automatiquement de la mise à jour
    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats:', error);
    }
  };

  // Listener en temps réel pour le leaderboard
  useEffect(() => {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      orderBy('totalPoints', 'desc'),
      limit(50)
    );

    console.log('🔄 Démarrage du listener temps réel pour le leaderboard');

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const leaderboardData: LeaderboardEntry[] = [];
      
      querySnapshot.forEach((doc, index) => {
        const userData = doc.data();
        console.log(`👤 Utilisateur ${index + 1}:`, {
          id: doc.id,
          pseudo: userData.pseudo,
          username: userData.username,
          displayName: userData.displayName,
          totalPoints: userData.totalPoints,
          gamesPlayed: userData.gamesPlayed,
          gamesWon: userData.gamesWon
        });
        
        if (userData.totalPoints && userData.totalPoints > 0) {
          const gamesPlayed = userData.gamesPlayed || 0;
          const gamesWon = userData.gamesWon || 0;
          
          leaderboardData.push({
            id: doc.id,
            username: userData.pseudo || userData.username || 'Joueur',
            displayName: userData.displayName || userData.pseudo || userData.username || 'Joueur',
            avatar: userData.avatar || 'https://via.placeholder.com/40',
            totalPoints: userData.totalPoints || 0,
            gamesPlayed,
            gamesWon,
            winRate: gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0,
            rank: index + 1,
          });
        } else {
          console.log(`❌ Utilisateur ${doc.id} exclu: totalPoints = ${userData.totalPoints}`);
        }
      });
      
      console.log('📊 Leaderboard temps réel - Mise à jour:', leaderboardData.length, 'joueurs');
      setLeaderboard(leaderboardData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Erreur listener temps réel:', error);
      // En cas d'erreur, afficher un leaderboard vide
      setLeaderboard([]);
      setLoading(false);
      setRefreshing(false);
    });

    // Nettoyer le listener quand le composant se démonte
    return () => {
      console.log('🔄 Arrêt du listener temps réel');
      unsubscribe();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Le listener temps réel se chargera automatiquement de la mise à jour
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return '#FFFFFF';
    }
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = user?.uid === entry.id;
    
    return (
      <View
        key={entry.id}
        style={[
          styles.leaderboardEntry,
          isCurrentUser && styles.currentUserEntry,
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: getRankColor(entry.rank) }]}>
            {getRankIcon(entry.rank)}
          </Text>
        </View>
        
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#FFFFFF" />
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.username, isCurrentUser && styles.currentUserText]}>
            {entry.displayName}
          </Text>
          <Text style={styles.stats}>
            {entry.gamesPlayed} parties • {entry.winRate.toFixed(1)}% victoires
          </Text>
        </View>
        
        <View style={styles.pointsContainer}>
          <Text style={[styles.points, isCurrentUser && styles.currentUserText]}>
            {entry.totalPoints.toLocaleString()}
          </Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#120F1C', '#4B1E00', '#FF6F00', '#4B1E00', '#120F1C']}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={styles.background}
        >
          <View style={styles.content}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6F00" />
              <Text style={styles.loadingText}>Chargement du classement...</Text>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#120F1C', '#4B1E00', '#FF6F00', '#4B1E00', '#120F1C']}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      >
        <View style={styles.halloweenDecorations}>
          <HalloweenDecorations />
        </View>
        
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>🏆 Classement Général</Text>
            <Text style={styles.subtitle}>Les meilleurs joueurs de Nightly</Text>
            
            {/* Bouton de test pour ajouter des points */}
            {__DEV__ && user && (
              <TouchableOpacity
                style={styles.testButton}
                onPress={async () => {
                  console.log('🧪 Test - Ajout de points pour l\'utilisateur:', user.uid);
                  await updateUserStats({
                    userId: user.uid,
                    points: 1000,
                    won: true,
                    timestamp: new Date()
                  });
                }}
              >
                <Text style={styles.testButtonText}>🧪 +1000 pts (Test)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Top 3 Players */}
          {leaderboard.length >= 3 && (
            <View style={styles.topThreeContainer}>
              <Text style={styles.topThreeTitle}>🏆 Podium</Text>
              <View style={styles.podium}>
                {/* 2ème place */}
                {leaderboard[1] && (
                  <View style={styles.podiumPlayer}>
                    <View style={[styles.podiumAvatar, styles.secondPlace]}>
                      <Ionicons name="person" size={32} color="#C0C0C0" />
                      <View style={styles.podiumRankBadge}>
                        <Text style={styles.podiumRankText}>2</Text>
                      </View>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {leaderboard[1].displayName}
                    </Text>
                    <Text style={styles.podiumScore}>{leaderboard[1].totalPoints.toLocaleString()} pts</Text>
                  </View>
                )}

                {/* 1ère place */}
                {leaderboard[0] && (
                  <View style={styles.podiumPlayer}>
                    <View style={[styles.podiumAvatar, styles.firstPlace]}>
                      <Ionicons name="person" size={40} color="#FFD700" />
                      <Text style={styles.crown}>👑</Text>
                      <View style={styles.podiumRankBadge}>
                        <Text style={styles.podiumRankText}>1</Text>
                      </View>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {leaderboard[0].displayName}
                    </Text>
                    <Text style={styles.podiumScore}>{leaderboard[0].totalPoints.toLocaleString()} pts</Text>
                  </View>
                )}

                {/* 3ème place */}
                {leaderboard[2] && (
                  <View style={styles.podiumPlayer}>
                    <View style={[styles.podiumAvatar, styles.thirdPlace]}>
                      <Ionicons name="person" size={32} color="#CD7F32" />
                      <View style={styles.podiumRankBadge}>
                        <Text style={styles.podiumRankText}>3</Text>
                      </View>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {leaderboard[2].displayName}
                    </Text>
                    <Text style={styles.podiumScore}>{leaderboard[2].totalPoints.toLocaleString()} pts</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Votre position si vous n'êtes pas dans le top 3 */}
          {user && leaderboard.length > 0 && (
            (() => {
              const userIndex = leaderboard.findIndex(entry => entry.id === user.uid);
              if (userIndex > 2) {
                const userEntry = leaderboard[userIndex];
                return (
                  <View style={styles.yourPositionContainer}>
                    <Text style={styles.yourPositionTitle}>Votre position</Text>
                    <View style={styles.yourPositionCard}>
                      <View style={styles.yourPositionRank}>
                        <Text style={styles.yourPositionRankText}>#{userIndex + 1}</Text>
                      </View>
                      <View style={styles.yourPositionAvatar}>
                        <Ionicons name="person" size={24} color="#FFD700" />
                      </View>
                      <View style={styles.yourPositionInfo}>
                        <Text style={styles.yourPositionName}>{userEntry.displayName}</Text>
                        <Text style={styles.yourPositionStats}>
                          {userEntry.gamesPlayed} parties • {userEntry.winRate.toFixed(1)}% victoires
                        </Text>
                      </View>
                      <View style={styles.yourPositionPoints}>
                        <Text style={styles.yourPositionPointsText}>{userEntry.totalPoints.toLocaleString()}</Text>
                        <Text style={styles.yourPositionPointsLabel}>pts</Text>
                      </View>
                    </View>
                  </View>
                );
              }
              return null;
            })()
          )}

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FF6F00"
              />
            }
          >
            <View style={styles.contentContainer}>
              {leaderboard.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={64} color="#FFD700" />
                <Text style={styles.emptyText}>Aucun joueur dans le classement</Text>
                <Text style={styles.emptySubtext}>Jouez pour apparaître ici !</Text>
              </View>
              ) : (
                <View style={styles.leaderboardContainer}>
                  {leaderboard.map((entry, index) => renderLeaderboardEntry(entry, index))}
                </View>
              )}
            </View>
          </ScrollView>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#120F1C', // Couleur de fallback
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  halloweenDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#FF6F00',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 15,
    alignSelf: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    color: '#FFD700',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#FFB347',
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  leaderboardContainer: {
    // gap supprimé pour éviter l'espace en bas
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 111, 0, 0.6)',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 8,
  },
  currentUserEntry: {
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    borderColor: '#FFD700',
    borderWidth: 2,
    shadowColor: 'rgba(255, 215, 0, 0.5)',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarContainer: {
    marginLeft: 12,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 111, 0, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 179, 71, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(255, 111, 0, 0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFAF0',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  currentUserText: {
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
  },
  stats: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointsContainer: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 111, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 111, 0, 0.7)',
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointsLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Styles pour le podium
  topThreeContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  topThreeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 200,
  },
  podiumPlayer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  podiumAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  firstPlace: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderColor: '#FFD700',
    zIndex: 3,
    transform: [{ translateY: -20 }],
  },
  secondPlace: {
    backgroundColor: 'rgba(192, 192, 192, 0.3)',
    borderColor: '#C0C0C0',
    zIndex: 2,
    transform: [{ translateY: -10 }],
  },
  thirdPlace: {
    backgroundColor: 'rgba(205, 127, 50, 0.3)',
    borderColor: '#CD7F32',
    zIndex: 1,
  },
  crown: {
    position: 'absolute',
    top: -15,
    fontSize: 20,
    zIndex: 4,
  },
  podiumRankBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF6F00',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFAF0',
  },
  podiumRankText: {
    color: '#FFFAF0',
    fontWeight: 'bold',
    fontSize: 14,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFAF0',
    textAlign: 'center',
    marginBottom: 4,
    maxWidth: 80,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  podiumScore: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Styles pour votre position
  yourPositionContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  yourPositionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  yourPositionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: 'rgba(255, 215, 0, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  yourPositionRank: {
    backgroundColor: '#FF6F00',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  yourPositionRankText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  yourPositionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  yourPositionInfo: {
    flex: 1,
  },
  yourPositionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFAF0',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  yourPositionStats: {
    fontSize: 13,
    color: '#FFB347',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  yourPositionPoints: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 111, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 111, 0, 0.7)',
  },
  yourPositionPointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  yourPositionPointsLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
