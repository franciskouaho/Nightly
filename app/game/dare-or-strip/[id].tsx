import GameResults from '@/components/game/GameResults';
import { useAuth } from '@/contexts/AuthContext';
import { useDareOrStripQuestions } from '@/hooks/dare-or-strip-questions';
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

interface DareOrStripGameState extends Omit<GameState, 'phase'> {
  currentPlayerId: string;
  phase: string;
  currentQuestion: any;
  askedQuestionIds: string[];
  jokers: Record<string, boolean>; // true = joker disponible
  gameMode: 'dare-or-strip';
}

// Couleurs sensuelles et glamour
const GRADIENT_START = '#2D1B3D'; // Pourpre profond
const GRADIENT_END = '#8B1A5C'; // Rose bordeaux profond
const ACCENT_COLOR = '#D4AF37'; // Or rose
const CARD_BG = 'rgba(255, 255, 255, 0.15)';

// Composant carte de gage
const DareCard = ({
  playerName,
  question,
  currentRound,
  totalRounds,
}: {
  playerName: string;
  question: string;
  currentRound: number;
  totalRounds: number;
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Header orange */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderText}>Couple Questions</Text>
      </View>
      {/* Corps rouge avec question */}
      <View style={styles.cardBody}>
        <Text style={styles.cardQuestion}>{question}</Text>
        {/* Logo Nightly en bas */}
        <View style={styles.nightlyBrand}>
          <Text style={styles.nightlyIcon}>🌙</Text>
          <Text style={styles.nightlyText}>Nightly</Text>
        </View>
      </View>
    </View>
  );
};

