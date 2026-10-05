import { Composition } from "remotion";
import { Promo, PROMO_DURATION } from "./Promo";
import { Promo60, PROMO60_DURATION } from "./Promo60";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Promo" component={Promo} durationInFrames={PROMO_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="Promo60" component={Promo60} durationInFrames={PROMO60_DURATION} fps={30} width={1920} height={1080} />
  </>
);
