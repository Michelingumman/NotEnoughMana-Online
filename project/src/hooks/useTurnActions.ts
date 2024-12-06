import { useCallback } from 'react';
import { TurnManager } from '../utils/turnManager';
import { GameStateManager } from '../lib/firebase/gameStateManager';
import { useGameStore } from '../store/gameStore';

export function useTurnActions(partyId: string) {
  const { party, currentPlayer } = useGameStore();
  const turnManager = new TurnManager();

  const startTurn = useCallback(async () => {
    if (!party || !currentPlayer) return;

    const updatedPlayer = turnManager.startTurn(currentPlayer);
    await GameStateManager.updateGameState(partyId, {
      players: party.players.map(p => 
        p.id === currentPlayer.id ? updatedPlayer : p
      )
    });
  }, [party, currentPlayer, partyId]);

  const endTurn = useCallback(async () => {
    if (!party || !currentPlayer) return;

    const updatedPlayer = turnManager.endTurn(currentPlayer);
    const nextTurn = turnManager.calculateNextTurn(party);

    await GameStateManager.updateGameState(partyId, {
      players: party.players.map(p => 
        p.id === currentPlayer.id ? updatedPlayer : p
      ),
      currentTurn: nextTurn
    });
  }, [party, currentPlayer, partyId]);

  return { startTurn, endTurn };
}