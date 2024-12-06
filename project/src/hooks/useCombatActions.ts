import { useCallback } from 'react';
import { Card, Player, Party } from '../types/game';
import { CombatResolver } from '../utils/combatResolver';
import { GAME_CONFIG } from '../config/gameConfig';

export function useCombatActions() {
  const combatResolver = new CombatResolver();

  const resolveCardPlay = useCallback((
    card: Card,
    source: Player,
    target: Player,
    party: Party
  ): { updatedSource: Player; updatedTarget: Player } => {
    const maxHealth = party.settings?.maxHealth ?? GAME_CONFIG.MAX_HEALTH;
    const maxMana = party.settings?.maxMana ?? GAME_CONFIG.MAX_MANA;

    // Validate play
    if (source.health <= 0) throw new Error('Dead players cannot play cards');
    if (source.mana < card.manaCost) throw new Error('Not enough mana');
    if (target.health <= 0 && card.effect.type === 'damage') {
      throw new Error('Cannot target dead players with damage');
    }

    // Resolve combat
    const { source: updatedSource, target: updatedTarget } = combatResolver.resolveCardEffect(
      card,
      source,
      target,
      maxHealth,
      maxMana
    );

    return { updatedSource, updatedTarget };
  }, []);

  const updateEffects = useCallback((players: Player[]): Player[] => {
    return players.map(player => combatResolver.updateStatusEffects(player));
  }, []);

  return { resolveCardPlay, updateEffects };
}