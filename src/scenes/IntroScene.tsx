import {AbsoluteFill, Img, staticFile} from 'remotion';
import {selectIntroLayout, type IntroPosterLayout} from '../data/intro-layouts';
import {selectMatchdayBackground} from '../data/lineup-backgrounds';
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
} & IntroPosterLayout> = ({team, player, left, top, width, height, angle, objectPosition, zIndex}) => {
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

export const IntroScene: React.FC<{variationDate?: string}> = ({variationDate = weeklyLineup.matchDate}) => {
  const blue = selectPlayer('blue');
  const white = selectPlayer('white');
  const red = selectPlayer('red');
  const matchdayBackground = selectMatchdayBackground(variationDate);
  const layout = selectIntroLayout(variationDate);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Img
        src={staticFile(matchdayBackground)}
        style={{position: 'absolute', inset: 0, width: 1080, height: 1920}}
      />

      <PosterPanel
        team={blue.team}
        player={blue.player}
        {...layout.posters.blue}
      />
      <PosterPanel
        team={white.team}
        player={white.player}
        {...layout.posters.white}
      />
      <PosterPanel
        team={red.team}
        player={red.player}
        {...layout.posters.red}
      />

      <div
        style={{
          position: 'absolute',
          left: -35,
          right: -35,
          top: layout.banner.topAccent.top,
          zIndex: 10,
          height: layout.banner.topAccent.height,
          rotate: `${layout.banner.topAccent.rotate}deg`,
          backgroundColor: layout.banner.topAccent.color,
          clipPath: layout.banner.topAccent.clipPath,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -55,
          right: -55,
          top: layout.banner.top,
          zIndex: 11,
          height: layout.banner.height,
          rotate: `${layout.banner.rotate}deg`,
          background: layout.banner.background,
          clipPath: layout.banner.clipPath,
          boxShadow: '0 24px 55px rgba(0,0,0,0.42)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -25,
          right: -25,
          top: layout.banner.bottomAccent.top,
          zIndex: 10,
          height: layout.banner.bottomAccent.height,
          rotate: `${layout.banner.bottomAccent.rotate}deg`,
          backgroundColor: layout.banner.bottomAccent.color,
          clipPath: layout.banner.bottomAccent.clipPath,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: layout.banner.title.left,
          right: layout.banner.title.right,
          top: layout.banner.title.top,
          zIndex: 13,
          color: layout.banner.title.color,
          fontFamily: ANTON_FONT,
          fontSize: layout.banner.title.fontSize,
          lineHeight: 1,
          fontWeight: 400,
          letterSpacing: 2,
          textAlign: 'center',
          textShadow: layout.banner.title.textShadow,
          rotate: `${layout.banner.title.rotate}deg`,
        }}
      >
        MATCHDAY
      </div>

      {weeklyLineup.groupIcon ? (
        <div
          style={{
            position: 'absolute',
            left: layout.banner.icon.left,
            right: layout.banner.icon.right,
            top: layout.banner.icon.top,
            zIndex: 14,
            width: layout.banner.icon.size,
            height: layout.banner.icon.size,
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
