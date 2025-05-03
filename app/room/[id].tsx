import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, Clipboard, Share, GestureResponderEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { collection, doc, onSnapshot, updateDoc, getFirestore, getDoc, setDoc } from '@react-native-firebase/firestore';
import { GameState, GamePhase, Player, Question } from '@/types/gameTypes';

// Type pour l'utilisateur
interface User {
  id: string | number;
  username: string;
  displayName?: string;
  avatar?: string;
  level?: number;
  isHost?: boolean;
}

// Type local pour Player qui correspond à ce que nous utilisons dans ce composant
interface Player {
  id: string;
  username: string;
  displayName?: string;
  name: string; // Pour la rétrocompatibilité avec le code existant
  isHost: boolean;
  isReady: boolean;
  avatar: string;
  level: number;
}

// Interface pour l'objet Room qui correspond à ce qui est créé dans la page d'accueil
interface Room {
  id: string;
  gameId: string;
  name: string;
  players: Player[];
  createdAt: string;
  status: string;
  host: string;
  maxPlayers: number;
  code: string;
}

// Interface pour les données de création de salle
interface RoomCreationData {
  name: string;
  gameId: string;
  maxPlayers: number;
  host: string;
  players: Player[];
  [key: string]: any; // Pour les propriétés additionnelles
}

/**
 * Crée une salle dans Firebase avec gestion de timeout et d'erreurs améliorée
 * @param roomData Données de la salle à créer
 * @param timeoutMs Délai maximum en millisecondes (défaut: 30000ms)
 * @returns Promise avec les données de la salle créée incluant son ID
 */
export const createFirebaseRoom = async (roomData: RoomCreationData, timeoutMs = 30000): Promise<Room> => {
  // Récupérer l'instance Firestore
  const db = getFirestore();
  
  // Vérification des données obligatoires
  if (!roomData.name || !roomData.host || !roomData.gameId) {
    throw new Error('Données de salle incomplètes (nom, hôte ou gameId manquant)');
  }

  // Nettoyer les données pour éviter les champs non sérialisables
  const cleanedPlayers = roomData.players.map(player => ({
    id: player.id,
    username: player.username || player.displayName || 'Joueur',
    name: player.name || player.displayName || player.username || 'Joueur',
    isHost: player.isHost || false,
    isReady: player.isReady || false,
    avatar: player.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    level: player.level || 1
  }));

  // Créer un objet propre pour Firestore (sans méthodes ou propriétés spéciales)
  const firestoreData = {
    name: roomData.name,
    gameId: roomData.gameId,
    host: roomData.host,
    status: 'waiting', 
    players: cleanedPlayers,
    maxPlayers: roomData.maxPlayers || 6,
    createdAt: new Date().toISOString(), // Utiliser une chaîne ISO au lieu de serverTimestamp() pour résoudre des problèmes potentiels
    updatedAt: new Date().toISOString(),
    code: roomData.code || '',
  };

  console.log('🏠 Tentative de création de salle avec données nettoyées:', JSON.stringify(firestoreData));
  
  try {
    // Créer une référence à la collection
    const roomsCollection = collection(db, 'rooms');
    
    // Mesurer le temps d'exécution
    const startTime = Date.now();
    
    // Utiliser une promesse avec timeout manuellement géré
    const addDocWithTimeout = async () => {
      return new Promise<Room>((resolve, reject) => {
        // Ajouter le document
        addDoc(roomsCollection, firestoreData)
          .then(docRef => {
            const endTime = Date.now();
            console.log(`🏠 Salle créée avec succès en ${endTime - startTime}ms:`, docRef.id);
            
            // Retourner l'objet Room avec l'ID
            const roomWithId: Room = {
              ...roomData,
              id: docRef.id,
              createdAt: firestoreData.createdAt,
              status: 'waiting',
              maxPlayers: firestoreData.maxPlayers,
              code: firestoreData.code,
            };
            
            resolve(roomWithId);
          })
          .catch(error => {
            console.error('⚡ Erreur Firebase addDoc:', error);
            reject(error);
          });
          
        // Ajouter un timeout
        setTimeout(() => {
          reject(new Error(`Délai d'attente dépassé lors de la création de la salle (${timeoutMs}ms)`));
        }, timeoutMs);
      });
    };
    
    // Exécuter avec un délai de garde
    return await addDocWithTimeout();
  } catch (error: any) {
    console.error('🔥 Erreur de création de salle détaillée:', error);
    
    // Vérifications supplémentaires
    if (error.code === 'permission-denied') {
      throw new Error(`Accès refusé: vérifiez les règles de sécurité Firestore`);
    } else if (error.code === 'unavailable' || error.code === 'network-request-failed') {
      throw new Error(`Problème réseau: vérifiez votre connexion internet`);
    }
    
    // Ajouter le délai au message pour clarité
    if (error.message.includes('Délai d\'attente dépassé')) {
      console.error(`⏱️ Délai de ${timeoutMs}ms dépassé - causes possibles:`);
      console.error('- Connexion internet instable ou lente');
      console.error('- Règles de sécurité Firestore restrictives');
      console.error('- Données non sérialisables dans l\'objet room');
      console.error('- Trafic élevé ou limitations Firebase');
    }
    
    throw error;
  }
};

