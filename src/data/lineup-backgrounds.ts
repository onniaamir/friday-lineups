import {random} from 'remotion';

export type PitchBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const matchdayBackgrounds = [
  'backgrounds/lineup/matchday-background.png',
  'backgrounds/lineup/matchday-background-emerald-gold.png',
  'backgrounds/lineup/matchday-background-violet-neon.png',
  'backgrounds/lineup/matchday-background-orange-navy.png',
  'backgrounds/lineup/matchday-background-turquoise-burgundy.png',
] as const;

const matchdayBackgroundCycle = matchdayBackgrounds
  .map((src) => ({src, order: random(`matchday-background:${src}`)}))
  .sort((left, right) => left.order - right.order)
  .map(({src}) => src);

export const matchdayWeekIndex = (matchDate: string) => {
  const match = matchDate.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) {
    return Math.floor(random(`matchday-week:${matchDate}`) * Number.MAX_SAFE_INTEGER);
  }

  const [, day, month, year] = match;
  return Math.floor(Date.UTC(Number(year), Number(month) - 1, Number(day)) / (7 * 24 * 60 * 60 * 1000));
};

export const selectMatchdayBackground = (matchDate: string) =>
  matchdayBackgroundCycle[matchdayWeekIndex(matchDate) % matchdayBackgroundCycle.length];

export const summaryBackground = 'backgrounds/lineup/all-teams-summary-background.png';

export const teamBackgrounds: Record<string, {src: string; pitchBounds: PitchBounds}> = {
  blue: {
    src: 'backgrounds/lineup/blue-team-pitch.png',
    pitchBounds: {left: 110, top: 270, width: 858, height: 1416},
  },
  red: {
    src: 'backgrounds/lineup/red-team-pitch.png',
    pitchBounds: {left: 140, top: 190, width: 798, height: 1552},
  },
  white: {
    src: 'backgrounds/lineup/white-team-pitch.png',
    pitchBounds: {left: 112, top: 177, width: 856, height: 1581},
  },
};
