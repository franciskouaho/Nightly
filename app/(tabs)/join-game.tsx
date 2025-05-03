"use client"

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import BottomTabBar from '@/components/BottomTabBar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, getFirestore } from '@react-native-firebase/firestore';
import LoadingOverlay from '@/components/LoadingOverlay';

interface Room {
  id: string;
  name: string;
  gameMode: string;
  currentPhase: 'waiting' | 'playing' | 'finished';
  players: string[];
  maxPlayers: number;
}

export default function JoinGameScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleJoinGame = async () => {
    if (!code.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un code de partie');
      return;
    }

    setLoading(true);
    try {
      const db = getFirestore();
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('code', '==', code.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Erreur', 'Code de partie invalide');
        return;
      }

      const roomDoc = querySnapshot.docs[0];
      const room = roomDoc.data() as Room;

      if (room.currentPhase !== 'waiting') {
        Alert.alert('Erreur', 'Cette partie a déjà commencé');
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        Alert.alert('Erreur', 'Cette partie est pleine');
        return;
      }

      if (room.players.includes(user?.uid || '')) {
        Alert.alert('Erreur', 'Vous êtes déjà dans cette partie');
        return;
      }

      router.push(`/room/${roomDoc.id}`);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la recherche de la partie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#4b277d', '#2d1b4e']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Rejoindre une partie</Text>
          <Text style={styles.subtitle}>Entrez le code de la partie</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Code de la partie"
              placeholderTextColor="#999"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoinGame}
              disabled={loading}
            >
              <Text style={styles.joinButtonText}>Rejoindre</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      <BottomTabBar />
      <LoadingOverlay visible={loading} />
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  joinButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6c5ce7',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});