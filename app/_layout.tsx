import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/config/firebase';
import NotificationService from '@/services/notifications';
import { LanguageProvider } from '@/contexts/LanguageContext';
import {useAppsFlyer} from "@/hooks/useAppsFlyer";

export default function RootLayout() {
  useAppsFlyer();

  useEffect(() => {
    NotificationService.initialize();
  }, []);

  return (
    <LanguageProvider>
      <SafeAreaProvider>
        <PaperProvider>
          <AuthProvider>
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
