import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useEffect } from 'react';

/**
 * Configuration moderne pour StatusBar compatible Android 15
 * Remplace les API obsolètes: getStatusBarColor, setStatusBarColor, setNavigationBarColor
 */
export const configureStatusBar = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Configuration moderne pour Android 15 Edge-to-Edge
      StatusBar.setStatusBarStyle('light', true);
      StatusBar.setBackgroundColor('transparent', true);
    }
  }, []);
};

/**
 * Configuration Edge-to-Edge pour Android 15
 * Gère les encarts (notch, barre de navigation) automatiquement
 */
export const configureEdgeToEdge = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Configuration automatique des encarts
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent', true);
    }
  }, []);
};
