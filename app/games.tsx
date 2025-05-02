import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameType } from '@/types/gameTypes';
import GameSelector from '@/components/game/GameSelector';
import gameManager from '@/services/gameManager';

export default function GamesScreen() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGameSelect = async (gameType: GameType, mode: string) => {
    setIsLoading(true);
    
    try {
      // Utilise le gameManager pour rediriger vers le jeu sélectionné
      gameManager.navigateToGame(gameType, mode);
    } catch (error) {
      console.error('Erreur lors du démarrage du jeu:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#3498db', '#8e44ad']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Cosmic Quest</Text>
          <Text style={styles.subtitle}>Choisissez votre jeu</Text>
          
          <GameSelector onGameSelect={handleGameSelect} />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
}); 