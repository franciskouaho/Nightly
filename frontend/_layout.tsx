import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { setupGlobalErrorHandlers } from './utils/errorHandler';
import { useEffect } from 'react';

// ... dans le composant de layout
export default function RootLayout() {
  useEffect(() => {
    // Configure global error handlers
    setupGlobalErrorHandlers();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
