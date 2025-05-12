import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/config/firebase';
import NotificationService from '@/services/notifications';
import { getSavedLanguage } from './i18n/i18n';

export default function RootLayout() {
  useEffect(() => {
    NotificationService.initialize();
    getSavedLanguage();
  }, []);

  return (
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
  );
}
