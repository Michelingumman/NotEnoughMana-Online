import { CardBase, CardRarity } from '../../../types/cards';
import { GAME_CONFIG } from '../../gameConfig';
import { RARITY_COLORS } from '../rarities';

export const COMMON_CARDS: CardBase[] = [
  {
    id: 'fire-arrow',
    name: 'Fire Arrow',
    description: 'A basic fire arrow that deals 1 damage',
    manaCost: 1.0,
    rarity: CardRarity.COMMON,
    type: 'damage',
    effect: { type: 'damage', value: 1.0 },
    requiresTarget: true,
    color: RARITY_COLORS[CardRarity.COMMON]
  },
  {
    id: 'ice-chard',
    name: 'Ice Chard',
    description: 'A sharp shard of ice that deals 2 damage',
    manaCost: 2.0,
    rarity: CardRarity.COMMON,
    type: 'damage',
    effect: { type: 'damage', value: 2.0 },
    requiresTarget: true,
    color: RARITY_COLORS[CardRarity.COMMON]
  },
  {
    id: 'lightning-chain',
    name: 'Lightning Chain',
    description: 'Deals +1 damage to everyone (even the one playing the card)',
    manaCost: 2.0,
    rarity: CardRarity.COMMON,
    type: 'damage',
    effect: { type: 'aoeDamage', value: 1.0 },
    requiresTarget: false,
    color: RARITY_COLORS[CardRarity.COMMON]
  },
  {
    id: 'shotgun',
    name: 'Shotgun Roulette',
    description: 'Shoots a shell that deals +2 damage and one random collateral (could be you)',
    manaCost: 1.0,
    rarity: CardRarity.COMMON,
    type: 'damage',
    effect: { type: 'roulette', value: 2.0 },
    requiresTarget: true,
    color: RARITY_COLORS[CardRarity.COMMON]
  },
  {
    id: 'shockwave',
    name: 'Shockwave',
    description: 'Deals +2 damage to all enemies',
    manaCost: 2.0,
    rarity: CardRarity.COMMON,
    type: 'damage',
    effect: { type: 'aoeDamage', value: 2.0 },
    requiresTarget: false,
    color: RARITY_COLORS[CardRarity.COMMON]
  },
  {
    id: 'fireball',
    name: 'Fireball',
    description: 'Cast a powerful Fireball that deals +4 Damage to an opponent ',
    manaCost: 5.0,
    rarity: CardRarity.COMMON,
    type: 'damage',
    effect: { type: 'damage', value: 4.0 },
    requiresTarget: true,
    color: RARITY_COLORS[CardRarity.COMMON]
  },
  {
    id: 'energi',
    name: 'Du har inte matchat energin i rummet... ',
    description: '',
    manaCost: 2.0,
    rarity: CardRarity.COMMON,
    type: 'damage',
    effect: { type: 'aoeDamage', value: GAME_CONFIG.MAX_HEALTH },
    requiresTarget: true,
    color: RARITY_COLORS[CardRarity.COMMON]
  }
];