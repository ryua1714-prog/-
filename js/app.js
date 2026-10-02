// 診断ロジックと画面制御

// ---------- 判定の設定値 ----------

const CONFIG = {
  // 1位と2位のnormalizedの差がこの値未満なら僅差とみなす（normalizedは0〜100）
  closeGap: 3,
  // 「なんとも言えない」がこの数以上なら均一とみなす
  neutralThreshold: 24,
};

const RECALC_EXCLUDED_QUESTION = 31; // 僅差時の再計算で除外する質問
const MAX_ANSWER_VALUE = 2;

const choiceByScore = (score) => CHOICES.find((c) => c.score === score);
const typeByKey = (key) => TYPES.find((t) => t.key === key);
const weightOf = (questionNumber, typeKey) => QUESTIONS[questionNumber - 1].weights[typeKey] || 0;
const contribution = (values, questionNumber, typeKey) => values[questionNumber - 1] * weightOf(questionNumber, typeKey);
const allQuestionNumbers = QUESTIONS.map((_, i) => i + 1);

// ---------- タイプ判定 ----------

// 指定した質問だけで各タイプの素点とnormalized（0〜100）を計算する
// maxAbs = そのタイプが理論上取り得る最大絶対点（各ウェイトの絶対値 × 2 の合計）
function calcTypeScores(values, questionNumbers = allQuestionNumbers) {
  return TYPES.map((t) => {
    let raw = 0;
    let maxAbs = 0;
    questionNumbers.forEach((q) => {
      raw += contribution(values, q, t.key);
      maxAbs += Math.abs(weightOf(q, t.key)) * MAX_ANSWER_VALUE;
    });
    const normalized = maxAbs === 0 ? 50 : ((raw / maxAbs + 1) / 2) * 100;
    return { key: t.key, raw, maxAbs, normalized };
  });
}

const EPS = 1e-9;

// 1位と2位が僅差のときの比較ルール（順に適用し、差がついた時点で決定）
const CLOSE_RULES = [
  {
    name: "identifier",
    // 自タイプの識別質問から得た寄与点の合計
    compare: (a, b, values) => {
      const sum = (key) => typeByKey(key).identifiers.reduce((acc, q) => acc + contribution(values, q, key), 0);
      return sum(a) - sum(b);
    },
  },
  {
    name: "without-q31",
    // Q31を除いた30問だけで再計算したnormalized
    compare: (a, b, values) => {
      const qs = allQuestionNumbers.filter((q) => q !== RECALC_EXCLUDED_QUESTION);
      const scores = calcTypeScores(values, qs);
      const n = (key) => scores.find((s) => s.key === key).normalized;
      return n(a) - n(b);
    },
  },
  {
    name: "extreme",
    // 「かなりそう思う」「かなりそう思わない」から得た絶対寄与点
    compare: (a, b, values) => {
      const sum = (key) =>
        allQuestionNumbers
          .filter((q) => Math.abs(values[q - 1]) === MAX_ANSWER_VALUE)
          .reduce((acc, q) => acc + Math.abs(contribution(values, q, key)), 0);
      return sum(a) - sum(b);
    },
  },
  {
    name: "identifier-order",
    // 両タイプの識別質問を質問番号順に見て、最初に寄与点の差が生じたタイプ
    compare: (a, b, values) => {
      const qs = [...new Set([...typeByKey(a).identifiers, ...typeByKey(b).identifiers])].sort((x, y) => x - y);
      for (const q of qs) {
        const diff = contribution(values, q, a) - contribution(values, q, b);
        if (Math.abs(diff) > EPS) return diff;
      }
      return 0;
    },
  },
];

