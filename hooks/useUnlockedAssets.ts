import { useAuth } from "@/contexts/AuthContext";
import { 
  getFirestore, 
  doc, 
  updateDoc, 
  getDoc, 
  arrayUnion,
  arrayRemove
} from "@react-native-firebase/firestore";

export interface Asset {
  id: string;
  name: string;
  cost: number;
  image: any;
  type: 'avatar' | 'background' | 'effect';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description?: string;
}

export const useUnlockedAssets = () => {
  const { user } = useAuth();

  const unlockAsset = async (userId: string, assetId: string) => {
    if (!userId || !assetId) {
      console.error("User ID and Asset ID are required.");
      return false;
    }

    const db = getFirestore();
    const userRef = doc(db, "users", userId);

    try {
      await updateDoc(userRef, {
        unlockedAssets: arrayUnion(assetId)
      });
      return true;
    } catch (error) {
      console.error("Error unlocking asset:", error);
      return false;
    }
  };

  const isAssetUnlocked = async (userId: string, assetId: string) => {
    if (!userId || !assetId) {
      return false;
    }

    const db = getFirestore();
    const userRef = doc(db, "users", userId);

    try {
      const userDoc = await getDoc(userRef);
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
  };

  const getUnlockedAssets = async (userId: string) => {
    if (!userId) {
      return [];
    }

    const db = getFirestore();
    const userRef = doc(db, "users", userId);

    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data()?.unlockedAssets || [];
      }
      return [];
    } catch (error) {
      console.error("Error getting unlocked assets:", error);
      return [];
    }
  };

  return {
    unlockAsset,
    isAssetUnlocked,
    getUnlockedAssets,
  };
}; 