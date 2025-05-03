"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "@/contexts/AuthContext"
import BottomTabBar from "@/components/BottomTabBar"
import TopBar from "@/components/TopBar"
import { useFirestore } from '@/hooks/useFirestore'
import { useRouter } from 'expo-router'
import NetInfo from '@react-native-community/netinfo'
import { gameCategories, GameMode, GameCategory } from '@/app/data/gameModes'
import { useEffect } from 'react'

interface Room {
  id: string;
  name: string;
  gameId: string;
  createdBy: string;
  host: string;
  players: {
    id: string;
    username: string;
    displayName: string;
    isHost: boolean;
    isReady: boolean;
    avatar: string;
  }[];
  createdAt: string;
  status: string;
  maxPlayers: number;
}

// Fonction utilitaire pour générer des IDs uniques sans dépendre de crypto
const generateUniqueId = (length: number = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const timestamp = new Date().getTime().toString(36);
  let result = timestamp.substring(timestamp.length - 2);
  
  for (let i = 0; i < length - 2; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { add: createRoom, loading: isCreatingRoom } = useFirestore<Room>('rooms');

  // Ajouter un log pour suivre l'état de chargement
  useEffect(() => {
    console.log('🔄 État de création de salle:', isCreatingRoom);
  }, [isCreatingRoom]);

  // Fonction utilitaire pour obtenir le nom d'affichage de l'utilisateur
  const getUserDisplayName = (user: any) => {
    if (!user) return "Joueur";
    
    // Vérifier les propriétés courantes pour les objets utilisateur
    if (typeof user.displayName === 'string' && user.displayName.trim() !== '') {
      return user.displayName;
    }
    
    if (typeof user.email === 'string' && user.email.trim() !== '') {
      // Utiliser seulement la partie avant @ de l'email
      return user.email.split('@')[0];
    }
    
    if (typeof user.username === 'string' && user.username.trim() !== '') {
      return user.username;
    }
    
    // Fallback si aucun nom disponible
    return "Joueur";
  };

  const createGameRoom = async (game: GameMode) => {
    console.log('👉 Fonction createGameRoom appelée pour:', game.name);
    
    // Vérifier que l'utilisateur est connecté
    if (!user) {
      console.log('❌ Utilisateur non connecté');
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour créer une salle de jeu.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Afficher l'indicateur de chargement
    console.log('⌛ Début du processus de création de salle...');
    
    // Vérifier la connexion internet avec gestion d'erreurs
    try {
      const netInfo = await NetInfo.fetch();
      console.log('📶 État de la connexion:', netInfo.isConnected);
      
      if (!netInfo.isConnected) {
        Alert.alert(
          'Erreur de connexion',
          'Pas de connexion internet. Veuillez vérifier votre connexion et réessayer.'
        );
        return;
      }
  
      console.log('🎮 Création d\'une salle pour le mode:', game.id);
      
      const roomId = generateUniqueId(6);
      
      // Préparer les données pour Firebase
      const roomData: Room = {
        id: roomId,
        name: game.name,
        gameId: game.id,
        createdBy: user.uid,
        host: user.uid,
        players: [{
          id: user.uid,
          username: getUserDisplayName(user),
          displayName: getUserDisplayName(user),
          isHost: true,
          isReady: true,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        }],
        createdAt: new Date().toISOString(),
        status: "waiting",
        maxPlayers: 8,
      };
  
      console.log('📤 Enregistrement dans Firebase avec les données:', roomData);
      
      try {
        // Créer la salle dans Firebase avec un timeout pour éviter une attente infinie
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Délai d\'attente dépassé lors de la création de la salle')), 15000);
        });
        
        // Race entre la création de room et le timeout
        await Promise.race([
          createRoom(roomData),
          timeoutPromise
        ]);
        
        console.log('✅ Salle créée avec succès dans Firebase:', roomId);
        
        // Rediriger vers la page room avec l'ID seulement
        console.log('🔄 Tentative de redirection vers:', `/room/${roomId}`);
        
        // Forcer un délai avant la navigation pour éviter les problèmes de timing
        setTimeout(() => {
          console.log('➡️ Exécution de la redirection maintenant');
          router.push(`/room/${roomId}`);
        }, 500);
        
        return true;
      } catch (firebaseError) {
        console.error('🔥 Erreur Firebase:', firebaseError);
        if (firebaseError instanceof Error) {
          Alert.alert(
            'Erreur lors de la création de la salle',
            firebaseError.message || 'Une erreur est survenue lors de la création de la salle.'
          );
        }
        throw firebaseError; // Remonter l'erreur pour la gestion globale
      }
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de la salle:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de créer la salle'
      );
      return false;
    }
  };
  
  // Améliorer le rendu des cartes pour s'assurer que les événements sont correctement attachés
  const renderGameModeCard = (game: GameMode, isGridItem = false) => {
    // Créer un gestionnaire d'événements séparé pour faciliter le débogage
    const handlePress = async () => {
      console.log('🖱️ Clic sur le mode de jeu:', game.name);
      console.log('📊 État de création:', isCreatingRoom);
      
      // Désactiver temporairement l'interaction pendant la création
      if (isCreatingRoom) {
        console.log('⏳ Création de salle en cours, veuillez patienter...');
        return;
      }
      
      try {
        // Appeler la fonction de création et attendre sa complétion
        const result = await createGameRoom(game);
        
        if (result) {
          console.log('✅ Création de la salle réussie, redirection en cours...');
        } else {
          console.log('❌ La création de la salle a échoué');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la création de la salle:', error);
      }
    };
    
    return (
      <TouchableOpacity 
        key={game.id}
        style={[
          styles.modeCard, 
          isGridItem && styles.gridModeCard,
          isCreatingRoom && styles.disabledCard
        ]} 
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={isCreatingRoom}
        testID={`game-mode-${game.id}`}
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
  };
  
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
  disabledCard: {
    opacity: 0.6,
  },
});
