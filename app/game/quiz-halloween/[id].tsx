import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GamePhase, Player } from '@/types/gameTypes';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuizHalloweenQuestions } from './questions';
import { TrapAnswer, TrapPlayerAnswer, TrapQuestion } from "@/types/types";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GameResults from '@/components/game/GameResults';
import { usePoints } from '@/hooks/usePoints';
import { useLanguage } from '@/contexts/LanguageContext';
import HalloweenDecorations from '@/components/HalloweenDecorations';

interface HalloweenQuizGameState {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  currentQuestion: TrapQuestion | null;
  questions: TrapQuestion[];
  askedQuestionIds: string[];
  playerAnswers: Record<string, TrapPlayerAnswer>;
  scores: Record<string, number>;
  players: Player[];
  history: Record<string, number[]>;
  gameMode: 'quiz-halloween';
  targetPlayer: Player | null;
  answers: Array<{
    id: string;
    text: string;
    playerId: string;
    playerName: string;
  }>;
  theme: string;
  timer: number | null;
}

export default function QuizHalloweenGame() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const gameId = typeof id === 'string' ? id : id?.[0] || '';
  const { user } = useAuth();
  const { gameState, updateGameState } = useGame<HalloweenQuizGameState>(gameId);
  const { awardGamePoints } = usePoints();
  const { isRTL, language } = useLanguage();

  // Utiliser le hook pour gérer les questions Halloween
  const { questions, getRandomQuestion } = useQuizHalloweenQuestions(gameState?.askedQuestionIds || []);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));
  const [timer, setTimer] = useState(15); // Timer de 15 secondes pour répondre
  const [canAnswer, setCanAnswer] = useState(true); // Peut répondre immédiatement
  const [currentScores, setCurrentScores] = useState<Record<string, number>>({});

  // Initialiser le jeu si nécessaire
  useEffect(() => {
    if (!gameState) {
      const initialState: HalloweenQuizGameState = {
        phase: 'waiting' as GamePhase,
        currentRound: 0,
        totalRounds: 10,
        currentQuestion: null,
        questions: [],
        askedQuestionIds: [],
        playerAnswers: {},
        scores: {},
        players: [],
        history: {},
        gameMode: 'quiz-halloween',
        targetPlayer: null,
        answers: [],
        theme: 'Halloween',
        timer: null,
      };
      updateGameState(initialState);
    }
  }, [gameState, updateGameState]);

  // Timer pour répondre à la question
  useEffect(() => {
    if (gameState?.currentQuestion && !selectedAnswer) {
      console.log('🎃 Timer démarré pour nouvelle question');
      setTimer(15);
      setCanAnswer(true);
      
      const timerInterval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            // Temps écoulé, vérifier si tous les joueurs ont répondu
            console.log('🎃 Temps écoulé - vérification des réponses');
            clearInterval(timerInterval);
            // Ne pas passer automatiquement, attendre que tous répondent
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(timerInterval);
    } else if (selectedAnswer) {
      console.log('🎃 Timer arrêté car réponse donnée');
    }
    return undefined;
  }, [gameState?.currentQuestion, selectedAnswer]);

  // Surveiller les changements dans playerAnswers pour vérifier si tous ont répondu
  useEffect(() => {
    if (gameState?.playerAnswers && gameState?.players && gameState?.currentQuestion) {
      const totalPlayers = gameState.players.length;
      const answeredPlayers = Object.keys(gameState.playerAnswers).length;
      
      // Éviter le spam - seulement log si le nombre de réponses change
      if (answeredPlayers !== (gameState as any)._lastAnsweredCount) {
        console.log('🎃 Surveillance des réponses - Joueurs:', totalPlayers, 'Réponses:', answeredPlayers);
        (gameState as any)._lastAnsweredCount = answeredPlayers;
      }
      
      if (answeredPlayers >= totalPlayers && answeredPlayers > 0 && !(gameState as any)._allAnswered) {
        console.log('🎃 Tous les joueurs ont répondu - passage automatique à la question suivante');
        (gameState as any)._allAnswered = true;
        // Attendre 3 secondes pour que tout le monde voie le résultat
        setTimeout(() => {
          handleNextQuestion(gameState.scores);
        }, 3000);
      }
    }
  }, [gameState?.playerAnswers]);

  // Fonction pour vérifier si tous les joueurs ont répondu
  const checkAllPlayersAnswered = (currentState: any) => {
    if (!currentState || !currentState.players || !currentState.playerAnswers) return;
    
    const totalPlayers = currentState.players.length;
    const answeredPlayers = Object.keys(currentState.playerAnswers).length;
    
    console.log('🎃 Vérification des réponses - Joueurs:', totalPlayers, 'Réponses:', answeredPlayers);
    
    if (answeredPlayers >= totalPlayers) {
      console.log('🎃 Tous les joueurs ont répondu - passage à la question suivante');
      // Attendre 3 secondes pour que tout le monde voie le résultat
      setTimeout(() => {
        handleNextQuestion(currentState.scores);
      }, 3000);
    } else {
      console.log('🎃 En attente des autres joueurs...');
    }
  };

  // Fonction pour passer à la question suivante
  const handleNextQuestion = (updatedScores?: Record<string, number>) => {
    if (!gameState) return;
    
    const scoresToUse = updatedScores || gameState.scores;
    console.log('🎃 handleNextQuestion - currentRound:', gameState.currentRound, 'totalRounds:', gameState.totalRounds);
    console.log('🎃 Scores reçus:', updatedScores);
    console.log('🎃 Scores gameState:', gameState.scores);
    console.log('🎃 Scores utilisés:', scoresToUse);
    
    if (gameState.currentRound < gameState.totalRounds) {
      const nextRoundState = {
        ...gameState,
        currentRound: gameState.currentRound + 1,
        scores: scoresToUse,
      };
      console.log('🎃 Passage à la question suivante - nouveau round:', nextRoundState.currentRound);
      updateGameState(nextRoundState);
      startNewQuestion();
    } else {
      // Fin du jeu
      console.log('🎃 Fin du jeu atteinte');
      const finalState = {
        ...gameState,
        phase: 'end' as GamePhase,
        scores: scoresToUse,
      };
      updateGameState(finalState);
      
      // Attribuer des points
      awardGamePoints(gameId, 'quiz-halloween', gameState.players, scoresToUse);
    }
  };

  // Démarrer une nouvelle question
  const startNewQuestion = () => {
    const newQuestion = getRandomQuestion();
    if (newQuestion && gameState) {
      const updatedState = {
        ...gameState,
        currentQuestion: newQuestion,
        askedQuestionIds: [...gameState.askedQuestionIds, newQuestion.id],
        playerAnswers: {},
        phase: 'playing' as GamePhase,
        _allAnswered: false, // Réinitialiser le flag pour la nouvelle question
      };
      updateGameState(updatedState);
      setSelectedAnswer(null);
      setShowResult(false);
      setCanAnswer(true);
      setTimer(15);
    }
  };

  // Soumettre une réponse
  const submitAnswer = (answerText: string) => {
    if (!gameState?.currentQuestion || !user || !gameState.currentQuestion.answers || !canAnswer || selectedAnswer) return;

    console.log('🎃 Réponse soumise:', answerText);
    setSelectedAnswer(answerText);
    const isCorrect = gameState.currentQuestion.answers.find(a => a.text === answerText)?.isCorrect || false;
    setIsAnswerCorrect(isCorrect);

    // Animation Halloween
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Mettre à jour le score
    const currentScore = gameState.scores[user.uid] || 0;
    const newScore = isCorrect ? currentScore + 1 : currentScore;
    
    console.log('🎃 Score - Réponse correcte:', isCorrect, 'Score actuel:', currentScore, 'Nouveau score:', newScore);

    const updatedState = {
      ...gameState,
      scores: {
        ...gameState.scores,
        [user.uid]: newScore,
      },
      playerAnswers: {
        ...gameState.playerAnswers,
        [user.uid]: {
          answer: answerText,
          isCorrect,
          isTrap: !isCorrect,
          timestamp: Date.now(),
        },
      },
    };

    updateGameState(updatedState);
    setShowResult(true);

    console.log('🎃 Réponse enregistrée, en attente des autres joueurs...');
  };

  if (!gameState) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#2D1810', '#8B4513', '#D2691E']}
          style={styles.background}
        >
          <Text style={styles.loadingText}>🎃 Chargement du Quiz Halloween... 🎃</Text>
        </LinearGradient>
      </View>
    );
  }

  if (gameState.phase === 'waiting') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#2D1810', '#8B4513', '#D2691E']}
          style={styles.background}
        >
          <HalloweenDecorations />
          <View style={styles.waitingContainer}>
            <Text style={styles.title}>🎃 QUIZ HALLOWEEN 🎃</Text>
            <Text style={styles.subtitle}>Testez vos connaissances effrayantes !</Text>
            <TouchableOpacity style={styles.startButton} onPress={startNewQuestion}>
              <LinearGradient
                colors={['#FF8C00', '#FF4500', '#DC143C']}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Commencer le Quiz 🕷️</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (gameState.phase === 'end') {
    return (
      <GameResults
        players={gameState.players}
        scores={gameState.scores}
        userId={user?.uid || ''}
        colors={['#2D1810', '#8B4513', '#D2691E']}
      />
    );
  }

  const currentQuestion = gameState.currentQuestion;
  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#2D1810', '#8B4513', '#D2691E']}
          style={styles.background}
        >
          <Text style={styles.loadingText}>🎃 Plus de questions disponibles... 🎃</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2D1810', '#8B4513', '#D2691E']}
        style={styles.background}
      >
        <HalloweenDecorations />
        
        {/* Header avec score et round */}
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>
              {gameState.scores[user?.uid || ''] || 0} 🎃
            </Text>
          </View>
          <View style={styles.roundContainer}>
            <Text style={styles.roundText}>
              Question {gameState.currentRound + 1}/{gameState.totalRounds}
            </Text>
          </View>
        </View>

        {/* Question */}
        <Animated.View 
          style={[
            styles.questionContainer,
            {
              transform: [{
                scale: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05],
                }),
              }],
            },
          ]}
        >
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </Animated.View>

        {/* Timer pour répondre */}
        {!selectedAnswer && (
          <View style={styles.timerContainer}>
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{timer}</Text>
            </View>
            <Text style={styles.timerLabel}>Temps pour répondre</Text>
          </View>
        )}

        {/* Réponses */}
        <View style={styles.answersContainer}>
          {currentQuestion.answers && currentQuestion.answers.length > 0 ? currentQuestion.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer.text;
            const showCorrectness = showResult && isSelected;
            
            let buttonColors = ['#8B4513', '#A0522D'];
            let borderColor = '#D2691E';
            
            if (showResult) {
              if (answer.isCorrect) {
                buttonColors = ['#228B22', '#32CD32'];
                borderColor = '#00FF00';
              } else if (isSelected && !answer.isCorrect) {
                buttonColors = ['#DC143C', '#B22222'];
                borderColor = '#FF0000';
              }
            }

            return (
              <TouchableOpacity
                key={index}
                style={[styles.answerButton, { borderColor }]}
                onPress={() => !selectedAnswer && submitAnswer(answer.text)}
                disabled={!!selectedAnswer}
              >
                <LinearGradient
                  colors={buttonColors as [string, string, ...string[]]}
                  style={styles.answerButtonGradient}
                >
                  <Text style={styles.answerText}>{answer.text}</Text>
                  {showCorrectness && (
                    <MaterialCommunityIcons
                      name={answer.isCorrect ? "check-circle" : "close-circle"}
                      size={24}
                      color="#FFF"
                      style={styles.resultIcon}
                    />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          }) : (
            <View style={styles.noAnswersContainer}>
              <Text style={styles.noAnswersText}>🎃 Aucune réponse disponible 🎃</Text>
            </View>
          )}
        </View>

        {/* Message de résultat */}
        {showResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              {isAnswerCorrect ? '🎉 Correct ! 🎉' : '💀 Incorrect ! 💀'}
            </Text>
            <Text style={styles.resultSubtext}>
              {isAnswerCorrect 
                ? 'Vous connaissez bien Halloween !' 
                : 'Les esprits vous jouent des tours...'
              }
            </Text>
          </View>
        )}
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
    padding: 20,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  scoreLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roundContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  roundText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionContainer: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  questionText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  answersContainer: {
    flex: 1,
  },
  answerButton: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  answerButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  resultIcon: {
    marginLeft: 10,
  },
  resultContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 15,
  },
  resultText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultSubtext: {
    color: '#FFD700',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noAnswersContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 15,
  },
  noAnswersText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingVertical: 20,
  },
  timerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 140, 0, 0.2)',
    borderWidth: 3,
    borderColor: '#FF8C00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timerText: {
    color: '#FF8C00',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  timerLabel: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
