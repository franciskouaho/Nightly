import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import RoundedButton from '@/components/RoundedButton';
import { usePoints } from '@/hooks/usePoints';
import { Player } from '@/types/gameTypes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInAppReview } from '@/hooks/useInAppReview';
import { useTranslation } from 'react-i18next';

const PlayerRankDisplay: React.FC<{ player: Player; rank: number; score: number }> = ({ player, rank, score }) => {
  const containerStyle = [
    styles.playerRankContainer,
    rank === 1 ? styles.rank1Container : styles.rank2PlusContainer,
  ];
  const avatarSize = rank === 1 ? 100 : 80;

  return (
    <View style={containerStyle}>
      <View style={[styles.avatarWrapper, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
        <Image source={{ uri: player.avatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
        {rank === 1 && <Text style={styles.crown}>👑</Text>}
        <View style={styles.rankBadge}>
          <Text style={styles.rankBadgeText}>{rank}</Text>
        </View>
      </View>
      <Text style={styles.playerName} numberOfLines={1}>{player.name}</Text>
      <Text style={styles.playerScore}>{score} pts</Text>
    </View>
  );
};

interface GameResultsProps {
  players: Player[];
  scores: Record<string, number>;
  userId: string;
  pointsConfig?: {
    firstPlace?: number;
    secondPlace?: number;
    thirdPlace?: number;
  };
  colors?: readonly [string, string, ...string[]];
  secondaryScores?: Record<string, number>;
  secondaryScoresTitle?: string;
}

export default function GameResults({
  players,
  scores,
  userId,
  pointsConfig = {},
  colors = ['#21101C', '#21101C'],
  secondaryScores,
  secondaryScoresTitle,
}: GameResultsProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { awardLumiCoins } = usePoints();
  const { requestReview } = useInAppReview();
  const { t } = useTranslation();

  const sortedPlayers = useMemo(() =>
    [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)),
    [players, scores]
  );

  const topThree = useMemo(() => sortedPlayers.slice(0, 3), [sortedPlayers]);
  const player1 = topThree.find((p, i) => i === 0);
  const player2 = topThree.find((p, i) => i === 1);
  const player3 = topThree.find((p, i) => i === 2);

  const currentUserRank = useMemo(() => sortedPlayers.findIndex((p) => p.id === userId) + 1, [sortedPlayers, userId]);

  const lumicoinsReward = useMemo(() => {
    if (currentUserRank === 1) return 30;
    if (currentUserRank === 2) return 20;
    if (currentUserRank === 3) return 10;
    return 5;
  }, [currentUserRank]);

  const rank_name = `rang ${currentUserRank}`;

  useEffect(() => {
    if (currentUserRank === 1) {
      requestReview();
    }
  }, [currentUserRank, requestReview]);


  return (
    <LinearGradient colors={colors} style={styles.resultsBg}>
      <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.topPlayersContainer}>
          {player2 && <PlayerRankDisplay player={player2} rank={2} score={scores[player2.id] || 0} />}
          {player1 && <PlayerRankDisplay player={player1} rank={1} score={scores[player1.id] || 0} />}
          {player3 && <PlayerRankDisplay player={player3} rank={3} score={scores[player3.id] || 0} />}
        </View>

        <Pressable
          onPress={() => awardLumiCoins(userId, lumicoinsReward, 'game_reward', rank_name)}
          style={styles.lumicoinsButton}
        >
          <MaterialCommunityIcons name="currency-btc" size={22} color="#FDD835" />
          <Text style={styles.lumicoinsButtonText}>+{lumicoinsReward} {t('common.lumicoins', 'Lumicoins')}</Text>
        </Pressable>

        {currentUserRank > 0 && (
          <View style={styles.currentUserRankContainer}>
            <Text style={styles.currentUserRankText}>{t('game.results.yourCurrentRank', 'Votre rang actuel')}</Text>
            <View style={styles.rankInfo}>
              <Text style={styles.rankNumber}>{currentUserRank}</Text>
              <Ionicons name="arrow-up" size={24} color="#00E676" />
            </View>
          </View>
        )}

        <View style={{flex: 1}} />

        <View style={styles.footer}>
          <RoundedButton
            title="Accueil"
            onPress={() => router.replace('/(tabs)')}
            icon={<Ionicons name="home" size={22} color="#fff" />}
            gradientColors={["#7B2CBF", "#661A59"]}
            style={styles.homeButton}
            textStyle={styles.homeButtonText}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  resultsBg: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  topPlayersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 220,
    marginBottom: 30,
  },
  playerRankContainer: {
    alignItems: 'center',
  },
  rank1Container: {
    zIndex: 1,
  },
  rank2PlusContainer: {
    marginHorizontal: -15,
    transform: [{ translateY: 10 }],
  },
  avatarWrapper: {
    borderWidth: 4,
    borderColor: '#FFD700',
    backgroundColor: '#3a2d4f',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  crown: {
    position: 'absolute',
    top: -25,
    fontSize: 24,
  },
  rankBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFD700',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#21101C',
  },
  rankBadgeText: {
    color: '#21101C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  playerScore: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  lumicoinsButton: {
    backgroundColor: '#3D2E27',
    borderColor: '#FDD835',
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '80%',
    shadowColor: '#FDD835',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  lumicoinsButtonText: {
    color: '#FDD835',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 18,
  },
  currentUserRankContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  currentUserRankText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  rankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  footer: {
    width: '100%',
    paddingBottom: 10,
  },
  homeButton: {
    paddingVertical: 16,
    borderRadius: 25,
    width: '100%',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 