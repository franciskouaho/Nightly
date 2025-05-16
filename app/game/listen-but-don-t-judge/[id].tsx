import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, doc, onSnapshot, updateDoc, getDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import RoundedButton from '@/components/RoundedButton';
import ResultsPhase from '@/components/game/ResultsPhase';
import { useInAppReview } from '@/hooks/useInAppReview';
import { useListenButDontJudgeAnalytics } from '@/hooks/useListenButDontJudgeAnalytics';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import i18n from '@/app/i18n/i18n';

interface Player {
  id: string;
  name: string;
  avatar: string;
  username?: string;
}

interface GameState {
  phase: 'question' | 'answer' | 'vote' | 'results' | 'choix';
  currentRound: number;
  totalRounds: number;
  targetPlayer: Player | null;
  currentQuestion: string | { text: string };
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
}

export default function ListenButDontJudgeScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const { requestReview } = useInAppReview();
  const gameAnalytics = useListenButDontJudgeAnalytics();
  const { t } = useTranslation();
  const { getGameContent } = useLanguage();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const gameStartTime = useRef(Date.now());

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const gameData = docSnap.data() as GameState;
        // Si la phase est 'choix', on la change en 'question'
        if (gameData.phase === 'choix') {
          updateDoc(gameRef, {
            phase: 'question'
          });
        }
        setGame(gameData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (game && game.currentRound >= game.totalRounds && game.phase === 'results') {
      const gameDuration = Date.now() - gameStartTime.current;
      
      // Track la fin du jeu
      gameAnalytics.trackGameComplete(String(id), game.totalRounds, gameDuration);
      
      const timeout = setTimeout(async () => {
        await requestReview();
        router.replace(`/game/results/${id}`);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [game, id, router, requestReview, gameAnalytics]);

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
        playerName: user.pseudo || 'Joueur'
      };

      // Track le début de l'histoire
      await gameAnalytics.trackStoryStart(String(id), user.uid);

      await updateDoc(gameRef, {
        answers: [...(game.answers || []), newAnswer],
        phase: 'vote'
      });

      setAnswer('');
    } catch (error) {
      Alert.alert(t('game.error'), t('game.listenButDontJudge.errorSubmit'));
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

      // Track le vote
      const votedAnswer = game.answers.find(a => a.id === answerId);
      if (votedAnswer) {
        await gameAnalytics.trackVote(String(id), user.uid, votedAnswer.playerId, 'yes');
      }

      // Trouver le joueur qui a écrit la réponse gagnante
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
      Alert.alert(t('game.error'), t('game.listenButDontJudge.errorVote'));
    }
  };

  const handleNextRound = async () => {
    if (!game) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));

    try {
      // Track la fin du round
      await gameAnalytics.trackRoundComplete(String(id), game.currentRound, game.totalRounds);

      // Sélectionne un nouveau joueur cible (différent du précédent si possible)
      let nextTarget = null;
      if (game.players.length > 1) {
        const otherPlayers = game.players.filter(p => p.id !== game.targetPlayer?.id);
        nextTarget = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
      } else {
        nextTarget = game.players[0];
      }
      
      // Vérifier que le nom du joueur cible est bien défini
      if (nextTarget && !nextTarget.name) {
        console.error('Erreur: Joueur cible sans nom défini', nextTarget);
        // Utiliser le nom du profil ou une valeur par défaut
        nextTarget.name = nextTarget.username || t('game.player', 'the player');
      }

      // Récupère les questions dans la langue actuelle
      const gameContent = await getGameContent('listen-but-don-t-judge');
      const questions = gameContent.questions;
      
      console.log('Questions disponibles:', questions);
      console.log('Langue actuelle:', i18n.language);
      console.log('Joueur cible sélectionné:', nextTarget);
      
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        Alert.alert(t('game.error'), t('game.listenButDontJudge.noQuestions'));
        return;
      }

      // Prend une question aléatoire
      const nextQuestion = questions[Math.floor(Math.random() * questions.length)];
      console.log('Question sélectionnée:', nextQuestion);
      
      if (!nextQuestion) {
        Alert.alert(t('game.error'), t('game.listenButDontJudge.noQuestions'));
        return;
      }

      // Normaliser la question
      const normalizedQuestion = normalizeQuestion(nextQuestion);

      await updateDoc(gameRef, {
        currentRound: (game.currentRound || 1) + 1,
        targetPlayer: nextTarget,
        currentQuestion: normalizedQuestion,
        answers: [],
        votes: {},
        phase: 'question'
      });
    } catch (error) {
      console.error('Erreur lors du passage au tour suivant:', error);
      Alert.alert(t('game.error'), t('game.listenButDontJudge.errorNext'));
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
  const normalizeQuestion = (question: any) => {
    console.log('Normalisation de la question:', question);
    
    // Si c'est une chaîne directe
    if (typeof question === 'string') {
      return { text: question };
    }
    
    // Si c'est un objet avec une propriété text
    if (question && typeof question === 'object' && typeof question.text === 'string') {
      return question;
    }
    
    // Si c'est un objet sans propriété text
    if (question && typeof question === 'object') {
      // Tentons de trouver une propriété qui pourrait contenir le texte
      for (const key of Object.keys(question)) {
        if (typeof question[key] === 'string') {
          return { text: question[key] };
        }
      }
    }
    
    // Si on ne peut pas normaliser, utiliser un texte par défaut
    console.error('Question non normalisable:', question);
    return { text: t('game.listenButDontJudge.noQuestions', 'Aucune question disponible') };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.loadingText}>{t('game.loading')}</Text>
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
        <Text style={styles.errorText}>{t('game.error')}</Text>
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
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.content, { flex: 1 }]}>
          <View style={styles.progressRow}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${(game.currentRound / game.totalRounds) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {game.currentRound}/{game.totalRounds}
            </Text>
          </View>
          {game.phase === 'question' && (
            user?.uid !== game.targetPlayer?.id ? (
              <View style={styles.questionContainer}>
                <View style={styles.questionCard}>
                  <Text style={styles.questionText}>
                    {formatQuestionText(
                      normalizeQuestion(game.currentQuestion), 
                      game.targetPlayer?.name || game.targetPlayer?.username || t('game.player', 'the player')
                    )}
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
                    {t('game.listenButDontJudge.waiting', "En attente des autres joueurs...")}
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
                    {formatQuestionText(
                      normalizeQuestion(game.currentQuestion), 
                      game.targetPlayer?.name || game.targetPlayer?.username || t('game.player', 'the player')
                    )}
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
                    {t('game.listenButDontJudge.waitingVote', "En attente du vote du joueur cible...")}
                  </Text>
                </View>
              </View>
            )
          )}
          {game.phase === 'results' && (
            <ResultsPhase
              answers={game.answers}
              scores={game.scores}
              players={game.players}
              question={(() => {
                // Normaliser et formatter la question
                const normalizedQuestion = normalizeQuestion(game.currentQuestion);
                const formattedText = formatQuestionText(
                  normalizedQuestion,
                  game.targetPlayer?.name || game.targetPlayer?.username || t('game.player', 'the player')
                );
                
                return {
                  id: '1',
                  text: formattedText,
                  theme: typeof game.theme === 'string' ? game.theme : '',
                  roundNumber: game.currentRound || 1
                };
              })()}
              targetPlayer={game.targetPlayer}
              onNextRound={handleNextRound}
              isLastRound={game.currentRound === game.totalRounds}
              timer={game.timer}
              gameId={String(id ?? "")}
              totalRounds={game.totalRounds}
              winningAnswerId={game.winningAnswerId}
            />
          )}
        </View>
      </ScrollView>
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
});