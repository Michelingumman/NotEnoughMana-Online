import { ActiveEffects, StatusEffect, Enhancement, LegendaryEffect } from '../types/effects';

export class EffectManager {
  private effects: ActiveEffects = {
    statusEffects: [],
    enhancements: [],
    legendary: []
  };

  addStatusEffect(effect: StatusEffect): void {
    const existingEffect = this.effects.statusEffects.find(e => e.type === effect.type);
    
    if (existingEffect) {
      existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
      existingEffect.value += effect.value;
    } else {
      this.effects.statusEffects.push({ ...effect });
    }
  }

  addEnhancement(enhancement: Enhancement): void {
    const existingEnhancement = this.effects.enhancements.find(e => e.type === enhancement.type);
    
    if (existingEnhancement) {
      existingEnhancement.duration = Math.max(existingEnhancement.duration, enhancement.duration);
      existingEnhancement.value += enhancement.value;
    } else {
      this.effects.enhancements.push({ ...enhancement });
    }
  }

  calculateEffectValue(type: string, baseValue: number): number {
    const enhancement = this.effects.enhancements.find(e => e.type === type);
    const statusEffect = this.effects.statusEffects.find(e => e.type === type);
    
    let multiplier = 1;
    
    if (enhancement) {
      multiplier += enhancement.value;
    }
    
    if (statusEffect) {
      if (type === 'damage') {
        multiplier *= (1 - statusEffect.value); // Weakness reduces damage
      } else if (type === 'healing') {
        multiplier *= (1 + statusEffect.value); // Healing enhancement
      }
    }
    
    return baseValue * multiplier;
  }

  checkLegendaryTriggers(health: number, mana: number, cardCount: number): LegendaryEffect[] {
    return this.effects.legendary.filter(effect => {
      const reqs = effect.requirements;
      if (!reqs) return true;
      
      return (!reqs.health || health <= reqs.health) &&
             (!reqs.mana || mana >= reqs.mana) &&
             (!reqs.cardCount || cardCount >= reqs.cardCount);
    });
  }

  updateEffects(): void {
    // Update status effects
    this.effects.statusEffects = this.effects.statusEffects
      .map(effect => ({ ...effect, duration: effect.duration - 1 }))
      .filter(effect => effect.duration > 0);

    // Update enhancements
    this.effects.enhancements = this.effects.enhancements
      .map(enhancement => ({ ...enhancement, duration: enhancement.duration - 1 }))
      .filter(enhancement => enhancement.duration > 0);

    // Update legendary effects
    this.effects.legendary = this.effects.legendary
      .map(effect => ({
        ...effect,
        currentCooldown: Math.max(0, effect.currentCooldown - 1)
      }));
  }

  getActiveEffects(): ActiveEffects {
    return {
      statusEffects: [...this.effects.statusEffects],
      enhancements: [...this.effects.enhancements],
      legendary: [...this.effects.legendary]
    };
  }

  clearEffects(): void {
    this.effects = {
      statusEffects: [],
      enhancements: [],
      legendary: []
    };
  }
}