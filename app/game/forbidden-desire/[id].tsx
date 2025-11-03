import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, ScrollView, SafeAreaView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { GameState } from '@/types/gameTypes';
import { LinearGradient } from 'expo-linear-gradient';
import { useInAppReview } from '@/hooks/useInAppReview';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useForbiddenDesireQuestions } from '@/hooks/forbidden-desire-questions';
import { usePoints } from '@/hooks/usePoints';
import GameResults from '@/components/game/GameResults';

interface ForbiddenDesireGameState extends Omit<GameState, 'phase'> {
  currentPlayerId: string;
  selectedIntensity: 'soft' | 'tension' | 'extreme' | null;
  phase: string;
  playerScores: { [playerId: string]: number };
  gameMode: 'forbidden-desire';
  refusedQuestion: boolean;
  partnerChallenge?: string;
}

const CARD_COLOR = '#8B0000';
const CARD_ACCENT = '#DC143C';

// Composant carte de question
const QuestionCard = ({
  playerName,
  intensity,
  question,
  currentRound,
  totalRounds
}: {
  playerName: string;
  intensity: 'soft' | 'tension' | 'extreme';
  question: string;
  currentRound: number;
  totalRounds: number;
}) => {
  const intensityEmoji = {
    soft: '🔥',
    tension: '😳',
    extreme: '😈'
  };

  const intensityLabel = {
    soft: 'Soft',
    tension: 'Tension',
    extreme: 'EXTRÊME'
  };

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={["#8B0000", "#DC143C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{ backgroundColor: '#5A0000', borderRadius: 36, paddingVertical: 4, paddingHorizontal: 18, marginBottom: 8 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{playerName}</Text>
        </View>
        <Text style={{ color: '#FFEDCC', fontSize: 16, fontWeight: '600', opacity: 0.9 }}>
          {intensityEmoji[intensity]} {intensityLabel[intensity]}
        </Text>
      </View>
      <Text style={styles.cardQuestion}>
        « {question} »
      </Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(currentRound / totalRounds) * 100}%` }]} />
        </View>
        <Text style={styles.cardProgress}>{currentRound}/{totalRounds}</Text>
      </View>
    </View>
  );
};


export default function ForbiddenDesireGameScreen() {
  const { id: idParam } = useLocalSearchParams();
  const id = Array.isArray(idParam) ? idParam[0] : idParam || '';
  const { user } = useAuth();
  const router = useRouter();
  const { requestReview } = useInAppReview();
  const { awardGamePoints } = usePoints();
  const [game, setGame] = useState<ForbiddenDesireGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [challengeText, setChallengeText] = useState('');
  const gameStartTime = useRef(Date.now());
  const { t } = useTranslation();
  const { getGameContent, language } = useLanguage();
  const { getRandomQuestion, resetAskedQuestions, isLoadingQuestions } = useForbiddenDesireQuestions();

  const handleNextRound = async () => {
    if (!game || !user) return;
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));

      const nextRound = game.currentRound + 1;
      const isGameOver = nextRound > game.totalRounds;

      if (isGameOver) {
        // Le jeu est terminé
        await updateDoc(gameRef, {
          phase: 'end',
          currentRound: game.totalRounds,
        });
        return;
      }

      // Alterner entre les joueurs pour le prochain tour
      const currentPlayerIndex = game.players.findIndex(p => p.id === game.currentPlayerId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
      const nextPlayer = game.players[nextPlayerIndex];
      
      if (!nextPlayer) {
        console.error('Next player not found');
        return;
      }

      // Générer une nouvelle question pour le prochain joueur avec la même intensité
      const nextQuestion = getRandomQuestion(game.selectedIntensity || 'soft');
      
      await updateDoc(gameRef, {
        currentRound: nextRound,
        currentPlayerId: nextPlayer.id,
        phase: 'question',
        currentQuestion: nextQuestion,
        refusedQuestion: false,
        partnerChallenge: null,
        gameMode: 'forbidden-desire'
      });
    } catch (error) {
      console.error('Error moving to next round:', error);
      Alert.alert('Erreur', 'Impossible de passer au tour suivant');
    }
  };


  const handleAnswer = async (answered: boolean) => {
    if (!game || !user || !id) return;

    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));

      if (answered) {
        // Le joueur a répondu à la question - attribuer des points selon l'intensité
        const pointsEarned = game.selectedIntensity === 'extreme' ? 30 
          : game.selectedIntensity === 'tension' ? 20 
          : 10; // soft

        const updatedPlayerScores = { ...(game.playerScores || {}) };
        updatedPlayerScores[game.currentPlayerId] = (updatedPlayerScores[game.currentPlayerId] || 0) + pointsEarned;

        await updateDoc(gameRef, {
          phase: 'results',
          refusedQuestion: false,
          playerScores: updatedPlayerScores,
          scores: updatedPlayerScores, // Pour compatibilité
        });
      } else {
        // Le joueur refuse de répondre - pas de points
        await updateDoc(gameRef, {
          phase: 'challenge',
          refusedQuestion: true
        });
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleChallengeSubmit = async () => {
    if (!game || !user || !id || !challengeText.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un défi');
      return;
    }

    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));

      await updateDoc(gameRef, {
        partnerChallenge: challengeText,
        phase: 'results'
      });

      setChallengeText('');
    } catch (error) {
      console.error('Error submitting challenge:', error);
    }
  };

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const gameData = docSnap.data() as ForbiddenDesireGameState;
        if (!gameData.gameMode) {
          updateDoc(gameRef, {
            gameMode: 'forbidden-desire'
          }).catch(e => console.error("Error updating gameMode:", e));
        }
        

        if (gameData.selectedIntensity && !gameData.currentQuestion && gameData.phase !== 'end' && gameData.phase !== 'results' && gameData.phase !== 'challenge') {
          const question = getRandomQuestion(gameData.selectedIntensity);
          if (question) {
            updateDoc(gameRef, {
              phase: 'question',
              currentQuestion: question,
            }).catch(e => console.error("Error generating initial question:", e));
          }
        }
        
        setGame(gameData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, getRandomQuestion]);

  useEffect(() => {
    if (game && (game.currentRound > game.totalRounds || game.phase === 'end')) {
      setIsGameOver(true);
      const gameDuration = Date.now() - gameStartTime.current;
    } else {
      setIsGameOver(false);
    }
  }, [game, id, router, requestReview, awardGamePoints]);

  if (loading || isLoadingQuestions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CARD_COLOR} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Partie introuvable</Text>
      </View>
    );
  }

  if (isGameOver) {
    return (
      <GameResults
        players={game?.players || []}
        scores={game?.playerScores || game?.scores || {}}
        userId={user?.uid || ''}
        pointsConfig={{
          firstPlace: 30,
          secondPlace: 20,
          thirdPlace: 10
        }}
      />
    );
  }

  const currentPlayer = game.players.find(p => p.id === game.currentPlayerId);
  const isCurrentPlayer = user?.uid === game.currentPlayerId;
  const otherPlayer = game.players.find(p => p.id !== game.currentPlayerId);
  const isOtherPlayer = user?.uid === otherPlayer?.id;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#1A0808", "#2D0A0A"]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>😈 DÉSIR INTERDIT</Text>
            <Text style={styles.subtitle}>
              Tour {game.currentRound} / {game.totalRounds}
            </Text>
          </View>

          {/* Phase de question */}
          {game.phase === 'question' && game.currentQuestion && game.selectedIntensity && (
            <View style={styles.content}>
              <QuestionCard
                playerName={currentPlayer?.name || 'Joueur'}
                intensity={game.selectedIntensity}
                question={game.currentQuestion.text}
                currentRound={game.currentRound}
                totalRounds={game.totalRounds}
              />

              {isCurrentPlayer && (
                <View style={styles.answerButtons}>
                  <TouchableOpacity
                    style={[styles.answerButton, { backgroundColor: '#228B22' }]}
                    onPress={() => handleAnswer(true)}
                  >
                    <Text style={styles.answerButtonText}>✅ Je réponds</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.answerButton, { backgroundColor: '#DC143C' }]}
                    onPress={() => handleAnswer(false)}
                  >
                    <Text style={styles.answerButtonText}>❌ Je refuse (défi)</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!isCurrentPlayer && (
                <Text style={styles.waitingText}>
                  En attente de la réponse de {currentPlayer?.name}...
                </Text>
              )}
            </View>
          )}

          {/* Phase de défi imposé par le partenaire */}
          {game.phase === 'challenge' && game.refusedQuestion && (
            <View style={styles.content}>
              <Text style={styles.challengeTitle}>
                {currentPlayer?.name} a refusé de répondre ! 😏
              </Text>

              {isOtherPlayer && !game.partnerChallenge && (
                <View style={styles.challengeInput}>
                  <Text style={styles.challengeInstruction}>
                    Impose un défi à {currentPlayer?.name} 😈
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Entre ton défi ici..."
                    placeholderTextColor="#999"
                    value={challengeText}
                    onChangeText={setChallengeText}
                    multiline
                    numberOfLines={4}
                  />
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleChallengeSubmit}
                  >
                    <Text style={styles.submitButtonText}>Imposer le défi</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isCurrentPlayer && (
                <Text style={styles.waitingText}>
                  {otherPlayer?.name} prépare ton défi... 😈
                </Text>
              )}
            </View>
          )}

          {/* Phase de résultats */}
          {game.phase === 'results' && (
            <View style={styles.content}>
              {game.refusedQuestion && game.partnerChallenge ? (
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>Défi imposé !</Text>
                  <Text style={styles.challengeText}>
                    « {game.partnerChallenge} »
                  </Text>
                  <Text style={styles.resultSubtext}>
                    {currentPlayer?.name} doit accomplir ce défi ! 😈
                  </Text>
                </View>
              ) : (
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>Bravo !</Text>
                  <Text style={styles.resultSubtext}>
                    {currentPlayer?.name} a répondu avec courage ! 💪
                  </Text>
                </View>
              )}

              {isCurrentPlayer && (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNextRound}
                >
                  <Text style={styles.nextButtonText}>
                    Tour suivant →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0808',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A0808',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
  },
  errorText: {
    color: '#DC143C',
    fontSize: 18,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC143C',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  waitingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cardContainer: {
    backgroundColor: '#2D0A0A',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardQuestion: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
    lineHeight: 28,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#DC143C',
    borderRadius: 4,
  },
  cardProgress: {
    color: '#fff',
    fontSize: 14,
  },
  answerButtons: {
    gap: 16,
  },
  answerButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  answerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  challengeTitle: {
    fontSize: 22,
    color: '#DC143C',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  challengeInput: {
    gap: 16,
  },
  challengeInstruction: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#DC143C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 28,
    color: '#DC143C',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultSubtext: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  challengeText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  nextButton: {
    backgroundColor: '#DC143C',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
