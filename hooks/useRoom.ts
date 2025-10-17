import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  getFirestore, 
  getDoc, 
  setDoc 
} from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GAME_CONFIG } from '@/constants/room';
import { Room, LocalPlayer } from '@/types/room';
import { GamePhase } from '@/types/gameTypes';
import { transformQuestion as transformTrapAnswerQuestion } from '@/app/game/data/trap-answer-questions';
import { transformQuestion as transformWordGuessingQuestion } from '@/app/game/data/word-guessing-questions';
import { transformQuestion as transformNeverHaveIEverHotQuestion } from '@/app/game/data/never-have-i-ever-hot-questions';
import { transformQuestion as transformListenButDontJudgeQuestion } from '@/app/game/data/listen-but-don-t-judge-questions';

export function useRoom(roomId: string) {
  const { user } = useAuth();
  const { getGameContent } = useLanguage();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStartingGame, setIsStartingGame] = useState(false);

  // Écouter les changements de la salle
  useEffect(() => {
    if (!roomId) return;

    const db = getFirestore();
    const roomRef = doc(db, 'rooms', roomId);
    
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const roomData = docSnap.data() as Room;
        setRoom(roomData);
        console.log('[DEBUG ROOM] roomData:', roomData);
        console.log('[DEBUG ROOM] Statut:', roomData.status, 'gameDocId:', roomData.gameDocId, 'gameMode:', roomData.gameMode);
        
        // Rediriger vers le jeu si le statut est "playing"
        if (roomData.status === 'playing' && roomData.gameDocId) {
          console.log('[DEBUG] Redirection vers le jeu:', roomData.gameMode, roomData.gameDocId);
          router.replace(`/game/${roomData.gameMode}/${roomData.gameDocId}`);
        }
      } else {
        Alert.alert('Erreur', 'Cette salle n\'existe pas');
        router.back();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [roomId]);

  // Vérifier si le nombre minimum de joueurs est atteint
  const canStartGame = (gameId: string, playersCount: number): boolean => {
    const config = GAME_CONFIG[gameId as keyof typeof GAME_CONFIG];
    return config && playersCount >= config.minPlayers;
  };

  // Démarrer le jeu
  const startGame = async (): Promise<void> => {
    if (!room || !user || isStartingGame) return;

    setIsStartingGame(true);
    
    try {
      const db = getFirestore();
      const roomRef = doc(db, 'rooms', room.id);
      
      // Vérifier les conditions de démarrage
      if (!canStartGame(room.gameId, room.players.length)) {
        const config = GAME_CONFIG[room.gameId as keyof typeof GAME_CONFIG];
        Alert.alert(
          'Impossible de démarrer',
          `Il faut au moins ${config?.minPlayers || 2} joueurs pour commencer ce jeu`
        );
        return;
      }

      // Vérifier que tous les joueurs sont prêts
      const allPlayersReady = room.players.every(player => player.isReady);
      if (!allPlayersReady) {
        Alert.alert('Impossible de démarrer', 'Tous les joueurs doivent être prêts');
        return;
      }

      // Créer le document de jeu
      const gameData = {
        gameId: room.gameId,
        gameMode: room.gameMode || room.gameId,
        players: room.players.map(player => ({
          id: player.id,
          name: player.name,
          username: player.username,
          displayName: player.displayName,
          avatar: player.avatar,
          isHost: player.isHost,
          isReady: player.isReady,
          level: player.level
        })),
        status: 'waiting',
        phase: GamePhase.WAITING,
        createdAt: new Date().toISOString(),
        host: room.host,
        currentRound: 1,
        totalRounds: 5,
        scores: {},
        gameStartTime: new Date().toISOString()
      };

      // Ajouter des données spécifiques au jeu
      if (room.gameId === 'two-letters-one-word') {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const firstLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        let secondLetter: string;
        do {
          secondLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        } while (secondLetter === firstLetter);
        
        gameData.letters = [firstLetter, secondLetter];
        gameData.theme = 'un objet';
      }

      // Créer le document de jeu
      const gameRef = await setDoc(doc(db, 'games', room.id), gameData);
      
      // Mettre à jour la salle avec l'ID du jeu
      await updateDoc(roomRef, {
        gameDocId: room.id,
        status: 'playing'
      });

      // Initialiser la première question pour certains jeux
      await initializeFirstQuestion(room.gameId, room.id);

    } catch (error) {
      console.error('Erreur lors du démarrage du jeu:', error);
      Alert.alert('Erreur', 'Impossible de démarrer le jeu');
    } finally {
      setIsStartingGame(false);
    }
  };

  // Initialiser la première question pour certains jeux
  const initializeFirstQuestion = async (gameId: string, gameDocId: string): Promise<void> => {
    try {
      const gameContent = await getGameContent(gameId);
      if (!gameContent?.questions?.length) return;

      const firstQuestion = gameContent.questions[0];
      let transformedFirstQuestion;

      switch (gameId) {
        case 'word-guessing':
          transformedFirstQuestion = transformWordGuessingQuestion(firstQuestion, 0);
          break;
        case 'trap-answer':
          transformedFirstQuestion = transformTrapAnswerQuestion(firstQuestion, 0);
          break;
        case 'never-have-i-ever-hot':
          transformedFirstQuestion = transformNeverHaveIEverHotQuestion(firstQuestion, 0);
          break;
        case 'listen-but-don-t-judge':
          transformedFirstQuestion = transformListenButDontJudgeQuestion(firstQuestion, 0);
          break;
        default:
          console.warn(`Utilisation de la transformation de question générique pour: ${gameId}`);
          transformedFirstQuestion = { ...firstQuestion, id: `q_0` };
          break;
      }

      const db = getFirestore();
      const gameRef = doc(db, 'games', gameDocId);
      
      await updateDoc(gameRef, {
        currentQuestion: transformedFirstQuestion,
        phase: GamePhase.QUESTION
      });

      console.log('[DEBUG] Démarrage du jeu', gameId, '- Phase Question/Action');

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la première question:', error);
    }
  };

  // Toggle le statut "prêt" d'un joueur
  const togglePlayerReady = async (): Promise<void> => {
    if (!room || !user) return;

    try {
      const db = getFirestore();
      const roomRef = doc(db, 'rooms', room.id);
      
      const updatedPlayers = room.players.map(player => 
        player.id === user.uid 
          ? { ...player, isReady: !player.isReady }
          : player
      );

      await updateDoc(roomRef, {
        players: updatedPlayers
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      Alert.alert('Erreur', 'Impossible de changer votre statut');
    }
  };

  return {
    room,
    loading,
    isStartingGame,
    canStartGame: (gameId: string) => canStartGame(gameId, room?.players.length || 0),
    startGame,
    togglePlayerReady,
    isHost: user?.uid === room?.host,
    isPlayerReady: room?.players.find(p => p.id === user?.uid)?.isReady || false
  };
}
