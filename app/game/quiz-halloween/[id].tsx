import GameResults from '@/components/game/GameResults';
import HalloweenDecorations from '@/components/HalloweenDecorations';
import Colors from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuizHalloweenQuestions } from '@/hooks/quiz-halloween-questions';
import { useGame } from '@/hooks/useGame';
import { useInAppReview } from '@/hooks/useInAppReview';
import { usePoints } from '@/hooks/usePoints';
import { GamePhase, Player } from '@/types/gameTypes';
import { TrapPlayerAnswer, TrapQuestion } from "@/types/types";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

export default function QuizHalloweenGameOptimized() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const gameId = typeof id === 'string' ? id : id?.[0] || '';
  const { user } = useAuth();
  const { gameState, updateGameState, updatePlayerAnswers } = useGame<HalloweenQuizGameState>(gameId);
  const { awardGamePoints } = usePoints();
  const { isRTL, language } = useLanguage();

  // Contrôle pour AppReview persistant
  const { requestReview } = useInAppReview();
  useEffect(() => {
    const checkAndAskReview = async () => {
      const alreadyAsked = await AsyncStorage.getItem('hasAskedReview');
      if (gameState?.phase === 'end' && !alreadyAsked) {
        await requestReview();
        await AsyncStorage.setItem('hasAskedReview', 'true');
      }
    };
    checkAndAskReview();
  }, [gameState?.phase, requestReview]);

  // Utiliser le hook pour gérer les questions Halloween
  const { questions, getRandomQuestion } = useQuizHalloweenQuestions(gameState?.askedQuestionIds || []);

  // États locaux optimisés
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));
  const [timer, setTimer] = useState(15);
  const [canAnswer, setCanAnswer] = useState(true);

  // Scores locaux - seulement mis à jour localement, sauvegardés à la fin
  const [localScores, setLocalScores] = useState<Record<string, number>>(() =>
    gameState?.scores || {}
  );

  // Initialiser le jeu si nécessaire
  useEffect(() => {
    if (!gameState) {
      const initialState: HalloweenQuizGameState = {
        phase: 'waiting' as GamePhase,
        currentRound: 1, // Commencer à la question 1
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

  // Synchroniser les scores locaux avec gameState
  // Synchronisation des scores avec useMemo pour éviter les re-renders
  const firebaseScores = useMemo(() => gameState?.scores || {}, [gameState?.scores]);
  const lastSyncedScores = useRef<string>('');

  useEffect(() => {
    const scoresKey = JSON.stringify(firebaseScores);
    if (Object.keys(firebaseScores).length > 0 && scoresKey !== lastSyncedScores.current) {
      lastSyncedScores.current = scoresKey;

      setLocalScores(prevScores => {
        // Utiliser les scores de Firebase comme source de vérité
        const mergedScores = { ...firebaseScores };
        Object.keys(prevScores).forEach(userId => {
          // Si le score local est plus élevé, le garder (cas où la mise à jour Firebase n'a pas encore eu lieu)
          if ((prevScores[userId] || 0) > (firebaseScores[userId] || 0)) {
            mergedScores[userId] = prevScores[userId] || 0;
          }
        });

        console.log('🎃 Synchronisation scores:', { firebaseScores, prevScores, mergedScores });
        return mergedScores;
      });
    }
  }, [firebaseScores]);

  // Fonction optimisée pour mettre à jour le score local
  const updateLocalScore = useCallback(async (userId: string, isCorrect: boolean) => {
    setLocalScores(prevScores => {
      const currentScore = prevScores[userId] || 0;
      const newScore = isCorrect ? currentScore + 1 : currentScore;
      // Log seulement si le score change vraiment
      if (newScore !== currentScore) {
        console.log('🎃 Score local mis à jour:', userId, 'de', currentScore, 'à', newScore);
      }

      // Synchroniser immédiatement avec Firebase
      const updatedScores = {
        ...prevScores,
        [userId]: newScore,
      };

      // Mettre à jour Firebase en arrière-plan
      if (gameState) {
        updateGameState({
          ...gameState,
          scores: updatedScores,
        }).catch(error => {
          console.error('❌ Erreur synchronisation score:', error);
        });
      }

      return updatedScores;
    });
  }, [gameState, updateGameState]);

  // Fonction pour sauvegarder les scores finaux dans Firebase
  const saveFinalScoresToFirebase = useCallback(async () => {
    if (!gameState || Object.keys(localScores).length === 0) return;

    try {
      console.log('🎃 Sauvegarde des scores finaux:', localScores);

      const finalState = {
        ...gameState,
        scores: localScores,
        phase: 'end' as GamePhase,
      };

      await updateGameState(finalState);
      // Les points sont attribués par GameResults.tsx via useLeaderboard
      // Pas besoin d'appeler awardGamePoints ici pour éviter les doublons

      console.log('✅ Scores finaux sauvegardés avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des scores:', error);
    }
  }, [gameState, localScores, updateGameState, awardGamePoints, gameId]);

  // Timer optimisé avec useCallback - dépend seulement de l'ID de la question
  useEffect(() => {
    if (gameState?.currentQuestion?.id) {
      console.log('🎃 Timer démarré pour nouvelle question:', gameState.currentQuestion.id);
      setTimer(15);
      setCanAnswer(true);

      const timerInterval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            console.log('🎃 Temps écoulé - arrêt du timer');
            clearInterval(timerInterval);
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
  }, [gameState?.currentQuestion?.id]); // Seulement l'ID, pas l'objet complet

  // Surveiller les réponses avec useMemo pour éviter les re-renders inutiles
  const allPlayersAnswered = useMemo(() => {
    if (!gameState?.playerAnswers || !gameState?.players) {
      return false;
    }
    const totalPlayers = gameState.players.length;
    const answeredPlayers = Object.keys(gameState.playerAnswers).length;
    const result = answeredPlayers >= totalPlayers && answeredPlayers > 0;

    // Log seulement quand ça change vraiment
    if (result && answeredPlayers === totalPlayers) {
      console.log('🎃 ✅ Tous les joueurs ont répondu:', {
        totalPlayers,
        answeredPlayers,
        playerAnswers: gameState.playerAnswers,
        players: gameState.players.map(p => p.id)
      });
    }

    return result;
  }, [gameState?.playerAnswers, gameState?.players]);

  // Correction : Seul l'hôte choisit et enregistre la prochaine question
  const isHost = user?.uid === gameState?.players[0]?.id;
  // ⚠️ FIX: handleNextQuestion - SEUL L'HÔTE peut changer la question
  // Firebase est la seule source de vérité
  const handleNextQuestion = useCallback(() => {
    // ⚠️ FIX: Seul l'hôte peut réellement changer la question
    if (!isHost) {
      console.log('🎃 [CLIENT] handleNextQuestion ignoré - ce client n\'est pas l\'hôte');
      return;
    }

    console.log('🎃 [HÔTE] handleNextQuestion appelé - gameState:', !!gameState);
    if (!gameState || nextQuestionHandled.current) {
      console.log('🎃 [HÔTE] handleNextQuestion annulé - pas de gameState ou déjà traité');
      return;
    }
    nextQuestionHandled.current = true;

    const nextRound = gameState.currentRound + 1;
    console.log('🎃 [HÔTE] Passage à la question suivante - Round:', nextRound, '/', gameState.totalRounds);

    if (nextRound <= gameState.totalRounds) {
        const newQuestion = getRandomQuestion();
      console.log('🎃 [HÔTE] Nouvelle question choisie:', !!newQuestion);
        if (newQuestion) {
        // ⚠️ FIX: Firebase est la seule source de vérité - on met à jour Firebase directement
          const nextRoundState = {
            ...gameState,
            currentRound: nextRound,
            currentQuestion: newQuestion,
            askedQuestionIds: [...gameState.askedQuestionIds, newQuestion.id],
          playerAnswers: {}, // ⚠️ FIX: Reset complet pour la nouvelle question
            phase: GamePhase.QUESTION,
            _allAnswered: false,
          };
        console.log('🎃 [HÔTE] Mise à jour Firebase avec nouvelle question (source de vérité unique)');
          updateGameState(nextRoundState);
        } else {
        console.log('🎃 [HÔTE] Aucune nouvelle question disponible');
      }
    } else {
      // Fin du jeu - sauvegarder les scores finaux (une seule fois)
      if (!gameEndHandled.current) {
        console.log('🎃 [HÔTE] Fin du jeu - sauvegarde des scores');
        gameEndHandled.current = true;
        saveFinalScoresToFirebase();
      }
    }
  }, [gameState, updateGameState, saveFinalScoresToFirebase, getRandomQuestion, isHost]);

  // Effet optimisé pour gérer le timer à 0 - évite le spam de logs
  const timerAtZeroHandled = useRef(false);
  const gameEndHandled = useRef(false);
  const questionChangeHandled = useRef(false);
  const nextQuestionHandled = useRef(false);

  useEffect(() => {
    if (gameState?.currentQuestion?.id && timer === 0 && !timerAtZeroHandled.current) {
      console.log('🎃 Timer à 0 - vérification des réponses');
      timerAtZeroHandled.current = true;

      // Cas 1: Timer à 0 ET personne n'a répondu → passage automatique
      if (!allPlayersAnswered) {
        console.log('🎃 Temps écoulé et pas tous répondu - passage automatique');
        setTimeout(() => {
          handleNextQuestion();
        }, 1000);
      } else {
        console.log('🎃 Temps écoulé mais tous ont répondu - laisser la logique normale gérer');
      }
    }

    return undefined;
  }, [timer, allPlayersAnswered, gameState?.currentQuestion?.id, handleNextQuestion]);

  // ⚠️ FIX: Effet optimisé pour passer à la question suivante quand tous ont répondu
  // SEUL L'HÔTE déclenche réellement le passage - les autres clients attendent Firebase
  const allAnsweredHandled = useRef(false);

  useEffect(() => {
    if (allPlayersAnswered && !(gameState as any)?._allAnswered && !allAnsweredHandled.current) {
      allAnsweredHandled.current = true;

      // ⚠️ FIX: Seul l'hôte déclenche le passage à la question suivante
      // Les autres clients attendent que Firebase se mette à jour
      if (isHost) {
        console.log('🎃 [HÔTE] Tous les joueurs ont répondu - passage à la question suivante après 2s');

      // Mettre à jour Firebase avec _allAnswered = true
      const updatedState = {
        ...gameState,
        _allAnswered: true,
      };
      updateGameState(updatedState);

        // ⚠️ FIX: Seul l'hôte appelle handleNextQuestion
      setTimeout(() => {
          console.log('🎃 [HÔTE] Appel de handleNextQuestion après délai de 2s');
        handleNextQuestion();
        }, 2000);
      } else {
        console.log('🎃 [CLIENT] Tous ont répondu - attente de la mise à jour Firebase par l\'hôte');
        // Les clients non-hôtes ne font rien - ils attendent que l'hôte mette à jour Firebase
        // Firebase est la seule source de vérité
      }
    }
  }, [allPlayersAnswered, gameState, handleNextQuestion, updateGameState, isHost]);

  // Reset les flags quand on change de question ou de round
  useEffect(() => {
    allAnsweredHandled.current = false;
    timerAtZeroHandled.current = false;
    gameEndHandled.current = false; // Reset aussi le flag de fin de jeu
    nextQuestionHandled.current = false; // Reset le flag de passage à la question suivante
  }, [gameState?.currentQuestion?.id, gameState?.currentRound]);

  // ⚠️ FIX: Réinitialiser les états locaux quand la question change
  // Firebase est la seule source de vérité - on synchronise toujours avec Firebase
  const lastQuestionRoundRef = useRef<string>('');

  useEffect(() => {
    if (gameState?.currentQuestion?.id && gameState?.currentRound) {
      // ⚠️ FIX: Vérifier à la fois l'ID de la question ET le round pour détecter un vrai changement
      const questionRoundKey = `${gameState.currentQuestion.id}_${gameState.currentRound}`;
      
      // Si c'est la même question au même round, ne rien faire
      if (questionRoundKey === lastQuestionRoundRef.current) {
        return;
      }
      
      // Mettre à jour le ref
      lastQuestionRoundRef.current = questionRoundKey;
      
      // ⚠️ FIX: Firebase est la seule source de vérité - on lit toujours depuis Firebase
      const userAnswer = gameState.playerAnswers?.[user?.uid || ''];
      
      // ⚠️ FIX: Si playerAnswers est vide, c'est une nouvelle question - réinitialiser
      const playerAnswersEmpty = !gameState.playerAnswers || Object.keys(gameState.playerAnswers).length === 0;
      
      if (userAnswer && !playerAnswersEmpty) {
        // Si l'utilisateur a déjà répondu à cette question dans Firebase, restaurer l'état depuis Firebase
        setSelectedAnswer(userAnswer.answer);
        setIsAnswerCorrect(userAnswer.isCorrect || false);
        setShowResult(true);
        setCanAnswer(false);
        console.log('🎃 [SYNC] État restauré depuis Firebase (source de vérité):', {
          questionId: gameState.currentQuestion.id,
          round: gameState.currentRound,
          answer: userAnswer.answer
        });
      } else {
        // Nouvelle question ou pas encore répondu - réinitialiser complètement
        setSelectedAnswer(null);
        setShowResult(false);
        setIsAnswerCorrect(false);
        setCanAnswer(true);
        console.log('🎃 [SYNC] Nouvelle question - états réinitialisés depuis Firebase:', {
          questionId: gameState.currentQuestion.id,
          round: gameState.currentRound,
          playerAnswersEmpty
        });
      }
    }
  }, [gameState?.currentQuestion?.id, gameState?.currentRound, gameState?.playerAnswers, user?.uid]);

  // Démarrer le jeu (première question)
  const startNewQuestion = useCallback(() => {
    console.log('🎃 Démarrage du Quiz Halloween');
    const newQuestion = getRandomQuestion();
    if (newQuestion && gameState) {
      const updatedState = {
        ...gameState,
        currentQuestion: newQuestion,
        askedQuestionIds: [...gameState.askedQuestionIds, newQuestion.id],
        playerAnswers: {},
        phase: GamePhase.QUESTION,
        _allAnswered: false,
        currentRound: 1, // Commencer à la question 1
      };
      updateGameState(updatedState);
      setSelectedAnswer(null);
      setShowResult(false);
      setCanAnswer(true);
      setTimer(15);
      console.log('🎃 Première question démarrée:', newQuestion.question);
    }
  }, [gameState, getRandomQuestion, updateGameState]);

  // Soumettre une réponse - optimisé
  const submitAnswer = useCallback((answerText: string) => {
    if (!gameState?.currentQuestion || !user || !gameState.currentQuestion.answers || !canAnswer || selectedAnswer) return;

    // ⚠️ FIX: Vérifier que le joueur n'a pas déjà répondu à cette question dans Firebase
    const userAnswer = gameState.playerAnswers?.[user.uid];
    if (userAnswer) {
      console.log('⚠️ Le joueur a déjà répondu à cette question, réponse ignorée');
      return;
    }

    console.log('🎃 Réponse soumise:', answerText, 'pour question:', gameState.currentQuestion.id, 'round:', gameState.currentRound);
    setSelectedAnswer(answerText);

    const isCorrect = gameState.currentQuestion.answers.find(a => a.text === answerText)?.isCorrect || false;
    setIsAnswerCorrect(isCorrect);

    // Mettre à jour le score local (pas Firebase)
    updateLocalScore(user.uid, isCorrect);

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

    // Mettre à jour les réponses avec transaction atomique
    const playerAnswer = {
      answer: answerText,
      isCorrect,
      isTrap: !isCorrect,
      timestamp: Date.now(),
    };

    console.log('🎃 Mise à jour playerAnswers avec transaction:', {
      userId: user.uid,
      answer: answerText,
      isCorrect,
      playerAnswer
    });

    // Utiliser la fonction transaction atomique
    updatePlayerAnswers(user.uid, playerAnswer);
    setShowResult(true);
    console.log('🎃 Réponse enregistrée, en attente des autres joueurs...');
  }, [gameState, user, canAnswer, selectedAnswer, updateLocalScore, updatePlayerAnswers]);

  // Score actuel mémorisé
  const currentUserScore = useMemo(() => {
    const score = localScores[user?.uid || ''] || 0;
    // Log seulement en mode debug si nécessaire
    // console.log('🎃 Score actuel calculé:', score, 'pour user:', user?.uid, 'localScores:', localScores);
    return score;
  }, [localScores, user?.uid]);

  if (!gameState || gameState.phase === GamePhase.LOADING) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[
            Colors.light?.backgroundDarker || '#120F1C',
            Colors.light?.background || '#1A1A2E',
            Colors.light?.backgroundLighter || '#2D223A'
          ]}
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
          colors={[
            Colors.light?.backgroundDarker || '#120F1C',
            Colors.light?.background || '#1A1A2E',
            Colors.light?.backgroundLighter || '#2D223A'
          ]}
          style={styles.background}
        >
          <HalloweenDecorations />
          <View style={styles.waitingContainer}>
            <Text style={styles.title}>🎃 QUIZ HALLOWEEN 🎃</Text>
            <Text style={styles.subtitle}>Testez vos connaissances effrayantes !</Text>
            <TouchableOpacity style={styles.startButton} onPress={startNewQuestion}>
              <LinearGradient
                colors={[
                  Colors.light?.primary || '#C41E3A',
                  Colors.light?.secondary || '#4B1E00',
                  Colors.light?.tertiary || '#FFD700'
                ]}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>🕷️ Commencer le Quiz 🕷️</Text>
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
        scores={localScores} // Utiliser les scores locaux
        userId={user?.uid || ''}
        colors={['#2D1810', '#8B4513', '#D2691E']}
        pointsConfig={{
          firstPlace: 30,
          secondPlace: 20,
          thirdPlace: 10,
        }}
      />
    );
  }

  const currentQuestion = gameState.currentQuestion;
  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[
            Colors.light?.backgroundDarker || '#120F1C',
            Colors.light?.background || '#1A1A2E',
            Colors.light?.backgroundLighter || '#2D223A'
          ]}
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
              {currentUserScore} 🎃
            </Text>
          </View>
          <View style={styles.roundContainer}>
            <Text style={styles.roundText}>
              Question {Math.min(gameState.currentRound, gameState.totalRounds)}/{gameState.totalRounds}
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
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#4B0082',
  },
  startButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
