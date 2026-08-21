export type PlayerPosition = 'GK' | 'LB' | 'CB' | 'RB' | 'LF' | 'RF';
export type OutfieldPosition = Exclude<PlayerPosition, 'GK'>;

export type Player = {
  playerId?: string;
  name: string;
  position: PlayerPosition;
  x: number;
  y: number;
  preferredPositions?: OutfieldPosition[];
  isSubstitute?: boolean;
  lineupClip?: string;
  lineupStatic?: string;
  poster?: string;
  image?: string;
};

export type Team = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  accent: string;
  formationLocked?: boolean;
  players: Player[];
};

export type Lineup = {
  eventTitle: string;
  eventSubtitle: string;
  matchDate: string;
  kickoffTime: string;
  temperature: string;
  weatherLabel: string;
  groupIcon?: string;
  goalkeepers: Player[];
  teams: Team[];
};
