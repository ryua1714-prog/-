// 明るいBGM（120BPM・ハ長調・I–V–vi–IV）と効果音をその場で合成して public/ に書き出す
import { writeFileSync } from "node:fs";

const SR = 44100;
const DURATION = 60;
const BPM = 120;
const BEAT = 60 / BPM;
const N = SR * DURATION;
const L = new Float32Array(N);
const R = new Float32Array(N);

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

// 決まった乱数（毎回同じ音になるように）
let seed = 1;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

function add(start, len, pan, fn) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(len * SR);
  const gl = Math.cos((pan + 1) * Math.PI / 4);
  const gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && s0 + i < N; i++) {
    const v = fn(i / SR);
    L[s0 + i] += v * gl;
    R[s0 + i] += v * gr;
  }
}

const kick = (t) => add(t, 0.35, 0, (x) => Math.sin(2 * Math.PI * (50 * x + 90 * (1 - Math.exp(-x * 30)) / 30)) * Math.exp(-x * 9) * 0.9);
const clap = (t) => add(t, 0.2, 0, (x) => rand() * Math.exp(-x * 25) * 0.25);
const hat = (t, v = 0.08) => add(t, 0.05, 0.3, (x) => rand() * Math.exp(-x * 90) * v);
const bass = (t, m, len) => add(t, len, 0, (x) => {
  const f = midi(m);
  const env = Math.min(1, x * 200) * Math.exp(-x * 3);
  return (Math.sin(2 * Math.PI * f * x) + 0.3 * Math.sin(4 * Math.PI * f * x)) * env * 0.35;
});
const pluck = (t, m, pan, v = 0.12) => add(t, 0.6, pan, (x) => {
  const f = midi(m);
  const env = Math.min(1, x * 300) * Math.exp(-x * 7);
  return (Math.sin(2 * Math.PI * f * x) + 0.5 * Math.sin(4 * Math.PI * f * x) + 0.2 * Math.sin(6 * Math.PI * f * x)) * env * v;
});
const bell = (t, m, len) => add(t, len + 0.6, -0.15, (x) => {
  const f = midi(m);
  const env = Math.min(1, x * 400) * Math.exp(-x * 3.2);
  const vib = Math.sin(2 * Math.PI * 5 * x) * 0.003;
  return (Math.sin(2 * Math.PI * f * x * (1 + vib)) + 0.35 * Math.sin(2 * Math.PI * f * 3 * x) * Math.exp(-x * 6)) * env * 0.16;
});

// C – G – Am – F
const chords = [
  { root: 36, notes: [60, 64, 67, 72] },
  { root: 43, notes: [59, 62, 67, 71] },
  { root: 45, notes: [60, 64, 69, 72] },
  { root: 41, notes: [60, 65, 69, 72] },
];
// 2小節ずつのメロディ（[拍, MIDI, 長さ(拍)]）
const melody = [
  [[0, 76, 1], [1, 79, 1], [2, 84, 1.5], [3.5, 83, 0.5], [4, 79, 1], [5, 81, 1], [6, 79, 2]],
  [[0, 81, 1], [1, 79, 1], [2, 76, 1], [3, 77, 1], [4, 79, 1.5], [5.5, 77, 0.5], [6, 76, 1], [7, 74, 1]],
  [[0, 72, 0.5], [0.5, 74, 0.5], [1, 76, 1], [2, 79, 1], [3, 76, 1], [4, 81, 1], [5, 79, 1], [6, 77, 1], [7, 76, 1]],
  [[0, 77, 1], [1, 76, 1], [2, 74, 1], [3, 72, 1], [4, 74, 1.5], [5.5, 76, 0.5], [6, 72, 2]],
];

