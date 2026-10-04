// 診断ロジック（画面に依存しない計算部分。tools/calibrate.js からも使う）

const CONFIG = {
  // 上位2タイプの差がこの値未満なら僅差とみなす（スコアは0〜100）
  closeGap: 3,
  // 「なんとも言えない」がこの数以上なら均一とみなす
  neutralThreshold: 45,
  // 同じ回答（どの選択肢でも）がこの数以上なら均一とみなす
  sameAnswerThreshold: 45,
};

const MAX_ANSWER_VALUE = 2;
const EPS = 1e-9;

const choiceByScore = (score) => CHOICES.find((c) => c.score === score);
const typeByKey = (key) => TYPES.find((t) => t.key === key);
const allQuestionNumbers = QUESTIONS.map((_, i) => i + 1);

// その回答で typeKey に入る点（回答強度 × 配点）。肯定なら pos、否定なら neg の配点を使う
function contribution(values, questionNumber, typeKey) {
  const v = values[questionNumber - 1];
  const q = QUESTIONS[questionNumber - 1];
  if (v > 0) return v * (q.pos[typeKey] || 0);
  if (v < 0) return -v * (q.neg[typeKey] || 0);
  return 0;
}

// タイプごとの理論上の最大点（各質問で、そのタイプに多く入る方向へ「かなり」と答えた場合の合計）
const TYPE_MAX = Object.fromEntries(
  TYPES.map((t) => [
    t.key,
    QUESTIONS.reduce((acc, q) => acc + MAX_ANSWER_VALUE * Math.max(q.pos[t.key] || 0, q.neg[t.key] || 0), 0),
  ])
);

// 質問ごと・回答ごとに各タイプへ入る点の表（POINTS[typeKey][質問index][回答index]）
const LEVELS = [-2, -1, 0, 1, 2];
const POINTS = Object.fromEntries(
  TYPES.map((t) => [
    t.key,
    QUESTIONS.map((q) => LEVELS.map((v) => (v > 0 ? v * (q.pos[t.key] || 0) : v < 0 ? -v * (q.neg[t.key] || 0) : 0))),
  ])
);
// 各回答レベルについて、全質問の平均点（POINT_COL_MEAN[typeKey][回答index]）
const POINT_COL_MEAN = Object.fromEntries(
  TYPES.map((t) => [t.key, LEVELS.map((_, l) => POINTS[t.key].reduce((acc, row) => acc + row[l], 0) / QUESTIONS.length)])
);

// その人の回答の「並び」だけをランダムに入れ替えたときの、各タイプの素点の平均と標準偏差。
// 同じ回答の組み合わせ（例：「そう思う」が多い）でも、どの質問にどう答えたかによってだけ差がつくようにするための基準。
function permutationBaseline(counts, typeKey) {
  const n = QUESTIONS.length;
  const f = POINTS[typeKey];
  const colMean = POINT_COL_MEAN[typeKey];
  const grandMean = colMean.reduce((acc, x, l) => acc + x * counts[l], 0) / n;
  let sq = 0;
  for (const row of f) {
    let rowMean = 0;
    for (let l = 0; l < 5; l++) rowMean += row[l] * counts[l];
    rowMean /= n;
    for (let l = 0; l < 5; l++) {
      if (!counts[l]) continue;
      const d = row[l] - rowMean - colMean[l] + grandMean;
      sq += counts[l] * d * d;
    }
  }
  return { mean: n * grandMean, sd: Math.sqrt(sq / (n - 1)) };
}

// raw: 素点 / normalized: 素点を理論上の最大点で割った0〜100（参考値）
// score: 判定用の正規化スコア（50が基準。その人の回答傾向から期待される点より高いほど大きい）
//        = 50 + 10 × (素点 − 回答の並びを入れ替えたときの平均) ÷ その標準偏差 ＋ 補正値
function calcTypeScores(values) {
  const counts = LEVELS.map((v) => values.filter((x) => x === v).length);
  return TYPES.map((t) => {
    const raw = allQuestionNumbers.reduce((acc, q) => acc + contribution(values, q, t.key), 0);
    const normalized = (raw / TYPE_MAX[t.key]) * 100;
    const base = permutationBaseline(counts, t.key);
    const z = base.sd > EPS ? (raw - base.mean) / base.sd : 0;
    return { key: t.key, raw, normalized, score: 50 + 10 * z + (CALIBRATION[t.key] || 0) };
  });
}

