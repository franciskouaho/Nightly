import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameType } from '@/types/gameTypes';
import gameManager, { GameConfig } from '@/services/gameManager';
import GameModeSelector from './GameModeSelector';

interface GameSelectorProps {
  onGameSelect: (gameType: GameType, mode: string) => void;
}

const GameSelector: React.FC<GameSelectorProps> = ({ onGameSelect }) => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const games = gameManager.getAvailableGames();
  
  const handleGameSelect = async (gameType: GameType) => {
    // Si c'est Action ou Vérité, créer directement la salle
    if (gameType === GameType.TRUTH_OR_DARE) {
      setIsLoading(true);
      try {
        await gameManager.navigateToGame(gameType);
      } catch (error) {
        console.error('Erreur lors de la création de la salle:', error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Pour les autres jeux, comportement normal
    setSelectedGame(gameType);
    setSelectedMode(null);
  };
  
  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
  };
  
  const handleStartGame = () => {
    if (selectedGame && selectedMode) {
      onGameSelect(selectedGame, selectedMode);
    }
  };
  
  const renderItem = ({ item }: { item: GameConfig }) => (
    <TouchableOpacity
      style={[
        styles.gameCard,
        selectedGame === item.id && styles.selectedCard
      ]}
      onPress={() => handleGameSelect(item.id)}
      disabled={isLoading}
    >
      <View style={styles.iconContainer}>
        {isLoading && item.id === GameType.TRUTH_OR_DARE ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Ionicons name={item.icon as any} size={32} color="#fff" />
        )}
      </View>
      <Text style={styles.gameName}>{item.name}</Text>
      <Text style={styles.gameDescription}>{item.description}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisissez un jeu</Text>
      
      <FlatList
        data={games}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gameList}
      />
      
      {selectedGame && selectedGame !== GameType.TRUTH_OR_DARE && (
        <GameModeSelector
          gameType={selectedGame}
          onSelectMode={handleModeSelect}
          selectedMode={selectedMode || undefined}
        />
      )}
      
      {selectedGame && selectedMode && selectedGame !== GameType.TRUTH_OR_DARE && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartGame}
        >
          <Text style={styles.startButtonText}>Commencer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  gameList: {
    paddingVertical: 8,
  },
  gameCard: {
    width: 160,
    height: 200,
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#2ecc71',
    borderWidth: 2,
    borderColor: '#fff',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  gameDescription: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  startButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GameSelector; 