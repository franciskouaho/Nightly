import GameResults from '@/components/game/GameResults';
import BlindTestAudioPlayer from '../../../components/BlindTestAudioPlayer';
import { useAuth } from '@/contexts/AuthContext';
import {
  BlindTestCategory,
  useBlindTestGenerationsQuestions,
} from '@/hooks/blindtest-generations-questions';
import { useBlindTestCategories } from '@/hooks/useBlindTestCategories';
import { useInAppReview } from '@/hooks/useInAppReview';
import { usePoints } from '@/hooks/usePoints';
import { useBlindTestAnalytics } from '@/hooks/useBlindTestAnalytics';
import { GameState } from '@/types/gameTypes';
import { doc, getFirestore, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
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

// Couleurs du thème Noël
const GRADIENT_START = '#C41E3A';
const GRADIENT_END = '#8B1538';
const ACCENT_COLOR = '#FFD700';
const CARD_BG = 'rgba(255, 255, 255, 0.12)';

const { width } = Dimensions.get('window');

// Composant de carte de catégorie animée
const CategoryCard = ({
  category,
  onPress,
  disabled,
  delay = 0,
}: {
  category: {
    id: string;
    label: string;
    emoji: string;
    gradient: [string, string];
    description: string;
  };
  onPress: () => void;
  disabled: boolean;
  delay?: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.categoryCardWrapper,
        {
          opacity: opacityAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, pressAnim) },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={styles.categoryCard}
      >
        <LinearGradient
          colors={category.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryCardGradient}
        >
          <View style={styles.categoryCardContent}>
            <Text style={styles.categoryCardEmoji}>{category.emoji}</Text>
            <Text style={styles.categoryCardLabel} numberOfLines={2}>{category.label}</Text>
            <Text style={styles.categoryCardDescription} numberOfLines={1}>{category.description}</Text>
          </View>
          {disabled && (
            <View style={styles.categoryCardDisabled}>
              <ActivityIndicator size="small" color="white" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant de grille de catégories
const CategoryGrid = ({
  categories,
  onSelectCategory,
  isProcessing,
}: {
  categories: Array<{
    id: string;
    label: string;
    emoji: string;
    gradient: [string, string];
    description: string;
  }>;
  onSelectCategory: (category: BlindTestCategory) => void;
  isProcessing: boolean;
}) => {
  return (
    <View style={styles.categoriesGrid}>
      {categories.map((category, index) => (
        <CategoryCard
          key={category.id}
          category={category}
          onPress={() => onSelectCategory(category.id)}
          disabled={isProcessing}
          delay={index * 100}
        />
      ))}
    </View>
  );
};

// Plus besoin du composant QuestionCard - on utilise BlindTestAudioPlayer

export default function BlindTestGenerationsGame() {
  const { id: idParam } = useLocalSearchParams();
  const id = Array.isArray(idParam) ? idParam[0] : idParam || '';
  const { user } = useAuth();
  const router = useRouter();
  const { requestReview } = useInAppReview();
  const { awardGamePoints } = usePoints();
  const { t } = useTranslation();
  const { getRandomQuestion, isLoadingQuestions } = useBlindTestGenerationsQuestions();
  const { categories, loading: loadingCategories } = useBlindTestCategories();
  const blindTestAnalytics = useBlindTestAnalytics();

  const [game, setGame] = useState<BlindTestGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [audioPaused, setAudioPaused] = useState(false);
  const [listeningUserId, setListeningUserId] = useState<string | null>(null);
  const [showCorrectAnswerModal, setShowCorrectAnswerModal] = useState(false);
  const [correctAnswerPlayer, setCorrectAnswerPlayer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<Set<string>>(new Set());
  const gameStartTimeRef = useRef<number | null>(null);
  const questionStartTimeRef = useRef<number | null>(null);
  const audioPauseTimeRef = useRef<number | null>(null);
  const gameEndTrackedRef = useRef<boolean>(false);
  const lastGameDataRef = useRef<BlindTestGameState | null>(null);
  const lastAudioPausedRef = useRef<boolean | null>(null);
  const lastListeningUserIdRef = useRef<string | null>(null);
  const lastShowModalRef = useRef<boolean | null>(null);
  const lastWrongAnswersRef = useRef<string[]>([]);

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const gameData = docSnap.data() as BlindTestGameState;
        
        // Éviter les mises à jour inutiles en comparant avec les données précédentes
        const hasChanged = !lastGameDataRef.current || 
          JSON.stringify(lastGameDataRef.current) !== JSON.stringify(gameData);
        
        if (hasChanged) {
          lastGameDataRef.current = gameData;
          setGame(gameData);
          setScores(gameData.scores || {});
        }
        
        // Track game start when game is first loaded
        if (!gameStartTimeRef.current && gameData.phase) {
          gameStartTimeRef.current = Date.now();
          if (user && gameData.players) {
            blindTestAnalytics.trackGameStart(id, gameData.players.length);
          }
        }
        
        // Synchroniser l'état audio depuis Firestore (seulement si changé)
        const newAudioPaused = (gameData as any).audioPaused || false;
        if (lastAudioPausedRef.current !== newAudioPaused) {
          lastAudioPausedRef.current = newAudioPaused;
          setAudioPaused(newAudioPaused);
        }
        
        const newListeningUserId = (gameData as any).listeningUserId || null;
        if (lastListeningUserIdRef.current !== newListeningUserId) {
          lastListeningUserIdRef.current = newListeningUserId;
          setListeningUserId(newListeningUserId);
        }
        
        // Synchroniser le modal de bonne réponse (seulement si changé)
        const newShowModal = !!(gameData as any).showCorrectAnswerModal;
        if (lastShowModalRef.current !== newShowModal) {
          lastShowModalRef.current = newShowModal;
          setShowCorrectAnswerModal(newShowModal);
          setCorrectAnswerPlayer((gameData as any).correctAnswerPlayer || null);
        }
        
        // Synchroniser les mauvaises réponses (seulement si changé)
        if ((gameData as any).wrongAnswers) {
          const newWrongAnswersArray = Array.from((gameData as any).wrongAnswers || []);
          const lastWrongAnswersArray = lastWrongAnswersRef.current;
          if (lastWrongAnswersArray.length !== newWrongAnswersArray.length ||
              !lastWrongAnswersArray.every(id => newWrongAnswersArray.includes(id)) ||
              !newWrongAnswersArray.every(id => lastWrongAnswersArray.includes(id))) {
            lastWrongAnswersRef.current = newWrongAnswersArray;
            setWrongAnswers(new Set(newWrongAnswersArray));
          }
        }
        
        // Track question start when audio starts playing
        if (gameData.phase === 'question' && gameData.currentQuestion && !questionStartTimeRef.current) {
          questionStartTimeRef.current = Date.now();
          if (user && gameData.currentQuestion.id && gameData.currentCategory) {
            blindTestAnalytics.trackQuestionStart(
              id,
              gameData.currentQuestion.id,
              typeof gameData.currentCategory === 'string' ? gameData.currentCategory : gameData.currentCategory.id,
              gameData.currentRound
            );
          }
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, user, blindTestAnalytics]);

  useEffect(() => {
    if (game && (game.currentRound > game.totalRounds || game.phase === 'end')) {
      setIsGameOver(true);
      
      // Track game end (only once)
      if (gameStartTimeRef.current && user && !gameEndTrackedRef.current) {
        gameEndTrackedRef.current = true;
        const duration = (Date.now() - gameStartTimeRef.current) / 1000;
        const winnerId = Object.keys(scores).length > 0
          ? Object.keys(scores).reduce((a, b) => 
              (scores[a] || 0) > (scores[b] || 0) ? a : b
            )
          : undefined;
        blindTestAnalytics.trackGameEnd(
          id,
          game.totalRounds,
          duration,
          scores,
          winnerId
        );
      }
    } else {
      setIsGameOver(false);
      gameEndTrackedRef.current = false; // Reset if game restarts
    }
  }, [game, scores, user, id, blindTestAnalytics]);

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
        audioPaused: false,
        listeningUserId: null,
      });
      setAudioPaused(false);
      setListeningUserId(null);
      questionStartTimeRef.current = null; // Reset for new question
      
      // Track category selection
      blindTestAnalytics.trackCategorySelected(
        id,
        typeof category === 'string' ? category : category.id,
        typeof category === 'string' ? category : category.label,
        user.uid
      );
    } catch (error) {
      console.error('Erreur lors de la sélection de catégorie:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner la catégorie');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour arrêter la musique pour tous les joueurs
  const handleStopAudioForAll = async () => {
    if (!game || !user) return;

    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));

      await updateDoc(gameRef, {
        audioPaused: true,
        listeningUserId: user.uid,
      });

      setAudioPaused(true);
      setListeningUserId(user.uid);
      audioPauseTimeRef.current = Date.now();
      
      // Track audio pause
      const timeElapsed = questionStartTimeRef.current
        ? (Date.now() - questionStartTimeRef.current) / 1000
        : 0;
      if (game.currentQuestion?.id) {
        blindTestAnalytics.trackAudioPaused(
          id,
          user.uid,
          game.currentQuestion.id,
          timeElapsed
        );
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de la musique:', error);
    }
  };

  const handleAnswer = async (correct: boolean, playerId?: string) => {
    if (!game || !user || isProcessing) return;
    
    const answeringPlayerId = playerId || user.uid;
    const answeringPlayer = game.players.find(p => p.id === answeringPlayerId);
    
    setIsProcessing(true);
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));

      if (correct) {
        // Bonne réponse : afficher le modal et mettre à jour les scores
        const updatedScores = { ...scores };
        updatedScores[answeringPlayerId] = (updatedScores[answeringPlayerId] || 0) + 1;

        await updateDoc(gameRef, {
          scores: updatedScores,
          showCorrectAnswerModal: true,
          correctAnswerPlayer: answeringPlayerId,
          phase: 'correct-answer',
          wrongAnswers: [],
        });

        setScores(updatedScores);
        setShowCorrectAnswerModal(true);
        setCorrectAnswerPlayer(answeringPlayerId);
        setWrongAnswers(new Set());
        
        // Track correct answer
        const timeToAnswer = audioPauseTimeRef.current && questionStartTimeRef.current
          ? (audioPauseTimeRef.current - questionStartTimeRef.current) / 1000
          : 0;
        if (game.currentQuestion?.id) {
          blindTestAnalytics.trackCorrectAnswer(
            id,
            answeringPlayerId,
            game.currentQuestion.id,
            game.currentQuestion.answer || '',
            timeToAnswer,
            game.currentRound
          );
          blindTestAnalytics.trackVoiceRecognitionUsed(
            id,
            answeringPlayerId,
            game.currentQuestion.id,
            true
          );
        }
        questionStartTimeRef.current = null;
        audioPauseTimeRef.current = null;
      } else {
        // Mauvaise réponse : ajouter à la liste des mauvaises réponses et réinitialiser pour permettre à d'autres de répondre
        const newWrongAnswers = new Set(wrongAnswers);
        newWrongAnswers.add(answeringPlayerId);
        setWrongAnswers(newWrongAnswers);

        await updateDoc(gameRef, {
          wrongAnswers: Array.from(newWrongAnswers),
          audioPaused: false, // Relancer la musique pour permettre à d'autres de répondre
          listeningUserId: null, // Réinitialiser pour permettre à d'autres de cliquer
        });

        setAudioPaused(false);
        setListeningUserId(null);
        
        // Track wrong answer
        if (game.currentQuestion?.id) {
          blindTestAnalytics.trackWrongAnswer(
            id,
            answeringPlayerId,
            game.currentQuestion.id,
            'wrong_answer',
            game.currentRound
          );
          blindTestAnalytics.trackVoiceRecognitionUsed(
            id,
            answeringPlayerId,
            game.currentQuestion.id,
            false
          );
        }

        // Si tous les joueurs ont donné une mauvaise réponse, passer à la question suivante après 3 secondes
        if (newWrongAnswers.size >= game.players.length) {
          // Track question skipped
          if (game.currentQuestion?.id) {
            blindTestAnalytics.trackQuestionSkipped(
              id,
              game.currentQuestion.id,
              game.currentRound,
              newWrongAnswers.size
            );
          }
          setTimeout(async () => {
            await nextQuestion();
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la réponse:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer la réponse');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseCorrectAnswerModal = async () => {
    if (!game || !user) return;
    
    setShowCorrectAnswerModal(false);
    
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      await updateDoc(gameRef, {
        showCorrectAnswerModal: false,
        correctAnswerPlayer: null,
      });
      
      // Passer à la question suivante
      await nextQuestion();
    } catch (error) {
      console.error('Erreur lors de la fermeture du modal:', error);
    }
  };

  const nextQuestion = async () => {
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
          showCorrectAnswerModal: false,
          correctAnswerPlayer: null,
          wrongAnswers: [],
        });
        return;
      }

      // Passer au joueur suivant pour choisir la catégorie
      const currentIndex = game.players.findIndex((p) => p.id === game.currentPlayerId);
      const nextIndex = (currentIndex + 1) % game.players.length;
      const nextPlayer = game.players[nextIndex];

      if (!nextPlayer) {
        console.error('Aucun joueur suivant trouvé');
        return;
      }

      await updateDoc(gameRef, {
        currentRound: nextRound,
        currentPlayerId: nextPlayer.id,
        phase: 'category-selection',
        currentQuestion: null,
        currentCategory: null,
        audioPaused: false,
        listeningUserId: null,
        showCorrectAnswerModal: false,
        correctAnswerPlayer: null,
        wrongAnswers: [],
      });

      setIsPlaying(false);
      setAudioPaused(false);
      setListeningUserId(null);
      setWrongAnswers(new Set());
      questionStartTimeRef.current = null;
      audioPauseTimeRef.current = null;
    } catch (error) {
      console.error('Erreur lors du passage à la question suivante:', error);
      Alert.alert('Erreur', 'Impossible de passer à la question suivante');
    }
  };


  if (loading || isLoadingQuestions || loadingCategories) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[GRADIENT_START, GRADIENT_END]} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>{t('game.loading')}</Text>
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[GRADIENT_START, GRADIENT_END]} style={StyleSheet.absoluteFill} />
        <Text style={styles.errorText}>{t('game.blindtest.gameNotFound')}</Text>
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
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[GRADIENT_START, GRADIENT_END]} style={StyleSheet.absoluteFill} />
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {game.phase !== 'category-selection' && (
          <View style={styles.header}>
            <Text style={styles.title}>{t('game.blindtest.title')}</Text>
            <Text style={styles.subtitle}>
              {t('game.blindtest.round', { current: game.currentRound, total: game.totalRounds })}
            </Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>{t('game.blindtest.score', { score: playerScore })}</Text>
            </View>
          </View>
        )}

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
                  ? t('game.blindtest.chooseCategory')
                  : t('game.blindtest.categorySelectionInProgress')}
              </Text>
              <Text style={styles.cardEmoji}>🎄</Text>
            </View>

            {isCurrentPlayer && (
              <CategoryGrid
                categories={categories}
                onSelectCategory={handleCategorySelection}
                isProcessing={isProcessing}
              />
            )}

            {!isCurrentPlayer && (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  {t('game.blindtest.waitingForPlayer', { name: currentPlayer?.name || t('game.player') })}
                </Text>
              </View>
            )}
          </View>
        )}

        {game.phase === 'question' && game.currentQuestion && (
          <View style={styles.phaseContainer}>
            <BlindTestAudioPlayer
              audioUrl={game.currentQuestion.audioUrl}
              title={game.currentQuestion.text || game.currentQuestion.answer || t('game.blindtest.question')}
              category={categories.find((c) => c.id === game.currentCategory)?.label}
              categoryEmoji={categories.find((c) => c.id === game.currentCategory)?.emoji}
              currentRound={game.currentRound}
              totalRounds={game.totalRounds}
              onPlayStateChange={setIsPlaying}
              correctAnswer={game.currentQuestion.answer}
              onVoiceAnswer={(isCorrect: boolean) => {
                handleAnswer(isCorrect);
              }}
              gameId={id}
              currentUserId={user?.uid}
              isCurrentPlayer={true} // Permettre à tout le monde de répondre
              onStopAudioForAll={handleStopAudioForAll}
              audioPaused={audioPaused}
              listeningUserId={listeningUserId}
            />



            {/* Afficher qui a déjà répondu (mauvaises réponses) */}
            {wrongAnswers.size > 0 && (
              <View style={styles.wrongAnswersContainer}>
                <Text style={styles.wrongAnswersText}>
                  {wrongAnswers.size === game.players.length
                    ? t('game.blindtest.noOneFound')
                    : t('game.blindtest.playersAlreadyTried', { count: wrongAnswers.size })}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Modal de bonne réponse */}
        <Modal
          visible={showCorrectAnswerModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseCorrectAnswerModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.modalGradient}
              >
                <Text style={styles.modalEmoji}>🎉</Text>
                <Text style={styles.modalTitle}>{t('game.blindtest.correctAnswer')}</Text>
                {correctAnswerPlayer && (
                  <Text style={styles.modalPlayerName}>
                    {t('game.blindtest.playerFound', { name: game.players.find(p => p.id === correctAnswerPlayer)?.name || t('game.player') })}
                  </Text>
                )}
                <Text style={styles.modalAnswer}>
                  {game.currentQuestion?.answer || t('game.blindtest.correctAnswer')}
                </Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleCloseCorrectAnswerModal}
                >
                  <Text style={styles.modalButtonText}>{t('game.blindtest.continue')}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
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
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 6,
  },
  scoreContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  scoreLabel: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  phaseContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  categoriesGrid: {
    width: '100%',
    maxWidth: width - 32,
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 0,
  },
  categoryCardWrapper: {
    width: (width - 48) / 2, // 2 colonnes avec padding et gap
    marginBottom: 8,
  },
  categoryCard: {
    width: '100%',
    aspectRatio: 1.05,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  categoryCardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  categoryCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  categoryCardEmoji: {
    fontSize: 40,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  categoryCardLabel: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryCardDescription: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryCardDisabled: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  cardContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: width - 32,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  playerBadge: {
    backgroundColor: ACCENT_COLOR,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  playerName: {
    color: '#C62828',
    fontWeight: 'bold',
    fontSize: 16,
  },
  blindTestLabel: {
    color: ACCENT_COLOR,
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardQuestion: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    backgroundColor: ACCENT_COLOR,
    borderRadius: 3,
  },
  cardProgress: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
  },
  cardEmoji: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 8,
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
  wrongAnswersContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.4)',
  },
  wrongAnswersText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  modalGradient: {
    padding: 32,
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalPlayerName: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalAnswer: {
    fontSize: 24,
    color: '#FFD700',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modalButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

