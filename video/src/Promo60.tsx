import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { Background } from "./Background";
import { DEMO_DURATION, Demo } from "./Demo";
import { Features, Hook, Intro, Outro, Scene, Types } from "./Promo";

// 60秒版：実際に回答して結果をスクロールする操作画面入り
export const PROMO60_DURATION = 1800;

const PARTS = [
  { component: Hook, len: 150 },
  { component: Intro, len: 150 },
  { component: Features, len: 150 },
  { component: Demo, len: DEMO_DURATION },
  { component: Types, len: 180 },
  { component: Outro, len: 210 },
];

const DEMO_FROM = 450;

// 操作画面の間はタップ音が聞こえるようにBGMを少し下げる
const bgmVolume = (f: number) =>
  interpolate(f, [DEMO_FROM - 15, DEMO_FROM + 15, DEMO_FROM + DEMO_DURATION - 15, DEMO_FROM + DEMO_DURATION + 15], [0.9, 0.5, 0.5, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const Promo60: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill>
      <Background />
      <Audio src={staticFile("bgm.wav")} volume={bgmVolume} />
      {PARTS.map(({ component: Part, len }, i) => {
        const start = from;
        from += len;
        return (
          <Sequence key={i} from={start} durationInFrames={len}>
            <Scene len={len} last={i === PARTS.length - 1}>
              <Part />
            </Scene>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
