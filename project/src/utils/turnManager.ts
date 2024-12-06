import { Party, Player, TurnPhase } from '../types/game';
import { StatusEffect } from '../types/effects';
import { CombatResolver } from './combatResolver';

export class TurnManager {
  private combatResolver: CombatResolver;

  constructor() {
    this.combatResolver = new CombatResolver();
  }

  startTurn(player: Player): Player {
    const phase: TurnPhase = {
      type: 'start',
      effects: []
    };

    // Process start-of-turn effects
    const updatedPlayer = this.combatResolver.updateStatusEffects(player);
    
    return {
      ...updatedPlayer,
      turnPhase: phase
    };
  }

  endTurn(player: Player): Player {
    const phase: TurnPhase = {
      type: 'end',
      effects: []
    };

    // Process end-of-turn effects
    if (player.potionMultiplier && player.potionMultiplier.turnsLeft > 0) {
      player.potionMultiplier.turnsLeft--;
      if (player.potionMultiplier.turnsLeft === 0) {
        delete player.potionMultiplier;
      }
    }

    return {
      ...player,
      turnPhase: phase
    };
  }

  processStatusEffects(player: Player): { player: Player; effects: StatusEffect[] } {
    const activeEffects: StatusEffect[] = [];
    let updatedPlayer = { ...player };

    if (updatedPlayer.effects) {
      updatedPlayer.effects.forEach(effect => {
        if (effect.duration > 0) {
          activeEffects.push(effect);
        }
      });

      updatedPlayer = this.combatResolver.updateStatusEffects(updatedPlayer);
    }

    return { player: updatedPlayer, effects: activeEffects };
  }

  calculateNextTurn(party: Party): string {
    const alivePlayers = party.players.filter(p => p.health > 0);
    if (alivePlayers.length <= 1) return party.currentTurn;

    const currentIndex = party.players.findIndex(p => p.id === party.currentTurn);
    let nextIndex = (currentIndex + 1) % party.players.length;

    // Skip dead players
    while (party.players[nextIndex].health <= 0) {
      nextIndex = (nextIndex + 1) % party.players.length;
    }

    return party.players[nextIndex].id;
  }
}