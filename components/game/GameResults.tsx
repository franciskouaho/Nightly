import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import RoundedButton from '@/components/RoundedButton';
import { usePoints } from '@/hooks/usePoints';
import { Player } from '@/types/gameTypes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GameResultsProps {
  players: Player[];
  scores: Record<string, number>;
  userId: string;
  pointsConfig?: {
    firstPlace?: number;
    secondPlace?: number;
    thirdPlace?: number;
  };
}

export default function GameResults({ 
  players, 
  scores, 
  userId,
  pointsConfig = {
    firstPlace: 30,
    secondPlace: 20,
    thirdPlace: 10
  }
}: GameResultsProps) {
  const router = useRouter();
  const { addPointsToUser, getUserPoints } = usePoints();
  const insets = useSafeAreaInsets();
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [pointsGained, setPointsGained] = useState<number | null>(null);

  // Trie les joueurs par score décroissant
  const sortedPlayers = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  
  const topPlayers = sortedPlayers.slice(0, 3);
  const otherPlayers = sortedPlayers.slice(3);
  const userRank = sortedPlayers.findIndex(p => p.id === userId);
  const currentUser = sortedPlayers[userRank];

  // Attribuer les points aux 3 premiers joueurs lorsque les résultats sont affichés
  useEffect(() => {
    const awardPoints = async () => {
      // Vérifier si les points ont déjà été attribués
      const currentPoints = await getUserPoints(userId);

      // Si les points ont déjà été attribués ou si pointsGained est déjà défini, ne rien faire.
      // On utilise pointsGained comme flag pour s'assurer que l'attribution ne se fait qu'une fois.
      if (pointsGained !== null) {
        return;
      }

      let awarded = 0;

      // Attribuer les points aux 3 premiers joueurs
      if (sortedPlayers.length > 0 && sortedPlayers[0]?.id === userId) {
        awarded = pointsConfig.firstPlace || 30;
        await addPointsToUser(sortedPlayers[0].id, awarded, "Première place");
      }
      if (sortedPlayers.length > 1 && sortedPlayers[1]?.id === userId) {
         awarded = pointsConfig.secondPlace || 20;
        await addPointsToUser(sortedPlayers[1].id, awarded, "Deuxième place");
      }
      if (sortedPlayers.length > 2 && sortedPlayers[2]?.id === userId) {
         awarded = pointsConfig.thirdPlace || 10;
        await addPointsToUser(sortedPlayers[2].id, awarded, "Troisième place");
      }

      // Mettre à jour les points de l'utilisateur et les points gagnés
      const newPoints = await getUserPoints(userId);
      setUserPoints(newPoints);
      setPointsGained(awarded); // Stocke les points gagnés par l'utilisateur actuel
    };
    awardPoints();
  }, [sortedPlayers, addPointsToUser, pointsConfig, userId, getUserPoints, pointsGained]); // Ajout de pointsGained aux dépendances

  // Trouver les 3 meilleurs joueurs (ou moins s'il n'y en a pas assez)
  const player1 = topPlayers[0];
  const player2 = topPlayers[1];
  const player3 = topPlayers[2];

  return (
    <LinearGradient colors={['#1A0A33', '#3A1A59']} style={styles.resultsBg}>
      {/* Rétablissement du contentContainer */}
      <View style={[styles.contentContainer, { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }]}>

        {/* Section Top 3 */}
        <View style={styles.topPlayersContainer}>
          {/* Joueur 2 */}
          {player2 && (
            <View style={styles.playerRankContainer}>
               <View style={[styles.avatarWrapperResults, styles.avatarWrapperRank2]}>
                  <Image source={{ uri: player2.avatar || 'https://via.placeholder.com/80' }} style={styles.avatarImgResults} />
                  <View style={styles.rankBadge}><Text style={styles.rankBadgeText}>2</Text></View>
               </View>
              <Text style={styles.playerNameResults} numberOfLines={1}>{player2.name}</Text>
            </View>
          )}

          {/* Joueur 1 */}
          {player1 && (
            <View style={styles.playerRankContainerCenter}>
              <View style={[styles.avatarWrapperResults, styles.avatarWrapperRank1]}>
                 <Image source={{ uri: player1.avatar || 'https://via.placeholder.com/120' }} style={styles.avatarImgResults} />
                 <View style={styles.rankBadge}><Text style={styles.rankBadgeText}>1</Text></View>
                 <View style={styles.crownTop}><Text style={styles.crownText}>👑</Text></View>
              </View>
              <Text style={[styles.playerNameResults, styles.playerNameWinner]} numberOfLines={1}>{player1.name}</Text>
            </View>
          )}

          {/* Joueur 3 */}
           {player3 && (
            <View style={styles.playerRankContainer}>
               <View style={[styles.avatarWrapperResults, styles.avatarWrapperRank3]}>
                  <Image source={{ uri: player3.avatar || 'https://via.placeholder.com/80' }} style={styles.avatarImgResults} />
                  <View style={styles.rankBadge}><Text style={styles.rankBadgeText}>3</Text></View>
               </View>
              <Text style={styles.playerNameResults} numberOfLines={1}>{player3.name}</Text>
            </View>
          )}
        </View>

        {/* Section Points de l'utilisateur */}
        {pointsGained !== null && pointsGained > 0 && (
          <View style={styles.pointsGainedContainer}>
             <MaterialCommunityIcons
               name="currency-btc"
               size={20}
               color="#FFD700"
             />
            <Text style={styles.pointsGainedText}>+{pointsGained} Lumicoins</Text>
          </View>
        )}

        {/* Section Rang Actuel Utilisateur */}
        {currentUser && (
           <View style={styles.currentUserRankContainer}>
              <Text style={styles.currentUserRankText}>Votre rang actuel</Text>
              <Text style={styles.currentUserRankNumber}>{userRank + 1}</Text>
           </View>
        )}

        {/* Section Autres Joueurs */}
        {otherPlayers.length > 0 && (
          <View style={styles.otherPlayersList}>
             {otherPlayers.map((player) => (
               <View key={player.id} style={styles.otherPlayerRow}>
                  <Image source={{ uri: player.avatar || 'https://via.placeholder.com/40' }} style={styles.otherPlayerAvatar} />
                  <Text style={styles.otherPlayerName}>{player.name}</Text>
                  <Text style={styles.otherPlayerRank}>{sortedPlayers.findIndex(p => p.id === player.id) + 1}</Text>
               </View>
             ))}
          </View>
        )}

        {/* Bouton Accueil */}
        <View style={styles.homeButtonContainer}>
          <RoundedButton
            title="Accueil"
            onPress={() => router.replace("/(tabs)")}
            icon={<Ionicons name="home" size={22} color="#fff" />}
            gradientColors={["#7B2CBF", "#661A59"]}
            style={{ width: '90%' }}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  resultsBg: {
    flex: 1,
    backgroundColor: '#1A0A33',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  topPlayersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 40,
    width: '100%',
  },
  pointsContainer: {
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  pointsGainedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  pointsGainedText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playerRankContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  playerRankContainerCenter: {
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  avatarWrapperResults: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'transparent',
    marginBottom: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapperRank1: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  avatarWrapperRank2: {
    borderColor: '#C0C0C0',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  avatarWrapperRank3: {
    borderColor: '#CD7F32',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  avatarImgResults: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  rankBadgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  crownTop: {
    position: 'absolute',
    top: -20,
    backgroundColor: '#FFD600',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },
  crownText: {
    color: '#232323',
    fontWeight: 'bold',
    fontSize: 15,
  },
  playerNameResults: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  playerNameWinner: {
    color: '#FFD700',
  },
  currentUserRankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(123, 44, 191, 0.3)',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    width: '90%',
  },
  currentUserRankText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentUserRankNumber: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  otherPlayersList: {
    width: '90%',
    marginBottom: 20,
  },
  otherPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  otherPlayerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  otherPlayerName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  otherPlayerRank: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  homeButtonContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
  },
}); 