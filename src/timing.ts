import type {Lineup, Team} from './types';

export const FPS = 30;
export const OPENING_DURATION = 180;
export const GROUP_REVEAL_DURATION = 99;
export const CENTER_BACK_START = 10;
export const WIDE_DEFENDERS_START = 115;
export const FORWARDS_START = 220;
export const FORMATION_HOLD_DURATION = 60;
export const TEAM_SUMMARY_HOLD_DURATION = 3 * FPS;
export const TEAM_BASE_DURATION =
  FORWARDS_START + GROUP_REVEAL_DURATION + FORMATION_HOLD_DURATION;
export const SUBSTITUTE_START = FORWARDS_START + GROUP_REVEAL_DURATION + 15;
export const SUBSTITUTE_SCENE_DURATION = 75;
export const GOALKEEPER_SCENE_DURATION = 90;
// The closing animation gets eight seconds with music, followed by a silent
// fifteen-second hold so the final rosters can be read without pausing.
export const ACTIVE_FINAL_SCENE_DURATION = 240;
export const SILENT_SUMMARY_HOLD_DURATION = 15 * FPS;
export const FINAL_SCENE_DURATION =
  ACTIVE_FINAL_SCENE_DURATION + SILENT_SUMMARY_HOLD_DURATION;

export const teamSceneDuration = (team: Team) =>
  (team.players.length > 5
    ? SUBSTITUTE_START + SUBSTITUTE_SCENE_DURATION
    : TEAM_BASE_DURATION) + TEAM_SUMMARY_HOLD_DURATION;

export const teamSceneStart = (teams: Team[], teamIndex: number) =>
  OPENING_DURATION +
  teams.slice(0, teamIndex).reduce((total, team) => total + teamSceneDuration(team), 0);

export const goalkeeperSceneStart = (teams: Team[]) =>
  OPENING_DURATION +
  teams.reduce((total, team) => total + teamSceneDuration(team), 0);

export const finalSceneStart = (lineup: Lineup) =>
  goalkeeperSceneStart(lineup.teams) +
  (lineup.goalkeepers.length > 0 ? GOALKEEPER_SCENE_DURATION : 0);

export const totalDuration = (lineup: Lineup) =>
  finalSceneStart(lineup) + FINAL_SCENE_DURATION;
