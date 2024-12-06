import { CardBase, CardRarity, CardStats, PlayerHand } from './cards';
import { StatusEffect } from './effects';



export interface TurnPhase {
  type: 'start' | 'main' | 'end';
  effects: StatusEffect[];
}

export interface Player {
  id: string;
  name: string;
  health: number;
  mana: number;
  cards: Card[];
  isLeader?: boolean;
  effects?: StatusEffect[];
  potionMultiplier?: {
    value: number;
    turnsLeft: number;
  };
  turnPhase?: TurnPhase;
}

export interface GameAction {
  type: string;
  playerId: string;
  targetId?: string;
  value: number;
  timestamp: number;
  cardId?: string;
  effects?: StatusEffect[];
}

export interface GameSettings {
  maxHealth: number;
  maxMana: number;
  manaDrinkAmount: number;
  initialHealth: number;
  initialMana: number;
  initialCardCount: number;
  turnTimeLimit?: number;
  partyId?: string;
  playerId?: string;
}

export interface Party {
  id: string;
  code: string;
  players: Player[];
  currentTurn: string;
  status: 'waiting' | 'playing' | 'finished';
  leaderId: string;
  winner?: string | null;
  settings?: GameSettings;
  lastAction?: GameAction;
  turnPhase?: TurnPhase;
  createdAt: number;
}

export type Card = CardBase;

export { CardRarity, type CardStats, type PlayerHand };