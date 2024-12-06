import { CardBase, CardRarity } from '../../../types/cards';
import { RARITY_COLORS } from '../rarities';

export const RARE_CARDS: CardBase[] = [
  {
    id: 'chain-lightning',
    name: 'Chain Lightning',
    description: 'Deal 3 damage to target and 1 damage to adjacent players',
    manaCost: 3.0,
    rarity: CardRarity.RARE,
    type: 'damage',
    effect: {
      type: 'damage',
      value: 3.0,
      chainEffect: {
        type: 'damage',
        value: 1.0
      }
    },
    requiresTarget: true,
    color: RARITY_COLORS[CardRarity.RARE]
  },
  {
    id: 'mana-surge',
    name: 'Mana Surge',
    description: 'Double your current mana',
    manaCost: 2.0,
    rarity: CardRarity.RARE,
    type: 'utility',
    effect: { type: 'manaMultiply', value: 2.0 },
    requiresTarget: false,
    color: RARITY_COLORS[CardRarity.RARE]
  },
  {
    id: 'vampiric-touch',
    name: 'Vampiric Touch',
    description: 'Deal 3 damage and heal for half the damage dealt',
    manaCost: 3.0,
    rarity: CardRarity.RARE,
    type: 'hybrid',
    effect: {
      type: 'damage',
      value: 3.0,
      lifeSteal: 0.5
    },
    requiresTarget: true,
    color: RARITY_COLORS[CardRarity.RARE]
  }
];