import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { colors } from "./theme";

const DOT_COLORS = [colors.pink, colors.yellow, colors.mint, colors.sky, colors.lavender, "#ffb98a"];

// ふわふわ浮かぶ水玉の明るい背景
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 30% 20%, #fffdf8 0%, ${colors.bg} 55%, #ffeedd 100%)`, overflow: "hidden" }}>
      {new Array(26).fill(0).map((_, i) => {
        const size = 40 + random(`s${i}`) * 140;
        const x = random(`x${i}`) * 1920;
        const speed = 0.4 + random(`v${i}`) * 0.9;
        const y = ((random(`y${i}`) * 1300 - frame * speed) % 1300 + 1300) % 1300 - 120;
        const wobble = Math.sin(frame / 30 + i) * 20;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + wobble,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: DOT_COLORS[i % DOT_COLORS.length],
              opacity: 0.22 + random(`o${i}`) * 0.18,
            }}
          />
        );
      })}
      <div style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [0, 15], [1, 0], { extrapolateRight: "clamp" }), background: "#fff" }} />
    </AbsoluteFill>
  );
};
