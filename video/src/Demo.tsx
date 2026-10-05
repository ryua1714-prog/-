import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import meta from "../public/capture/meta.json";
import { AnimatedText } from "./AnimatedText";
import { colors } from "./theme";

// 実際の診断ページ（scripts/capture.mjs で撮影）をスマホの中で操作して見せるシーン
export const DEMO_DURATION = 960;

const SCREEN_W = 390;
const SCREEN_H = 844;
const PHONE_SCALE = 1.08;

type Point = { x: number; y: number };
type Tap = { frame: number; at: Point };
type Shot = { frame: number; image: string };

// ---- 台本 ----
const START_TAP = 80;
const Q_BASE = 120; // Q1が出るフレーム
const Q_LEN = 60;
const FAST_BASE = Q_BASE + Q_LEN * 4; // 早送り
const FAST_LEN = 17;
const RESULT_AT = FAST_BASE + FAST_LEN * meta.fast.length + 40; // 結果が出るフレーム

const shots: Shot[] = [{ frame: 0, image: "start" }];
const taps: Tap[] = [{ frame: START_TAP, at: meta.startButton }];
meta.questions.forEach((at, i) => {
  const base = Q_BASE + i * Q_LEN;
  shots.push({ frame: base, image: `q${i + 1}` });
  taps.push({ frame: base + 34, at });
  shots.push({ frame: base + 36, image: `q${i + 1}-selected` });
});
meta.fast.forEach((q, i) => {
  const f = FAST_BASE + i * FAST_LEN + 4;
  taps.push({ frame: f, at: q });
  shots.push({ frame: f + 1, image: q.image });
});

// 結果画面のスクロール（[開始, 終了, スクロール位置]）
const SCROLLS: [number, number, number][] = [
  [RESULT_AT + 75, RESULT_AT + 120, 330],
  [RESULT_AT + 175, RESULT_AT + 230, 1250],
  [RESULT_AT + 265, RESULT_AT + 320, 2350],
  [RESULT_AT + 350, RESULT_AT + 405, 3450],
];

const CAPTIONS: { from: number; to: number; lines: { text: string; color?: string }[] }[] = [
  { from: 0, to: Q_BASE, lines: [{ text: "スマホで" }, { text: "すぐはじめられる！", color: colors.accent }] },
  { from: Q_BASE, to: FAST_BASE, lines: [{ text: "直感で" }, { text: "ポチポチ選ぶだけ", color: colors.accent }] },
  { from: FAST_BASE, to: RESULT_AT, lines: [{ text: "全50問・約5分" }, { text: "サクサク進む！", color: colors.accent }] },
  { from: RESULT_AT, to: SCROLLS[0][0] + 10, lines: [{ text: "あなたの子育ては…" }, { text: "挑戦型！", color: "#ee7d1f" }] },
  { from: SCROLLS[0][0] + 10, to: SCROLLS[1][0], lines: [{ text: "子育てバランスが" }, { text: "グラフでひと目で", color: colors.accent }] },
  { from: SCROLLS[1][0], to: DEMO_DURATION, lines: [{ text: "タイプの特徴や" }, { text: "気をつけることまで", color: colors.accent }, { text: "じっくり解説" }] },
];

const ease = Easing.inOut(Easing.cubic);

