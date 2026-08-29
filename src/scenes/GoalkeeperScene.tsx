import {AbsoluteFill} from 'remotion';
import {PosterShowcase} from '../components/PosterShowcase';
import {summaryBackground} from '../data/lineup-backgrounds';
import type {Player, Team} from '../types';

const neutralTeam: Team = {
  id: 'goalkeepers',
  name: 'שוערים',
  emoji: '🧤',
  color: '#b9c2cc',
  accent: '#ffffff',
  players: [],
};

export const GoalkeeperScene: React.FC<{goalkeepers: Player[]}> = ({goalkeepers}) => {
  return (
    <AbsoluteFill>
      <PosterShowcase
        players={goalkeepers}
        team={neutralTeam}
        title="שוערים"
        titleTop={150}
        backgroundSrc={summaryBackground}
        playLineupClips
        lineupClipFreezeFrame={76}
      />
    </AbsoluteFill>
  );
};
