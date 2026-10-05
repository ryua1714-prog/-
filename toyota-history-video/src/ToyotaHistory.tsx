import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {chapters, Chapter} from './data';
import {JP, LATIN} from './fonts';

const GOLD = '#c8a56a';
const GOLD_SOFT = 'rgba(200,165,106,0.35)';
const INK = '#08080a';
const PAPER = '#ecebe6';
const MUTED = 'rgba(236,235,230,0.62)';

const INTRO = 105;
const CHAPTER = 90;
const OUTRO = 75;
export const TOTAL_FRAMES = INTRO + CHAPTER * chapters.length + OUTRO; // 900 = 30s

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* ---------- text animation primitives ---------- */

// Each character rises out of a blur, staggered.
const CharReveal: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({text, delay = 0, stagger = 2, style}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: 'flex', justifyContent: 'center', whiteSpace: 'pre', ...style}}>
      {[...text].map((ch, i) => {
        const t = interpolate(frame, [delay + i * stagger, delay + i * stagger + 16], [0, 1], {
          ...clamp,
          easing: easeOut,
        });
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: t,
              transform: `translateY(${(1 - t) * 46}px)`,
              filter: `blur(${(1 - t) * 14}px)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

// Text slides up from behind a mask.
const MaskReveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({children, delay = 0, style}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 20], [0, 1], {...clamp, easing: easeOut});
  return (
    <div style={{overflow: 'hidden', paddingBottom: 6, ...style}}>
      <div style={{transform: `translateY(${(1 - t) * 110}%)`, opacity: 0.3 + t * 0.7}}>
        {children}
      </div>
    </div>
  );
};

// Letter-spacing collapses while fading in.
const TrackingIn: React.FC<{
  text: string;
  delay?: number;
  from?: number;
  to?: number;
  style?: React.CSSProperties;
}> = ({text, delay = 0, from = 40, to = 12, style}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 30], [0, 1], {...clamp, easing: easeOut});
  return (
    <div
      style={{
        letterSpacing: from + (to - from) * t,
        paddingLeft: from + (to - from) * t, // balance trailing tracking
        opacity: t,
        filter: `blur(${(1 - t) * 8}px)`,
        textAlign: 'center',
        ...style,
      }}
    >
      {text}
    </div>
  );
};

const GoldLine: React.FC<{delay?: number; width?: number; style?: React.CSSProperties}> = ({
  delay = 0,
  width = 120,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 24], [0, 1], {...clamp, easing: easeOut});
  return (
    <div
      style={{
        height: 2,
        width: width * t,
        margin: '0 auto',
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        ...style,
      }}
    />
  );
};

// Year rolls from the previous chapter's year up to this one.
const YearCounter: React.FC<{from: number; to: number; delay?: number}> = ({
  from,
  to,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 26], [0, 1], {...clamp, easing: easeOut});
  const value = Math.round(from + (to - from) * t);
  const appear = interpolate(frame, [delay, delay + 10], [0, 1], clamp);
  return (
    <div
      style={{
        fontFamily: LATIN,
        fontWeight: 300,
        fontSize: 300,
        lineHeight: 1,
        color: PAPER,
        letterSpacing: 6,
        textAlign: 'center',
        fontVariantNumeric: 'lining-nums tabular-nums',
        opacity: appear,
        textShadow: `0 0 60px rgba(200,165,106,${0.25 * t})`,
      }}
    >
      {value}
    </div>
  );
};

/* ---------- atmosphere ---------- */

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame % 300, [0, 300], [-40, 140]);
  return (
    <AbsoluteFill style={{background: INK}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 55% at 50% 42%, #1b1914 0%, ${INK} 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, transparent ${sweep - 20}%, rgba(200,165,106,0.06) ${sweep}%, transparent ${sweep + 20}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* film grain */}
      <AbsoluteFill style={{opacity: 0.09, mixBlendMode: 'screen'}}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="2"
              seed={frame % 12}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)',
        }}
      />
      {/* cinematic frame lines */}
      <div style={{position: 'absolute', top: 120, left: 70, right: 70, height: 1, background: 'rgba(236,235,230,0.12)'}} />
      <div style={{position: 'absolute', bottom: 120, left: 70, right: 70, height: 1, background: 'rgba(236,235,230,0.12)'}} />
    </AbsoluteFill>
  );
};

// Scene wrapper: slow push-in plus a soft blur/fade exit.
const SceneShell: React.FC<{duration: number; children: React.ReactNode; fadeIn?: boolean}> = ({
  duration,
  children,
  fadeIn = false,
}) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [duration - 12, duration], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const inn = fadeIn ? interpolate(frame, [0, 12], [0, 1], clamp) : 1;
  const scale = interpolate(frame, [0, duration], [1, 1.045]);
  return (
    <AbsoluteFill
      style={{
        opacity: (1 - out) * inn,
        transform: `scale(${scale}) translateY(${-out * 50}px)`,
        filter: `blur(${out * 12}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ---------- scenes ---------- */

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const ringT = interpolate(frame, [0, 60], [0, 1], {...clamp, easing: easeOut});
  return (
    <SceneShell duration={INTRO}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        {/* drawn circle */}
        <svg width="760" height="760" style={{position: 'absolute', top: 440, left: 160}}>
          <circle
            cx="380"
            cy="380"
            r="360"
            fill="none"
            stroke={GOLD_SOFT}
            strokeWidth="1.5"
            strokeDasharray={2 * Math.PI * 360}
            strokeDashoffset={(1 - ringT) * 2 * Math.PI * 360}
            transform="rotate(-90 380 380)"
          />
        </svg>
        <div style={{position: 'absolute', top: 640, width: '100%'}}>
          <TrackingIn
            text="THE HISTORY OF"
            delay={4}
            from={30}
            to={14}
            style={{fontFamily: LATIN, fontSize: 40, color: GOLD, fontWeight: 500}}
          />
          <div style={{height: 36}} />
          <TrackingIn
            text="TOYOTA"
            delay={12}
            from={80}
            to={26}
            style={{fontFamily: LATIN, fontSize: 190, color: PAPER, fontWeight: 300, lineHeight: 1}}
          />
          <div style={{height: 50}} />
          <GoldLine delay={30} width={420} />
          <div style={{height: 60}} />
          <CharReveal
            text="一台の織機から、世界へ。"
            delay={40}
            stagger={2}
            style={{fontFamily: JP, fontWeight: 500, fontSize: 60, color: PAPER, letterSpacing: 4}}
          />
          <div style={{height: 40}} />
          <TrackingIn
            text="1896 — 2028"
            delay={66}
            from={20}
            to={10}
            style={{fontFamily: LATIN, fontSize: 40, color: MUTED}}
          />
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

const Progress: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [0, CHAPTER], [index, index + 1], clamp) / chapters.length;
  return (
    <div style={{position: 'absolute', bottom: 210, left: 140, right: 140}}>
      <div style={{position: 'relative', height: 2, background: 'rgba(236,235,230,0.14)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, height: 2, width: `${fill * 100}%`, background: GOLD}} />
        {chapters.map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: -5,
              left: `calc(${(i / (chapters.length - 1)) * 100}% - 6px)`,
              width: 12,
              height: 12,
              borderRadius: 6,
              background: i <= index ? GOLD : INK,
              border: `1.5px solid ${i <= index ? GOLD : 'rgba(236,235,230,0.3)'}`,
              transform: `scale(${i === index ? 1.4 : 1})`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const ChapterScene: React.FC<{chapter: Chapter; index: number; prevYear: number}> = ({
  chapter,
  index,
  prevYear,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drift = interpolate(frame, [0, CHAPTER], [80, -80]);
  const bgIn = interpolate(frame, [0, 20], [0, 1], clamp);
  const tag = spring({frame: frame - 44, fps, config: {damping: 200}});
  const num = String(index + 1).padStart(2, '0');

  return (
    <SceneShell duration={CHAPTER}>
      {/* huge outlined background word, running vertically */}
      <div
        style={{
          position: 'absolute',
          top: 960,
          left: 540,
          transform: `translate(-50%, -50%) rotate(-90deg) translateX(${drift}px)`,
          fontFamily: LATIN,
          fontWeight: 500,
          fontSize: 420,
          letterSpacing: 30,
          color: 'transparent',
          WebkitTextStroke: '1.5px rgba(200,165,106,0.13)',
          whiteSpace: 'nowrap',
          opacity: bgIn,
        }}
      >
        {chapter.bgWord}
      </div>

      {/* chapter label */}
      <div style={{position: 'absolute', top: 300, width: '100%'}}>
        <MaskReveal delay={0}>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 26}}>
            <span style={{fontFamily: LATIN, fontSize: 44, color: GOLD, fontWeight: 500}}>{num}</span>
            <span style={{fontFamily: LATIN, fontSize: 28, color: MUTED, letterSpacing: 4}}>
              / {String(chapters.length).padStart(2, '0')}
            </span>
          </div>
        </MaskReveal>
        <div style={{height: 14}} />
        <TrackingIn
          text={chapter.era}
          delay={4}
          from={30}
          to={16}
          style={{fontFamily: LATIN, fontSize: 30, color: MUTED, fontWeight: 500}}
        />
      </div>

      {/* year */}
      <div style={{position: 'absolute', top: 520, width: '100%'}}>
        <YearCounter from={prevYear} to={chapter.year} delay={2} />
        {chapter.yearSuffix && (
          <TrackingIn
            text={chapter.yearSuffix}
            delay={20}
            from={18}
            to={8}
            style={{fontFamily: LATIN, fontSize: 52, color: GOLD, fontWeight: 300, marginTop: -8}}
          />
        )}
        <div style={{height: 46}} />
        <GoldLine delay={14} width={300} />
      </div>

      {/* title + body */}
      <div style={{position: 'absolute', top: 1000, left: 80, right: 80}}>
        <CharReveal
          text={chapter.title}
          delay={16}
          stagger={2}
          style={{fontFamily: JP, fontWeight: 700, fontSize: 74, color: PAPER, letterSpacing: 3}}
        />
        <div style={{height: 52}} />
        {chapter.lines.map((line, i) => (
          <MaskReveal key={i} delay={30 + i * 6} style={{marginBottom: 14}}>
            <div
              style={{
                fontFamily: JP,
                fontWeight: 300,
                fontSize: 38,
                color: MUTED,
                textAlign: 'center',
                letterSpacing: 2,
              }}
            >
              {line}
            </div>
          </MaskReveal>
        ))}
        <div style={{height: 46}} />
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              position: 'relative',
              padding: '18px 40px',
              border: `1px solid rgba(200,165,106,${0.7 * tag})`,
              clipPath: `inset(0 ${(1 - tag) * 100}% 0 0)`,
            }}
          >
            <div
              style={{
                fontFamily: JP,
                fontWeight: 500,
                fontSize: 36,
                color: GOLD,
                letterSpacing: 3,
                whiteSpace: 'pre',
              }}
            >
              {chapter.keyword}
            </div>
          </div>
        </div>
      </div>

      <Progress index={index} />
    </SceneShell>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const black = interpolate(frame, [OUTRO - 12, OUTRO], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <SceneShell duration={OUTRO + 30} fadeIn>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: '100%', marginTop: -60}}>
            <CharReveal
              text="挑戦は、続いていく。"
              delay={4}
              stagger={3}
              style={{fontFamily: JP, fontWeight: 500, fontSize: 70, color: PAPER, letterSpacing: 6}}
            />
            <div style={{height: 70}} />
            <GoldLine delay={22} width={520} />
            <div style={{height: 70}} />
            <TrackingIn
              text="TOYOTA"
              delay={26}
              from={70}
              to={30}
              style={{fontFamily: LATIN, fontSize: 120, color: PAPER, fontWeight: 300}}
            />
            <div style={{height: 24}} />
            <TrackingIn
              text="SINCE 1937"
              delay={36}
              from={24}
              to={14}
              style={{fontFamily: LATIN, fontSize: 34, color: GOLD, fontWeight: 500}}
            />
          </div>
        </AbsoluteFill>
      </SceneShell>
      <AbsoluteFill style={{background: '#000', opacity: black}} />
    </AbsoluteFill>
  );
};

export const ToyotaHistory: React.FC = () => {
  return (
    <AbsoluteFill style={{background: INK, fontVariantNumeric: 'lining-nums'}}>
      <Background />
      <Sequence durationInFrames={INTRO}>
        <Intro />
      </Sequence>
      {chapters.map((c, i) => (
        <Sequence key={c.year} from={INTRO + i * CHAPTER} durationInFrames={CHAPTER}>
          <ChapterScene chapter={c} index={i} prevYear={i === 0 ? 1850 : chapters[i - 1].year} />
        </Sequence>
      ))}
      <Sequence from={INTRO + CHAPTER * chapters.length} durationInFrames={OUTRO}>
        <Outro />
      </Sequence>
      <Overlay />
    </AbsoluteFill>
  );
};
