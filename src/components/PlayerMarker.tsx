import {Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {playerLineupAsset} from '../data/player-assets';
import {HEEBO_FONT} from '../fonts';
import type {Player} from '../types';
import {CaptainBadge} from './CaptainBadge';

export const MARKER_WIDTH = 176;
export const MARKER_HEIGHT = 225;

export const PlayerMarker: React.FC<{
  player: Player;
  color: string;
  darkText: boolean;
  startFrame: number;
  isCaptain?: boolean;
}> = ({player, color, darkText, startFrame, isCaptain = false}) => {
  const frame = useCurrentFrame();
  const presentationAsset = playerLineupAsset(player);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${player.x}%`,
        top: `${player.y}%`,
        width: MARKER_WIDTH,
        height: MARKER_HEIGHT,
        overflow: 'visible',
        translate: '-50% -50%',
        opacity: interpolate(frame, [startFrame, startFrame + 6], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        }),
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: 13,
          color: darkText ? '#111214' : '#ffffff',
          background: `linear-gradient(155deg, ${color}, #101113 82%)`,
          border: `5px solid ${color}`,
          boxShadow: `0 13px 32px rgba(0,0,0,0.48), 0 0 22px ${color}65`,
        }}
      >
        <Img
          src={staticFile(presentationAsset)}
          style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </div>

      {isCaptain ? (
        <div style={{position: 'absolute', top: 7, right: -13, zIndex: 3, scale: 0.82}}>
          <CaptainBadge compact />
        </div>
      ) : null}

      <div
        dir="rtl"
        style={{
          position: 'absolute',
          left: -16,
          top: MARKER_HEIGHT + 9,
          width: MARKER_WIDTH + 32,
          minHeight: 45,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 10px 7px',
          color: darkText ? '#111214' : '#ffffff',
          backgroundColor: color,
          clipPath: 'polygon(2% 7%, 100% 0, 97% 91%, 0 100%)',
          boxShadow: '0 8px 18px rgba(0,0,0,0.36)',
          fontFamily: HEEBO_FONT,
          fontSize: player.name.length > 8 ? 21 : 25,
          lineHeight: 1,
          fontWeight: 900,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {player.name}
      </div>
    </div>
  );
};
