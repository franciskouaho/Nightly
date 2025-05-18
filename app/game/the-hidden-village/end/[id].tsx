import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, onSnapshot } from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Confetti from 'react-native-confetti';

// Définition du type PlayerScore
interface PlayerScore {
  id: string;
  name: string;
  score: number;
  avatar?: string;
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
      style={[styles.container, { flex: 1 }]}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>  
        <Text style={styles.title}>{winnerText}</Text>
        {reason && <Text style={styles.reason}>{reason}</Text>}
        {players.length > 0 && (
          <View style={styles.podiumExactContainer}>
            <View style={styles.podiumExactRow}>
              {/* 2ème place */}
              <View style={[styles.podiumExactStep, styles.podiumExactSecond]}> 
                <LinearGradient
                   colors={["#2D1B4A", "#181825"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.podiumExactBlock}
                >
                  <Text style={styles.podiumExactNumber}>2</Text>
                </LinearGradient>
                <View style={styles.avatarExactWrapper}>
                  {players[1]?.avatar ? (
                    <Image source={{ uri: players[1].avatar }} style={styles.avatarExactImg} />
                  ) : (
                    <View style={styles.avatarExactFallback} />
                  )}
                  <View style={styles.badgeExactWrapper}><Text style={styles.badgeExact}>2</Text></View>
                </View>
                <Text style={styles.podiumExactName}>{players[1]?.name}</Text>
                <Text style={styles.podiumExactScore}>{players[1]?.score}</Text>
              </View>
              {/* 1ère place */}
              <View style={[styles.podiumExactStep, styles.podiumExactFirst]}> 
                <LinearGradient
                   colors={["#2D1B4A", "#181825"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.podiumExactBlockFirst}
                >
                  <Text style={styles.podiumExactNumber}>1</Text>
                </LinearGradient>
                <View style={styles.avatarExactWrapperFirst}>
                  {players[0]?.avatar ? (
                    <Image source={{ uri: players[0].avatar }} style={styles.avatarExactImgFirst} />
                  ) : (
                    <View style={styles.avatarExactFallbackFirst} />
                  )}
                  <View style={styles.badgeExactWrapperFirst}><Text style={styles.badgeExactFirst}>1</Text></View>
                </View>
                <Text style={styles.podiumExactNameFirst}>{players[0]?.name}</Text>
                <Text style={styles.podiumExactScoreFirst}>{players[0]?.score}</Text>
              </View>
              {/* 3ème place */}
              <View style={[styles.podiumExactStep, styles.podiumExactThird]}> 
                <LinearGradient
                  colors={["#2D1B4A", "#181825"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.podiumExactBlock}
                >
                  <Text style={styles.podiumExactNumber}>3</Text>
                </LinearGradient>
                <View style={styles.avatarExactWrapper}>
                  {players[2]?.avatar ? (
                    <Image source={{ uri: players[2].avatar }} style={styles.avatarExactImg} />
                  ) : (
                    <View style={styles.avatarExactFallback} />
                  )}
                  <View style={styles.badgeExactWrapper}><Text style={styles.badgeExact}>3</Text></View>
                </View>
                <Text style={styles.podiumExactName}>{players[2]?.name}</Text>
                <Text style={styles.podiumExactScore}>{players[2]?.score}</Text>
              </View>
            </View>
          </View>
        )}
        {players.length > 3 && (
          <LinearGradient
            colors={["#2D1B4A", "#181825"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.othersListExact, { width: '100%', minWidth: '100%', maxWidth: '100%' }]}
          >
            {players.slice(3).map((p, idx) => (
              <View key={p.id} style={styles.otherPlayerExact}>
                <View style={styles.otherRankCircleExact}><Text style={styles.otherRankExact}>{idx + 4}</Text></View>
                {p.avatar ? (
                  <View style={styles.otherAvatarCircleExact}><Image source={{ uri: p.avatar }} style={styles.avatarExactImgSmall} /></View>
                ) : (
                  <View style={styles.otherAvatarFallback} />
                )}
                <Text style={styles.otherNameExact}>{p.name}</Text>
                <Text style={styles.otherScoreExact}>{p.score}</Text>
              </View>
            ))}
          </LinearGradient>
        )}
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}> 
          <Text style={styles.buttonText}>{t('Retour à l\'accueil')}</Text>
        </TouchableOpacity>
      </Animated.View>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, pointerEvents: 'none' }}>
        <Confetti
          ref={confettiRef}
          duration={3500}
          untilStopped={false}
          size={2.5}
        />
      </View>
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
    alignItems: 'stretch',
    marginHorizontal: 0,
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
    marginTop: 40,
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
  podiumExactContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 18,
  },
  podiumExactRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 60,
  },
  podiumExactStep: {
    alignItems: 'center',
    width: 120,
    marginHorizontal: -8,
  },
  podiumExactFirst: { zIndex: 2, marginBottom: 0 },
  podiumExactSecond: { marginRight: -12, marginTop: 38, zIndex: 1 },
  podiumExactThird: { marginLeft: -12, marginTop: 60, zIndex: 1 },
  podiumExactBlock: {
    width: 120,
    height: 100,
    backgroundColor: '#23232a',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    position: 'relative',
  },
  podiumExactBlockFirst: {
    width: 120,
    height: 140,
    backgroundColor: '#23232a',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    position: 'relative',
  },
  podiumExactNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 48,
    opacity: 0.22,
    position: 'absolute',
    top: 18,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  avatarExactWrapper: {
    position: 'absolute',
    top: -48,
    alignItems: 'center',
    width: 100,
    zIndex: 10,
  },
  avatarExactWrapperFirst: {
    position: 'absolute',
    top: -62,
    alignItems: 'center',
    width: 100,
    zIndex: 10,
  },
  avatarExactImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#e5e5e5',
  },
  avatarExactImgFirst: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#e5e5e5',
  },
  avatarExactFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e5e5',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarExactFallbackFirst: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e5e5e5',
    borderWidth: 4,
    borderColor: '#fff',
  },
  badgeExactWrapper: {
    position: 'absolute',
    top: -8,
    right: 22,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  badgeExactWrapperFirst: {
    position: 'absolute',
    top: -10,
    right: 18,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  badgeExact: {
    backgroundColor: '#23232a',
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 0,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    textAlign: 'center',
    minWidth: 18,
    lineHeight: 18,
  },
  badgeExactFirst: {
    backgroundColor: '#23232a',
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 0,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    textAlign: 'center',
    minWidth: 20,
    lineHeight: 20,
  },
  podiumExactName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
    marginTop: 16,
    marginBottom: 0,
    textAlign: 'center',
    maxWidth: 140,
  },
  podiumExactNameFirst: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 24,
    marginTop: 22,
    marginBottom: 0,
    textAlign: 'center',
    maxWidth: 140,
  },
  podiumExactScore: {
    color: '#fff',
    fontSize: 18,
    marginTop: 4,
    marginBottom: 0,
    textAlign: 'center',
    fontWeight: '600',
  },
  podiumExactScoreFirst: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 0,
    textAlign: 'center',
  },
  othersListExact: {
    marginTop: 32,
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    minHeight: 180,
    borderRadius: 38,
    paddingVertical: 28,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  otherPlayerExact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  otherRankCircleExact: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 2,
    borderColor: '#A259FF',
  },
  otherRankExact: {
    color: '#A259FF',
    fontWeight: 'bold',
    fontSize: 22,
  },
  otherAvatarCircleExact: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#A259FF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  avatarExactImgSmall: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  otherAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e5e5',
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 18,
  },
  otherNameExact: {
    color: '#fff',
    flex: 1,
    marginLeft: 16,
    fontWeight: '700',
    fontSize: 22,
  },
  otherScoreExact: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 18,
    fontSize: 22,
    textAlign: 'right',
    minWidth: 48,
  },
}); 