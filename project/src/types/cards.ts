export enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export type EffectType = 
  | 'damage' 
  | 'heal' 
  | 'manaDrain' 
  | 'manaRefill' 
  | 'manaBurn' 
  | 'challenge';

export interface ChallengeEffects {
  winner: {
    type: EffectType;
    value: number;
  };
  loser: {
    type: EffectType;
    value: number;
  };
}

export interface CardEffect {
  type: EffectType;
  value: number;
  challengeEffects?: ChallengeEffects;
  statusEffect?: StatusEffect;
  additionalEffect?: {
    type: string;
    value: number;
  };
  chainEffect?: {
    type: string;
    value: number;
  };
  areaEffect?: boolean;
  manaReturn?: number;
  lifeSteal?: number;
}

export interface StatusEffect {
  type: 'poison' | 'burn' | 'stun' | 'weakness';
  value: number;
  duration: number;
}

export interface CardBase {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  rarity: CardRarity;
  type: string;
  effect: CardEffect;
  requiresTarget: boolean;
  color: string;
  isChallenge?: boolean;
  isLegendary?: boolean;
  flavorText?: string;
}

export interface CardStats {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
  total: number;
}

export interface PlayerHand {
  cards: CardBase[];
  stats: CardStats;
}