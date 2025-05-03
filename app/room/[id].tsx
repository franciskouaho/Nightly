import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, Clipboard, Share, GestureResponderEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getFirestore, doc, onSnapshot, updateDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';

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
  const db = getFirestore(getApp());
  
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
    updatedAt: new Date().toISOString()
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
              maxPlayers: firestoreData.maxPlayers
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

export default function Room() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Firebase setup
  const app = getApp();
  const db = getFirestore(app);

  const [roomData, setRoomData] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Chargement de la salle...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set up Firebase listener for room data
  useEffect(() => {
    if (!id || typeof id !== 'string') {
      setError('ID de salle non valide');
      setIsLoading(false);
      return;
    }

    const roomRef = doc(db, 'rooms', id as string);

    // Initial fetch to check if the room exists
    getDoc(roomRef).then(docSnap => {
      if (!docSnap.exists()) {
        setError('Cette salle n\'existe pas');
        setIsLoading(false);
        return;
      }
    }).catch(err => {
      console.error('Error checking room:', err);
      setError('Erreur lors du chargement de la salle');
      setIsLoading(false);
    });

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      roomRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();

          // Create room data from snapshot
          const roomInfo: Room = {
            id: docSnapshot.id,
            gameId: data.gameId || '',
            name: data.name || 'Salle sans nom',
            players: data.players || [],
            createdAt: data.createdAt || new Date().toISOString(),
            status: data.status || 'waiting',
            host: data.host || data.createdBy || '',
            maxPlayers: data.maxPlayers || 6
          };

          // Update state with room data
          setRoomData(roomInfo);
          setRoomName(roomInfo.name);
          setMaxPlayers(roomInfo.maxPlayers);

          // Transform player data to match our Player interface
          if (data.players && Array.isArray(data.players)) {
            const formattedPlayers: Player[] = data.players.map((player: any) => ({
              id: player.id || player.uid || '',
              username: player.username || player.displayName || 'Joueur',
              name: player.displayName || player.username || 'Joueur',
              isHost: player.id === roomInfo.host || player.uid === roomInfo.host,
              isReady: player.isReady || false,
              avatar: player.avatar || player.photoURL || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
              level: player.level || Math.floor(Math.random() * 10) + 1
            }));
            setPlayers(formattedPlayers);

            // Check if current user is host
            if (user && (user.uid === roomInfo.host || user.id === roomInfo.host)) {
              setIsHost(true);
            }

            // Check if current user is ready
            if (user) {
              const currentPlayerInRoom = formattedPlayers.find(
                p => p.id === user.uid || p.id === user.id
              );
              setIsReady(currentPlayerInRoom?.isReady || false);
            }
          }

          setIsLoading(false);
        } else {
          setError('Cette salle n\'existe plus');
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Error listening to room updates:', error);
        setError(`Erreur: ${error.message}`);
        setIsLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [id, user, db]);

  // Mettre à jour l'utilisateur actuel lorsque les données sont disponibles
  useEffect(() => {
    if (user) {
      setCurrentUser(user as User);
    }
  }, [user]);

  const handleToggleReady = async () => {
    if (!id || !user || !roomData) return;

    try {
      setIsLoading(true);
      const roomRef = doc(db, 'rooms', id as string);

      // Find current user in players array and update their ready status
      const updatedPlayers = roomData.players.map(player => {
        if (player.id === user.uid || player.id === user.id) {
          return { ...player, isReady: !isReady };
        }
        return player;
      });

      // Update Firestore document
      await updateDoc(roomRef, {
        players: updatedPlayers
      });

      // Local update
      setIsReady(!isReady);
      console.log(`🎮 Statut changé: ${!isReady ? 'prêt' : 'pas prêt'}`);

    } catch (error: any) {
      console.error('Erreur mise à jour statut:', error);
      Alert.alert('Erreur', `Impossible de mettre à jour votre statut: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!roomData || !isHost) return;

    // Vérifier si tous les joueurs sont prêts
    const nonReadyPlayers = players.filter(player => !player.isReady && !player.isHost);

    if (nonReadyPlayers.length > 0) {
      Alert.alert(
        "Attention",
        `Tous les joueurs ne sont pas prêts (${nonReadyPlayers.length} en attente). Veuillez attendre que tout le monde soit prêt avant de démarrer.`,
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setIsLoading(true);
      // Mettre à jour le statut de la salle dans Firestore
      const roomRef = doc(db, 'rooms', id as string);
      await updateDoc(roomRef, {
        status: 'playing'
      });

      // Redirection vers la page de jeu
      router.push(`/game/${roomData.gameId}?roomId=${roomData.id}`);

    } catch (error: any) {
      console.error('Erreur démarrage partie:', error);
      Alert.alert('Erreur', `Impossible de démarrer la partie: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!id || !user) return;

    Alert.alert(
      'Quitter la salle',
      'Êtes-vous sûr de vouloir quitter cette salle ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: async () => {
            try {
              // Si l'utilisateur est le dernier à quitter ou est l'hôte, supprimer la salle
              // Sinon, retirer le joueur de la liste
              if (isHost || players.length <= 1) {
                // Code pour supprimer la salle ou transférer l'hôte si nécessaire
                // Cela serait implémenté selon vos besoins spécifiques
              } else {
                // Enlever le joueur de la liste
                const roomRef = doc(db, 'rooms', id as string);
                const updatedPlayers = roomData?.players.filter(
                  player => player.id !== user.uid && player.id !== user.id
                ) || [];

                await updateDoc(roomRef, {
                  players: updatedPlayers
                });
              }

              router.push('/');
            } catch (error) {
              console.error('Erreur en quittant la salle:', error);
              // Forcer le retour même en cas d'erreur
              router.push('/');
            }
          },
        },
      ]
    );
  };

  const handleCopyCode = () => {
    Clipboard.setString(roomData?.id || id as string);
    Alert.alert('Code copié', 'Le code de la salle a été copié dans le presse-papiers');
  };

  const handleShareCode = async () => {
    try {
      const result = await Share.share({
        message: `Rejoins-moi dans Cosmic Quest ! Utilise ce code pour me rejoindre: ${roomData?.id || id}`,
        url: `cosmic-quest://room/${roomData?.id || id}`,
        title: 'Invitation Cosmic Quest',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type of', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
      setInviteModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite lors du partage');
    }
  };

  const showRules = () => {
    setRulesVisible(true);
  };

  const hideRules = () => {
    setRulesVisible(false);
  };

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <View style={styles.playerCard}>
      <LinearGradient
        colors={item.isReady ? ['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0.05)'] : ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.playerCardGradient}
      >
        <Image 
          source={{ uri: item.avatar }} 
          style={styles.playerAvatar} 
        />
        
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>
            {item.name} 
            {item.isHost && <Text style={styles.hostTag}> (Hôte)</Text>}
          </Text>
          <Text style={styles.playerLevel}>Niveau {item.level}</Text>
        </View>
        
        <View style={[styles.statusIndicator, item.isReady ? styles.readyStatus : styles.notReadyStatus]}>
          <Text style={styles.statusText}>{item.isReady ? 'Prêt' : 'En attente'}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  if (isLoading && !roomData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <LinearGradient
          colors={['#1a0933', '#321a5e']}
          style={styles.background}
        />
        <Text style={{ color: 'white', fontSize: 18, marginBottom: 20 }}>{loadingMessage}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <LinearGradient
          colors={['#1a0933', '#321a5e']}
          style={styles.background}
        />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.backToHomeButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.backToHomeText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function handleInviteFriend(event: GestureResponderEvent): void {
    setInviteModalVisible(true);
  }
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#1a0933', '#321a5e']}
        style={styles.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleLeaveRoom}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{roomName}</Text>
          <View style={styles.roomInfoDetails}>
            <View style={styles.playersCount}>
              <FontAwesome5 name="user-astronaut" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.playersCountText}>{players.length}/{maxPlayers}</Text>
            </View>
            
            <TouchableOpacity style={styles.roomCodeBadge} onPress={handleCopyCode}>
              <Text style={styles.roomCodeText}>Code: {roomData?.id || id}</Text>
              <MaterialCommunityIcons name="content-copy" size={16} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.inviteButton} onPress={handleInviteFriend}>
            <Ionicons name="qr-code" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Room content */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Joueurs</Text>
          <TouchableOpacity style={styles.helpButton} onPress={showRules}>
            <Ionicons name="help-circle" size={22} color="rgba(255, 255, 255, 0.8)" />
          </TouchableOpacity>
        </View>
        
        {players.length > 0 ? (
          <FlatList
            data={players}
            renderItem={renderPlayerItem}
            keyExtractor={item => item.id}
            style={styles.playersList}
            contentContainerStyle={styles.playersListContent}
          />
        ) : (
          <View style={[styles.centerContent, { flex: 1 }]}>
            <Text style={{ color: 'white', fontSize: 16 }}>Chargement des joueurs...</Text>
          </View>
        )}
        
        {/* Room actions */}
        <View style={styles.actionsContainer}>
          {isHost ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.startGameButton, isLoading && styles.disabledButton]}
              onPress={handleStartGame}
              disabled={isLoading}
            >
              <MaterialCommunityIcons name="rocket-launch" size={24} color="white" />
              <Text style={styles.actionButtonText}>
                {isLoading ? 'Chargement...' : 'Lancer la partie'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                isReady ? styles.notReadyButton : styles.readyButton,
                isLoading && styles.disabledButton
              ]}
              onPress={handleToggleReady}
              disabled={isLoading}
            >
              {isReady ? (
                <>
                  <MaterialCommunityIcons name="close-circle" size={24} color="white" />
                  <Text style={styles.actionButtonText}>
                    {isLoading ? 'Chargement...' : 'Annuler'}
                  </Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={24} color="white" />
                  <Text style={styles.actionButtonText}>
                    {isLoading ? 'Chargement...' : 'Je suis prêt'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomInfo: {
    flex: 1,
    alignItems: 'center',
  },
  roomName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  roomInfoDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  playersCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  playersCountText: {
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 5,
    fontSize: 12,
  },
  roomCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(93, 109, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginLeft: 8,
  },
  roomCodeText: {
    color: 'rgba(255,255,255,0.8)',
    marginRight: 5,
    fontSize: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(93, 109, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  helpButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playersList: {
    flex: 1,
  },
  playersListContent: {
    paddingBottom: 20,
  },
  playerCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(93, 109, 255, 0.3)',
  },
  playerCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  hostTag: {
    color: '#FFC107',
    fontWeight: 'normal',
  },
  playerLevel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  readyStatus: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  notReadyStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  actionsContainer: {
    paddingVertical: 20,
    marginBottom: 70, // Espace pour la BottomTabBar
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
  },
  readyButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  notReadyButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  startGameButton: {
    backgroundColor: 'rgba(93, 109, 255, 0.8)',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  backToHomeButton: {
    backgroundColor: 'rgba(93, 109, 255, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backToHomeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
