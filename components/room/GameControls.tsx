import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import RoundedButton from '@/components/RoundedButton';
import { Room } from '@/types/room';
import { GAME_CONFIG } from '@/constants/room';

interface GameControlsProps {
  room: Room;
  isHost: boolean;
  isPlayerReady: boolean;
  canStartGame: boolean;
  onToggleReady: () => void;
  onStartGame: () => void;
}

export default function GameControls({ 
  room, 
  isHost, 
  isPlayerReady, 
  canStartGame,
  onToggleReady, 
  onStartGame 
}: GameControlsProps) {
  const handleStartGame = () => {
    if (!canStartGame) {
      const config = GAME_CONFIG[room.gameId as keyof typeof GAME_CONFIG];
      Alert.alert(
        'Impossible de démarrer',
        `Il faut au moins ${config?.minPlayers || 2} joueurs pour commencer ce jeu`
      );
      return;
    }

    const allPlayersReady = room.players.every(player => player.isReady);
    if (!allPlayersReady) {
      Alert.alert('Impossible de démarrer', 'Tous les joueurs doivent être prêts');
      return;
    }

    onStartGame();
  };

  return (
    <View style={styles.controlsContainer}>
      {!isHost ? (
        <RoundedButton
          title={isPlayerReady ? "Prêt ✓" : "Se préparer"}
          onPress={onToggleReady}
          style={[
            styles.readyButton,
            isPlayerReady && styles.readyButtonActive
          ]}
          textStyle={styles.readyButtonText}
        />
      ) : (
        <RoundedButton
          title="Démarrer le jeu"
          onPress={handleStartGame}
          style={[
            styles.startButton,
            !canStartGame && styles.startButtonDisabled
          ]}
          textStyle={styles.startButtonText}
          disabled={!canStartGame}
        />
      )}
      
      <Text style={styles.helpText}>
        {isHost 
          ? `${room.players.length}/${GAME_CONFIG[room.gameId as keyof typeof GAME_CONFIG]?.minPlayers || 2} joueurs minimum`
          : 'Appuyez sur "Se préparer" quand vous êtes prêt'
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  readyButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  readyButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  readyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#A259FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonDisabled: {
    backgroundColor: 'rgba(162, 89, 255, 0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
});
