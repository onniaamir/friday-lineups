import {AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {PlayerMarker} from '../components/PlayerMarker';
import {CaptainBadge} from '../components/CaptainBadge';
import {PositionGroupReveal} from '../components/PositionGroupReveal';
import {optimizeFormation} from '../data/formation';
import {teamBackgrounds} from '../data/lineup-backgrounds';
import {playerLineupAsset} from '../data/player-assets';
import {HEEBO_FONT} from '../fonts';
import {
  CENTER_BACK_START,
  FORWARDS_START,
  GROUP_REVEAL_DURATION,
  SUBSTITUTE_SCENE_DURATION,
  SUBSTITUTE_START,
  TEAM_SUMMARY_HOLD_DURATION,
  WIDE_DEFENDERS_START,
} from '../timing';
import type {Player, Team} from '../types';

const SubstituteOverlay: React.FC<{players: Player[]; team: Team}> = ({players, team}) => {
  const frame = useCurrentFrame();
  const darkText = team.id === 'white';

  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        top: 72,
        right: 42,
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        opacity: interpolate(frame, [0, 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        translate: interpolate(frame, [0, 17], ['80px 0px', '0px 0px'], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        }),
      }}
    >
      <div
        style={{
          minWidth: 184,
          padding: '9px 24px 11px',
          color: darkText ? '#111214' : '#ffffff',
          backgroundColor: team.color,
          border: '4px solid rgba(255,255,255,0.96)',
          clipPath: 'polygon(3% 5%, 100% 0, 96% 95%, 0 100%)',
          boxShadow: '0 10px 24px rgba(0,0,0,0.42)',
          fontFamily: HEEBO_FONT,
          fontSize: 34,
          lineHeight: 1,
          fontWeight: 900,
          textAlign: 'center',
        }}
      >
        {players.length === 1 ? 'מחליף' : 'מחליפים'}
      </div>
      <div style={{display: 'flex', gap: 14}}>
        {players.map((player) => {
          const source = playerLineupAsset(player);

          return (
            <div
              key={player.playerId ?? player.name}
              style={{position: 'relative', width: 178, textAlign: 'center'}}
            >
              <div
                style={{
                  width: 178,
                  height: 220,
                  overflow: 'hidden',
                  borderRadius: 14,
                  border: `8px solid ${team.color}`,
                  outline: '4px solid rgba(255,255,255,0.96)',
                  color: darkText ? '#111214' : '#ffffff',
                  background: `linear-gradient(155deg, ${team.color}, #101113 82%)`,
                  boxShadow: `0 16px 34px rgba(0,0,0,0.5), 0 0 26px ${team.color}75`,
                }}
              >
                <Img src={staticFile(source)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              </div>
              {team.captainId === player.playerId ? (
                <div style={{position: 'absolute', top: 8, right: -13, zIndex: 3, scale: 0.82}}>
                  <CaptainBadge compact />
                </div>
              ) : null}
              <div
                style={{
                  marginTop: 9,
                  padding: '6px 8px 8px',
                  color: darkText ? '#111214' : '#ffffff',
                  backgroundColor: team.color,
                  fontFamily: HEEBO_FONT,
                  fontSize: 27,
                  lineHeight: 1,
                  fontWeight: 900,
                  clipPath: 'polygon(2% 5%, 100% 0, 97% 94%, 0 100%)',
                  boxShadow: '0 8px 18px rgba(0,0,0,0.36)',
                }}
              >
                {player.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const markerStart = (position: string) => {
  if (position === 'CB') return CENTER_BACK_START + 93;
  if (position === 'LB' || position === 'RB') return WIDE_DEFENDERS_START + 93;
  return FORWARDS_START + 93;
};

export const TeamScene: React.FC<{team: Team}> = ({team}) => {
  const darkText = team.id === 'white';
  const background = teamBackgrounds[team.id] ?? teamBackgrounds.blue;
  const {starters, substitutes} = optimizeFormation(team.players, team.formationLocked);
  const centerBack = starters.filter((player) => player.position === 'CB');
  const wideDefenders = starters
    .filter((player) => player.position === 'LB' || player.position === 'RB')
    .sort((left, right) => left.x - right.x);
  const forwards = starters
    .filter((player) => player.position === 'LF' || player.position === 'RF')
    .sort((left, right) => left.x - right.x);

  return (
    <AbsoluteFill style={{overflow: 'hidden', fontFamily: HEEBO_FONT}}>
      <Img
        src={staticFile(background.src)}
        style={{position: 'absolute', inset: 0, width: 1080, height: 1920}}
      />
      <div
        style={{
          position: 'absolute',
          left: background.pitchBounds.left,
          top: background.pitchBounds.top,
          width: background.pitchBounds.width,
          height: background.pitchBounds.height,
        }}
      >
        {starters.map((player) => (
          <PlayerMarker
            key={player.playerId ?? player.name}
            player={player}
            color={team.color}
            darkText={darkText}
            startFrame={markerStart(player.position)}
            isCaptain={team.captainId === player.playerId}
          />
        ))}
      </div>

      <Sequence from={CENTER_BACK_START} durationInFrames={GROUP_REVEAL_DURATION} premountFor={30}>
        <PositionGroupReveal players={centerBack} team={team} pitchBounds={background.pitchBounds} />
      </Sequence>
      <Sequence from={WIDE_DEFENDERS_START} durationInFrames={GROUP_REVEAL_DURATION} premountFor={30}>
        <PositionGroupReveal players={wideDefenders} team={team} pitchBounds={background.pitchBounds} />
      </Sequence>
      <Sequence from={FORWARDS_START} durationInFrames={GROUP_REVEAL_DURATION} premountFor={30}>
        <PositionGroupReveal players={forwards} team={team} pitchBounds={background.pitchBounds} />
      </Sequence>
      {substitutes.length > 0 ? (
        <Sequence
          from={SUBSTITUTE_START}
          durationInFrames={SUBSTITUTE_SCENE_DURATION + TEAM_SUMMARY_HOLD_DURATION}
          premountFor={30}
        >
          <SubstituteOverlay players={substitutes} team={team} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
