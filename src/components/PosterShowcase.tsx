import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ANTON_FONT, HEEBO_FONT} from '../fonts';
import type {Player, Team} from '../types';
import {PosterArtwork} from './PositionGroupReveal';

export const PosterShowcase: React.FC<{
  players: Player[];
  team: Team;
  title: string;
  backgroundSrc?: string;
  titleTop?: number;
  playLineupClips?: boolean;
  lineupClipFreezeFrame?: number;
}> = ({
  players,
  team,
  title,
  backgroundSrc,
  titleTop = 78,
  playLineupClips = false,
  lineupClipFreezeFrame,
}) => {
  const frame = useCurrentFrame();
  const cardWidth = players.length === 1 ? 590 : players.length === 2 ? 440 : 310;
  const cardHeight = players.length === 1 ? 1180 : players.length === 2 ? 1080 : 980;
  const gap = players.length >= 3 ? 20 : 30;
  const totalWidth = players.length * cardWidth + Math.max(0, players.length - 1) * gap;

  return (
    <AbsoluteFill
      style={{
        zIndex: 20,
        overflow: 'hidden',
        backgroundColor: '#0b0c0e',
      }}
    >
      {backgroundSrc ? (
        <Img
          src={staticFile(backgroundSrc)}
          style={{position: 'absolute', inset: 0, width: 1080, height: 1920}}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: titleTop,
          color: '#ffffff',
          fontFamily: /[\u0590-\u05ff]/.test(title) ? HEEBO_FONT : ANTON_FONT,
          fontSize: 78,
          fontWeight: 400,
          letterSpacing: 4,
          textAlign: 'center',
          textShadow: '0 5px 18px rgba(0,0,0,0.9)',
          opacity: interpolate(frame, [0, 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: 'absolute',
          left: (1080 - totalWidth) / 2,
          top: 270,
          display: 'flex',
          gap,
        }}
      >
        {players.map((player, index) => (
          <div
            key={player.playerId ?? player.name}
            style={{
              position: 'relative',
              width: cardWidth,
              height: cardHeight,
              overflow: 'hidden',
              borderRadius: 24,
              border: `7px solid ${team.accent}`,
              backgroundColor: '#101113',
              boxShadow: `0 30px 80px rgba(0,0,0,0.65), 0 0 38px ${team.color}66`,
              opacity: interpolate(frame, [4 + index * 5, 16 + index * 5], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              scale: interpolate(frame, [4 + index * 5, 22 + index * 5], [0.82, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              }),
            }}
          >
            <PosterArtwork
              player={player}
              team={team}
              showEmbeddedName
              playLineupClip={playLineupClips}
              lineupClipFreezeFrame={lineupClipFreezeFrame}
            />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
