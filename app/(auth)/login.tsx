"use client"

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthAnalytics } from '@/hooks/useAuthAnalytics';

const profils = [
  require('@/assets/profils/chat.png'),
  require('@/assets/profils/renard.png'),
  require('@/assets/profils/grenouille.png'),
  require('@/assets/profils/hibou.png'),
  require('@/assets/profils/crocodile.png'),
  require('@/assets/profils/chatRare.png'),
  require('@/assets/profils/panda.png'),
  require('@/assets/profils/chatRare2.png'),
];

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(profils[0]);
  const { signIn } = useAuth();
  const router = useRouter();
  const authAnalytics = useAuthAnalytics();

  const handleLogin = async () => {
    if (!username) {
      Alert.alert('Erreur', 'Veuillez entrer votre pseudo');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Erreur', 'Le pseudo doit contenir au moins 3 caractères');
      return;
    }

    setIsLoading(true);
    try {
      // Convertir l'image en URI
      const avatarUri = Image.resolveAssetSource(selectedProfile).uri;
      await signIn(username, avatarUri);
      
      // Track le succès de la connexion
      await authAnalytics.trackLogin('username', true);
      
      router.replace('/(tabs)');
    } catch (error: any) {
      // Track l'échec de la connexion
      await authAnalytics.trackLogin('username', false);
      
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de se connecter'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={selectedProfile}
              style={styles.selectedProfileImage}
            />
            <Text style={styles.title}>Nightly</Text>
            <Text style={styles.subtitle}>Entrez votre pseudo pour jouer</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={24} color="#fff" />
              <TextInput
                style={styles.input}
                placeholder="Votre pseudo"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                maxLength={20}
              />
            </View>

            {chunkArray(profils, 4).map((row: any[], rowIdx: number) => (
              <View style={styles.profilesRow} key={rowIdx}>
                {row.map((img: any, idx: number) => (
                  <TouchableOpacity key={idx} onPress={() => setSelectedProfile(img)}>
                    <Image
                      source={img}
                      style={[
                        styles.profileImg,
                        selectedProfile === img && styles.profileImgSelected,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Connexion...' : 'Jouer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  selectedProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#8E24AA',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  profilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  profileImgSelected: {
    borderColor: '#8E24AA',
    transform: [{ scale: 1.1 }],
  },
  button: {
    backgroundColor: '#8E24AA',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  background: {
    flex: 1,
  },
});