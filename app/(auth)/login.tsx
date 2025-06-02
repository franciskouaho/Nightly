"use client"

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthAnalytics } from '@/hooks/useAuthAnalytics';
import { useTranslation } from 'react-i18next';

const profils: string[] = [
  'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Frenard.png?alt=media&token=139ed01b-46f2-4f3e-9305-459841f2a893',
  'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Fchat.png?alt=media&token=0c852d5b-1a14-4b8a-8926-78a7c88c0695',
  'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Fgrenouille.png?alt=media&token=8257acb0-bcf7-4e30-a7cf-5ddf44e6da01',
  'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Foiseau.png?alt=media&token=5a9a9e36-1651-4461-8702-d7bc8d516423'
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
  const [selectedProfile, setSelectedProfile] = useState(profils[0] as string);
  const { signIn, restoreSession, user, firstLogin, checkExistingUser } = useAuth();
  const router = useRouter();
  const authAnalytics = useAuthAnalytics();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!username) {
      Alert.alert(t('errors.general'), t('auth.login.usernameRequired'));
      return;
    }

    if (username.length < 3) {
      Alert.alert(t('errors.general'), t('auth.login.usernameLength'));
      return;
    }

    setIsLoading(true);

    try {
      if (!selectedProfile) return;
      
      // Vérifier si l'utilisateur existe déjà
      const userExists = await checkExistingUser(username);
      
      if (userExists) {
        // L'utilisateur existe déjà et a confirmé la connexion
        await authAnalytics.trackLogin('username', true);
        router.replace('/(tabs)');
        return;
      }

      // Si l'utilisateur n'existe pas ou n'a pas confirmé la connexion
      try {
        await restoreSession();
      } catch (error) {
        // Si aucune session n'existe, créer une nouvelle session
        await firstLogin(username);
      }

      // Continuer avec la connexion normale
      await signIn(username, selectedProfile);
      await authAnalytics.trackLogin('username', true);
      router.replace('/(tabs)');
    } catch (error: any) {
      await authAnalytics.trackLogin('username', false);
      Alert.alert(
        t('errors.general'),
        error.message || t('errors.authError')
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
                  source={{ uri: selectedProfile }}
                  style={styles.selectedProfileImage}
              />
              <Text style={styles.title}>{t('app.name')}</Text>
              <Text style={styles.subtitle}>{t('auth.login.enterUsername')}</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={24} color="#fff" />
                <TextInput
                    style={styles.input}
                    placeholder={t('auth.login.username')}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    maxLength={20}
                />
              </View>

              <Text style={styles.profileSelectionTitle}>{t('auth.login.selectCharacter')}</Text>
              <Text style={styles.profileSelectionSubtitle}>{t('auth.login.characterDescription')}</Text>

              {chunkArray(profils, 4).map((row: any[], rowIdx: number) => (
                  <View style={styles.profilesRow} key={rowIdx}>
                    {row.map((img: any, idx: number) => (
                        <TouchableOpacity key={idx} onPress={() => setSelectedProfile(img)}>
                         <Image
                            source={{ uri: img }}
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
                  {isLoading ? t('auth.login.connecting') : t('auth.login.play')}
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
  profileSelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  profileSelectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 15,
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