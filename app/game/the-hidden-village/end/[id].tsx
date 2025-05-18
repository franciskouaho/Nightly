import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, onSnapshot } from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Confetti from 'react-native-confetti';
import { FontAwesome5 } from '@expo/vector-icons';

// Définition du type PlayerScore
interface PlayerScore {
  id: string;
  name: string;
  score: number;
}

export default function EndScreen() {
  const { t } = useTranslation();
  const { id: gameId } = useLocalSearchParams();
  const router = useRouter();
  const [winner, setWinner] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState<string | null>(null);
  const [players, setPlayers] = React.useState<PlayerScore[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (!gameId) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(gameId));
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (!doc.exists) return;
      const data = doc.data();
      if (data?.status === 'ended') {
        setWinner(data.winner);
        setReason(data.endReason || null);
        const scores = data.scores || {};
        const playersRaw = data.players || [];
        const playersList: PlayerScore[] = playersRaw.map((p: any) => ({
          ...p,
          score: scores[p.id] || 0,
        }));
        playersList.sort((a: PlayerScore, b: PlayerScore) => b.score - a.score);
        setPlayers(playersList);
      }
    });
    return () => unsubscribe();
  }, [gameId]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
    if (confettiRef.current) {
      (confettiRef.current as any).startConfetti();
    }
  }, [fadeAnim]);

  let winnerText = '';
  if (winner === 'traitors') winnerText = t('Les traîtres ont gagné !');
  else if (winner === 'villagers') winnerText = t('Le village a triomphé !');
  else winnerText = t('Fin de la partie');

  return (
    <LinearGradient
      colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
      style={styles.container}
    >
      {/* @ts-ignore - Le type de Confetti a des problèmes de compatibilité avec React */}
      <Confetti ref={confettiRef} duration={3500} untilStopped={false} size={2.5} />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>  
        <Text style={styles.title}>{winnerText}</Text>
        {reason && <Text style={styles.reason}>{reason}</Text>}
        {players.length > 0 && (
          <View style={styles.podiumContainer}>
            <View style={styles.podiumRow}>
              {/* 2ème place */}
              <View style={[styles.podiumStep, styles.secondStep]}>
                <View style={styles.podiumBlockSilver}>
                  <Text style={styles.podiumRank}>2</Text>
                </View>
                <Text style={styles.podiumName}>{players[1]?.name}</Text>
                <Text style={styles.podiumScore}>{players[1]?.score} pts</Text>
              </View>
              {/* 1ère place */}
              <View style={[styles.podiumStep, styles.firstStep]}>
                <View style={styles.podiumBlockGold}>
                  <FontAwesome5 name="crown" size={28} color="#FFD700" />
                </View>
                <Text style={styles.podiumNameGold}>{players[0]?.name}</Text>
                <Text style={styles.podiumScoreGold}>{players[0]?.score} pts</Text>
              </View>
              {/* 3ème place */}
              <View style={[styles.podiumStep, styles.thirdStep]}>
                <View style={styles.podiumBlockBronze}>
                  <Text style={styles.podiumRank}>3</Text>
                </View>
                <Text style={styles.podiumName}>{players[2]?.name}</Text>
                <Text style={styles.podiumScore}>{players[2]?.score} pts</Text>
              </View>
            </View>
          </View>
        )}
        {players.length > 3 && (
          <>
            <Text style={styles.othersTitle}>{t('game.results.podium.others')}</Text>
            <View style={styles.othersList}>
              {players.slice(3).map((p, idx) => (
                <View key={p.id} style={styles.otherPlayer}>
                  <View style={styles.otherRankCircle}>
                    <Text style={styles.otherRank}>{idx + 4}</Text>
                  </View>
                  <Text style={styles.otherName}>{p.name}</Text>
                  <Text style={styles.otherScore}>{p.score} pts</Text>
                </View>
              ))}
            </View>
          </>
        )}
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}> 
          <Text style={styles.buttonText}>{t('Retour à l\'accueil')}</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E1117',
  },
  content: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 18,
    textAlign: 'center',
    textShadowColor: 'rgba(168,85,247,0.25)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  reason: {
    fontSize: 20,
    color: '#A855F7',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    backgroundColor: 'linear-gradient(90deg, #A855F7 0%, #F59E42 100%)',
    paddingVertical: 18,
    paddingHorizontal: 44,
    borderRadius: 32,
    marginTop: 16,
    shadowColor: '#A855F7',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(168,85,247,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  podiumContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 30,
  },
  podiumStep: {
    alignItems: 'center',
    width: 80,
  },
  firstStep: { marginHorizontal: 12, zIndex: 2 },
  secondStep: { marginRight: 12, marginTop: 30, zIndex: 1 },
  thirdStep: { marginLeft: 12, marginTop: 50, zIndex: 1 },
  podiumBlockGold: {
    width: 60,
    height: 110,
    backgroundColor: '#FFD700',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  podiumBlockSilver: {
    width: 60,
    height: 80,
    backgroundColor: '#C0C0C0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#C0C0C0',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  podiumBlockBronze: {
    width: 60,
    height: 60,
    backgroundColor: '#cd7f32',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#cd7f32',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  podiumRank: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  podiumName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 4,
  },
  podiumNameGold: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 4,
  },
  podiumScore: {
    color: '#fff',
    fontSize: 14,
  },
  podiumScoreGold: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  othersTitle: {
    color: '#b3a5d9',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  othersList: {
    marginTop: 10,
    width: '100%',
  },
  otherPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  otherRankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#694ED6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  otherRank: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  otherName: {
    color: '#fff',
    flex: 1,
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  otherScore: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
}); 