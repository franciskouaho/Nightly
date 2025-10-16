import { useState, useRef } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  colors: string[];
}

export function useOnboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<any>(null);

  const onboardingSlides: OnboardingSlide[] = [
    {
      id: '1',
      title: 'Bienvenue sur Nightly',
      description: 'Découvrez une nouvelle façon de jouer en ligne avec vos amis',
      icon: 'gamepad-variant',
      colors: ['#667eea', '#764ba2'],
    },
    {
      id: '2',
      title: 'Jeux Multi-joueurs',
      description: 'Profitez de dizaines de jeux amusants à jouer ensemble',
      icon: 'account-group',
      colors: ['#f093fb', '#f5576c'],
    },
    {
      id: '3',
      title: 'Connectez-vous',
      description: 'Créez des salles privées et invitez vos amis à jouer',
      icon: 'account-heart',
      colors: ['#4facfe', '#00f2fe'],
    },
    {
      id: '4',
      title: 'Prêt à jouer ?',
      description: 'Commencez votre aventure gaming dès maintenant !',
      icon: 'rocket-launch',
      colors: ['#43e97b', '#38f9d7'],
    },
  ];

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      slidesRef.current?.scrollToIndex({ index: currentIndex - 1 });
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    try {
      // Marquer l'onboarding comme terminé
      await AsyncStorage.setItem('onboarding_completed', 'true');
      
      // Navigation vers l'écran principal ou de connexion
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'onboarding:', error);
      // Navigation de secours
      router.replace('/(auth)/login');
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('onboarding_completed');
      return completed === 'true';
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'onboarding:', error);
      return false;
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('onboarding_completed');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de l\'onboarding:', error);
    }
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return {
    onboardingSlides,
    currentIndex,
    setCurrentIndex,
    scrollX,
    slidesRef,
    handleNext,
    handlePrevious,
    handleSkip,
    handleFinish,
    checkOnboardingStatus,
    resetOnboarding,
    handleViewableItemsChanged,
    viewabilityConfig,
  };
}
