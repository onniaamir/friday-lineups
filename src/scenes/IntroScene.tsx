import {AbsoluteFill, Img, staticFile} from 'remotion';
import {matchdayBackground} from '../data/lineup-backgrounds';
import {ANONYMOUS_PLAYER_ASSET, playerPosterAsset} from '../data/player-assets';
import {weeklyLineup} from '../data/weekly-lineup';
import {ANTON_FONT} from '../fonts';
import type {Player, Team} from '../types';

const selectPlayer = (teamId: string) => {
  const team = weeklyLineup.teams.find((candidate) => candidate.id === teamId) ?? weeklyLineup.teams[0];
  const player =
    team.players.find((candidate) => candidate.poster) ??
    team.players.find((candidate) => candidate.lineupStatic) ??
    team.players.find((candidate) => candidate.image) ??
    team.players[0];
  return {team, player};
};

const PosterPanel: React.FC<{
  team: Team;
  player?: Player;
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  objectPosition: string;
  zIndex: number;
}> = ({team, player, left, top, width, height, angle, objectPosition, zIndex}) => {
  const source = player ? playerPosterAsset(player) : ANONYMOUS_PLAYER_ASSET;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        zIndex,
        rotate: `${angle}deg`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          clipPath: 'polygon(4% 0, 100% 3%, 96% 100%, 0 96%)',
          border: `18px solid ${team.color}`,
          backgroundColor: '#151619',
          boxShadow: `0 30px 68px rgba(0,0,0,0.52), 0 0 0 7px rgba(0,0,0,0.78), 0 0 42px ${team.color}cc`,
        }}
      >
        <Img
          src={staticFile(source)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition,
            filter: 'grayscale(0.78) contrast(1.14) saturate(0.42)',
          }}
        />
        <div style={{position: 'absolute', inset: 10, border: `5px solid ${team.color}`}} />
      </div>
    </div>
  );
};

export const IntroScene: React.FC = () => {
  const blue = selectPlayer('blue');
  const white = selectPlayer('white');
  const red = selectPlayer('red');

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Img
        src={staticFile(matchdayBackground)}
        style={{position: 'absolute', inset: 0, width: 1080, height: 1920}}
      />

      <PosterPanel
        team={blue.team}
        player={blue.player}
        left={35}
        top={155}
        width={470}
        height={660}
        angle={-5}
        objectPosition="48% 50%"
        zIndex={2}
      />
      <PosterPanel
        team={white.team}
        player={white.player}
        left={575}
        top={250}
        width={470}
        height={650}
        angle={4}
        objectPosition="50% 50%"
        zIndex={3}
      />
      <PosterPanel
        team={red.team}
        player={red.player}
        left={290}
        top={760}
        width={500}
        height={650}
        angle={-3}
        objectPosition="52% 50%"
        zIndex={4}
      />

      <div
        style={{
          position: 'absolute',
          left: -35,
          right: -35,
          top: 1372,
          zIndex: 10,
          height: 30,
          rotate: '1deg',
          backgroundColor: '#1677ff',
          clipPath: 'polygon(0 22%, 100% 0, 96% 100%, 4% 77%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -55,
          right: -55,
          top: 1390,
          zIndex: 11,
          height: 260,
          rotate: '-2deg',
          backgroundColor: '#08090a',
          clipPath: 'polygon(0 9%, 100% 0, 97% 88%, 2% 100%)',
          boxShadow: '0 24px 55px rgba(0,0,0,0.42)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -25,
          right: -25,
          top: 1622,
          zIndex: 10,
          height: 26,
          rotate: '-3deg',
          backgroundColor: '#ef3340',
          clipPath: 'polygon(0 0, 97% 16%, 100% 100%, 4% 72%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 238,
          right: 28,
          top: 1432,
          zIndex: 13,
          color: '#ffffff',
          fontFamily: ANTON_FONT,
          fontSize: 162,
          lineHeight: 1,
          fontWeight: 400,
          letterSpacing: 2,
          textAlign: 'center',
          textShadow: '0 9px 0 rgba(0,0,0,0.58)',
          rotate: '-2deg',
        }}
      >
        MATCHDAY
      </div>

      {weeklyLineup.groupIcon ? (
        <div
          style={{
            position: 'absolute',
            left: 55,
            top: 1425,
            zIndex: 14,
            width: 166,
            height: 166,
            padding: 8,
            overflow: 'hidden',
            borderRadius: '50%',
            border: '5px solid rgba(255,255,255,0.98)',
            backgroundColor: '#ffffff',
            boxShadow: '0 16px 42px rgba(0,0,0,0.38)',
          }}
        >
          <Img
            src={staticFile(weeklyLineup.groupIcon)}
            style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
