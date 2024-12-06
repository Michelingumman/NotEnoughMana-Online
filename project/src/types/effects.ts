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

export interface Enhancement {
  type: string;
  value: number;
  duration: number;
}

export interface ActiveEffects {
  statusEffects: StatusEffect[];
  enhancements: Enhancement[];
}