// メインタイプを決める。すべてのルールで決まらない場合は type: null と候補2タイプを返す
function determineType(typeScores, values) {
  // normalizedの降順（同値はTYPESの並び順）
  const ranked = typeScores
    .map((s, i) => ({ ...s, order: i }))
    .sort((x, y) => y.normalized - x.normalized || x.order - y.order);
  const [first, second] = ranked;

  if (first.normalized - second.normalized >= CONFIG.closeGap - EPS) {
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

// ---------- 均一回答の検出 ----------

// 「なんとも言えない」が24問以上、または全問同じ回答なら均一とみなす
function detectUniform(answers) {
  const reasons = [];
  if (answers.every((a) => a === answers[0])) reasons.push("all-same");
  if (answers.filter((a) => a === 3).length >= CONFIG.neutralThreshold) reasons.push("neutral");
  return { isUniform: reasons.length > 0, reasons };
}

// ---------- 5軸 ----------

// 通常方向：かなりそう思う=100 … かなりそう思わない=0 ／ 逆方向はその反対
function calcAxisScores(answers) {
  return AXES.map((axis) => {
    const points = [
      ...axis.normal.map((q) => (answers[q - 1] - 1) * 25),
      ...axis.reverse.map((q) => (5 - answers[q - 1]) * 25),
    ];
    return { key: axis.key, name: axis.name, percent: points.reduce((a, b) => a + b, 0) / points.length };
  });
}

function diagnose(answers) {
  const values = answers.map((a) => choiceByScore(a).value);
  const typeScores = calcTypeScores(values);
  return {
    ...determineType(typeScores, values),
    typeScores,
    axisScores: calcAxisScores(answers),
    uniform: detectUniform(answers),
  };
}

// ---------- レーダーチャート ----------

function renderRadar(axisScores) {
  const size = 320;
  const c = size / 2;
  const r = 105;
  const n = axisScores.length;
  const ns = "http://www.w3.org/2000/svg";

  const point = (i, ratio) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [c + r * ratio * Math.cos(angle), c + r * ratio * Math.sin(angle)];
  };
  const toPoints = (ratios) => ratios.map((ratio, i) => point(i, ratio).map((v) => v.toFixed(2)).join(",")).join(" ");

  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("class", "radar");
  svg.setAttribute("role", "img");
  svg.setAttribute(
    "aria-label",
    "5軸レーダーチャート：" + axisScores.map((a) => `${a.name}${Math.round(a.percent)}`).join("、")
  );

  const el = (tag, attrs) => {
    const node = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    svg.appendChild(node);
    return node;
  };

  // 目盛り（25 / 50 / 75 / 100）
  [0.25, 0.5, 0.75, 1].forEach((ratio) => {
    el("polygon", { points: toPoints(axisScores.map(() => ratio)), class: ratio === 1 ? "radar-grid outer" : "radar-grid" });
  });
  axisScores.forEach((_, i) => {
    const [x, y] = point(i, 1);
    el("line", { x1: c, y1: c, x2: x, y2: y, class: "radar-spoke" });
  });

  // スコア
  el("polygon", { points: toPoints(axisScores.map((a) => a.percent / 100)), class: "radar-area" });
  axisScores.forEach((a, i) => {
    const [x, y] = point(i, a.percent / 100);
    el("circle", { cx: x, cy: y, r: 4, class: "radar-dot" });
  });

  // ラベル
  axisScores.forEach((a, i) => {
    const [x, y] = point(i, 1.28);
    el("text", { x, y, class: "radar-label", "text-anchor": "middle" }).textContent = a.name;
    el("text", { x, y: y + 17, class: "radar-value", "text-anchor": "middle" }).textContent = Math.round(a.percent);
  });

  return svg;
}

// ---------- 画面制御 ----------

const state = {
  current: 0,
  answers: new Array(QUESTIONS.length).fill(null),
  result: null,
};

const $ = (id) => document.getElementById(id);

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === name));
  document.body.classList.toggle("themed", name === "screen-result");
  window.scrollTo(0, 0);
}

function renderQuestion() {
  const i = state.current;
  $("q-number").textContent = `Q${i + 1}`;
  $("q-text").textContent = QUESTIONS[i].text;
  $("progress-text").textContent = `${i + 1} / ${QUESTIONS.length}`;
  $("progress-bar").style.width = `${(i / QUESTIONS.length) * 100}%`;
  $("btn-back").disabled = i === 0;

  const list = $("choices");
  list.innerHTML = "";
  CHOICES.forEach((choice) => {
    const btn = createChoiceButton(choice.label, () => selectAnswer(choice.score, btn));
    btn.dataset.score = choice.score;
    if (state.answers[i] === choice.score) btn.classList.add("selected");
    list.appendChild(btn);
  });

  replayEnter($("question-card"));
}

