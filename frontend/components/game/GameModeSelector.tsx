import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameType } from '@/types/gameTypes';
import gameManager, { GameModeConfig } from '@/services/gameManager';

interface GameModeSelectorProps {
  gameType: GameType;
  onSelectMode: (modeId: string) => void;
  selectedMode?: string;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ 
  gameType, 
  onSelectMode,
  selectedMode 
}) => {
  const modes = gameManager.getAvailableModes(gameType);
  
  // Vérifier si le mode "action-verite" devrait être ajouté (pour le jeu Action ou Vérité)
  const specialModes: GameModeConfig[] = [];
  if (gameType === GameType.TRUTH_OR_DARE) {
    specialModes.push({
      id: 'action-verite',
      name: 'Action ou Vérité',
      description: 'Mode classique avec pioches',
      icon: 'apps'
    });
  }
  
  // Combiner les modes standards avec les modes spéciaux
  const allModes = [...modes, ...specialModes];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisissez un mode de jeu</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {allModes.map(mode => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeCard,
              selectedMode === mode.id && styles.selectedCard
            ]}
            onPress={() => onSelectMode(mode.id as string)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={mode.icon as any} size={32} color="#fff" />
            </View>
            <Text style={styles.modeName}>{mode.name}</Text>
            <Text style={styles.modeDescription}>{mode.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollView: {
    paddingBottom: 8,
  },
  modeCard: {
    width: 150,
    height: 180,
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
  modeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modeDescription: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default GameModeSelector; 