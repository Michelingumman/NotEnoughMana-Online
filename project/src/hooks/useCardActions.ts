import { useCallback } from 'react';
import { Card, Player } from '../types/game';
import { useCombatActions } from './useCombatActions';
import { useGameStore } from '../store/gameStore';
import { GameStateManager } from '../lib/firebase/gameStateManager';

export function useCardActions(partyId: string) {
  const { party, currentPlayer } = useGameStore();
  const { resolveCardPlay } = useCombatActions();

  const playCard = useCallback(async (card: Card, targetId: string) => {
    if (!party || !currentPlayer) return;

    try {
      const target = party.players.find(p => p.id === targetId);
      if (!target) throw new Error('Target not found');

      const { updatedSource, updatedTarget } = resolveCardPlay(
        card,
        currentPlayer,
        target,
        party
      );

      await GameStateManager.applyCardEffect(partyId, currentPlayer.id, targetId, card);

      return { updatedSource, updatedTarget };
    } catch (error) {
      console.error('Error playing card:', error);
      throw error;
    }
  }, [party, currentPlayer, partyId, resolveCardPlay]);

  return { playCard };
}