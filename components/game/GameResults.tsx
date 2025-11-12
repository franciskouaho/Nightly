import RoundedButton from "@/components/RoundedButton";
import { useInAppReview } from "@/hooks/useInAppReview";
import useLeaderboard from "@/hooks/useLeaderboard";
import { usePoints } from "@/hooks/usePoints";
import { useSmartPaywall } from "@/hooks/useSmartPaywall";
import { Player } from "@/types/gameTypes";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PlayerRankDisplay: React.FC<{
  player: Player;
  rank: number;
  score: number;
}> = ({ player, rank, score }) => {
  const containerStyle = [
    styles.playerRankContainer,
    rank === 1 ? styles.rank1Container : styles.rank2PlusContainer,
  ];
  const avatarSize = rank === 1 ? 100 : 80;

  return (
    <View style={containerStyle}>
      <View
        style={[
          styles.avatarWrapper,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
        ]}
      >
        <Image
          source={{ uri: player.avatar || "https://via.placeholder.com/100" }}
          style={styles.avatar}
        />
        {rank === 1 && <Text style={styles.crown}>👑</Text>}
        <View style={styles.rankBadge}>
          <Text style={styles.rankBadgeText}>{rank}</Text>
        </View>
      </View>
      <Text style={styles.playerName} numberOfLines={1}>
        {player.name}
      </Text>
      <Text style={styles.playerScore}>{score} pts</Text>
    </View>
  );
};

interface GameResultsProps {
  players: Player[];
  scores: Record<string, number>;
  userId: string;
  pointsConfig?: {
    firstPlace?: number;
    secondPlace?: number;
    thirdPlace?: number;
  };
  colors?: readonly [string, string, ...string[]];
  secondaryScores?: Record<string, number>;
  secondaryScoresTitle?: string;
}

