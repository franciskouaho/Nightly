import PointsDisplay from "@/components/PointsDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { usePoints } from "@/hooks/usePoints";
import { Asset, useUnlockedAssets } from "@/hooks/useUnlockedAssets";
import { cacheRemoteImage } from "@/utils/cacheRemoteImage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getFirestore, doc, updateDoc } from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BuyAssetsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const { addPointsToUser } = usePoints();
  const { unlockAsset, getUnlockedAssets } = useUnlockedAssets();

  const [unlockedAssetIds, setUnlockedAssetIds] = useState<string[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [assetLocalUris, setAssetLocalUris] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    let isMounted = true;

    const fetchAssets = async () => {
      try {
        setIsLoadingAssets(true);
        const db = getFirestore();
        const snapshot = await db.collection("assets").get();

        if (!isMounted) {
          return;
        }

        const fetchedAssets: Asset[] = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as Partial<Asset>;

          return {
            id: docSnapshot.id,
            name: data.name ?? docSnapshot.id,
            cost: data.cost ?? 0,
            image: data.image ?? "",
            type: data.type ?? "avatar",
            rarity: data.rarity ?? "common",
            description: data.description,
          };
        });

        const cachedEntries = await Promise.all(
          fetchedAssets.map(async (asset) => {
            const localUri = await cacheRemoteImage(asset.image, "buy-assets");
            return [asset.id, localUri] as const;
          }),
        );

        setAvailableAssets(fetchedAssets);
        setAssetLocalUris(Object.fromEntries(cachedEntries));
        setAssetsError(null);
      } catch (error) {
        console.error("Erreur lors de la récupération des assets:", error);
        if (isMounted) {
          setAssetsError("Impossible de récupérer les assets pour le moment.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingAssets(false);
        }
      }
    };

    fetchAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchUnlockedAssets = async () => {
      if (user?.uid) {
        const assets = await getUnlockedAssets(user.uid);
        setUnlockedAssetIds(assets);
      }
    };

    fetchUnlockedAssets();
  }, [user?.uid, getUnlockedAssets]);

  const handleUnlockAsset = async (asset: Asset) => {
    if (!user?.uid) {
      Alert.alert(t("errors.general"), "Utilisateur non connecté");
      return;
    }

    const userPoints = user.points || 0;
    if (userPoints < asset.cost) {
      Alert.alert(
        t("profile.insufficientPoints"),
        t("profile.insufficientPointsMessage"),
      );
      return;
    }

    try {
      // D'abord débloquer l'asset
      const success = await unlockAsset(user.uid, asset.id);
      if (success) {
        // Ensuite déduire les points
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          points: userPoints - asset.cost
        });

        // Update local state immediately after successful unlock
        setUnlockedAssetIds((prevIds) => [...prevIds, asset.id]);

        Alert.alert(
          t("profile.success"),
          t("profile.assetUnlocked", {
            asset: t(`assets.avatars.${asset.name}.name`),
          }),
        );
      } else {
        Alert.alert(t("errors.general"), t("profile.unlockError"));
      }
    } catch (error) {
      console.error("Erreur lors de l'achat d'asset:", error);
      Alert.alert(t("errors.general"), t("profile.unlockError"));
    }
  };

  const handleEquipAvatar = async (asset: Asset) => {
    if (!user) return;

    try {
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);

      // Mettre à jour l'avatar de l'utilisateur
      await updateDoc(userRef, {
        avatar: asset.image,
      });

      // Mettre à jour l'état local
      setUser({ ...user, avatar: asset.image });

      Alert.alert(t("profile.success"), t("profile.avatarChanged"));
    } catch (error) {
      console.error("Erreur lors du changement d'avatar:", error);
      Alert.alert(t("errors.general"), t("profile.avatarChangeError"));
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)/profil")}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile.buyAssetsTitle")}</Text>
        <View style={styles.headerRight}>
          <PointsDisplay size="medium" />
        </View>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.marketplaceTitle}>
          {t("settings.buyAssets.availableAssetsTitle")}
        </Text>
        <View style={styles.assetListContainer}>
          {isLoadingAssets ? (
            <ActivityIndicator color="#694ED6" />
          ) : assetsError ? (
            <Text style={styles.assetCardOwned}>{assetsError}</Text>
          ) : availableAssets.length === 0 ? (
            <Text style={styles.assetCardOwned}>
              {t(
                "settings.buyAssets.noAssets",
                "Aucun objet n'est disponible pour le moment.",
              )}
            </Text>
          ) : (
            availableAssets.map((asset) => {
              // Check against local state instead of async hook call in render
              const unlocked = unlockedAssetIds.includes(asset.id);
              const isAvatar = asset.type === "avatar";

              return (
                <View key={asset.id} style={styles.assetCard}>
                  <Image
                    source={{
                      uri: assetLocalUris[asset.id] || asset.image,
                    }}
                    style={styles.assetCardImage}
                    onError={(error) => {
                      console.error(
                        `❌ Erreur chargement image ${asset.name}:`,
                        error.nativeEvent.error,
                      );
                    }}
                    onLoad={() => {
                      console.log(`✅ Image chargée: ${asset.name}`);
                    }}
                  />
                  <View style={styles.assetCardInfo}>
                    <Text style={styles.assetCardName}>
                      {t(`assets.avatars.${asset.name}.name`)}
                    </Text>
                    {!unlocked ? (
                      <Text style={styles.assetCardCost}>
                        {asset.cost}{" "}
                        <MaterialCommunityIcons
                          name="currency-btc"
                          size={12}
                          color="#FFD700"
                        />
                      </Text>
                    ) : (
                      <Text style={styles.assetCardOwned}>
                        {t("settings.buyAssets.owned")}
                      </Text>
                    )}
                  </View>

                  {!unlocked ? (
                    <TouchableOpacity
                      style={[
                        styles.buyButton,
                        (user?.points ?? 0) < asset.cost &&
                          styles.buyButtonDisabled,
                      ]}
                      onPress={() => handleUnlockAsset(asset)}
                      disabled={(user?.points ?? 0) < asset.cost}
                    >
                      <Text style={styles.buyButtonText}>
                        {(user?.points ?? 0) < asset.cost
                          ? t("settings.buyAssets.notAvailable")
                          : t("settings.buyAssets.buy")}
                      </Text>
                    </TouchableOpacity>
                  ) : isAvatar ? (
                    <TouchableOpacity
                      style={styles.equipButton}
                      onPress={() => handleEquipAvatar(asset)}
                    >
                      <Text style={styles.equipButtonText}>
                        {t("settings.buyAssets.equip")}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.ownedButtonPlaceholder}></View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E1117",
    paddingTop: 40,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  marketplaceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  assetListContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  assetCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    alignItems: "center",
    width: "31%", // Pour 3 colonnes
  },
  assetCardImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    backgroundColor: "#694ED6",
  },
  assetCardInfo: {
    alignItems: "center",
    marginBottom: 8,
  },
  assetCardName: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  assetCardCost: {
    color: "#FFD700",
    fontSize: 10,
    marginTop: 2,
  },
  assetCardOwned: {
    color: "#A0EEB5",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "bold",
  },
  buyButton: {
    backgroundColor: "#694ED6",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: "100%",
    alignItems: "center",
  },
  buyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 10,
  },
  buyButtonDisabled: {
    backgroundColor: "#2D283B",
    opacity: 0.7,
  },
  equipButton: {
    backgroundColor: "#A0EEB5",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: "100%",
    alignItems: "center",
  },
  equipButtonText: {
    color: "#0E1117",
    fontWeight: "bold",
    fontSize: 10,
  },
  ownedButtonPlaceholder: {
    height: 30, // Adjust height to match button height
    width: "100%", // Adjust width to match button width
  },
});
