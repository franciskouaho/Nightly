import { useAuth } from "@/contexts/AuthContext";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useCallback } from "react";

export interface Asset {
  id: string;
  name: string;
  cost: number;
  image: any;
  type: "avatar" | "background" | "effect";
  rarity: "common" | "rare" | "epic" | "legendary";
  description?: string;
}

export interface PurchaseAssetResult {
  success: boolean;
  message: string;
  newPoints: number;
  previousPoints: number;
  assetCost: number;
}

export const useUnlockedAssets = () => {
  const { user } = useAuth();

  // Fonction pour acheter un asset directement avec Firestore
  const purchaseAsset = useCallback(
    async (
      assetId: string,
    ): Promise<
      | { success: true; data: PurchaseAssetResult }
      | { success: false; error: string }
    > => {
      if (!user?.uid) {
        console.error("User must be authenticated.");
        return { success: false, error: "User must be authenticated" };
      }

      if (!assetId) {
        console.error("Asset ID is required.");
        return { success: false, error: "Asset ID is required" };
      }

      try {
        // Vérifier l'authentification Firebase directement
        const firebaseUser = auth().currentUser;
        console.log("🔐 Context user.uid:", user.uid);
        console.log("🔐 Firebase currentUser.uid:", firebaseUser?.uid);
        console.log("🎯 Asset ID:", assetId);

        if (!firebaseUser) {
          throw new Error(
            "Utilisateur non authentifié dans Firebase Auth",
          );
        }

        if (firebaseUser.uid !== user.uid) {
          console.warn(
            "⚠️ Mismatch between context user and Firebase user!",
          );
        }

        const authenticatedUid = firebaseUser.uid;

        if (authenticatedUid !== user.uid) {
          console.warn(
            "⚠️ L'UID du contexte ne correspond pas à l'utilisateur authentifié. Achat interrompu pour éviter une écriture invalide.",
          );
          return {
            success: false,
            error:
              "Session désynchronisée. Veuillez patienter une seconde puis réessayer.",
          };
        }

        const userRef = firestore().collection("users").doc(authenticatedUid);
        const assetRef = firestore().collection("assets").doc(assetId);

        console.log("📖 Reading user and asset documents...");
        // Récupérer les données de l'utilisateur et de l'asset
        const [userDoc, assetDoc] = await Promise.all([
          userRef.get(),
          assetRef.get(),
        ]);
        console.log("✅ Documents read successfully");

        if (!userDoc.exists()) {
          throw new Error("Utilisateur non trouvé");
        }

        if (!assetDoc.exists()) {
          throw new Error("Asset non trouvé");
        }

        const userData = userDoc.data();
        const assetData = assetDoc.data();
        const userPoints = userData?.points || 0;
        const assetCost = assetData?.cost || 0;
        const unlockedAssets = userData?.unlockedAssets || [];

        // Vérifier si l'asset est déjà débloqué
        if (unlockedAssets.includes(assetId)) {
          throw new Error("Cet asset est déjà débloqué");
        }

        // Vérifier si l'utilisateur a assez de points
        if (userPoints < assetCost) {
          throw new Error(
            `Points insuffisants. Vous avez ${userPoints} points, mais cet asset coûte ${assetCost} points.`,
          );
        }

        // Calculer les nouveaux points et le nouveau tableau d'assets
        const newPoints = userPoints - assetCost;
        const newUnlockedAssets = [...unlockedAssets, assetId];

        console.log("💰 Current points:", userPoints);
        console.log("💳 Asset cost:", assetCost);
        console.log("✨ New points:", newPoints);
        console.log("🎁 Unlocking asset:", assetId);

        // Mettre à jour l'utilisateur avec l'asset débloqué et les nouveaux points
        console.log("🔄 Updating user document...");
        await userRef.set(
          {
            points: newPoints,
            unlockedAssets: newUnlockedAssets,
          },
          { merge: true },
        );
        console.log("✅ User document updated successfully!");

        return {
          success: true,
          data: {
            success: true,
            message: "Asset acheté avec succès",
            newPoints,
            previousPoints: userPoints,
            assetCost,
          },
        };
      } catch (error: any) {
        console.error("Error purchasing asset:", error);
        return {
          success: false,
          error: error.message || "Unknown error",
        };
      }
    },
    [user?.uid],
  );

  /**
   * @deprecated Use purchaseAsset() instead. This method doesn't verify points or handle purchases properly.
   * Kept for backward compatibility only.
   */
  const unlockAsset = useCallback(async (userId: string, assetId: string) => {
    console.warn(
      "⚠️ unlockAsset is deprecated. Use purchaseAsset() instead for proper purchase handling with point deduction.",
    );

    if (!userId || !assetId) {
      console.error("User ID and Asset ID are required.");
      return false;
    }

    try {
      // Utiliser set avec merge pour créer le champ si nécessaire
      await firestore()
        .collection("users")
        .doc(userId)
        .set(
          {
            unlockedAssets: firestore.FieldValue.arrayUnion(assetId),
          },
          { merge: true },
        );
      return true;
    } catch (error) {
      console.error("Error unlocking asset:", error);
      return false;
    }
  }, []);

  const isAssetUnlocked = useCallback(
    async (userId: string, assetId: string) => {
      if (!userId || !assetId) {
        return false;
      }

      try {
        const userDoc = await firestore().collection("users").doc(userId).get();

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const unlockedAssets = userData?.unlockedAssets || [];
          return unlockedAssets.includes(assetId);
        }
        return false;
      } catch (error) {
        console.error("Error checking if asset is unlocked:", error);
        return false;
      }
    },
    [],
  );

  const getUnlockedAssets = useCallback(async (userId: string) => {
    if (!userId) {
      return [];
    }

    try {
      const userDoc = await firestore().collection("users").doc(userId).get();

      if (userDoc.exists()) {
        return userDoc.data()?.unlockedAssets || [];
      }
      return [];
    } catch (error) {
      console.error("Error getting unlocked assets:", error);
      return [];
    }
  }, []);

  return {
    purchaseAsset,
    unlockAsset,
    isAssetUnlocked,
    getUnlockedAssets,
  };
};
