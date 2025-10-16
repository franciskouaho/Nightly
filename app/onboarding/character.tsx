import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import OnboardingButton from '@/components/onboarding/OnboardingButton';

const profils: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Frenard.png?alt=media&token=139ed01b-46f2-4f3e-9305-459841f2a893",
  "https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Fchat.png?alt=media&token=0c852d5b-1a14-4b8a-8926-78a7c88c0695",
  "https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Fgrenouille.png?alt=media&token=8257acb0-bcf7-4e30-a7cf-5ddf44e6da01",
  "https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Foiseau.png?alt=media&token=5a9a9e36-1651-4461-8702-d7bc8d516423",
];

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export default function CharacterOnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const [selectedProfile, setSelectedProfile] = useState(profils[0]);

  const handleNext = () => {
    if (!username) {
      router.back();
      return;
    }

    // Passer au login avec les informations
    router.push({
      pathname: '/(auth)/login',
      params: { 
        username: username,
        selectedProfile: selectedProfile 
      }
    });
  };

  const handlePrevious = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#0E1117', '#0E1117', '#661A59', '#0E1117', '#21101C']}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <OnboardingButton
              title={t('onboarding.previous')}
              onPress={handlePrevious}
              variant="ghost"
              icon="chevron-left"
              iconPosition="left"
              style={styles.backButton}
            />
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.iconGradient}
              >
                <Ionicons name="happy-outline" size={60} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>
              {t('onboarding.character.title', 'Choisissez votre personnage')}
            </Text>
            <Text style={styles.description}>
              {t('onboarding.character.description', 'Sélectionnez un avatar qui vous représente !')}
            </Text>

            {/* Username Display */}
            <View style={styles.usernameContainer}>
              <Text style={styles.usernameLabel}>
                {t('onboarding.character.yourUsername', 'Votre pseudo')}
              </Text>
              <Text style={styles.usernameText}>{username}</Text>
            </View>

            {/* Character Selection */}
            <View style={styles.characterSection}>
              <Text style={styles.characterTitle}>
                {t('auth.login.selectCharacter')}
              </Text>
              <Text style={styles.characterSubtitle}>
                {t('auth.login.characterDescription')}
              </Text>

              {chunkArray(profils, 2).map((row: string[], rowIdx: number) => (
                <View style={styles.charactersRow} key={rowIdx}>
                  {row.map((img: string, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedProfile(img)}
                      style={styles.characterContainer}
                    >
                      <Image
                        source={{ uri: img }}
                        style={[
                          styles.characterImg,
                          selectedProfile === img && styles.characterImgSelected,
                        ]}
                      />
                      {selectedProfile === img && (
                        <View style={styles.selectedIndicator}>
                          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            {/* Selected Character Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>
                {t('onboarding.character.preview', 'Aperçu')}
              </Text>
              <View style={styles.preview}>
                <Image
                  source={{ uri: selectedProfile }}
                  style={styles.previewImage}
                />
                <Text style={styles.previewText}>{username}</Text>
              </View>
            </View>
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <OnboardingButton
              title={t('onboarding.finish', 'Terminer')}
              onPress={handleNext}
              variant="primary"
              icon="checkmark"
              iconPosition="right"
            />
          </View>
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 30,
  },
  usernameContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  usernameLabel: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 5,
  },
  usernameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  characterSection: {
    marginBottom: 30,
  },
  characterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  characterSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 20,
    textAlign: 'center',
  },
  charactersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  characterContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  characterImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  characterImgSelected: {
    borderColor: '#4CAF50',
    transform: [{ scale: 1.1 }],
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 2,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  preview: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  navigation: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
});
