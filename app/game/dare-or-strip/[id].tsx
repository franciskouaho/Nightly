import GameResults from '@/components/game/GameResults';
import { useAuth } from '@/contexts/AuthContext';
import { useDareOrStripQuestions } from '@/hooks/dare-or-strip-questions';
import { useInAppReview } from '@/hooks/useInAppReview';
import { usePoints } from '@/hooks/usePoints';
import { GameState } from '@/types/gameTypes';
import { doc, getFirestore, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// import { BlurView } from 'expo-blur'; // Optionnel, peut être commenté si non disponible

interface DareOrStripGameState extends Omit<GameState, 'phase'> {
  currentPlayerId: string;
  phase: string;
  currentQuestion: any;
  askedQuestionIds: string[];
  jokers: Record<string, boolean>; // true = joker disponible
  gameMode: 'dare-or-strip';
}

// Couleurs du thème violet/rose
const GRADIENT_START = '#6B46C1';
const GRADIENT_END = '#F472B6';
const ACCENT_COLOR = '#F472B6';
const CARD_BG = 'rgba(255, 255, 255, 0.15)';

// Composant carte de gage
const DareCard = ({
  playerName,
  question,
  currentRound,
  totalRounds,
}: {
  playerName: string;
  question: string;
  currentRound: number;
  totalRounds: number;
}) => {
  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={[GRADIENT_START + '40', GRADIENT_END + '40']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardHeader}>
        <View style={styles.playerBadge}>
          <Text style={styles.playerName}>{playerName}</Text>
        </View>
        <Text style={styles.dareLabel}>💋 GAGE</Text>
      </View>
      <Text style={styles.cardQuestion}>{question}</Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${(currentRound / totalRounds) * 100}%` }]}
          />
        </View>
        <Text style={styles.cardProgress}>
          {currentRound}/{totalRounds}
        </Text>
      </View>
    </View>
  );
};

export default function DareOrStripGame() {
  const { id: idParam } = useLocalSearchParams();
  const id = Array.isArray(idParam) ? idParam[0] : idParam || '';
  const { user } = useAuth();
  const router = useRouter();
  const { requestReview } = useInAppReview();
  const { awardGamePoints } = usePoints();
  const { t } = useTranslation();
  const { getRandomQuestion, isLoadingQuestions } = useDareOrStripQuestions();

  const [game, setGame] = useState<DareOrStripGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const gameData = docSnap.data() as DareOrStripGameState;
        setGame(gameData);

        // Si on est en phase dare et qu'il n'y a pas de question, en générer une
        if (gameData.phase === 'dare' && !gameData.currentQuestion) {
          const question = getRandomQuestion();
          if (question) {
            updateDoc(gameRef, {
              currentQuestion: question,
              askedQuestionIds: [...(gameData.askedQuestionIds || []), question.id],
            }).catch(console.error);
          }
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, getRandomQuestion]);

  useEffect(() => {
    if (game && (game.currentRound > game.totalRounds || game.phase === 'end')) {
      setIsGameOver(true);
    } else {
      setIsGameOver(false);
    }
  }, [game]);

  const handleChoice = async (choice: 'dare' | 'strip') => {
    if (!game || !user || isProcessing) return;

    setIsProcessing(true);
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));

      if (choice === 'dare') {
        // Le joueur fait le gage
        await updateDoc(gameRef, {
          phase: 'waiting',
        });

        // Attendre 3 secondes puis passer au tour suivant
        setTimeout(async () => {
          await nextRound();
        }, 3000);
      } else {
        // Le joueur retire un vêtement
        await updateDoc(gameRef, {
          phase: 'waiting',
        });

        // Attendre 2 secondes puis passer au tour suivant
        setTimeout(async () => {
          await nextRound();
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors du choix:', error);
      Alert.alert('Erreur', 'Impossible de traiter votre choix');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJoker = async () => {
    if (!game || !user || isProcessing) return;
    if (!game.jokers[user.uid]) {
      Alert.alert('Joker déjà utilisé', 'Vous avez déjà utilisé votre joker');
      return;
    }

    setIsProcessing(true);
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));

      const updatedJokers = { ...game.jokers };
      updatedJokers[user.uid] = false;

      await updateDoc(gameRef, {
        jokers: updatedJokers,
        phase: 'waiting',
      });

      // Attendre 2 secondes puis passer au tour suivant
      setTimeout(async () => {
        await nextRound();
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'utilisation du joker:', error);
      Alert.alert('Erreur', 'Impossible d\'utiliser le joker');
    } finally {
      setIsProcessing(false);
    }
  };

  const nextRound = async () => {
    if (!game || !user) return;
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));

      const nextRound = game.currentRound + 1;
      const isGameOver = nextRound > game.totalRounds;

      if (isGameOver) {
        await updateDoc(gameRef, {
          phase: 'end',
          currentRound: game.totalRounds,
        });
        return;
      }

      // Passer au joueur suivant
      const currentIndex = game.players.findIndex((p) => p.id === game.currentPlayerId);
      const nextIndex = (currentIndex + 1) % game.players.length;
      const nextPlayer = game.players[nextIndex];

      // Générer une nouvelle question
      const question = getRandomQuestion();

      await updateDoc(gameRef, {
        currentRound: nextRound,
        currentPlayerId: nextPlayer.id,
        phase: 'dare',
        currentQuestion: question,
        askedQuestionIds: question
          ? [...(game.askedQuestionIds || []), question.id]
          : game.askedQuestionIds,
      });
    } catch (error) {
      console.error('Erreur lors du passage au tour suivant:', error);
      Alert.alert('Erreur', 'Impossible de passer au tour suivant');
    }
  };

  if (loading || isLoadingQuestions) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[GRADIENT_START, GRADIENT_END]} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[GRADIENT_START, GRADIENT_END]} style={StyleSheet.absoluteFill} />
        <Text style={styles.errorText}>Partie introuvable</Text>
      </View>
    );
  }

  if (isGameOver) {
    return (
      <GameResults
        players={game?.players || []}
        scores={game?.scores || {}}
        userId={user?.uid || ''}
        pointsConfig={{
          firstPlace: 20,
          secondPlace: 10,
          thirdPlace: 5,
        }}
      />
    );
  }

  const currentPlayer = game.players.find((p) => p.id === game.currentPlayerId);
  const isCurrentPlayer = user?.uid === game.currentPlayerId;
  const hasJoker = game.jokers[user?.uid || ''] || false;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[GRADIENT_START, GRADIENT_END]} style={StyleSheet.absoluteFill} />
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>💋 Dare or Strip</Text>
          <Text style={styles.subtitle}>
            Round {game.currentRound} / {game.totalRounds}
          </Text>
        </View>

        {game.phase === 'dare' && currentPlayer && game.currentQuestion && (
          <View style={styles.phaseContainer}>
            <DareCard
              playerName={currentPlayer.name || 'Joueur'}
              question={game.currentQuestion.text}
              currentRound={game.currentRound}
              totalRounds={game.totalRounds}
            />

            {isCurrentPlayer && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.dareButton]}
                  onPress={() => handleChoice('dare')}
                  disabled={isProcessing}
                >
                  <Text style={styles.buttonText}>✅ Faire le gage</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.stripButton]}
                  onPress={() => handleChoice('strip')}
                  disabled={isProcessing}
                >
                  <Text style={styles.buttonText}>🚫 Retirer un vêtement</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.jokerButton,
                    !hasJoker && styles.jokerButtonDisabled,
                  ]}
                  onPress={handleJoker}
                  disabled={!hasJoker || isProcessing}
                >
                  <Text style={styles.jokerText}>
                    {hasJoker ? '🃏 Joker' : '🃏 Joker utilisé'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!isCurrentPlayer && (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  En attente de {currentPlayer.name}...
                </Text>
              </View>
            )}
          </View>
        )}

        {game.phase === 'waiting' && (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>⏳ Passage au tour suivant...</Text>
          </View>
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
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  phaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  playerBadge: {
    backgroundColor: ACCENT_COLOR,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  playerName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  dareLabel: {
    color: ACCENT_COLOR,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardQuestion: {
    fontSize: 22,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
    lineHeight: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    backgroundColor: ACCENT_COLOR,
    borderRadius: 4,
  },
  cardProgress: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 48,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  dareButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: '#4CAF50',
  },
  stripButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
    borderColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  jokerButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFC107',
    marginTop: 8,
  },
  jokerButtonDisabled: {
    backgroundColor: 'rgba(158, 158, 158, 0.3)',
    borderColor: '#9E9E9E',
    opacity: 0.5,
  },
  jokerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  waitingContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  waitingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

