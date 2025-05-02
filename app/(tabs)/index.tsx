"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "@/contexts/AuthContext"
import BottomTabBar from "@/components/BottomTabBar"
import TopBar from "@/components/TopBar"
import { useFirebaseRooms } from '@/hooks/useFirebaseRooms';
import { useRouter } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';

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
  const { createRoom, loading: isCreatingRoom } = useFirebaseRooms();

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

  const renderGameModeCard = (game: GameMode, isGridItem = false) => (
    <TouchableOpacity
      key={game.id}
      style={[
        styles.gameCard,
        isGridItem ? styles.gridItem : null,
        { borderColor: game.borderColor }
      ]}
      onPress={() => createGameRoom(game.id)}
      disabled={isCreatingRoom}
    >
      <LinearGradient
        colors={game.colors}
        style={styles.cardGradient}
      >
        <Image source={game.image} style={styles.gameImage} />
        <View style={styles.cardContent}>
          <Text style={styles.gameName}>{game.name}</Text>
          <Text style={styles.gameDescription}>{game.description}</Text>
          {game.tag && (
            <View style={[styles.tagContainer, { backgroundColor: game.tagColor }]}>
              <Text style={styles.tagText}>{game.tag}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderGameCategory = (category: GameCategory) => (
    <View key={category.id} style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        {category.subtitle && (
          <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gamesScroll}
      >
        {category.games.map(game => renderGameModeCard(game))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a0933", "#321a5e"]}
        style={StyleSheet.absoluteFill}
      />
      <TopBar />
      <ScrollView style={styles.scrollView}>
        {gameCategories.map(renderGameCategory)}
      </ScrollView>
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0933',
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  categorySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  gamesScroll: {
    paddingHorizontal: 15,
  },
  gameCard: {
    width: 300,
    height: 200,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
  },
  gridItem: {
    width: '45%',
    height: 180,
  },
  cardGradient: {
    flex: 1,
    padding: 15,
  },
  gameImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  cardContent: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  tagContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
