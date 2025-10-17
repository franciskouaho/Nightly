import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Platform, Alert } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GamePhase, Player, GameState, GameMode } from '@/types/gameTypes';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useWordGuessingQuestions, WordGuessingQuestion } from '@/hooks/word-guessing-questions';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import GameResults from '@/components/game/GameResults';
import { usePoints } from '@/hooks/usePoints';
import { useLanguage } from '@/contexts/LanguageContext';

interface WordGuessingGameState extends Omit<GameState, 'currentQuestion' | 'answers'> {
  currentQuestion: WordGuessingQuestion | null;
  answers: Array<{
    id: string;
    text: string;
    playerId: string;
    playerName: string;
  }>;
  questions: WordGuessingQuestion[];
  askedQuestionIds: string[];
  playerAnswers: Record<string, string>;
  history: Record<string, number[]>;
  gameMode: GameMode;
  host: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const TimerCircle = ({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) => {
  const yellowCircleRadius = 26; // Rayon du cercle jaune solide
  const progressStrokeWidth = 8; // Épaisseur de la barre de progression verte

  // Rayon où le centre de la barre de progression verte se situe
  const progressCircleRadius = yellowCircleRadius + progressStrokeWidth / 2; // 26 + 4 = 30

  // Dimensions totales du SVG pour englober le cercle jaune et l'épaisseur de la bordure verte
  const svgDimension = (yellowCircleRadius + progressStrokeWidth) * 2; // (26 + 8) * 2 = 68
  const centerX = svgDimension / 2; // 34
  const centerY = svgDimension / 2; // 34

  const circumference = 2 * Math.PI * progressCircleRadius;
  const animatedProgress = useRef(new Animated.Value(timeLeft / totalTime)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: timeLeft / totalTime,
      duration: 500, // Durée de l'animation en ms
      useNativeDriver: true,
    }).start();
  }, [timeLeft, totalTime]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0], // De cercle caché à cercle complet
  });

  const progressColor = '#4CAF50'; // Couleur verte pour la progression
  const backgroundColor = '#FFD700'; // Couleur jaune pour l'arrière-plan du cercle

  return (
    <View style={styles.timerContainer}>
      <Svg width={svgDimension} height={svgDimension} style={styles.svgCentered}> 
        {/* Cercle d'arrière-plan (jaune plein) */} 
        <Circle
          fill={backgroundColor}
          cx={centerX}
          cy={centerY}
          r={yellowCircleRadius}
        />
        {/* Arc de progression (vert) */} 
        <AnimatedCircle
          stroke={progressColor}
          fill="transparent"
          cx={centerX}
          cy={centerY}
          r={progressCircleRadius}
          strokeWidth={progressStrokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" // Bords arrondis pour la progression
          transform={`rotate(-90 ${centerX} ${centerY})`}
        />
      </Svg>
      <Text style={styles.timerText}>{timeLeft}s</Text>
    </View>
  );
};

