import GameResults from "@/components/game/GameResults";
import { SpinningWheel } from "@/components/SpinningWheel";
import ChristmasTheme from "@/constants/themes/Christmas";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePileOuFaceQuestions } from "@/hooks/pile-ou-face-questions";
import { useInAppReview } from "@/hooks/useInAppReview";
import { usePoints } from "@/hooks/usePoints";
import { Player } from "@/types/gameTypes";
import { PileOuFaceGameState } from "@/types/types";
import {
  doc,
  getFirestore,
  onSnapshot,
  updateDoc,
} from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Utilisation du thème Christmas/Glamour
const GRADIENT_START = ChristmasTheme.light.backgroundDarker;
const GRADIENT_END = ChristmasTheme.light.primary;
const ACCENT_COLOR = ChristmasTheme.light.primary;
const ACCENT_GOLD = ChristmasTheme.light.tertiary;

// Composant pour afficher la pièce qui tourne
const CoinFlip = ({
  isFlipping,
  result,
  onFlipComplete,
  onTap,
  canFlip,
}: {
  isFlipping: boolean;
  result: "pile" | "face" | null;
  onFlipComplete: () => void;
  onTap?: () => void;
  canFlip?: boolean;
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [currentSide, setCurrentSide] = useState<"pile" | "face">("face");

  useEffect(() => {
    if (isFlipping) {
      // Alterner entre pile et face pendant l'animation
      const flipInterval = setInterval(() => {
        setCurrentSide((prev) => (prev === "pile" ? "face" : "pile"));
      }, 150); // Change toutes les 150ms

      // Animation de rotation avec rebonds
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: 10,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 1900,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        clearInterval(flipInterval);
        onFlipComplete();
      });

      return () => clearInterval(flipInterval);
    }
  }, [isFlipping]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Déterminer quelle image afficher
  const getCoinImage = () => {
    if (result) {
      // Si on a un résultat final, l'afficher
      return result === "pile"
        ? require("@/assets/jeux/pile.png")
        : require("@/assets/jeux/face.png");
    }
    // Sinon, alterner pendant l'animation
    return currentSide === "pile"
      ? require("@/assets/jeux/pile.png")
      : require("@/assets/jeux/face.png");
  };

  const handlePress = () => {
    if (canFlip && !isFlipping && !result && onTap) {
      onTap();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={!canFlip || isFlipping || !!result}
    >
      <Animated.View
        style={[
          styles.coin,
          {
            transform: [{ rotateY: spin }, { scale: scaleAnim }],
          },
        ]}
      >
        <Image source={getCoinImage()} style={styles.coinImage} />
        {canFlip && !isFlipping && !result && (
          <View style={styles.tapHint}>
            <Text style={styles.tapHintText}>👆 Touche la pièce</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Composant carte de joueur
const PlayerCard = ({
  player,
  isActive,
}: {
  player: Player;
  isActive: boolean;
}) => {
  return (
    <View
      style={[
        styles.playerCard,
        isActive && { borderColor: ACCENT_GOLD, borderWidth: 3 },
      ]}
    >
      <LinearGradient
        colors={
          isActive
            ? [ACCENT_GOLD, ACCENT_COLOR]
            : [GRADIENT_START, GRADIENT_END]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.playerName}>{player.name}</Text>
      {isActive && <Text style={styles.activeIndicator}>🎯</Text>}
    </View>
  );
};

export default function PileOuFaceGameScreen() {
  const { id: idParam } = useLocalSearchParams();
  const id = Array.isArray(idParam) ? idParam[0] : idParam || "";
  const { user } = useAuth();
  const router = useRouter();
  const { requestReview } = useInAppReview();
  const { awardGamePoints } = usePoints();
  const [game, setGame] = useState<PileOuFaceGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelSelectedPlayer, setWheelSelectedPlayer] = useState<Player | null>(
    null,
  );
  const gameStartTime = useRef(Date.now());
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { getRandomQuestion, resetAskedQuestions, isLoadingQuestions } =
    usePileOuFaceQuestions();

  // Sélectionner un joueur aléatoire au début de chaque round avec animation de roue
  const selectRandomPlayer = async (gameData: PileOuFaceGameState) => {
    if (!gameData || !user) return;
    try {
      // Choisir un joueur aléatoire
      const randomIndex = Math.floor(Math.random() * gameData.players.length);
      const selectedPlayer = gameData.players[randomIndex];

      if (!selectedPlayer) {
        console.error("No player selected");
        return;
      }

      // Démarrer l'animation de la roue
      setWheelSelectedPlayer(selectedPlayer);
      setIsSpinning(true);
    } catch (error) {
      console.error("Error selecting player:", error);
      Alert.alert("Erreur", "Impossible de sélectionner un joueur");
    }
  };

  // Appelé quand la roue a fini de tourner
  const onWheelSpinComplete = async () => {
    if (!game || !wheelSelectedPlayer) return;

    setIsSpinning(false);

    try {
      const db = getFirestore();
      const gameRef = doc(db, "games", String(id));

      // Générer une nouvelle question
      const question = getRandomQuestion();

      if (!question) {
        console.error("No question available");
        Alert.alert("Erreur", "Aucune question disponible");
        return;
      }

      await updateDoc(gameRef, {
        currentPlayerId: wheelSelectedPlayer.id,
        currentQuestion: question,
        phase: "question",
        selectedPlayerName: null,
        coinFlipResult: null,
        questionRevealed: false,
      });
    } catch (error) {
      console.error("Error updating game:", error);
      Alert.alert("Erreur", "Impossible de démarrer le round");
    }
  };

  // Le joueur sélectionné choisit un autre joueur
  const handlePlayerSelection = async (selectedPlayer: Player) => {
    if (!game || !user) return;
    try {
      const db = getFirestore();
      const gameRef = doc(db, "games", String(id));

      await updateDoc(gameRef, {
        selectedPlayerName: selectedPlayer.name,
        phase: "coin-flip",
      });

      setShowPlayerSelector(false);
    } catch (error) {
      console.error("Error selecting player:", error);
      Alert.alert("Erreur", "Impossible de sélectionner le joueur");
    }
  };

  // Lancer la pièce
  const handleCoinFlip = async () => {
    if (!game || !user || isFlipping) return;

    setIsFlipping(true);

    // Générer un résultat aléatoire
    const result = Math.random() < 0.5 ? "pile" : "face";

    try {
      const db = getFirestore();
      const gameRef = doc(db, "games", String(id));

      // Calculer les points
      const updatedScores = { ...(game.scores || {}) };

      if (result === "pile") {
        // PILE : Le joueur qui a posé la question gagne 10 points (chance)
        if (game.currentPlayerId) {
          updatedScores[game.currentPlayerId] =
            (updatedScores[game.currentPlayerId] || 0) + 10;
        }
      } else {
        // FACE : Le joueur ciblé gagne 5 points (courage d'être exposé)
        const targetPlayer = game.players.find(
          (p) => p.name === game.selectedPlayerName,
        );
        if (targetPlayer) {
          updatedScores[targetPlayer.id] =
            (updatedScores[targetPlayer.id] || 0) + 5;
        }
      }

      // Attendre 2 secondes pour l'animation
      setTimeout(async () => {
        await updateDoc(gameRef, {
          coinFlipResult: result,
          phase: result === "face" ? "reveal" : "results",
          questionRevealed: result === "face",
          scores: updatedScores,
        });

        setIsFlipping(false);
      }, 2000);
    } catch (error) {
      console.error("Error flipping coin:", error);
      setIsFlipping(false);
    }
  };

  // Passer au tour suivant
  const handleNextRound = async () => {
    if (!game || !user) return;
    try {
      const db = getFirestore();
      const gameRef = doc(db, "games", String(id));

      const nextRound = game.currentRound + 1;
      const isGameOver = nextRound > game.totalRounds;

      if (isGameOver) {
        await updateDoc(gameRef, {
          phase: "end",
          currentRound: game.totalRounds,
        });
        return;
      }

      // Réinitialiser pour le prochain tour
      await updateDoc(gameRef, {
        currentRound: nextRound,
        phase: "loading",
        currentPlayerId: null,
        selectedPlayerName: null,
        coinFlipResult: null,
        questionRevealed: false,
        currentQuestion: null,
      });
    } catch (error) {
      console.error("Error moving to next round:", error);
      Alert.alert("Erreur", "Impossible de passer au tour suivant");
    }
  };

  // Écouter les changements du jeu
  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const gameRef = doc(db, "games", String(id));
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const gameData = docSnap.data() as PileOuFaceGameState;

        setGame(gameData);

        // Si on est en phase loading et qu'il n'y a pas de joueur sélectionné, on en sélectionne un
        if (gameData.phase === "loading" && !gameData.currentPlayerId) {
          selectRandomPlayer(gameData);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  // Vérifier si le jeu est terminé
  useEffect(() => {
    if (
      game &&
      (game.currentRound > game.totalRounds || game.phase === "end")
    ) {
      setIsGameOver(true);
    } else {
      setIsGameOver(false);
    }
  }, [game]);

  if (loading || isLoadingQuestions) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[GRADIENT_START, GRADIENT_END]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={ACCENT_GOLD} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[GRADIENT_START, GRADIENT_END]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.errorText}>Partie introuvable</Text>
      </View>
    );
  }

  if (isGameOver) {
    return (
      <GameResults
        players={game?.players || []}
        scores={game?.scores || {}}
        userId={user?.uid || ""}
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
  const otherPlayers = game.players.filter(
    (p) => p.id !== game.currentPlayerId,
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[GRADIENT_START, GRADIENT_END]}
        style={StyleSheet.absoluteFill}
      />
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🪙 PILE OU FACE</Text>
          <Text style={styles.subtitle}>
            Tour {game.currentRound} / {game.totalRounds}
          </Text>
        </View>

        {/* Phase de chargement - sélection du joueur avec roue */}
        {game.phase === "loading" && (
          <View style={styles.phaseContainer}>
            <Text style={styles.wheelTitle}>🎰 QUI VA JOUER ?</Text>
            <SpinningWheel
              players={game.players}
              selectedPlayer={wheelSelectedPlayer}
              isSpinning={isSpinning}
              onSpinComplete={onWheelSpinComplete}
            />
            {isSpinning && (
              <Text style={styles.wheelText}>La roue tourne...</Text>
            )}
            {!isSpinning && wheelSelectedPlayer && (
              <Text style={styles.wheelResultText}>
                🎯 C'est {wheelSelectedPlayer.name} !
              </Text>
            )}
          </View>
        )}

        {/* Phase de question - seul le joueur actif voit la question */}
        {game.phase === "question" && currentPlayer && (
          <View style={styles.phaseContainer}>
            <PlayerCard player={currentPlayer} isActive={true} />

            {isCurrentPlayer ? (
              <View style={styles.questionContainer}>
                <View style={styles.questionBadge}>
                  <Text style={styles.questionBadgeText}>
                    ⚠️ Question secrète
                  </Text>
                </View>
                <Text style={styles.questionText}>
                  {game.currentQuestion?.text}
                </Text>
                <Text style={styles.instructionText}>
                  Prononcez le prénom d'une personne présente à voix haute
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setShowPlayerSelector(true)}
                >
                  <Text style={styles.buttonText}>Choisir un joueur</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  {currentPlayer.name} lit une question secrète...
                </Text>
                <Text style={styles.waitingSubtext}>
                  Patience, il va bientôt prononcer un prénom !
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Phase de pile ou face */}
        {game.phase === "coin-flip" && (
          <View style={styles.phaseContainer}>
            <Text style={styles.announcementText}>
              {currentPlayer?.name} a choisi :{" "}
              <Text style={styles.selectedPlayerText}>
                {game.selectedPlayerName}
              </Text>
            </Text>
            <Text style={styles.coinFlipQuestion}>
              Mais quelle était la question ? 🤔
            </Text>

            {!game.coinFlipResult && (
              <CoinFlip
                isFlipping={isFlipping}
                result={game.coinFlipResult}
                onFlipComplete={() => {}}
                onTap={handleCoinFlip}
                canFlip={isCurrentPlayer}
              />
            )}

            {game.coinFlipResult && (
              <View style={styles.resultCoin}>
                <Image
                  source={
                    game.coinFlipResult === "pile"
                      ? require("@/assets/jeux/pile.png")
                      : require("@/assets/jeux/face.png")
                  }
                  style={styles.resultCoinImage}
                />
              </View>
            )}

            <View style={styles.infoTextContainer}>
              <Text style={styles.coinFlipInfo}>
                Si c'est FACE, la question sera révélée ! 😱
              </Text>
            </View>

            {!isCurrentPlayer && !isFlipping && !game.coinFlipResult && (
              <Text style={styles.waitingSubtext}>
                {currentPlayer?.name} va lancer la pièce...
              </Text>
            )}
          </View>
        )}

        {/* Phase de révélation - la question est révélée */}
        {game.phase === "reveal" && game.questionRevealed && (
          <View style={styles.phaseContainer}>
            <Text style={styles.revealTitle}>😱 LA QUESTION EST RÉVÉLÉE !</Text>
            <View style={styles.revealContainer}>
              <Text style={styles.revealQuestion}>
                {game.currentQuestion?.text}
              </Text>
              <Text style={styles.revealAnswer}>
                {currentPlayer?.name} a répondu :{" "}
                <Text style={styles.selectedPlayerText}>
                  {game.selectedPlayerName}
                </Text>
              </Text>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>
                  +5 points pour {game.selectedPlayerName} ! 🏆
                </Text>
              </View>
            </View>
            <Text style={styles.revealEmoji}>🎭</Text>
            <TouchableOpacity style={styles.button} onPress={handleNextRound}>
              <Text style={styles.buttonText}>Tour suivant</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Phase de résultats - la question reste secrète */}
        {game.phase === "results" && !game.questionRevealed && (
          <View style={styles.phaseContainer}>
            <Text style={styles.resultsTitle}>🤐 SECRET GARDÉ !</Text>
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsText}>
                {currentPlayer?.name} a eu de la chance !
              </Text>
              <Text style={styles.resultsSubtext}>
                La question restera un mystère... pour toujours ! 🤫
              </Text>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>
                  +10 points pour {currentPlayer?.name} ! 🍀
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleNextRound}>
              <Text style={styles.buttonText}>Tour suivant</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal de sélection de joueur */}
      <Modal
        visible={showPlayerSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlayerSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir un joueur</Text>
            <ScrollView style={styles.playerList}>
              {otherPlayers.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.playerOption}
                  onPress={() => handlePlayerSelection(player)}
                >
                  <Text style={styles.playerOptionText}>{player.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPlayerSelector(false)}
            >
              <Text style={styles.modalCloseText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    marginTop: 20,
    fontWeight: "600",
  },
  errorText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: ACCENT_GOLD,
    fontWeight: "600",
  },
  phaseContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  phaseText: {
    color: "white",
    fontSize: 20,
    marginTop: 20,
    fontWeight: "600",
  },
  wheelTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: ACCENT_GOLD,
    textAlign: "center",
    marginBottom: 30,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  wheelText: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
    fontStyle: "italic",
  },
  wheelResultText: {
    fontSize: 24,
    color: ACCENT_GOLD,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  playerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    minWidth: 200,
    alignItems: "center",
    overflow: "hidden",
  },
  playerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  activeIndicator: {
    fontSize: 32,
    marginTop: 10,
  },
  questionContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    padding: 30,
    width: "100%",
    alignItems: "center",
  },
  questionBadge: {
    backgroundColor: ACCENT_GOLD,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  questionBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  questionText: {
    fontSize: 22,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
    lineHeight: 32,
  },
  instructionText: {
    fontSize: 16,
    color: ACCENT_GOLD,
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  waitingContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    padding: 30,
    width: "100%",
    alignItems: "center",
  },
  waitingText: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 10,
  },
  waitingSubtext: {
    fontSize: 16,
    color: ACCENT_GOLD,
    textAlign: "center",
  },
  announcementText: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
  selectedPlayerText: {
    color: ACCENT_GOLD,
    fontWeight: "bold",
  },
  coinFlipQuestion: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
    fontStyle: "italic",
  },
  coin: {
    width: 200,
    height: 200,
    marginVertical: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  coinImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  tapHint: {
    position: "absolute",
    bottom: -50,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tapHintText: {
    color: ACCENT_GOLD,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  infoTextContainer: {
    marginTop: 60,
    paddingHorizontal: 20,
  },
  coinFlipInfo: {
    fontSize: 16,
    color: ACCENT_GOLD,
    textAlign: "center",
    marginBottom: 20,
  },
  revealTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: ACCENT_GOLD,
    textAlign: "center",
    marginBottom: 20,
  },
  revealContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    borderRadius: 20,
    padding: 30,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: ACCENT_GOLD,
  },
  revealQuestion: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  revealAnswer: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
  revealEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: ACCENT_GOLD,
    textAlign: "center",
    marginBottom: 20,
  },
  resultsContainer: {
    backgroundColor: "rgba(0, 255, 0, 0.2)",
    borderRadius: 20,
    padding: 30,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: ACCENT_GOLD,
  },
  resultsText: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
  resultsSubtext: {
    fontSize: 16,
    color: ACCENT_GOLD,
    textAlign: "center",
  },
  pointsBadge: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    borderWidth: 2,
    borderColor: ACCENT_GOLD,
  },
  pointsText: {
    fontSize: 18,
    color: ACCENT_GOLD,
    textAlign: "center",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: ACCENT_GOLD,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: ChristmasTheme.light.backgroundDarker,
    borderRadius: 20,
    padding: 30,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  playerList: {
    maxHeight: 300,
  },
  playerOption: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
  },
  playerOptionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  modalCloseButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 15,
    borderRadius: 15,
    marginTop: 20,
  },
  modalCloseText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  resultCoin: {
    width: 250,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 15,
  },
  resultCoinImage: {
    width: 250,
    height: 250,
    borderRadius: 125,
  },
});
