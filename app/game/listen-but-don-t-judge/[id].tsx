import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, doc, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import RoundedButton from '@/components/RoundedButton';
import GameResults from '@/components/game/GameResults';
import { useInAppReview } from '@/hooks/useInAppReview';
import { useListenButDontJudgeAnalytics } from '@/hooks/useListenButDontJudgeAnalytics';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { GamePhase, Question } from '@/types/gameTypes';
import ResultsPhase from '@/components/game/ResultsPhase';
import { useListenButDontJudgeQuestions } from './questions';

// Define interfaces outside the component
interface Player {
  id: string;
  name: string;
  avatar: string;
  username?: string;
}

interface GameState {
  phase: 'question' | 'answer' | 'vote' | 'results' | 'choix' | 'end';
  currentRound: number;
  totalRounds: number;
  targetPlayer: Player | null;
  currentQuestion: Question | string | null; // Update type to allow string or null
  answers: Array<{
    id: string;
    text: string;
    playerId: string;
    playerName: string;
  }>;
  players: Player[];
  scores: Record<string, number>;
  timer: number | null;
  votes: Record<string, string>;
  theme?: string;
  winningAnswerId?: string;
  gameMode: 'listen-but-don-t-judge';
  isLastRound: boolean;
}

export default function ListenButDontJudgeScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const { requestReview } = useInAppReview();
  const gameAnalytics = useListenButDontJudgeAnalytics();
  const { t } = useTranslation();
  const { getGameContent } = useLanguage();
  const { getRandomQuestion, resetAskedQuestions } = useListenButDontJudgeQuestions();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const gameStartTime = useRef(Date.now());

  // Use useCallback to memoize safeTranslate
  const safeTranslate = useCallback((key: string, defaultValue: string = '') => {
    try {
      if (!t) {
        console.warn('Translation function not available in safeTranslate');
        return defaultValue;
      }
      const translation = t(key);
      return translation || defaultValue;
    } catch (error) {
      console.error('Translation error in safeTranslate:', error);
      return defaultValue;
    }
  }, [t]);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        if (!getGameContent) {
          console.warn('getGameContent is not available');
          return;
        }
        
        const gameContent = await getGameContent('listen-but-don-t-judge');
        if (!gameContent || !gameContent.questions) {
          console.warn('No game content or questions available in initializeGame');
          // Decide on fallback: maybe set questions state in useRandomQuestions hook?
          // For now, just log and return.
          return;
        }
        // Note: useRandomQuestions hook is responsible for setting its own questions state
        // based on the gameMode prop and the fetched gameContent. No need to set questions here.

      } catch (error) {
        console.error('Error initializing game:', error);
      }
    };
    initializeGame();
    // Dependency array: getGameContent is a function from context, should be stable.
    // However, if LanguageProvider re-renders and provides a new context object,
    // getGameContent might change. Include it to be safe, but ideally it's stable.
  }, [getGameContent]);

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const gameData = docSnap.data() as GameState;
        // S'assurer que le gameMode est défini
        if (!gameData.gameMode) {
          updateDoc(gameRef, {
            gameMode: 'listen-but-don-t-judge'
          }).catch(e => console.error("Error updating gameMode:", e));
        }
        setGame(prevGame => {
          console.log('[DEBUG] Game state updated by onSnapshot');
          return gameData;
        });

        // Si la phase est 'choix', on la change en 'question' - do this only once
        if (gameData.phase === 'choix') {
          // Check if previous state was not already 'choix' to prevent loop
          if (game?.phase !== 'choix') {
            console.log('[DEBUG] Changing phase from choix to question');
            updateDoc(gameRef, {
              phase: 'question'
            }).catch(e => console.error("Error updating phase:", e));
          }
        }
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      console.log('[DEBUG] onSnapshot unsubscribed');
    };
  }, [id, game?.phase]);

  useEffect(() => {
    // Log game state changes to debug frequent updates
    console.log('[DEBUG] Game state changed:', game?.phase, game?.currentRound); // Add more relevant fields if needed

    if (game && game.currentRound >= game.totalRounds && game.phase === GamePhase.RESULTS) {
      const gameDuration = Date.now() - gameStartTime.current;
      
      // Track la fin du jeu
      gameAnalytics.trackGameComplete(String(id), game.totalRounds, gameDuration);
      
    
      return () => {};
    }

    return () => {};
  }, [game, id, router, requestReview, gameAnalytics]); // Depend on game state and other stable values

  const handleSubmitAnswer = async () => {
    if (!game || !user || !answer.trim()) return;
    
    setIsSubmitting(true);
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      const newAnswer = {
        id: Date.now().toString(),
        text: answer.trim(),
        playerId: user.uid,
        playerName: user.pseudo || safeTranslate('game.player', 'Joueur')
      };

      await gameAnalytics.trackStoryStart(String(id), user.uid);

      await updateDoc(gameRef, {
        answers: [...(game.answers || []), newAnswer],
        phase: 'vote'
      });

      setAnswer('');
    } catch (error) {
      Alert.alert(
        safeTranslate('game.error', 'Erreur'),
        safeTranslate('game.listenButDontJudge.errorSubmit', 'Erreur lors de la soumission')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (answerId: string) => {
    if (!game || !user) return;
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      const votes = game.votes || {};
      votes[user.uid] = answerId;

      const votedAnswer = game.answers.find(a => a.id === answerId);
      if (votedAnswer) {
        await gameAnalytics.trackVote(String(id), user.uid, votedAnswer.playerId, 'yes');
      }

      const winningAnswer = game.answers.find(a => a.id === answerId);
      let scores = { ...game.scores };
      if (winningAnswer) {
        scores[winningAnswer.playerId] = (scores[winningAnswer.playerId] || 0) + 1;
      }
      await updateDoc(gameRef, {
        votes,
        phase: 'results',
        winningAnswerId: answerId,
        scores
      });
    } catch (error) {
      Alert.alert(
        safeTranslate('game.error', 'Erreur'),
        safeTranslate('game.listenButDontJudge.errorVote', 'Erreur lors du vote')
      );
    }
  };

  const handleNextRound = async () => {
    if (!game || !user) return;
    if (game.currentRound >= game.totalRounds) {
      return;
    }
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      await gameAnalytics.trackRoundComplete(
        String(id),
        game.currentRound,
        game.totalRounds
      );

      const nextQuestion = getRandomQuestion();
      
      if (!nextQuestion) {
        Alert.alert(
          safeTranslate('game.error', 'Erreur'),
          safeTranslate('game.listenButDontJudge.noQuestions', 'Aucune question disponible')
        );
        return;
      }

      // Sélectionner un joueur cible aléatoire différent du joueur actuel
      const availablePlayers = game.players.filter(player => player.id !== user.uid);
      const randomPlayerIndex = Math.floor(Math.random() * availablePlayers.length);
      const newTargetPlayer = availablePlayers[randomPlayerIndex];

      // Assurer que l'objet nextQuestion a la structure correcte et ne contient pas de undefined
      const questionForFirestore: Question = {
        id: nextQuestion.id || '',
        text: nextQuestion.text || safeTranslate('game.listenButDontJudge.noQuestions', 'Aucun texte disponible'),
        theme: nextQuestion.theme || '',
        roundNumber: nextQuestion.roundNumber !== undefined ? nextQuestion.roundNumber : game.currentRound + 1
      };

      // Nettoyer les objets Player pour supprimer les undefined avant la mise à jour
      const updatedTargetPlayer = newTargetPlayer ? { ...newTargetPlayer } : null;
      if (updatedTargetPlayer) {
        (Object.keys(updatedTargetPlayer) as Array<keyof Player>).forEach(key => {
          if (updatedTargetPlayer[key] === undefined) {
            delete updatedTargetPlayer[key];
          }
        });
      }

      const updatedPlayers = game.players ? game.players.map(player => {
        const cleanedPlayer = { ...player };
        (Object.keys(cleanedPlayer) as Array<keyof Player>).forEach(key => {
          if (cleanedPlayer[key] === undefined) {
            delete cleanedPlayer[key];
          }
        });
        return cleanedPlayer;
      }) : [];

      await updateDoc(gameRef, {
        currentRound: game.currentRound + 1,
        phase: 'question',
        currentQuestion: questionForFirestore,
        answers: [],
        votes: {},
        winningAnswerId: null,
        targetPlayer: updatedTargetPlayer,
        players: updatedPlayers
      });
    } catch (error) {
      console.error('Error moving to next round:', error);
      Alert.alert(
        safeTranslate('game.error', 'Erreur'),
        safeTranslate('game.listenButDontJudge.errorNextRound', 'Impossible de passer au tour suivant')
      );
    }
  };

  // Fonction utilitaire pour formater le texte de la question et remplacer le joueur
  const formatQuestionText = (question: string | { text: string }, playerName: string) => {
    const questionText = typeof question === 'string' ? question : question.text || '';
    
    // Debug des valeurs
    console.log('Question originale:', questionText);
    console.log('Nom du joueur à insérer:', playerName);
    
    // Faire le remplacement avec une expression régulière pour tous les formats possibles
    // Cela capturera {playerName}, {player_name}, {player}, etc.
    const formattedText = questionText.replace(/\{player(?:Name|_name|name|)\}/gi, playerName);
    
    console.log('Question formatée:', formattedText);
    
    return formattedText;
  };

  // Fonction pour normaliser la structure d'une question et s'assurer qu'elle est utilisable
  const normalizeQuestion = (question: Question | string | null): Question => {
    console.log('Normalisation de la question:', question);

    // Handle null or undefined input
    if (!question) {
      console.error('Input question is null or undefined');
      return { id: 'default-id', text: safeTranslate('game.listenButDontJudge.noQuestions', 'Aucune question disponible'), theme: '', roundNumber: 0 };
    }

    // If it's already a Question object with an ID
    if (typeof question === 'object' && question !== null && 'id' in question && typeof question.id === 'string') {
        // Ensure it has a text property, or use a default
        if(question.text === undefined || question.text === null || typeof question.text !== 'string') {
             console.warn('Question object missing text property, using default.', question);
             return { ...question, text: safeTranslate('game.listenButDontJudge.noQuestions', 'Aucune question disponible'), theme: question.theme || '', roundNumber: question.roundNumber || 0 };
        }
       return question as Question;
    }

    // If it's a string
    if (typeof question === 'string') {
      // Use the string as text, generate ID, and add default theme/roundNumber
      return { id: Date.now().toString(), text: question, theme: '', roundNumber: 0 };
    }

    // If it's an object with a text property but no id
    if (typeof question === 'object' && question !== null && 'text' in question && typeof question.text === 'string') {
         // Check if it has an id that is not a string (e.g. null or undefined) and generate one if needed.
        if (!('id' in question) || typeof question.id !== 'string' || question.id === undefined || question.id === null) {
             console.warn('Object question missing valid id, generating one.', question);
             return { ...question, id: Date.now().toString(), theme: question.theme || '', roundNumber: question.roundNumber || 0 }; // Generate ID and add default theme/roundNumber
        }
        return question as Question; // Should not happen if previous check passed, but good fallback
    }

    // If none of the above, use a default text and generate ID
    console.error('Question not normalizable to expected format:', question);
    return { id: 'default-id', text: safeTranslate('game.listenButDontJudge.noQuestions', 'Aucune question disponible'), theme: '', roundNumber: 0 };
  };

  // Memoize the formatted question text for display in question/vote phases
  const memoizedQuestionText = useMemo(() => {
    console.log('[DEBUG useMemo] Recalculating memoizedQuestionText'); // Debug log
    // Utiliser normalizeQuestion pour obtenir un objet Question valide
    const normalizedQuestion = normalizeQuestion(game?.currentQuestion);

    if (!normalizedQuestion || !normalizedQuestion.text) { // Vérifier si le texte est présent après normalisation
       console.error('[DEBUG useMemo] Normalization failed or returned invalid object/text', normalizedQuestion);
       return safeTranslate('game.listenButDontJudge.noQuestions', 'Aucune question disponible');
    }

    return formatQuestionText(
      normalizedQuestion,
      game?.targetPlayer?.name || game?.targetPlayer?.username || safeTranslate('game.player', 'the player')
    );
  }, [game?.currentQuestion, game?.targetPlayer, game?.players, safeTranslate, normalizeQuestion]); // Depend on relevant game state and safeTranslate

  // Memoize the formatted question for ResultsPhase
  const memoizedFormattedQuestion = useMemo(() => {
    console.log('[DEBUG useMemo] Recalculating memoizedFormattedQuestion'); // Debug log
    // Utiliser normalizeQuestion pour obtenir un objet Question valide
    const normalizedQuestion = normalizeQuestion(game?.currentQuestion);

    // Ensure normalization result is valid and has text
    if (!normalizedQuestion || typeof normalizedQuestion.text !== 'string' || !normalizedQuestion.text) {
        console.error('[DEBUG useMemo] Normalization failed for ResultsPhase or returned invalid object/text', normalizedQuestion);
        return null; // Return null if game or question is not ready or normalized incorrectly
    }

    const formattedText = formatQuestionText(
      normalizedQuestion,
      game?.targetPlayer?.name || game?.targetPlayer?.username || safeTranslate('game.player', 'the player')
    );

    // Ensure the returned object matches the expected Question interface structure for ResultsPhase
    return {
      id: normalizedQuestion.id || 'generated-id', // Provide a fallback ID if needed
      text: formattedText,
      theme: normalizedQuestion.theme || '',
      roundNumber: normalizedQuestion.roundNumber || (game?.currentRound || 1)
    };
  }, [game?.currentQuestion, game?.targetPlayer, game?.theme, game?.currentRound, safeTranslate, normalizeQuestion]); // Depend on relevant game state and safeTranslate

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.loadingText}>{safeTranslate('game.loading', 'Chargement...')}</Text>
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.container}>
        <LinearGradient 
          colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={styles.background} 
        />
        <Text style={styles.errorText}>{safeTranslate('game.error', 'Une erreur est survenue')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={game?.phase === 'results' && game?.currentRound >= game?.totalRounds ? ['#1A0A33', '#3A1A59'] : ["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {game?.phase === 'results' && game?.currentRound >= game?.totalRounds ? (
        <GameResults
          players={game.players || []}
          scores={game.scores || {}}
          userId={user?.uid || ''}
          pointsConfig={{
            firstPlace: 30,
            secondPlace: 20,
            thirdPlace: 10
          }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={[styles.content, { flex: 1 }]}>
            <View style={styles.progressRow}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${((game?.currentRound || 0) / (game?.totalRounds || 1)) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {game?.currentRound || 0}/{game?.totalRounds || 0}
              </Text>
            </View>
            {game.phase === 'question' && (
              user?.uid !== game.targetPlayer?.id ? (
                <View style={styles.questionContainer}>
                  <View style={styles.questionCard}>
                    <Text style={styles.questionText}>
                      {memoizedQuestionText}
                    </Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t('game.listenButDontJudge.answerPlaceholder', "Écrivez votre réponse ici...")}
                    placeholderTextColor="#666"
                    value={answer}
                    onChangeText={setAnswer}
                    multiline
                    maxLength={200}
                  />
                  <RoundedButton
                    title={t('game.listenButDontJudge.submit', "Soumettre")}
                    onPress={handleSubmitAnswer}
                    disabled={isSubmitting || !answer.trim()}
                    style={styles.submitButton}
                  />
                </View>
              ) : (
                <View style={styles.questionContainer}>
                  <View style={styles.questionCard}>
                    <Text style={styles.waitingText}>
                      {safeTranslate('game.listenButDontJudge.waiting', "En attente des autres joueurs...")}
                    </Text>
                  </View>
                </View>
              )
            )}
            {game.phase === 'vote' && (
              user?.uid === game.targetPlayer?.id ? (
                <View style={styles.voteContainer}>
                  <View style={styles.questionCard}>
                    <Text style={styles.questionText}>
                      {memoizedQuestionText}
                    </Text>
                  </View>
                  <Text style={styles.voteTitle}>{t('game.listenButDontJudge.voteTitle', "Choisissez la meilleure réponse")}</Text>
                  {game.answers.map((answer) => (
                    <RoundedButton
                      key={answer.id}
                      title={answer.text}
                      onPress={() => handleVote(answer.id)}
                      style={styles.voteButton}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.voteContainer}>
                  <View style={styles.questionCard}>
                    <Text style={styles.waitingText}>
                      {game.votes && user?.uid && game.votes[user.uid] ?
                        safeTranslate('game.listenButDontJudge.waitingForOthers', "En attente des autres votes...") :
                        safeTranslate('game.listenButDontJudge.waitingVote', "En attente du vote du joueur cible...")
                      }
                    </Text>
                  </View>
                </View>
              )
            )}
            {game.phase === 'results' && memoizedFormattedQuestion && game?.currentRound < game?.totalRounds && (
              <View style={styles.container}>
                <ResultsPhase
                  answers={game.answers || []}
                  scores={game.scores || {}}
                  players={game.players || []}
                  question={memoizedFormattedQuestion}
                  targetPlayer={game.targetPlayer || null}
                  onNextRound={handleNextRound}
                  isLastRound={game.currentRound === game.totalRounds}
                  timer={game.timer || null}
                  gameId={String(id ?? "")}
                  totalRounds={game.totalRounds || 0}
                  winningAnswerId={game.winningAnswerId || null}
                />
                <View style={styles.nextRoundButtonContainer}>
                  <RoundedButton
                    title={t('game.nextRound', 'Tour suivant')}
                    onPress={handleNextRound}
                    style={styles.nextRoundButton}
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    marginTop: 50,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  progressBarBackground: {
    width: 220,
    height: 10,
    backgroundColor: 'rgba(61, 41, 86, 0.5)',
    borderRadius: 5,
    marginRight: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#A259FF',
    borderRadius: 5,
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressText: {
    color: '#C7B8F5',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 80,
  },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 28,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  questionContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  questionText: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 34,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    color: '#fff',
    fontSize: 18,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  voteContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  voteTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
   submitButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 480,
    marginBottom: 16,
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voteButton: {
    padding: 20,
    marginBottom: 16,
    width: '100%',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 24,
    textAlign: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(255,100,100,0.2)',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    maxWidth: 300,
    alignSelf: 'center',
  },
  waitingText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
  nextRoundButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  nextRoundButton: {
    width: '80%',
    maxWidth: 300,
  },
});
