import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { usePoints } from '@/hooks/usePoints';
import { LinearGradient } from 'expo-linear-gradient';
import { Asset, useUnlockedAssets } from '@/hooks/useUnlockedAssets';
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import PointsDisplay from '@/components/PointsDisplay';

export const AVAILABLE_ASSETS: Asset[] = [
  {
    id: 'avatar-panda',
    name: 'avatar-panda',
    cost: 300,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Fpanda.png?alt=media&token=413b4355-0af6-4dc5-a48f-fe0dd60667b7',
    type: 'avatar',
    rarity: 'common',
    description: 'Un adorable panda pour votre profil'
  },
  {
    id: 'avatar-chat-rare',
    name: 'avatar-chat-rare',
    cost: 1000,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2FchatRare.png?alt=media&token=7316bd1e-2765-4286-8930-7adb30d09956',
    type: 'avatar',
    rarity: 'rare',
    description: 'Un chat mystérieux aux yeux brillants'
  },
  {
    id: 'avatar-chat-rare-2',
    name: 'avatar-chat-rare-2',
    cost: 250,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2FchatRare2.png?alt=media&token=842eb6fe-ebc0-43e5-b7f2-f54ac5c9474d',
    type: 'avatar',
    rarity: 'rare',
    description: 'Un chat rare avec un design unique'
  },
  {
    id: 'avatar-crocodile',
    name: 'avatar-crocodile',
    cost: 500,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Fcrocodile.png?alt=media&token=b3044538-ecb2-44cf-b220-2822f8c6b9a2',
    type: 'avatar',
    rarity: 'rare',
    description: 'Un crocodile impressionnant'
  },
  {
    id: 'avatar-hibou',
    name: 'avatar-hibou',
    cost: 800,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Fhibou.png?alt=media&token=794f00af-ec0c-451c-92a3-a3c1b56f42bf',
    type: 'avatar',
    rarity: 'rare',
    description: 'Un hibou sage et mystérieux'
  },
  {
    id: 'avatar-dragon',
    name: 'avatar-dragon',
    cost: 5000,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Fdragon.png?alt=media&token=6f57e3c9-6046-46c2-918b-7b241441326a',
    type: 'avatar',
    rarity: 'epic',
    description: 'Un dragon majestueux cracheur de feu'
  },
  {
    id: 'avatar-ourse',
    name: 'avatar-ourse',
    cost: 10000,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Fourse.png?alt=media&token=af60bf59-e7e3-4726-b64a-978371512a89',
    type: 'avatar',
    rarity: 'epic',
    description: 'Un ourse majestueux cracheur de feu'
  },
  {
    id: 'avatar-loup-rare',
    name: 'avatar-loup-rare',
    cost: 999999,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Floup-rare.png?alt=media&token=88385a11-5e45-4533-84cd-082be53252e6',
    type: 'avatar',
    rarity: 'epic',
    description: 'Un ourse majestueux cracheur de feu'
  },
  {
    id: 'avatar-dragon-rare',
    name: 'avatar-dragon-rare',
    cost: 50000,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Favart-dragon-rare.png?alt=media&token=26ba978b-5057-448d-a0fe-854d91ae54f1',
    type: 'avatar',
    rarity: 'legendary',
    description: 'Un dragon majestueux cracheur de feu'
  },
  {
    id: 'avatar-licorne',
    name: 'avatar-licorne',
    cost: 50000,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Flicorne.png?alt=media&token=a2158a1b-b49b-44e3-a3cd-35835663a2dd',
    type: 'avatar',
    rarity: 'legendary',
    description: 'Un dragon majestueux cracheur de feu'
  },
  {
    id: 'avatar-phoenix',
    name: 'avatar-phoenix',
    cost: 50000,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Fphoenix.png?alt=media&token=ff365cce-d73c-4a41-9f56-dbed53d64e3f',
    type: 'avatar',
    rarity: 'legendary',
    description: 'Un phénix légendaire qui renaît de ses cendres'
  }
];

