import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PaywallProvider } from "@/contexts/PaywallContext";
import { useAppsFlyer } from "@/hooks/useAppsFlyer";
import { useIsHasUpdates } from "@/hooks/useIsHasUpdates";
import { usePostHog } from "@/hooks/usePostHog";
import HalloweenNotificationScheduler from "@/services/halloweenNotificationScheduler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PostHogProvider } from 'posthog-react-native';
import { POSTHOG_CONFIG } from '@/config/posthog';
import { ModernStatusBar } from '@/utils/ModernStatusBar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import {
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import {
  Ubuntu_400Regular,
  Ubuntu_700Bold,
} from '@expo-google-fonts/ubuntu';
import {
  Raleway_400Regular,
  Raleway_700Bold,
} from '@expo-google-fonts/raleway';
import {
  Poppins_400Regular,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  Oswald_400Regular,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';
import {
  ArchivoBlack_400Regular,
} from '@expo-google-fonts/archivo-black';
import {
  Anton_400Regular,
} from '@expo-google-fonts/anton';
import {
  FredokaOne_400Regular,
} from '@expo-google-fonts/fredoka-one';
import {
  Bangers_400Regular,
} from '@expo-google-fonts/bangers';

// Empêcher l'auto-hide du splash screen
SplashScreen.preventAutoHideAsync();

// Composant interne pour gérer PostHog
function AppContent() {
  // Charger les polices
  const [fontsLoaded, fontError] = useFonts({
    'BebasNeue-Regular': BebasNeue_400Regular,
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-ExtraBold': Montserrat_800ExtraBold,
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Bold': Roboto_700Bold,
    'Ubuntu-Regular': Ubuntu_400Regular,
    'Ubuntu-Bold': Ubuntu_700Bold,
    'Raleway-Regular': Raleway_400Regular,
    'Raleway-Bold': Raleway_700Bold,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Bold': Poppins_700Bold,
    'Oswald-Regular': Oswald_400Regular,
    'Oswald-Bold': Oswald_700Bold,
    'ArchivoBlack-Regular': ArchivoBlack_400Regular,
    'Anton-Regular': Anton_400Regular,
    'FredokaOne-Regular': FredokaOne_400Regular,
    'Bangers-Regular': Bangers_400Regular,
  });

  // Cacher le splash screen quand les polices sont chargées
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useAppsFlyer();
  useIsHasUpdates();
  const { track } = usePostHog();

  // Ne pas rendre l'app si les polices ne sont pas chargées
  if (!fontsLoaded && !fontError) {
    return null;
  }

  useEffect(() => {
    // Configuration Android 15 Edge-to-Edge
    ModernStatusBar.configureForAndroid15();
    
    // Programmer les notifications Halloween pour octobre
    HalloweenNotificationScheduler.scheduleHalloweenNotifications();
    
    // Envoyer un événement de test PostHog
    setTimeout(() => {
      track.custom('app_initialized', {
        app_version: POSTHOG_CONFIG.options.appVersion,
        platform: 'react-native',
        timestamp: new Date().toISOString(),
      });
    }, 1000);
  }, [track]);

  return (
    <LanguageProvider>
      <SafeAreaProvider>
        <PaperProvider>
          <AuthProvider>
            <PaywallProvider config={{
              cooldownHours: 8, // 8 heures entre les affichages (3 fois par jour)
              maxPaywallBPerSession: 3, // Maximum 3 affichages par session
              // Les prix seront maintenant récupérés depuis RevenueCat
            }}>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="room/[id]" />
              </Stack>
            </PaywallProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </LanguageProvider>
  );
}

export default function RootLayout() {
  return (
    <PostHogProvider
      apiKey={POSTHOG_CONFIG.apiKey}
      options={{
        host: POSTHOG_CONFIG.host,
        ...POSTHOG_CONFIG.options,
      }}
      autocapture
    >
      <AppContent />
    </PostHogProvider>
  );
}