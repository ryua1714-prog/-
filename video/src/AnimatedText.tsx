import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "./theme";

type Props = {
  text: string;
  delay?: number; // 最初の文字が出るフレーム
  stagger?: number; // 1文字ごとの間隔（フレーム）
  size?: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
  charStyle?: (index: number) => React.CSSProperties;
};

// 文字を1文字ずつ、跳ねるように表示する
export const AnimatedText: React.FC<Props> = ({
  text,
  delay = 0,
  stagger = 3,
  size = 96,
  color,
  weight = 800,
  style,
  charStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = Array.from(text);

  return (
    <div style={{ display: "flex", justifyContent: "center", fontFamily, fontSize: size, fontWeight: weight, color, lineHeight: 1.25, ...style }}>
      {chars.map((ch, i) => {
        const p = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 9, stiffness: 160, mass: 0.6 } });
        const opacity = interpolate(frame - delay - i * stagger, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity,
              transform: `translateY(${(1 - p) * size * 0.7}px) scale(${0.4 + 0.6 * p}) rotate(${(1 - p) * (i % 2 ? 12 : -12)}deg)`,
              ...charStyle?.(i),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};
