#!/usr/bin/env node
// 8タイプが想定回答者集団に対してそれぞれ12.5%ずつ出るように、タイプごとの補正値（CALIBRATION）を求める。
//
//   node tools/calibrate.js          … 補正値を計算して、検証結果を表示する
//   node tools/calibrate.js --write  … 計算した補正値を js/data.js に書き込む
//
// 補正値はここで一度だけ計算して固定する。診断時に回答ごとに変わることはないので、
// 同じ回答をした人は常に同じ結果になる（強制的な割り当てはしない）。
//
// 想定回答者集団（実データが集まったら、そのデータで置き換えるのが望ましい）:
// - 8タイプの価値観の強さは、全員がそれぞれ独立に同じ分布を持つ（どのタイプも事前に同格）
// - 人によって全体的に「そう思う」寄りに答える傾向（同意傾向）がある
// - 各質問への回答は、その質問の配点に沿った価値観の強さ + 同意傾向 + ばらつき で決まる

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const load = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const ctx = vm.createContext({});
vm.runInContext(
  [load("js/content.js"), load("js/data.js"), load("js/scoring.js")].join("\n") +
    "\n;globalThis.api = { QUESTIONS, TYPES, CALIBRATION, calcTypeScores, determineType };",
  ctx
);
const { QUESTIONS, TYPES, CALIBRATION, calcTypeScores, determineType } = ctx.api;
const KEYS = TYPES.map((t) => t.key);

// ---------- 乱数（シード固定で再現可能） ----------
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function normal(rand) {
  return Math.sqrt(-2 * Math.log(rand() || 1e-12)) * Math.cos(2 * Math.PI * rand());
}

// ---------- 回答者の生成 ----------
const MODELS = {
  // 価値観 + 同意傾向（補正値の算出に使う集団）
  main: { acqMean: 0.3, acqSd: 0.4, signal: 0.8, noise: 0.8 },
  // 同意傾向なし
  noAcquiescence: { acqMean: 0, acqSd: 0, signal: 0.8, noise: 0.8 },
  // 同意傾向が強め
  strongAcquiescence: { acqMean: 0.6, acqSd: 0.4, signal: 0.8, noise: 0.8 },
};

// 各質問の「タイプの価値観 → 回答」の向き（肯定配点 − 否定配点、長さ1に正規化）
const DIRECTIONS = QUESTIONS.map((q) => {
  const d = KEYS.map((k) => (q.pos[k] || 0) - (q.neg[k] || 0));
  const len = Math.sqrt(d.reduce((a, b) => a + b * b, 0)) || 1;
  return d.map((x) => x / len);
});

function toValue(x) {
  if (x > 1.5) return 2;
  if (x > 0.5) return 1;
  if (x >= -0.5) return 0;
  if (x >= -1.5) return -1;
  return -2;
}

function makeRespondents(n, seed, model) {
  const rand = rng(seed);
  const people = [];
  for (let i = 0; i < n; i++) {
    let values;
    if (model === "uniform") {
      values = QUESTIONS.map(() => Math.floor(rand() * 5) - 2);
    } else {
      const m = MODELS[model];
      const pref = KEYS.map(() => normal(rand));
      const acq = m.acqMean + m.acqSd * normal(rand);
      values = DIRECTIONS.map((dir) => {
        const signal = dir.reduce((acc, d, k) => acc + d * pref[k], 0);
        return toValue(acq + m.signal * signal + m.noise * normal(rand));
      });
    }
    const normalized = calcTypeScores(values).map((s) => s.score - (CALIBRATION[s.key] || 0));
    people.push({ values, normalized });
  }
  return people;
}

// ---------- 判定結果の割合 ----------
function shares(people, offsets) {
  const count = Object.fromEntries(KEYS.map((k) => [k, 0]));
  for (const p of people) {
    const typeScores = KEYS.map((key, i) => ({ key, normalized: p.normalized[i], score: p.normalized[i] + offsets[key] }));
    const d = determineType(typeScores, p.values);
    if (d.type) count[d.type.key] += 1;
    else d.candidates.forEach((k) => (count[k] += 1 / d.candidates.length));
  }
  return Object.fromEntries(KEYS.map((k) => [k, count[k] / people.length]));
}

function calibrate(people) {
  const offsets = Object.fromEntries(KEYS.map((k) => [k, 0]));
  let lr = 40;
  for (let iter = 0; iter < 400; iter++) {
    const s = shares(people, offsets);
    const worst = Math.max(...KEYS.map((k) => Math.abs(s[k] - 0.125)));
    if (worst < 0.001) break;
    KEYS.forEach((k) => (offsets[k] += lr * (0.125 - s[k])));
    // 平均0に保つ（全体を同じだけずらしても結果は変わらないため）
    const mean = KEYS.reduce((a, k) => a + offsets[k], 0) / KEYS.length;
    KEYS.forEach((k) => (offsets[k] -= mean));
    if (iter % 50 === 49) lr *= 0.7;
  }
  return Object.fromEntries(KEYS.map((k) => [k, Math.round(offsets[k] * 100) / 100]));
}

function printShares(label, s) {
  const row = KEYS.map((k) => `${TYPES.find((t) => t.key === k).label} ${(s[k] * 100).toFixed(1)}%`).join("  ");
  console.log(`${label.padEnd(26)} ${row}`);
}

const N = 40000;
const train = makeRespondents(N, 20261004, "main");
const offsets = calibrate(train);
const zero = Object.fromEntries(KEYS.map((k) => [k, 0]));

console.log("補正値:", JSON.stringify(offsets));
console.log("");
console.log("■ 検証（学習に使っていない回答者で確認）");
for (const model of ["main", "noAcquiescence", "strongAcquiescence", "uniform"]) {
  const test = makeRespondents(N, 7 + model.length, model);
  printShares(`${model}（補正なし）`, shares(test, zero));
  printShares(`${model}（補正あり）`, shares(test, offsets));
}
console.log("");
console.log("現在 js/data.js に入っている補正値:", JSON.stringify(CALIBRATION));

if (process.argv.includes("--write")) {
  const file = path.join(ROOT, "js/data.js");
  const src = fs.readFileSync(file, "utf8");
  const body = KEYS.map((k) => `  ${k}: ${offsets[k]},`).join("\n");
  const next = src.replace(/const CALIBRATION = \{[\s\S]*?\n\};/, `const CALIBRATION = {\n${body}\n};`);
  fs.writeFileSync(file, next);
  console.log("js/data.js の CALIBRATION を更新しました。");
}
