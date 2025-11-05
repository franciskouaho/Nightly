import GameResults from "@/components/game/GameResults";
import ChristmasTheme from "@/constants/themes/Christmas";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrapAnswerQuestions } from "@/hooks/trap-answer-questions";
import { useGame } from "@/hooks/useGame";
import { useGameEndPaywall } from "@/hooks/useGameEndPaywall";
import { usePoints } from "@/hooks/usePoints";
import { GamePhase, Player } from "@/types/gameTypes";
import { TrapAnswer, TrapPlayerAnswer, TrapQuestion } from "@/types/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  gameMode: "trap-answer";
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
  const gameId = typeof id === "string" ? id : id?.[0] || "";
  const { user } = useAuth();
  const { gameState, updateGameState, updatePlayerAnswers } =
    useGame<TrapGameState>(gameId);
  const { awardGamePoints } = usePoints();
  const { isRTL, language } = useLanguage();

  // Utiliser le hook pour gérer les questions, en lui passant l'historique des questions posées
  const { questions, getRandomQuestion } = useTrapAnswerQuestions(
    gameState?.askedQuestionIds || [],
  );

  // Hook pour afficher le paywall après 2-3 parties gratuites
  const isGameEnded = gameState?.phase === GamePhase.END;
  useGameEndPaywall("trap-answer", isGameEnded);

  // Timer pour la barre de temps (UI only)
  const TIMER_DURATION = 20; // secondes
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ⚠️ FIX: Flag pour éviter les doubles appels de nextQuestion
  const isTransitioningRef = useRef(false);

  // ⚠️ FIX: Passage automatique au tour suivant après 3 secondes si tous les joueurs ont répondu
  // Augmenté à 3 secondes pour laisser le temps de voir les résultats
  useEffect(() => {
    if (
      gameState?.phase === GamePhase.QUESTION &&
      gameState?.players?.length > 0 &&
      Object.keys(gameState?.playerAnswers || {}).length ===
        gameState?.players?.length &&
      !isTransitioningRef.current && // ⚠️ FIX: Empêcher le double déclenchement
      gameState?.currentQuestion // ⚠️ FIX: S'assurer qu'il y a une question
    ) {
      console.log("🔄 Tous les joueurs ont répondu - passage dans 3s");
      isTransitioningRef.current = true;
      const timeout = setTimeout(() => {
        nextQuestion();
      }, 3000); // ⚠️ FIX: Augmenté à 3 secondes pour laisser voir les résultats
      return () => {
        clearTimeout(timeout);
        isTransitioningRef.current = false;
      };
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState?.phase, gameState?.playerAnswers, gameState?.players, gameState?.currentQuestion]);

  // Log pour inspecter gameState dès qu'il change
  useEffect(() => {
    if (gameState) {
      console.log("[DEBUG GAME STATE]", JSON.stringify(gameState));
      console.log(
        "[DEBUG GAME STATE] History:",
        JSON.stringify(gameState.history),
      );
      console.log("[DEBUG GAME STATE] Current Round:", gameState.currentRound);
      console.log(
        "[DEBUG GAME STATE] Current Question:",
        gameState.currentQuestion,
      );
    }
  }, [gameState]); // Dépend de gameState pour se déclencher à chaque mise à jour

  // Charger la première question lorsque les questions sont disponibles
  // Ancien bloc de code supprimé car l'initialisation est gérée par RoomScreen

  useEffect(() => {
    if (
      gameState?.phase === GamePhase.QUESTION &&
      gameState?.currentQuestion?.id
    ) {
      setTimeLeft(TIMER_DURATION);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState?.phase, gameState?.currentQuestion?.id]);

  // ⚠️ FIX: Passer à la question suivante quand le timer arrive à zéro (si pas déjà en transition)
  useEffect(() => {
    if (
      gameState?.phase === GamePhase.QUESTION &&
      timeLeft === 0 &&
      !isTransitioningRef.current
    ) {
      console.log("⏱️ Timer à 0 - passage à la question suivante");
      isTransitioningRef.current = true;
      nextQuestion();
    }
  }, [gameState?.phase, timeLeft]);

  const calculateScore = (answer: TrapAnswer): number => {
    if (answer.isCorrect) return 1;
    if (answer.isTrap) return -1;
    return 0;
  };

  const nextQuestion = () => {
    if (!questions?.length) return;

    // Vérifier si on a atteint le nombre maximum de rounds
    if ((gameState?.currentRound ?? 0) >= (gameState?.totalRounds || 5)) {
      updateGameState({ phase: GamePhase.END });
      isTransitioningRef.current = false; // ⚠️ FIX: Reset le flag
      return;
    }

    // getRandomQuestion gère déjà l'historique des questions posées via le hook
    const nextQ = getRandomQuestion();

    if (nextQ) {
      // Mélanger les réponses aléatoirement
      const shuffledAnswers = [...nextQ.answers].sort(
        () => Math.random() - 0.5,
      );
      const shuffledQuestion = {
        ...nextQ,
        answers: shuffledAnswers,
      };

      updateGameState({
        currentQuestion: shuffledQuestion,
        askedQuestionIds: [
          ...(gameState?.askedQuestionIds || []),
          nextQ.id,
        ].filter((id): id is string => !!id),
        playerAnswers: {},
        phase: GamePhase.QUESTION,
        currentRound: (gameState?.currentRound ?? 0) + 1,
      });

      // ⚠️ FIX: Reset le flag après la mise à jour pour permettre la prochaine transition
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 100);
    } else {
      updateGameState({ phase: GamePhase.END });
      isTransitioningRef.current = false; // ⚠️ FIX: Reset le flag
    }
  };

  // ⚠️ FIX: Ajouter un état local pour le feedback visuel immédiat
  const [localPlayerAnswer, setLocalPlayerAnswer] = useState<TrapPlayerAnswer | null>(null);

  const handleAnswer = async (answer: TrapAnswer) => {
    if (
      !user ||
      !gameState?.currentQuestion ||
      gameState.phase !== GamePhase.QUESTION
    )
      return;
    
    // ⚠️ FIX: Vérifier si le joueur a déjà répondu (local ou dans gameState)
    if (gameState.playerAnswers?.[user.uid] || localPlayerAnswer) {
      console.log("⏭️ Le joueur a déjà répondu");
      return;
    }

    // ⚠️ FIX: Mettre à jour l'état local immédiatement pour feedback visuel
    const newPlayerAnswer: TrapPlayerAnswer = {
      answer: answer.text,
      isCorrect: answer.isCorrect,
      isTrap: answer.isTrap,
    };
    setLocalPlayerAnswer(newPlayerAnswer);

    const score = calculateScore(answer);

    // Historique robuste : toujours un array de la bonne taille
    const totalRounds = gameState?.totalRounds || 5;
    const baseHistory = (gameState as any)?.history || {};
    const newHistory = { ...baseHistory };
    if (!newHistory[user.uid]) newHistory[user.uid] = [];
    // Remplir l'array jusqu'à totalRounds
    while (newHistory[user.uid].length < totalRounds) {
      newHistory[user.uid].push(0);
    }
    if (gameState?.currentRound !== undefined) {
      newHistory[user.uid][gameState.currentRound - 1] = answer.isCorrect
        ? 1
        : answer.isTrap
          ? -1
          : 0;
    }

    try {
      // ⚠️ FIX: Utiliser updatePlayerAnswers avec transaction pour éviter les pertes de réponses
      await updatePlayerAnswers(user.uid, newPlayerAnswer);

      // ⚠️ FIX: Mettre à jour le score et l'historique séparément
      const newScores = {
        ...(gameState.scores || {}),
        [user.uid]: (gameState.scores?.[user.uid] || 0) + score,
      };

      await updateGameState({
        scores: newScores,
        history: newHistory,
      });

      console.log("✅ Réponse enregistrée avec succès");
    } catch (error) {
      console.error("❌ Erreur lors de l'enregistrement de la réponse:", error);
      // ⚠️ FIX: Réinitialiser l'état local en cas d'erreur
      setLocalPlayerAnswer(null);
    }
  };

  // ⚠️ FIX: Réinitialiser localPlayerAnswer quand on change de question
  useEffect(() => {
    if (gameState?.currentQuestion?.id) {
      setLocalPlayerAnswer(null);
    }
  }, [gameState?.currentQuestion?.id]);

  if (!gameState) return null;

  if (gameState.phase === GamePhase.END) {
    // Les points sont attribués par GameResults.tsx via useLeaderboard
    // Pas besoin d'appeler awardGamePoints ici pour éviter les doublons

    // ⚠️ FIX: Normaliser les scores pour éviter les scores négatifs
    // Dans ce jeu, les pièges donnent -1 point, donc on peut avoir des scores négatifs
    // On normalise en trouvant le score minimum et en ajoutant un offset pour que tous les scores soient >= 0
    const rawScores = gameState.scores || {};
    const allScores = Object.values(rawScores);
    const minScore = allScores.length > 0 ? Math.min(...allScores) : 0;
    const offset = minScore < 0 ? Math.abs(minScore) : 0; // Offset pour rendre tous les scores positifs
    
    const normalizedScores: Record<string, number> = {};
    Object.entries(rawScores).forEach(([playerId, score]) => {
      normalizedScores[playerId] = (score as number) + offset;
    });

    return (
      <GameResults
        players={gameState.players || []}
        scores={normalizedScores}
        userId={user?.uid || ""}
        pointsConfig={{
          firstPlace: 25,
          secondPlace: 15,
          thirdPlace: 10,
        }}
      />
    );
  }

  return (
    <LinearGradient
      colors={[
        ChristmasTheme.light.backgroundDarker,
        ChristmasTheme.light.backgroundDarker,
        ChristmasTheme.light.primary,
        ChristmasTheme.light.backgroundDarker,
        ChristmasTheme.light.background,
      ]}
      locations={[0, 0.2, 0.5, 0.8, 1]}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingVertical: 40, paddingHorizontal: 12 }}>
        <View style={{ alignItems: "center" }}>
          <View style={styles.duelHeaderCircle}>
            {/* DUEL header réorganisé avec Flexbox */}
            {/* Le cercle central DUEL reste en position absolue */}
            <View
              key="duel-center"
              style={[
                styles.duelCenterCircle,
                gameState?.players?.length === 3 && { top: "44%" },
              ]}
            >
              <MaterialCommunityIcons
                name="sword-cross"
                size={38}
                color={ChristmasTheme.light.primary}
              />
              <Text style={styles.duelLabel}>DUEL</Text>
            </View>

            {/* 4-player UI layout */}
            {(() => {
              const players = (gameState?.players || []).slice(0, 4);
              return players.map((player, idx) => (
                <View key={player?.id || idx} style={[styles.duelPlayerCircle]}>
                  <View style={styles.duelAvatar}>
                    {player?.avatar ? (
                      <Image
                        source={{ uri: player.avatar }}
                        style={styles.duelAvatarImage}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="account"
                        size={32}
                        color="#661A59"
                      />
                    )}
                  </View>
                  <Text style={styles.duelPlayerName}>
                    {player?.name || "En attente..."}
                  </Text>
                  <View style={styles.duelWinsRow}>
                    {[
                      ...Array(Math.ceil((gameState.totalRounds || 5) / 5)),
                    ].map((_, rowIndex) => (
                      <View key={rowIndex} style={styles.dotRow}>
                        {[
                          ...Array(
                            Math.min(
                              5,
                              (gameState.totalRounds || 5) - rowIndex * 5,
                            ),
                          ),
                        ].map((__, dotIndex) => {
                          const globalIndex = rowIndex * 5 + dotIndex;
                          const roundArr =
                            player?.id && (gameState as any)?.history
                              ? (gameState as any).history[player.id] || []
                              : [];
                          const round =
                            typeof roundArr[globalIndex] === "number"
                              ? roundArr[globalIndex]
                              : 0;
                          let dotStyle = styles.duelLoseDot;
                          if (round === 1) dotStyle = styles.duelWinDot;
                          if (round === -1) dotStyle = styles.duelTrapDot;
                          return <View key={globalIndex} style={dotStyle} />;
                        })}
                      </View>
                    ))}
                  </View>
                </View>
              ));
            })()}
          </View>

          <View style={{ alignItems: "center" }}>
            <View
              style={[
                styles.questionCard,
                { paddingVertical: 16, marginTop: 32, marginBottom: 30 },
              ]}
            >
              {gameState.currentQuestion && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {gameState.currentQuestion.theme}
                  </Text>
                </View>
              )}
              <Text
                style={[styles.questionText, { fontSize: 18 }]}
                numberOfLines={3}
                adjustsFontSizeToFit
              >
                {gameState.currentQuestion?.question}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.timerBarContainer}>
          <View style={styles.timerHeaderRow}>
            <Text style={styles.timerText}>{timeLeft}s</Text>
            <Text style={styles.roundInfoText}>
              {t("game.round", {
                current: gameState.currentRound || 0,
                total: gameState.totalRounds || 0,
              })}
            </Text>
          </View>
          <View style={styles.timerBarBg}>
            <View
              style={[
                styles.timerBarFg,
                { width: `${(timeLeft / TIMER_DURATION) * 100}%` },
              ]}
            />
          </View>
        </View>

        <View
          style={[styles.answersGridWrapper, { marginBottom: 0, marginTop: 8 }]}
        >
          <View style={styles.answersGrid}>
            {(gameState.currentQuestion?.answers || []).map((answer, index) => {
              // ⚠️ FIX: Utiliser l'état local ou gameState pour le feedback visuel
              const playerAnswer = localPlayerAnswer || gameState.playerAnswers?.[user?.uid || ""];
              const hasAnswered = !!playerAnswer;
              const isAnswered = playerAnswer?.answer === answer.text;

              let buttonStyle = styles.answerButton;
              let textStyle = styles.answerText;

              // ⚠️ FIX: Améliorer l'affichage des réponses avec feedback visuel immédiat
              if (hasAnswered) {
                if (isAnswered) {
                  // La réponse sélectionnée par le joueur
                  if (answer.isCorrect) {
                    buttonStyle = styles.answerButtonCorrect;
                  } else if (answer.isTrap) {
                    buttonStyle = styles.answerButtonTrap;
                  } else {
                    buttonStyle = styles.answerButtonSelected;
                  }
                } else {
                  // Les autres réponses (grisées si on a déjà répondu)
                  buttonStyle = styles.answerButtonDisabled;
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={buttonStyle}
                  onPress={() => handleAnswer(answer)}
                  disabled={
                    hasAnswered || gameState.phase !== GamePhase.QUESTION
                  }
                >
                  <Text
                    style={textStyle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {answer.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bgGradient: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
  },
  playersRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 18,
  },
  playerAvatarScore: {
    alignItems: "center",
    marginHorizontal: 18,
  },
  avatarImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "#fff",
    marginBottom: 4,
    backgroundColor: "#eee",
  },
  playerName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  scoreBadge: {
    backgroundColor: "#FFD600",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
    alignSelf: "center",
    minWidth: 28,
  },
  scoreBadgeText: {
    color: "#232323",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  questionCard: {
    backgroundColor: `${ChristmasTheme.light.backgroundDarker}F0`,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: `${ChristmasTheme.light.primary}60`,
    shadowColor: ChristmasTheme.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 50,
    marginBottom: 15,
  },
  categoryBadge: {
    backgroundColor: ChristmasTheme.light.primary,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 18,
    shadowColor: ChristmasTheme.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryBadgeText: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  questionText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Montserrat-SemiBold",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 28,
  },
  timerBarContainer: {
    width: "90%",
    alignSelf: "center",
    marginTop: 25,
    marginBottom: 15,
    alignItems: "center",
  },
  timerBarBg: {
    width: "100%",
    height: 10,
    backgroundColor: `${ChristmasTheme.light.backgroundDarker}E6`,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: `${ChristmasTheme.light.primary}40`,
  },
  timerBarFg: {
    height: 10,
    backgroundColor: ChristmasTheme.light.tertiary,
    borderRadius: 10,
    shadowColor: ChristmasTheme.light.tertiary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  timerText: {
    color: ChristmasTheme.light.tertiary,
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  roundInfoText: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
  },
  timerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  answersGridWrapper: {
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 0,
    marginTop: 15,
  },
  answersGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  answerButton: {
    backgroundColor: `${ChristmasTheme.light.backgroundDarker}E6`,
    borderRadius: 20,
    width: "47%",
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: `${ChristmasTheme.light.primary}40`,
    marginBottom: 12,
    shadowColor: ChristmasTheme.light.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  answerButtonCorrect: {
    backgroundColor: "#00C853",
    borderRadius: 20,
    width: "47%",
    marginBottom: 18,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00E676",
    shadowColor: "#00C853",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    marginHorizontal: 4,
  },
  answerButtonTrap: {
    backgroundColor: ChristmasTheme.light.error,
    borderRadius: 20,
    width: "47%",
    marginBottom: 18,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF5252",
    shadowColor: ChristmasTheme.light.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    marginHorizontal: 4,
  },
  answerButtonSelected: {
    backgroundColor: ChristmasTheme.light.primary,
    borderRadius: 20,
    width: "47%",
    marginBottom: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 3,
    borderColor: ChristmasTheme.light.tertiary,
    shadowColor: ChristmasTheme.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
    marginHorizontal: 4,
  },
  answerButtonDisabled: {
    backgroundColor: `${ChristmasTheme.light.backgroundDarker}80`,
    borderRadius: 20,
    width: "47%",
    marginBottom: 18,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: `${ChristmasTheme.light.primary}20`,
    opacity: 0.5,
    marginHorizontal: 4,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  answerText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Montserrat-SemiBold",
  },
  answerTextSelected: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  continueButtonWrapper: {
    width: "90%",
    marginTop: 24,
    marginBottom: 32,
  },
  continueButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: "#7B2CBF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: "rgba(43, 45, 66, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(123, 44, 191, 0.3)",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  duelHeaderCircle: {
    width: "100%",
    height: 270,
    alignSelf: "center",
    marginBottom: 10,
    position: "relative",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 10,
    marginTop: 30,
  },
  duelCenterCircle: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -30,
    marginTop: -75,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  duelPlayerCircle: {
    flexBasis: "45%",
    flexGrow: 1,
    maxWidth: "50%",
    marginTop: 8,
    alignItems: "center",
    zIndex: 3,
    justifyContent: "center",
  },
  duelAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: ChristmasTheme.light.primary,
    marginBottom: 4,
    backgroundColor: ChristmasTheme.light.backgroundDarker,
    shadowColor: ChristmasTheme.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  duelAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 29,
  },
  duelPlayerName: {
    color: "#fff",
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    marginBottom: 2,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  duelWinsRow: {
    marginTop: 2,
    marginBottom: 2,
    alignItems: "center",
  },
  dotRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
  },
  duelWinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#00C853",
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#00C853",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  duelTrapDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#D32F2F",
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  duelLoseDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(43, 45, 66, 0.95)",
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: "rgba(123, 44, 191, 0.3)",
  },
  bg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  roundNumber: {
    fontSize: 28,
    color: "#fff",
    marginTop: 10,
    marginBottom: 10,
    fontWeight: "bold",
  },
  message: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    textShadowColor: "#21101C",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    width: "100%",
    marginBottom: 30,
  },
  barCol: { alignItems: "center", marginHorizontal: 8 },
  barBg: {
    width: 48,
    height: 200,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(123,44,191,0.10)",
    borderRadius: 24,
    marginBottom: 8,
  },
  bar: {
    width: 40,
    borderRadius: 20,
    backgroundColor: "#23233b",
    marginBottom: -4,
  },
  barWinner: {
    width: 40,
    borderRadius: 20,
    marginBottom: -4,
    backgroundColor: "#00C853",
    shadowColor: "#00C853",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  barUser: {
    width: 40,
    borderRadius: 20,
    marginBottom: -4,
    backgroundColor: "#7B2CBF",
    borderWidth: 2,
    borderColor: "#fff",
  },
  barOther: {
    width: 40,
    borderRadius: 20,
    marginBottom: -4,
    backgroundColor: "#34314c",
  },
  avatarWrapper: { position: "relative", marginBottom: 4 },
  crown: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#FFD600",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  crownText: { color: "#232323", fontWeight: "bold", fontSize: 15 },
  score: { color: "#fff", fontWeight: "bold", fontSize: 18, marginTop: 2 },
  scoreWinner: { color: "#00C853", fontSize: 22 },
  scoreUser: { color: "#7B2CBF", fontWeight: "bold", fontSize: 20 },
  pseudo: {
    color: "#fff",
    fontSize: 13,
    marginTop: 2,
    maxWidth: 60,
    textAlign: "center",
  },
  pseudoUser: { color: "#FFD600", fontWeight: "bold" },
  homeBtnAbsolute: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: "center",
    zIndex: 10,
  },
  homeBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: "#7B2CBF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  homeBtnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  resultsBg: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
  },
  topPlayersContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 18,
  },
  playerRankContainer: {
    alignItems: "center",
    flex: 1,
  },
  avatarWrapperResults: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#661A59",
    marginBottom: 4,
    backgroundColor: "#21101C",
    shadowColor: "#661A59",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImgResults: {
    width: "100%",
    height: "100%",
    borderRadius: 29,
  },
  rankBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#FFD600",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  rankBadgeText: {
    color: "#232323",
    fontWeight: "bold",
    fontSize: 15,
  },
  playerNameResults: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playerRankContainerCenter: {
    alignItems: "center",
    flex: 1,
  },
  avatarWrapperRank1: {
    borderWidth: 3,
    borderColor: "#00C853",
  },
  avatarWrapperRank2: {
    borderWidth: 3,
    borderColor: "#FFD600",
  },
  avatarWrapperRank3: {
    borderWidth: 3,
    borderColor: "#D32F2F",
  },
  playerNameWinner: {
    color: "#00C853",
    fontSize: 22,
  },
  currentUserRankContainer: {
    alignItems: "center",
    marginBottom: 18,
  },
  currentUserRankText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  currentUserRankNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  otherPlayersList: {
    width: "100%",
    marginTop: 18,
  },
  otherPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  otherPlayerAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 8,
  },
  otherPlayerName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  otherPlayerRank: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  homeButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: "center",
    zIndex: 10,
  },
  crownTop: {
    position: "absolute",
    top: -20,
    right: -10,
    backgroundColor: "#FFD600",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 1,
  },
  duelLabel: {
    color: ChristmasTheme.light.tertiary,
    fontFamily: "Montserrat-ExtraBold",
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 2,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
});
