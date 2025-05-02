"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "@/contexts/AuthContext"
import BottomTabBar from "@/components/BottomTabBar"
import TopBar from "@/components/TopBar"
import { useFirebaseRooms } from '@/hooks/useFirebaseRooms'
import { useRouter } from 'expo-router'
import NetInfo from '@react-native-community/netinfo'
import { getFirestore } from 'firebase/firestore'
import { initializeApp, getApp, getApps } from 'firebase/app'

// Firebase initialization for mobile app
const firebaseConfig = {
  apiKey: "AIzaSyDmbs5e0IKgAOGU6WR0M-YRBl3XJqlfFWE",
  authDomain: "nightly-b1c29.firebaseapp.com",
  projectId: "nightly-b1c29",
  storageBucket: "nightly-b1c29.appspot.com",
  messagingSenderId: "227468565320",
  appId: "1:227468565320:web:7c3c7240eae4a391a7a457"
};

// Initialize Firebase app
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Définition des interfaces
interface GameMode {
  id: string;
  name: string;
  description: string;
  image: any;
  colors: string[];
  borderColor: string;
  shadowColor: string;
  tag: string;
  tagColor: string;
  premium: boolean;
  interactive?: 'write' | 'choice' | 'action';
}

interface GameCategory {
  id: string;
  title: string;
  subtitle: string;
  games: GameMode[];
}

