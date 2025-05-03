"use client"

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import BottomTabBar from '@/components/BottomTabBar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import firestore from '@react-native-firebase/firestore';
import LoadingOverlay from '@/components/LoadingOverlay';

interface Room {
  id: string;
  name: string;
  gameMode: string;
  currentPhase: 'waiting' | 'playing' | 'finished';
  players: string[];
  maxPlayers: number;
}

export default function JoinGame() {
  const router = useRouter();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un code de salle');
      return;
    }

    setIsJoining(true);
    try {
      // Recherche par code (champ 'code')
      const code = roomCode.trim().toUpperCase();
      let querySnapshot = await firestore()
        .collection('rooms')
        .where('code', '==', code)
        .limit(1)
        .get();

      let roomDoc: any = querySnapshot.empty ? null : querySnapshot.docs[0];
      let roomRef = roomDoc ? roomDoc.ref : null;

      // Si pas trouvé, essaie par ID Firestore
      if (!roomDoc) {
        const docById = await firestore().collection('rooms').doc(roomCode.trim()).get();
        if (docById.exists()) {
          roomDoc = docById;
          roomRef = firestore().collection('rooms').doc(docById.id);
        }
      }

      if (!roomDoc || !roomRef) {
        Alert.alert('Erreur', 'Salle introuvable');
        return;
      }

      const roomData = roomDoc.data() as any;

      if (roomData.players.length >= roomData.maxPlayers) {
        Alert.alert('Erreur', 'La salle est pleine');
        return;
      }

      if (roomData.players.some((p: any) => p.id === user?.uid)) {
        Alert.alert('Erreur', 'Vous êtes déjà dans cette salle');
        return;
      }

      await roomRef.update({
        players: [
          ...roomData.players,
          {
            id: user?.uid,
            username: user?.pseudo,
            displayName: user?.pseudo,
            isHost: false,
            isReady: false,
            avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
          }
        ]
      });

      router.push(`/room/${roomDoc.id}`);
    } catch (error) {
      console.error('Erreur lors de la jointure:', error);
      Alert.alert('Erreur', 'Impossible de rejoindre la salle');
    } finally {
      setIsJoining(false);
    }
  };

  const handleScanQR = () => {
    Alert.alert('Scanner QR', 'Fonctionnalité à venir...');
  };

  const loadRecentRooms = async () => {
    try {
      const querySnapshot = await firestore()
        .collection('rooms')
        .where('currentPhase', '==', 'waiting')
        .get();
      
      const rooms = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];

      setRecentRooms(rooms);
    } catch (error) {
      console.error('Erreur lors du chargement des salles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadRecentRooms();
    }
  }, [user]);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient colors={['#1a0933', '#321a5e']} style={styles.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rejoindre une partie</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Code de la salle</Text>
          <View style={styles.codeInputArea}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={roomCode}
                onChangeText={setRoomCode}
                placeholder="Entrez le code de la salle (ex: QN64UG)"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="default"
                maxLength={6}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.qrButton]}
                onPress={handleScanQR}
                activeOpacity={0.7}
              >
                <Ionicons name="qr-code" size={22} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.joinButton, !roomCode ? styles.joinButtonDisabled : null]}
                onPress={handleJoinRoom}
                disabled={!roomCode || isJoining}
                activeOpacity={0.8}
              >
                <Text style={styles.joinButtonText}>Rejoindre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.orDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.orText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Parties récentes</Text>

          {recentRooms.length === 0 ? (
            <Text style={styles.emptyText}>Aucune salle récente trouvée</Text>
          ) : (
            recentRooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={styles.roomCard}
                onPress={() => {
                  setRoomCode(room.id);
                  handleJoinRoom();
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(93, 109, 255, 0.2)', 'rgba(93, 109, 255, 0.05)']}
                  style={styles.roomCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <View style={styles.roomDetails}>
                      <View style={styles.playerCount}>
                        <Text style={styles.playerCountText}>{room.gameMode}</Text>
                      </View>
                      {room.currentPhase !== 'waiting' && (
                        <View style={styles.privateTag}>
                          <MaterialCommunityIcons
                            name={room.currentPhase === 'playing' ? 'gamepad-variant' : 'check-circle'}
                            size={14}
                            color="rgba(255,255,255,0.8)"
                          />
                          <Text style={styles.privateTagText}>
                            {room.currentPhase === 'playing' ? 'En cours' : 'Terminée'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="arrow-right-circle"
                    size={28}
                    color="#5D6DFF"
                    style={styles.joinIcon}
                  />
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomTabBarPlaceholder} />
      </ScrollView>

      <BottomTabBar />
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  inputSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  codeInputArea: {
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: 'white',
    letterSpacing: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  qrButton: {
    backgroundColor: 'rgba(93, 109, 255, 0.7)',
    paddingVertical: 15,
    paddingHorizontal: 15,
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButton: {
    backgroundColor: '#5D6DFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '80%',
    alignItems: 'center',
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  orText: {
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 10,
    fontSize: 14,
  },
  recentSection: {
    marginTop: 10,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 20,
  },
  roomCard: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  roomCardGradient: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roomDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerCount: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  playerCountText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  privateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  privateTagText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginLeft: 4,
  },
  joinIcon: {
    marginLeft: 10,
  },
  bottomTabBarPlaceholder: {
    height: 80,
  },
});