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
    // Create copies to work with
    const updatedSource = { ...source };
    const updatedTarget = { ...target };

    // Apply card cost
    updatedSource.mana = Math.max(0, updatedSource.mana - card.manaCost);

    // Enhance card based on active effects
    const enhancedCard = this.cardEnhancer.enhanceCard(card);

    // Apply main effect
    switch (enhancedCard.effect.type) {
      case 'damage':
        this.applyDamage(updatedTarget, enhancedCard.effect.value);
        if (enhancedCard.effect.lifeSteal) {
          this.applyHealing(updatedSource, enhancedCard.effect.value * enhancedCard.effect.lifeSteal, maxHealth);
        }
        break;

      case 'heal':
        this.applyHealing(updatedTarget, enhancedCard.effect.value, maxHealth);
        break;

      case 'manaDrain':
        const drainedMana = Math.min(updatedTarget.mana, enhancedCard.effect.value);
        updatedTarget.mana -= drainedMana;
        updatedSource.mana = Math.min(maxMana, updatedSource.mana + drainedMana);
        break;
    }

    // Apply status effects
    if (enhancedCard.effect.statusEffect) {
      this.applyStatusEffect(updatedTarget, enhancedCard.effect.statusEffect);
    }

    // Apply chain effects
    if (enhancedCard.effect.chainEffect) {
      // Chain effects would be handled here
      // This would typically affect additional targets
    }

    // Apply area effects
    if (enhancedCard.effect.areaEffect) {
      // Area effects would be handled here
      // This would affect all valid targets
    }

    // Return mana if specified
    if (enhancedCard.effect.manaReturn) {
      updatedSource.mana = Math.min(maxMana, updatedSource.mana + enhancedCard.effect.manaReturn);
    }

    return { source: updatedSource, target: updatedTarget };
  }

  private applyDamage(target: Player, amount: number): void {
    target.health = Math.max(0, target.health - amount);
  }

  private applyHealing(target: Player, amount: number, maxHealth: number): void {
    target.health = Math.min(maxHealth, target.health + amount);
  }

  private applyStatusEffect(target: Player, effect: StatusEffect): void {
    if (!target.effects) {
      target.effects = [];
    }

    const existingEffect = target.effects.find(e => e.type === effect.type);
    if (existingEffect) {
      existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
      existingEffect.value += effect.value;
    } else {
      target.effects.push({ ...effect });
    }
  }

  updateStatusEffects(player: Player): Player {
    if (!player.effects) return player;

    const updatedPlayer = { ...player };
    updatedPlayer.effects = updatedPlayer.effects
      .map(effect => {
        // Apply effect
        switch (effect.type) {
          case 'poison':
          case 'burn':
            updatedPlayer.health = Math.max(0, updatedPlayer.health - effect.value);
            break;
          case 'weakness':
            // Weakness is handled by the CardEnhancer
            break;
        }

        // Decrease duration
        return {
          ...effect,
          duration: effect.duration - 1
        };
      })
      .filter(effect => effect.duration > 0);

    return updatedPlayer;
  }
}