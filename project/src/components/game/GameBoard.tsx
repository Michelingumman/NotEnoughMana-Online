import { useState } from 'react';
import { Card } from '../../types/game';
import { PlayerStats } from './PlayerStats';
import { CardList } from './CardList';
import { ActionLog } from './ActionLog';
import { useGameStore } from '../../store/gameStore';
import { useCardActions } from '../../hooks/useCardActions';

export function GameBoard({ partyId }: { partyId: string }) {
  const { party, currentPlayer } = useGameStore();
  const { playCard } = useCardActions(partyId);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const isCurrentTurn = party?.currentTurn === currentPlayer?.id;

  const handleCardSelect = (card: Card) => {
    if (!isCurrentTurn || !currentPlayer) return;
    setSelectedCard(card);
  };

  const handleTargetSelect = async (targetId: string) => {
    if (!selectedCard || !currentPlayer) return;

    try {
      await playCard(selectedCard, targetId);
      setSelectedCard(null);
    } catch (error) {
      console.error('Error playing card:', error);
    }
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
                player.health > 0
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
            disabled={!isCurrentTurn}
            currentMana={currentPlayer.mana}
            selectedCard={selectedCard}
          />
        )}
      </div>
    </div>
  );
}