function createChoiceButton(label, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "choice";
  btn.innerHTML = '<span class="choice-mark" aria-hidden="true"></span><span class="choice-label"></span>';
  btn.querySelector(".choice-label").textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

function replayEnter(card) {
  card.classList.remove("enter");
  void card.offsetWidth;
  card.classList.add("enter");
}

let advancing = false;

function selectAnswer(score, btn) {
  if (advancing) return;
  state.answers[state.current] = score;
  document.querySelectorAll("#choices .choice").forEach((b) => b.classList.toggle("selected", b === btn));
  advancing = true;
  setTimeout(() => {
    advancing = false;
    if (state.current < QUESTIONS.length - 1) {
      state.current += 1;
      renderQuestion();
    } else {
      finish();
    }
  }, 220);
}

function finish() {
  state.result = diagnose(state.answers);
  if (state.result.uniform.isUniform) {
    showScreen("screen-notice");
  } else {
    proceedToResult();
  }
}

function proceedToResult() {
  const result = state.result;
  if (result.type) {
    showResult(result.type);
  } else {
    resolveTie(result.candidates, showResult);
  }
}

// ---------- 同点時の二択質問 ----------

function findTiebreakQuestion(candidates) {
  return TIEBREAK_QUESTIONS.find(
    (q) => q.types.length === 2 && q.types.every((t) => candidates.includes(t))
  );
}

function resolveTie(candidates, done) {
  if (candidates.length === 1) return done(typeByKey(candidates[0]));

  const defined = findTiebreakQuestion(candidates);
  if (defined) {
    askTiebreak(defined.text, defined.options, (winner) => {
      const loser = defined.types.find((t) => t !== winner);
      resolveTie(candidates.filter((t) => t !== loser), done);
    });
    return;
  }

  // 二択質問が未定義の組み合わせは、候補タイプの考え方から本人に選んでもらう
  askTiebreak(
    "次のうち、あなたの考えにより近いのはどちらですか？",
    candidates.map((key) => ({ label: typeByKey(key).about[0], type: key })),
    (winner) => done(typeByKey(winner))
  );
}

function askTiebreak(text, options, onAnswer) {
  $("t-text").textContent = text;
  const list = $("t-choices");
  list.innerHTML = "";
  options.forEach((opt) => {
    const btn = createChoiceButton(opt.label, () => {
      list.querySelectorAll(".choice").forEach((b) => b.classList.toggle("selected", b === btn));
      setTimeout(() => onAnswer(opt.type), 220);
    });
    list.appendChild(btn);
  });
  showScreen("screen-tiebreak");
  replayEnter($("tiebreak-card"));
}

// ---------- 結果 ----------

function applyTheme(type) {
  const root = document.documentElement.style;
  const t = type.theme;
  root.setProperty("--t-primary", t.primary);
  root.setProperty("--t-deep", t.deep);
  root.setProperty("--t-soft", t.soft);
  root.setProperty("--t-bg-from", t.bgFrom);
  root.setProperty("--t-bg-to", t.bgTo);
  document.body.dataset.type = type.key;
}

function renderParagraphs(id, paragraphs) {
  const box = $(id);
  box.innerHTML = "";
  paragraphs.forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    box.appendChild(p);
  });
}

function showResult(type) {
  applyTheme(type);
  $("r-emoji").textContent = type.emoji;
  $("r-label").textContent = type.label;
  $("r-role").textContent = type.role;

  const values = $("r-values");
  values.innerHTML = "";
  type.values.forEach((v) => {
    const tag = document.createElement("span");
    tag.className = "value-tag";
    tag.textContent = v;
    values.appendChild(tag);
  });

  const chart = $("r-chart");
  chart.innerHTML = "";
  chart.appendChild(renderRadar(state.result.axisScores));

  renderParagraphs("r-about", type.about);
  renderParagraphs("r-child", type.child);
  renderParagraphs("r-caution", type.caution);

  showScreen("screen-result");
}

function start() {
  state.current = 0;
  state.answers.fill(null);
  state.result = null;
  renderQuestion();
  showScreen("screen-question");
}

document.addEventListener("DOMContentLoaded", () => {
  $("btn-start").addEventListener("click", start);
  $("btn-retry").addEventListener("click", start);
  $("btn-notice-continue").addEventListener("click", proceedToResult);
  $("btn-notice-restart").addEventListener("click", start);
  $("btn-back").addEventListener("click", () => {
    if (state.current > 0) {
      state.current -= 1;
      renderQuestion();
    }
  });
});