export default function WordGuessingGame() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { gameState, updateGameState } = useGame<WordGuessingGameState>(String(id));
  const { questions, getRandomQuestion, resetAskedQuestions, askedQuestions } = useWordGuessingQuestions();
  const { awardGamePoints } = usePoints();
  const gameStartTime = useRef(Date.now());
  const { isRTL, language } = useLanguage();

  const handleQuit = () => {
    Alert.alert(
      t('game.quit.title', 'Quitter le jeu'),
      t('game.quit.message', 'Êtes-vous sûr de vouloir quitter la partie ?'),
      [
        {
          text: t('game.quit.cancel', 'Annuler'),
          style: 'cancel',
        },
        {
          text: t('game.quit.confirm', 'Quitter'),
          onPress: () => router.push('/(tabs)'),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  // Timer pour la barre de temps (UI only)
  const TIMER_DURATION = 30; // secondes
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Passage automatique au tour suivant après 3 secondes si tous les joueurs ont répondu
  useEffect(() => {
    if (
      gameState?.phase === GamePhase.QUESTION &&
      gameState?.players?.length > 0 &&
      Object.keys(gameState?.playerAnswers || {}).length === gameState?.players?.length
    ) {
      const timeout = setTimeout(() => {
        nextQuestion();
      }, 2500);
      return () => clearTimeout(timeout);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [gameState?.phase, gameState?.playerAnswers, gameState?.players]);

  // Log pour inspecter gameState dès qu'il change
  useEffect(() => {
    if (gameState) {
      console.log('[DEBUG GAME STATE]', JSON.stringify(gameState));
      console.log('[DEBUG GAME STATE] History:', JSON.stringify(gameState.history));
      console.log('[DEBUG GAME STATE] Current Round:', gameState.currentRound);
    }
  }, [gameState]);

  // Charger la première question lorsque les questions sont disponibles
  useEffect(() => {
    console.log('[DEBUG] Checking first question conditions:', {
      hasGameState: !!gameState,
      hasCurrentQuestion: !!gameState?.currentQuestion,
      questionsLength: questions.length,
      gameStatePhase: gameState?.phase
    });

    if (!gameState ||
        !questions.length || // Check if questions are loaded
        gameState.phase !== GamePhase.QUESTION ||
        (gameState.currentQuestion && gameState.currentQuestion.word && (gameState.currentQuestion.forbiddenWords?.length ?? 0) > 0)) { // Only set a new question if currentQuestion is null/undefined or incomplete
      return;
    }

    const firstQuestion = getRandomQuestion();
    console.log('[DEBUG] First question selected:', firstQuestion);

    if (firstQuestion) {
      const initialPlayersHistory = gameState.players.reduce((acc: { [playerId: string]: number[] }, player: Player) => {
        acc[player.id] = Array(gameState.totalRounds || 5).fill(0);
        return acc;
      }, {});

      // Sélectionner aléatoirement le joueur qui fera deviner (targetPlayer)
      const randomTargetPlayer = gameState.players[Math.floor(Math.random() * gameState.players.length)];

      console.log('[DEBUG] Updating game state with first question:', firstQuestion);
      updateGameState({
        currentQuestion: firstQuestion,
        askedQuestionIds: [firstQuestion.id],
        phase: GamePhase.QUESTION,
        currentRound: 1,
        history: initialPlayersHistory,
        playerAnswers: {},
        gameMode: 'word-guessing' as GameMode,
        targetPlayer: randomTargetPlayer
      });
    } else {
      console.log('[DEBUG] No first question available, ending game');
      updateGameState({ phase: GamePhase.END });
    }
  }, [gameState?.phase, questions, gameState?.players, gameState?.totalRounds, getRandomQuestion, updateGameState]);

  // Effet pour gérer le timer
  useEffect(() => {
    
    if (gameState?.phase === GamePhase.QUESTION) {
      setTimeLeft(TIMER_DURATION);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState?.phase, gameState?.currentQuestion?.id]);

  // Self-correction for incomplete currentQuestion (NEW EFFECT)
  useEffect(() => {
    if (gameState?.phase === GamePhase.QUESTION && gameState.currentQuestion) {
      // Déferre la self-correction tant que les questions ne sont pas chargées.
      if (questions.length === 0) {
        return; 
      }

      const isComplete = gameState.currentQuestion.word && (gameState.currentQuestion.forbiddenWords?.length ?? 0) > 0;
      if (!isComplete) {
        const newQuestion = getRandomQuestion();
        if (newQuestion) {
          updateGameState({ currentQuestion: newQuestion });
        } else {
          updateGameState({ phase: GamePhase.END });
        }
      }
    }
  }, [gameState?.currentQuestion?.id, gameState?.currentQuestion?.word, gameState?.currentQuestion?.forbiddenWords, gameState?.phase, getRandomQuestion, updateGameState, questions.length]);

  // Passer à la question suivante quand le timer arrive à zéro
  useEffect(() => {
    if (gameState?.phase === GamePhase.QUESTION && timeLeft === 0) {
      // Pénalité de points pour le joueur qui fait deviner quand le temps est écoulé
      if (gameState?.targetPlayer) {
        const newScores = {
          ...gameState.scores,
          [gameState.targetPlayer.id]: (gameState.scores[gameState.targetPlayer.id] || 0) - 1
        };

        // Mettre à jour l'historique
        const newHistory = {
          ...gameState.history,
          [gameState.targetPlayer.id]: [
            ...(gameState.history[gameState.targetPlayer.id] || []),
            -1
          ]
        };

        updateGameState({
          scores: newScores,
          history: newHistory
        });
      }
      nextQuestion();
    }
  }, [gameState?.phase, timeLeft]);

  useEffect(() => {
    if (!gameState || !user) return;

    if (gameState.phase === GamePhase.END) {
      const gameDuration = Date.now() - gameStartTime.current;
      const userScore = gameState.scores[user.uid] || 0;

      // Track la fin du jeu
      if (id) {
        awardGamePoints(
          String(id),
          'word-guessing' as GameMode,
          gameState.players,
          gameState.scores
        );
      }
    }
  }, [gameState?.phase, id, user, awardGamePoints]);

  const calculateScore = (answer: string, question: WordGuessingQuestion): number => {
    // Vérifier si la réponse contient un mot interdit
    const hasForbiddenWord = (question.forbiddenWords ?? []).some(word => 
      answer.toLowerCase().includes(word.toLowerCase())
    );
    
    if (hasForbiddenWord) return -1;
    
    // Vérifier si la réponse contient le mot à deviner
    const hasCorrectWord = answer.toLowerCase().includes(question.word.toLowerCase());
    if (hasCorrectWord) return 1;
    
    return 0;
  };

  const nextQuestion = () => {
    // Vérifier si on a atteint le nombre maximum de rounds
    if ((gameState?.currentRound ?? 0) >= (gameState?.totalRounds || 5)) {
      updateGameState({ phase: GamePhase.END });
      return;
    }

    // Sélectionner une nouvelle question aléatoire
    const nextQ = getRandomQuestion();

    if (nextQ) {
      // Sélectionner un nouveau joueur cible pour le prochain tour (exclure le joueur actuel)
      const availablePlayers = gameState?.players.filter(p => p.id !== gameState?.targetPlayer?.id) || [];
      const nextTargetPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];

      // Réinitialiser le timer
      setTimeLeft(TIMER_DURATION);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const nextRound = (gameState?.currentRound ?? 0) + 1;
      // Vérifier si le prochain round ne dépasse pas le nombre total de rounds
      if (nextRound > (gameState?.totalRounds || 5)) {
        updateGameState({ phase: GamePhase.END });
        return;
      }

      updateGameState({
        currentQuestion: nextQ,
        askedQuestionIds: [...(gameState?.askedQuestionIds || []), nextQ.id].filter((id): id is string => !!id),
        playerAnswers: {},
        phase: GamePhase.QUESTION,
        currentRound: nextRound,
        targetPlayer: nextTargetPlayer
      });
    } else {
      updateGameState({ phase: GamePhase.END });
    }
  };

  const handleAnswer = (answer: string) => {
    if (!gameState?.currentQuestion || !user) return;

    // Arrêter le timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const score = calculateScore(answer, gameState.currentQuestion);
    
    // Mettre à jour les réponses des joueurs
    const newPlayerAnswers = {
      ...gameState.playerAnswers,
      [user.uid]: answer
    };

    // Mettre à jour les scores
    const newScores = {
      ...gameState.scores,
      [user.uid]: (gameState.scores[user.uid] || 0) + score
    };

    // Mettre à jour l'historique
    const newHistory = {
      ...gameState.history,
      [user.uid]: [
        ...(gameState.history[user.uid] || []),
        score
      ]
    };

    // Vérifier si on a atteint le nombre maximum de rounds
    const nextRound = (gameState.currentRound || 0) + 1;
    if (nextRound > (gameState.totalRounds || 5)) {
      updateGameState({ 
        phase: GamePhase.END,
        playerAnswers: newPlayerAnswers,
        scores: newScores,
        history: newHistory
      });
      return;
    }

    // Sélectionner une nouvelle question
    const nextQ = getRandomQuestion();
    if (!nextQ) {
      updateGameState({ 
        phase: GamePhase.END,
        playerAnswers: newPlayerAnswers,
        scores: newScores,
        history: newHistory
      });
      return;
    }

    // Sélectionner un nouveau joueur cible pour le prochain tour (exclure le joueur actuel)
    const availablePlayers = gameState.players.filter(p => p.id !== gameState.targetPlayer?.id) || [];
    const nextTargetPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];

    // Mettre à jour l'état avec la nouvelle question et le nouveau joueur cible
    updateGameState({
      currentQuestion: nextQ,
      askedQuestionIds: [...(gameState.askedQuestionIds || []), nextQ.id].filter((id): id is string => !!id),
      playerAnswers: newPlayerAnswers,
      scores: newScores,
      history: newHistory,
      phase: GamePhase.QUESTION,
      currentRound: nextRound,
      targetPlayer: nextTargetPlayer
    });

    // Réinitialiser le timer
    setTimeLeft(TIMER_DURATION);
  };

  const handleEndGame = async () => {
    if (!gameState || !user) return;

    // Attribuer les points aux joueurs
    const points = Object.entries(gameState.scores).reduce((acc, [playerId, score]) => {
      acc[playerId] = Math.max(0, score); // Pas de points négatifs
      return acc;
    }, {} as Record<string, number>);

    try {
      await awardGamePoints(
        String(id),
        'word-guessing' as GameMode,
        gameState.players,
        points
      );
      router.replace('/');
    } catch (error) {
      console.error('Erreur lors de la fin du jeu:', error);
    }
  };

  const handleNextRound = async () => {
    if (!gameState || !user) return;

    if (gameState.phase === GamePhase.END || gameState.currentRound >= (gameState.totalRounds || 5)) {
      handleEndGame();
      return;
    }

    // Vérifier si toutes les questions ont été posées
    if (askedQuestions.length >= questions.length) {
      resetAskedQuestions(); // Réinitialiser les questions posées
    }

    const nextQ = getRandomQuestion();

    if (!nextQ) {
      console.error("Aucune nouvelle question disponible.");
      handleEndGame(); // Fin du jeu si plus de questions
      return;
    }

    // Déterminer le joueur cible pour la prochaine question
    const players = gameState.players;
    const currentPlayerIndex = players.findIndex(p => p.id === gameState.targetPlayer?.id);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const nextTargetPlayer = players[nextPlayerIndex];

    updateGameState({
      currentQuestion: nextQ,
      askedQuestionIds: [...gameState.askedQuestionIds, nextQ.id],
      playerAnswers: {},
      phase: GamePhase.QUESTION,
      currentRound: (gameState.currentRound || 0) + 1,
      targetPlayer: nextTargetPlayer,
      timer: null,
    });
  };

  const getPlayerScore = (playerId: string) => gameState?.scores?.[playerId] || 0;

  const getUserIsHost = user?.uid === gameState?.host;
  const isCurrentUserTarget = user?.uid === gameState?.targetPlayer?.id;

  const currentQuestionText = gameState?.currentQuestion?.translations?.[language]?.word || gameState?.currentQuestion?.word || '';
  const currentForbiddenWords = gameState?.currentQuestion?.forbiddenWords ?? [];

  const isLoading = !gameState || !gameState.currentQuestion || questions.length === 0 || !currentQuestionText || currentForbiddenWords.length === 0;

  if (!gameState) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('game.loading', 'Chargement...')}</Text>
      </View>
    );
  }

  if (gameState.phase === GamePhase.END) {
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity onPress={handleQuit} style={styles.quitButton}>
          <Ionicons name="close-circle" size={32} color="white" />
        </TouchableOpacity>
        <GameResults
          players={gameState.players}
          scores={gameState.scores}
          userId={user?.uid || ''}
          pointsConfig={{ firstPlace: 25, secondPlace: 15, thirdPlace: 10 }}
        />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]} style={styles.container}>
      <TouchableOpacity onPress={handleQuit} style={styles.quitButton}>
        <View style={styles.quitButtonBackground}>
          <Ionicons name="close" size={20} color="white" />
        </View>
      </TouchableOpacity>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.roundContainer}>
            <View style={styles.roundBadge}>
              <Text style={styles.roundNumber}>{gameState?.currentRound || 1}</Text>
              <Text style={styles.roundSeparator}>/</Text>
              <Text style={styles.roundTotal}>{gameState?.totalRounds || 5}</Text>
            </View>
            <Text style={styles.roundLabel}>Tour</Text>
          </View>
          
          <View style={styles.timerSection}>
            <TimerCircle timeLeft={timeLeft} totalTime={TIMER_DURATION} />
            <Text style={styles.timerLabel}>Temps</Text>
          </View>
          
          <View style={styles.scoreSection}>
            <View style={styles.scoreBadge}>
              <MaterialCommunityIcons name="star-four-points" size={18} color="#FFD700" />
              <Text style={styles.scoreText}>{getPlayerScore(user?.uid || '')}</Text>
            </View>
            <Text style={styles.scoreLabel}>Points</Text>
          </View>
        </View>
      </View>

      {/* Contenu principal du jeu (mot à deviner et mots interdits) */}
      {isCurrentUserTarget ? (
        <>
          <View style={styles.questionContainer}>
            {/* Message pour le joueur qui fait deviner */}
            {isCurrentUserTarget && gameState?.targetPlayer && (
              <Text style={styles.targetPlayerText}>
                {t('game.word_guessing.targetPlayer', { player: gameState.targetPlayer.displayName || gameState.targetPlayer.username })}
              </Text>
            )}
            {/* Le mot à deviner (visible uniquement pour le joueur qui fait deviner) */}
            {isCurrentUserTarget && (
              <Text style={styles.wordToGuess}>{currentQuestionText}</Text>
            )}
          </View>

          <View style={styles.forbiddenWordsContainer}>
            <Text style={styles.forbiddenWordsTitle}>
              {t('game.word_guessing.forbiddenWords')}:
            </Text>
            {currentForbiddenWords && Array.isArray(currentForbiddenWords) && currentForbiddenWords.map((word, index) => (
              <Text key={index} style={styles.forbiddenWord}>
                {word}
              </Text>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.guesserContainer}>
          <Text style={styles.guesserInstructions}>
            {t('game.word_guessing.guesserInstructions')}
          </Text>
          <Text style={styles.guesserInfo}>
            {t('game.word_guessing.guesserInfo')}
          </Text>
        </View>
      )}

      {/* Boutons d'action pour le joueur qui fait deviner */}
      {isCurrentUserTarget && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.foundButton]}
            onPress={() => handleAnswer('found')}
          >
            <Text style={styles.buttonText}>{t('game.word_guessing.found')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.forbiddenButton]}
            onPress={() => handleAnswer('forbidden')}
          >
            <Text style={styles.buttonText}>{t('game.word_guessing.forbidden')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  roundContainer: {
    alignItems: 'center',
    flex: 1,
  },
  roundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.3)',
  },
  roundNumber: {
    color: '#8A2BE2',
    fontSize: 20,
    fontWeight: 'bold',
  },
  roundSeparator: {
    color: '#8A2BE2',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  roundTotal: {
    color: '#8A2BE2',
    fontSize: 16,
    fontWeight: '600',
  },
  roundLabel: {
    color: '#B0B0B0',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerSection: {
    alignItems: 'center',
    flex: 1,
  },
  timerContainer: {
    position: 'relative',
    width: 68,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgCentered: { 
    position: 'absolute',
  },
  timerText: {
    position: 'absolute',
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  timerLabel: {
    color: '#B0B0B0',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreSection: {
    alignItems: 'center',
    flex: 1,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  scoreText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  scoreLabel: {
    color: '#B0B0B0',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  targetPlayerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  wordToGuess: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  forbiddenWordsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  forbiddenWordsTitle: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 10,
  },
  forbiddenWord: {
    color: '#ff6b6b',
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginVertical: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 25,
    margin: 10,
    minWidth: 150,
    alignItems: 'center',
    flex: 1,
  },
  foundButton: {
    backgroundColor: '#4CAF50',
  },
  forbiddenButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  guesserContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  guesserInstructions: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  guesserInfo: {
    color: '#fff',
    fontSize: 16,
  },
  quitButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60,
    right: 20,
    zIndex: 10,
  },
  quitButtonBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
}); 