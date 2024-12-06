import { doc, collection, runTransaction, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Party, Player, GameSettings } from '../../types/game';
import { GAME_CONFIG } from '../../config/gameConfig';

export class PartyManager {
  private static COLLECTION = 'parties';

  static async createParty(
    player: Pick<Player, 'id' | 'name'>,
    settings: GameSettings
  ): Promise<string> {
    const partyRef = doc(collection(db, this.COLLECTION));
    
    const initialPlayer: Player = {
      ...player,
      health: settings.initialHealth,
      mana: settings.initialMana,
      cards: [],
      isLeader: true,
      effects: []
    };

    const newParty: Omit<Party, 'id'> = {
      code: this.generatePartyCode(),
      status: 'waiting',
      players: [initialPlayer],
      currentTurn: player.id,
      leaderId: player.id,
      settings,
      createdAt: Date.now()
    };

    await runTransaction(db, async (transaction) => {
      transaction.set(partyRef, newParty);
    });

    return partyRef.id;
  }

  static async joinParty(partyId: string, player: Pick<Player, 'id' | 'name'>): Promise<void> {
    const partyRef = doc(db, this.COLLECTION, partyId);

    await runTransaction(db, async (transaction) => {
      const partyDoc = await transaction.get(partyRef);
      if (!partyDoc.exists()) throw new Error('Party not found');

      const party = partyDoc.data() as Party;
      if (party.status !== 'waiting') throw new Error('Game has already started');
      if (party.players.length >= GAME_CONFIG.MAX_PLAYERS) throw new Error('Party is full');
      if (party.players.some(p => p.id === player.id)) throw new Error('Player already in party');

      const newPlayer: Player = {
        ...player,
        health: party.settings?.initialHealth ?? GAME_CONFIG.INITIAL_HEALTH,
        mana: party.settings?.initialMana ?? GAME_CONFIG.INITIAL_MANA,
        cards: [],
        isLeader: false,
        effects: []
      };

      transaction.update(partyRef, {
        players: [...party.players, newPlayer]
      });
    });
  }

  private static generatePartyCode(): string {
    return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  }
}