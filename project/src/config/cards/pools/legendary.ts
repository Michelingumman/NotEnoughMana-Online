import { CardBase, CardRarity } from '../../../types/cards';
import { RARITY_COLORS } from '../rarities';

export const LEGENDARY_CARDS: CardBase[] = [
  {
    id: 'time-warp',
    name: 'Time Warp',
    description: 'Take an extra turn after this one',
    manaCost: 5.0,
    rarity: CardRarity.LEGENDARY,
    type: 'utility',
    effect: { type: 'extraTurn', value: 1.0 },
    requiresTarget: false,
    color: RARITY_COLORS[CardRarity.LEGENDARY],
    isLegendary: true,
    flavorText: 'Time is but a window, death is but a door.'
  },
  {
    id: 'arcane-explosion',
    name: 'Arcane Explosion',
    description: 'Deal 4 damage to all enemies and gain 1 mana for each damaged enemy',
    manaCost: 4.0,
    rarity: CardRarity.LEGENDARY,
    type: 'damage',
    effect: {
      type: 'damage',
      value: 4.0,
      areaEffect: true,
      manaReturn: 1.0
    },
    requiresTarget: false,
    color: RARITY_COLORS[CardRarity.LEGENDARY],
    isLegendary: true,
    flavorText: 'When all else fails, explosion is always the answer.'
  }
];