import { useCallback } from 'react';
import { PartyManager } from '../lib/firebase/partyManager';
import { GameStateManager } from '../lib/firebase/gameStateManager';
import { Player, GameSettings } from '../types/game';

export function usePartyActions() {
  const createParty = useCallback(async (player: Pick<Player, 'id' | 'name'>) => {
    try {
      return await PartyManager.createParty(player, {
        maxHealth: 10,
        maxMana: 10,
        manaDrinkAmount: 3,
        initialHealth: 10,
        initialMana: 10,
        initialCardCount: 4
      });
    } catch (error) {
      console.error('Error creating party:', error);
      throw new Error('Failed to create party');
    }
  }, []);

  const joinParty = useCallback(async (partyId: string, player: Pick<Player, 'id' | 'name'>) => {
    try {
      await PartyManager.joinParty(partyId, player);
      return partyId;
    } catch (error) {
      console.error('Error joining party:', error);
      throw error;
    }
  }, []);

  const startGame = useCallback(async (partyId: string) => {
    try {
      await GameStateManager.startGame(partyId);
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }, []);

  const leaveParty = useCallback(async (partyId: string, playerId: string) => {
    try {
      await PartyManager.leaveParty(partyId, playerId);
    } catch (error) {
      console.error('Error leaving party:', error);
      throw error;
    }
  }, []);

  const updateGameSettings = useCallback(async (settings: GameSettings) => {
    try {
      await GameStateManager.updateGameState(settings.partyId!, {
        settings: {
          maxHealth: settings.maxHealth,
          maxMana: settings.maxMana,
          manaDrinkAmount: settings.manaDrinkAmount,
          initialHealth: settings.initialHealth,
          initialMana: settings.initialMana,
          initialCardCount: settings.initialCardCount
        }
      });
    } catch (error) {
      console.error('Error updating game settings:', error);
      throw error;
    }
  }, []);

  return {
    createParty,
    joinParty,
    startGame,
    leaveParty,
    updateGameSettings
  };
}