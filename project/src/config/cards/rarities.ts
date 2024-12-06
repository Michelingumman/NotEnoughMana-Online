import { CardRarity } from '../../types/cards';

export const RARITY_WEIGHTS = {
  [CardRarity.COMMON]: 0.50,
  [CardRarity.UNCOMMON]: 0.30,
  [CardRarity.RARE]: 0.15,
  [CardRarity.EPIC]: 0.04,
  [CardRarity.LEGENDARY]: 0.01
} as const;

export const RARITY_COLORS = {
  [CardRarity.COMMON]: 'from-gray-700 to-gray-800',
  [CardRarity.UNCOMMON]: 'from-blue-700 to-blue-800',
  [CardRarity.RARE]: 'from-purple-700 to-purple-800',
  [CardRarity.EPIC]: 'from-purple-700 to-purple-800',
  [CardRarity.LEGENDARY]: 'from-yellow-600 to-yellow-700'
} as const;

export const CARDS_PER_HAND = 4;