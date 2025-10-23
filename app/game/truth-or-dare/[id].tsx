import React, { useEffect, useState, useRef } from 'react';
import Svg, { Path } from 'react-native-svg';
import { View, Text, ActivityIndicator, Alert, StyleSheet, ScrollView, Image, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { GameState, GamePhase } from '@/types/gameTypes';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native';
import { useInAppReview } from '@/hooks/useInAppReview';
import { useTruthOrDareAnalytics } from '@/hooks/useTruthOrDareAnalytics';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTruthOrDareQuestions } from '@/hooks/truth-or-dare-questions';
import { usePoints } from '@/hooks/usePoints';
import GameResults from '@/components/game/GameResults';
import SkewedButton from '@/components/game/SkewedButton';
import Colors from '@/constants/Colors';
import HalloweenDecorations from '@/components/HalloweenDecorations';

interface TruthOrDareQuestion { text: string; type: string; }

// Ajout du type local pour ce mode de jeu
interface TruthOrDareGameState extends Omit<GameState, 'phase'> {
  currentPlayerId: string;
  currentChoice: 'verite' | 'action' | null;
  phase: string;
  votes?: { [playerId: string]: 'yes' | 'no' };
  spectatorVotes?: { [playerId: string]: 'yes' | 'no' };
  spectators?: string[];
  playerScores: { [playerId: string]: number };
  gameMode: 'truth-or-dare';
}

