import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="game" />
          <Stack.Screen name="room" />
          <Stack.Screen name="splash" />
          <Stack.Screen name="joint-salle" />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  );
}
