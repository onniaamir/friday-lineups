import {Composition} from 'remotion';
import {SundayLineups} from './SundayLineups';
import {finalSummaryPreviewLineup} from './data/final-summary-preview';
import {weeklyLineup} from './data/weekly-lineup';
import {FinalScene} from './scenes/FinalScene';
import {FPS, totalDuration} from './timing';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SundayLineups"
        component={SundayLineups}
        durationInFrames={totalDuration(weeklyLineup)}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="FinalSummaryPreview"
        component={FinalScene}
        defaultProps={{lineup: finalSummaryPreviewLineup}}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
