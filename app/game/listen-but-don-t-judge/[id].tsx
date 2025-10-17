import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  getFirestore,
  doc,
  onSnapshot,
  updateDoc,
} from "@react-native-firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import RoundedButton from "@/components/RoundedButton";
import GameResults from "@/components/game/GameResults";
import { useInAppReview } from "@/hooks/useInAppReview";
import { useListenButDontJudgeAnalytics } from "@/hooks/useListenButDontJudgeAnalytics";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { GamePhase, Question } from "@/types/gameTypes";
import ResultsPhase from "@/components/game/ResultsPhase";
import { useListenButDontJudgeQuestions } from "../data/listen-but-don-t-judge-questions";

// Define interfaces
interface Player {
  id: string;
  name: string;
  avatar: string;
  username?: string;
}

interface GameState {
  phase: "question" | "answer" | "vote" | "results" | "choix" | "end";
  currentRound: number;
  totalRounds: number;
  targetPlayer: Player | null;
  currentQuestion: Question | null;
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
  gameMode: "listen-but-don-t-judge";
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
  const { getRandomQuestion, resetAskedQuestions, questions } =
    useListenButDontJudgeQuestions();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const gameStartTime = useRef(Date.now());

  // Fonction utilitaire pour les traductions
  const safeTranslate = useCallback(
    (key: string, defaultValue: string = "") => {
      try {
        return t(key) || defaultValue;
      } catch (error) {
        return defaultValue;
      }
    },
    [t],
  );

  // Fonction simple pour formater le texte de la question
  const formatQuestionText = useCallback((
    question: Question | any, // Permettre any pour gérer les objets avec clés numériques
    playerName: string,
  ) => {
    let questionText = "";
    
    // Si la question a une propriété text, l'utiliser
    if (question?.text) {
      questionText = question.text;
    } else if (question && typeof question === 'object') {
      // Si la question est un objet avec des clés numériques (caractères stockés individuellement)
      const keys = Object.keys(question);
      const numericKeys = keys.filter(key => !isNaN(Number(key)));
      
      if (numericKeys.length > 0) {
        // Reconstruire le texte à partir des caractères
        questionText = numericKeys
          .sort((a, b) => Number(a) - Number(b))
          .map(key => question[key])
          .join('');
        // console.log(`[DEBUG] Reconstructed question text:`, questionText);
      }
    }
    
    if (!questionText) {
      return safeTranslate("game.listenButDontJudge.noQuestions", "Aucune question disponible");
    }

    // Remplacer les placeholders de joueur
    const formattedText = questionText.replace(
      /\{player(?:Name|_name|name|)\}/gi,
      playerName,
    );

    return formattedText;
  }, [safeTranslate]);

  // Les questions sont maintenant chargées automatiquement par useListenButDontJudgeQuestions

  // Vérifier si le joueur actuel a déjà répondu
  const hasPlayerAnswered = useMemo(() => {
    if (!game?.answers || !user?.uid) return false;
    return game.answers.some(answer => answer.playerId === user.uid);
  }, [game?.answers, user?.uid]);

