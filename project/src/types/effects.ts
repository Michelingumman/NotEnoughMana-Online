export type StatusEffectType = 'poison' | 'burn' | 'stun' | 'weakness' | 'block';

export type EffectType = 
  | 'damage' 
  | 'heal' 
  | 'manaDrain' 
  | 'manaRefill' 
  | 'manaBurn' 
  | 'challenge'
  | 'extraTurn'
  | StatusEffectType;

export interface StatusEffect {
  type: StatusEffectType;
  value: number;
  duration: number;
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