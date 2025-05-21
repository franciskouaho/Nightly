import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import Confetti from 'react-native-confetti';
import { Player } from '@/types/gameTypes';
import { getFirestore, doc, getDoc, onSnapshot } from '@react-native-firebase/firestore';
import RoundedButton from '@/components/RoundedButton';
import { useTranslation } from 'react-i18next';
import { useInAppReview } from '@/hooks/useInAppReview';
import { useLanguage } from '@/contexts/LanguageContext';

type PlayerScore = Player & { score: number };

export default function GameResultsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const gameId = typeof id === 'string' ? id : id?.[0] || '';
  const { requestReview } = useInAppReview();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  const [players, setPlayers] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [confettiRef, setConfettiRef] = useState<any>(null);
  const confettiRefRef = useRef<any>(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!id) return;
        const db = getFirestore();
        const gameRef = doc(db, 'games', String(id));
        const gameSnap = await getDoc(gameRef);
        if (!gameSnap.exists()) return;
        const data = gameSnap.data();
        if (!data) return;
        
        const scores: Record<string, number> = data.scores || {};
        const playersRaw = data.players || [];
        const players: PlayerScore[] = playersRaw.map((p: any) => ({
          ...p,
          score: scores[p.id] || 0,
        }));
        players.sort((a, b) => b.score - a.score);
        setPlayers(players);
        setLoading(false);
        if (confettiRefRef.current) confettiRefRef.current.startConfetti();
      } catch (e) {
        setLoading(false);
      }
    };
    fetchResults();
    return () => {
      if (confettiRefRef.current) confettiRefRef.current.stopConfetti();
    };
  }, [confettiRefRef, id]);
  
  useEffect(() => {
    if (confettiRef) {
      (confettiRef as any).startConfetti();
    }
  }, [confettiRef]);
  
  useEffect(() => {
    const timeout = setTimeout(async () => {
      await requestReview();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [requestReview]);
  
  const handleReturnHome = () => {
    router.push('/');
  };
  
  const renderRankBadge = (rank: number) => {
    if (rank === 0) {
      return (
        <View style={[styles.rankBadge, styles.firstPlace]}>
          <FontAwesome5 name="crown" size={18} color="#FFD700" />
        </View>
      );
    } else if (rank === 1) {
      return (
        <View style={[styles.rankBadge, styles.secondPlace]}>
          <Text style={styles.rankText}>2</Text>
        </View>
      );
    } else if (rank === 2) {
      return (
        <View style={[styles.rankBadge, styles.thirdPlace]}>
          <Text style={styles.rankText}>3</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{rank + 1}</Text>
        </View>
      );
    }
  };
  
  const renderPlayerItem = ({ item, index }: { item: PlayerScore; index: number }) => (
    <View style={[
      styles.playerCard, 
      index === 0 ? styles.winnerCard : null,
      index === 0 ? { elevation: 8, shadowColor: '#FFD700', shadowOpacity: 0.6, shadowRadius: 16 } : { elevation: 2 }
    ]}>
      {renderRankBadge(index)}
      
      <View style={styles.playerInfo}>
        <View style={[styles.avatarContainer, index === 0 && { borderWidth: 2, borderColor: '#FFD700', backgroundColor: '#fffbe6' }]}>
          <Text style={[styles.avatarText, index === 0 && { color: '#FFD700' }]}>{item.name.charAt(0)}</Text>
        </View>
        <Text style={[styles.playerName, index === 0 && { color: '#FFD700', fontWeight: 'bold', fontSize: 22 }]}>{item.name}</Text>
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={[styles.scoreText, index === 0 && { color: '#FFD700', fontSize: 28 }]}>{item.score}</Text>
        <Text style={styles.scoreLabel}>points</Text>
      </View>
    </View>
  );
  
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={['#1a0933', '#321a5e']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('game.results.calculating')}</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient 
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]} 
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* @ts-ignore - Le type de Confetti a des problèmes de compatibilité avec React */}
        <Confetti ref={ref => setConfettiRef(ref)} />
        
        <View style={styles.header}>
          <Text style={styles.title}>{t('game.results.title')}</Text>
          <Text style={styles.subtitle}>
            {players.length > 0 && players[0]?.name ? 
              t('game.results.bravo', { name: players[0].name }) 
              : t('game.results.subtitle')}
          </Text>
        </View>
        
        <View style={styles.resultsContainer}>
          {/* Podium pour les 3 premiers */}
          <View style={styles.podiumContainer}>
            <View style={styles.podium}>
              {/* 2ème place */}
              {players[1] && (
                <View style={styles.podiumStep}>
                  <Text style={styles.podiumName}>{players[1].name}</Text>
                  <Text style={styles.podiumScore}>{players[1].score} pts</Text>
                  <View style={[styles.podiumBlock, styles.secondPlace]}>
                    <Text style={styles.podiumRank}>2</Text>
                  </View>
                </View>
              )}
              {/* 1ère place */}
              {players[0] && (
                <View style={styles.podiumStep}>
                  <Text style={styles.podiumName}>{players[0].name}</Text>
                  <Text style={styles.podiumScore}>{players[0].score} pts</Text>
                  <View style={[styles.podiumBlock, styles.firstPlace]}>
                    <FontAwesome5 name="crown" size={24} color="#FFD700" />
                  </View>
                </View>
              )}
              {/* 3ème place */}
              {players[2] && (
                <View style={styles.podiumStep}>
                  <Text style={styles.podiumName}>{players[2].name}</Text>
                  <Text style={styles.podiumScore}>{players[2].score} pts</Text>
                  <View style={[styles.podiumBlock, styles.thirdPlace]}>
                    <Text style={styles.podiumRank}>3</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          {/* Liste des autres joueurs */}
          <FlatList
            data={players.slice(3)}
            renderItem={renderPlayerItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        </View>
        
        <View style={styles.buttonsContainer}>
          <RoundedButton
            title={t('game.results.home')}
            onPress={handleReturnHome}
            style={[styles.button]}
            textStyle={styles.buttonText}
            icon={<Ionicons name="home" size={18} color="#fff" style={styles.buttonIcon} />}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#b3a5d9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  playerCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  winnerCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  firstPlace: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  secondPlace: {
    backgroundColor: 'rgba(192, 192, 192, 0.3)',
  },
  thirdPlace: {
    backgroundColor: 'rgba(205, 127, 50, 0.3)',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#694ED6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#b3a5d9',
  },
  buttonsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  safeArea: {
    flex: 1,
  },
  podiumContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  podiumStep: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  podiumBlock: {
    width: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  podiumName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  podiumScore: {
    color: '#fff',
    fontSize: 14,
  },
  podiumRank: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
