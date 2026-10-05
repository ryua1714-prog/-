import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "./AnimatedText";
import { Background } from "./Background";
import { AXES, TYPES, colors, fontFamily, usePortrait } from "./theme";

export const PROMO_DURATION = 900; // 30秒 × 30fps

const SCENES = [
  { from: 0, len: 120 }, // つかみ
  { from: 120, len: 150 }, // ツール紹介
  { from: 270, len: 180 }, // 特長
  { from: 450, len: 210 }, // 8タイプ
  { from: 660, len: 120 }, // レーダーチャート
  { from: 780, len: 120 }, // 締め
];

// シーンの出入り（ふわっと拡大して入り、少し縮んで消える）
export const Scene: React.FC<{ len: number; last?: boolean; children: React.ReactNode }> = ({ len, last, children }) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const outP = last ? 0 : interpolate(frame, [len - 10, len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - outP), transform: `scale(${0.96 + 0.04 * inP - 0.04 * outP})`, justifyContent: "center", alignItems: "center" }}>
      {children}
    </AbsoluteFill>
  );
};

const usePop = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 140 } });
};

const Bob: React.FC<{ i: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ i, children, style }) => {
  const frame = useCurrentFrame();
  return <div style={{ transform: `translateY(${Math.sin(frame / 8 + i * 0.9) * 10}px)`, ...style }}>{children}</div>;
};

// 1. つかみ
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const q = usePop(62);
  const portrait = usePortrait();
  return (
    <>
      <AnimatedText text="子育て、" size={150} color={colors.text} delay={6} stagger={4} />
      {portrait ? (
        <>
          <AnimatedText text="これで" size={150} color={colors.accent} delay={26} stagger={4} style={{ marginTop: 10 }} />
          <AnimatedText text="いいのかな？" size={150} color={colors.accent} delay={38} stagger={4} />
        </>
      ) : (
        <AnimatedText text="これでいいのかな？" size={150} color={colors.accent} delay={26} stagger={4} style={{ marginTop: 10 }} />
      )}
      <div style={{ position: "absolute", right: portrait ? 110 : 250, top: portrait ? 520 : 170, fontSize: 160, transform: `scale(${q}) rotate(${Math.sin(frame / 6) * 10}deg)` }}>💭</div>
    </>
  );
};