// ---- 画面の中身 ----
const ScreenContent: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= RESULT_AT) {
    const t = frame - RESULT_AT;
    let y = 0;
    for (const [s, e, to] of SCROLLS) {
      if (frame >= s) y = interpolate(frame, [s, e], [y, to], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    }
    const reveal = spring({ frame: t, fps: 30, config: { damping: 14 } });
    return (
      <>
        <Img src={staticFile("capture/result.png")} style={{ position: "absolute", width: SCREEN_W, top: -y, transform: `scale(${0.9 + 0.1 * reveal})`, transformOrigin: "50% 15%", opacity: reveal }} />
        <Confetti t={t} />
      </>
    );
  }
  // 結果直前は「診断中」の小休止
  if (frame >= RESULT_AT - 30) {
    const t = frame - (RESULT_AT - 30);
    return (
      <AbsoluteFill style={{ background: "#faf6ef", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 14 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: colors.accent, transform: `translateY(${Math.sin((t - i * 4) / 3) * -10}px)` }} />
          ))}
        </div>
      </AbsoluteFill>
    );
  }
  const current = [...shots].reverse().find((s) => s.frame <= frame)!;
  const index = shots.indexOf(current);
  const isNewQuestion = !current.image.endsWith("selected") && index > 0 && !current.image.startsWith("fast");
  const enter = isNewQuestion ? interpolate(frame - current.frame, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) : 1;
  const prev = shots[index - 1];
  return (
    <>
      {prev && enter < 1 && <Img src={staticFile(`capture/${prev.image}.png`)} style={{ position: "absolute", width: SCREEN_W, transform: `translateX(${-enter * 60}px)`, opacity: 1 - enter }} />}
      <Img src={staticFile(`capture/${current.image}.png`)} style={{ position: "absolute", width: SCREEN_W, transform: `translateX(${(1 - enter) * 60}px)`, opacity: enter }} />
    </>
  );
};

const Confetti: React.FC<{ t: number }> = ({ t }) => (
  <>
    {new Array(40).fill(0).map((_, i) => {
      const a = random(`a${i}`) * Math.PI * 2;
      const v = 6 + random(`v${i}`) * 9;
      const x = 195 + Math.cos(a) * v * t;
      const y = 180 + Math.sin(a) * v * t + 0.35 * t * t;
      const c = ["#ee7d1f", "#ffd25e", "#7fd6c0", "#f6a6b2", "#8fc6f2", "#c3a8ef"][i % 6];
      return (
        <div key={i} style={{ position: "absolute", left: x, top: y, width: 12, height: 7, background: c, borderRadius: 2, transform: `rotate(${t * 20 + i * 40}deg)`, opacity: interpolate(t, [0, 40, 55], [1, 1, 0], { extrapolateRight: "clamp" }) }} />
      );
    })}
  </>
);

// ---- タップの指 ----
const cursorAt = (frame: number): Point => {
  const keys: { frame: number; at: Point }[] = [{ frame: 30, at: { x: 300, y: 760 } }];
  taps.forEach((tap) => keys.push({ frame: tap.frame - 4, at: tap.at }, { frame: tap.frame + 6, at: tap.at }));
  let p = keys[0].at;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame <= a.frame) break;
    const k = interpolate(frame, [a.frame, b.frame], [0, 1], { extrapolateRight: "clamp", easing: ease });
    p = { x: a.at.x + (b.at.x - a.at.x) * k, y: a.at.y + (b.at.y - a.at.y) * k };
  }
  return p;
};