export default function BuyAssetsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const { addPointsToUser } = usePoints();
  const { unlockAsset, getUnlockedAssets } = useUnlockedAssets();

  const [unlockedAssetIds, setUnlockedAssetIds] = useState<string[]>([]);

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
    if (!user || typeof user.points !== 'number') return;
    
    if (user.points < asset.cost) {
      Alert.alert(
        t('profile.insufficientPoints'),
        t('profile.insufficientPointsMessage')
      );
      return;
    }

    try {
      const success = await unlockAsset(user.uid, asset.id);
      if (success) {
        // Update local state immediately after successful unlock
        setUnlockedAssetIds(prevIds => [...prevIds, asset.id]);

        // Deduct points - addPointsToUser already updates user object in AuthContext
        await addPointsToUser(user.uid, -asset.cost);

        Alert.alert(
          t('profile.success'),
          t('profile.assetUnlocked', { asset: t(`assets.avatars.${asset.name}.name`) })
        );
      } else {
         Alert.alert(
          t('errors.general'),
          t('profile.unlockError')
        );
      }
    } catch (error) {
      Alert.alert(
        t('errors.general'),
        t('profile.unlockError')
      );
    }
  };

  const handleEquipAvatar = async (asset: Asset) => {
    if (!user) return;

    try {
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      
      // Mettre à jour l'avatar de l'utilisateur
      await updateDoc(userRef, {
        avatar: asset.image
      });
      
      // Mettre à jour l'état local
      setUser({ ...user, avatar: asset.image });
      
      Alert.alert(
        t('profile.success'),
        t('profile.avatarChanged')
      );
    } catch (error) {
      Alert.alert(
        t('errors.general'),
        t('profile.avatarChangeError')
      );
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/profil')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.buyAssetsTitle')}</Text>
        <View style={styles.headerRight}>
          <PointsDisplay size="medium" />
        </View>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.marketplaceTitle}>{t('settings.buyAssets.availableAssetsTitle')}</Text>
        <View style={styles.assetListContainer}>
          {AVAILABLE_ASSETS.map((asset) => {
            // Check against local state instead of async hook call in render
            const unlocked = unlockedAssetIds.includes(asset.id);
            const isAvatar = asset.type === 'avatar';

            return (
              <View key={asset.id} style={styles.assetCard}>
                <Image source={{ uri: asset.image }} style={styles.assetCardImage} />
                <View style={styles.assetCardInfo}>
                  <Text style={styles.assetCardName}>{t(`assets.avatars.${asset.name}.name`)}</Text>
                  {!unlocked ? (
                    <Text style={styles.assetCardCost}>{asset.cost} <MaterialCommunityIcons name="currency-btc" size={12} color="#FFD700" /></Text>
                  ) : (
                    <Text style={styles.assetCardOwned}>{t('settings.buyAssets.owned')}</Text>
                  )}
                </View>

                {!unlocked ? (
                  <TouchableOpacity
                    style={[
                      styles.buyButton,
                      (user?.points ?? 0) < asset.cost && styles.buyButtonDisabled,
                    ]}
                    onPress={() => handleUnlockAsset(asset)}
                    disabled={(user?.points ?? 0) < asset.cost}
                  >
                    <Text style={styles.buyButtonText}>
                      {(user?.points ?? 0) < asset.cost
                        ? t('settings.buyAssets.notAvailable')
                        : t('settings.buyAssets.buy')}
                    </Text>
                  </TouchableOpacity>
                ) : isAvatar ? (
                  <TouchableOpacity
                    style={styles.equipButton}
                    onPress={() => handleEquipAvatar(asset)}
                  >
                    <Text style={styles.equipButtonText}>{t('settings.buyAssets.equip')}</Text>
                  </TouchableOpacity>
                ) : (
                   <View style={styles.ownedButtonPlaceholder}></View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1117',
    paddingTop: 40,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
   backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  marketplaceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  assetListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  assetCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    width: '31%', // Pour 3 colonnes
  },
  assetCardImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    backgroundColor: '#694ED6',
  },
  assetCardInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  assetCardName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  assetCardCost: {
    color: '#FFD700',
    fontSize: 12,
    marginTop: 2,
  },
  assetCardOwned: {
    color: '#A0EEB5',
    fontSize: 12,
    marginTop: 2,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#694ED6',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: '100%',
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  buyButtonDisabled: {
    backgroundColor: '#2D283B',
    opacity: 0.7,
  },
  equipButton: {
    backgroundColor: '#A0EEB5',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: '100%',
    alignItems: 'center',
  },
  equipButtonText: {
    color: '#0E1117',
    fontWeight: 'bold',
    fontSize: 12,
  },
  ownedButtonPlaceholder: {
    height: 30, // Adjust height to match button height
    width: '100%', // Adjust width to match button width
  }
}); 