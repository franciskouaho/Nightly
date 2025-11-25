import GameResults from '@/components/game/GameResults';
import { useAuth } from '@/contexts/AuthContext';
import {
  BlindTestCategory,
  useBlindTestGenerationsQuestions,
} from '@/hooks/blindtest-generations-questions';
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

interface BlindTestGameState extends Omit<GameState, 'phase'> {
  currentPlayerId: string;
  phase: string;
  currentQuestion: any;
  currentCategory: BlindTestCategory | null;
  askedQuestionIds: string[];
  gameMode: 'blindtest-generations';
}

// Couleurs du thème bleu nuit/turquoise
const GRADIENT_START = '#2C7A9C';
const GRADIENT_END = '#40B5D8';
const ACCENT_COLOR = '#40B5D8';
const CARD_BG = 'rgba(255, 255, 255, 0.15)';

const CATEGORIES: Array<{ id: BlindTestCategory; label: string; emoji: string }> = [
  { id: 'noel', label: 'Noël', emoji: '🎄' },
  { id: 'generiques', label: 'Génériques', emoji: '📺' },
  { id: 'tubes-80s-90s-2000s', label: 'Tubes 80s/90s/2000s', emoji: '🎶' },
  { id: 'tiktok', label: 'Sons TikTok', emoji: '📱' },
  { id: 'films', label: 'Musiques de films', emoji: '🎬' },
];

// Composant carte de question
const QuestionCard = ({
  category,
  question,
  currentRound,
  totalRounds,
  isPlaying,
}: {
  category: BlindTestCategory | null;
  question: string;
  currentRound: number;
  totalRounds: number;
  isPlaying: boolean;
}) => {
  const categoryInfo = category ? CATEGORIES.find((c) => c.id === category) : null;

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={[GRADIENT_START + '40', GRADIENT_END + '40']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardHeader}>
        {categoryInfo && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
            <Text style={styles.categoryLabel}>{categoryInfo.label}</Text>
          </View>
        )}
        <Text style={styles.blindTestLabel}>🎵 BLIND TEST</Text>
      </View>
      <View style={styles.audioVisualizer}>
        {isPlaying ? (
          <View style={styles.playingContainer}>
            <Animated.View style={[styles.bar, { height: 40 }]} />
            <Animated.View style={[styles.bar, { height: 60 }]} />
            <Animated.View style={[styles.bar, { height: 50 }]} />
            <Animated.View style={[styles.bar, { height: 70 }]} />
            <Animated.View style={[styles.bar, { height: 45 }]} />
          </View>
        ) : (
          <Text style={styles.musicNote}>🎵</Text>
        )}
      </View>
      {question && <Text style={styles.cardQuestion}>{question}</Text>}
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