export default function RoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const db = getFirestore();
    const roomRef = doc(db, 'rooms', id as string);
    
    const unsubscribe = onSnapshot(roomRef, async (doc) => {
      if (doc.exists()) {
        const roomData = { ...(doc.data() as Room), id: doc.id };
        setRoom(roomData);
      } else {
        Alert.alert('Erreur', 'Salle introuvable');
        router.back();
      }
      setLoading(false);
    }, (error) => {
      console.error('Erreur lors de l\'écoute de la salle:', error);
      Alert.alert('Erreur', 'Impossible de charger la salle');
      router.back();
    });

    return () => unsubscribe();
  }, [id, user]);

  const handleStartGame = async () => {
    if (!room || !user) return;

    try {
      const db = getFirestore();
      
      // 1. Get questions for the game mode
      const questionsRef = doc(db, 'gameQuestions', room.gameId);
      const questionsDoc = await getDoc(questionsRef);
      
      if (!questionsDoc.exists()) {
        throw new Error('Questions not found for this game mode');
      }
      
      const questions = questionsDoc.data().questions;
      if (!questions || questions.length === 0) {
        throw new Error('No questions available for this game mode');
      }

      // 2. Create game document
      const gameRef = doc(collection(db, 'games'));
      const randomPlayer = room.players[Math.floor(Math.random() * room.players.length)] || null;
      
      const firstQuestion: Question = {
        id: '1',
        text: questions[0],
        theme: room.gameId,
        roundNumber: 1
      };
      
      const gameData: GameState = {
        phase: GamePhase.QUESTION,
        currentRound: 1,
        totalRounds: questions.length,
        targetPlayer: randomPlayer,
        currentQuestion: firstQuestion,
        answers: [],
        players: room.players.map(p => ({
          id: p.id,
          name: p.displayName || p.username,
          avatar: p.avatar
        })),
        scores: {},
        theme: room.gameId,
        timer: 60,
        currentUserState: {
          isTargetPlayer: false,
          hasAnswered: false,
          hasVoted: false
        },
        game: {
          currentPhase: 'question',
          currentRound: 1,
          totalRounds: questions.length,
          scores: {},
          gameMode: room.gameId,
          hostId: room.host
        }
      };

      // 3. Create the game document
      await setDoc(gameRef, gameData);

      // 4. Update room status
      await updateDoc(doc(db, 'rooms', room.id), {
        status: 'playing',
        startedAt: new Date().toISOString(),
        gameId: gameRef.id
      });

      // 5. Navigate to the game
      router.push(`/game/${gameRef.id}`);
    } catch (error: unknown) {
      console.error('Erreur lors du démarrage de la partie:', error);
      Alert.alert('Erreur', 'Impossible de démarrer la partie');
    }
  };

  const handleLeaveRoom = async () => {
    if (!room || !user) return;

    try {
      const db = getFirestore();
      const updatedPlayers = room.players.filter(p => p.id !== user.uid);
      
      if (updatedPlayers.length === 0) {
        // Si c'était le dernier joueur, supprimer la salle
        await updateDoc(doc(db, 'rooms', room.id), {
          status: 'finished'
        });
      } else if (updatedPlayers[0]) {
        // Sinon, mettre à jour la liste des joueurs
        await updateDoc(doc(db, 'rooms', room.id), {
          players: updatedPlayers,
          host: updatedPlayers[0].id // Le premier joueur restant devient l'hôte
        });
      }
      
      router.back();
    } catch (error) {
      console.error('Erreur lors de la sortie de la salle:', error);
      Alert.alert('Erreur', 'Impossible de quitter la salle');
    }
  };

  const handleShareRoom = async () => {
    if (!room) return;

    try {
      await Share.share({
        message: `Rejoins ma partie sur Nightly ! Code: ${room.code}`,
        title: 'Rejoins ma partie'
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const handleCopyCode = async () => {
    if (!room) return;

    try {
      await Clipboard.setString(room.code);
      Alert.alert('Succès', 'Code copié dans le presse-papiers');
    } catch (error) {
      console.error('Erreur lors de la copie du code:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement de la salle...</Text>
      </View>
    );
  }

  if (!room || !room.id) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#4b277d', '#2d1b4e']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.roomName}>{room.name}</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareRoom}
          >
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Code de la salle</Text>
          <TouchableOpacity
            style={styles.codeBox}
            onPress={handleCopyCode}
          >
            <Text style={styles.codeText}>{room.code}</Text>
            <Ionicons name="copy-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.playersContainer}>
          <Text style={styles.sectionTitle}>Joueurs ({room.players.length}/{room.maxPlayers})</Text>
          <FlatList
            data={room.players}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.playerCard}>
                <Image
                  source={{ uri: item.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` }}
                  style={styles.playerAvatar}
                />
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{item.displayName || item.username}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {item.isHost && (
                      <View style={styles.hostBadge}>
                        <Text style={styles.hostText}>Hôte</Text>
                      </View>
                    )}
                    {item.isReady && (
                      <View style={styles.readyBadge}>
                        <Text style={styles.readyText}>Prêt !</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          />
        </View>

        {/* Debug logs pour le bouton Prêt */}
        {(() => {
          console.log('user.uid:', user?.uid);
          console.log('room.host:', room.host);
          console.log('room.status:', room.status);
          console.log('room.id:', room.id);
          console.log('players:', room.players);
          console.log('isReady:', room.players.find(p => String(p.id) === String(user?.uid))?.isReady);
        })()}
        {/* Bouton Prêt pour les joueurs non-hôtes et non prêts */}
        {user?.uid !== room.host && room.status === 'waiting' && room.id && !room.players.find(p => String(p.id) === String(user?.uid))?.isReady && (
          <TouchableOpacity
            style={styles.readyButton}
            onPress={async () => {
              try {
                const db = getFirestore();
                const updatedPlayers = room.players.map(p =>
                  String(p.id) === String(user?.uid) ? { ...p, isReady: true } : p
                );
                console.log('user:', user);
                console.log('updatedPlayers:', updatedPlayers);
                console.log('room.id:', room.id);
                await updateDoc(doc(db, 'rooms', room.id), {
                  players: updatedPlayers
                });
                console.log('Mise à jour réussie !');
              } catch (error) {
                console.log('Erreur Firestore:', error);
                Alert.alert('Erreur', 'Impossible de se mettre prêt');
              }
            }}
          >
            <Text style={styles.readyButtonText}>Je suis prêt !</Text>
          </TouchableOpacity>
        )}

        {/* Bouton démarrer la partie pour l'hôte */}
        {user?.uid === room.host && room.status === 'waiting' && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartGame}
            disabled={!room.players.every(p => p.isReady)}
          >
            <Text style={styles.startButtonText}>Démarrer la partie</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.leaveButton}
          onPress={handleLeaveRoom}
        >
          <Text style={styles.leaveButtonText}>Quitter la salle</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4b277d',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  roomName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  shareButton: {
    padding: 8,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  codeLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  codeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 10,
    letterSpacing: 2,
  },
  playersContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  hostBadge: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  hostText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  readyBadge: {
    backgroundColor: '#00c853',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  readyButton: {
    backgroundColor: '#00c853',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  readyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#6c5ce7',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
