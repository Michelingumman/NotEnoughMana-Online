import { CardBase, CardRarity } from '../../../types/cards';
import { RARITY_COLORS } from '../rarities';

export const UNCOMMON_CARDS: CardBase[] = [
  {
    id: 'poison-dart',
    name: 'Poison Dart',
    description: 'Deal 1 damage and apply poison for 3 turns',
    manaCost: 2.0,
    rarity: CardRarity.UNCOMMON,
    type: 'curse',
    effect: { 
      type: 'damage', 
      value: 1.0,
      statusEffect: {
        type: 'poison',
        value: 1.0,
        duration: 3
      }
    },
    requiresTarget: true,
    color: RARITY_COLORS[CardRarity.UNCOMMON]
  },
  {
    id: 'shield-bash',
    name: 'Shield Bash',
    description: 'Deal 2 damage and gain 2 block',
    manaCost: 2.0,
    rarity: CardRarity.UNCOMMON,
    type: 'hybrid',
    effect: {
      type: 'damage',
      value: 2.0,
      additionalEffect: {
        type: 'block',
        value: 2.0
      }
    },
    requiresTarget: true,
    color: RARITY_COLORS[CardRarity.UNCOMMON]
  },
  {
    id: 'mana-leak',
    name: 'Mana Leak',
    description: 'Target loses 2 mana, you gain 1 mana',
    manaCost: 2.0,
    rarity: CardRarity.UNCOMMON,
    type: 'utility',
    effect: { type: 'manaDrain', value: 2.0 },
    requiresTarget: true,
    color: RARITY_COLORS[CardRarity.UNCOMMON]
  }
];