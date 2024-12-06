import { useState } from 'react';
import { Card } from '../../types/game';
import { PlayerStats } from './PlayerStats';
import { CardList } from './CardList';
import { ActionLog } from './ActionLog';
import { useGameStore } from '../../store/gameStore';
import { useCardActions } from '../../hooks/useCardActions';

interface GameBoardProps {
  partyId: string;
  onPlayCard: (card: Card) => void;
  onTargetSelect: (targetId: string) => void;
  selectedCard: Card | null;
}

export function GameBoard({ 
  partyId, 
  onPlayCard, 
  onTargetSelect, 
  selectedCard 
}: GameBoardProps) {
  const { party, currentPlayer } = useGameStore();
  const { playCard } = useCardActions(partyId);

  const isCurrentTurn = party?.currentTurn === currentPlayer?.id;

  const handleCardSelect = (card: Card) => {
    if (!isCurrentTurn || !currentPlayer) return;
    onPlayCard(card);
  };

  const handleTargetSelect = async (targetId: string) => {
    if (!selectedCard || !currentPlayer) return;
    onTargetSelect(targetId);
  };

  if (!party || !currentPlayer) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-4">
        <h3 className="text-sm font-medium text-purple-200 uppercase tracking-wider">
          Opponents
        </h3>
        {party.players
          .filter(p => p.id !== currentPlayer.id)
          .map(player => (
            <PlayerStats
              key={player.id}
              player={player}
              isCurrentPlayer={false}
              isCurrentTurn={player.id === party.currentTurn}
              isTargetable={Boolean(
                selectedCard?.requiresTarget &&
                player.health > 0 &&
                (selectedCard.effect.type === 'heal' || player.id !== currentPlayer.id)
              )}
              onSelect={() => handleTargetSelect(player.id)}
            />
          ))}
        {party.lastAction && (
          <ActionLog
            lastAction={party.lastAction}
            players={party.players}
            usedCard={selectedCard}
          />
        )}
      </div>

      <div className="lg:col-span-8 space-y-6">
        <PlayerStats
          player={currentPlayer}
          isCurrentPlayer={true}
          isCurrentTurn={isCurrentTurn}
          isTargetable={false}
        />
        {party.status === 'playing' && currentPlayer.health > 0 && (
          <CardList
            cards={currentPlayer.cards}
            onPlayCard={handleCardSelect}
            onDoubleClickCard={handleCardSelect}
            disabled={!isCurrentTurn}
            currentMana={currentPlayer.mana}
            selectedCard={selectedCard}
          />
        )}
      </div>
    </div>
  );
}