const bars = Math.floor((DURATION - 2) / (BEAT * 4)); // 最後の2秒は締めの和音
for (let bar = 0; bar < bars; bar++) {
  const t0 = bar * 4 * BEAT;
  const c = chords[bar % 4];
  const intro = bar < 1;
  for (let b = 0; b < 4; b++) {
    const tb = t0 + b * BEAT;
    if (!intro) kick(tb);
    if (!intro && (b === 1 || b === 3)) clap(tb);
    hat(tb + BEAT / 2, 0.1);
    hat(tb, 0.05);
    bass(tb, c.root, BEAT * 0.45);
    bass(tb + BEAT / 2, c.root + 12, BEAT * 0.4);
  }
  // アルペジオ（16分）
  for (let s = 0; s < 16; s++) {
    const m = c.notes[[0, 1, 2, 3, 2, 1][s % 6] % 4];
    pluck(t0 + s * BEAT / 4, m, s % 2 ? 0.4 : -0.4, intro ? 0.07 : 0.09);
  }
  if (bar >= 2) {
    const phrase = melody[Math.floor((bar - 2) / 2) % melody.length];
    const offset = ((bar - 2) % 2) * 4;
    for (const [beat, m, len] of phrase) {
      if (beat >= offset && beat < offset + 4) bell(t0 + (beat - offset) * BEAT, m, len * BEAT);
    }
  }
}

// 正規化・フェードして16bitステレオのWAVに書き出す
function writeWav(name, left, right, { peakTo = 0.85, fadeIn = 0, fadeOut = 0 } = {}) {
  const n = left.length;
  const dur = n / SR;
  const buf = Buffer.alloc(44 + n * 4);
  let peak = 1e-9;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  const gain = peakTo / peak;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const fade = Math.min(1, fadeIn ? t / fadeIn : 1, fadeOut ? (dur - t) / fadeOut : 1);
    buf.writeInt16LE(Math.round(Math.tanh(left[i] * gain * fade) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.tanh(right[i] * gain * fade) * 32767), 46 + i * 4);
  }
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
  writeFileSync(new URL(`../public/${name}`, import.meta.url), buf);
  console.log(`public/${name} を書き出しました`);
}

// 最後の小節はジャーンと伸ばして終わる
const endT = bars * 4 * BEAT;
for (const m of [48, 60, 64, 67, 72, 76]) bell(endT, m, 1.6);
kick(endT);

writeWav("bgm.wav", L, R, { fadeIn: 0.3, fadeOut: 1.2 });

// 効果音
function sfx(seconds, fn) {
  const n = Math.floor(seconds * SR);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = fn(i / SR);
  return a;
}
// クリック音：短く軽い、ふつうの「クリッ」
let hp = 0;
const click = sfx(0.03, (x) => {
  const n = rand();
  const high = n - hp; // 低い成分を落としてこもらない音にする
  hp = n;
  return (high * 0.35 + Math.sin(2 * Math.PI * 2400 * x) * 0.8) * Math.exp(-x * 320) * Math.min(1, x * 8000);
});
writeWav("click.wav", click, click, { peakTo: 0.6 });

// スワイプ音：やわらかく流れる「スーッ」（なめらかなノイズを、山なりの音量で通す）
const SWIPE = 0.7;
const swipe = (seedOffset) => {
  let a = 0;
  let b = 0;
  for (let i = 0; i < seedOffset; i++) rand();
  return sfx(SWIPE, (x) => {
    const k = x / SWIPE;
    const cutoff = 0.015 + 0.05 * Math.sin(Math.PI * k); // 真ん中で少し明るく
    a += cutoff * (rand() - a); // 2段のローパスで角を取る
    b += cutoff * (a - b);
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.25)), 2);
    return b * env;
  });
};
writeWav("whoosh.wav", swipe(0), swipe(7), { peakTo: 0.5 });

// 結果発表：キラキラのアルペジオ
const chimeNotes = [72, 76, 79, 84, 88];
const chime = sfx(1.6, (x) => chimeNotes.reduce((acc, m, k) => {
  const t = x - k * 0.07;
  if (t < 0) return acc;
  const f = midi(m);
  return acc + (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.01 * t)) * Math.exp(-t * 3) * Math.min(1, t * 500);
}, 0));
writeWav("chime.wav", chime, chime, { peakTo: 0.6 });
