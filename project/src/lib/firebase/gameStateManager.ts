import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { Party, Player, Card } from '../../types/game';
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
        cards: generateInitialCards()
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
    card: Card
  ): Promise<void> {
    const partyRef = doc(db, this.COLLECTION, partyId);

    await runTransaction(db, async (transaction) => {
      const partyDoc = await transaction.get(partyRef);
      if (!partyDoc.exists()) throw new Error('Party not found');

      const party = partyDoc.data() as Party;
      if (party.currentTurn !== playerId) throw new Error('Not player\'s turn');

      const updatedPlayers = [...party.players];
      const playerIndex = updatedPlayers.findIndex(p => p.id === playerId);
      const targetIndex = updatedPlayers.findIndex(p => p.id === targetId);

      if (playerIndex === -1 || targetIndex === -1) throw new Error('Player or target not found');

      // Process card effect
      this.processCardEffect(updatedPlayers[playerIndex], updatedPlayers[targetIndex], card, party.settings);

      // Calculate next turn
      const nextTurn = this.calculateNextTurn(updatedPlayers, playerIndex);

      transaction.update(partyRef, {
        players: updatedPlayers,
        currentTurn: nextTurn,
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

  private static processCardEffect(
    player: Player,
    target: Player,
    card: Card,
    settings?: Party['settings']
  ): void {
    const maxHealth = settings?.maxHealth ?? GAME_CONFIG.MAX_HEALTH;
    const maxMana = settings?.maxMana ?? GAME_CONFIG.MAX_MANA;

    // Apply mana cost
    player.mana = Math.max(0, player.mana - card.manaCost);

    // Apply effect
    switch (card.effect.type) {
      case 'damage':
        target.health = Math.max(0, target.health - card.effect.value);
        break;
      case 'heal':
        target.health = Math.min(maxHealth, target.health + card.effect.value);
        break;
      case 'manaDrain':
        const drainAmount = Math.min(target.mana, card.effect.value);
        target.mana -= drainAmount;
        player.mana = Math.min(maxMana, player.mana + drainAmount);
        break;
    }
  }

  private static calculateNextTurn(players: Player[], currentIndex: number): string {
    const alivePlayers = players.filter(p => p.health > 0);
    if (alivePlayers.length <= 1) return players[currentIndex].id;

    let nextIndex = (currentIndex + 1) % players.length;
    while (players[nextIndex].health <= 0) {
      nextIndex = (nextIndex + 1) % players.length;
    }

    return players[nextIndex].id;
  }
}