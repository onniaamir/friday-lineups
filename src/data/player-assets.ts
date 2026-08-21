import type {Player} from '../types';

export const ANONYMOUS_PLAYER_ASSET = 'assets/anonymous-player-fallback.png';

export const playerLineupAsset = (player: Player) =>
  player.lineupStatic ?? player.poster ?? player.image ?? ANONYMOUS_PLAYER_ASSET;

export const playerPosterAsset = (player: Player) =>
  player.poster ?? player.lineupStatic ?? player.image ?? ANONYMOUS_PLAYER_ASSET;

export const playerSummaryAsset = (player: Player) =>
  player.lineupStatic ?? player.image ?? player.poster ?? ANONYMOUS_PLAYER_ASSET;
