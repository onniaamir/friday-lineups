export type PitchBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const matchdayBackground = 'backgrounds/lineup/matchday-background.png';
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
