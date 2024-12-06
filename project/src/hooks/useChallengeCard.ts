import { useState, useCallback } from 'react';
import { Card, Player } from '../types/game';

interface ChallengeState {
  card: Card | null;
  isModalOpen: boolean;
  winnerId: string | null;
  loserId: string | null;
}

export function useChallengeCard() {
  const [state, setState] = useState<ChallengeState>({
    card: null,
    isModalOpen: false,
    winnerId: null,
    loserId: null
  });

  const openChallengeModal = useCallback((card: Card) => {
    setState({
      card,
      isModalOpen: true,
      winnerId: null,
      loserId: null
    });
  }, []);

  const closeChallengeModal = useCallback(() => {
    setState({
      card: null,
      isModalOpen: false,
      winnerId: null,
      loserId: null
    });
  }, []);

  const selectWinner = useCallback((playerId: string) => {
    setState(prev => ({
      ...prev,
      winnerId: playerId,
      loserId: prev.loserId === playerId ? null : prev.loserId // Reset loser if same as winner
    }));
  }, []);

  const selectLoser = useCallback((playerId: string) => {
    setState(prev => ({
      ...prev,
      loserId: playerId
    }));
  }, []);

  const validateSelection = useCallback((players: Player[]): string | null => {
    if (!state.winnerId || !state.loserId) {
      return null; // Don't show error until both are selected
    }

    if (state.winnerId === state.loserId) {
      return 'Winner and loser cannot be the same player';
    }

    const winner = players.find(p => p.id === state.winnerId);
    const loser = players.find(p => p.id === state.loserId);

    if (!winner || !loser) {
      return 'Selected players not found';
    }

    if (winner.health <= 0 || loser.health <= 0) {
      return 'Cannot select dead players';
    }

    return null;
  }, [state.winnerId, state.loserId]);

  return {
    challengeCard: state.card,
    isModalOpen: state.isModalOpen,
    winnerId: state.winnerId,
    loserId: state.loserId,
    openChallengeModal,
    closeChallengeModal,
    selectWinner,
    selectLoser,
    validateSelection
  };
}