import { Card, Player } from '../types/game';
import { EffectManager } from './effectManager';
import { CardEnhancer } from './cardEnhancer';
import { StatusEffect } from '../types/effects';

export class CombatResolver {
  private effectManager: EffectManager;
  private cardEnhancer: CardEnhancer;

  constructor() {
    this.effectManager = new EffectManager();
    this.cardEnhancer = new CardEnhancer(this.effectManager);
  }

  resolveCardEffect(
    card: Card,
    source: Player,
    target: Player,
    maxHealth: number,
    maxMana: number
  ): { source: Player; target: Player } {
    const updatedSource = { ...source };
    const updatedTarget = { ...target };

    updatedSource.effects = updatedSource.effects || [];
    updatedTarget.effects = updatedTarget.effects || [];

    const enhancedCard = this.cardEnhancer.enhanceCard(card);
    updatedSource.mana = Math.max(0, updatedSource.mana - enhancedCard.manaCost);

    switch (enhancedCard.effect.type) {
      case 'damage':
        updatedTarget.health = Math.max(0, updatedTarget.health - enhancedCard.effect.value);
        if (enhancedCard.effect.lifeSteal) {
          updatedSource.health = Math.min(maxHealth, updatedSource.health + (enhancedCard.effect.value * enhancedCard.effect.lifeSteal));
        }
        break;

      case 'heal':
        updatedTarget.health = Math.min(maxHealth, updatedTarget.health + enhancedCard.effect.value);
        break;

      case 'manaDrain':
        const drainedMana = Math.min(updatedTarget.mana, enhancedCard.effect.value);
        updatedTarget.mana = Math.max(0, updatedTarget.mana - drainedMana);
        updatedSource.mana = Math.min(maxMana, updatedSource.mana + drainedMana);
        break;

      case 'manaRefill':
        updatedTarget.mana = maxMana;
        break;

      case 'manaBurn':
        updatedTarget.mana = 0;
        break;
    }

    if (enhancedCard.effect.statusEffect) {
      updatedTarget.effects.push({ ...enhancedCard.effect.statusEffect });
    }

    if (enhancedCard.effect.additionalEffect) {
      switch (enhancedCard.effect.additionalEffect.type) {
        case 'block':
          updatedSource.effects.push({
            type: 'block',
            value: enhancedCard.effect.additionalEffect.value,
            duration: 1
          });
          break;
      }
    }

    return { source: updatedSource, target: updatedTarget };
  }

  updateStatusEffects(player: Player): Player {
    const updatedPlayer = { ...player };
    updatedPlayer.effects = updatedPlayer.effects || [];
    const activeEffects: StatusEffect[] = [];

    updatedPlayer.effects.forEach(effect => {
      if (effect.duration > 0) {
        switch (effect.type) {
          case 'poison':
          case 'burn':
            updatedPlayer.health = Math.max(0, updatedPlayer.health - effect.value);
            break;
          case 'stun':
          case 'weakness':
          case 'block':
            // These effects are handled by the effect manager
            break;
        }
        
        if (effect.duration > 1) {
          activeEffects.push({
            ...effect,
            duration: effect.duration - 1
          });
        }
      }
    });

    updatedPlayer.effects = activeEffects;
    return updatedPlayer;
  }
}