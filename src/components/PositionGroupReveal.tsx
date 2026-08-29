import {Video} from '@remotion/media';
import {AbsoluteFill, Easing, Freeze, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import type {PitchBounds} from '../data/lineup-backgrounds';
import {playerLineupAsset, playerPosterAsset} from '../data/player-assets';
import {HEEBO_FONT} from '../fonts';
import type {Player, Team} from '../types';
import {CaptainBadge} from './CaptainBadge';
import {MARKER_HEIGHT, MARKER_WIDTH} from './PlayerMarker';

const largeCardLayout = (count: number, index: number) => {
  if (count === 1) {
    return {left: 245, top: 275, width: 590, height: 1180};
  }

  if (count === 2) {
    return {left: 70 + index * 470, top: 330, width: 440, height: 1080};
  }

  return {left: 44 + index * 330, top: 355, width: 332, height: 1025};
};

const PosterArtwork: React.FC<{
  player: Player;
  team: Team;
  compact?: boolean;
  showEmbeddedName?: boolean;
  playLineupClip?: boolean;
  lineupClipFreezeFrame?: number;
}> = ({
  player,
  team,
  compact = false,
  showEmbeddedName = false,
  playLineupClip = false,
  lineupClipFreezeFrame,
}) => {
  const frame = useCurrentFrame();
  const stillAsset = playLineupClip ? playerLineupAsset(player) : playerPosterAsset(player);
  const showClip =
    playLineupClip && player.lineupClip && (lineupClipFreezeFrame !== undefined || frame < 73);

  const lineupVideo = showClip ? (
    <Video
      src={staticFile(player.lineupClip!)}
      muted
      objectFit="cover"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectPosition: '50% 50%',
        filter: 'contrast(1.12) saturate(0.9)',
      }}
    />
  ) : null;

  return (
    <>
      {showClip ? (
        lineupClipFreezeFrame === undefined ? (
          lineupVideo
        ) : (
          <Freeze
            frame={lineupClipFreezeFrame}
            active={(currentFrame) => currentFrame > lineupClipFreezeFrame}
          >
            {lineupVideo}
          </Freeze>
        )
      ) : (
        <Img
          src={staticFile(stillAsset)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '50% 50%',
            filter: 'contrast(1.12) saturate(0.9)',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: showEmbeddedName
            ? `linear-gradient(180deg, transparent 38%, rgba(0,0,0,0.92) 100%), linear-gradient(120deg, ${team.color}32, transparent 55%)`
            : `linear-gradient(180deg, transparent 72%, rgba(0,0,0,0.2) 100%), linear-gradient(120deg, ${team.color}1f, transparent 55%)`,
        }}
      />
      {showEmbeddedName ? (
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            left: compact ? 7 : 22,
            right: compact ? 7 : 22,
            bottom: compact ? 8 : 24,
            color: '#ffffff',
            fontFamily: HEEBO_FONT,
            fontSize: compact ? (player.name.length > 7 ? 18 : 22) : player.name.length > 7 ? 48 : 62,
            lineHeight: 0.95,
            fontWeight: 900,
            textAlign: 'center',
            textShadow: '0 4px 12px rgba(0,0,0,0.78)',
            whiteSpace: 'nowrap',
          }}
        >
          {player.name}
        </div>
      ) : null}
    </>
  );
};

export const PositionGroupReveal: React.FC<{
  players: Player[];
  team: Team;
  pitchBounds: PitchBounds;
}> = ({players, team, pitchBounds}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {players.map((player, index) => {
        const large = largeCardLayout(players.length, index);
        const targetLeft = pitchBounds.left + (player.x / 100) * pitchBounds.width - MARKER_WIDTH / 2;
        const targetTop = pitchBounds.top + (player.y / 100) * pitchBounds.height - MARKER_HEIGHT / 2;

        return (
          <div
            key={player.name}
            style={{
              position: 'absolute',
              zIndex: 14,
              left: interpolate(frame, [0, 12, 73, 97], [large.left, large.left, large.left, targetLeft], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              }),
              top: interpolate(frame, [0, 12, 73, 97], [large.top + 110, large.top, large.top, targetTop], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              }),
              width: interpolate(frame, [0, 12, 73, 97], [large.width, large.width, large.width, MARKER_WIDTH], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              }),
              height: interpolate(frame, [0, 12, 73, 97], [large.height, large.height, large.height, MARKER_HEIGHT], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              }),
              overflow: 'visible',
              opacity: interpolate(frame, [0, 8], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                borderRadius: interpolate(frame, [0, 12, 73, 97], [34, 20, 20, 13], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
                border: `6px solid ${team.id === 'white' ? '#ffffff' : team.accent}`,
                backgroundColor: '#101113',
                boxShadow: `0 28px 70px rgba(0,0,0,0.58), 0 0 34px ${team.color}60`,
              }}
            >
              <PosterArtwork player={player} team={team} playLineupClip />
            </div>
            {team.captainId === player.playerId ? (
              <div
                style={{
                  position: 'absolute',
                  top: 28,
                  right: -13,
                  zIndex: 3,
                  scale: players.length === 1 ? 1 : players.length === 2 ? 0.84 : 0.72,
                  transformOrigin: 'top right',
                  opacity: interpolate(frame, [4, 14, 65, 75], [0, 1, 1, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                }}
              >
                <CaptainBadge showLabel={players.length === 1} />
              </div>
            ) : null}
            <div
              dir="rtl"
              style={{
                position: 'absolute',
                left: '50%',
                top: 'calc(100% + 18px)',
                width: players.length === 1 ? '104%' : '112%',
                minHeight: players.length === 1 ? 102 : 86,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 22px 14px',
                color: team.id === 'white' ? '#111214' : '#ffffff',
                backgroundColor: team.color,
                clipPath: 'polygon(1% 8%, 100% 0, 97% 91%, 0 100%)',
                boxShadow: '0 14px 32px rgba(0,0,0,0.42)',
                fontFamily: HEEBO_FONT,
                fontSize:
                  players.length === 1
                    ? player.name.length > 8
                      ? 58
                      : 72
                    : player.name.length > 8
                      ? 42
                      : 52,
                lineHeight: 1,
                fontWeight: 900,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                translate: '-50% 0px',
                opacity: interpolate(frame, [3, 13, 64, 75], [0, 1, 1, 0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              {player.name}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export {PosterArtwork};
