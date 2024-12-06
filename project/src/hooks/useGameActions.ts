import { useCallback } from 'react';
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Party } from '../types/game';
import { GAME_CONFIG } from '../config/gameConfig';
import { drawNewCard } from '../utils/cards';
import { CombatResolver } from '../utils/combatResolver';
import { getChallengeEffects } from '../utils/challengeEffects';

export function useGameActions(partyId: string) {
  const combatResolver = new CombatResolver();

  const applyCardEffect = useCallback(async (playerId: string, targetId: string, card: Card) => {
    const partyRef = doc(db, 'parties', partyId);

    try {
      await runTransaction(db, async (transaction) => {
        const partyDoc = await transaction.get(partyRef);
        if (!partyDoc.exists()) throw new Error('Party not found');
        
        const party = partyDoc.data() as Party;
        if (party.currentTurn !== playerId) throw new Error('Not player\'s turn');

        const updatedPlayers = [...party.players];
        const player = updatedPlayers.find(p => p.id === playerId);
        const target = updatedPlayers.find(p => p.id === targetId);

        if (!player || !target) throw new Error('Player or target not found');
        if (player.health <= 0) throw new Error('Dead players cannot play cards');
        if (player.mana < card.manaCost) throw new Error('Not enough mana');

        // Apply combat effects
        const result = combatResolver.resolveCardEffect(
          card,
          player,
          target,
          party.settings?.maxHealth ?? GAME_CONFIG.MAX_HEALTH,
          party.settings?.maxMana ?? GAME_CONFIG.MAX_MANA
        );

        // Update player states
        Object.assign(player, result.source);
        Object.assign(target, result.target);

        // Replace used card
        const cardIndex = player.cards.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
          player.cards[cardIndex] = drawNewCard();
        }

        // Calculate next turn
        const alivePlayers = updatedPlayers.filter(p => p.health > 0);
        const status = alivePlayers.length <= 1 ? 'finished' : 'playing';
        const currentIndex = updatedPlayers.findIndex(p => p.id === playerId);
        const nextIndex = (currentIndex + 1) % updatedPlayers.length;
        const nextPlayerId = updatedPlayers[nextIndex]?.id || playerId;

        transaction.update(partyRef, {
          players: updatedPlayers,
          status,
          currentTurn: nextPlayerId,
          lastAction: {
            type: card.effect.type,
            playerId,
            targetId,
            value: card.effect.value,
            timestamp: Date.now(),
            cardId: card.id
          }
        });
      });
    } catch (error) {
      console.error('Error applying card effect:', error);
      throw error;
    }
  }, [partyId]);

  const resolveChallengeCard = useCallback(async (playerId: string, card: Card, winnerId: string, loserId: string) => {
    const partyRef = doc(db, 'parties', partyId);

    try {
      await runTransaction(db, async (transaction) => {
        const partyDoc = await transaction.get(partyRef);
        if (!partyDoc.exists()) throw new Error('Party not found');

        const party = partyDoc.data() as Party;
        const updatedPlayers = [...party.players];
        const winner = updatedPlayers.find(p => p.id === winnerId);
        const loser = updatedPlayers.find(p => p.id === loserId);

        if (!winner || !loser) throw new Error('Winner or loser not found');

        const effects = getChallengeEffects(card);
        if (!effects) throw new Error('Invalid challenge card type');

        // Apply winner effects
        if (effects.winner.type === 'heal') {
          winner.health = Math.min(
            party.settings?.maxHealth ?? GAME_CONFIG.MAX_HEALTH,
            winner.health + effects.winner.value
          );
        } else if (effects.winner.type === 'manaRefill') {
          winner.mana = party.settings?.maxMana ?? GAME_CONFIG.MAX_MANA;
        }

        // Apply loser effects
        if (effects.loser.type === 'damage') {
          loser.health = Math.max(0, loser.health - effects.loser.value);
        } else if (effects.loser.type === 'manaBurn') {
          loser.mana = 0;
        }

        // Replace used card
        const player = updatedPlayers.find(p => p.id === playerId);
        if (!player) throw new Error('Player not found');
        const cardIndex = player.cards.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
          player.cards[cardIndex] = drawNewCard();
        }

        // Calculate next turn
        const alivePlayers = updatedPlayers.filter(p => p.health > 0);
        const status = alivePlayers.length <= 1 ? 'finished' : 'playing';
        const currentIndex = updatedPlayers.findIndex(p => p.id === playerId);
        const nextIndex = (currentIndex + 1) % updatedPlayers.length;
        const nextPlayerId = updatedPlayers[nextIndex]?.id || playerId;

        transaction.update(partyRef, {
          players: updatedPlayers,
          status,
          currentTurn: nextPlayerId,
          lastAction: {
            type: 'challenge',
            playerId,
            targetId: loserId,
            value: card.effect.value,
            timestamp: Date.now(),
            cardId: card.id
          }
        });
      });
    } catch (error) {
      console.error('Error resolving challenge:', error);
      throw error;
    }
  }, [partyId]);

  const drinkMana = useCallback(async (playerId: string) => {
    const partyRef = doc(db, 'parties', partyId);

    try {
      await runTransaction(db, async (transaction) => {
        const partyDoc = await transaction.get(partyRef);
        if (!partyDoc.exists()) throw new Error('Party not found');

        const party = partyDoc.data() as Party;
        const updatedPlayers = party.players.map(player => {
          if (player.id === playerId) {
            const manaGain = party.settings?.manaDrinkAmount ?? GAME_CONFIG.MANA_DRINK_AMOUNT;
            const maxMana = party.settings?.maxMana ?? GAME_CONFIG.MAX_MANA;
            return {
              ...player,
              mana: Math.min(maxMana, player.mana + manaGain)
            };
          }
          return player;
        });

        transaction.update(partyRef, {
          players: updatedPlayers,
          lastAction: {
            type: 'drink',
            playerId,
            value: party.settings?.manaDrinkAmount ?? GAME_CONFIG.MANA_DRINK_AMOUNT,
            timestamp: Date.now()
          }
        });
      });
    } catch (error) {
      console.error('Error drinking mana:', error);
      throw error;
    }
  }, [partyId]);

  return { applyCardEffect, resolveChallengeCard, drinkMana };
}