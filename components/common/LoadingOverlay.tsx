import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface LoadingOverlayProps {
  message?: string;
  showSpinner?: boolean;
}

export default function LoadingOverlay({ message = 'Chargement...', showSpinner = true }: LoadingOverlayProps) {
  return (
    <View style={styles.container}>
      {showSpinner && <ActivityIndicator size="large" color="#5d6dff" />}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
}); 