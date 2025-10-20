import { Platform, StatusBar as RNStatusBar } from 'react-native';

/**
 * Configuration moderne StatusBar pour Android 15
 * Utilise l'API React Native StatusBar native
 */
export class ModernStatusBar {
  /**
   * Configure la StatusBar avec les nouvelles API Android 15
   * Utilise l'API React Native StatusBar native
   */
  static configureForAndroid15() {
    if (Platform.OS === 'android') {
      // Configuration Edge-to-Edge moderne
      RNStatusBar.setBarStyle('light-content', true);
      RNStatusBar.setBackgroundColor('transparent', true);
      RNStatusBar.setTranslucent(true);
    }
  }

  /**
   * Configure la StatusBar pour le thème Halloween
   */
  static configureHalloweenTheme() {
    if (Platform.OS === 'android') {
      RNStatusBar.setBarStyle('light-content', true);
      RNStatusBar.setBackgroundColor('#2D1810', true); // Couleur Halloween
    }
  }

  /**
   * Configure la StatusBar transparente pour Edge-to-Edge
   */
  static configureTransparent() {
    if (Platform.OS === 'android') {
      RNStatusBar.setBarStyle('light-content', true);
      RNStatusBar.setBackgroundColor('transparent', true);
      RNStatusBar.setTranslucent(true);
    }
  }
}

/**
 * Hook pour utiliser la configuration StatusBar moderne
 */
export const useModernStatusBar = (theme: 'halloween' | 'transparent' | 'default' = 'default') => {
  const configureStatusBar = () => {
    switch (theme) {
      case 'halloween':
        ModernStatusBar.configureHalloweenTheme();
        break;
      case 'transparent':
        ModernStatusBar.configureTransparent();
        break;
      default:
        ModernStatusBar.configureForAndroid15();
        break;
    }
  };

  return { configureStatusBar };
};