const Finger: React.FC = () => {
  const frame = useCurrentFrame();
  const lastTap = taps[taps.length - 1].frame;
  const visible = interpolate(frame, [30, 40, lastTap + 8, lastTap + 16], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p = cursorAt(frame);
  const near = Math.min(...taps.map((t) => Math.abs(frame - t.frame)));
  const press = near < 4 ? 0.75 + near * 0.06 : 1;
  return (
    <>
      {taps.map((t, i) => <Ripple key={i} t={frame - t.frame} at={t.at} />)}
      {visible > 0 && <TouchDot x={p.x} y={p.y} scale={press} opacity={visible} />}
      <Swipes />
    </>
  );
};

const TouchDot: React.FC<{ x: number; y: number; scale: number; opacity: number }> = ({ x, y, scale, opacity }) => (
  <div style={{ position: "absolute", left: x - 26, top: y - 26, width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.55)", border: "3px solid rgba(80,70,60,0.45)", boxShadow: "0 4px 14px rgba(0,0,0,0.18)", transform: `scale(${scale})`, opacity }} />
);

const Ripple: React.FC<{ t: number; at: Point }> = ({ t, at }) => {
  if (t < 0 || t > 16) return null;
  const k = t / 16;
  return <div style={{ position: "absolute", left: at.x - 60, top: at.y - 60, width: 120, height: 120, borderRadius: "50%", border: `5px solid ${colors.accent}`, transform: `scale(${0.3 + k})`, opacity: 1 - k }} />;
};

const Swipes: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {SCROLLS.map(([s, e], i) => {
        if (frame < s - 8 || frame > e + 4) return null;
        const k = interpolate(frame, [s, s + (e - s) * 0.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        const o = interpolate(frame, [s - 8, s, e - 6, e + 4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <TouchDot key={i} x={250} y={700 - 420 * k} scale={1} opacity={o} />;
      })}
    </>
  );
};

// ---- スマホ ----
const STATUS_BAR = 44;

const StatusBar: React.FC = () => (
  <div style={{ position: "absolute", top: 0, left: 0, width: SCREEN_W, height: STATUS_BAR, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 30px 0", boxSizing: "border-box", fontFamily: "sans-serif", fontWeight: 700, fontSize: 15, color: "#2e2a25", background: "#faf6ef" }}>
    <span>9:41</span>
    <span style={{ letterSpacing: 2 }}>▮▮▮ ◔</span>
  </div>
);

// 回答している間はスマホに寄って、文字を読みやすくする
const zoomAt = (frame: number) =>
  interpolate(frame, [Q_BASE - 20, Q_BASE, RESULT_AT - 40, RESULT_AT - 20], [1, 1.32, 1.32, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = spring({ frame, fps: 30, config: { damping: 14, stiffness: 90 } });
  const zoom = zoomAt(frame);
  const w = SCREEN_W * PHONE_SCALE;
  const h = SCREEN_H * PHONE_SCALE;
  return (
    <div style={{ position: "absolute", left: 600 - w / 2 - 18, top: 540 - h / 2 - 18, transform: `translateY(${(1 - enter) * 900}px) rotate(${(1 - enter) * 8}deg) scale(${zoom})`, transformOrigin: "50% 3%" }}>
      <div style={{ padding: 18, background: "#2f2a26", borderRadius: 70, boxShadow: "0 40px 80px rgba(120,70,30,0.28), inset 0 0 0 3px #4a433d" }}>
        <div style={{ width: w, height: h, borderRadius: 54, overflow: "hidden", position: "relative", background: "#faf6ef" }}>
          <div style={{ position: "absolute", width: SCREEN_W, height: SCREEN_H, transform: `scale(${PHONE_SCALE})`, transformOrigin: "0 0" }}>
            <div style={{ position: "absolute", top: STATUS_BAR, width: SCREEN_W, height: SCREEN_H - STATUS_BAR, overflow: "hidden" }}>
              <ScreenContent />
              <Finger />
            </div>
            <StatusBar />
          </div>
          <div style={{ position: "absolute", top: 10, left: "50%", marginLeft: -55, width: 110, height: 32, borderRadius: 20, background: "#2f2a26" }} />
        </div>
      </div>
    </div>
  );
};

const Caption: React.FC<{ len: number; lines: { text: string; color?: string }[] }> = ({ len, lines }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [len - 8, len], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 950, right: 40, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", opacity: out }}>
      {lines.map((l, i) => (
        <AnimatedText key={i} text={l.text} size={lines.length > 2 ? 88 : 96} color={l.color ?? colors.text} delay={4 + i * 16} stagger={3} />
      ))}
    </div>
  );
};

export const Demo: React.FC = () => (
  <AbsoluteFill>
    <Phone />
    {CAPTIONS.map((c, i) => (
      <Sequence key={i} from={c.from} durationInFrames={c.to - c.from}>
        <Caption len={c.to - c.from} lines={c.lines} />
      </Sequence>
    ))}
    {taps.map((t, i) => (
      <Sequence key={`c${i}`} from={t.frame - 1} durationInFrames={10}>
        <Audio src={staticFile("click.wav")} volume={0.9} />
      </Sequence>
    ))}
    {SCROLLS.map(([s], i) => (
      <Sequence key={`w${i}`} from={s - 2} durationInFrames={20}>
        <Audio src={staticFile("whoosh.wav")} volume={0.8} />
      </Sequence>
    ))}
    <Sequence from={RESULT_AT} durationInFrames={50}>
      <Audio src={staticFile("chime.wav")} volume={0.9} />
    </Sequence>
  </AbsoluteFill>
);
