"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, TextInput, ImageBackground } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "@/contexts/AuthContext"
import TopBar from "@/components/TopBar"
import { useFirestore } from '@/hooks/useFirestore'
import { useRouter } from 'expo-router'
import NetInfo from '@react-native-community/netinfo'
import { gameCategories, GameMode, GameCategory } from '@/app/data/gameModes'
import { useEffect } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { collection, query, where, getDocs, getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';

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
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  code: string;
}

const generateRoomCode = (length = 6) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { add: createRoom, loading: isCreatingRoom } = useFirestore<Room>('rooms');
  const [partyCode, setPartyCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    console.log('🔄 État de création de salle:', isCreatingRoom);
  }, [isCreatingRoom]);

  const getUserDisplayName = (user: any) => {
    if (!user) return "Joueur";
    
    if (typeof user.pseudo === 'string' && user.pseudo.trim() !== '') {
      return user.pseudo;
    }
    
    return "Joueur";
  };

  const createGameRoom = async (game: GameMode) => {
    console.log('👉 Fonction createGameRoom appelée pour:', game.name);
    
    if (!user) {
      console.log('❌ Utilisateur non connecté');
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour créer une salle de jeu.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('👤 Informations utilisateur:', {
      uid: user.uid,
      pseudo: user.pseudo,
      createdAt: user.createdAt,
      avatar: user.avatar
    });

    if (!user.uid) {
      console.error('❌ UID utilisateur manquant');
      Alert.alert(
        'Erreur de connexion',
        'Votre session utilisateur est invalide. Veuillez vous reconnecter.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    console.log('⌛ Début du processus de création de salle...');
    
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
      
      const displayName = getUserDisplayName(user);
      
      const shortCode = generateRoomCode(6);
      
      const roomData: Omit<Room, 'id'> & { code: string } = {
        name: game.name,
        gameId: game.id,
        createdBy: user.uid,
        host: user.uid,
        players: [{
          id: user.uid,
          username: displayName,
          displayName: displayName,
          isHost: true,
          isReady: true,
          avatar: user.avatar,
        }],
        createdAt: new Date().toISOString(),
        status: "waiting",
        maxPlayers: 8,
        code: shortCode,
      };

      const validateRoomData = (data: any): boolean => {
        const checkValue = (value: any, path: string = ''): boolean => {
          if (value === undefined) {
            console.error(`❌ Valeur undefined trouvée dans ${path}`);
            return false;
          }
          if (Array.isArray(value)) {
            return value.every((item, index) => checkValue(item, `${path}[${index}]`));
          }
          if (value && typeof value === 'object') {
            return Object.entries(value).every(([key, val]) => 
              checkValue(val, path ? `${path}.${key}` : key)
            );
          }
          return true;
        };
        return checkValue(data);
      };

      if (!validateRoomData(roomData)) {
        throw new Error('Données de salle invalides : valeurs undefined détectées');
      }
  
      console.log('📤 Enregistrement dans Firebase avec les données:', JSON.stringify(roomData, null, 2));
      
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Délai d\'attente dépassé lors de la création de la salle')), 30000); // Augmenté à 30 secondes
        });
        
        const createdRoomId = await Promise.race([
          createRoom(roomData),
          timeoutPromise
        ]);
        
        if (!createdRoomId) {
          throw new Error('La création de la salle a échoué : aucun ID retourné');
        }
        
        console.log('✅ Salle créée avec succès dans Firebase:', createdRoomId);
        
        console.log('🔄 Tentative de redirection vers:', `/room/${createdRoomId}`);

        router.push(`/room/${createdRoomId}`);
        
        return true;
      } catch (firebaseError) {
        console.error('🔥 Erreur Firebase:', firebaseError);
        
        if (firebaseError instanceof Error) {
          let errorMessage = 'Une erreur est survenue lors de la création de la salle.';
          
          if (firebaseError.message.includes('permission-denied')) {
            errorMessage = 'Accès refusé : vérifiez les règles de sécurité Firestore';
          } else if (firebaseError.message.includes('network-request-failed')) {
            errorMessage = 'Erreur réseau : vérifiez votre connexion internet';
          } else if (firebaseError.message.includes('Délai d\'attente dépassé')) {
            errorMessage = 'Le serveur met trop de temps à répondre. Veuillez réessayer.';
          }
          
          Alert.alert('Erreur lors de la création de la salle', errorMessage);
        }
        throw firebaseError;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de la salle:', error);
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Impossible de créer la salle'
      );
      return false;
    }
  };
  
  const handleJoinGame = async () => {
    if (!partyCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un code de partie');
      return;
    }
    setLoading(true);
    try {
      const db = getFirestore();
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('code', '==', partyCode.toUpperCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        Alert.alert('Erreur', 'Code de partie invalide');
        return;
      }
      const roomDoc = querySnapshot.docs[0];
      if (!roomDoc) {
        Alert.alert('Erreur', 'Salle introuvable');
        return;
      }
      const room = roomDoc.data();
      if (room.status !== 'waiting') {
        Alert.alert('Erreur', 'Cette partie a déjà commencé');
        return;
      }
      if (room.players.length >= room.maxPlayers) {
        Alert.alert('Erreur', 'Cette partie est pleine');
        return;
      }
      if (!user) {
        Alert.alert('Erreur', 'Utilisateur non authentifié');
        return;
      }
      if (room.players.some((p: any) => p.id === user.uid)) {
        Alert.alert('Erreur', 'Vous êtes déjà dans cette partie');
        return;
      }
      const roomRef = doc(db, 'rooms', roomDoc.id);
      const newPlayer = {
        id: user.uid,
        username: user.pseudo || 'Joueur',
        displayName: user.pseudo || 'Joueur',
        isHost: false,
        isReady: false,
        avatar: user.avatar,
      };
      await updateDoc(roomRef, {
        players: [...room.players, newPlayer]
      });
      router.push(`/room/${roomDoc.id}`);
    } catch (error) {
      console.error('Erreur lors de la jonction de la salle:', error);
      Alert.alert('Erreur', 'Impossible de rejoindre la salle');
    } finally {
      setLoading(false);
    }
  };
  
  const renderGameModeCard = (game: GameMode, isGridItem = false) => {
    const handlePress = async () => {
      console.log('🖱️ Clic sur le mode de jeu:', game.name);
      console.log('📊 État de création:', isCreatingRoom);
      
      if (isCreatingRoom) {
        console.log('⏳ Création de salle en cours, veuillez patienter...');
        return;
      }
      
      try {
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
            {game.tag ? (
              <View style={[styles.modeTagContainer, styles.gridModeTagContainer, { backgroundColor: game.tagColor }]}> 
                <Text style={styles.modeTagText}>{game.tag}</Text>
              </View>
            ) : null}
            <View style={styles.overlay}>
              <Text style={styles.cardTitle}>{game.name}</Text>
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
          isCreatingRoom && styles.disabledCard
        ]} 
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={isCreatingRoom}
        testID={`game-mode-${game.id}`}
      >
        <LinearGradient
          colors={[game.colors[0] || "#A259FF", game.colors[1] || "#C471F5"]}
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
  
  const renderGameCategory = (category: GameCategory) => (
    <View key={category.id} style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <View>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          {category.subtitle ? (
            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
          ) : null}
        </View>
      </View>
      
      {['packs', 'same_room', 'online'].includes(category.id) ? (
        <View style={styles.gridContainer}>
          {category.games.map((game: GameMode) => (
            <View key={game.id} style={styles.gridItem}>
              {renderGameModeCard(game, true)}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.gameModesColumn}>
          {category.games.map((game: GameMode) => renderGameModeCard(game))}
        </View>
      )}
    </View>
  );
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      >
        <TopBar />

        <View style={styles.codeRow}>
          <View style={styles.codeInputContainer}>
            <TextInput
              style={styles.codeInputText}
              placeholder="Entre le code de la partie"
              placeholderTextColor="#C7B8F5"
              value={partyCode}
              onChangeText={setPartyCode}
              selectionColor="#A259FF"
              autoCapitalize="characters"
              maxLength={8}
              returnKeyType="done"
              onSubmitEditing={handleJoinGame}
            />
          </View>
          <TouchableOpacity
            style={styles.qrButton}
            onPress={handleJoinGame}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#A259FF", "#C471F5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.qrGradient}
            >
              <MaterialCommunityIcons name="login" size={30} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.contentContainer}>
            {gameCategories.map(renderGameCategory)}
          </View>
        </ScrollView>
      </LinearGradient>
      {loading && (
        <View style={{
          position: 'absolute',
          left: 0, right: 0, top: 0, bottom: 0,
          backgroundColor: 'rgba(20,10,40,0.5)',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16, padding: 24 }}>
            <Text style={{ color: '#fff', fontSize: 18 }}>Connexion à la partie...</Text>
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
    fontSize: 12,
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
    width: '48%',
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
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  codeInputContainer: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 40, 0.96)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#3D2956',
    height: 45,
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginRight: 16,
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  codeInputText: {
    color: '#E5DFFB',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.2,
    fontFamily: 'System',
    padding: 0,
  },
  qrButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  qrGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 7,
  },
  cardImageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
  },
  overlay: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
