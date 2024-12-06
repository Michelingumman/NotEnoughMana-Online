import { useCallback } from 'react';
import { doc, collection, runTransaction, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Party, Player, GameSettings } from '../types/game';
import { generatePartyCode } from '../utils/party';
import { generateInitialCards } from '../utils/cards';
import { GAME_CONFIG } from '../config/gameConfig';

interface PlayerInput {
  id: string;
  name: string;
}

export function usePartyActions() {
  const createParty = useCallback(async (player: PlayerInput) => {
    const partyRef = doc(collection(db, 'parties'));
    
    try {
      const initialPlayer: Player = {
        ...player,
        health: GAME_CONFIG.INITIAL_HEALTH,
        mana: GAME_CONFIG.INITIAL_MANA,
        cards: generateInitialCards(),
        isLeader: true,
        effects: []
      };

      const partyData: Omit<Party, 'id'> = {
        code: generatePartyCode(),
        status: 'waiting',
        players: [initialPlayer],
        currentTurn: player.id,
        leaderId: player.id,
        settings: {
            maxHealth: GAME_CONFIG.MAX_HEALTH,
            maxMana: GAME_CONFIG.MAX_MANA,
            manaDrinkAmount: GAME_CONFIG.MANA_DRINK_AMOUNT,
            initialHealth: GAME_CONFIG.INITIAL_HEALTH,
            initialMana: GAME_CONFIG.INITIAL_MANA,
            initialCardCount: GAME_CONFIG.INITIAL_CARD_COUNT, // Add this line
        },
        createdAt: Date.now()
    };
    

      await runTransaction(db, async (transaction) => {
        transaction.set(partyRef, partyData);
      });

      return partyRef.id;
    } catch (error) {
      console.error('Error creating party:', error);
      throw new Error('Failed to create party');
    }
  }, []);

  const joinParty = useCallback(async (partyId: string, player: PlayerInput) => {
    const partyRef = doc(db, 'parties', partyId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const partyDoc = await transaction.get(partyRef);
        if (!partyDoc.exists()) throw new Error('Party not found');

        const party = partyDoc.data() as Party;
        if (party.status !== 'waiting') throw new Error('Game has already started');
        if (party.players.some(p => p.id === player.id)) throw new Error('Already in party');

        const newPlayer: Player = {
          ...player,
          health: party.settings?.initialHealth ?? GAME_CONFIG.INITIAL_HEALTH,
          mana: party.settings?.initialMana ?? GAME_CONFIG.INITIAL_MANA,
          cards: generateInitialCards(),
          isLeader: false,
          effects: []
        };

        transaction.update(partyRef, {
          players: [...party.players, newPlayer]
        });
      });

      return partyId;
    } catch (error) {
      console.error('Error joining party:', error);
      throw error;
    }
  }, []);

  const leaveParty = useCallback(async (partyId: string, playerId: string) => {
    const partyRef = doc(db, 'parties', partyId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const partyDoc = await transaction.get(partyRef);
        if (!partyDoc.exists()) return;

        const party = partyDoc.data() as Party;
        const isLeader = party.leaderId === playerId;
        
        if (isLeader) {
          await deleteDoc(partyRef);
        } else {
          const updatedPlayers = party.players.filter(p => p.id !== playerId);
          
          if (party.currentTurn === playerId) {
            const currentIndex = party.players.findIndex(p => p.id === playerId);
            const nextPlayer = party.players[(currentIndex + 1) % party.players.length];
            transaction.update(partyRef, {
              players: updatedPlayers,
              currentTurn: nextPlayer.id
            });
          } else {
            transaction.update(partyRef, {
              players: updatedPlayers
            });
          }
        }
      });
    } catch (error) {
      console.error('Error leaving party:', error);
      throw error;
    }
  }, []);

  const startGame = useCallback(async (partyId: string) => {
    const partyRef = doc(db, 'parties', partyId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const partyDoc = await transaction.get(partyRef);
        if (!partyDoc.exists()) throw new Error('Party not found');

        const party = partyDoc.data() as Party;
        if (party.status !== 'waiting') throw new Error('Game already started');
        if (party.players.length < 2) throw new Error('Not enough players');

        const firstPlayer = party.players[Math.floor(Math.random() * party.players.length)];

        transaction.update(partyRef, {
          status: 'playing',
          currentTurn: firstPlayer.id
        });
      });
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }, []);

  const updateGameSettings = useCallback(async (settings: GameSettings) => {
    if (!settings.partyId) return;
    
    const partyRef = doc(db, 'parties', settings.partyId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const partyDoc = await transaction.get(partyRef);
        if (!partyDoc.exists()) throw new Error('Party not found');

        const party = partyDoc.data() as Party;
        if (party.status !== 'waiting') throw new Error('Cannot update settings after game start');

        transaction.update(partyRef, { settings });
      });
    } catch (error) {
      console.error('Error updating settings:', error);
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