import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { GameState, Question } from '@/types/gameTypes';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useDoubleDareQuestions } from '@/hooks/double-dare-questions';
import GameResults from '@/components/game/GameResults';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DoubleDareGameState extends Omit<GameState, 'phase'> {
  currentPlayerId: string;
  selectedLevel: 'hot' | 'extreme' | 'chaos' | null;
  selectedMode: 'versus' | 'fusion' | null;
  phase: string;
  playerScores: { [playerId: string]: number };
  gameMode: 'double-dare';
  safeWordEnabled: boolean;
  dareCompleted: boolean;
  penaltyAssigned?: boolean;
}

const PURPLE_DARK = '#4A1A66';
const PURPLE_LIGHT = '#7B2CBF';
const ACCENT_FIRE = '#FF6B35';

// Composant carte de défi
const DareCard = ({
  playerName,
  level,
  mode,
  question,
  currentRound,
  totalRounds
}: {
  playerName: string;
  level: 'hot' | 'extreme' | 'chaos';
  mode: 'versus' | 'fusion';
  question: string;
  currentRound: number;
  totalRounds: number;
}) => {
  const levelEmoji = {
    hot: '🔥',
    extreme: '😈',
    chaos: '💀'
  };

  const levelLabel = {
    hot: 'HOT',
    extreme: 'EXTRÊME',
    chaos: 'CHAOS'
  };

  const modeEmoji = {
    versus: '⚔️',
    fusion: '❤️'
  };

  const modeLabel = {
    versus: 'VERSUS',
    fusion: 'FUSION'
  };

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={[PURPLE_DARK, PURPLE_LIGHT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{ backgroundColor: '#2D0A47', borderRadius: 36, paddingVertical: 4, paddingHorizontal: 18, marginBottom: 8 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{playerName}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: '600', opacity: 0.9 }}>
            {levelEmoji[level]} {levelLabel[level]}
          </Text>
          <Text style={{ color: '#FF6B35', fontSize: 16, fontWeight: '600', opacity: 0.9 }}>
            {modeEmoji[mode]} {modeLabel[mode]}
          </Text>
        </View>
      </View>
      <Text style={styles.cardQuestion}>
        {question}
      </Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(currentRound / totalRounds) * 100}%` }]} />
        </View>
        <Text style={styles.cardProgress}>{currentRound}/{totalRounds}</Text>
      </View>
    </View>
  );
};


export default function DoubleDareGame() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { getRandomQuestion } = useDoubleDareQuestions();

  const [gameState, setGameState] = useState<DoubleDareGameState | null>(null);
  const [loading, setLoading] = useState(true);

  const firestore = getFirestore();
  const gameRef = doc(firestore, 'games', String(id));

  useEffect(() => {
    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as DoubleDareGameState;
        setGameState(data);
        
        // Si le niveau et le mode sont déjà définis mais pas de question, en générer une
        if (data.selectedLevel && data.selectedMode && !data.currentQuestion && data.phase === 'dare') {
          const question = getRandomQuestion(data.selectedLevel, data.selectedMode);
          if (question) {
            updateDoc(gameRef, {
              currentQuestion: question,
            }).catch(console.error);
          }
        }
        
        setLoading(false);
      } else {
        Alert.alert('Erreur', 'La partie n\'existe pas');
        router.back();
      }
    });

    return () => unsubscribe();
  }, [id]);


  const handleDareCompleted = async (completed: boolean) => {
    if (!gameState || !user) return;

    const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayerId);
    const pointsEarned = completed ? (gameState.selectedLevel === 'chaos' ? 30 : gameState.selectedLevel === 'extreme' ? 20 : 10) : 0;

    const updatedScores = { ...gameState.playerScores };
    updatedScores[gameState.currentPlayerId] = (updatedScores[gameState.currentPlayerId] || 0) + pointsEarned;

    const nextRound = gameState.currentRound + 1;
    const isGameOver = nextRound > gameState.totalRounds;

    if (isGameOver) {
      await updateDoc(gameRef, {
        phase: 'end',
        playerScores: updatedScores,
        scores: updatedScores,
      });
    } else {
      const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
      const nextPlayer = gameState.players[nextPlayerIndex];
      if (!nextPlayer) return;
      
      // Générer une nouvelle question pour le prochain joueur avec les mêmes paramètres
      const nextQuestion = getRandomQuestion(gameState.selectedLevel || 'hot', gameState.selectedMode || 'versus');
      
      await updateDoc(gameRef, {
        phase: 'dare',
        currentRound: nextRound,
        currentPlayerId: nextPlayer.id,
        playerScores: updatedScores,
        currentQuestion: nextQuestion,
        dareCompleted: false,
        penaltyAssigned: false,
      });
    }
  };

  const handleSafeWord = async () => {
    Alert.alert(
      'Safe Word',
      'Êtes-vous sûr de vouloir passer ce défi ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Passer',
          style: 'destructive',
          onPress: () => handleDareCompleted(false)
        }
      ]
    );
  };

  if (loading || !gameState) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[PURPLE_DARK, PURPLE_LIGHT]} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const isCurrentUser = user?.uid === gameState.currentPlayerId;

  // Phase: Fin de partie
  if (gameState.phase === 'end') {
    return (
      <GameResults
        players={gameState.players}
        scores={gameState.playerScores || {}}
        userId={user?.uid || ''}
        colors={[PURPLE_DARK, PURPLE_LIGHT]}
      />
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[PURPLE_DARK, PURPLE_LIGHT]} style={StyleSheet.absoluteFill} />
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DOUBLE DARE</Text>
          <Text style={styles.headerSubtitle}>Deux joueurs. Zéro limite. Un seul mot d'ordre : oser.</Text>
          <View style={styles.roundIndicator}>
            <Text style={styles.roundText}>Tour {gameState.currentRound}/{gameState.totalRounds}</Text>
          </View>
        </View>

        {/* Phase: Défi */}
        {gameState.phase === 'dare' && gameState.currentQuestion && (
          <>
            <DareCard
              playerName={currentPlayer?.name || ''}
              level={gameState.selectedLevel || 'hot'}
              mode={gameState.selectedMode || 'versus'}
              question={gameState.currentQuestion.text}
              currentRound={gameState.currentRound}
              totalRounds={gameState.totalRounds}
            />

            {isCurrentUser && !gameState.dareCompleted && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#00C853' }]}
                  onPress={() => handleDareCompleted(true)}
                >
                  <Text style={styles.actionButtonText}>✅ Défi réalisé</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#D32F2F' }]}
                  onPress={handleSafeWord}
                >
                  <Text style={styles.actionButtonText}>⚠️ Safe Word</Text>
                </TouchableOpacity>
              </View>
            )}

            {!isCurrentUser && (
              <Text style={styles.waitingText}>
                {currentPlayer?.name} réalise le défi...
              </Text>
            )}
          </>
        )}

        {/* Scores */}
        <View style={styles.scoresContainer}>
          <Text style={styles.scoresTitle}>Scores</Text>
          {gameState.players.map(player => (
            <View key={player.id} style={styles.scoreRow}>
              <Text style={styles.scoreName}>{player.name}</Text>
              <Text style={styles.scoreValue}>{gameState.playerScores?.[player.id] || 0} pts</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  roundIndicator: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  roundText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
  },
  turnIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  turnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cardContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    minHeight: 280,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  cardQuestion: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 28,
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  cardProgress: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 24,
    fontStyle: 'italic',
  },
  scoresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  scoresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  scoreName: {
    color: 'white',
    fontSize: 16,
  },
  scoreValue: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
