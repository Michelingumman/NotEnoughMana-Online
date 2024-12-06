import { Card } from '../types/game';
import { EffectManager } from './effectManager';

export class CardManager {
  private effectManager: EffectManager;

  constructor(effectManager: EffectManager) {
    this.effectManager = effectManager;
  }

  calculateCardEffect(card: Card): number {
    let value = card.effect.value;

    switch (card.effect.type) {
      case 'damage':
        value = this.effectManager.calculateEffectValue('damage', value);
        break;
      case 'heal':
        value = this.effectManager.calculateEffectValue('healing', value);
        break;
      case 'manaDrain':
      case 'manaRefill':
      case 'manaBurn':
        value = this.effectManager.calculateEffectValue('mana', value);
        break;
    }

    if (card.effect.statusEffect) {
      this.effectManager.addStatusEffect(card.effect.statusEffect);
    }

    return value;
  }

  applyCardEnhancements(card: Card): Card {
    return {
      ...card,
      effect: {
        ...card.effect,
        value: this.calculateCardEffect(card)
      }
    };
  }
}