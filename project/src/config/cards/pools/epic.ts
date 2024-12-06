import { CardBase, CardRarity } from '../../../types/cards';

export const EPIC_CARDS: CardBase[] = [
  {
    id: 'beer-havf',
    name: 'Öl Hävf',
    description: "Challenge: Winner gains 5 HP, Loser loses 5 HP",
    manaCost: 4.0,
    rarity: CardRarity.EPIC,
    type: 'challenge',
    effect: {
      type: 'challenge',
      value: 0.0,
      challengeEffects: {
        winner: { type: 'heal', value: 5.0 },
        loser: { type: 'damage', value: 5.0 }
      }
    },
    isChallenge: true,
    requiresTarget: true,
    color: `from-purple-700 to-purple-800`
  },
  {
    id: 'got-big-muscles',
    name: 'Got Big Muscles?',
    description: "Challenge: Winner gets full mana, Loser loses all mana",
    manaCost: 4.0,
    rarity: CardRarity.EPIC,
    type: 'challenge',
    effect: {
      type: 'challenge',
      value: 0.0,
      challengeEffects: {
        winner: { type: 'manaRefill', value: 0.0 },
        loser: { type: 'manaBurn', value: 0.0 }
      }
    },
    isChallenge: true,
    requiresTarget: true,
    color: `from-purple-700 to-purple-800`
  }
];