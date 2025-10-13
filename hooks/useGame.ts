import { useState, useEffect } from 'react';
import { getFirestore, doc, onSnapshot, updateDoc, getDoc, setDoc } from '@react-native-firebase/firestore';
import { GameState } from '@/types/gameTypes';

export function useGame<T extends GameState = GameState>(gameId: string) {
  const [gameState, setGameState] = useState<T | null>(() => {
    // Initialiser avec un état par défaut pour éviter les flashes
    return {
      phase: 'waiting',
      currentRound: 0,
      totalRounds: 3,
      targetPlayer: null,
      currentQuestion: null,
      answers: [],
      players: [],
      scores: {},
      theme: '',
      timer: null,
      questions: [],
      askedQuestionIds: [],
      history: {},
    } as T;
  });
  const db = getFirestore();

  useEffect(() => {
    if (!gameId) return;
    
    const unsubscribe = onSnapshot(doc(db, 'games', gameId), (docSnap) => {
      if (docSnap.exists()) {
        setGameState(docSnap.data() as T);
      }
    });

    return () => unsubscribe();
  }, [gameId]);

  const updateGameState = async (newState: Partial<T>) => {
    if (!gameId) return;
    try {
      const gameRef = doc(db, 'games', gameId);
      const snap = await getDoc(gameRef);
      if (!snap.exists()) {
        await setDoc(gameRef, {
          phase: 'LOADING',
          currentRound: 0,
          totalRounds: 3,
          targetPlayer: null,
          currentQuestion: null,
          answers: [],
          players: [],
          scores: {},
          theme: '',
          timer: null,
          questions: [],
          askedQuestionIds: [],
          history: {},
          ...newState
        });
      } else {
        // Fusionner les playerAnswers au lieu de les écraser
        const currentData = snap.data() as T;
        const mergedState = { ...newState };
        
        console.log('🔧 Fusion playerAnswers:', {
          newPlayerAnswers: newState.playerAnswers,
          currentPlayerAnswers: currentData.playerAnswers,
          hasNew: !!newState.playerAnswers,
          hasCurrent: !!currentData.playerAnswers
        });
        
        if (newState.playerAnswers) {
          mergedState.playerAnswers = {
            ...(currentData.playerAnswers || {}),
            ...newState.playerAnswers
          };
          console.log('🔧 Résultat fusion:', mergedState.playerAnswers);
        }
        
        await updateDoc(gameRef, mergedState as { [key: string]: any });
      }
    } catch (error) {
      console.error('Error updating game state:', error);
    }
  };

  return { gameState, updateGameState };
} 