export default function GameResults({
  players,
  scores,
  userId,
  pointsConfig = {},
  colors = ["#21101C", "#21101C"],
  secondaryScores,
  secondaryScoresTitle,
}: GameResultsProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { awardLumiCoins } = usePoints();
  const { requestReview } = useInAppReview();
  const { updateUserStats } = useLeaderboard();
  const { onFreeGameCompleted } = useSmartPaywall();
  const { t } = useTranslation();

  const sortedPlayers = useMemo(
    () =>
      [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)),
    [players, scores],
  );

  const topThree = useMemo(() => sortedPlayers.slice(0, 3), [sortedPlayers]);
  const player1 = topThree.find((p, i) => i === 0);
  const player2 = topThree.find((p, i) => i === 1);
  const player3 = topThree.find((p, i) => i === 2);

  const currentUserRank = useMemo(
    () => sortedPlayers.findIndex((p) => p.id === userId) + 1,
    [sortedPlayers, userId],
  );

  // LumiCoins (monnaie) - toujours les mêmes valeurs pour tous les jeux
  const lumicoinsReward = useMemo(() => {
    if (currentUserRank === 1) return 30;
    if (currentUserRank === 2) return 20;
    if (currentUserRank === 3) return 10;
    return 5;
  }, [currentUserRank]);

  // Points de leaderboard - utilisent la config spécifique du jeu
  const leaderboardPoints = useMemo(() => {
    if (currentUserRank === 1) return pointsConfig.firstPlace || 25;
    if (currentUserRank === 2) return pointsConfig.secondPlace || 15;
    if (currentUserRank === 3) return pointsConfig.thirdPlace || 10;
    return 5; // Participation
  }, [currentUserRank, pointsConfig]);

  const rank_name = `rang ${currentUserRank}`;

  // Flags locaux pour éviter les appels multiples
  const [reviewRequested, setReviewRequested] = useState(false);
  const [statsUpdated, setStatsUpdated] = useState(false);
  const [lumicoinsAwarded, setLumicoinsAwarded] = useState(false);

  // ⚠️ FIX: Mettre à jour les statistiques du leaderboard une seule fois
  useEffect(() => {
    const updateLeaderboardStats = async () => {
      if (!userId || !scores[userId] || statsUpdated) return;

      const isWinner = currentUserRank === 1;

      try {
        // ✅ FIX: Utiliser leaderboardPoints calculé depuis pointsConfig
        await updateUserStats({
          userId,
          points: leaderboardPoints, // Utilise la config du jeu
          won: isWinner,
          timestamp: new Date(),
        });
        setStatsUpdated(true);
        console.log(`✅ Stats leaderboard mises à jour: +${leaderboardPoints} gamePoints pour rang ${currentUserRank}`);
      } catch (error) {
        console.error("Erreur lors de la mise à jour des stats:", error);
      }
    };

    updateLeaderboardStats();
  }, [userId, scores, currentUserRank, updateUserStats, statsUpdated, leaderboardPoints]);

  useEffect(() => {
    if (currentUserRank === 1 && !reviewRequested) {
      requestReview();
      setReviewRequested(true);
    }
  }, [currentUserRank, requestReview, reviewRequested]);

  // ⚠️ FIX: Attribution automatique des lumicoins à l'ouverture de l'écran
  useEffect(() => {
    const awardCoinsAutomatically = async () => {
      // ⚠️ FIX: Vérifier que userId existe et que les lumicoins n'ont pas déjà été attribués
      if (lumicoinsAwarded || !userId || userId === "") {
        console.log("⏭️ Lumicoins déjà attribués ou userId manquant:", { lumicoinsAwarded, userId });
        return;
      }

      // ⚠️ FIX: Vérifier que le rang est valide (doit être > 0)
      if (currentUserRank <= 0) {
        console.log("⏭️ Rang invalide pour attribuer les lumicoins:", currentUserRank);
        return;
      }

      try {
        console.log(`🎁 Attribution des lumicoins: userId=${userId}, montant=${lumicoinsReward}, rang=${currentUserRank}`);
        const success = await awardLumiCoins(userId, lumicoinsReward, "game_reward", rank_name);

        if (success) {
          setLumicoinsAwarded(true);
          console.log(`✅ Lumicoins attribués automatiquement: +${lumicoinsReward}`);
        } else {
          console.log("⚠️ Attribution des lumicoins échouée, mais on continue l'expérience");
          // On marque quand même comme attribué pour ne pas bloquer l'UX
          setLumicoinsAwarded(true);
        }
      } catch (error) {
        console.warn("⚠️ Erreur lors de l'attribution des lumicoins (ignorée):", error);
        // En cas d'erreur, on marque comme attribué pour ne pas bloquer l'UX
        setLumicoinsAwarded(true);
      }
    };

    // Attendre 1 seconde pour laisser l'utilisateur voir l'écran
    const timer = setTimeout(awardCoinsAutomatically, 1000);
    return () => clearTimeout(timer);
  }, [userId, lumicoinsReward, rank_name, awardLumiCoins, lumicoinsAwarded, currentUserRank]);

  // ⚠️ FIX: Déclencher le smart paywall après la partie UNIQUEMENT si le jeu n'utilise pas useGameEndPaywall
  // Les jeux suivants utilisent useGameEndPaywall : 'truth-or-dare', 'trap-answer', 'never-have-i-ever-hot'
  // Pour éviter les doublons, on ne déclenche pas useSmartPaywall pour ces jeux
  useEffect(() => {
    const triggerSmartPaywall = async () => {
      // ⚠️ FIX: Ne pas déclencher si le jeu utilise déjà useGameEndPaywall
      // Les jeux qui utilisent useGameEndPaywall gèrent leur propre paywall
      const GAMES_WITH_OWN_PAYWALL = ['truth-or-dare', 'trap-answer', 'never-have-i-ever-hot'];
      
      // On ne peut pas savoir quel jeu est en cours depuis GameResults, donc on laisse
      // useGameEndPaywall gérer les jeux gratuits et useSmartPaywall pour les autres
      // Pour éviter les doublons, on désactive temporairement useSmartPaywall ici
      // et on laisse useGameEndPaywall gérer tous les jeux gratuits
      
      console.log("🎮 Partie terminée - vérification smart paywall (désactivé pour éviter doublons avec useGameEndPaywall)");
      // await onFreeGameCompleted(); // ⚠️ DÉSACTIVÉ pour éviter les doublons
    };

    // Attendre un peu pour laisser l'utilisateur voir les résultats
    // ⚠️ DÉSACTIVÉ pour éviter les doublons
    // const timer = setTimeout(triggerSmartPaywall, 2000);
    // return () => clearTimeout(timer);
  }, [onFreeGameCompleted]);

  return (
    <LinearGradient colors={colors} style={styles.resultsBg}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 10 },
        ]}
      >
        <View style={styles.topPlayersContainer}>
          {player2 && (
            <PlayerRankDisplay
              player={player2}
              rank={2}
              score={scores[player2.id] || 0}
            />
          )}
          {player1 && (
            <PlayerRankDisplay
              player={player1}
              rank={1}
              score={scores[player1.id] || 0}
            />
          )}
          {player3 && (
            <PlayerRankDisplay
              player={player3}
              rank={3}
              score={scores[player3.id] || 0}
            />
          )}
        </View>

        <View style={styles.lumicoinsButton}>
          <MaterialCommunityIcons
            name="currency-btc"
            size={22}
            color="#FDD835"
          />
          <Text style={styles.lumicoinsButtonText}>
            {lumicoinsAwarded
              ? `✓ ${lumicoinsReward} ${t("common.lumicoins", "Lumicoins")}`
              : `+${lumicoinsReward} ${t("common.lumicoins", "Lumicoins")}...`}
          </Text>
        </View>

        {currentUserRank > 0 && (
          <View style={styles.currentUserRankContainer}>
            <Text style={styles.currentUserRankText}>
              {t("game.results.yourCurrentRank", "Votre rang actuel")}
            </Text>
            <View style={styles.rankInfo}>
              <Text style={styles.rankNumber}>{currentUserRank}</Text>
              <Ionicons name="arrow-up" size={24} color="#00E676" />
            </View>
          </View>
        )}

        <View style={{ flex: 1 }} />

        <View style={styles.footer}>
          <RoundedButton
            title="Accueil"
            onPress={() => router.replace("/(tabs)")}
            icon={<Ionicons name="home" size={22} color="#fff" />}
            gradientColors={["#C41E3A", "#8B1538", "#A01D2E"]}
            style={styles.homeButton}
            textStyle={styles.homeButtonText}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  resultsBg: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  topPlayersContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 220,
    marginBottom: 30,
  },
  playerRankContainer: {
    alignItems: "center",
  },
  rank1Container: {
    zIndex: 1,
  },
  rank2PlusContainer: {
    marginHorizontal: -15,
    transform: [{ translateY: 10 }],
  },
  avatarWrapper: {
    borderWidth: 4,
    borderColor: "#FFD700",
    backgroundColor: "#3a2d4f",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 8,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  crown: {
    position: "absolute",
    top: -25,
    fontSize: 24,
  },
  rankBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFD700",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#21101C",
  },
  rankBadgeText: {
    color: "#21101C",
    fontWeight: "bold",
    fontSize: 16,
  },
  playerName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  playerScore: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  lumicoinsButton: {
    backgroundColor: "#3D2E27",
    borderColor: "#FDD835",
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    width: "80%",
    shadowColor: "#FDD835",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  lumicoinsButtonText: {
    color: "#FDD835",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 18,
  },
  currentUserRankContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  currentUserRankText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  rankInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankNumber: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 8,
  },
  footer: {
    width: "100%",
    paddingBottom: 10,
  },
  homeButton: {
    paddingVertical: 16,
    borderRadius: 25,
    width: "100%",
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