// Configuration des catégories de jeu
const gameCategories: GameCategory[] = [
  {
    id: 'insight_modes',
    title: 'INSIGHT MODES',
    subtitle: 'Plusieurs téléphones',
    games: [
      {
        id: 'on-ecoute-mais-on-ne-juge-pas',
        name: 'ON ÉCOUTE MAIS ON NE JUGE PAS',
        description: 'Un mode gratuit pour rigoler tranquillement entre potes.',
        image: require('@/assets/images/taupeTranspa.png'),
        colors: ["rgba(17, 34, 78, 0.8)", "rgba(38, 56, 120, 0.9)"],
        borderColor: "#3B5FD9",
        shadowColor: "#3B5FD9",
        tag: 'GRATUIT',
        tagColor: "#8E24AA",
        premium: false,
        interactive: 'write'
      },
      {
        id: 'spicy',
        name: 'HOT',
        description: 'Questions coquines et déplacées... Prêts à assumer ?',
        image: require('@/assets/images/vache.png'),
        colors: ["rgba(90, 10, 50, 0.8)", "rgba(130, 20, 80, 0.9)"],
        borderColor: "#D81B60",
        shadowColor: "#D81B60",
        tag: 'PREMIUM',
        tagColor: "#D81B60",
        premium: true,
        interactive: 'write'
      },
      {
        id: 'soit-tu-sais-soit-tu-bois',
        name: 'SOIT TU SAIS SOIT TU BOIS',
        description: 'Un mode ludique avec un niveau de difficulté progressif.',
        image: require('@/assets/images/snake_vs_fox.png'),
        colors: ["rgba(20, 20, 40, 0.8)", "rgba(40, 40, 80, 0.9)"],
        borderColor: "#212121",
        shadowColor: "#212121",
        tag: 'PREMIUM',
        tagColor: "#D81B60",
        premium: true,
        interactive: 'write'
      },
    ]
  },
  {
    id: 'jeu_de_soiree',
    title: 'JEU DE SOIRÉE',
    subtitle: 'Plusieurs téléphones',
    games: [
      {
        id: 'connais-tu-vraiment',
        name: 'CONNAIS-TU VRAIMENT ?',
        description: 'Testez votre connaissance de vos amis.',
        image: require('@/assets/images/cochon.png'),
        colors: ["rgba(80, 20, 100, 0.8)", "rgba(120, 40, 160, 0.9)"],
        borderColor: "#9C27B0",
        shadowColor: "#9C27B0",
        tag: 'NEW !',
        tagColor: "#F06292",
        premium: false,
        interactive: 'choice'
      },
      {
        id: 'blind-test',
        name: 'BLIND TEST',
        description: 'Devinez des titres à partir d\'extraits musicaux.',
        image: require('@/assets/images/taupeTranspa.png'),
        colors: ["rgba(0, 100, 130, 0.8)", "rgba(0, 150, 180, 0.9)"],
        borderColor: "#0097A7",
        shadowColor: "#0097A7",
        tag: 'COMING SOON',
        tagColor: "#F06292",
        premium: true,
        interactive: 'choice'
      }
    ]
  },
  {
    id: 'packs',
    title: 'NOS PACKS LES PLUS JOUÉS',
    subtitle: '',
    games: [
      {
        id: 'action-verite',
        name: 'ACTION OU VÉRITÉ',
        description: 'Le classique revisité avec des défis exclusifs.',
        image: require('@/assets/images/snake_vs_fox.png'),
        colors: ["rgba(50, 90, 150, 0.8)", "rgba(80, 120, 200, 0.9)"],
        borderColor: "#3F51B5",
        shadowColor: "#3F51B5",
        tag: '',
        tagColor: "",
        premium: false,
        interactive: 'action'
      },
      {
        id: 'apero',
        name: 'APÉRO',
        description: 'Pour animer vos soirées entre amis.',
        image: require('@/assets/images/taupeTranspa.png'),
        colors: ["rgba(0, 100, 130, 0.8)", "rgba(0, 150, 180, 0.9)"],
        borderColor: "#0097A7",
        shadowColor: "#0097A7",
        tag: '',
        tagColor: "",
        premium: false,
        interactive: 'choice'
      }
    ]
  }
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { createRoom, loading: isCreatingRoom } = useFirebaseRooms(db);

  const createGameRoom = async (modeId: string) => {
    // Vérifier la connexion internet
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert(
        'Erreur de connexion',
        'Pas de connexion internet. Veuillez vérifier votre connexion et réessayer.'
      );
      return;
    }

    try {
      console.log('🎮 Création d\'une salle pour le mode:', modeId);
      
      const roomData = {
        name: `${modeId} de ${user?.email || 'Joueur'}`,
        createdBy: user?.uid || '',
        players: [user?.uid || ''],
        currentPhase: 'waiting' as const,
        maxPlayers: 8,
      };

      const roomId = await createRoom(roomData);
      console.log('✅ Salle créée avec succès:', roomId);
      
      // Rediriger vers la salle de jeu
      router.push(`/game/${modeId}?roomId=${roomId}`);
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de la salle:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de créer la salle'
      );
    }
  };

  // Rendu des cartes de mode de jeu avec le nouveau design
  const renderGameModeCard = (game: GameMode, isGridItem = false) => (
    <TouchableOpacity 
      key={game.id}
      style={[styles.modeCard, isGridItem && styles.gridModeCard]} 
      onPress={() => createGameRoom(game.id)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={game.colors}
        style={[
          styles.modeGradient, 
          { 
            borderColor: game.borderColor,
            shadowColor: game.shadowColor
          },
          isGridItem && styles.gridModeGradient
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.modeContent, isGridItem && styles.gridModeContent]}>
          {!isGridItem && (
            <View style={styles.characterContainer}>
              <Image 
                source={game.image}
                style={styles.characterImage}
                resizeMode="contain"
              />
            </View>
          )}
          <View style={[styles.modeTextContainer, isGridItem && styles.gridModeTextContainer]}>
            {isGridItem && (
              <Image 
                source={game.image}
                style={styles.gridCharacterImage}
                resizeMode="contain"
              />
            )}
            <Text style={[styles.modeName, isGridItem && styles.gridModeName]}>{game.name}</Text>
            {!isGridItem && (
              <Text style={styles.modeDescription}>{game.description}</Text>
            )}
          </View>
          {game.tag ? (
            <View style={[styles.modeTagContainer, isGridItem && styles.gridModeTagContainer, { backgroundColor: game.tagColor }]}>
              <Text style={styles.modeTagText}>{game.tag}</Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
  
  // Rendu d'une catégorie de jeu avec ses modes
  const renderGameCategory = (category: GameCategory) => (
    <View key={category.id} style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <View>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          {category.subtitle ? (
            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
          ) : null}
        </View>
        {category.id !== 'packs' && (
          <TouchableOpacity style={styles.rulesButton}>
            <Text style={styles.rulesText}>règles</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {category.id === 'packs' ? (
        // Affichage en grid pour la catégorie "NOS PACKS LES PLUS JOUÉS"
        <View style={styles.gridContainer}>
          {category.games.map((game: GameMode) => (
            <View key={game.id} style={styles.gridItem}>
              {renderGameModeCard(game, true)}
            </View>
          ))}
        </View>
      ) : (
        // Affichage en colonne pour les autres catégories
        <View style={styles.gameModesColumn}>
          {category.games.map((game: GameMode) => renderGameModeCard(game))}
        </View>
      )}
    </View>
  );
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1A0938", "#2D1155"]}
        style={styles.background}
      >
        {/* TopBar */}
        <TopBar />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Content Container */}
          <View style={styles.contentContainer}>
            {/* Sections de jeu */}
            {gameCategories.map(renderGameCategory)}
          </View>
        </ScrollView>
        
        <BottomTabBar />
      </LinearGradient>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categorySubtitle: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  rulesButton: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 8,
  },
  rulesText: {
    color: 'white',
    fontSize: 10,
  },
  gameModesColumn: {
    width: '100%',
  },
  modeCard: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    height: 120,
  },
  modeGradient: {
    borderRadius: 20,
    height: '100%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: '100%',
  },
  characterContainer: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  modeTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  modeName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  modeDescription: {
    color: 'white',
    fontSize: 10,
    lineHeight: 14,
  },
  modeTagContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  modeTagText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%', // ~50% moins marge
    marginBottom: 16,
  },
  gridModeCard: {
    height: 140,
  },
  gridModeGradient: {
    height: '100%',
  },
  gridModeContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  gridModeTextContainer: {
    alignItems: 'center',
    paddingRight: 0,
  },
  gridModeName: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  gridCharacterImage: {
    width: 70,
    height: 70,
  },
  gridModeTagContainer: {
    top: 5,
    right: 5,
  },
});
