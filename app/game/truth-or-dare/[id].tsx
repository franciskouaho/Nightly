import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, onSnapshot, updateDoc, getDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { GameState, GamePhase } from '@/types/gameTypes';
import { LinearGradient } from 'expo-linear-gradient';
import RoundedButton from '@/components/RoundedButton';
import { Animated } from 'react-native';
import { useInAppReview } from '@/hooks/useInAppReview';
import { useTruthOrDareAnalytics } from '@/hooks/useTruthOrDareAnalytics';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

interface TruthOrDareQuestion { text: string; type: string; }

// Ajout du type local pour ce mode de jeu
interface TruthOrDareGameState extends Omit<GameState, 'phase'> {
  currentPlayerId: string;
  currentChoice: 'verite' | 'action' | null;
  phase: string;
  votes?: { [playerId: string]: 'yes' | 'no' };
  spectatorVotes?: { [playerId: string]: 'yes' | 'no' };
}

const CARD_COLOR = '#4B277D';
const CARD_DARK = '#6C4FA1';

// Ajout du composant QuestionCard avant la fonction principale
const QuestionCard = ({
  playerName,
  type,
  question,
  currentRound,
  totalRounds
}: {
  playerName: string;
  type: 'verite' | 'action';
  question: string;
  currentRound: number;
  totalRounds: number;
}) => (
  <View style={styles.cardContainer}>
    <Text style={styles.cardPlayer}>{playerName},</Text>
    <Text style={styles.cardType}>{type === 'verite' ? 'Truth!' : 'Dare!'}</Text>
    <Text style={styles.cardQuestion}>{question}</Text>
    <View style={styles.progressRow}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${(currentRound / totalRounds) * 100}%` }]} />
      </View>
      <Text style={styles.cardProgress}>{currentRound}/{totalRounds}</Text>
    </View>
  </View>
);

// Ajout du composant CardStack pour l'effet de cartes empilées
const CardStack = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.stackContainer}>
    {/* Fausse carte la plus éloignée */}
    <View style={[
      styles.fakeCard,
      {
        zIndex: 0,
        opacity: 0.75,
        transform: [{ translateY: 28 }, { scale: 1.05 }],
        backgroundColor: CARD_COLOR,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 8,
      }
    ]} />
    {/* Fausse carte du milieu */}
    <View style={[
      styles.fakeCard,
      {
        zIndex: 1,
        opacity: 0.75,
        transform: [{ translateY: 14 }, { scale: 1.025 }],
        backgroundColor: CARD_COLOR,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 4,
      }
    ]} />
    {/* Carte principale */}
    <View style={{ zIndex: 2, opacity: 1, width: '100%' }}>{children}</View>
  </View>
);

const AnimatedEllipsis = ({ style }: { style?: any }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.stagger(250, [
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0, duration: 250, useNativeDriver: true })
        ]),
        Animated.sequence([
          Animated.timing(dot2, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0, duration: 250, useNativeDriver: true })
        ]),
        Animated.sequence([
          Animated.timing(dot3, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0, duration: 250, useNativeDriver: true })
        ]),
      ])
    ).start();
  }, [dot1, dot2, dot3]);

  return (
    <Text style={[{ flexDirection: 'row', fontSize: 32, color: '#fff', textAlign: 'center', marginBottom: 12 }, style]}>
      <Animated.Text style={{ opacity: dot1 }}>.</Animated.Text>
      <Animated.Text style={{ opacity: dot2 }}>.</Animated.Text>
      <Animated.Text style={{ opacity: dot3 }}>.</Animated.Text>
    </Text>
  );
};

// Barre de progression pour la carte de vote
const VoteProgressBar = ({ current, total }: { current: number, total: number }) => (
  <View style={styles.progressRow}>
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${(current / total) * 100}%` }]} />
    </View>
    <Text style={styles.cardProgress}>{current}/{total}</Text>
  </View>
);