export default function DareOrStripGame() {
  const { id: idParam } = useLocalSearchParams();
  const id = Array.isArray(idParam) ? idParam[0] : idParam || '';
  const { user } = useAuth();
  const router = useRouter();
  const { requestReview } = useInAppReview();
  const { awardGamePoints } = usePoints();
  const { t } = useTranslation();
  const { getRandomQuestion, isLoadingQuestions } = useDareOrStripQuestions();

  const [game, setGame] = useState<DareOrStripGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const gameData = docSnap.data() as DareOrStripGameState;
        setGame(gameData);

        // Si on est en phase dare et qu'il n'y a pas de question, en générer une
        if (gameData.phase === 'dare' && !gameData.currentQuestion) {
          const question = getRandomQuestion();
          if (question) {
            updateDoc(gameRef, {
              currentQuestion: question,
              askedQuestionIds: [...(gameData.askedQuestionIds || []), question.id],
            }).catch(console.error);
          }
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, getRandomQuestion]);

  useEffect(() => {
    if (game && (game.currentRound > game.totalRounds || game.phase === 'end')) {
      setIsGameOver(true);
    } else {
      setIsGameOver(false);
    }
  }, [game]);

  const handleChoice = async (choice: 'dare' | 'strip') => {
    if (!game || !user || isProcessing) return;

    setIsProcessing(true);
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));

      if (choice === 'dare') {
        // Le joueur fait le gage
        await updateDoc(gameRef, {
          phase: 'waiting',
        });

        // Attendre 3 secondes puis passer au tour suivant
        setTimeout(async () => {
          await nextRound();
        }, 3000);
      } else {
        // Le joueur retire un vêtement
        await updateDoc(gameRef, {
          phase: 'waiting',
        });

        // Attendre 2 secondes puis passer au tour suivant
        setTimeout(async () => {
          await nextRound();
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors du choix:', error);
      Alert.alert('Erreur', 'Impossible de traiter votre choix');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJoker = async () => {
    if (!game || !user || isProcessing) return;
    if (!game.jokers[user.uid]) {
      Alert.alert('Joker déjà utilisé', 'Vous avez déjà utilisé votre joker');
      return;
    }

    setIsProcessing(true);
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));

      const updatedJokers = { ...game.jokers };
      updatedJokers[user.uid] = false;

      await updateDoc(gameRef, {
        jokers: updatedJokers,
        phase: 'waiting',
      });

      // Attendre 2 secondes puis passer au tour suivant
      setTimeout(async () => {
        await nextRound();
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'utilisation du joker:', error);
      Alert.alert('Erreur', 'Impossible d\'utiliser le joker');
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

      // Générer une nouvelle question
      const question = getRandomQuestion();

      await updateDoc(gameRef, {
        currentRound: nextRound,
        currentPlayerId: nextPlayer.id,
        phase: 'dare',
        currentQuestion: question,
        askedQuestionIds: question
          ? [...(game.askedQuestionIds || []), question.id]
          : game.askedQuestionIds,
      });
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
        scores={game?.scores || {}}
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
  const hasJoker = game.jokers[user?.uid || ''] || false;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[GRADIENT_START, GRADIENT_END]} style={StyleSheet.absoluteFill} />
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>💋 Dare or Strip</Text>
          <Text style={styles.subtitle}>
            Round {game.currentRound} / {game.totalRounds}
          </Text>
        </View>

        {game.phase === 'dare' && currentPlayer && game.currentQuestion && (
          <View style={styles.phaseContainer}>
            <DareCard
              playerName={currentPlayer.name || 'Joueur'}
              question={game.currentQuestion.text}
              currentRound={game.currentRound}
              totalRounds={game.totalRounds}
            />

            {isCurrentPlayer && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.dareButton]}
                  onPress={() => handleChoice('dare')}
                  disabled={isProcessing}
                >
                  <Text style={styles.buttonText}>✅ Faire le gage</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.stripButton]}
                  onPress={() => handleChoice('strip')}
                  disabled={isProcessing}
                >
                  <Text style={styles.buttonText}>🚫 Retirer un vêtement</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.jokerButton,
                    !hasJoker && styles.jokerButtonDisabled,
                  ]}
                  onPress={handleJoker}
                  disabled={!hasJoker || isProcessing}
                >
                  <Text style={styles.jokerText}>
                    {hasJoker ? '🃏 Joker' : '🃏 Joker utilisé'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!isCurrentPlayer && (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  En attente de {currentPlayer.name}...
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
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F5D7B3', // Or rose pâle
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(212, 175, 55, 0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 18,
    color: '#F5D7B3', // Or rose pâle
    fontWeight: '600',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(212, 175, 55, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  phaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  cardHeader: {
    backgroundColor: '#4A0E4E', // Pourpre profond sensuel
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeaderText: {
    color: '#F5D7B3', // Or rose pâle
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardBody: {
    backgroundColor: '#8B1A5C', // Rose bordeaux profond
    padding: 30,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  cardQuestion: {
    fontSize: 24,
    color: '#F5D7B3', // Or rose pâle
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 36,
    marginBottom: 20,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(212, 175, 55, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  nightlyBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
  nightlyIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  nightlyText: {
    color: '#F5D7B3', // Or rose pâle
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(212, 175, 55, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  button: {
    backgroundColor: 'rgba(74, 14, 78, 0.6)', // Pourpre profond avec transparence
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37', // Or rose
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  dareButton: {
    backgroundColor: 'rgba(139, 26, 92, 0.7)', // Rose bordeaux avec transparence
    borderColor: '#F5D7B3', // Or rose pâle
  },
  stripButton: {
    backgroundColor: 'rgba(74, 14, 78, 0.8)', // Pourpre profond avec transparence
    borderColor: '#D4AF37', // Or rose
  },
  buttonText: {
    color: '#F5D7B3', // Or rose pâle
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  jokerButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)', // Or rose avec transparence
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37', // Or rose
    marginTop: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  jokerButtonDisabled: {
    backgroundColor: 'rgba(158, 158, 158, 0.3)',
    borderColor: '#9E9E9E',
    opacity: 0.5,
  },
  jokerText: {
    color: '#F5D7B3', // Or rose pâle
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(212, 175, 55, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  waitingContainer: {
    backgroundColor: 'rgba(74, 14, 78, 0.7)', // Pourpre profond avec transparence
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#D4AF37', // Or rose
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  waitingText: {
    color: '#F5D7B3', // Or rose pâle
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
});

