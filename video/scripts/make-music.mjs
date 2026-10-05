// 明るいBGM（120BPM・ハ長調・I–V–vi–IV）をその場で合成して public/bgm.wav に書き出す
import { writeFileSync } from "node:fs";

const SR = 44100;
const DURATION = 30;
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
];

const bars = Math.ceil(DURATION / (BEAT * 4));
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
    const phrase = melody[Math.floor((bar - 2) / 2) % 2];
    const offset = ((bar - 2) % 2) * 4;
    for (const [beat, m, len] of phrase) {
      if (beat >= offset && beat < offset + 4) bell(t0 + (beat - offset) * BEAT, m, len * BEAT);
    }
  }
}

// フェードとリミッター
const buf = Buffer.alloc(44 + N * 4);
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 0.85 / peak;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 0.3, (DURATION - t) / 2);
  buf.writeInt16LE(Math.round(Math.tanh(L[i] * gain * fade) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.tanh(R[i] * gain * fade) * 32767), 46 + i * 4);
}
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
writeFileSync(new URL("../public/bgm.wav", import.meta.url), buf);
console.log("public/bgm.wav を書き出しました");
