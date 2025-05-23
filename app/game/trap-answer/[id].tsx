import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GamePhase, Player } from '@/types/gameTypes';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getQuestions } from './questions';
import { TrapAnswer, TrapPlayerAnswer, TrapQuestion } from "@/types/types";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import RoundedButton from '@/components/RoundedButton';
import GameResults from '@/components/game/GameResults';
import { usePoints } from '@/hooks/usePoints';

interface TrapGameState {
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
  gameMode: 'trap-answer';
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

export default function TrapAnswerGame() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const gameId = typeof id === 'string' ? id : id?.[0] || '';
  const { user } = useAuth();
  const { gameState, updateGameState } = useGame<TrapGameState>(gameId);
  const { awardGamePoints } = usePoints();

  // Timer pour la barre de temps (UI only)
  const TIMER_DURATION = 25; // secondes
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Log pour inspecter gameState dès qu'il change
  useEffect(() => {
    if (gameState) {
      console.log('[DEBUG GAME STATE]', JSON.stringify(gameState));
      console.log('[DEBUG GAME STATE] History:', JSON.stringify(gameState.history));
      console.log('[DEBUG GAME STATE] Current Round:', gameState.currentRound);
    }
  }, [gameState]); // Dépend de gameState pour se déclencher à chaque mise à jour

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!gameState || gameState.questions?.length > 0) return;
      
      const fetchedQuestions = await getQuestions();
      if (fetchedQuestions.length > 0) {
        const firstQuestion = getRandomQuestion(fetchedQuestions, []);
        if (firstQuestion) {
          const initialPlayersHistory: { [playerId: string]: number[] } = (gameState?.players || []).reduce((acc: { [playerId: string]: number[] }, player) => {
            acc[player.id] = Array(gameState?.totalRounds || 5).fill(0);
            return acc;
          }, {});

          updateGameState({
            questions: fetchedQuestions,
            currentQuestion: firstQuestion,
            askedQuestionIds: [firstQuestion.id],
            phase: GamePhase.QUESTION,
            currentRound: 0,
            history: initialPlayersHistory,
            playerAnswers: {},
            gameMode: 'trap-answer'
          });
        } else {
          updateGameState({ phase: GamePhase.END });
        }
      } else {
        updateGameState({ phase: GamePhase.END });
      }
    };

    fetchQuestions();
  }, [gameState?.questions?.length]);

  useEffect(() => {
    if (gameState?.phase === GamePhase.QUESTION) {
      setTimeLeft(TIMER_DURATION);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState?.phase, gameState?.currentQuestion]);

  const calculateScore = (answer: TrapAnswer): number => {
    if (answer.isCorrect) return 1;
    if (answer.isTrap) return -1;
    return 0;
  };

  const getRandomQuestion = (allQuestions: TrapQuestion[], askedIds: string[]): TrapQuestion | null => {
    const available = allQuestions.filter(q => !askedIds.includes(q.id));
    if (available.length === 0) return null;
    const question = available[Math.floor(Math.random() * available.length)] || null;
    
    if (question) {
      // Mélanger les réponses
      const shuffledAnswers = [...question.answers].sort(() => Math.random() - 0.5);
      return {
        ...question,
        answers: shuffledAnswers
      };
    }
    return null;
  };

  const nextQuestion = () => {
    if (!gameState?.questions?.length) return;
    
    const nextQ = getRandomQuestion(
      gameState.questions,
      [...(gameState.askedQuestionIds || []), gameState.currentQuestion?.id].filter((id): id is string => !!id)
    );

    if (nextQ) {
      updateGameState({
        currentQuestion: nextQ,
        askedQuestionIds: [...(gameState.askedQuestionIds || []), nextQ.id],
        playerAnswers: {},
        phase: GamePhase.QUESTION,
        currentRound: (gameState.currentRound ?? 0) + 1,
      });
    } else {
      updateGameState({ phase: GamePhase.END });
    }
  };

  const handleAnswer = (answer: TrapAnswer) => {
    if (!user || !gameState?.currentQuestion || gameState.phase !== GamePhase.QUESTION) return;
    if (gameState.playerAnswers?.[user.uid]) return;

    const newPlayerAnswer: TrapPlayerAnswer = {
      answer: answer.text,
      isCorrect: answer.isCorrect,
      isTrap: answer.isTrap
    };

    const newAnswers = {
      ...(gameState.playerAnswers || {}),
      [user.uid]: newPlayerAnswer,
    };

    const score = calculateScore(answer);
    const newScores = {
      ...(gameState.scores || {}),
      [user.uid]: (gameState.scores?.[user.uid] || 0) + score,
    };

    // Historique robuste : toujours un array de la bonne taille
    const totalRounds = gameState.totalRounds || 5;
    const baseHistory = (gameState as any)?.history || {};
    const newHistory = { ...baseHistory };
    if (!newHistory[user.uid]) newHistory[user.uid] = [];
    // Remplir l'array jusqu'à totalRounds
    while (newHistory[user.uid].length < totalRounds) {
      newHistory[user.uid].push(0);
    }
    newHistory[user.uid][gameState.currentRound] = answer.isCorrect ? 1 : answer.isTrap ? -1 : 0;

    const updateData: Partial<TrapGameState> = {
      scores: newScores,
      playerAnswers: newAnswers,
      history: newHistory,
    };

    Object.keys(updateData).forEach(key => {
      const typedKey = key as keyof typeof updateData;
      if (updateData[typedKey] === undefined) {
        delete updateData[typedKey];
      }
    });

    updateGameState(updateData);
  };

  const isContinueButtonEnabled =
    gameState?.phase === GamePhase.QUESTION &&
    gameState?.players?.length > 0 &&
    Object.keys(gameState?.playerAnswers || {}).length === gameState?.players?.length;

  // Pour la démo, on prend les deux premiers joueurs
  const leftPlayer = (gameState?.players || [])[0];
  const rightPlayer = (gameState?.players || [])[1];

  if (!gameState) return null;

  if (gameState.phase === GamePhase.END) {
    // Attribuer les points avant d'afficher les résultats
    if (gameState.gameMode) {
      awardGamePoints(
        gameId,
        gameState.gameMode,
        gameState.players,
        gameState.scores
      );
    }

    return (
      <GameResults
        players={gameState.players || []}
        scores={gameState.scores || {}}
        userId={user?.uid || ''}
        pointsConfig={{
          firstPlace: 25,
          secondPlace: 15,
          thirdPlace: 10
        }}
      />
    );
  }

  return (
    <LinearGradient colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]} style={styles.bgGradient}>
      {/* DUEL HEADER */}
      <View style={styles.duelHeader}>
        {/* Avatar gauche */}
        <View style={styles.duelPlayerCol}>
          <View style={styles.duelAvatar}>
            {leftPlayer?.avatar ? (
              <Image
                source={{ uri: leftPlayer.avatar }}
                style={styles.duelAvatarImage}
              />
            ) : (
              <MaterialCommunityIcons name="account" size={32} color="#661A59" />
            )}
          </View>
          <Text style={styles.duelPlayerName}>{leftPlayer?.name || 'En attente...'}</Text>
          <View style={styles.duelWinsRow}>
            {[...Array(gameState.totalRounds)].map((_, i) => {
              const roundArr = leftPlayer?.id && (gameState as any)?.history ? (gameState as any).history[leftPlayer.id] || [] : [];
              const round = typeof roundArr[i] === 'number' ? roundArr[i] : 0;
              let dotStyle = styles.duelLoseDot;
              if (round === 1) dotStyle = styles.duelWinDot;
              if (round === -1) dotStyle = styles.duelTrapDot;
              return <View key={i} style={dotStyle} />;
            })}
          </View>
        </View>
        {/* Icône duel au centre */}
        <View style={styles.duelCenter}>
          <MaterialCommunityIcons name="sword-cross" size={38} color="#661A59" />
          <Text style={styles.duelLabel}>DUEL</Text>
        </View>
        {/* Avatar droite */}
        <View style={styles.duelPlayerCol}>
          <View style={styles.duelAvatar}>
            {rightPlayer?.avatar ? (
              <Image
                source={{ uri: rightPlayer.avatar }}
                style={styles.duelAvatarImage}
              />
            ) : (
              <MaterialCommunityIcons name="account" size={32} color="#661A59" />
            )}
          </View>
          <Text style={styles.duelPlayerName}>{rightPlayer?.name || 'En attente...'}</Text>
          <View style={styles.duelWinsRow}>
            {[...Array(gameState.totalRounds)].map((_, i) => {
              const roundArr = rightPlayer?.id && (gameState as any)?.history ? (gameState as any).history[rightPlayer.id] || [] : [];
              const round = typeof roundArr[i] === 'number' ? roundArr[i] : 0;
              let dotStyle = styles.duelLoseDot;
              if (round === 1) dotStyle = styles.duelWinDot;
              if (round === -1) dotStyle = styles.duelTrapDot;
              return <View key={i} style={dotStyle} />;
            })}
          </View>
        </View>
      </View>

      {/* Carte question */}
      <View style={styles.questionCard}>
        {gameState.currentQuestion && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{gameState.currentQuestion.theme}</Text>
          </View>
        )}
        <Text style={styles.questionText}>{gameState.currentQuestion?.question}</Text>
      </View>

      <View style={styles.timerBarContainer}>
        <View style={styles.timerBarBg}>
          <View style={[styles.timerBarFg, { width: `${(timeLeft / TIMER_DURATION) * 100}%` }]} />
        </View>
        <Text style={styles.timerText}>{timeLeft}s</Text>
      </View>

      <View style={styles.answersGridWrapper}>
        <View style={styles.answersGrid}>
          {(gameState.currentQuestion?.answers || []).map((answer, index) => {
            const hasAnswered = !!gameState.playerAnswers?.[user?.uid || ''];
            const isAnswered = gameState.playerAnswers?.[user?.uid || '']?.answer === answer.text;

            let buttonStyle = styles.answerButton;
            let textStyle = styles.answerText;

            if (hasAnswered) {
              if (isAnswered) {
                if (answer.isCorrect) {
                  buttonStyle = styles.answerButtonCorrect;
                } else if (answer.isTrap) {
                  buttonStyle = styles.answerButtonTrap;
                } else {
                  buttonStyle = styles.answerButtonSelected;
                }
              } else {
                buttonStyle = styles.answerButton;
              }
            } else if (isAnswered) {
              buttonStyle = styles.answerButtonSelected;
              textStyle = styles.answerTextSelected;
            }

            return (
              <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => handleAnswer(answer)}
                disabled={hasAnswered || gameState.phase !== GamePhase.QUESTION}
              >
                <Text style={textStyle}>
                  {answer.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {gameState.phase === GamePhase.QUESTION &&
        Object.keys(gameState.playerAnswers || {}).length === gameState.players?.length && (
        <View style={styles.continueButtonWrapper}>
          <RoundedButton
            title={t('game.continue')}
            onPress={nextQuestion}
            icon={<Ionicons name="arrow-forward" size={22} color="#fff" />}
            gradientColors={isContinueButtonEnabled ? ["#00C853", "#00E676"] : ["#BDBDBD", "#BDBDBD"]}
            disabled={!isContinueButtonEnabled}
            style={{ width: '100%' }}
          />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bgGradient: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  playersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  playerAvatarScore: {
    alignItems: 'center',
    marginHorizontal: 18,
  },
  avatarImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 4,
    backgroundColor: '#eee',
  },
  playerName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  scoreBadge: {
    backgroundColor: '#FFD600',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
    alignSelf: 'center',
    minWidth: 28,
  },
  scoreBadgeText: {
    color: '#232323',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: 'rgba(43, 45, 66, 0.95)',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 18,
    width: '90%',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(123, 44, 191, 0.3)',
    shadowColor: '#7B2CBF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  categoryBadge: {
    backgroundColor: '#7B2CBF',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 18,
    shadowColor: '#7B2CBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'capitalize',
  },
  questionText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  timerBarContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 18,
    alignItems: 'center',
  },
  timerBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(43, 45, 66, 0.95)',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(123, 44, 191, 0.3)',
  },
  timerBarFg: {
    height: 8,
    backgroundColor: '#7B2CBF',
    borderRadius: 6,
  },
  timerText: {
    color: '#7B2CBF',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2,
  },
  answersGridWrapper: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  answersGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  answerButton: {
    backgroundColor: 'rgba(43, 45, 66, 0.95)',
    borderRadius: 22,
    width: '48%',
    marginBottom: 18,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 44, 191, 0.3)',
    shadowColor: '#7B2CBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  answerButtonCorrect: {
    backgroundColor: '#00C853',
    borderRadius: 22,
    width: '48%',
    marginBottom: 18,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00C853',
    shadowColor: '#7B2CBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  answerButtonTrap: {
    backgroundColor: '#D32F2F',
    borderRadius: 22,
    width: '48%',
    marginBottom: 18,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D32F2F',
    shadowColor: '#7B2CBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  answerButtonSelected: {
    backgroundColor: '#7B2CBF',
    borderRadius: 22,
    width: '48%',
    marginBottom: 18,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#7B2CBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  answerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  answerTextSelected: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  continueButtonWrapper: {
    width: '90%',
    marginTop: 24,
    marginBottom: 32,
  },
  continueButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#7B2CBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(43, 45, 66, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(123, 44, 191, 0.3)',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  duelHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 80,
  },
  duelPlayerCol: {
    alignItems: 'center',
    flex: 1,
  },
  duelAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#661A59',
    marginBottom: 4,
    backgroundColor: '#21101C',
    shadowColor: '#661A59',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  duelAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  duelPlayerName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  duelWinsRow: {
    flexDirection: 'row',
    marginTop: 2,
    marginBottom: 2,
  },
  duelWinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00C853',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  duelTrapDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D32F2F',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  duelLoseDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(43, 45, 66, 0.95)',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(123, 44, 191, 0.3)',
  },
  duelCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  duelLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 2,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bg: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  roundNumber: { fontSize: 28, color: '#fff', marginTop: 10, marginBottom: 10, fontWeight: 'bold' },
  message: { fontSize: 22, color: '#fff', fontWeight: 'bold', marginBottom: 30, textAlign: 'center', textShadowColor: '#21101C', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', width: '100%', marginBottom: 30 },
  barCol: { alignItems: 'center', marginHorizontal: 8 },
  barBg: { width: 48, height: 200, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(123,44,191,0.10)', borderRadius: 24, marginBottom: 8 },
  bar: { width: 40, borderRadius: 20, backgroundColor: '#23233b', marginBottom: -4 },
  barWinner: { width: 40, borderRadius: 20, marginBottom: -4, backgroundColor: '#00C853', shadowColor: '#00C853', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  barUser: { width: 40, borderRadius: 20, marginBottom: -4, backgroundColor: '#7B2CBF', borderWidth: 2, borderColor: '#fff' },
  barOther: { width: 40, borderRadius: 20, marginBottom: -4, backgroundColor: '#34314c' },
  avatarWrapper: { position: 'relative', marginBottom: 4 },
  crown: { position: 'absolute', top: -10, right: -10, backgroundColor: '#FFD600', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  crownText: { color: '#232323', fontWeight: 'bold', fontSize: 15 },
  score: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginTop: 2 },
  scoreWinner: { color: '#00C853', fontSize: 22 },
  scoreUser: { color: '#7B2CBF', fontWeight: 'bold', fontSize: 20 },
  pseudo: { color: '#fff', fontSize: 13, marginTop: 2, maxWidth: 60, textAlign: 'center' },
  pseudoUser: { color: '#FFD600', fontWeight: 'bold' },
  homeBtnAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: 'center',
    zIndex: 10,
  },
  homeBtn: { borderRadius: 18, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', width: '100%', shadowColor: '#7B2CBF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  homeBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  resultsBg: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  topPlayersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  playerRankContainer: {
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapperResults: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#661A59',
    marginBottom: 4,
    backgroundColor: '#21101C',
    shadowColor: '#661A59',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImgResults: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  rankBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFD600',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  rankBadgeText: {
    color: '#232323',
    fontWeight: 'bold',
    fontSize: 15,
  },
  playerNameResults: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playerRankContainerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapperRank1: {
    borderWidth: 3,
    borderColor: '#00C853',
  },
  avatarWrapperRank2: {
    borderWidth: 3,
    borderColor: '#FFD600',
  },
  avatarWrapperRank3: {
    borderWidth: 3,
    borderColor: '#D32F2F',
  },
  playerNameWinner: {
    color: '#00C853',
    fontSize: 22,
  },
  currentUserRankContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  currentUserRankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  currentUserRankNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  otherPlayersList: {
    width: '100%',
    marginTop: 18,
  },
  otherPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  otherPlayerAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 8,
  },
  otherPlayerName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  otherPlayerRank: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  homeButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: 'center',
    zIndex: 10,
  },
  crownTop: {
    position: 'absolute',
    top: -20,
    right: -10,
    backgroundColor: '#FFD600',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },
});
