import { useState, useEffect } from 'react';
import { Card, Player } from '../../types/game';
import { Trophy, X, Crown, Skull } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerStats } from './PlayerStats';

interface ChallengeModalProps {
  card: Card;
  players: Player[];
  currentPlayerId: string;
  onConfirm: (winnerId: string, loserId: string) => void;
  onCancel: () => void;
  onSelectWinner: (playerId: string) => void;
  onSelectLoser: (playerId: string) => void;
  winnerId: string | null;
  loserId: string | null;
  validationError: string | null;
}

export function ChallengeModal({
  card,
  players,
  currentPlayerId,
  onConfirm,
  onCancel,
  onSelectWinner,
  onSelectLoser,
  winnerId,
  loserId,
  validationError
}: ChallengeModalProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(validationError);
  }, [validationError]);

  const alivePlayers = players.filter(p => p.health > 0);

  const getChallengeEffects = () => {
    if (!card.effect.challengeEffects) return null;
    return {
      winEffect: getEffectDescription(card.effect.challengeEffects.winner),
      loseEffect: getEffectDescription(card.effect.challengeEffects.loser)
    };
  };

  const getEffectDescription = (effect: { type: string; value: number }) => {
    switch (effect.type) {
      case 'heal':
        return `+${effect.value.toFixed(1)} HP`;
      case 'damage':
        return `-${effect.value.toFixed(1)} HP`;
      case 'manaRefill':
        return 'Full mana';
      case 'manaBurn':
        return 'Lose all mana';
      default:
        return '???';
    }
  };

  const effects = getChallengeEffects();
  if (!effects) return null;

  const canConfirm = winnerId && loserId && !error;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`w-full max-w-md bg-gradient-to-br ${card.color} rounded-lg shadow-xl border border-gray-700/50 overflow-hidden`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
            <div>
              <h3 className="text-lg font-semibold text-purple-100">{card.name}</h3>
              <p className="text-sm text-gray-300">Challenge Resolution</p>
            </div>
            <button
              onClick={onCancel}
              className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-sm text-gray-200">{card.description}</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-purple-200 mb-2">Select Winner</h4>
                <div className="space-y-2">
                  {alivePlayers.map(player => (
                    <PlayerStats
                      key={player.id}
                      player={player}
                      isCurrentPlayer={player.id === currentPlayerId}
                      isCurrentTurn={false}
                      isTargetable={!winnerId || winnerId === player.id}
                      onSelect={() => onSelectWinner(player.id)}
                      isSelected={winnerId === player.id}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-purple-200 mb-2">Select Loser</h4>
                <div className="space-y-2">
                  {alivePlayers
                    .filter(p => p.id !== winnerId)
                    .map(player => (
                      <PlayerStats
                        key={player.id}
                        player={player}
                        isCurrentPlayer={player.id === currentPlayerId}
                        isCurrentTurn={false}
                        isTargetable={!loserId || loserId === player.id}
                        onSelect={() => onSelectLoser(player.id)}
                        isSelected={loserId === player.id}
                      />
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium text-purple-200">Challenge Effects:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <p className="text-green-400">
                    Winner ({players.find(p => p.id === winnerId)?.name || 'Not selected'}): {effects.winEffect}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Skull className="w-4 h-4 text-red-400" />
                  <p className="text-red-400">
                    Loser ({players.find(p => p.id === loserId)?.name || 'Not selected'}): {effects.loseEffect}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 border-t border-gray-700/50">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (canConfirm && winnerId && loserId) {
                  onConfirm(winnerId, loserId);
                }
              }}
              disabled={!canConfirm}
              className="flex items-center space-x-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Confirm Challenge</span>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}