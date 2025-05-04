import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Animated, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, onSnapshot, updateDoc, getDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GamePhase, Player } from '@/types/gameTypes';

interface FirebaseQuestion {
  text: {
    type: string;
    question: string;
    answer: string;
  };
  id: string;
  roundNumber: number;
  theme: string;
}

interface KnowOrDrinkGameState {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  targetPlayer: Player | null;
  currentQuestion: FirebaseQuestion | null;
  answers: any[];
  players: Player[];
  scores: Record<string, number>;
  theme: string;
  timer: number | null;
  currentUserState?: {
    isTargetPlayer: boolean;
    hasAnswered: boolean;
    hasVoted: boolean;
  };
  game?: {
    currentPhase: string;
    currentRound: number;
    totalRounds: number;
    scores: Record<string, number>;
    gameMode: string;
    hostId?: string;
  };
  currentPlayerId: string;
  playerAnswers: {
    [playerId: string]: {
      knows: boolean;
      answer: string;
      isAccused: boolean;
      accusedBy: string[];
    };
  };
  gameMode: 'points' | 'drinks';
  questions: FirebaseQuestion[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function KnowOrDrinkGame() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<KnowOrDrinkGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!id || !user) return;

    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));

    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as KnowOrDrinkGameState;
        console.log('📝 Données du jeu:', JSON.stringify(data, null, 2));
        console.log('❓ Question actuelle:', JSON.stringify(data.currentQuestion, null, 2));
        setGameState(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleKnow = async () => {
    if (!gameState || !user) return;
    setShowAnswerInput(true);
  };

  const handleSubmitAnswer = async () => {
    if (!gameState || !user || !answer.trim()) return;
    
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      await updateDoc(gameRef, {
        [`playerAnswers.${user.uid}`]: {
          knows: true,
          answer: answer.trim(),
          isAccused: false,
          accusedBy: []
        },
        [`currentUserState.${user.uid}.hasAnswered`]: true
      });
      setAnswer('');
      setShowAnswerInput(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre votre réponse');
    }
  };

  const handleDontKnow = async () => {
    if (!gameState || !user) return;
    
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      await updateDoc(gameRef, {
        [`playerAnswers.${user.uid}`]: {
          knows: false,
          answer: '',
          isAccused: false,
          accusedBy: []
        },
        [`currentUserState.${user.uid}.hasAnswered`]: true
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre votre réponse');
    }
  };

  const handleAccuse = async (targetPlayerId: string) => {
    if (!gameState || !user) return;
    
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      await updateDoc(gameRef, {
        [`playerAnswers.${targetPlayerId}.isAccused`]: true,
        [`playerAnswers.${targetPlayerId}.accusedBy`]: [...(gameState.playerAnswers[targetPlayerId]?.accusedBy || []), user.uid],
        [`currentUserState.${user.uid}.hasVoted`]: true
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre l\'accusation');
    }
  };

  const handleSkipAccuse = async () => {
    if (!gameState || !user) return;
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      await updateDoc(gameRef, {
        [`currentUserState.${user.uid}.hasVoted`]: true
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de valider votre choix');
    }
  };

  const calculateScore = (playerId: string) => {
    if (!gameState || !gameState.gameMode) return 0;
    const playerAnswer = gameState?.playerAnswers?.[playerId];
    if (!playerAnswer) return 0;

    if (gameState.gameMode === 'points') {
      if (playerAnswer.knows) {
        if (playerAnswer.isAccused) {
          return -1; // Perd 1 point si accusé à raison
        }
        return 1; // Gagne 1 point si sait la réponse
      } else {
        return 0; // 0 point si ne sait pas
      }
    } else { // Mode boisson
      if (playerAnswer.knows) {
        if (playerAnswer.isAccused) {
          return 2; // Boit 2 gorgées si accusé à raison
        }
        return 0; // Ne boit pas si sait la réponse
      } else {
        return 1; // Boit 1 gorgée si ne sait pas
      }
    }
  };

  const renderProgressBar = () => {
    if (!gameState) return null;
    const progress = gameState.totalRounds > 0 ? gameState.currentRound / gameState.totalRounds : 0;
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <Animated.View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${progress * 100}%`,
                backgroundColor: '#A259FF',
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Tour {gameState.currentRound}/{gameState.totalRounds}
        </Text>
      </View>
    );
  };

  const renderQuestionPhase = () => {
    if (!gameState || !gameState.currentQuestion) return null;

    return (
      <Animated.View 
        style={[
          styles.questionContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <LinearGradient
          colors={['#A259FF', '#C471F5']}
          style={styles.questionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.questionText}>
            {gameState.currentQuestion.text.question}
          </Text>
          
          {showAnswerInput ? (
            <View style={styles.answerInputContainer}>
              <TextInput
                style={styles.answerInput}
                value={answer}
                onChangeText={setAnswer}
                placeholder="Votre réponse..."
                placeholderTextColor="#C7B8F5"
                multiline
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitAnswer}
              >
                <Text style={styles.submitButtonText}>Valider</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.knowButton]}
                onPress={handleKnow}
              >
                <Text style={styles.buttonText}>Je sais</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.dontKnowButton]}
                onPress={handleDontKnow}
              >
                <Text style={styles.buttonText}>Je ne sais pas</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderAccusationPhase = () => (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.phaseTitle}>Accuse quelqu'un de mentir !</Text>
        <View style={styles.playersList}>
          {gameState?.players.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.playerCard,
                gameState.playerAnswers[player.id]?.knows && styles.playerCardKnows,
                player.id === user?.uid && styles.currentUserCard
              ]}
              onPress={() => handleAccuse(player.id)}
              disabled={player.id === user?.uid || gameState.currentUserState?.[user?.uid]?.hasVoted}
            >
              <Text style={styles.playerName}>{player.name}</Text>
              {gameState.playerAnswers[player.id]?.knows && (
                <Text style={styles.playerStatus}>Prétend savoir</Text>
              )}
              {gameState.playerAnswers[player.id]?.isAccused && gameState.playerAnswers[player.id]?.accusedBy && (
                <Text style={styles.accusationCount}>
                  Accusé par {gameState.playerAnswers[player.id]?.accusedBy?.length ?? 0} joueur(s)
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        {!gameState.currentUserState?.[user?.uid]?.hasVoted && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkipAccuse}>
            <LinearGradient colors={["#3D2956", "#A259FF"]} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Je ne veux accuser personne</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getPlayerStatus = (playerId: string) => {
    if (!gameState?.playerAnswers?.[playerId]) return 'waiting';
    const playerAnswer = gameState.playerAnswers[playerId];
    if (playerAnswer.knows) return 'knows';
    return 'dont-know';
  };

  const getAccuserStatus = (playerId: string) => {
    if (!gameState?.playerAnswers?.[playerId]) return 'waiting';
    const playerAnswer = gameState.playerAnswers[playerId];
    if (playerAnswer.isAccused) return 'accused';
    return 'not-accused';
  };

  const handleNextRound = async () => {
    if (!gameState || !user) return;
    
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      const nextRound = gameState.currentRound + 1;
      if (nextRound > gameState.totalRounds) {
        setIsEnd(true);
        return;
      }

      await updateDoc(gameRef, {
        currentRound: nextRound,
        phase: 'question',
        currentQuestion: null,
        playerAnswers: {},
        [`currentUserState.${user.uid}`]: {
          isTargetPlayer: false,
          hasAnswered: false,
          hasVoted: false
        }
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de passer au tour suivant');
    }
  };

  const allPlayersAnswered = () => {
    if (!gameState?.players) return false;
    return gameState.players.every(player => 
      gameState.playerAnswers?.[player.id]?.hasAnswered
    );
  };

  const allPlayersVoted = () => {
    if (!gameState?.players) return false;
    return gameState.players.every(player => 
      gameState.currentUserState?.[player.id]?.hasVoted
    );
  };

  const computeScores = () => {
    if (!gameState?.players) return {};
    const newScores = { ...gameState.scores };
    
    gameState.players.forEach(player => {
      const score = calculateScore(player.id);
      newScores[player.id] = (newScores[player.id] || 0) + score;
    });
    
    return newScores;
  };

  const renderEndScreen = () => (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.phaseTitle}>Fin de la partie !</Text>
        <Text style={styles.correctAnswer}>Merci d'avoir joué 🎉</Text>
        {/* On peut afficher ici le classement final, les scores, etc. */}
        {gameState?.players.map((player) => (
          <View key={player.id} style={styles.resultCard}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.scoreText}>{gameState.scores[player.id] || 0} points</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderResultsPhase = () => (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.phaseTitle}>Résultats</Text>
        <Text style={styles.correctAnswer}>
          Réponse correcte : {gameState?.currentQuestion?.text?.answer}
        </Text>
        {gameState?.players.map((player) => {
          const playerAnswer = gameState?.playerAnswers?.[player.id];
          const score = calculateScore(player.id);
          const status = getPlayerStatus(player.id);
          const accuser = getAccuserStatus(player.id);
          return (
            <View key={player.id} style={styles.resultCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[styles.statusIcon, { color: status.color }]}>{status.icon}</Text>
                <Text style={styles.playerName}>{player.name}</Text>
              </View>
              <Text style={styles.resultText}>
                {playerAnswer?.knows ? `A répondu : ${playerAnswer.answer}` : 'Ne savait pas'}
              </Text>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              {accuser && (
                <Text style={[styles.accuserText, { color: accuser.color }]}> 
                  {accuser.icon} {accuser.label} {accuser.target && `(contre ${gameState.players.find(p => p.id === accuser.target)?.name})`}
                </Text>
              )}
              {gameState?.gameMode === 'points' ? (
                <Text style={[styles.scoreText, score > 0 ? styles.positiveScore : score < 0 ? styles.negativeScore : null]}>
                  {score > 0 ? `+${score}` : score} point{score !== 1 ? 's' : ''}
                </Text>
              ) : (
                <Text style={styles.drinksText}>
                  {score} gorgée{score !== 1 ? 's' : ''} à boire
                </Text>
              )}
            </View>
          );
        })}
        <TouchableOpacity style={styles.nextButton} onPress={handleNextRound}>
          <LinearGradient colors={["#A259FF", "#C471F5"]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>
              {(gameState?.currentRound ?? 0) >= (gameState?.totalRounds ?? 0) ? 'Voir le classement final' : 'Tour suivant'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {
    if (!gameState || !user) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    if (gameState.phase === 'question' && allPlayersAnswered()) {
      updateDoc(gameRef, { phase: 'vote' });
    }
    if (gameState.phase === 'vote' && allPlayersVoted()) {
      updateDoc(gameRef, { phase: 'results' });
    }
  }, [gameState]);

  useEffect(() => {
    if (
      gameState &&
      gameState.phase === 'results' &&
      gameState.currentRound >= gameState.totalRounds &&
      id
    ) {
      router.replace(`/game/results/${id}`);
    }
  }, [gameState?.phase, gameState?.currentRound, gameState?.totalRounds, id]);

  useEffect(() => {
    if (!gameState || !user) return;
    if (gameState.phase === 'results') {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      const newScores = computeScores();
      updateDoc(gameRef, { scores: newScores });
    }
  }, [gameState?.phase]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.loadingText}>Chargement du jeu...</Text>
        </View>
      </View>
    );
  }

  if (!gameState) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.errorText}>Jeu non trouvé</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        style={styles.background}
      >
        {renderProgressBar()}
        {gameState?.phase === 'question' && renderQuestionPhase()}
        {gameState?.phase === 'accusation' && renderAccusationPhase()}
        {gameState?.phase === 'results' && renderResultsPhase()}
        {isEnd && renderEndScreen()}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'System',
    fontWeight: '600',
    lineHeight: 32,
    paddingHorizontal: 20,
  },
  answerContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 20,
  },
  answerInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    width: '100%',
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonContainer: {
    gap: 20,
    width: '100%',
    maxWidth: 400,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  phaseTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'System',
    fontWeight: '600',
  },
  playersList: {
    gap: 15,
    width: '100%',
    maxWidth: 400,
  },
  playerCard: {
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  playerCardKnows: {
    borderColor: '#A259FF',
    borderWidth: 2,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  playerStatus: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'System',
  },
  accusationCount: {
    color: '#FF9800',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'System',
  },
  resultCard: {
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 400,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 5,
    fontFamily: 'System',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    fontFamily: 'System',
  },
  positiveScore: {
    color: '#4CAF50',
  },
  negativeScore: {
    color: '#FF5252',
  },
  drinksText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#FF9800',
    fontFamily: 'System',
  },
  correctAnswer: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'System',
  },
  waitingText: {
    color: '#AAAAAA',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'System',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'System',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'System',
  },
  progressBarContainer: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    opacity: 0.7,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
    fontFamily: 'System',
  },
  accuserText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'System',
  },
  nextButton: {
    marginTop: 32,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  currentUserCard: {
    borderColor: '#C471F5',
    borderWidth: 2.5,
    shadowColor: '#C471F5',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  skipButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  questionContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  questionGradient: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  answerInputContainer: {
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#A259FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  knowButton: {
    backgroundColor: '#4CAF50',
  },
  dontKnowButton: {
    backgroundColor: '#F44336',
  },
}); 