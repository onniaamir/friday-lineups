import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {summaryBackground} from '../data/lineup-backgrounds';
import {weeklyLineup} from '../data/weekly-lineup';
import {HEEBO_FONT} from '../fonts';
import type {Lineup, Player, Team} from '../types';

const playerAsset = (player: Player) => player.lineupStatic ?? player.image;

const nameFontSize = (name: string, compact = false) => {
  if (compact) {
    return name.length > 9 ? 24 : name.length > 6 ? 27 : 30;
  }

  return name.length > 10 ? 21 : name.length > 7 ? 24 : name.length > 5 ? 27 : 30;
};

const PlayerCard: React.FC<{
  player: Player;
  teamIndex: number;
  playerIndex: number;
}> = ({player, teamIndex, playerIndex}) => {
  const frame = useCurrentFrame();
  const asset = playerAsset(player);
  const revealStart = 18 + teamIndex * 8 + playerIndex * 3;

  return (
    <div
      dir="rtl"
      style={{
        width: 142,
        height: 278,
        flex: '0 0 142px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        opacity: interpolate(frame, [revealStart, revealStart + 11], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        translate: interpolate(frame, [revealStart, revealStart + 15], ['0px 34px', '0px 0px'], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        }),
      }}
    >
      <div
        style={{
          width: 142,
          height: 218,
          flex: '0 0 218px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '4px solid rgba(255,255,255,0.96)',
          color: '#f6ce2e',
          backgroundColor: '#202327',
          boxShadow: '0 9px 18px rgba(0,0,0,0.34)',
          clipPath: 'polygon(5% 0, 97% 2%, 100% 94%, 90% 100%, 2% 96%, 0 7%)',
          fontFamily: HEEBO_FONT,
          fontSize: 48,
          fontWeight: 900,
        }}
      >
        {asset ? (
          <Img
            name={`${player.name} portrait`}
            src={staticFile(asset)}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: 'cover',
              objectPosition: '50% 20%',
            }}
          />
        ) : (
          player.name.slice(0, 1)
        )}
      </div>
      <div
        style={{
          width: 142,
          height: 52,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          overflow: 'visible',
          textAlign: 'center',
          fontFamily: HEEBO_FONT,
          fontSize: nameFontSize(player.name),
          lineHeight: 1.1,
          fontWeight: 800,
          whiteSpace: 'nowrap',
          textShadow: '0 2px 3px rgba(0,0,0,0.28)',
        }}
      >
        {player.name}
      </div>
    </div>
  );
};

const rowBackground = (team: Team) => {
  if (team.id === 'red') {
    return 'linear-gradient(105deg, #a90d24 0%, #dc263d 66%, #fa4d5f 100%)';
  }

  if (team.id === 'white') {
    return 'linear-gradient(105deg, #d6d0c5 0%, #f3efe7 64%, #fffdf7 100%)';
  }

  return 'linear-gradient(105deg, #064fa8 0%, #117bd8 66%, #299df4 100%)';
};

const TeamRow: React.FC<{team: Team; index: number}> = ({team, index}) => {
  const frame = useCurrentFrame();
  const lightTeam = team.id === 'white';

  return (
    <Interactive.Div
      name={`${team.name} team summary`}
      style={{
        height: 380,
        minHeight: 380,
        overflow: 'hidden',
        color: lightTeam ? '#111214' : '#ffffff',
        background: rowBackground(team),
        boxShadow: '0 20px 42px rgba(0,0,0,0.42)',
        clipPath: 'polygon(1% 2%, 98% 0, 100% 94%, 94% 100%, 2% 98%, 0 8%)',
        opacity: interpolate(frame, [3 + index * 7, 16 + index * 7], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        translate: interpolate(frame, [3 + index * 7, 22 + index * 7], ['0px 76px', '0px 0px'], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        }),
      }}
    >
      <div
        dir="rtl"
        style={{
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0 34px',
          borderBottom: `3px solid ${lightTeam ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.3)'}`,
          fontFamily: HEEBO_FONT,
          fontSize: 46,
          lineHeight: 1,
          fontWeight: 900,
          textAlign: 'right',
        }}
      >
        {team.name}
      </div>

      <div
        dir="rtl"
        style={{
          height: 308,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: '14px 22px 12px',
        }}
      >
        {team.players.map((player, playerIndex) => (
          <PlayerCard
            key={`${player.playerId ?? player.name}-${playerIndex}`}
            player={player}
            teamIndex={index}
            playerIndex={playerIndex}
          />
        ))}
      </div>
    </Interactive.Div>
  );
};