  // Écoute des changements de jeu dans Firebase
  useEffect(() => {
    if (!id) return;
    
    const db = getFirestore();
    const gameRef = doc(db, "games", String(id));
    
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const gameData = docSnap.data() as GameState;
        
        // S'assurer que le gameMode est défini
        if (!gameData.gameMode) {
          updateDoc(gameRef, {
            gameMode: "listen-but-don-t-judge",
          }).catch((e) => console.error("Error updating gameMode:", e));
        }
        
        // Initialiser la première question si nécessaire
        
        // Initialiser la première question si le jeu n'a pas encore de question
        if (
          !gameData.currentQuestion && 
          questions.length > 0 &&
          gameData.players && gameData.players.length > 0
        ) {
          const firstQuestion = getRandomQuestion();
          if (firstQuestion) {
            const randomPlayerIndex = Math.floor(Math.random() * gameData.players.length);
            const targetPlayer = gameData.players[randomPlayerIndex];
            
            // S'assurer que la question a la bonne structure avant de la stocker
            const questionToStore = {
              id: firstQuestion.id,
              text: firstQuestion.text,
              theme: firstQuestion.theme || "general",
              roundNumber: firstQuestion.roundNumber || 1
            };
            
            updateDoc(gameRef, {
              currentQuestion: questionToStore,
              targetPlayer: targetPlayer,
              phase: "question", // Passer directement à la phase question
              currentRound: gameData.currentRound || 1,
              totalRounds: gameData.totalRounds || 5,
            }).catch((e) => console.error("Error initializing first question:", e));
          }
        }
        
        setGame(gameData);

        // Changer la phase de 'choix' à 'question' si nécessaire
        if (gameData.phase === "choix" && game?.phase !== "choix") {
          updateDoc(gameRef, {
            phase: "question",
          }).catch((e) => console.error("Error updating phase:", e));
        }
        
        // Si le jeu n'a pas de phase définie ou n'a pas de question, initialiser
        if ((!gameData.phase || gameData.phase === "choix") && !gameData.currentQuestion && questions.length > 0) {
          const firstQuestion = getRandomQuestion();
          if (firstQuestion) {
            const randomPlayerIndex = Math.floor(Math.random() * gameData.players.length);
            const targetPlayer = gameData.players[randomPlayerIndex];
            
            // S'assurer que la question a la bonne structure avant de la stocker
            const questionToStore = {
              id: firstQuestion.id,
              text: firstQuestion.text,
              theme: firstQuestion.theme || "general",
              roundNumber: firstQuestion.roundNumber || 1
            };
            
            updateDoc(gameRef, {
              currentQuestion: questionToStore,
              targetPlayer: targetPlayer,
              phase: "question",
              currentRound: gameData.currentRound || 1,
              totalRounds: gameData.totalRounds || 5,
            }).catch((e) => console.error("Error initializing question:", e));
          }
        }
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, [id, game?.phase, questions.length]);

  // Gestion de la fin de jeu
  useEffect(() => {
    if (
      game &&
      game.currentRound >= game.totalRounds &&
      game.phase === GamePhase.RESULTS
    ) {
      const gameDuration = Date.now() - gameStartTime.current;
      gameAnalytics.trackGameComplete(
        String(id),
        game.totalRounds,
        gameDuration,
      );
    }
  }, [game, id, gameAnalytics]);

  // Soumission d'une réponse
  const handleSubmitAnswer = async () => {
    if (!game || !user || !answer.trim()) return;
    
    // Vérifier si le joueur a déjà répondu
    if (hasPlayerAnswered) {
      Alert.alert(
        safeTranslate("game.error", "Erreur"),
        safeTranslate("game.listenButDontJudge.alreadyAnswered", "Vous avez déjà répondu à cette question")
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const db = getFirestore();
      const gameRef = doc(db, "games", String(id));

      const newAnswer = {
        id: Date.now().toString(),
        text: answer.trim(),
        playerId: user.uid,
        playerName: user.pseudo || safeTranslate("game.player", "Joueur"),
      };

      await gameAnalytics.trackStoryStart(String(id), user.uid);

      const updatedAnswers = [...(game.answers || []), newAnswer];
      
      // Vérifier si tous les joueurs ont soumis une réponse
      const playersWhoShouldAnswer = game.players.length === 2 ? game.players : 
        game.players.filter(p => p.id !== game.targetPlayer?.id);
      const allPlayersAnswered = playersWhoShouldAnswer.every(player => 
        updatedAnswers.some(answer => answer.playerId === player.id)
      );

      const nextPhase = allPlayersAnswered ? "vote" : "question";
      
      await updateDoc(gameRef, {
        answers: updatedAnswers,
        phase: nextPhase,
      });

      setAnswer("");
    } catch (error) {
      Alert.alert(
        safeTranslate("game.error", "Erreur"),
        safeTranslate("game.listenButDontJudge.errorSubmit", "Erreur lors de la soumission"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vote pour une réponse
  const handleVote = async (answerId: string) => {
    if (!game || !user) return;
    try {
      const db = getFirestore();
      const gameRef = doc(db, "games", String(id));
      const votes = game.votes || {};
      votes[user.uid] = answerId;

      const votedAnswer = game.answers.find((a) => a.id === answerId);
      if (votedAnswer) {
        await gameAnalytics.trackVote(
          String(id),
          user.uid,
          votedAnswer.playerId,
          "yes",
        );
      }

      // Vérifier si tous les joueurs ont voté
      const allVotes = { ...votes };
      const playersWhoCanVote = game.players.length === 2 ? game.players : [game.targetPlayer];
      const allPlayersVoted = playersWhoCanVote.every(player => 
        player && allVotes[player.id] !== undefined
      );

      let nextPhase = "vote";
      let winningAnswerId: string | null = null;
      let scores = { ...game.scores };

      if (allPlayersVoted) {
        // Tous les joueurs ont voté, passer aux résultats
        nextPhase = "results";
        
        // Calculer la réponse gagnante basée sur les votes
        const voteCounts: Record<string, number> = {};
        Object.values(allVotes).forEach(votedAnswerId => {
          if (typeof votedAnswerId === 'string') {
            voteCounts[votedAnswerId] = (voteCounts[votedAnswerId] || 0) + 1;
          }
        });

        // Trouver la réponse avec le plus de votes
        let maxVotes = 0;
        Object.entries(voteCounts).forEach(([answerId, count]) => {
          if (count > maxVotes) {
            maxVotes = count;
            winningAnswerId = answerId;
          }
        });

        // Mettre à jour les scores
        if (winningAnswerId) {
          const winningAnswer = game.answers.find((a) => a.id === winningAnswerId);
          if (winningAnswer) {
            scores[winningAnswer.playerId] = (scores[winningAnswer.playerId] || 0) + 1;
          }
        }
      }
      
      await updateDoc(gameRef, {
        votes: allVotes,
        phase: nextPhase,
        winningAnswerId,
        scores,
      });
    } catch (error) {
      Alert.alert(
        safeTranslate("game.error", "Erreur"),
        safeTranslate("game.listenButDontJudge.errorVote", "Erreur lors du vote"),
      );
    }
  };

  // Passage au tour suivant
  const handleNextRound = async () => {
    if (!game || !user || game.currentRound >= game.totalRounds) return;
    
    try {
      const db = getFirestore();
      const gameRef = doc(db, "games", String(id));

      await gameAnalytics.trackRoundComplete(
        String(id),
        game.currentRound,
        game.totalRounds,
      );

      const nextQuestion = getRandomQuestion();
      if (!nextQuestion) {
        Alert.alert(
          safeTranslate("game.error", "Erreur"),
          safeTranslate("game.listenButDontJudge.noQuestions", "Aucune question disponible"),
        );
        return;
      }

      const randomPlayerIndex = Math.floor(Math.random() * game.players.length);
      const newTargetPlayer = game.players[randomPlayerIndex];

      await updateDoc(gameRef, {
        currentRound: game.currentRound + 1,
        phase: "question",
        currentQuestion: nextQuestion,
        answers: [],
        votes: {},
        winningAnswerId: null,
        targetPlayer: newTargetPlayer,
      });
    } catch (error) {
      console.error("Error moving to next round:", error);
      Alert.alert(
        safeTranslate("game.error", "Erreur"),
        safeTranslate("game.listenButDontJudge.errorNextRound", "Impossible de passer au tour suivant"),
      );
    }
  };

  // Texte de question formaté (mémorisé)
  const formattedQuestionText = useMemo(() => {
    if (!game?.currentQuestion) {
      return safeTranslate("game.listenButDontJudge.noQuestions", "Aucune question disponible");
    }

    const playerName = game.targetPlayer?.name || 
                      game.targetPlayer?.username || 
                      safeTranslate("game.player", "le joueur");

    return formatQuestionText(game.currentQuestion, playerName);
  }, [game?.currentQuestion, game?.targetPlayer, formatQuestionText, safeTranslate]);

  // Question formatée pour ResultsPhase (mémorisé)
  const formattedQuestionForResults = useMemo(() => {
    if (!game?.currentQuestion) return null;

    const playerName = game.targetPlayer?.name || 
                      game.targetPlayer?.username || 
                      safeTranslate("game.player", "le joueur");

    return {
      ...game.currentQuestion,
      text: formatQuestionText(game.currentQuestion, playerName),
    };
  }, [game?.currentQuestion, game?.targetPlayer, formatQuestionText, safeTranslate]);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.loadingText}>
          {safeTranslate("game.loading", "Chargement...")}
        </Text>
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
        <Text style={styles.errorText}>
          {safeTranslate("game.error", "Une erreur est survenue")}
        </Text>
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
        colors={
          game?.phase === "results" && game?.currentRound >= game?.totalRounds
            ? ["#1A0A33", "#3A1A59"]
            : ["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]
        }
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {game?.phase === "results" && game?.currentRound >= game?.totalRounds ? (
        <GameResults
          players={game.players || []}
          scores={game.scores || {}}
          userId={user?.uid || ""}
          pointsConfig={{
            firstPlace: 30,
            secondPlace: 20,
            thirdPlace: 10,
          }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.content, { flex: 1 }]}>
            <View style={styles.progressRow}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${((game?.currentRound || 0) / (game?.totalRounds || 1)) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {game?.currentRound || 0}/{game?.totalRounds || 0}
              </Text>
            </View>
            
            {game.phase === "question" &&
              (user?.uid !== game.targetPlayer?.id || game.players.length === 2 ? (
                hasPlayerAnswered ? (
                  <View style={styles.questionContainer}>
                    <View style={styles.questionCard}>
                      <Text style={styles.questionText}>
                        {formattedQuestionText}
                      </Text>
                    </View>
                    <View style={styles.answeredContainer}>
                      <Text style={styles.answeredText}>
                        {safeTranslate("game.listenButDontJudge.answered", "Vous avez déjà répondu. En attente des autres joueurs...")}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.questionContainer}>
                    <View style={styles.questionCard}>
                      <Text style={styles.questionText}>
                        {formattedQuestionText}
                      </Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder={t("game.listenButDontJudge.answerPlaceholder", "Écrivez votre réponse ici...")}
                      placeholderTextColor="#666"
                      value={answer}
                      onChangeText={setAnswer}
                      multiline
                      maxLength={200}
                    />
                    <RoundedButton
                      title={t("game.listenButDontJudge.submit", "Soumettre")}
                      onPress={handleSubmitAnswer}
                      disabled={isSubmitting || !answer.trim()}
                      style={styles.submitButton}
                    />
                  </View>
                )
              ) : (
                <View style={styles.questionContainer}>
                  <View style={styles.questionCard}>
                    <Text style={styles.waitingText}>
                      {safeTranslate("game.listenButDontJudge.waiting", "En attente des autres joueurs...")}
                    </Text>
                  </View>
                </View>
              ))}
              
            {game.phase === "vote" &&
              (user?.uid === game.targetPlayer?.id || game.players.length === 2 ? (
                <View style={styles.voteContainer}>
                  <View style={styles.questionCard}>
                    <Text style={styles.questionText}>
                      {formattedQuestionText}
                    </Text>
                  </View>
                  <Text style={styles.voteTitle}>
                    {t("game.listenButDontJudge.voteTitle", "Choisissez la meilleure réponse")}
                  </Text>
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
                      {game.votes && user?.uid && game.votes[user.uid]
                        ? safeTranslate("game.listenButDontJudge.waitingForOthers", "En attente des autres votes...")
                        : safeTranslate("game.listenButDontJudge.waitingVote", "En attente du vote du joueur cible...")}
                    </Text>
                  </View>
                </View>
              ))}
              
            {game.phase === "results" &&
              formattedQuestionForResults &&
              game?.currentRound < game?.totalRounds && (
                <View style={styles.container}>
                  <ResultsPhase
                    answers={game.answers || []}
                    scores={game.scores || {}}
                    players={game.players || []}
                    question={formattedQuestionForResults}
                    targetPlayer={game.targetPlayer || null}
                    onNextRound={handleNextRound}
                    isLastRound={game.currentRound === game.totalRounds}
                    timer={game.timer || null}
                    gameId={String(id ?? "")}
                    totalRounds={game.totalRounds || 0}
                    winningAnswerId={game.winningAnswerId || undefined}
                  />
                  <View style={styles.nextRoundButtonContainer}>
                    <RoundedButton
                      title={t("game.nextRound", "Tour suivant")}
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
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    marginTop: 50,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  progressBarBackground: {
    width: 220,
    height: 10,
    backgroundColor: "rgba(61, 41, 86, 0.5)",
    borderRadius: 5,
    marginRight: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 10,
    backgroundColor: "#A259FF",
    borderRadius: 5,
    shadowColor: "#A259FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressText: {
    color: "#C7B8F5",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 80,
  },
  questionCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 28,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  questionContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  answeredContainer: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  answeredText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  questionText: {
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 34,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    color: "#fff",
    fontSize: 18,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 24,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  voteContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  voteTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  submitButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 480,
    marginBottom: 16,
    shadowColor: "#A259FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voteButton: {
    padding: 20,
    marginBottom: 16,
    width: "100%",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 24,
    textAlign: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "rgba(255,100,100,0.2)",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    maxWidth: 300,
    alignSelf: "center",
  },
  waitingText: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "500",
  },
  nextRoundButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  nextRoundButton: {
    width: "80%",
    maxWidth: 300,
  },
});