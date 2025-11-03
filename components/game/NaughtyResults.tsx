import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Player } from '@/types/gameTypes';
import { useTranslation } from 'react-i18next';
import { usePoints } from '@/hooks/usePoints';
import useLeaderboard from '@/hooks/useLeaderboard';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RoundedButton from '@/components/RoundedButton';

interface NaughtyResultsProps {
  players: Player[];
  naughtyAnswers: Record<string, number>;
  userId: string;
  pointsConfig?: {
    firstPlace?: number;
    secondPlace?: number;
    thirdPlace?: number;
  };
}

export default function NaughtyResults({ 
  players, 
  naughtyAnswers, 
  userId,
  pointsConfig = {
    firstPlace: 30,
    secondPlace: 20,
    thirdPlace: 10
  }
}: NaughtyResultsProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { addPointsToUser, getUserPoints } = usePoints();
  const { updateUserStats } = useLeaderboard();
  const [pointsGained, setPointsGained] = useState<number | null>(null);

  // Tri décroissant par nombre de réponses cochonnes
  const sorted = [...players].sort((a, b) => (naughtyAnswers?.[b.id] || 0) - (naughtyAnswers?.[a.id] || 0));
  const player1 = sorted[0];
  const player2 = sorted[1];
  const player3 = sorted[2];
  const others = sorted.slice(3);

  // Calculer les points gagnés (Lumicoins - argent)
  useEffect(() => {
    const calculatePoints = async () => {
      const userRank = sorted.findIndex(p => p.id === userId);
      let points = 0;

      if (userRank === 0) points = pointsConfig.firstPlace || 30;
      else if (userRank === 1) points = pointsConfig.secondPlace || 20;
      else if (userRank === 2) points = pointsConfig.thirdPlace || 10;

      if (points > 0) {
        await addPointsToUser(userId, points);
        setPointsGained(points);
      }
    };

    calculatePoints();
  }, [userId, sorted, pointsConfig, addPointsToUser]);

  // Mettre à jour les statistiques du leaderboard (gamePoints - séparé de l'argent)
  useEffect(() => {
    const updateLeaderboardStats = async () => {
      if (!userId) return;

      const userRank = sorted.findIndex(p => p.id === userId);
      const isWinner = userRank === 0;

      // Calculer les points de classement selon la position finale (pour le leaderboard)
      let leaderboardPoints = 0;
      if (userRank === 0) leaderboardPoints = 25; // 1ère place
      else if (userRank === 1) leaderboardPoints = 15; // 2ème place  
      else if (userRank === 2) leaderboardPoints = 10; // 3ème place
      else leaderboardPoints = 5; // Autres places

      // Utiliser la fonction updateUserStats du hook useLeaderboard (met à jour gamePoints)
      await updateUserStats({
        userId,
        points: leaderboardPoints,
        won: isWinner,
        timestamp: new Date()
      });
    };

    if (sorted.length > 0) {
      updateLeaderboardStats();
    }
  }, [userId, sorted, updateUserStats]);

  return (
    <View style={styles.bg}>
      <Text style={styles.title}>{t('game.neverHaveIEverHot.naughtyRanking')}</Text>

      {/* Affichage des points gagnés */}
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

      <View style={styles.topPlayersContainer}>
        {/* Joueur 2 */}
        {player2 && (
          <View style={styles.playerRankContainer}>
            <View style={[styles.avatarWrapper, styles.avatarWrapperRank2]}>
              <Image source={{ uri: player2.avatar }} style={styles.avatarImg} />
              <View style={styles.rankBadge}><Text style={styles.rankBadgeText}>2</Text></View>
            </View>
            <Text style={styles.playerName} numberOfLines={1}>{player2.name}</Text>
            <Text style={styles.naughtyCount}>🔥 {naughtyAnswers?.[player2.id] || 0}</Text>
          </View>
        )}
        {/* Joueur 1 */}
        {player1 && (
          <View style={styles.playerRankContainerCenter}>
            <View style={[styles.avatarWrapper, styles.avatarWrapperRank1]}>
              <Image source={{ uri: player1.avatar }} style={styles.avatarImgBig} />
              <View style={styles.rankBadge}><Text style={styles.rankBadgeText}>1</Text></View>
              <View style={styles.crownTop}><Text style={styles.crownText}>👑</Text></View>
            </View>
            <Text style={[styles.playerName, styles.playerNameWinner]} numberOfLines={1}>{player1.name}</Text>
            <Text style={styles.naughtyCountBig}>🔥 {naughtyAnswers?.[player1.id] || 0}</Text>
          </View>
        )}
        {/* Joueur 3 */}
        {player3 && (
          <View style={styles.playerRankContainer}>
            <View style={[styles.avatarWrapper, styles.avatarWrapperRank3]}>
              <Image source={{ uri: player3.avatar }} style={styles.avatarImg} />
              <View style={styles.rankBadge}><Text style={styles.rankBadgeText}>3</Text></View>
            </View>
            <Text style={styles.playerName} numberOfLines={1}>{player3.name}</Text>
            <Text style={styles.naughtyCount}>🔥 {naughtyAnswers?.[player3.id] || 0}</Text>
          </View>
        )}
      </View>
      {/* Autres joueurs */}
      {others.length > 0 && (
        <View style={styles.others}>
          {others.map((player, i) => (
            <View key={player.id} style={styles.row}>
              <Text style={styles.rank}>{i + 4}</Text>
              <Image source={{ uri: player.avatar }} style={styles.avatarSmall} />
              <Text style={styles.nameSmall}>{player.name}</Text>
              <Text style={styles.countSmall}>🔥 {naughtyAnswers?.[player.id] || 0}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Bouton Accueil */}
      <View style={styles.homeButtonContainer}>
        <RoundedButton
          title={t('navigation.home')}
          onPress={() => router.replace("/(tabs)")}
          icon={<Ionicons name="home" size={22} color="#fff" />}
          gradientColors={["#C41E3A", "#8B1538", "#A01D2E"]}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, alignItems: 'center', padding: 20, borderRadius: 24 },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  pointsGainedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
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
  topPlayersContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 30 },
  playerRankContainer: { alignItems: 'center', marginHorizontal: 12, width: 90 },
  playerRankContainerCenter: { alignItems: 'center', marginHorizontal: 12, width: 110 },
  avatarWrapper: { alignItems: 'center', justifyContent: 'center' },
  avatarWrapperRank1: { marginBottom: 0 },
  avatarWrapperRank2: { marginTop: 24 },
  avatarWrapperRank3: { marginTop: 24 },
  avatarImg: { width: 70, height: 70, borderRadius: 35, marginBottom: 8, borderWidth: 2, borderColor: '#fff' },
  avatarImgBig: { width: 100, height: 100, borderRadius: 50, marginBottom: 8, borderWidth: 3, borderColor: '#FFD700' },
  rankBadge: { position: 'absolute', bottom: -8, right: -8, backgroundColor: '#FFD700', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2 },
  rankBadgeText: { color: '#1A0A33', fontWeight: 'bold', fontSize: 16 },
  crownTop: { position: 'absolute', top: -24, left: '50%', marginLeft: -16 },
  crownText: { fontSize: 32 },
  playerName: { color: '#fff', fontWeight: 'bold', fontSize: 15, textAlign: 'center' },
  playerNameWinner: { color: '#FFD700', fontSize: 17 },
  naughtyCount: { color: '#FFD700', fontWeight: 'bold', fontSize: 16, marginTop: 2 },
  naughtyCountBig: { color: '#FFD700', fontWeight: 'bold', fontSize: 20, marginTop: 2 },
  others: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rank: { color: '#fff', width: 24, textAlign: 'center', fontWeight: 'bold' },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 8 },
  nameSmall: { color: '#fff', flex: 1 },
  countSmall: { color: '#FFD700', fontWeight: 'bold', marginLeft: 8 },
  homeButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
}); 