import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  doc,
  getFirestore,
  onSnapshot,
  updateDoc,
} from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Clipboard from "@react-native-clipboard/clipboard";
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Types
import { Room, RoomScreenStyles } from "@/types/roomTypes";

// Components
import HalloweenDecorations from "@/components/HalloweenDecorations";
import GameOptions from "@/components/room/GameOptions";
import InviteModal from "@/components/room/InviteModal";
import PlayersList from "@/components/room/PlayersList";
import RoomCodeDisplay from "@/components/room/RoomCodeDisplay";
import RoundSelector from "@/components/room/RoundSelector";
import RulesDrawer from "@/components/room/RulesDrawer";
import RoundedButton from "@/components/RoundedButton";

// Services
import {
  createGame,
  getMinPlayersForGame,
} from "@/services/gameInitializationService";

// Constants
import HalloweenTheme from "@/constants/themes/Halloween";

export default function RoomScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { getGameContent } = useLanguage();

  // State
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRulesDrawerVisible, setIsRulesDrawerVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [hasReadRules, setHasReadRules] = useState(false);
  const [showRulesOnReady, setShowRulesOnReady] = useState(false);
  const [selectedRounds, setSelectedRounds] = useState(5);
  const [showRoundSelector, setShowRoundSelector] = useState(false);

  // Game options
  const [selectedLevel, setSelectedLevel] = useState<
    "hot" | "extreme" | "chaos" | null
  >("hot");
  const [selectedMode, setSelectedMode] = useState<"versus" | "fusion" | null>(
    "versus",
  );
  const [selectedIntensity, setSelectedIntensity] = useState<
    "soft" | "tension" | "extreme" | null
  >("soft");

  const isHalloweenGame = room?.gameId === "quiz-halloween";
  const isHost = user?.uid === room?.host;
  const currentPlayer = room?.players.find(
    (p) => String(p.id) === String(user?.uid),
  );
  const minPlayers = room ? getMinPlayersForGame(room.gameId) : 2;
  const canStart =
    room &&
    room.players.every((p) => p.isReady) &&
    room.players.length >= minPlayers;

  // Listener pour les changements de la room
  useEffect(() => {
    if (!id || !user) return;

    const db = getFirestore();
    const roomRef = doc(db, "rooms", id as string);

    const unsubscribe = onSnapshot(
      roomRef,
      async (doc) => {
        if (doc.exists()) {
          const roomData = { ...(doc.data() as Room), id: doc.id };
          setRoom(roomData);

          // Redirection automatique quand la partie commence
          if (roomData.status === "playing" && roomData.gameDocId) {
            router.replace(`/game/${roomData.gameMode}/${roomData.gameDocId}`);
            return;
          }
          // Redirection spéciale pour Quiz Halloween
          else if (
            roomData.status === "waiting" &&
            roomData.gameDocId &&
            roomData.gameMode === "quiz-halloween"
          ) {
            router.replace(`/game/quiz-halloween/${roomData.gameDocId}`);
            return;
          }
        } else {
          Alert.alert("Erreur", "Salle introuvable");
          router.back();
        }
        setLoading(false);
      },
      (error) => {
        console.error("Erreur lors de l'écoute de la salle:", error);
        Alert.alert("Erreur", "Impossible de charger la salle");
        router.back();
      },
    );

    return () => unsubscribe();
  }, [id, user]);

  const handleStartGame = async () => {
    if (!room || !user) return;

    if (room.players.length < minPlayers) {
      Alert.alert(
        t("room.notEnoughPlayers"),
        t("room.minPlayersRequired", { count: minPlayers }),
      );
      return;
    }

    setHasReadRules(false);
    setIsRulesDrawerVisible(true);
    setIsStartingGame(true);
  };

  const handleRulesClose = async () => {
    setIsRulesDrawerVisible(false);
    setShowRulesOnReady(false);

    if (isStartingGame && hasReadRules) {
      setIsStartingGame(false);
      await startGame();
    } else if (isStartingGame) {
      setIsStartingGame(false);
      Alert.alert(
        "Règles non lues",
        "Veuillez lire les règles avant de démarrer la partie.",
      );
    }
  };

  const handleRulesConfirm = async () => {
    setHasReadRules(true);
    if (isStartingGame) {
      setIsRulesDrawerVisible(false);
      setIsStartingGame(false);
      await startGame();
    } else if (showRulesOnReady) {
      await handleConfirmRulesOnReady();
      setShowRulesOnReady(false);
    } else {
      setIsRulesDrawerVisible(false);
    }
  };

  const startGame = async () => {
    setIsStartingGame(true);
    if (!room || !user) return;

    try {
      const db = getFirestore();
      const gameDocId = await createGame({
        gameMode: room.gameId,
        players: room.players,
        hostId: user.uid,
        selectedRounds,
        selectedLevel: selectedLevel || undefined,
        selectedMode: selectedMode || undefined,
        selectedIntensity: selectedIntensity || undefined,
        getGameContent,
      });

      const isQuizHalloween = room.gameId === "quiz-halloween";
      const newStatus = isQuizHalloween ? "waiting" : "playing";

      await updateDoc(doc(db, "rooms", room.id), {
        status: newStatus,
        gameDocId: gameDocId,
        gameMode: room.gameId,
      });

      router.replace(`/game/${room.gameId}/${gameDocId}`);
    } catch (error) {
      console.error("Erreur lors du démarrage du jeu:", error);
      Alert.alert("Erreur", "Impossible de démarrer le jeu");
    } finally {
      setIsStartingGame(false);
    }
  };

  const handleConfirmRulesOnReady = async () => {
    if (!room || !user) return;

    try {
      const db = getFirestore();
      const updatedPlayers = room.players.map((p) =>
        String(p.id) === String(user?.uid) ? { ...p, isReady: true } : p,
      );

      await updateDoc(doc(db, "rooms", room.id), {
        players: updatedPlayers,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut prêt:", error);
      Alert.alert("Erreur", "Impossible de se mettre prêt");
    }
  };

  const handleLeaveRoom = async () => {
    if (!room || !user) return;

    try {
      const db = getFirestore();
      const updatedPlayers = room.players.filter((p) => p.id !== user.uid);

      if (updatedPlayers.length === 0) {
        await updateDoc(doc(db, "rooms", room.id), {
          status: "finished",
        });
      } else if (updatedPlayers[0]) {
        await updateDoc(doc(db, "rooms", room.id), {
          players: updatedPlayers,
          host: updatedPlayers[0].id,
        });
      }

      router.back();
    } catch (error) {
      console.error("Erreur lors de la sortie de la salle:", error);
      Alert.alert("Erreur", "Impossible de quitter la salle");
    }
  };

  const handleShareRoom = async () => {
    if (!room) return;
    try {
      await Share.share({
        message: `Rejoins ma partie sur Nightly ! Code: ${room.code}`,
        title: "Rejoins ma partie",
      });
    } catch (error) {
      console.error("Erreur lors du partage:", error);
    }
  };

  const handleCopyCode = async () => {
    if (!room) return;
    try {
      await Clipboard.setString(room.code);
    } catch (error) {
      console.error("Erreur lors de la copie du code:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("room.loading")}</Text>
      </View>
    );
  }

  if (!room || !room.id) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={
          isHalloweenGame
            ? [
                HalloweenTheme.light.backgroundDarker,
                HalloweenTheme.light.secondary,
                HalloweenTheme.light.primary,
                HalloweenTheme.light.secondary,
                HalloweenTheme.light.backgroundDarker,
              ]
            : ["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]
        }
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      >
        {isHalloweenGame && (
          <View style={styles.halloweenDecorations}>
            <HalloweenDecorations />
          </View>
        )}

        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarRow}>
            <TouchableOpacity
              onPress={handleLeaveRoom}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.rightContainer}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setInviteModalVisible(true)}
              >
                <LinearGradient
                  colors={
                    isHalloweenGame
                      ? [
                          HalloweenTheme.light.primary,
                          HalloweenTheme.light.error,
                        ]
                      : ["#C41E3A", "#8B1538"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 12, padding: 7 }}
                >
                  <Ionicons name="qr-code" size={22} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.topBarTitleContainer}>
            <Text style={styles.topBarTitle}>
              {t("room.title")} -{" "}
              {t(`home.games.${room.gameId}.name`, {
                defaultValue: room.name?.toUpperCase(),
              })}
            </Text>
          </View>
        </View>

        {/* Warning minimum de joueurs */}
        {room.players.length <= minPlayers && (
          <Text style={[styles.minPlayersWarning, styles.centeredWarning]}>
            {t("room.minPlayersRequired", { count: minPlayers })}
          </Text>
        )}

        {/* Code de la room */}
        <RoomCodeDisplay code={room.code} onCopy={handleCopyCode} />

        {/* Liste des joueurs */}
        <View style={styles.playersContainer}>
          <View style={styles.playersHeaderRow}>
            <Text style={styles.sectionTitle}>
              {t("room.players", { count: room.players.length })} (
              {room.players.length}/{room.maxPlayers})
            </Text>
            <TouchableOpacity
              style={styles.rulesButtonRow}
              onPress={() => setIsRulesDrawerVisible(true)}
            >
              <Text style={styles.rulesText}>{t("room.rules")}</Text>
              <View style={styles.rulesCircle}>
                <Text style={styles.rulesQuestionMark}>?</Text>
              </View>
            </TouchableOpacity>
          </View>

          <PlayersList players={room.players} maxPlayers={room.maxPlayers} />
        </View>

        {/* Contrôles de l'hôte */}
        {isHost && room.status === "waiting" && (
          <View style={styles.gameControlsContainer}>
            {/* Sélecteur de rounds */}
            <RoundSelector
              selectedRounds={selectedRounds}
              showOptions={showRoundSelector}
              onToggle={() => setShowRoundSelector(!showRoundSelector)}
              onSelect={(rounds) => {
                setSelectedRounds(rounds);
                setShowRoundSelector(false);
              }}
              isHalloweenGame={isHalloweenGame}
            />

            {/* Options spécifiques au jeu */}
            <GameOptions
              gameId={room.gameId}
              selectedLevel={selectedLevel}
              selectedMode={selectedMode}
              selectedIntensity={selectedIntensity}
              onLevelChange={setSelectedLevel}
              onModeChange={setSelectedMode}
              onIntensityChange={setSelectedIntensity}
              isHalloweenGame={isHalloweenGame}
            />

            {/* Bouton Démarrer */}
            <View style={styles.startButtonContainer}>
              <RoundedButton
                title={t("room.startGame")}
                onPress={handleStartGame}
                disabled={!canStart}
                style={[styles.startButton, !canStart && styles.disabledButton]}
                textStyle={styles.startButtonText}
                gradientColors={
                  isHalloweenGame
                    ? [HalloweenTheme.light.primary, HalloweenTheme.light.error]
                    : ["#C41E3A", "#8B1538"]
                }
              />
            </View>
          </View>
        )}

        {/* Bouton "Je suis prêt" pour les non-hôtes */}
        {!isHost && room.status === "waiting" && !currentPlayer?.isReady && (
          <View style={styles.readyButtonContainer}>
            <TouchableOpacity
              style={styles.readyButtonFullWidth}
              onPress={() => {
                setShowRulesOnReady(true);
                setIsRulesDrawerVisible(true);
              }}
            >
              <LinearGradient
                colors={
                  isHalloweenGame
                    ? [HalloweenTheme.light.primary, HalloweenTheme.light.error]
                    : ["#C41E3A", "#8B1538"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.roundSelectorGradient}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={styles.roundSelectorText}>
                    {t("room.iAmReady")}
                  </Text>
                  <View style={styles.roundSelectorIconContainer}>
                    <MaterialCommunityIcons
                      name="star-four-points"
                      size={18}
                      color="white"
                      style={styles.starIcon}
                    />
                    <MaterialCommunityIcons
                      name="star-four-points"
                      size={12}
                      color="white"
                      style={styles.smallStarIcon}
                    />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Modals */}
        <RulesDrawer
          visible={isRulesDrawerVisible || showRulesOnReady}
          onClose={handleRulesClose}
          onConfirm={handleRulesConfirm}
          gameId={room?.gameId}
          isStartingGame={showRulesOnReady}
        />

        <InviteModal
          visible={inviteModalVisible}
          roomId={room?.code || ""}
          onClose={() => setInviteModalVisible(false)}
          onCopyCode={handleCopyCode}
          onShareCode={handleShareRoom}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create<RoomScreenStyles>({
  container: { flex: 1 },
  background: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4b277d",
  },
  loadingText: { color: "#fff", fontSize: 16 },
  topBar: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  topBarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitleContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  topBarTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
  },
  rightContainer: { flexDirection: "row", alignItems: "center" },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  playersContainer: { flex: 1, paddingHorizontal: 20 },
  playersHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  rulesButtonRow: { flexDirection: "row", alignItems: "center" },
  rulesText: { color: "#ccc", fontSize: 16, marginRight: 6 },
  rulesCircle: {
    width: 18,
    height: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  rulesQuestionMark: {
    color: "#ccc",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: -2,
  },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  gameControlsContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 15,
    position: "relative",
    zIndex: 100,
  },
  readyButtonContainer: {
    width: "100%",
    alignItems: "stretch",
    paddingHorizontal: 20,
    marginBottom: 15,
    position: "relative",
    zIndex: 100,
  },
  readyButtonFullWidth: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  roundSelectorGradient: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  roundSelectorText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  roundSelectorIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },
  starIcon: { marginLeft: 2 },
  smallStarIcon: { marginLeft: -4, marginTop: -8 },
  startButtonContainer: { width: "100%", marginBottom: 15 },
  startButton: { width: "100%", alignSelf: "stretch" },
  startButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  minPlayersWarning: { color: "#ff6b6b", fontSize: 14, fontWeight: "500" },
  disabledButton: { opacity: 0.5 },
  centeredWarning: { textAlign: "center", marginBottom: 10 },
  halloweenDecorations: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
    pointerEvents: "none",
  },

  // Unused styles kept for compatibility
  shareButton: {},
  codeContainer: {},
  codeLabel: {},
  codeBox: {},
  codeText: {},
  playerCard: {},
  playerAvatar: {},
  playerInfo: {},
  playerName: {},
  hostBadge: {},
  hostText: {},
  readyBadge: {},
  readyText: {},
  readyButton: {},
  readyButtonGradient: {},
  readyButtonText: {},
  headerButtons: {},
  inviteButton: {},
  roundSelectorContainer: {},
  roundSelectorButton: {},
  roundOptionsContainer: {},
  roundOptionsRow: {},
  roundOption: {},
  roundOptionText: {},
  selectedRoundOption: {},
  selectedRoundOptionText: {},
  leaveButton: {},
  leaveButtonText: {},
  minPlayersText: {},
});
