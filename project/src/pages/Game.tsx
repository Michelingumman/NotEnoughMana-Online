import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Card } from '../types/game';
import { GameBoard } from '../components/game/GameBoard';
import { GameHeader } from '../components/game/GameHeader';
import { GameControls } from '../components/game/GameControls';
import { GameStatus } from '../components/game/GameStatus';
import { ChallengeModal } from '../components/game/ChallengeModal';
import { useGameActions } from '../hooks/useGameActions';
import { useGameState } from '../hooks/useGameState';
import { usePartyActions } from '../hooks/usePartyActions';
import { useTurnActions } from '../hooks/useTurnActions';
import { useCardActions } from '../hooks/useCardActions';

export function Game() {
  const { partyId = '' } = useParams<{ partyId: string }>();
  const navigate = useNavigate();
  const { party, currentPlayer, loading, error } = useGameStore();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const { applyCardEffect, drinkMana, resolveChallengeCard } = useGameActions(partyId);
  const { leaveParty, startGame, updateGameSettings } = usePartyActions();
  const { startTurn, endTurn } = useTurnActions(partyId);
  const { playCard } = useCardActions(partyId);

  useGameState(partyId);

  const isCurrentTurn = Boolean(party?.currentTurn === currentPlayer?.id);
  const isLeader = Boolean(currentPlayer?.isLeader);
  const canStart = Boolean(
    party?.status === 'waiting' && 
    isLeader && 
    (party?.players.length ?? 0) >= 2
  );

  useEffect(() => {
    if (isCurrentTurn && party?.status === 'playing') {
      startTurn();
    }
  }, [isCurrentTurn, party?.status, startTurn]);

  const handlePlayCard = async (card: Card) => {
    if (!currentPlayer || !isCurrentTurn || currentPlayer.health <= 0) return;

    try {
      if (card.isChallenge) {
        setSelectedCard(card);
      } else if (card.requiresTarget) {
        setSelectedCard(card);
      } else {
        await playCard(card, currentPlayer.id);
        await endTurn();
      }
    } catch (error) {
      console.error('Error playing card:', error);
    }
  };

  const handleTargetSelect = async (targetId: string) => {
    if (!currentPlayer || !selectedCard || !isCurrentTurn) return;

    try {
      await playCard(selectedCard, targetId);
      await endTurn();
      setSelectedCard(null);
    } catch (error) {
      console.error('Error applying card effect:', error);
    }
  };

  const handleChallengeResolve = async (winnerId: string, loserId: string) => {
    if (!currentPlayer || !selectedCard || !isCurrentTurn) return;

    try {
      await resolveChallengeCard(currentPlayer.id, selectedCard, winnerId, loserId);
      await endTurn();
      setSelectedCard(null);
    } catch (error) {
      console.error('Error resolving challenge:', error);
    }
  };

  const handleDrink = async () => {
    if (!currentPlayer || currentPlayer.health <= 0) return;

    try {
      await drinkMana(currentPlayer.id);
    } catch (error) {
      console.error('Error drinking mana:', error);
    }
  };

  const handleStartGame = async () => {
    if (!canStart) return;

    try {
      await startGame(partyId);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleLeaveParty = async () => {
    if (!party || !currentPlayer) return;

    try {
      await leaveParty(party.id, currentPlayer.id);
      navigate('/');
    } catch (error) {
      console.error('Error leaving party:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-xl text-purple-100">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error || !party || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">{error || 'Game not found'}</p>
          <button onClick={() => navigate('/')} className="text-purple-400 hover:text-purple-300">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 overflow-auto">
      <div className="max-w-6xl mx-auto p-4">
        <GameHeader
          party={party}
          isLeader={isLeader}
          canStart={canStart}
          onStartGame={handleStartGame}
          onLeaveParty={handleLeaveParty}
          onUpdateSettings={updateGameSettings}
        />

        <GameBoard
          partyId={partyId}
          onPlayCard={handlePlayCard}
          onTargetSelect={handleTargetSelect}
          selectedCard={selectedCard}
        />

        <GameStatus
          status={party.status}
          winner={party.winner}
          players={party.players}
          isLeader={isLeader}
        />

        {party.status === 'playing' && currentPlayer.health > 0 && (
          <GameControls
            gameStatus={party.status}
            manaDrinkAmount={party.settings?.manaDrinkAmount ?? 3}
            onDrink={handleDrink}
          />
        )}

        {selectedCard?.isChallenge && (
          <ChallengeModal
            card={selectedCard}
            players={party.players}
            currentPlayerId={currentPlayer.id}
            onConfirm={handleChallengeResolve}
            onCancel={() => setSelectedCard(null)}
          />
        )}
      </div>
    </div>
  );
}