// 2. ツール紹介
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const badge = usePop(4);
  const portrait = usePortrait();
  const title = (text: string, delay: number, offset: number) => (
    <AnimatedText
      text={text}
      size={portrait ? 180 : 190}
      delay={delay}
      stagger={5}
      charStyle={(i) => ({ color: TYPES[(i + offset) % TYPES.length].color, textShadow: "0 8px 0 rgba(0,0,0,0.06)" })}
    />
  );
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${portrait ? 4 : 8}, auto)`, gap: portrait ? 36 : 24, marginBottom: 40 }}>
        {TYPES.map((t, i) => {
          const p = spring({ frame: frame - 6 - i * 4, fps: 30, config: { damping: 8, stiffness: 150 } });
          return (
            <Bob key={i} i={i}>
              <div style={{ fontSize: portrait ? 150 : 110, transform: `scale(${p}) translateY(${(1 - p) * 80}px)` }}>{t.emoji}</div>
            </Bob>
          );
        })}
      </div>
      <div style={{ transform: `scale(${badge})`, background: colors.accent, color: "#fff", fontFamily, fontWeight: 800, fontSize: 44, padding: "10px 40px", borderRadius: 999, marginBottom: 24 }}>
        あなたの価値観がわかる
      </div>
      {portrait ? (
        <>
          {title("子育て", 40, 0)}
          {title("タイプ診断", 55, 3)}
        </>
      ) : (
        title("子育てタイプ診断", 40, 0)
      )}
    </>
  );
};

// 3. 特長
const FEATURES = [
  { icon: "📝", big: "50問", small: "5段階でサクッと回答", color: colors.sky },
  { icon: "⏱️", big: "約5分", small: "直感で選ぶだけ", color: colors.mint },
  { icon: "🎯", big: "8タイプ", small: "あなたのタイプを診断", color: colors.pink },
];

export const Features: React.FC = () => (
  <>
    <AnimatedText text="ここがポイント！" size={110} color={colors.text} delay={2} stagger={3} style={{ marginBottom: 70 }} />
    <div style={{ display: "flex", flexDirection: usePortrait() ? "column" : "row", gap: 60 }}>
      {FEATURES.map((f, i) => {
        const d = 30 + i * 28;
        return <FeatureCard key={i} f={f} delay={d} i={i} />;
      })}
    </div>
  </>
);

const FeatureCard: React.FC<{ f: (typeof FEATURES)[number]; delay: number; i: number }> = ({ f, delay, i }) => {
  const p = usePop(delay);
  if (usePortrait()) {
    return (
      <Bob i={i}>
        <div
          style={{
            width: 900,
            height: 300,
            background: "#fff",
            borderRadius: 48,
            border: `8px solid ${f.color}`,
            boxShadow: "0 24px 50px rgba(224,122,63,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 40,
            padding: "0 50px",
            boxSizing: "border-box",
            transform: `scale(${p}) rotate(${(1 - p) * -10}deg)`,
            opacity: Math.min(1, p * 2),
          }}
        >
          <div style={{ fontSize: 140 }}>{f.icon}</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <AnimatedText text={f.big} size={120} color={colors.text} delay={delay + 6} stagger={4} />
            <AnimatedText text={f.small} size={46} weight={500} color={colors.muted} delay={delay + 16} stagger={2} />
          </div>
        </div>
      </Bob>
    );
  }
  return (
    <Bob i={i}>
      <div
        style={{
          width: 460,
          height: 480,
          background: "#fff",
          borderRadius: 48,
          border: `8px solid ${f.color}`,
          boxShadow: "0 24px 50px rgba(224,122,63,0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${p}) rotate(${(1 - p) * -10}deg)`,
          opacity: Math.min(1, p * 2),
        }}
      >
        <div style={{ fontSize: 120 }}>{f.icon}</div>
        <AnimatedText text={f.big} size={110} color={colors.text} delay={delay + 6} stagger={4} style={{ marginTop: 10 }} />
        <AnimatedText text={f.small} size={40} weight={500} color={colors.muted} delay={delay + 16} stagger={2} style={{ marginTop: 14 }} />
      </div>
    </Bob>
  );
};

// 4. 8タイプ
export const Types: React.FC = () => (
  <>
    <AnimatedText text="あなたはどのタイプ？" size={104} color={colors.text} delay={2} stagger={3} style={{ marginBottom: 56 }} />
    <div style={{ display: "grid", gridTemplateColumns: usePortrait() ? "repeat(2, 440px)" : "repeat(4, 380px)", gap: 36 }}>
      {TYPES.map((t, i) => (
        <TypeCard key={i} t={t} i={i} delay={30 + i * 10} />
      ))}
    </div>
  </>
);

const TypeCard: React.FC<{ t: (typeof TYPES)[number]; i: number; delay: number }> = ({ t, i, delay }) => {
  const p = usePop(delay);
  return (
    <Bob i={i}>
      <div
        style={{
          height: 290,
          background: t.soft,
          borderRadius: 40,
          border: `6px solid ${t.color}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${p}) translateY(${(1 - p) * 120}px)`,
          opacity: Math.min(1, p * 2),
        }}
      >
        <div style={{ fontSize: 110, lineHeight: 1.1 }}>{t.emoji}</div>
        <AnimatedText text={t.label} size={64} color={t.color} delay={delay + 6} stagger={3} />
        <AnimatedText text={t.role} size={34} weight={500} color={colors.muted} delay={delay + 14} stagger={2} />
      </div>
    </Bob>
  );
};

