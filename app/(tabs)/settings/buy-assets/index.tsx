import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { usePoints } from '@/hooks/usePoints';
import { LinearGradient } from 'expo-linear-gradient';
import { Asset } from '@/hooks/useUnlockedAssets';

export const AVAILABLE_ASSETS: Asset[] = [
  {
    id: 'avatar-panda',
    name: 'Panda',
    cost: 100,
    image: require('@/assets/profils/panda.png'),
    type: 'avatar',
    rarity: 'common',
    description: 'Un adorable panda pour votre profil'
  },
  {
    id: 'avatar-chat',
    name: 'Chat',
    cost: 150,
    image: require('@/assets/profils/chat.png'),
    type: 'avatar',
    rarity: 'common',
    description: 'Un chat mignon et joueur'
  },
  {
    id: 'avatar-chat-rare',
    name: 'Chat Rare',
    cost: 200,
    image: require('@/assets/profils/chatRare.png'),
    type: 'avatar',
    rarity: 'rare',
    description: 'Un chat mystérieux aux yeux brillants'
  },
  {
    id: 'avatar-chat-rare-2',
    name: 'Chat Rare 2',
    cost: 250,
    image: require('@/assets/profils/chatRare2.png'),
    type: 'avatar',
    rarity: 'rare',
    description: 'Un chat rare avec un design unique'
  },
  {
    id: 'avatar-crocodile',
    name: 'Crocodile',
    cost: 300,
    image: require('@/assets/profils/crocodile.png'),
    type: 'avatar',
    rarity: 'rare',
    description: 'Un crocodile impressionnant'
  },
  {
    id: 'avatar-hibou',
    name: 'Hibou',
    cost: 350,
    image: require('@/assets/profils/hibou.png'),
    type: 'avatar',
    rarity: 'rare',
    description: 'Un hibou sage et mystérieux'
  },
  {
    id: 'avatar-grenouille',
    name: 'Grenouille',
    cost: 400,
    image: require('@/assets/profils/grenouille.png'),
    type: 'avatar',
    rarity: 'epic',
    description: 'Une grenouille magique et colorée'
  },
  {
    id: 'avatar-oiseau',
    name: 'Oiseau',
    cost: 450,
    image: require('@/assets/profils/oiseau.png'),
    type: 'avatar',
    rarity: 'epic',
    description: 'Un oiseau aux couleurs vives'
  },
  {
    id: 'avatar-renard',
    name: 'Renard',
    cost: 500,
    image: require('@/assets/profils/renard.png'),
    type: 'avatar',
    rarity: 'epic',
    description: 'Un renard rusé et élégant'
  },
  {
    id: 'avatar-dragon',
    name: 'Dragon',
    cost: 750,
    image: require('@/assets/profils/dragon.png'),
    type: 'avatar',
    rarity: 'epic',
    description: 'Un dragon majestueux cracheur de feu'
  },
  {
    id: 'avatar-phoenix',
    name: 'Phénix',
    cost: 1000,
    image: require('@/assets/profils/phoenix.png'),
    type: 'avatar',
    rarity: 'legendary',
    description: 'Un phénix légendaire qui renaît de ses cendres'
  }
];

export default function BuyAssetsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addPointsToUser } = usePoints();

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
      // Ajouter la logique de déblocage ici (à compléter, ex: mettre à jour un tableau d'assets débloqués)
      await addPointsToUser(user.uid, -asset.cost);
      Alert.alert(
        t('profile.success'),
        t('profile.assetUnlocked', { asset: asset.name })
      );
      // Rafraîchir les données utilisateur ou naviguer si nécessaire
    } catch (error) {
      Alert.alert(
        t('errors.general'),
        t('profile.unlockError')
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
          <View style={styles.headerPointsContainer}>
            <MaterialCommunityIcons name="currency-btc" size={20} color="#FFD700" />
            <Text style={styles.headerPointsText}>{user?.points ?? 0}</Text>
          </View>
        </View>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.marketplaceTitle}>{t('profile.availableAssetsTitle').toUpperCase()}</Text>
        {/* Future liste des assets à acheter ici */}
        <View style={styles.assetListContainer}>
          {AVAILABLE_ASSETS.map((asset) => (
            <View key={asset.id} style={styles.assetCard}>
              <Image source={asset.image} style={styles.assetCardImage} />
              <View style={styles.assetCardInfo}>
                <Text style={styles.assetCardName}>{asset.name}</Text>
                <Text style={styles.assetCardCost}>{asset.cost} {t('profile.pointsLabel')}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.buyButton,
                  (user?.points ?? 0) < asset.cost && styles.buyButtonDisabled
                ]}
                onPress={() => handleUnlockAsset(asset)}
                disabled={(user?.points ?? 0) < asset.cost}
              >
                <Text style={styles.buyButtonText}>
                  {(user?.points ?? 0) < asset.cost ? 'Non dispo' : 'Acheter'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
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
    width: 80, 
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
   headerPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D283B',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  headerPointsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
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
}); 