import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import OnboardingSlide from '@/components/onboarding/OnboardingSlide';
import OnboardingButton from '@/components/onboarding/OnboardingButton';
import OnboardingPagination from '@/components/onboarding/OnboardingPagination';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ONBOARDING_SLIDES } from '@/constants/onboarding';

const { width } = Dimensions.get('window');

export default function SimpleOnboardingScreen() {
  const { t } = useTranslation();
  const {
    currentIndex,
    scrollX,
    slidesRef,
    handleNext,
    handlePrevious,
    handleSkip,
    handleFinish,
    handleViewableItemsChanged,
    viewabilityConfig,
  } = useOnboarding();

  const renderSlide = ({ item }: { item: typeof ONBOARDING_SLIDES[0] }) => (
    <View style={styles.slide}>
      <OnboardingSlide
        title={t(item.titleKey)}
        description={t(item.descriptionKey)}
        icon={item.icon}
        colors={item.colors}
      />
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <OnboardingPagination
        data={ONBOARDING_SLIDES}
        scrollX={scrollX}
        currentIndex={currentIndex}
      />
      
      <View style={styles.navigation}>
        {currentIndex > 0 && (
          <OnboardingButton
            title={t('onboarding.previous')}
            onPress={handlePrevious}
            variant="ghost"
            icon="chevron-left"
            iconPosition="left"
          />
        )}

        <OnboardingButton
          title={
            currentIndex === ONBOARDING_SLIDES.length - 1
              ? t('onboarding.start')
              : t('onboarding.next')
          }
          onPress={handleNext}
          variant="primary"
          icon={currentIndex === ONBOARDING_SLIDES.length - 1 ? 'rocket-launch' : 'chevron-right'}
          iconPosition="right"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#0E1117', '#0E1117', '#661A59', '#0E1117', '#21101C']}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
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

        {/* Slides */}
        <FlatList
          ref={slidesRef}
          data={ONBOARDING_SLIDES}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={32}
        />

        {/* Footer with pagination and navigation */}
        {renderFooter()}
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
  slide: {
    width,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
});
