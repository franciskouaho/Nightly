import GameResults from '@/components/game/GameResults';
import ChristmasTheme from '@/constants/themes/Christmas';
import { useAuth } from '@/contexts/AuthContext';
import { useDoubleDareQuestions } from '@/hooks/double-dare-questions';
import { GameState } from '@/types/gameTypes';
import { doc, getFirestore, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

// Utilisation du thème Christmas/Glamour
const GRADIENT_START = ChristmasTheme.light.backgroundDarker;
const GRADIENT_END = ChristmasTheme.light.primary;
const ACCENT_GOLD = ChristmasTheme.light.tertiary;

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
        colors={[GRADIENT_START, GRADIENT_END]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{ backgroundColor: ChristmasTheme.light.backgroundDarker, borderRadius: 36, paddingVertical: 4, paddingHorizontal: 18, marginBottom: 8 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{playerName}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Text style={{ color: ACCENT_GOLD, fontSize: 16, fontWeight: '600', opacity: 0.9 }}>
            {levelEmoji[level]} {levelLabel[level]}
          </Text>
          <Text style={{ color: ChristmasTheme.light.textSecondary, fontSize: 16, fontWeight: '600', opacity: 0.9 }}>
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


  // ⚠️ FIX: handleDareCompleted avec protection contre les doubles clics
  const isProcessingDareRef = React.useRef(false);

  const handleDareCompleted = async (completed: boolean) => {
    if (!gameState || !user) {
      console.log('🎯 [Double Dare] handleDareCompleted annulé - pas de gameState ou user');
      return;
    }

    // ⚠️ FIX: Protection contre les doubles clics
    if (isProcessingDareRef.current) {
      console.log('🎯 [Double Dare] Défi déjà en cours de traitement');
      return;
    }

    // ⚠️ FIX: Vérifier que c'est bien le joueur courant qui complète le défi
    if (String(user.uid) !== String(gameState.currentPlayerId)) {
      console.log('🎯 [Double Dare] Ce n\'est pas le tour de ce joueur:', {
        userUid: user.uid,
        currentPlayerId: gameState.currentPlayerId
      });
      return;
    }

    isProcessingDareRef.current = true;
    console.log('🎯 [Double Dare] Traitement du défi:', { completed, currentPlayerId: gameState.currentPlayerId });

    try {
      const currentPlayerIndex = gameState.players.findIndex(p => String(p.id) === String(gameState.currentPlayerId));
      if (currentPlayerIndex === -1) {
        console.error('🎯 [Double Dare] Joueur courant non trouvé');
        isProcessingDareRef.current = false;
        return;
      }

      const pointsEarned = completed ? (gameState.selectedLevel === 'chaos' ? 30 : gameState.selectedLevel === 'extreme' ? 20 : 10) : 0;

      const updatedScores = { ...gameState.playerScores };
      updatedScores[gameState.currentPlayerId] = (updatedScores[gameState.currentPlayerId] || 0) + pointsEarned;

      const nextRound = gameState.currentRound + 1;
      const isGameOver = nextRound > gameState.totalRounds;

      if (isGameOver) {
        console.log('🎯 [Double Dare] Fin du jeu');
        await updateDoc(gameRef, {
          phase: 'end',
          playerScores: updatedScores,
          scores: updatedScores,
        });
      } else {
        const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
        const nextPlayer = gameState.players[nextPlayerIndex];
        if (!nextPlayer) {
          console.error('🎯 [Double Dare] Prochain joueur non trouvé');
          isProcessingDareRef.current = false;
          return;
        }

        // Générer une nouvelle question pour le prochain joueur avec les mêmes paramètres
        const nextQuestion = getRandomQuestion(gameState.selectedLevel || 'hot', gameState.selectedMode || 'versus');
        if (!nextQuestion) {
          console.error('🎯 [Double Dare] Aucune nouvelle question disponible');
          isProcessingDareRef.current = false;
          return;
        }

        console.log('🎯 [Double Dare] Passage au tour suivant:', {
          nextRound,
          nextPlayerId: nextPlayer.id,
          nextPlayerName: nextPlayer.name
        });

        await updateDoc(gameRef, {
          phase: 'dare',
          currentRound: nextRound,
          currentPlayerId: nextPlayer.id,
          playerScores: updatedScores,
          currentQuestion: nextQuestion,
          dareCompleted: false,
          penaltyAssigned: false,
        });

        console.log('🎯 [Double Dare] Firebase mis à jour avec succès');
      }
    } catch (error) {
      console.error('🎯 [Double Dare] Erreur lors du traitement du défi:', error);
    } finally {
      // ⚠️ FIX: Réinitialiser le flag après un court délai
      setTimeout(() => {
        isProcessingDareRef.current = false;
      }, 1000);
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
        <LinearGradient colors={[GRADIENT_START, GRADIENT_END]} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={ACCENT_GOLD} />
      </View>
    );
  }

  // ⚠️ FIX: Comparaison robuste des IDs (string conversion pour éviter les problèmes de type)
  const currentPlayer = gameState.players.find(p => String(p.id) === String(gameState.currentPlayerId));
  const isCurrentUser = user?.uid && gameState.currentPlayerId && String(user.uid) === String(gameState.currentPlayerId);

  // ⚠️ FIX: Debug pour comprendre pourquoi les boutons ne s'affichent pas
  console.log('🎯 [Double Dare] Debug:', {
    isCurrentUser,
    currentPlayerId: gameState.currentPlayerId,
    userUid: user?.uid,
    dareCompleted: gameState.dareCompleted,
    phase: gameState.phase,
    hasCurrentQuestion: !!gameState.currentQuestion,
    questionText: gameState.currentQuestion?.text || gameState.currentQuestion?.question || 'N/A'
  });

  // Phase: Fin de partie
  if (gameState.phase === 'end') {
    return (
      <GameResults
        players={gameState.players}
        scores={gameState.scores || {}}
        userId={user?.uid || ''}
        colors={[GRADIENT_START, GRADIENT_END]}
        pointsConfig={{
          firstPlace: 20,
          secondPlace: 10,
          thirdPlace: 5,
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[GRADIENT_START, GRADIENT_END]} style={StyleSheet.absoluteFill} />
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
              question={(gameState.currentQuestion as any)?.text || (gameState.currentQuestion as any)?.question || 'Question en cours de chargement...'}
              currentRound={gameState.currentRound}
              totalRounds={gameState.totalRounds}
            />

            {/* ⚠️ FIX: Afficher les boutons si c'est le joueur courant ET que le défi n'est pas déjà complété */}
            {isCurrentUser && !gameState.dareCompleted ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#00C853' }]}
                  onPress={() => {
                    console.log('🎯 [Double Dare] Bouton "Défi réalisé" pressé');
                    handleDareCompleted(true);
                  }}
                >
                  <Text style={styles.actionButtonText}>✅ Défi réalisé</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#D32F2F' }]}
                  onPress={() => {
                    console.log('🎯 [Double Dare] Bouton "Safe Word" pressé');
                    handleSafeWord();
                  }}
                >
                  <Text style={styles.actionButtonText}>⚠️ Safe Word</Text>
                </TouchableOpacity>
              </View>
            ) : !isCurrentUser ? (
              <Text style={styles.waitingText}>
                {currentPlayer?.name || 'Le joueur'} réalise le défi...
              </Text>
            ) : gameState.dareCompleted ? (
              <Text style={styles.waitingText}>
                Défi complété, passage au tour suivant...
              </Text>
            ) : null}
          </>
        )}
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
    fontSize: 38,
    fontFamily: 'Righteous-Regular',
    color: ACCENT_GOLD,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  roundIndicator: {
    backgroundColor: `${ACCENT_GOLD}20`,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ACCENT_GOLD,
  },
  roundText: {
    color: ACCENT_GOLD,
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
    backgroundColor: ACCENT_GOLD,
    borderRadius: 4,
  },
  cardProgress: {
    color: ACCENT_GOLD,
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
});