// そのタイプ方向への回答強度（タイプ方向に答えたら +、反対方向なら −）
function directionStrength(values, questionNumber, typeKey) {
  const v = values[questionNumber - 1];
  const q = QUESTIONS[questionNumber - 1];
  if (q.pos[typeKey]) return v;
  if (q.neg[typeKey]) return -v;
  return 0;
}

// 上位2タイプが僅差のときの比較ルール（順に適用し、差がついた時点で決定）
const CLOSE_RULES = [
  {
    name: "core",
    // 各タイプのコア質問における、そのタイプ方向への回答強度の合計
    compare: (a, b, values) => {
      const sum = (key) => typeByKey(key).core.reduce((acc, q) => acc + directionStrength(values, q, key), 0);
      return sum(a) - sum(b);
    },
  },
  {
    name: "strong",
    // 「かなりそう思う」「かなりそう思わない」でそのタイプ方向へ強く振れた回答の数
    compare: (a, b, values) => {
      const count = (key) =>
        allQuestionNumbers.filter(
          (q) => Math.abs(values[q - 1]) === MAX_ANSWER_VALUE && contribution(values, q, key) > 0
        ).length;
      return count(a) - count(b);
    },
  },
  {
    name: "first-split",
    // Q1から順に見て、2タイプへの点に最初に差がついた質問で決める
    compare: (a, b, values) => {
      for (const q of allQuestionNumbers) {
        const diff = contribution(values, q, a) - contribution(values, q, b);
        if (Math.abs(diff) > EPS) return diff;
      }
      return 0;
    },
  },
];

// メインタイプを決める。すべてのルールで決まらない場合は type: null と候補2タイプを返す
function determineType(typeScores, values) {
  const ranked = typeScores
    .map((s, i) => ({ ...s, order: i }))
    .sort((x, y) => y.score - x.score || x.order - y.order);
  const [first, second] = ranked;

  if (first.score - second.score >= CONFIG.closeGap - EPS) {
    return { type: typeByKey(first.key), candidates: [first.key], decidedBy: "score" };
  }
  for (const rule of CLOSE_RULES) {
    const diff = rule.compare(first.key, second.key, values);
    if (Math.abs(diff) > EPS) {
      const winner = diff > 0 ? first.key : second.key;
      return { type: typeByKey(winner), candidates: [first.key, second.key], decidedBy: rule.name };
    }
  }
  // ランダムには決めず、二択質問で決める
  return { type: null, candidates: [first.key, second.key], decidedBy: null };
}

// 「なんとも言えない」が45問以上、または同じ回答が45問以上なら均一とみなす
function detectUniform(answers) {
  const reasons = [];
  const maxSame = Math.max(...CHOICES.map((c) => answers.filter((a) => a === c.score).length));
  if (maxSame >= CONFIG.sameAnswerThreshold) reasons.push("same-answer");
  if (answers.filter((a) => a === 3).length >= CONFIG.neutralThreshold) reasons.push("neutral");
  return { isUniform: reasons.length > 0, reasons };
}

// 5軸：肯定方向の質問の平均と否定方向の質問の平均の差を、50を中立として0〜100にする。
// 肯定側と否定側を同じ重みで扱うので、全体に「そう思う」寄りに答えても特定の軸だけが高くなりにくい
function calcAxisScores(values) {
  const mean = (qs) => (qs.length ? qs.reduce((acc, q) => acc + values[q - 1], 0) / qs.length : 0);
  return AXES.map((axis) => {
    const percent = 50 + ((mean(axis.pos) - mean(axis.neg)) / (2 * MAX_ANSWER_VALUE)) * 50;
    return { key: axis.key, name: axis.name, percent };
  });
}

function diagnose(answers) {
  const values = answers.map((a) => choiceByScore(a).value);
  const typeScores = calcTypeScores(values);
  return {
    ...determineType(typeScores, values),
    typeScores,
    axisScores: calcAxisScores(values),
    uniform: detectUniform(answers),
  };
}
