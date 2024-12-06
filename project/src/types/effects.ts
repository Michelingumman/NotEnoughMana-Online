export type EffectType = 
  | 'damage' 
  | 'heal' 
  | 'manaDrain' 
  | 'manaRefill' 
  | 'manaBurn' 
  | 'challenge'
  | 'extraTurn'
  | 'block'
  | 'poison'
  | 'burn'
  | 'stun'
  | 'weakness';

export interface LegendaryEffect {
  name: string;
  type: EffectType;
  value: number;
  cooldown: number;
  currentCooldown: number;
  requirements?: {
    health?: number;
    mana?: number;
    cardCount?: number;
  };
}

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
    type: EffectType;
    value: number;
  };
  chainEffect?: {
    type: EffectType;
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

export interface Enhancement {
  type: string;
  value: number;
  duration: number;
}

export interface ActiveEffects {
  statusEffects: StatusEffect[];
  enhancements: Enhancement[];
  legendary: LegendaryEffect[];
}