export default function BlindTestGenerationsGame() {
  const { id: idParam } = useLocalSearchParams();
  const id = Array.isArray(idParam) ? idParam[0] : idParam || '';
  const { user } = useAuth();
  const router = useRouter();
  const { requestReview } = useInAppReview();
  const { awardGamePoints } = usePoints();
  const { t } = useTranslation();
  const { getRandomQuestion, isLoadingQuestions } = useBlindTestGenerationsQuestions();

  const [game, setGame] = useState<BlindTestGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const gameData = docSnap.data() as BlindTestGameState;
        setGame(gameData);
        setScores(gameData.scores || {});
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (game && (game.currentRound > game.totalRounds || game.phase === 'end')) {
      setIsGameOver(true);
    } else {
      setIsGameOver(false);
    }
  }, [game]);

  const handleCategorySelection = async (category: BlindTestCategory) => {
    if (!game || !user || isProcessing) return;

    setIsProcessing(true);
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));

      // Générer une question de cette catégorie
      const question = getRandomQuestion(category);

      await updateDoc(gameRef, {
        currentCategory: category,
        currentQuestion: question,
        phase: 'question',
        askedQuestionIds: question
          ? [...(game.askedQuestionIds || []), question.id]
          : game.askedQuestionIds,
      });
    } catch (error) {
      console.error('Erreur lors de la sélection de catégorie:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner la catégorie');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayAudio = () => {
    setIsPlaying(true);
    // Simuler la lecture audio pendant 5 secondes
    setTimeout(() => {
      setIsPlaying(false);
    }, 5000);
  };

  const handleAnswer = async (correct: boolean) => {
    if (!game || !user || isProcessing) return;

    setIsProcessing(true);
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));

      const updatedScores = { ...scores };
      if (correct) {
        updatedScores[user.uid] = (updatedScores[user.uid] || 0) + 1;
      }

      await updateDoc(gameRef, {
        scores: updatedScores,
        phase: 'waiting',
      });

      setScores(updatedScores);

      // Attendre 2 secondes puis passer au tour suivant
      setTimeout(async () => {
        await nextRound();
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la réponse:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer la réponse');
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

      await updateDoc(gameRef, {
        currentRound: nextRound,
        currentPlayerId: nextPlayer.id,
        phase: 'category-selection',
        currentQuestion: null,
        currentCategory: null,
      });

      setIsPlaying(false);
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
        scores={scores}
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
  const playerScore = scores[user?.uid || ''] || 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[GRADIENT_START, GRADIENT_END]} style={StyleSheet.absoluteFill} />
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🎵 Blind Test Générations</Text>
          <Text style={styles.subtitle}>
            Round {game.currentRound} / {game.totalRounds}
          </Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Score: {playerScore}</Text>
          </View>
        </View>

        {game.phase === 'category-selection' && (
          <View style={styles.phaseContainer}>
            {/* Carte de sélection de catégorie */}
            <View style={styles.cardContainer}>
              <LinearGradient
                colors={[GRADIENT_START + '40', GRADIENT_END + '40']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardHeader}>
                <View style={styles.playerBadge}>
                  <Text style={styles.playerName}>{currentPlayer?.name || 'Joueur'}</Text>
                </View>
                <Text style={styles.blindTestLabel}>🎵 BLIND TEST</Text>
              </View>
              <Text style={styles.cardQuestion}>
                {isCurrentPlayer
                  ? 'Choisis une catégorie'
                  : 'Choix de la catégorie en cours...'}
              </Text>
              <View style={styles.progressRow}>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[styles.progressBar, { width: `${(game.currentRound / game.totalRounds) * 100}%` }]}
                  />
                </View>
                <Text style={styles.cardProgress}>
                  {game.currentRound}/{game.totalRounds}
                </Text>
              </View>
            </View>

            {isCurrentPlayer && (
              <View style={styles.categoriesContainer}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryButton}
                    onPress={() => handleCategorySelection(category.id)}
                    disabled={isProcessing}
                  >
                    <Text style={styles.categoryButtonEmoji}>{category.emoji}</Text>
                    <Text style={styles.categoryButtonLabel}>{category.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!isCurrentPlayer && (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  En attente de {currentPlayer?.name || 'Joueur'}...
                </Text>
              </View>
            )}
          </View>
        )}

        {game.phase === 'question' && game.currentQuestion && (
          <View style={styles.phaseContainer}>
            <QuestionCard
              category={game.currentCategory}
              question={game.currentQuestion.text || ''}
              currentRound={game.currentRound}
              totalRounds={game.totalRounds}
              isPlaying={isPlaying}
            />

            {isCurrentPlayer && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.playButton]}
                  onPress={handlePlayAudio}
                  disabled={isPlaying || isProcessing}
                >
                  <Text style={styles.buttonText}>
                    {isPlaying ? '⏸️ En cours...' : '▶️ Lire extrait'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.answerButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.correctButton]}
                    onPress={() => handleAnswer(true)}
                    disabled={isProcessing}
                  >
                    <Text style={styles.buttonText}>✅ Bonne réponse</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.incorrectButton]}
                    onPress={() => handleAnswer(false)}
                    disabled={isProcessing}
                  >
                    <Text style={styles.buttonText}>❌ Mauvaise réponse</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!isCurrentPlayer && (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  En attente de {currentPlayer?.name || 'Joueur'}...
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
    marginBottom: 8,
  },
  scoreContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  scoreLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  phaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
    marginTop: 20,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  categoryButtonEmoji: {
    fontSize: 28,
  },
  categoryButtonLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  categoryBadge: {
    backgroundColor: ACCENT_COLOR,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  blindTestLabel: {
    color: ACCENT_COLOR,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  audioVisualizer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  playingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 70,
  },
  bar: {
    width: 8,
    backgroundColor: ACCENT_COLOR,
    borderRadius: 4,
  },
  musicNote: {
    fontSize: 64,
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
  playButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: '#4CAF50',
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  correctButton: {
    flex: 1,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: '#4CAF50',
  },
  incorrectButton: {
    flex: 1,
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

