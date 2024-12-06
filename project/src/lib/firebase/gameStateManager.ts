import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Party, Player } from '../../types/game';
import { GAME_CONFIG } from '../../config/gameConfig';
import { generateInitialCards } from '../../utils/cards';

export class GameStateManager {
  private static COLLECTION = 'parties';

  static async startGame(partyId: string): Promise<void> {
    const partyRef = doc(db, this.COLLECTION, partyId);

    await runTransaction(db, async (transaction) => {
      const partyDoc = await transaction.get(partyRef);
      if (!partyDoc.exists()) throw new Error('Party not found');

      const party = partyDoc.data() as Party;
      
      if (party.status !== 'waiting') {
        throw new Error('Game has already started');
      }

      if (party.players.length < 2) {
        throw new Error('Not enough players to start');
      }

      // Generate initial cards for all players
      const updatedPlayers = party.players.map(player => ({
        ...player,
        cards: generateInitialCards(),
        health: party.settings?.initialHealth ?? GAME_CONFIG.INITIAL_HEALTH,
        mana: party.settings?.initialMana ?? GAME_CONFIG.INITIAL_MANA
      }));

      // Randomly select first player
      const firstPlayer = updatedPlayers[Math.floor(Math.random() * updatedPlayers.length)];

      transaction.update(partyRef, {
        status: 'playing',
        currentTurn: firstPlayer.id,
        players: updatedPlayers,
        lastAction: {
          type: 'gameStart',
          playerId: firstPlayer.id,
          value: 0,
          timestamp: Date.now()
        }
      });
    });
  }

  static async updateGameState(partyId: string, updates: Partial<Party>): Promise<void> {
    const partyRef = doc(db, this.COLLECTION, partyId);

    await runTransaction(db, async (transaction) => {
      const partyDoc = await transaction.get(partyRef);
      if (!partyDoc.exists()) throw new Error('Party not found');

      transaction.update(partyRef, updates);
    });
  }

  static async applyCardEffect(
    partyId: string,
    playerId: string,
    targetId: string,
    card: any
  ): Promise<void> {
    const partyRef = doc(db, this.COLLECTION, partyId);

    await runTransaction(db, async (transaction) => {
      const partyDoc = await transaction.get(partyRef);
      if (!partyDoc.exists()) throw new Error('Party not found');

      const party = partyDoc.data() as Party;
      if (party.currentTurn !== playerId) throw new Error('Not player\'s turn');

      // Update logic will be implemented here
      transaction.update(partyRef, {
        lastAction: {
          type: card.effect.type,
          playerId,
          targetId,
          value: card.effect.value,
          timestamp: Date.now()
        }
      });
    });
  }
}