const GoalkeeperStrip: React.FC<{players: Player[]}> = ({players}) => {
  const frame = useCurrentFrame();

  if (players.length === 0) {
    return null;
  }

  return (
    <Interactive.Div
      name="Goalkeepers summary"
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 52,
        zIndex: 6,
        minWidth: 510,
        minHeight: 144,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
        padding: '18px 34px',
        color: '#f7f3ea',
        backgroundColor: 'rgba(8,10,12,0.96)',
        borderTop: '7px solid #f1ca2c',
        boxShadow: '0 18px 40px rgba(0,0,0,0.48)',
        clipPath: 'polygon(2% 0, 100% 7%, 97% 100%, 0 91%)',
        translate: interpolate(frame, [48, 68], ['-50% 42px', '-50% 0px'], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        }),
        opacity: interpolate(frame, [48, 62], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
      dir="rtl"
    >
      <div style={{fontFamily: HEEBO_FONT, color: '#f1ca2c', fontSize: 34, fontWeight: 900}}>
        שוערים
      </div>
      {players.map((player, playerIndex) => {
        const asset = playerAsset(player);

        return (
          <div
            key={`${player.playerId ?? player.name}-${playerIndex}`}
            style={{display: 'flex', alignItems: 'center', gap: 10}}
          >
            <div
              style={{
                width: 76,
                height: 76,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderRadius: '50%',
                border: '4px solid #f1ca2c',
                backgroundColor: '#262a2f',
                fontSize: 32,
                fontWeight: 900,
              }}
            >
              {asset ? (
                <Img
                  name={`${player.name} goalkeeper portrait`}
                  src={staticFile(asset)}
                  style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%'}}
                />
              ) : (
                player.name.slice(0, 1)
              )}
            </div>
            <div
              style={{
                maxWidth: 150,
                fontFamily: HEEBO_FONT,
                fontSize: nameFontSize(player.name, true),
                lineHeight: 1,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              {player.name}
            </div>
          </div>
        );
      })}
    </Interactive.Div>
  );
};

export const FinalScene: React.FC<{lineup?: Lineup}> = ({lineup = weeklyLineup}) => {
  const frame = useCurrentFrame();
  const teamsByVisualOrder = ['red', 'white', 'blue']
    .map((teamId) => lineup.teams.find((team) => team.id === teamId))
    .filter((team): team is Team => Boolean(team));

  return (
    <AbsoluteFill style={{overflow: 'hidden', fontFamily: HEEBO_FONT}}>
      <Img
        name="All teams summary background"
        src={staticFile(summaryBackground)}
        style={{position: 'absolute', inset: 0, width: 1080, height: 1920}}
      />

      <div
        style={{
          position: 'absolute',
          left: 48,
          right: 48,
          top: 232,
          zIndex: 4,
          display: 'grid',
          gap: 22,
        }}
      >
        {teamsByVisualOrder.map((team, index) => (
          <TeamRow key={team.id} team={team} index={index} />
        ))}
      </div>

      <GoalkeeperStrip players={lineup.goalkeepers} />

      {lineup.groupIcon ? (
        <Interactive.Div
          name="Football group icon"
          style={{
            position: 'absolute',
            left: '50%',
            top: 26,
            zIndex: 8,
            width: 170,
            height: 170,
            padding: 7,
            overflow: 'hidden',
            borderRadius: '50%',
            border: '5px solid rgba(255,255,255,0.98)',
            backgroundColor: '#ffffff',
            boxShadow: '0 14px 38px rgba(0,0,0,0.45)',
            translate: '-50% 0px',
            opacity: interpolate(frame, [10, 25], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            scale: interpolate(frame, [10, 29], [0.72, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.out(Easing.cubic),
            }),
          }}
        >
          <Img
            name="Football group icon image"
            src={staticFile(lineup.groupIcon)}
            style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}
          />
        </Interactive.Div>
      ) : null}
    </AbsoluteFill>
  );
};
