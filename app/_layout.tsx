import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAppsFlyer } from "@/hooks/useAppsFlyer";
import { useIsHasUpdates } from "@/hooks/useIsHasUpdates";
import { usePostHog } from "@/hooks/usePostHog";
import { ExpoNotificationService } from "@/services/expoNotificationService";
import HalloweenNotificationScheduler from "@/services/halloweenNotificationScheduler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PostHogProvider } from 'posthog-react-native';
import { POSTHOG_CONFIG } from '@/config/posthog';

// Composant interne pour gérer PostHog
function AppContent() {
  useAppsFlyer();
  useIsHasUpdates();
  const { track } = usePostHog();

  useEffect(() => {
    // Initialiser les services de notifications
    const notificationService = ExpoNotificationService.getInstance();
    notificationService.initialize();
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
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="room/[id]" />
            </Stack>
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
      host={POSTHOG_CONFIG.host}
      options={POSTHOG_CONFIG.options}
    >
      <AppContent />
    </PostHogProvider>
  );
}
