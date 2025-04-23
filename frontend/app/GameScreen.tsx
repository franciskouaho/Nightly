import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import GameTimer from '../components/game/GameTimer';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Socket } from 'socket.io-client';
import SocketService from '@/services/socketService';

// Pour éviter le problème de typage avec useLocalSearchParams
type GameScreenParams = {
  gameId?: string;
};

// Interface pour les données de mise à jour du jeu
interface GameUpdateData {
  timer?: {
    duration: number;
    startTime: number;
  };
  // Ajoutez d'autres propriétés selon vos besoins
}

const GameScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<GameScreenParams>();
  const [timerProps, setTimerProps] = useState<{ duration: number; startTime: number } | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    // Vérifier si gameId existe
    const gameId = params.gameId;
    if (!gameId) {
      console.error('ID de jeu non fourni dans les paramètres!');
      router.replace('/');
      return;
    }
    
    const initSocket = async () => {
      try {
        // Utiliser getInstanceAsync pour obtenir le socket
        const socketInstance = await SocketService.getInstanceAsync(true);
        setSocket(socketInstance);
        
        // Rejoindre le canal du jeu avec l'ID qui est maintenant sûrement défini
        await SocketService.joinGameChannel(gameId);
      } catch (error) {
        console.error('Erreur de connexion au socket:', error);
        router.replace('/');
      }
    };
    
    initSocket();
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (gameId) {
        SocketService.leaveGameChannel(gameId).catch(err => {
          console.error('Erreur lors de la sortie du canal:', err);
        });
      }
    };
  }, [params.gameId, router]);

  useEffect(() => {
    if (!socket) return;
    
    const handleGameUpdate = (data: GameUpdateData) => {
      console.log('🎮 Mise à jour du jeu reçue:', data);

      if (data.timer) {
        setTimerProps({
          duration: data.timer.duration,
          startTime: data.timer.startTime,
        });

        console.log(`⏱️ Timer reçu: ${data.timer.duration}s`);
      }
    };

    socket.on('game:update', handleGameUpdate);

    return () => {
      socket.off('game:update', handleGameUpdate);
    };
  }, [socket]);

  return (
    <View style={styles.container}>
      {timerProps && (
        <View style={styles.timerWrapper}>
          <GameTimer
            duration={timerProps.duration}
            startTime={timerProps.startTime}
            onComplete={() => console.log('Temps écoulé!')}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerWrapper: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
    zIndex: 10,
  },
});

export default GameScreen;