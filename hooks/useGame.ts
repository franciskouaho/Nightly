import { useState, useEffect } from 'react';
import { getFirestore, doc, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { GameState } from '@/types/gameTypes';

export function useGame(gameId: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'games', gameId), (doc) => {
      if (doc.exists()) {
        setGameState(doc.data() as GameState);
      }
    });

    return () => unsubscribe();
  }, [gameId]);

  const updateGameState = async (newState: Partial<GameState>) => {
    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, newState as { [key: string]: any });
    } catch (error) {
      console.error('Error updating game state:', error);
    }
  };

  return { gameState, updateGameState };
} 