const CARD_COLOR = '#00A3E0';
const CARD_DARK = '#FF6600';

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
    {/* Dégradé de fond pour la carte */}
    <LinearGradient
      colors={["#00B7FF", "#FF6600"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    <View style={{ alignItems: 'center', marginBottom: 16 }}>
      <View style={{ backgroundColor: CARD_DARK, borderRadius: 36, paddingVertical: 4, paddingHorizontal: 18, marginBottom: 8 }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{playerName}</Text>
      </View>
      <Text style={{ color: '#FFEDCC', fontSize: 16, fontWeight: '600', opacity: 0.9 }}>
        {type === 'verite' ? 'Vérité !' : 'Action !'}
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

// Ajout du composant CardStack pour l'effet de cartes empilées
const CardStack = ({ children }: { children: React.ReactNode }) => (
    <View style={[styles.stackContainer, { paddingHorizontal: 20 }]}>
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

// Séparateur zigzag SVG entre les deux boutons, superposé et centré (version esthétique et symétrique)
const ZigzagDivider = () => (
    <View style={styles.zigzagWrapper}>
      <Svg
          height="100%"
          width={36}
          viewBox="0 0 36 100"
          preserveAspectRatio="none"
      >
        <Path
            d="M18,0 L36,12 L18,25 L36,37 L18,50 L36,62 L18,75 L36,87 L18,100 L0,87 L18,75 L0,62 L18,50 L0,37 L18,25 L0,12 Z"
            fill="#0E1117"
        />
      </Svg>
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

const TruthOrDareChoiceButtons = ({ onSelect }: { onSelect: (choice: 'verite' | 'action') => void }) => {
  const { t } = useTranslation();
  return (
    <View style={[styles.choiceButtonsRowContainer]}>
      <View style={styles.choiceButtonsRow}>
        <SkewedButton
          text={t('game.truthOrDare.truth')}
          iconSource={require('@/assets/jeux/action-verite/dare.png')}
          backgroundColor="#00B7FF"
          skewDirection="left"
          onPress={() => onSelect('verite')}
          style={styles.choiceButtonLeft}
          textStyle={styles.choiceButtonText}
        />
        <ZigzagDivider />
        <SkewedButton
          text={t('game.truthOrDare.dare')}
          iconSource={require('@/assets/jeux/action-verite/truth.png')}
          backgroundColor="#FF6600"
          skewDirection="right"
          onPress={() => onSelect('action')}
          style={styles.choiceButtonRight}
          textStyle={styles.choiceButtonText}
        />
      </View>
    </View>
  );
};

export default function TruthOrDareGameScreen() {
  const { id: idParam } = useLocalSearchParams();
  const id = Array.isArray(idParam) ? idParam[0] : idParam || '';
  const { user } = useAuth();
  const router = useRouter();
  const { requestReview } = useInAppReview();
  const gameAnalytics = useTruthOrDareAnalytics();
  const { awardGamePoints } = usePoints();
  const [game, setGame] = useState<TruthOrDareGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<TruthOrDareQuestion[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [voteTimer, setVoteTimer] = useState(10);
  const [canValidateVote, setCanValidateVote] = useState(false);
  const [voteHandled, setVoteHandled] = useState(false);
  const gameStartTime = useRef(Date.now());
  const { t } = useTranslation();
  const { getGameContent, language } = useLanguage();
  const { getRandomQuestion, resetAskedQuestions, isLoadingQuestions } = useTruthOrDareQuestions();

  const handleNextRound = async () => {
    if (!game || !user) return;
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));

      await gameAnalytics.trackRoundComplete(
          String(id),
          game.currentRound,
          game.totalRounds
      );

      await updateDoc(gameRef, {
        currentRound: game.currentRound + 1,
        phase: 'choix',
        currentQuestion: null,
        answers: [],
        votes: {},
        winningAnswerId: null,
        gameMode: 'truth-or-dare'
      });
    } catch (error) {
      console.error('Error moving to next round:', error);
      Alert.alert(
          t('game.error'),
          t('game.truthOrDare.errorNextRound')
      );
    }
  };

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const gameData = docSnap.data() as TruthOrDareGameState;
        // S'assurer que le gameMode est défini
        if (!gameData.gameMode) {
          updateDoc(gameRef, {
            gameMode: 'truth-or-dare'
          }).catch(e => console.error("Error updating gameMode:", e));
        }
        setGame(gameData);
      }
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
          console.log('[DEBUG] Questions chargées:', gameContent.questions);
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
      if (id) {
        gameAnalytics.trackGameComplete(String(id), game.totalRounds, gameDuration);

        // Les points sont attribués par GameResults.tsx via useLeaderboard
        // Pas besoin d'appeler awardGamePoints ici pour éviter les doublons
      }
    } else {
      setIsGameOver(false);
    }
  }, [game, id, router, requestReview, gameAnalytics, awardGamePoints]);

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
    return undefined; // Correction TS7030 : toutes les branches retournent une valeur
  }, [game?.phase]);

  // Vérification si tous ont voté et passage à l'étape suivante
  useEffect(() => {
    if (!game) return;

    console.log('[DEBUG] useEffect vote check déclenché', {
      phase: game.phase,
      voteHandled,
      votes: game.votes
    });

    // Si on est en phase de vote et que voteHandled est true, on valide les votes
    if (game.phase === 'vote' && voteHandled) {
      console.log('[DEBUG] voteHandled est true, validation des votes...');

      // Définition de la fonction à exécuter ici, dans la portée de l'effet
      const validateVotes = async () => {
        console.log('[DEBUG] Exécution de validateVotes dans useEffect');
        if (!game || !user || !id) {
          console.log('[DEBUG] validateVotes: conditions non remplies', {
            gameExists: !!game,
            userExists: !!user,
            idExists: !!id
          });
          return;
        }

        try {
          const db = getFirestore();
          const totalVoters = game.players.length - 1;
          const votes = game.votes || {};
          const yes = Object.values(votes).filter(v => v === 'yes').length;
          const no = Object.values(votes).filter(v => v === 'no').length;

          console.log('[DEBUG] Comptage des votes dans validateVotes:', {
            totalVoters,
            votes,
            yes,
            no,
            currentPlayerId: game.currentPlayerId
          });

          // Si le joueur courant n'existe pas dans le jeu, on prend le premier joueur
          let currentPlayerId = game.currentPlayerId;
          if (!currentPlayerId || !game.players.some(p => String(p.id) === String(currentPlayerId))) {
            console.log('[DEBUG] Joueur courant non trouvé, sélection du premier joueur');
            const firstPlayer = game.players[0];
            if (firstPlayer) {
              currentPlayerId = firstPlayer.id;
            } else {
              console.error('[DEBUG] Erreur: Aucun joueur dans la partie');
              return;
            }
          }

          // Calcul des points
          let points = 0;
          if (yes > no) points = 1;
          else if (no > yes) points = 0;

          // Cas spécial d'un seul joueur: on donne automatiquement le point
          if (totalVoters === 0) {
            console.log('[DEBUG] Cas spécial: aucun votant, attribution automatique du point');
            points = 1;
          }

          // Utilisons un objet vide comme fallback si game.scores est undefined
          const scores = { ...(game.scores || {}) };
          scores[currentPlayerId] = (scores[currentPlayerId] || 0) + points;

          // Sélectionne le prochain joueur
          const currentIndex = game.players.findIndex((p: any) => String(p.id) === String(currentPlayerId));
          const nextIndex = (currentIndex + 1) % game.players.length;
          const nextPlayer = game.players[nextIndex];

          console.log('[DEBUG] Prochain joueur:', {
            currentPlayerId,
            currentIndex,
            nextIndex,
            nextPlayer: nextPlayer?.id,
            scores,
            points
          });

          if (!nextPlayer) {
            console.error('[DEBUG] Erreur: Impossible de trouver le prochain joueur');
            return;
          }

          // Met à jour le jeu avec les nouveaux scores et passe au tour suivant
          const updateData = {
            scores,
            currentPlayerId: nextPlayer.id,
            phase: 'choix',
            currentChoice: null,
            currentQuestion: null,
            currentRound: game.currentRound + 1,
            votes: {},
            spectatorVotes: {}
          };

          console.log('[DEBUG] Mise à jour du jeu:', updateData);

          await updateDoc(doc(db, 'games', String(id)), updateData);
          console.log('[DEBUG] Jeu mis à jour avec succès, passage au joueur suivant');
        } catch (error) {
          console.error('[DEBUG] Erreur lors de la mise à jour du jeu:', error);
        }
      };

      // Exécuter la validation
      validateVotes();
    }
    // Cas où on est en phase de vote et que tous les joueurs ont voté
    else if (game.phase === 'vote' && !voteHandled) {
      const totalVoters = game.players.length - 1;
      const votes = game.votes || {};
      const votesCount = Object.keys(votes).length;

      console.log('[DEBUG] Vérification des votes dans useEffect:', {
        phase: game.phase,
        voteHandled,
        totalVoters,
        votes,
        votesCount
      });

      // Vérifions également s'il y a au moins un votant, sinon validons immédiatement
      if ((votesCount >= totalVoters && totalVoters > 0) || totalVoters === 0) {
        console.log('[DEBUG] Condition de validation de vote satisfaite:', {
          votesCount,
          totalVoters,
          condition1: votesCount >= totalVoters && totalVoters > 0,
          condition2: totalVoters === 0
        });
        setVoteHandled(true);
      }
    }

    // On reset le flag à chaque nouveau tour
    if (game.phase !== 'vote' && voteHandled) {
      console.log('[DEBUG] Reset voteHandled');
      setVoteHandled(false);
    }
  }, [game, voteHandled, game?.votes, game?.phase, user, id]);

  if (loading || !game || !user || isLoadingQuestions) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c5ce7" />
          <Text style={styles.loadingText}>{t('game.loading')}</Text>
        </View>
    );
  }

  if (isGameOver) {
    return (
        <View style={styles.gameOverContainer}>
          <LinearGradient
              colors={["#00B7FF", "#FF6600"]}
              locations={[0, 1]}
              style={StyleSheet.absoluteFillObject}
          />
          <GameResults
              players={game?.players || []}
              scores={game?.playerScores || {}}
              userId={user?.uid || ''}
              pointsConfig={{
                firstPlace: 30,
                secondPlace: 20,
                thirdPlace: 10
              }}
          />
        </View>
    );
  }

  const isCurrentPlayer = game.currentPlayerId === user.uid;

  // PHASE 1 : Choix Action/Vérité
  if (game.phase === GamePhase.CHOIX) {
    if (isCurrentPlayer) {
      const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
      return (
        <SafeAreaView style={styles.phaseWithButtonsContainer}>
          <StatusBar style="light" />
          <LinearGradient
            colors={["#00B7FF", "#FF6600"]}
            locations={[0, 1]}
            style={StyleSheet.absoluteFillObject}
          >
            {/* Décorations Halloween */}
            <HalloweenDecorations />
            
          </LinearGradient>
          <View style={styles.topContentContainer}>
            <Text style={styles.playerText}>{player?.name || t('game.player', 'Joueur')}</Text>
            <Text style={styles.chooseTaskText}>{t('game.truthOrDare.chooseTask')}</Text>
          </View>
          <TruthOrDareChoiceButtons onSelect={handleChoice} />
        </SafeAreaView>
      );
    } else {
      const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
      return (
          <SafeAreaView style={styles.phaseWithButtonsContainer}>
            <StatusBar style="light" />
            <LinearGradient
                colors={["#00B7FF", "#FF6600"]}
                locations={[0, 1]}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.spectatorChoiceContainer}>
              {/* Avatar cercle avec initiale du joueur */}
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{(player?.name || 'Joueur').charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.spectatorTitle}>{player?.name || t('game.player', 'Le joueur')} {t('game.truthOrDare.isThinking')}</Text>
              <AnimatedEllipsis style={styles.ellipsis} />
              <Text style={styles.spectatorSubtitle}>
                {t('game.truthOrDare.willChoose')} <Text style={{ color: '#FF6600', fontWeight: 'bold' }}>{t('game.truthOrDare.action')}</Text> {t('game.truthOrDare.or')} <Text style={{ color: '#00B7FF', fontWeight: 'bold' }}>{t('game.truthOrDare.truth')}</Text>?
              </Text>
            </View>
          </SafeAreaView>
      );
    }
  }

  // PHASE 2 : Question ou Action
  if (game.phase === 'question' || game.phase === 'action') {
    const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
    const playerName = player?.name || 'Le joueur';
    const currentQuestion = game.currentQuestion as any;
    let questionText = "Aucune question disponible pour ce choix.";

    if (currentQuestion && currentQuestion.text) {
      if (typeof currentQuestion.text === 'string') {
        questionText = currentQuestion.text;
      } else if (typeof currentQuestion.text === 'object' && 'text' in currentQuestion.text && typeof currentQuestion.text.text === 'string') {
        questionText = currentQuestion.text.text;
      }
    }
    return (
        <SafeAreaView style={styles.phaseWithButtonsContainer}>
          <StatusBar style="light" />
          <LinearGradient
              colors={["#00B7FF", "#FF6600"]}
              locations={[0, 1]}
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
              <View style={styles.answerButtonsContainer}>
                <View style={styles.choiceButtonsRow}>
                  <SkewedButton
                    text={t('game.truthOrDare.iAnswered')}
                    backgroundColor="#00B7FF"
                    skewDirection="left"
                    onPress={handleValidate}
                    disabled={game.phase !== 'question' && game.phase !== 'action'}
                    style={styles.choiceButtonLeft}
                    textStyle={styles.choiceButtonText}
                    iconSource={require('@/assets/jeux/action-verite/dare.png')}
                  />
                  <ZigzagDivider />
                  <SkewedButton
                    text={t('game.truthOrDare.iRefuse')}
                    backgroundColor="#FF6600"
                    skewDirection="right"
                    onPress={handleRefuse}
                    disabled={game.phase !== 'question' && game.phase !== 'action'}
                    style={styles.choiceButtonRight}
                    textStyle={styles.choiceButtonText}
                    iconSource={require('@/assets/jeux/action-verite/truth.png')}
                  />
                </View>
              </View>
          )}
        </SafeAreaView>
    );
  }

  // PHASE 2.5 : Vote des autres joueurs
  if (game.phase === 'vote') {
    const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
    const playerName = player?.name || t('game.player', 'Le joueur');
    const totalVoters = game.players.length - 1;
    const votes = game.votes || {};
    const votesCount = Object.keys(votes).length;
    const hasVoted = !!votes[user.uid];
    const isCurrentPlayer = game.currentPlayerId === user.uid;
    const highlightColor = '#FF6600';
    const cardBgColor = 'rgba(0, 183, 255, 0.25)';
    if (isCurrentPlayer) {
      return (
          <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={["#00B7FF", "#FF6600"]}
                locations={[0, 1]}
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
    if (game.phase === 'vote' && !isCurrentPlayer) {
      return (
          <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={["#00B7FF", "#FF6600"]}
                locations={[0, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingBottom: 100 }}>
              <View style={styles.voteCardShadow}>
                <View style={[styles.voteCard, { backgroundColor: cardBgColor }]}>
                  <VoteProgressBar current={game.currentRound} total={game.totalRounds} />
                  <Text style={styles.voteTitle}>{t('game.truthOrDare.vote')}</Text>
                  <Text style={styles.voteSubtitle}>
                    {t('game.truthOrDare.did')} <Text style={{color: highlightColor, fontWeight: 'bold'}}>{playerName}</Text> {t('game.truthOrDare.playedGame')}?
                  </Text>
                  {hasVoted && <Text style={styles.voteThanks}>{t('game.truthOrDare.thanksVote')}</Text>}
                  <Text style={styles.voteCount}>{votesCount} / {totalVoters} {t('game.truthOrDare.votes')}</Text>
                </View>
              </View>
            </View>

            {!hasVoted && (
              <View style={[styles.choiceButtonsRowContainer]}>
                <View style={styles.choiceButtonsRow}>
                  <SkewedButton
                    text={t('game.truthOrDare.yes')}
                    backgroundColor="#00B7FF"
                    skewDirection="left"
                    onPress={() => handleVote('yes')}
                    disabled={hasVoted}
                    style={styles.choiceButtonLeft}
                    textStyle={styles.choiceButtonText}
                    iconSource={require('@/assets/jeux/action-verite/dare.png')}
                  />
                  <ZigzagDivider />
                  <SkewedButton
                    text={t('game.truthOrDare.no')}
                    backgroundColor="#FF6600"
                    skewDirection="right"
                    onPress={() => handleVote('no')}
                    disabled={hasVoted}
                    style={styles.choiceButtonRight}
                    textStyle={styles.choiceButtonText}
                    iconSource={require('@/assets/jeux/action-verite/truth.png')}
                  />
                </View>
              </View>
            )}
          </View>
      );
    }
  }

  // PHASE 3 : Résultat
  if (game.phase === 'resultat') {
    const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
    const playerName = player?.name || t('game.player', 'Le joueur');
    return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <LinearGradient
              colors={["#00B7FF", "#FF6600"]}
              locations={[0, 1]}
              style={StyleSheet.absoluteFillObject}
          />
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
          <SkewedButton
              text={t('game.truthOrDare.next')}
              backgroundColor="#00B7FF"
              skewDirection="left"
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
    if (!game || !user || !id) return;

    try {
      const db = getFirestore();

      // Mapping des choix utilisateur aux types de questions dans Firebase par langue
      const typeMapping: { [key: string]: { verite: string; action: string } } = {
        fr: { verite: 'verite', action: 'action' },
        en: { verite: 'truth', action: 'dare' },
        es: { verite: 'verdad', action: 'reto' },
        it: { verite: 'verità', action: 'sfida' },
        ar: { verite: 'حقيقة', action: 'تحدي' },
        // Ajouter d'autres langues si nécessaire
      };

      const currentLanguageCode = language || 'fr'; // Fallback au français
      const firebaseQuestionType = typeMapping[currentLanguageCode]?.[choice];

      if (!firebaseQuestionType) {
        console.error(`Type de question inconnu pour la langue ${currentLanguageCode}: ${choice}`);
        Alert.alert(
            t('game.error'),
            t('game.truthOrDare.errorSelectingQuestion') // Utilisez une clé de traduction appropriée
        );
        return;
      }

      // Sélectionner la prochaine question en passant le type de Firebase
      const nextQuestion = getRandomQuestion(firebaseQuestionType as 'verite' | 'action'); // Caster le type pour TypeScript

      if (!nextQuestion) {
        Alert.alert(
            t('game.error'),
            t('game.truthOrDare.noQuestionsAvailable')
        );
        console.error('Aucune question disponible après le choix.');
        return;
      }

      await updateDoc(doc(db, 'games', String(id)), {
        currentChoice: choice,
        phase: 'question',
        currentQuestion: nextQuestion,
      });

      // Track le choix
      await gameAnalytics.trackChoice(String(id), choice);
    } catch (error) {
      console.error('Erreur lors du choix:', error);
    }
  }

  async function handleValidate() {
    if (!id) return;
    const db = getFirestore();
    await updateDoc(doc(db, 'games', String(id)), {
      phase: 'vote',
      votes: {}
    });
  }

  async function handleRefuse() {
    if (!id) return;
    const db = getFirestore();
    await updateDoc(doc(db, 'games', String(id)), {
      phase: 'vote',
      votes: {}
    });
  }

  async function handleVote(vote: 'yes' | 'no') {
    console.log('[DEBUG] handleVote appelé avec vote:', vote, 'id:', id, 'user:', user?.uid);
    if (!game || !user || !id) {
      console.log('[DEBUG] Conditions non remplies:', {
        gameExists: !!game,
        userExists: !!user,
        idExists: !!id
      });
      return;
    }

    try {
      const db = getFirestore();
      // On vérifie si l'utilisateur est un spectateur en utilisant le champ spectators s'il existe, sinon on vérifie dans la liste des joueurs
      const isSpectator = game.spectators ?
          game.spectators.includes(user.uid) :
          !game.players.some((p: any) => String(p.id) === String(user.uid));

      const voteField = isSpectator ? 'spectatorVotes' : 'votes';

      console.log('[DEBUG] Vote en cours:', {
        isSpectator,
        voteField,
        currentVotes: game[voteField] || {},
        userVote: vote,
        spectators: game.spectators,
        playerIds: game.players.map(p => p.id)
      });

      // Créons une copie des votes actuels plus ce nouveau vote
      const updatedVotes = {
        ...(game[voteField] || {}),
        [user.uid]: vote
      };

      // Mettons à jour les votes dans Firestore
      await updateDoc(doc(db, 'games', String(id)), {
        [voteField]: updatedVotes
      });

      console.log('[DEBUG] Vote enregistré avec succès');

      // Vérifions immédiatement si tous les joueurs ont voté
      const totalVoters = game.players.length - 1;
      const votesCount = Object.keys(updatedVotes).length;

      console.log('[DEBUG] Vérification des votes après enregistrement:', {
        totalVoters,
        votesCount,
        votes: updatedVotes,
        voteHandled
      });

      // Si tous les joueurs ont voté ou s'il n'y a qu'un joueur, signalons que les votes sont complets
      // Mais ne tentons pas d'appeler directement handleValidateVote
      if ((votesCount >= totalVoters && totalVoters > 0) || totalVoters === 0) {
        console.log('[DEBUG] Tous les votes sont présents, marquage pour validation');
        // Au lieu d'appeler directement handleValidateVote, on met à jour l'état pour que l'effet s'en occupe
        setVoteHandled(true);
      }

      // Track le vote
      await gameAnalytics.trackVote(String(id), vote, user.uid);
    } catch (error) {
      console.error('[DEBUG] Erreur lors du vote:', error);
    }
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00B7FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00B7FF',
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
    paddingVertical: 20,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    transform: [{ skewX: '0deg' }], // Neutralise l'effet skew par défaut
  },
  disabledButton: {
    opacity: 0.5,
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'transparent', // Supprime l'ombre du texte par défaut du SkewedButton
  },
  voteCount: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  voteThanks: {
    color: '#FF6600',
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
  choiceButtonsRowContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  choiceButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 0,
  },
  zigzagWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 36,
    transform: [{ translateX: -18 }],
    zIndex: 10,
  },
  choiceButtonLeft: {
    flex: 0.5,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    paddingVertical: 20,
  },
  choiceButtonRight: {
    flex: 0.5,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    paddingVertical: 20,
  },
  choiceButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  answerButtonLeft: {
    flex: 0.5,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  answerButtonRight: {
    flex: 0.5,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  answerButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  gradientBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#00B7FF',
  },
  cardContainer: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
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
    fontSize: 24,
    lineHeight: 32,
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
    backgroundColor: '#FF6600',
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
  spectatorChoiceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 40,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    backdropFilter: 'blur(22px)',
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
    lineHeight: 24,
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
  gameOverContainer: {
    flex: 1,
  },
  topContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  answerButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
    paddingBottom: 0,
    marginHorizontal: 0,
  },
  phaseWithButtonsContainer: {
    flex: 1,
    backgroundColor: '#00B7FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  voteButtonsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
});