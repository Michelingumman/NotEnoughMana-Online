import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Party, Card } from '../../types/game';
import { GAME_CONFIG } from '../../config/gameConfig';
import { generateInitialCards } from '../../utils/cards';
import { CombatResolver } from '../../utils/combatResolver';

export class GameStateManager {
  private static COLLECTION = 'parties';
  private static combatResolver = new CombatResolver();

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
        mana: party.settings?.initialMana ?? GAME_CONFIG.INITIAL_MANA,
        effects: []
      }));

      // Randomly select first player
      const firstPlayer = updatedPlayers[Math.floor(Math.random() * updatedPlayers.length)];

      const updates = {
        status: 'playing' as const,
        currentTurn: firstPlayer.id,
        players: updatedPlayers,
        lastAction: {
          type: 'gameStart',
          playerId: firstPlayer.id,
          value: 0,
          timestamp: Date.now()
        }
      };

      transaction.update(partyRef, updates);
    });
  }

  static async applyCardEffect(
    partyId: string, 
    playerId: string, 
    targetId: string, 
    card: Card
  ): Promise<void> {
    const partyRef = doc(db, this.COLLECTION, partyId);

    await runTransaction(db, async (transaction) => {
      const partyDoc = await transaction.get(partyRef);
      if (!partyDoc.exists()) throw new Error('Party not found');

      const party = partyDoc.data() as Party;
      if (party.currentTurn !== playerId) throw new Error('Not player\'s turn');

      const updatedPlayers = [...party.players];
      const player = updatedPlayers.find(p => p.id === playerId);
      const target = updatedPlayers.find(p => p.id === targetId);

      if (!player || !target) throw new Error('Player or target not found');
      if (player.health <= 0) throw new Error('Dead players cannot play cards');
      if (player.mana < card.manaCost) throw new Error('Not enough mana');

      // Apply combat effects
      const result = this.combatResolver.resolveCardEffect(
        card,
        player,
        target,
        party.settings?.maxHealth ?? GAME_CONFIG.MAX_HEALTH,
        party.settings?.maxMana ?? GAME_CONFIG.MAX_MANA
      );

      // Update player states
      const playerIndex = updatedPlayers.findIndex(p => p.id === playerId);
      const targetIndex = updatedPlayers.findIndex(p => p.id === targetId);
      updatedPlayers[playerIndex] = result.source;
      updatedPlayers[targetIndex] = result.target;

      // Calculate next turn
      const alivePlayers = updatedPlayers.filter(p => p.health > 0);
      const status = alivePlayers.length <= 1 ? 'finished' : 'playing';
      const currentIndex = updatedPlayers.findIndex(p => p.id === playerId);
      const nextIndex = (currentIndex + 1) % updatedPlayers.length;
      const nextPlayerId = updatedPlayers[nextIndex]?.id || playerId;

      transaction.update(partyRef, {
        players: updatedPlayers,
        status,
        currentTurn: nextPlayerId,
        lastAction: {
          type: card.effect.type,
          playerId,
          targetId,
          value: card.effect.value,
          timestamp: Date.now(),
          cardId: card.id
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
}