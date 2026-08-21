import {playerRegistry, type PlayerId} from './player-registry';
import type {OutfieldPosition, Player} from '../types';

const formationSlots: Array<{
  position: OutfieldPosition;
  x: number;
  y: number;
}> = [
  {position: 'CB', x: 50, y: 68},
  {position: 'LB', x: 22, y: 50},
  {position: 'RB', x: 78, y: 50},
  {position: 'LF', x: 32, y: 24},
  {position: 'RF', x: 68, y: 24},
];

const isPlayerId = (value: string | undefined): value is PlayerId =>
  Boolean(value && value in playerRegistry);

const role = (position: OutfieldPosition) =>
  position === 'LF' || position === 'RF' ? 'forward' : 'defender';

const placementScore = (player: Player, position: OutfieldPosition) => {
  const registeredPositions: readonly OutfieldPosition[] = player.preferredPositions ?? (
    isPlayerId(player.playerId)
      ? playerRegistry[player.playerId].positions
      : player.position === 'GK'
        ? []
        : [player.position]
  );

  if (registeredPositions.includes(position)) {
    // Prefer a position specialist when two assignments are otherwise equally
    // valid. This keeps scarce roles covered and moves surplus players to the
    // substitute list instead of benching the only natural fit for a slot.
    return 100 + (6 - registeredPositions.length) * 2;
  }

  if (registeredPositions.some((candidate) => role(candidate) === role(position))) {
    return 35;
  }

  return 0;
};

export type OptimizedFormation = {
  starters: Player[];
  substitutes: Player[];
  score: number;
};

export const optimizeFormation = (players: Player[], useAssignedFormation = false): OptimizedFormation => {
  if (players.length === 0) {
    return {starters: [], substitutes: [], score: 0};
  }

  if (useAssignedFormation) {
    return {
      starters: players.filter((player) => !player.isSubstitute),
      substitutes: players.filter((player) => player.isSubstitute),
      score: 0,
    };
  }

  let bestScore = Number.NEGATIVE_INFINITY;
  let bestIndexes: number[] = [];

  const assign = (slotIndex: number, used: number[], score: number) => {
    if (slotIndex === formationSlots.length || used.length === players.length) {
      if (score > bestScore) {
        bestScore = score;
        bestIndexes = [...used];
      }
      return;
    }

    players.forEach((player, playerIndex) => {
      if (used.includes(playerIndex)) {
        return;
      }

      assign(
        slotIndex + 1,
        [...used, playerIndex],
        score + placementScore(player, formationSlots[slotIndex].position),
      );
    });
  };

  assign(0, [], 0);

  const starters = bestIndexes.map((playerIndex, slotIndex) => ({
    ...players[playerIndex],
    ...formationSlots[slotIndex],
  }));
  const selected = new Set(bestIndexes);
  const substitutes = players.filter((_, index) => !selected.has(index));

  return {starters, substitutes, score: bestScore};
};
