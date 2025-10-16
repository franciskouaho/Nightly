import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import OnboardingButton from '@/components/onboarding/OnboardingButton';

export default function UsernameOnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [username, setUsername] = useState('');

  const handleNext = () => {
    if (!username.trim()) {
      Alert.alert(
        t('errors.general'),
        t('auth.login.usernameRequired')
      );
      return;
    }

    if (username.trim().length < 3) {
      Alert.alert(
        t('errors.general'),
        t('auth.login.usernameLength')
      );
      return;
    }

    // Passer à l'écran de sélection de personnage
    router.push({
      pathname: '/onboarding/character',
      params: { username: username.trim() }
    });
  };

  const handleSkip = () => {
    // Aller directement au login
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#0E1117', '#0E1117', '#661A59', '#0E1117', '#21101C']}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Skip Button */}
          <View style={styles.header}>
            <OnboardingButton
              title={t('onboarding.skip')}
              onPress={handleSkip}
              variant="ghost"
              style={styles.skipButton}
            />
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.iconGradient}
              >
                <Ionicons name="person-outline" size={60} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>
              {t('onboarding.username.title', 'Choisissez votre pseudo')}
            </Text>
            <Text style={styles.description}>
              {t('onboarding.username.description', 'Comment voulez-vous que vos amis vous appellent ?')}
            </Text>

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
                autoFocus
              />
            </View>

            <Text style={styles.hint}>
              {t('onboarding.username.hint', 'Votre pseudo sera visible par tous les joueurs')}
            </Text>
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <OnboardingButton
              title={t('onboarding.next')}
              onPress={handleNext}
              variant="primary"
              icon="chevron-right"
              iconPosition="right"
              disabled={!username.trim()}
            />
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  hint: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  navigation: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
});
