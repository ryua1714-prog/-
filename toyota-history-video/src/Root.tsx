import {Composition} from 'remotion';
import {ToyotaHistory, TOTAL_FRAMES} from './ToyotaHistory';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ToyotaHistory"
    component={ToyotaHistory}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
