import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, Animated, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getFirestore, doc, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import PhaseSummaryModal from "@/components/PhaseSummaryModal";
import VillageTable from '@/components/VillageTable';
import * as ScreenOrientation from 'expo-screen-orientation';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  isAlive?: boolean;
  votes?: number;
}

export default function DayScreen() {
  const { t } = useTranslation();
  const { id: gameId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteResults, setVoteResults] = useState<{[key: string]: number}>({});
  const [showSummary, setShowSummary] = useState(false);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync && ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    if (!gameId || !user) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(gameId));
    
    const unsubscribe = onSnapshot(gameRef, async (doc) => {
      if (!doc.exists) return;
      const data = doc.data();
      if (!data) return;
      
      // Redirection fin de partie
      if (data.status === 'ended') {
        router.replace(`/game/the-hidden-village/end/${gameId}`);
        return;
      }
      setGame(data);

      // Redirection si la phase change
      if (data.phase === 'night') {
        router.replace(`/game/the-hidden-village/night/${gameId}`);
      }

      // Mise à jour des résultats de vote
      if (data.votes) {
        setVoteResults(data.votes);
      }
      
      // --- Résolution automatique du jour (côté hôte) ---
      if (data.host && String(data.host) === String(user.uid) && data.phase === 'day') {
        const players = data.players || [];
        const alivePlayers = players.filter((p: Player) => p.isAlive !== false);
        const votes = data.votes || {};
        // Vérifier si tous les joueurs vivants ont voté
        const playerVotes = data.playerVotes || {};
        const allVoted = alivePlayers.every((p: Player) => playerVotes[p.id] || Object.values(playerVotes).includes(p.id));
        if (allVoted && Object.keys(votes).length > 0) {
          // Trouver le joueur le plus voté
          let maxVotes = 0;
          let eliminatedId = null;
          for (const [pid, count] of Object.entries(votes)) {
            if ((count as number) > maxVotes) {
              maxVotes = count as number;
              eliminatedId = pid;
            }
          }
          let newPlayers = players.map((p: Player) => p.id === eliminatedId ? { ...p, isAlive: false } : p);
          // Vérifier la victoire
          const traitorsAlive = newPlayers.filter((p: Player) => p.role === 'traitor' && p.isAlive !== false);
          const villagersAlive = newPlayers.filter((p: Player) => p.role !== 'traitor' && p.isAlive !== false);
          let winner = null;
          if (traitorsAlive.length === 0) winner = 'villagers';
          else if (traitorsAlive.length >= villagersAlive.length) winner = 'traitors';
          if (winner) {
            await updateDoc(gameRef, {
              status: 'ended',
              winner,
              endReason: winner === 'villagers' ? 'Tous les traîtres ont été éliminés.' : 'Les traîtres ont pris le contrôle du village.',
              players: newPlayers,
              votes: {},
              playerVotes: {},
            });
          } else {
            await updateDoc(gameRef, {
              phase: 'night',
              players: newPlayers,
              votes: {},
              playerVotes: {},
            });
          }
        }
      }
      // --- Fin résolution jour ---
      
      // --- Résumé animé après le vote ---
      if (data.phase === 'day' && data.lastEliminated && !showSummary) {
        const player = data.players?.find((p: Player) => p.id === data.lastEliminated) || null;
        setEliminatedPlayer(player);
        setShowSummary(true);
      }
      // --- Fin résumé ---
      
      setLoading(false);
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();

    return () => {
      unsubscribe();
    };
  }, [gameId, user]);

  const handleVote = async () => {
    if (!selectedPlayer || !gameId || !user) return;
    
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(gameId));

    try {
      // Mise à jour du vote
      await updateDoc(gameRef, {
        [`votes.${selectedPlayer.id}`]: (voteResults[selectedPlayer.id] || 0) + 1,
        [`playerVotes.${user.uid}`]: selectedPlayer.id
      });

      setHasVoted(true);
    } catch (error) {
      console.error('Erreur lors du vote:', error);
    }
  };

  // Fonction pour continuer après le résumé (uniquement pour l'hôte)
  const handleContinueAfterSummary = async () => {
    setShowSummary(false);
    // L'hôte passe à la nuit
    if (user && game && String(user.uid) === String(game.host)) {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(gameId));
      await updateDoc(gameRef, {
        phase: 'night',
        lastEliminated: null,
        votes: {},
        playerVotes: {},
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#A259FF" />
        <Text style={styles.loadingText}>{t('Chargement...')}</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('@/assets/thehiddenvillage/jour.png')}
      style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
      resizeMode="cover"
    >
      {/* Overlay de luminosité pour le jour */}
      <View style={styles.dayOverlay} pointerEvents="none" />
      {/* Bouton de vote en haut à droite */}
      {!hasVoted && selectedPlayer && (
        <View style={{ position: 'absolute', top: 24, right: 24, alignItems: 'flex-end', zIndex: 10 }}>
          <TouchableOpacity
            style={[styles.voteButton, { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 18 }]}
            onPress={handleVote}
          >
            <Text style={[styles.voteButtonText, { fontSize: 18, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }]}>Éliminer</Text>
          </TouchableOpacity>
        </View>
      )}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}> 
        <Text style={styles.title}>{t('Phase de Jour')}</Text>
        <Text style={styles.subtitle}>{t('Discutez et votez pour éliminer un joueur suspect')}</Text>
      </Animated.View>
      <View style={styles.content}>
        <PhaseSummaryModal
          visible={showSummary}
          phase="day"
          actionSummary={eliminatedPlayer ? `${eliminatedPlayer.name} a été éliminé par le village !` : 'Un joueur a été éliminé.'}
          mainPlayer={eliminatedPlayer}
          emoji={eliminatedPlayer ? '☠️' : ''}
          color="#EF4444"
          onContinue={handleContinueAfterSummary}
          isHost={user && game && String(user.uid) === String(game.host)}
        />
        {!hasVoted && (
          <VillageTable
            players={game?.players?.filter((p: Player) => p.id !== user?.uid && p.isAlive !== false) || []}
            selectedId={selectedPlayer?.id}
            onSelect={setSelectedPlayer}
            disabledIds={[]}
            mode="day"
          />
        )}
        {hasVoted && (
          <Text style={styles.waitingText}>
            {t('En attente des autres votes...')}
          </Text>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 32,
  },
  dayIconContainer: {
    backgroundColor: 'rgba(255, 223, 120, 0.7)',
    borderRadius: 32,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#FFD166',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  dayIcon: {
    fontSize: 40,
    textAlign: 'center',
    color: '#FFD166',
    textShadowColor: '#FFF7E0',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  playersList: {
    flex: 1,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedPlayerCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: '#A855F7',
    borderWidth: 2,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  voteCount: {
    fontSize: 14,
    color: '#A855F7',
    marginTop: 4,
  },
  voteButton: {
    backgroundColor: '#F59E42',
    paddingVertical: 18,
    paddingHorizontal: 38,
    borderRadius: 22,
    alignItems: 'center',
    shadowColor: '#FFD166',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    marginTop: 24,
    marginBottom: 24,
  },
  voteButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  waitingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 24,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  dayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
    zIndex: 1,
  },
}); 