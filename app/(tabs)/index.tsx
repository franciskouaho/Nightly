"use client";

import { gameCategories, GameCategory, GameMode } from "@/app/data/gameModes";
import TopBar from "@/components/TopBar";
import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { usePaywall } from "@/contexts/PaywallContext";
import { useFirestore } from "@/hooks/useFirestore";
import useLeaderboard from "@/hooks/useLeaderboard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useRef } from "react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Linking from "expo-linking";
import QRScannerModal from "@/components/QRScannerModal";

interface Room {
  id?: string;
  name: string;
  gameId: string;
  createdBy: string;
  host: string;
  players: Array<{
    id: string;
    username: string;
    displayName: string;
    isHost: boolean;
    isReady: boolean;
    avatar: string;
  }>;
  createdAt: string;
  status: "waiting" | "playing" | "finished";
  maxPlayers: number;
  code: string;
}

const generateRoomCode = (length = 6) => {
  const chars = "0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};


export default function HomeScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const { add: createRoom, loading: isCreatingRoom } =
    useFirestore<Room>("rooms");
  const [partyCode, setPartyCode] = React.useState("");
  const [codeDigits, setCodeDigits] = React.useState(["", "", "", "", "", ""]);
  const codeInputRefs = useRef<(TextInput | null)[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showQRScanner, setShowQRScanner] = React.useState(false);
  const { t } = useTranslation();
  const [error, setError] = React.useState("");
  const posthog = usePostHog();
  const {
    showPaywallA,
    setInActiveGame,
    isProMember,
  } = usePaywall();
  const { getTopPlayers } = useLeaderboard();


  // Test PostHog: capture d'un événement à l'affichage du composant de test
  // (L'événement "PostHogTestComponent mounted" sera envoyé par le composant)

  useEffect(() => {
    posthog.capture("MyComponent loaded", { foo: "bar" });
  }, []);

  useEffect(() => {
    console.log("🔄 État de création de salle:", isCreatingRoom);
  }, [isCreatingRoom]);

  useEffect(() => {
    // Afficher le paywall A 2 secondes après l'arrivée sur la home si l'utilisateur n'a pas d'abonnement actif et n'est pas pro
    if (!user?.hasActiveSubscription && !isProMember) {
      const timer = setTimeout(() => {
        showPaywallA();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [user?.hasActiveSubscription, isProMember, showPaywallA]);

  const getUserDisplayName = (user: any) => {
    if (!user) return "Joueur";

    if (typeof user.pseudo === "string" && user.pseudo.trim() !== "") {
      return user.pseudo;
    }

    return "Joueur";
  };

  const createGameRoom = async (game: GameMode) => {
    const gameName = game.nameKey ? t(game.nameKey) : (t(`home.games.${game.id}.name`) || game.name || game.id);
    console.log("👉 Fonction createGameRoom appelée pour:", gameName);

    if (!user) {
      console.log("❌ Utilisateur non connecté");
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour créer une salle de jeu.",
        [{ text: "OK" }],
      );
      return;
    }

    console.log("👤 Informations utilisateur:", {
      uid: user.uid,
      pseudo: user.pseudo,
      createdAt: user.createdAt,
      avatar: user.avatar,
    });

    if (!user.uid) {
      console.error("❌ UID utilisateur manquant");
      Alert.alert(
        "Erreur de connexion",
        "Votre session utilisateur est invalide. Veuillez vous reconnecter.",
        [{ text: "OK" }],
      );
      return;
    }

    console.log("⌛ Début du processus de création de salle...");

    try {
      const netInfo = await NetInfo.fetch();
      console.log("📶 État de la connexion:", netInfo.isConnected);

      if (!netInfo.isConnected) {
        Alert.alert(
          "Erreur de connexion",
          "Pas de connexion internet. Veuillez vérifier votre connexion et réessayer.",
        );
        return;
      }

      console.log("🎮 Création d'une salle pour le mode:", game.id);

      const displayName = getUserDisplayName(user);

      const shortCode = generateRoomCode(6);

      const roomData: Omit<Room, "id"> & { code: string } = {
        name: gameName,
        gameId: game.id,
        createdBy: user.uid,
        host: user.uid,
        players: [
          {
            id: user.uid,
            username: displayName,
            displayName: displayName,
            isHost: true,
            isReady: true,
            avatar: user.avatar,
          },
        ],
        createdAt: new Date().toISOString(),
        status: "waiting",
        maxPlayers: game.id === "trap-answer" ? 4 : 20,
        code: shortCode,
      };

      const validateRoomData = (data: any): boolean => {
        const checkValue = (value: any, path: string = ""): boolean => {
          if (value === undefined) {
            console.error(`❌ Valeur undefined trouvée dans ${path}`);
            return false;
          }
          if (Array.isArray(value)) {
            return value.every((item, index) =>
              checkValue(item, `${path}[${index}]`),
            );
          }
          if (value && typeof value === "object") {
            return Object.entries(value).every(([key, val]) =>
              checkValue(val, path ? `${path}.${key}` : key),
            );
          }
          return true;
        };
        return checkValue(data);
      };

      if (!validateRoomData(roomData)) {
        throw new Error(
          "Données de salle invalides : valeurs undefined détectées",
        );
      }

      console.log(
        "📤 Enregistrement dans Firebase avec les données:",
        JSON.stringify(roomData, null, 2),
      );

      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error(
                  "Délai d'attente dépassé lors de la création de la salle",
                ),
              ),
            30000,
          ); // Augmenté à 30 secondes
        });

        const createdRoomId = await Promise.race([
          createRoom(roomData),
          timeoutPromise,
        ]);

        if (!createdRoomId) {
          throw new Error(
            "La création de la salle a échoué : aucun ID retourné",
          );
        }

        console.log("✅ Salle créée avec succès dans Firebase:", createdRoomId);

        console.log(
          "🔄 Tentative de redirection vers:",
          `/room/${createdRoomId}`,
        );

        router.push(`/room/${createdRoomId}`);

        return true;
      } catch (firebaseError) {
        console.error("🔥 Erreur Firebase:", firebaseError);

        if (firebaseError instanceof Error) {
          let errorMessage =
            "Une erreur est survenue lors de la création de la salle.";

          if (firebaseError.message.includes("permission-denied")) {
            errorMessage =
              "Accès refusé : vérifiez les règles de sécurité Firestore";
          } else if (firebaseError.message.includes("network-request-failed")) {
            errorMessage = "Erreur réseau : vérifiez votre connexion internet";
          } else if (
            firebaseError.message.includes("Délai d'attente dépassé")
          ) {
            errorMessage =
              "Le serveur met trop de temps à répondre. Veuillez réessayer.";
          }

          Alert.alert("Erreur lors de la création de la salle", errorMessage);
        }
        throw firebaseError;
      }
    } catch (error) {
      console.error("❌ Erreur lors de la création de la salle:", error);
      Alert.alert(
        "Erreur",
        error instanceof Error ? error.message : "Impossible de créer la salle",
      );
      return false;
    }
  };

  const handleCodeDigitChange = (value: string, index: number) => {
    // Ne garder que les chiffres
    const digit = value.replace(/[^0-9]/g, '').slice(0, 1);
    
    const newDigits = [...codeDigits];
    newDigits[index] = digit;
    setCodeDigits(newDigits);
    
    // Mettre à jour le code complet
    const fullCode = newDigits.join('');
    setPartyCode(fullCode);
    
    // Passer au champ suivant si un chiffre a été saisi
    if (digit && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
    
    // Si tous les chiffres sont remplis, rejoindre automatiquement
    if (newDigits.every(d => d !== '') && newDigits.join('').length === 6) {
      setTimeout(() => handleJoinGame(), 300);
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    // Gérer la suppression : si Backspace et champ vide, aller au précédent
    if (key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleScanQR = () => {
    setShowQRScanner(true);
  };

  const handleQRScanSuccess = (code: string) => {
    // Mettre à jour les champs avec le code scanné
    const digits = code.slice(0, 6).split('');
    const filledDigits = digits.concat(Array(6 - digits.length).fill(''));
    setCodeDigits(filledDigits);
    setPartyCode(code);
    
    // Rejoindre la room automatiquement
    handleJoinGameWithCode(code);
  };

  const handleJoinGameWithCode = async (code: string) => {
    if (!code || !code.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un code de partie");
      return;
    }
    setLoading(true);
    try {
      const db = getFirestore();
      const roomsRef = collection(db, "rooms");
      const q = query(roomsRef, where("code", "==", code.toUpperCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        Alert.alert("Erreur", "Code de partie invalide");
        setLoading(false);
        return;
      }
      const roomDoc = querySnapshot.docs[0];
      if (!roomDoc) {
        Alert.alert("Erreur", "Salle introuvable");
        setLoading(false);
        return;
      }
      const roomData = roomDoc.data() as Room;
      const roomId = roomDoc.id;

      // Vérifier si la partie a déjà commencé
      if (roomData.status === "playing" || roomData.status === "finished") {
        Alert.alert("Erreur", "Cette partie a déjà commencé ou est terminée");
        setLoading(false);
        return;
      }

      // Vérifier si la salle est pleine
      if (
        roomData.players &&
        roomData.maxPlayers &&
        roomData.players.length >= roomData.maxPlayers
      ) {
        Alert.alert("Erreur", "Cette salle est pleine");
        setLoading(false);
        return;
      }

      // Rediriger vers la salle
      router.push(`/room/${roomId}`);
      setLoading(false);
    } catch (error: any) {
      console.error("Erreur lors de la connexion à la salle:", error);
      Alert.alert("Erreur", error.message || "Impossible de rejoindre la partie");
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    const code = codeDigits.join('') || partyCode;
    if (!code.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un code de partie");
      return;
    }
    setLoading(true);
    try {
      const db = getFirestore();
      const roomsRef = collection(db, "rooms");
      const code = codeDigits.join('') || partyCode;
      const q = query(roomsRef, where("code", "==", code.toUpperCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        Alert.alert("Erreur", "Code de partie invalide");
        return;
      }
      const roomDoc = querySnapshot.docs[0];
      if (!roomDoc) {
        Alert.alert("Erreur", "Salle introuvable");
        return;
      }
      const room = roomDoc.data();
      if (room.status !== "waiting") {
        Alert.alert("Erreur", "Cette partie a déjà commencé");
        return;
      }
      if (room.players.length >= room.maxPlayers) {
        Alert.alert("Erreur", "Cette partie est pleine");
        return;
      }
      if (!user) {
        Alert.alert("Erreur", "Utilisateur non authentifié");
        return;
      }
      if (room.players.some((p: any) => p.id === user.uid)) {
        Alert.alert("Erreur", "Vous êtes déjà dans cette partie");
        return;
      }
      const roomRef = doc(db, "rooms", roomDoc.id);
      const newPlayer = {
        id: user.uid,
        username: user.pseudo || "Joueur",
        displayName: user.pseudo || "Joueur",
        isHost: false,
        isReady: false,
        avatar: user.avatar,
      };
      await updateDoc(roomRef, {
        players: [...room.players, newPlayer],
      });
      router.push(`/room/${roomDoc.id}`);
    } catch (error) {
      console.error("Erreur lors de la jonction de la salle:", error);
      Alert.alert("Erreur", "Impossible de rejoindre la salle");
    } finally {
      setLoading(false);
    }
  };

  const renderGameModeCard = (game: GameMode, isGridItem = false) => {
    const isPremiumLocked = game.premium && !user?.hasActiveSubscription && !isProMember;

    const handlePress = async () => {
      if (isPremiumLocked) {
        showPaywallA();
        return;
      }
      const gameName = game.nameKey ? t(game.nameKey) : (t(`home.games.${game.id}.name`) || game.name || game.id);
      console.log("🖱️ Clic sur le mode de jeu:", gameName);
      console.log("📊 État de création:", isCreatingRoom);

      if (isCreatingRoom) {
        console.log("⏳ Création de salle en cours, veuillez patienter...");
        return;
      }

      try {
        const result = await createGameRoom(game);

        if (result) {
          console.log(
            "✅ Création de la salle réussie, redirection en cours...",
          );
        } else {
          console.log("❌ La création de la salle a échoué");
        }
      } catch (error) {
        console.error("❌ Erreur lors de la création de la salle:", error);
      }
    };

    if (isGridItem) {
      return (
        <TouchableOpacity
          key={game.id}
          style={[styles.modeCard, styles.gridModeCard]}
          onPress={handlePress}
          activeOpacity={0.8}
          disabled={isCreatingRoom}
          testID={`game-mode-${game.id}`}
        >
          <ImageBackground
            source={game.image}
            style={styles.cardImageBackground}
            imageStyle={{ borderRadius: 20 }}
            resizeMode="cover"
          >
            {game.tags && game.tags.length > 0 && (() => {
              // Ne garder que le tag premium ou gratuit (le plus important)
              const importantTag = game.tags.find(tag => 
                tag.text.includes('premium') || tag.text.includes('gratuit')
              ) || game.tags[0]; // Fallback sur le premier tag si aucun premium/gratuit
              
              return importantTag ? (
                <View style={styles.tagsContainer}>
                  <View
                    style={[
                      styles.modeTagContainer,
                      styles.gridModeTagContainer,
                      { backgroundColor: importantTag.color },
                    ]}
                  >
                    <Text style={styles.modeTagText}>{t(importantTag.text)}</Text>
                  </View>
                </View>
              ) : null;
            })()}
            <View style={styles.overlay}>
              <Text style={styles.cardTitle}>
                {game.nameKey ? t(game.nameKey) : (t(`home.games.${game.id}.name`) || game.name || '')}
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={game.id}
        style={[
          styles.modeCard,
          isGridItem && styles.gridModeCard,
          isCreatingRoom && styles.disabledCard,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={isCreatingRoom}
        testID={`game-mode-${game.id}`}
      >
        <LinearGradient
          colors={
            game.colors && game.colors.length >= 2
              ? (game.colors as [string, string, ...string[]])
              : [
                  Colors.light?.gradient?.christmas?.from || "#C41E3A",
                  Colors.light?.gradient?.christmas?.to || "#8B1538",
                ]
          }
          style={[
            styles.modeGradient,
            {
              borderColor: game.borderColor || Colors.light.primary,
              shadowColor: game.shadowColor || Colors.light.secondary,
            },
            isGridItem && styles.gridModeGradient,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View
            style={[styles.modeContent, isGridItem && styles.gridModeContent]}
          >
            {!isGridItem && (
              <View style={styles.characterContainer}>
                <Image
                  source={game.image}
                  style={styles.characterImage}
                  resizeMode="contain"
                />
              </View>
            )}
            <View
              style={[
                styles.modeTextContainer,
                isGridItem && styles.gridModeTextContainer,
              ]}
            >
              {isGridItem && (
                <Image
                  source={game.image}
                  style={styles.gridCharacterImage}
                  resizeMode="contain"
                />
              )}
              <Text
                style={[styles.modeName, isGridItem && styles.gridModeName]}
              >
                {game.nameKey ? t(game.nameKey) : (t(`home.games.${game.id}.name`) || game.name || '')}
              </Text>
              {!isGridItem && (
                <Text style={styles.modeDescription}>
                  {game.descriptionKey ? t(game.descriptionKey) : (t(`home.games.${game.id}.description`) || game.description || '')}
                </Text>
              )}
            </View>
            {game.tags && game.tags.length > 0 && (() => {
              // Ne garder que le tag premium ou gratuit (le plus important)
              const importantTag = game.tags.find(tag => 
                tag.text.includes('premium') || tag.text.includes('gratuit')
              ) || game.tags[0]; // Fallback sur le premier tag si aucun premium/gratuit
              
              return importantTag ? (
                <View style={styles.tagsContainer}>
                  <View
                    style={[
                      styles.modeTagContainer,
                      styles.gridModeTagContainer,
                      { backgroundColor: importantTag.color },
                    ]}
                  >
                    <Text style={styles.modeTagText}>{t(importantTag.text) || importantTag.text}</Text>
                  </View>
                </View>
              ) : null;
            })()}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderGameCategory = (category: GameCategory) => {
    const isPremiumCategory = category.categoryType === 'premium';
    const hasPremiumGames = category.games.some(g => g.premium);
    const showCTA = isPremiumCategory && hasPremiumGames && (!user?.hasActiveSubscription && !isProMember);
    const useGrid = ["couple", "soirees"].includes(category.id);

    return (
      <View key={category.id} style={styles.categorySection}>
        {showCTA && category.cta && (
          <TouchableOpacity
            style={[
              styles.ctaButton,
              category.dominantColor && { borderColor: category.dominantColor }
            ]}
            onPress={() => showPaywallA()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                category.dominantColor
                  ? [category.dominantColor, category.dominantColor + 'AA']
                  : ["#C41E3A", "#8B1538"]
              }
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.ctaMainText}>{category.cta.mainText}</Text>
              {category.cta.subText && (
                <Text style={styles.ctaSubText}>{category.cta.subText}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.categoryHeader}>
          <View>
            <Text style={styles.categoryTitle}>
              {category.title || t(`home.categories.${category.id}`)}
            </Text>
            {category.subtitle ? (
              <Text style={styles.categorySubtitle}>
                {category.subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {useGrid ? (
          <View style={styles.gridContainer}>
            {category.games.map((game: GameMode) => (
              <View key={game.id} style={styles.gridItem}>
                {renderGameModeCard(game, true)}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.gameModesColumn}>
            {category.games.map((game: GameMode) => renderGameModeCard(game, false))}
          </View>
        )}
      </View>
    );
  };

  // Vérification de sécurité pour les couleurs
  const midnightGradient = Colors.light?.gradient?.luxury || {
    from: "#1A1A2E",
    to: "#C41E3A",
    middle: "#8B1538",
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          midnightGradient.from,
          midnightGradient.from,
          midnightGradient.middle,
          midnightGradient.from,
          midnightGradient.to,
        ]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      >

        <View style={{ zIndex: 20 }}>
          <TopBar />
        </View>

        <View style={[styles.joinGameCard, { zIndex: 15 }]}>
          <View style={styles.joinGameHeader}>
            <View style={styles.joinGameTitleContainer}>
              <Text style={styles.joinGameTitle}>
                {t("home.joinGame")}: {t("home.enterCode")} {t("home.or")} {"\n"}
                {t("home.scanQR")}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.qrButtonSmall}
              onPress={handleScanQR}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#C41E3A", "#8B1538"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.qrButtonSmallGradient}
              >
                <MaterialCommunityIcons name="qrcode-scan" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.codeInputContainer}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  codeInputRefs.current[index] = ref;
                }}
                style={[
                  styles.codeDigitInput,
                  codeDigits[index] && styles.codeDigitInputFilled,
                ]}
                value={codeDigits[index]}
                onChangeText={(value) => handleCodeDigitChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>
        </View>

        <ScrollView
          style={[styles.scrollView, { zIndex: 15 }]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.contentContainer}>
            {gameCategories.map(renderGameCategory)}
          </View>
        </ScrollView>
      </LinearGradient>
      
      <QRScannerModal
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={handleQRScanSuccess}
      />
      
      {loading && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "rgba(20,10,40,0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.7)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>
              {t("home.loading")}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  gradientOverlay: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryHeader: {
    marginBottom: 16,
  },
  categoryTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  categorySubtitle: {
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  rulesButton: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 8,
  },
  rulesText: {
    color: "white",
    fontSize: 10,
  },
  gameModesColumn: {
    width: "100%",
  },
  modeCard: {
    width: "100%",
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    height: 120,
  },
  modeGradient: {
    borderRadius: 20,
    height: "100%",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modeContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: "100%",
  },
  characterContainer: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  characterImage: {
    width: "100%",
    height: "100%",
  },
  modeTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  modeName: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: "System",
    letterSpacing: 0.5,
  },
  modeDescription: {
    color: "white",
    fontSize: 12,
    lineHeight: 14,
  },
  modeTagContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  modeTagText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 16,
  },
  gridModeCard: {
    height: 140,
  },
  gridModeGradient: {
    height: "100%",
  },
  gridModeContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  gridModeTextContainer: {
    alignItems: "center",
    paddingRight: 0,
  },
  gridModeName: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  gridCharacterImage: {
    width: 70,
    height: 70,
  },
  gridModeTagContainer: {
    top: 5,
    right: 5,
  },
  disabledCard: {
    opacity: 0.6,
  },
  lockedImage: {
    opacity: 0.3,
  },
  premiumLockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    gap: 4,
  },
  premiumLockText: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  premiumLockSubtext: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
    opacity: 0.9,
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    zIndex: 10,
  },
  ctaButton: {
    marginBottom: 16,
    marginTop: 0,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#D81B60",
  },
  ctaGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaMainText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  ctaSubText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  joinGameCard: {
    backgroundColor: "rgba(196, 30, 58, 0.15)",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: "rgba(196, 30, 58, 0.3)",
    shadowColor: "#C41E3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  joinGameHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  joinGameTitleContainer: {
    flex: 1,
  },
  joinGameTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E8B4B8",
    textAlign: "left",
    lineHeight: 20,
  },
  qrButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: -2,
  },
  qrButtonSmallGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  joinGameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  qrButtonRow: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
  },
  qrButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  qrButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  codeInputContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  codeDigitInput: {
    width: 44,
    height: 52,
    borderRadius: 12,
    backgroundColor: "rgba(26, 26, 46, 0.4)",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(232, 180, 184, 0.4)",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#E8B4B8",
  },
  codeDigitInputFilled: {
    borderColor: "#C41E3A",
    borderStyle: "solid",
    backgroundColor: "rgba(196, 30, 58, 0.2)",
    color: "#fff",
  },
  codeDigitInputActive: {
    borderColor: "#C41E3A",
    borderWidth: 2,
    backgroundColor: "rgba(196, 30, 58, 0.2)",
    shadowColor: "#C41E3A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  qrButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  qrGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 7,
  },
  cardImageBackground: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
  },
  overlay: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: 12,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  headerPointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  headerPointsText: {
    color: Colors.light.tertiary,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 4,
  },
  tagsContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 4,
  },
  // Styles pour les boutons de test de notifications
});
