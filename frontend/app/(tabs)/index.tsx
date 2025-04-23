"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "@/contexts/AuthContext"
import BottomTabBar from "@/components/BottomTabBar"
import TopBar from "@/components/TopBar"
import SocketService from '@/services/socketService';
import NetInfo from '@react-native-community/netinfo';
import { useCreateRoom } from '@/hooks/useCreateRoom';
import LoadingOverlay from '@/components/common/LoadingOverlay';

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
  const { user } = useAuth()

  // Gérer la création d'une salle de jeu
  const { mutate: createRoom, isPending: isCreatingRoom } = useCreateRoom();
  
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
      console.log('🎮 Tentative de création de salle avec mode:', modeId);
      
      // Initialiser le socket explicitement ici au moment du clic
      console.log('🔌 Initialisation socket demandée lors de la création de salle');
      
      // On active l'initialisation automatique seulement à partir de ce moment
      SocketService.setAutoInit(true);
      
      // S'assurer que toutes les propriétés sont correctement définies et nommées
      createRoom({
        name: `Salle de ${user?.username || 'Joueur'}`,
        game_mode: modeId,
        max_players: 6,
        total_rounds: 5,
      });
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de la salle:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de créer la salle'
      );
    }
  };

  // Rendu conditionnel pour le chargement
  if (isCreatingRoom) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={["#1A0938", "#2D1155"]}
          style={styles.background}
        />
        <LoadingOverlay message="Création de la salle en cours..." />
      </View>
    );
  }
  
  // Rendu des cartes de mode de jeu
  const renderGameModeCard = (game: GameMode) => (
    <TouchableOpacity 
      key={game.id}
      style={styles.modeCard} 
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
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.modeContent}>
          <View style={styles.characterContainer}>
            <Image 
              source={game.image}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.modeTextContainer}>
            <Text style={styles.modeName}>{game.name}</Text>
            <Text style={styles.modeDescription}>{game.description}</Text>
          </View>
          {game.tag ? (
            <View style={[styles.modeTagContainer, { backgroundColor: game.tagColor }]}>
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
      
      <View style={styles.gameModesColumn}>
        {category.games.map((game: GameMode) => renderGameModeCard(game))}
      </View>
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
        
        {/* Bottom Tab Bar */}
        <BottomTabBar />
      </LinearGradient>
    </View>
  )
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
