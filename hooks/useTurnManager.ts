import { useMemo } from 'react';

export interface Player {
  id: string;
  name: string;
  [key: string]: any;
}

export type TurnOrder = 'sequential' | 'random';

export function useTurnManager(players: Player[], currentTurnIndex: number, order: TurnOrder = 'sequential') {
  // Génère l'ordre des joueurs (mémorisé)
  const turnOrder = useMemo(() => {
    const indices = players.map((_, i) => i).filter(i => typeof i === 'number');
    if (order === 'random') {
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tempI = typeof indices[i] === 'number' ? indices[i] : 0;
        const tempJ = typeof indices[j] === 'number' ? indices[j] : 0;
        indices.splice(Math.max(0, Number(i)), 1, tempJ);
        indices.splice(Math.max(0, Number(j)), 1, tempI);
      }
    }
    return indices;
  }, [players, order]);

  // Joueur courant
  const currentPlayer = useMemo(() => {
    if (!players.length) return null;
    const idx = currentTurnIndex % players.length;
    const playerIndex = turnOrder[idx] !== undefined ? Number(turnOrder[idx]) : 0;
    if (!Number.isInteger(playerIndex) || playerIndex < 0 || playerIndex >= players.length) {
      return players[0];
    }
    return players[playerIndex];
  }, [players, currentTurnIndex, turnOrder]);

  // Index du prochain tour
  const getNextTurnIndex = () => {
    if (!players.length) return 0;
    return (currentTurnIndex + 1) % players.length;
  };

  // Est-ce le tour de ce joueur ?
  const isPlayerTurn = (playerId: string) => {
    return currentPlayer?.id === playerId;
  };

  // Ordre complet
  const getOrder = () => turnOrder.map(i => players[i]).filter(Boolean);

  return {
    currentPlayer,
    getNextTurnIndex,
    isPlayerTurn,
    getOrder,
    turnOrder,
  };
}

/**
 * Example usage:
 *
 * import { useTurnManager } from '@/hooks/useTurnManager';
 *
 * const { currentPlayer, getNextTurnIndex, isPlayerTurn, getOrder } = useTurnManager(players, currentTurnIndex, 'sequential');
 */ 