import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  colors: string[];
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const onboardingSlides: OnboardingSlide[] = [
    {
      id: '1',
      title: t('onboarding.welcome.title', 'Bienvenue sur Nightly'),
      description: t('onboarding.welcome.description', 'Découvrez une nouvelle façon de jouer en ligne avec vos amis'),
      icon: 'gamepad-variant',
      colors: ['#667eea', '#764ba2'],
    },
    {
      id: '2',
      title: t('onboarding.games.title', 'Jeux Multi-joueurs'),
      description: t('onboarding.games.description', 'Profitez de dizaines de jeux amusants à jouer ensemble'),
      icon: 'account-group',
      colors: ['#f093fb', '#f5576c'],
    },
    {
      id: '3',
      title: t('onboarding.social.title', 'Connectez-vous'),
      description: t('onboarding.social.description', 'Créez des salles privées et invitez vos amis à jouer'),
      icon: 'account-heart',
      colors: ['#4facfe', '#00f2fe'],
    },
    {
      id: '4',
      title: t('onboarding.ready.title', 'Prêt à jouer ?'),
      description: t('onboarding.ready.description', 'Commencez votre aventure gaming dès maintenant !'),
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

  const handleFinish = () => {
    // Navigation vers l'écran principal ou de connexion
    router.replace('/(auth)/login');
  };

  const handleSkip = () => {
    handleFinish();
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, -50],
    });

    return (
      <View style={styles.slide}>
        <Animated.View
          style={[
            styles.slideContent,
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={item.colors}
              style={styles.iconGradient}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={80}
                color="#fff"
              />
            </LinearGradient>
          </View>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {onboardingSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#0E1117', '#0E1117', '#661A59', '#0E1117', '#21101C']}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>
            {t('onboarding.skip', 'Passer')}
          </Text>
        </TouchableOpacity>

        {/* Slides */}
        <FlatList
          ref={slidesRef}
          data={onboardingSlides}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={32}
        />

        {/* Pagination */}
        {renderPagination()}

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          {currentIndex > 0 && (
            <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
              <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
              <Text style={styles.previousText}>
                {t('onboarding.previous', 'Précédent')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>
              {currentIndex === onboardingSlides.length - 1
                ? t('onboarding.start', 'Commencer')
                : t('onboarding.next', 'Suivant')}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
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
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
  },
  previousText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#667eea',
    borderRadius: 25,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