export default function TruthOrDareGameScreen() {
  const { id: idParam } = useLocalSearchParams();
  const id = Array.isArray(idParam) ? idParam[0] : idParam || '';
  const { user } = useAuth();
  const router = useRouter();
  const { requestReview } = useInAppReview();
  const gameAnalytics = useTruthOrDareAnalytics();
  const [game, setGame] = useState<TruthOrDareGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<TruthOrDareQuestion[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [voteTimer, setVoteTimer] = useState(10);
  const [canValidateVote, setCanValidateVote] = useState(false);
  const [voteHandled, setVoteHandled] = useState(false);
  const gameStartTime = useRef(Date.now());
  const { t } = useTranslation();
  const { getGameContent } = useLanguage();

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) setGame(docSnap.data() as TruthOrDareGameState);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const gameContent = await getGameContent('truth-or-dare');
        if (gameContent.questions && gameContent.questions.length > 0) {
          setQuestions(gameContent.questions);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des questions:', e);
      }
    };
    fetchQuestions();
  }, [getGameContent]);

  useEffect(() => {
    if (game && game.currentRound > game.totalRounds) {
      setIsGameOver(true);
      const gameDuration = Date.now() - gameStartTime.current;
      
      // Track la fin du jeu
      gameAnalytics.trackGameComplete(id, game.totalRounds, gameDuration);
      
      const timeout = setTimeout(async () => {
        await requestReview();
        router.replace(`/game/results/${id}`);
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      setIsGameOver(false);
    }
  }, [game, id, router, requestReview, gameAnalytics]);

  if (loading || !game || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>{t('game.loading')}</Text>
      </View>
    );
  }

  if (isGameOver) {
    return (
      <LinearGradient
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.gradientBg}
      >
        <StatusBar style="light" />
        <Text style={[styles.questionText, { fontSize: 30, marginBottom: 16 }]}>{t('game.truthOrDare.endTitle')}</Text>
        <Text style={[styles.questionText, { fontSize: 20, marginBottom: 32 }]}>{t('game.truthOrDare.endSubtitle')}</Text>
        <AnimatedEllipsis style={{ marginBottom: 0 }} />
      </LinearGradient>
    );
  }

  const isCurrentPlayer = game.currentPlayerId === user.uid;

  // PHASE 1 : Choix Action/Vérité
  if (game.phase === GamePhase.CHOIX) {
    if (isCurrentPlayer) {
      const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <LinearGradient
            colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
            locations={[0, 0.2, 0.5, 0.8, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.playerText}>{player?.name || 'Joueur'}</Text>
          <Text style={styles.chooseTaskText}>{t('game.truthOrDare.chooseTask')}</Text>
          <View style={styles.choiceButtonsRow}>
            <TouchableOpacity style={[styles.truthButton, styles.skewLeft]} onPress={() => handleChoice('verite')}>
              <Text style={[styles.choiceButtonText, styles.skewTextLeft]}>{t('game.truthOrDare.truth')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dareButton, styles.skewRight]} onPress={() => handleChoice('action')}>
              <Text style={[styles.choiceButtonText, styles.skewTextRight]}>{t('game.truthOrDare.dare')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <LinearGradient
            colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
            locations={[0, 0.2, 0.5, 0.8, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.spectatorChoiceContainer}>
            {/* Avatar cercle avec initiale du joueur */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{(player?.name || 'Joueur').charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.spectatorTitle}>{player?.name || 'Le joueur'} {t('game.truthOrDare.isThinking')}</Text>
            <AnimatedEllipsis style={styles.ellipsis} />
            <Text style={styles.spectatorSubtitle}>{t('game.truthOrDare.willChoose')} <Text style={{color:'#7c3aed', fontWeight:'bold'}}>{t('game.truthOrDare.action')}</Text> {t('game.truthOrDare.or')} <Text style={{color:'#f59e42', fontWeight:'bold'}}>{t('game.truthOrDare.truth')}</Text>?</Text>
          </View>
        </View>
      );
    }
  }

  // PHASE 2 : Question ou Action
  if (game.phase === 'question' || game.phase === 'action') {
    const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
    const playerName = player?.name || 'Le joueur';
    let questionText = '';
    if (game.currentQuestion && typeof (game.currentQuestion as any).text === 'string') {
      questionText = (game.currentQuestion as any).text;
    } else if (game.currentQuestion && typeof (game.currentQuestion as any).text === 'object' && (game.currentQuestion as any).text && 'text' in (game.currentQuestion as any).text) {
      questionText = (game.currentQuestion as any).text.text;
    } else {
      questionText = "Aucune question disponible pour ce choix.";
    }
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <CardStack>
          <QuestionCard
            playerName={playerName}
            type={game.currentChoice as 'verite' | 'action'}
            question={questionText}
            currentRound={game.currentRound}
            totalRounds={game.totalRounds}
          />
        </CardStack>
        {isCurrentPlayer && (
          <View style={{ marginTop: 48, width: '100%', maxWidth: 380 }}>
            <RoundedButton
              title={t('game.truthOrDare.iAnswered')}
              onPress={handleValidate}
              style={styles.gradientButton}
              textStyle={styles.gradientButtonText}
            />
            <RoundedButton
              title={t('game.truthOrDare.iRefuse')}
              onPress={handleRefuse}
              style={[styles.gradientButton, { marginTop: 16 }]}
              textStyle={styles.gradientButtonText}
            />
          </View>
        )}
      </View>
    );
  }

  // PHASE 2.5 : Vote des autres joueurs
  if (game.phase === 'vote') {
    const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
    const playerName = player?.name || 'Le joueur';
    const totalVoters = game.players.length - 1;
    const votes = game.votes || {};
    const votesCount = Object.keys(votes).length;
    const hasVoted = !!votes[user.uid];
    const isCurrentPlayer = game.currentPlayerId === user.uid;
    const badgeColor = '#7c3aed';
    const highlightColor = '#b983ff';
    const cardBgColor = 'rgba(75,39,125,0.60)';
    if (isCurrentPlayer) {
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <LinearGradient
            colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
            locations={[0, 0.2, 0.5, 0.8, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.voteCardShadow}>
            <View style={[styles.voteCard, { backgroundColor: cardBgColor }]}>
              <VoteProgressBar current={game.currentRound} total={game.totalRounds} />
              <Text style={styles.voteTitle}>{t('game.truthOrDare.voteInProgress')}</Text>
              <Text style={styles.voteSubtitle}>
                {t('game.truthOrDare.otherPlayersDecide')} <Text style={{color: highlightColor, fontWeight: 'bold'}}>{playerName}</Text> {t('game.truthOrDare.playedGame')}
              </Text>
              <AnimatedEllipsis style={styles.ellipsis} />
              <Text style={styles.voteCount}>{votesCount} / {totalVoters} {t('game.truthOrDare.votes')}</Text>
            </View>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.voteCardShadow}>
          <View style={[styles.voteCard, { backgroundColor: cardBgColor }]}>
            <VoteProgressBar current={game.currentRound} total={game.totalRounds} />
            <Text style={styles.voteTitle}>{t('game.truthOrDare.vote')}</Text>
            <Text style={styles.voteSubtitle}>
              {t('game.truthOrDare.did')} <Text style={{color: highlightColor, fontWeight: 'bold'}}>{playerName}</Text> {t('game.truthOrDare.playedGame')}?
            </Text>
            <View style={styles.voteButtons}>
              <RoundedButton
                title={t('game.truthOrDare.yes')}
                onPress={() => handleVote('yes')}
                disabled={hasVoted}
                style={styles.voteButton}
                textStyle={styles.voteButtonText}
              />
              <RoundedButton
                title={t('game.truthOrDare.no')}
                onPress={() => handleVote('no')}
                disabled={hasVoted}
                style={styles.voteButton}
                textStyle={styles.voteButtonText}
              />
            </View>
            {hasVoted && <Text style={styles.voteThanks}>{t('game.truthOrDare.thanksVote')}</Text>}
            <Text style={styles.voteCount}>{votesCount} / {totalVoters} {t('game.truthOrDare.votes')}</Text>
          </View>
        </View>
      </View>
    );
  }

  // PHASE 3 : Résultat
  if (game.phase === 'resultat') {
    const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
    const playerName = player?.name || 'Le joueur';
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.questionText}>{t('game.truthOrDare.round')} {game.currentRound} / {game.totalRounds}</Text>
        <Text style={styles.questionText}>{t('game.truthOrDare.roundEnd')} {playerName}</Text>
        {/* Affichage des scores */}
        <View style={styles.scoreBoard}>
          <Text style={styles.scoreBoardTitle}>{t('game.truthOrDare.scores')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {game?.players.map((player: any) => (
              <View key={player.id} style={styles.scoreItem}>
                <Text style={styles.scoreName}>{player.name}</Text>
                <Text style={styles.scoreValue}>{getPlayerScore(player.id)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <RoundedButton
          title={t('game.truthOrDare.next')}
          onPress={handleNextRound}
          style={styles.nextButton}
          textStyle={styles.nextButtonText}
        />
      </View>
    );
  }

  // Fonction utilitaire pour vérifier si l'utilisateur est un spectateur
  const isSpectator = game && user && !game.players.some((p: any) => String(p.id) === String(user.uid));

  // Fonction utilitaire pour obtenir le score d'un joueur
  const getPlayerScore = (playerId: string) => {
    return game?.scores?.[playerId] || 0;
  };

  // Fonction pour valider le vote
  const handleValidateVote = async () => {
    if (!game || !user) return;
    
    const db = getFirestore();
    const totalVoters = game.players.length - 1;
    const votes = game.votes || {};
    const yes = Object.values(votes).filter(v => v === 'yes').length;
    const no = Object.values(votes).filter(v => v === 'no').length;
    
    let points = 0;
    if (yes > no) points = 1;
    else if (no > yes) points = 0;
    
    const scores = { ...game.scores };
    scores[game.currentPlayerId] = (scores[game.currentPlayerId] || 0) + points;

    // Sélectionne le prochain joueur
    const currentIndex = game.players.findIndex((p: any) => String(p.id) === String(game.currentPlayerId));
    const nextIndex = (currentIndex + 1) % game.players.length;
    const nextPlayer = game.players[nextIndex];
    
    console.log('[DEBUG] handleValidateVote', {
      currentPlayerId: game.currentPlayerId,
      currentIndex,
      nextIndex,
      nextPlayer,
      scores,
      points
    });

    if (!nextPlayer) {
      console.error('Erreur: Impossible de trouver le prochain joueur');
      return;
    }

    // Met à jour le jeu avec les nouveaux scores et passe au tour suivant
    await updateDoc(doc(db, 'games', String(id)), {
      scores,
      currentPlayerId: nextPlayer.id,
      phase: 'choix',
      currentChoice: null,
      currentQuestion: null,
      currentRound: game.currentRound + 1,
      votes: {}
    });
  };

  // Timer pour le vote
  useEffect(() => {
    if (game?.phase === 'vote') {
      setVoteTimer(10);
      setCanValidateVote(false);
      
      const interval = setInterval(() => {
        setVoteTimer((t) => {
          if (t <= 1) {
            setCanValidateVote(true);
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [game?.phase]);

  // Vérification si tous ont voté
  useEffect(() => {
    if (
      game?.phase === 'vote' &&
      !voteHandled
    ) {
      const totalVoters = game.players.length - 1;
      const votes = game.votes || {};
      console.log('[DEBUG] PHASE VOTE', {
        totalVoters,
        votes,
        votesCount: Object.keys(votes).length,
        voteHandled
      });
      if (Object.keys(votes).length === totalVoters && totalVoters > 0) {
        console.log('[DEBUG] Tous les votes sont là, on passe au tour suivant');
        setVoteHandled(true);
        handleValidateVote();
      }
      // Cas 1 joueur : on passe direct au tour suivant
      if (totalVoters === 0) {
        console.log('[DEBUG] Cas 1 joueur, on passe direct au tour suivant');
        setVoteHandled(true);
        handleValidateVote();
      }
    }
    // On reset le flag à chaque nouveau tour
    if (game?.phase !== 'vote' && voteHandled) {
      console.log('[DEBUG] Reset voteHandled');
      setVoteHandled(false);
    }
  }, [game?.votes, game?.phase]);

  // Composant d'affichage des scores
  const ScoreBoard = () => (
    <View style={styles.scoreBoard}>
      <Text style={styles.scoreBoardTitle}>{t('game.truthOrDare.scores')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {game?.players.map((player: any) => (
          <View key={player.id} style={styles.scoreItem}>
            <Text style={styles.scoreName}>{player.name}</Text>
            <Text style={styles.scoreValue}>{getPlayerScore(player.id)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // --- Handlers synchronisés ---
  async function handleChoice(choice: 'verite' | 'action') {
    if (!game || !user) return;
    
    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'games', id), {
        currentChoice: choice,
        phase: 'question'
      });
      
      // Track le choix
      await gameAnalytics.trackChoice(id, choice);
    } catch (error) {
      console.error('Erreur lors du choix:', error);
    }
  }

  async function handleValidate() {
    const db = getFirestore();
    await updateDoc(doc(db, 'games', String(id)), {
      phase: 'vote',
      votes: {}
    });
  }

  async function handleRefuse() {
    const db = getFirestore();
    await updateDoc(doc(db, 'games', String(id)), {
      phase: 'vote',
      votes: {}
    });
  }

  async function handleVote(vote: 'yes' | 'no') {
    if (!game || !user) return;
    
    try {
      const db = getFirestore();
      const voteField = game.spectators?.includes(user.uid) ? 'spectatorVotes' : 'votes';
      await updateDoc(doc(db, 'games', id), {
        [voteField]: {
          ...game[voteField],
          [user.uid]: vote
        }
      });
      
      // Track le vote
      await gameAnalytics.trackVote(id, vote, user.uid);
    } catch (error) {
      console.error('Erreur lors du vote:', error);
    }
  }

  async function handleNextRound() {
    if (!game) return;
    
    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'games', id), {
        currentRound: game.currentRound + 1,
        phase: 'choice',
        currentChoice: null,
        votes: {},
        spectatorVotes: {}
      });
      
      // Track la fin du round
      await gameAnalytics.trackRoundComplete(id, game.currentRound, game.totalRounds);
    } catch (error) {
      console.error('Erreur lors du passage au round suivant:', error);
    }
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d1b4e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4b277d',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  questionText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  nextButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreBoard: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    zIndex: 1,
  },
  scoreBoardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  scoreItem: {
    backgroundColor: 'rgba(108, 92, 231, 0.8)',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  scoreName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  voteButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginVertical: 24,
    width: '100%',
  },
  voteButton: {
    flex: 1,
    borderRadius: 24,
    marginHorizontal: 6,
    paddingVertical: 16,
    paddingHorizontal: 28,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  voteCount: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  voteThanks: {
    color: '#C471F5',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  playerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  chooseTaskText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  choiceButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  truthButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 28,
    paddingHorizontal: 36,
    borderRadius: 18,
    marginRight: 14,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },
  dareButton: {
    backgroundColor: '#f59e42',
    paddingVertical: 28,
    paddingHorizontal: 36,
    borderRadius: 18,
    marginLeft: 14,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },
  skewLeft: {
    transform: [{ skewX: '-2deg' }],
  },
  skewRight: {
    transform: [{ skewX: '2deg' }],
  },
  choiceButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  skewTextLeft: {
    transform: [{ skewX: '2deg' }],
  },
  skewTextRight: {
    transform: [{ skewX: '-2deg' }],
  },
  gradientBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    backgroundColor: CARD_COLOR,
    borderRadius: 36,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    maxWidth: 380,
    shadowColor: 'transparent',
  },
  cardPlayer: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'lowercase',
  },
  cardType: {
    color: '#e0d6ff',
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  cardQuestion: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 1,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  progressBarContainer: {
    flex: 1,
    height: 7,
    backgroundColor: '#3a185a',
    borderRadius: 4,
    marginBottom: 0,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: 7,
    backgroundColor: '#C471F5',
    borderRadius: 4,
  },
  cardProgress: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    minWidth: 48,
    opacity: 0.85,
  },
  stackContainer: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  fakeCard: {
    position: 'absolute',
    borderRadius: 36,
    height: 270,
    width: '100%',
    zIndex: 0,
  },
  gradientButton: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 18,
    marginBottom: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  gradientButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spectatorChoiceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 40,
    padding: 24,
    backgroundColor: 'rgba(75, 39, 125, 0.25)',
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  spectatorTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  spectatorSubtitle: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 0,
  },
  ellipsis: {
    marginBottom: 8,
  },
  voteCardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    borderRadius: 36,
    alignSelf: 'stretch',
    marginHorizontal: 12,
  },
  voteCard: {
    borderRadius: 36,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 60,
    minWidth: 0,
  },
  voteRoundBadge: {
    backgroundColor: '#7c3aed',
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    borderRadius: 32,
    paddingHorizontal: 22,
    paddingVertical: 7,
    marginBottom: 18,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  voteTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  voteSubtitle: {
    color: '#fff',
    fontSize: 19,
    marginBottom: 18,
    textAlign: 'center',
  },
}); 