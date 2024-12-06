import { CardBase, CardRarity } from '../../../types/cards';
import { RARITY_COLORS } from '../rarities';

export const COMMON_CARDS: CardBase[] = [
  {
    id: 'strike',
    name: 'Strike',
    description: 'A basic attack that deals 2 damage',
    manaCost: 1.0,
    rarity: CardRarity.COMMON,
    type: 'damage',
    effect: { type: 'damage', value: 2.0 },
    requiresTarget: true,
    color: RARITY_COLORS[CardRarity.COMMON]
  },
  {
    id: 'minor-heal',
    name: 'Minor Heal',
    description: 'Restore 2 health points',
    manaCost: 1.0,
    rarity: CardRarity.COMMON,
    type: 'heal',
    effect: { type: 'heal', value: 2.0 },
    requiresTarget: true,
    color: RARITY_COLORS[CardRarity.COMMON]
  },
  {
    id: 'mana-spark',
    name: 'Mana Spark',
    description: 'Deal 1 damage and restore 1 mana',
    manaCost: 1.0,
    rarity: CardRarity.COMMON,
    type: 'utility',
    effect: { type: 'damage', value: 1.0 },
    requiresTarget: true,
    color: RARITY_COLORS[CardRarity.COMMON]
  }
];