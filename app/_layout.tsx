import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAppsFlyer } from "@/hooks/useAppsFlyer";
import { useIsHasUpdates } from "@/hooks/useIsHasUpdates";
import { ExpoNotificationService } from "@/services/expoNotificationService";
import HalloweenNotificationScheduler from "@/services/halloweenNotificationScheduler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  useAppsFlyer();
  useIsHasUpdates();

  useEffect(() => {
    // Initialiser les services de notifications
    const notificationService = ExpoNotificationService.getInstance();
    notificationService.initialize();
    // Programmer les notifications Halloween pour octobre
    HalloweenNotificationScheduler.scheduleHalloweenNotifications();
  }, []);

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
