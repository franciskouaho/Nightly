import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, doc, onSnapshot, updateDoc, getDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import RoundedButton from '@/components/RoundedButton';
import ResultsPhase from '@/components/game/ResultsPhase';

interface Player {
  id: string;
  name: string;
  avatar: string;
}

interface GameState {
  phase: 'question' | 'answer' | 'vote' | 'results';
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
}

export default function ListenButDontJudgeScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        setGame(docSnap.data() as GameState);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

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

      await updateDoc(gameRef, {
        answers: [...(game.answers || []), newAnswer],
        phase: 'vote'
      });

      setAnswer('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre la réponse');
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

      await updateDoc(gameRef, {
        votes,
        phase: 'results'
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre le vote');
    }
  };

  const handleNextRound = async () => {
    if (!game) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));

    // Sélectionne un nouveau joueur cible (différent du précédent si possible)
    let nextTarget = null;
    if (game.players.length > 1) {
      const otherPlayers = game.players.filter(p => p.id !== game.targetPlayer?.id);
      nextTarget = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
    } else {
      nextTarget = game.players[0];
    }

    // Récupère les questions
    const questionsRef = doc(db, 'gameQuestions', 'listen-but-don-t-judge');
    const questionsDoc = await getDoc(questionsRef);
    const questions = (questionsDoc && questionsDoc.exists() && questionsDoc.data()?.questions) ? questionsDoc.data().questions : [];
    // Prend une question aléatoire (tu peux améliorer pour éviter les doublons)
    const nextQuestion = questions[Math.floor(Math.random() * questions.length)];

    await updateDoc(gameRef, {
      currentRound: (game.currentRound || 1) + 1,
      targetPlayer: nextTarget,
      currentQuestion: typeof nextQuestion === 'string' ? { text: nextQuestion } : nextQuestion,
      answers: [],
      votes: {},
      phase: 'question'
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient 
          colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={styles.background} 
        />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Chargement du jeu...</Text>
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
        <Text style={styles.errorText}>Partie non trouvée</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient 
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background} 
      />
      <View style={styles.content}>
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
            Tour {game.currentRound}/{game.totalRounds}
          </Text>
        </View>
        {game.phase === 'question' && (
          user?.uid !== game.targetPlayer?.id ? (
            <View style={styles.questionContainer}>
              <View style={styles.questionCard}>
                <Text style={styles.questionText}>
                  {typeof game.currentQuestion === 'string'
                    ? game.currentQuestion.replace('{playerName}', game.targetPlayer?.name || 'le joueur')
                    : (game.currentQuestion?.text
                        ? game.currentQuestion.text.replace('{playerName}', game.targetPlayer?.name || 'le joueur')
                        : '')}
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Votre réponse..."
                placeholderTextColor="#666"
                value={answer}
                onChangeText={setAnswer}
                multiline
                maxLength={200}
              />
              <RoundedButton
                title="Soumettre"
                onPress={handleSubmitAnswer}
                disabled={isSubmitting || !answer.trim()}
                style={styles.submitButton}
              />
            </View>
          ) : (
            <View style={styles.questionContainer}>
              <View style={styles.questionCard}>
                <Text style={styles.waitingText}>
                  Les autres joueurs répondent à une question sur toi...
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
                  {typeof game.currentQuestion === 'string'
                    ? game.currentQuestion.replace('{playerName}', game.targetPlayer?.name || 'le joueur')
                    : (game.currentQuestion?.text
                        ? game.currentQuestion.text.replace('{playerName}', game.targetPlayer?.name || 'le joueur')
                        : '')}
                </Text>
              </View>
              <Text style={styles.voteTitle}>Votez pour la meilleure réponse :</Text>
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
                  En attente du vote de la personne cible...
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
              const q = typeof game.currentQuestion === 'string'
                ? { text: game.currentQuestion }
                : (game.currentQuestion && typeof game.currentQuestion === 'object')
                  ? game.currentQuestion
                  : { text: '' };
              return {
                id: '1',
                text: typeof q.text === 'string' ? q.text : '',
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
          />
        )}
      </View>
    </View>
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