// 5. レーダーチャート
const Radar: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = spring({ frame: frame - 20, fps: 30, config: { damping: 12, stiffness: 60 } });
  const values = [0.85, 0.65, 0.92, 0.55, 0.78];
  const cx = 300;
  const cy = 300;
  const r = 230;
  const pt = (i: number, k: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k];
  };
  const poly = (k: (i: number) => number) => AXES.map((_, i) => pt(i, k(i)).join(",")).join(" ");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 90 }}>
      <svg width={600} height={600} viewBox="0 0 600 600" style={{ transform: `rotate(${(1 - grow) * -30}deg)` }}>
        {[0.25, 0.5, 0.75, 1].map((k) => (
          <polygon key={k} points={poly(() => k)} fill={k === 1 ? "#fff" : "none"} stroke="#ead9c6" strokeWidth={3} />
        ))}
        {AXES.map((_, i) => {
          const [x, y] = pt(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#ead9c6" strokeWidth={3} />;
        })}
        <polygon points={poly((i) => values[i] * grow)} fill="rgba(224,122,63,0.35)" stroke={colors.accent} strokeWidth={8} strokeLinejoin="round" />
        {AXES.map((name, i) => {
          const [x, y] = pt(i, 1.17);
          const o = interpolate(frame, [10 + i * 5, 20 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <text key={name} x={x} y={y + 14} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={40} fill={colors.text} opacity={o}>
              {name}
            </text>
          );
        })}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <AnimatedText text="5つの軸で" size={96} color={colors.text} delay={8} stagger={4} />
        <AnimatedText text="子育てバランスが" size={96} color={colors.accent} delay={30} stagger={3} />
        <AnimatedText text="ひと目でわかる！" size={96} color={colors.text} delay={56} stagger={3} />
      </div>
    </div>
  );
};

// 6. 締め
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const btn = usePop(48);
  const pulse = 1 + Math.max(0, Math.sin((frame - 60) / 5)) * 0.04 * (frame > 60 ? 1 : 0);
  return (
    <>
      {usePortrait() ? (
        <>
          <AnimatedText text="さっそく" size={130} color={colors.text} delay={2} stagger={3} />
          <AnimatedText text="診断してみよう！" size={120} color={colors.text} delay={14} stagger={3} />
        </>
      ) : (
        <AnimatedText text="さっそく診断してみよう！" size={110} color={colors.text} delay={2} stagger={3} />
      )}
      <div
        style={{
          marginTop: 60,
          transform: `scale(${btn * pulse})`,
          background: `linear-gradient(135deg, #ff9a56, ${colors.accent})`,
          boxShadow: `0 16px 0 ${colors.accentDeep}, 0 30px 50px rgba(224,122,63,0.35)`,
          color: "#fff",
          fontFamily,
          fontWeight: 800,
          fontSize: 76,
          padding: "30px 90px",
          borderRadius: 999,
        }}
      >
        👆 診断をはじめる
      </div>
      <AnimatedText text="ryua1714-prog.github.io/-/" size={56} weight={500} color={colors.muted} delay={62} stagger={1} style={{ marginTop: 70 }} />
      <div style={{ position: "absolute", bottom: usePortrait() ? 330 : 60, display: "flex", gap: 30, fontSize: 70 }}>
        {TYPES.map((t, i) => (
          <Bob key={i} i={i}>
            {t.emoji}
          </Bob>
        ))}
      </div>
    </>
  );
};

export const Promo: React.FC = () => {
  const parts = [Hook, Intro, Features, Types, Radar, Outro];
  return (
    <AbsoluteFill>
      <Background />
      <Audio src={staticFile("bgm.wav")} volume={(f) => interpolate(f, [PROMO_DURATION - 45, PROMO_DURATION], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SCENES.map(({ from, len }, i) => {
        const Part = parts[i];
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Scene len={len} last={i === SCENES.length - 1}>
              <Part />
            </Scene>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
