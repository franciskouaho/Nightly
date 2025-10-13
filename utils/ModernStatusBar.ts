import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

/**
 * Configuration moderne StatusBar pour Android 15
 * Remplace les API obsolètes React Native StatusBar
 */
export class ModernStatusBar {
  /**
   * Configure la StatusBar avec les nouvelles API Android 15
   * Remplace: StatusBar.setStatusBarColor, StatusBar.setNavigationBarColor
   */
  static configureForAndroid15() {
    if (Platform.OS === 'android') {
      // Configuration Edge-to-Edge moderne
      StatusBar.setStatusBarStyle('light', true);
      StatusBar.setBackgroundColor('transparent', true);
      StatusBar.setTranslucent(true);
    }
  }

  /**
   * Configure la StatusBar pour le thème Halloween
   */
  static configureHalloweenTheme() {
    if (Platform.OS === 'android') {
      StatusBar.setStatusBarStyle('light', true);
      StatusBar.setBackgroundColor('#2D1810', true); // Couleur Halloween
    }
  }

  /**
   * Configure la StatusBar transparente pour Edge-to-Edge
   */
  static configureTransparent() {
    if (Platform.OS === 'android') {
      StatusBar.setStatusBarStyle('light', true);
      StatusBar.setBackgroundColor('transparent', true);
      StatusBar.setTranslucent(true);
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
