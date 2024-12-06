import { Card } from '../types/game';
import { EffectManager } from './effectManager';

export class CardEnhancer {
  private effectManager: EffectManager;

  constructor(effectManager: EffectManager) {
    this.effectManager = effectManager;
  }

  enhanceCard(card: Card): Card {
    const enhancedCard = { ...card };

    if (card.effect.type === 'damage') {
      enhancedCard.effect.value = this.effectManager.calculateEffectValue('damage', card.effect.value);
    }

    if (card.effect.type === 'heal') {
      enhancedCard.effect.value = this.effectManager.calculateEffectValue('healing', card.effect.value);
    }

    if (card.manaCost > 0) {
      enhancedCard.manaCost = this.effectManager.calculateEffectValue('mana', card.manaCost);
    }

    return enhancedCard;
  }

  enhancePotion(value: number): number {
    return this.effectManager.calculateEffectValue('potion', value);
  }
}