import {Audio} from '@remotion/media';
import {AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {weeklyLineup} from './data/weekly-lineup';
import {FinalScene} from './scenes/FinalScene';
import {GoalkeeperScene} from './scenes/GoalkeeperScene';
import {IntroScene} from './scenes/IntroScene';
import {TeamScene} from './scenes/TeamScene';
import {
  FINAL_SCENE_DURATION,
  GOALKEEPER_SCENE_DURATION,
  OPENING_DURATION,
  SILENT_SUMMARY_HOLD_DURATION,
  finalSceneStart,
  goalkeeperSceneStart,
  teamSceneDuration,
  teamSceneStart,
  totalDuration,
} from './timing';

export const SundayLineups: React.FC<{variationDate?: string}> = ({variationDate}) => {
  const frame = useCurrentFrame();
  const compositionDuration = totalDuration(weeklyLineup);
  const musicDuration = compositionDuration - SILENT_SUMMARY_HOLD_DURATION;
  const musicVolume = interpolate(
    frame,
    [0, 3, musicDuration - 60, musicDuration - 1],
    [0, 0.82, 0.82, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  return (
    <AbsoluteFill style={{backgroundColor: '#07110f'}}>
      <Audio
        src={staticFile('private/audio/lineup-theme-trimmed.mp3')}
        durationInFrames={musicDuration}
        loop
        volume={musicVolume}
      />
      <Sequence from={0} durationInFrames={OPENING_DURATION} premountFor={30} name="Opening title">
        <IntroScene variationDate={variationDate} />
      </Sequence>
      {weeklyLineup.teams.map((team, teamIndex) => (
        <Sequence
          key={team.id}
          from={teamSceneStart(weeklyLineup.teams, teamIndex)}
          durationInFrames={teamSceneDuration(team)}
          premountFor={30}
          name={`${team.name} positional reveals`}
        >
          <TeamScene team={team} />
        </Sequence>
      ))}
      {weeklyLineup.goalkeepers.length > 0 ? (
        <Sequence
          from={goalkeeperSceneStart(weeklyLineup.teams)}
          durationInFrames={GOALKEEPER_SCENE_DURATION}
          premountFor={30}
          name="Neutral goalkeepers"
        >
          <GoalkeeperScene goalkeepers={weeklyLineup.goalkeepers} />
        </Sequence>
      ) : null}
      <Sequence
        from={finalSceneStart(weeklyLineup)}
        durationInFrames={FINAL_SCENE_DURATION}
        premountFor={30}
        name="All teams overview"
      >
        <FinalScene />
      </Sequence>
    </AbsoluteFill>
  );
};
