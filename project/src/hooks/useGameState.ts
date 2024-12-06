import { useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { useGameStore } from '../store/gameStore';
import { Party } from '../types/game';
import { useAuth } from './useAuth';

export function useGameState(partyId: string) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setParty, setCurrentPlayer, setLoading, setError } = useGameStore();

  const handlePartyUpdate = useCallback((doc: any) => {
    if (!doc.exists() || !user) {
      setError('Game not found or user not authenticated');
      navigate('/');
      return;
    }

    const partyData = { ...doc.data(), id: doc.id } as Party;
    const player = partyData.players.find(p => p.id === user.uid);

    if (!player) {
      setError('Player not found in game');
      navigate('/');
      return;
    }

    setParty(partyData);
    setCurrentPlayer(player);
    setLoading(false);
  }, [navigate, setError, setLoading, setParty, setCurrentPlayer, user]);

  useEffect(() => {
    if (!partyId || !user) return;

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      doc(db, 'parties', partyId),
      { next: handlePartyUpdate }
    );

    return () => unsubscribe();
  }, [partyId, user, handlePartyUpdate, setLoading, setError]);
}