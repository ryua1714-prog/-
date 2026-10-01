// 診断ロジックと画面制御

// ---------- 判定の設定値 ----------

const CONFIG = {
  // 1位とのnormalized scoreの差がこの値以下なら「ほぼ同点」とみなす（スコア範囲は -2〜+2）
  nearTieMargin: 0.05,
  // 「なんとも言えない」がこの数以上なら均一とみなす
  neutralThreshold: 24,
  // 回答値の標準偏差がこの値未満、かつタイプ間スコアの最大差がこの値未満なら均一とみなす
  lowSpreadStdDev: 0.5,
  flatTypeRange: 0.5,
};

const choiceByScore = (score) => CHOICES.find((c) => c.score === score);

// ---------- タイプ判定 ----------

// 各タイプの「重みの絶対値の合計」（normalizeの分母）
const TYPE_WEIGHT_TOTALS = Object.fromEntries(TYPES.map((t) => [t.key, 0]));
QUESTIONS.forEach((q) => {
  for (const [key, w] of Object.entries(q.weights)) TYPE_WEIGHT_TOTALS[key] += Math.abs(w);
});

// 回答値 × 重み をタイプごとに加算し、重みの絶対値の合計で割る（内部保持用。画面には一覧表示しない）
function calcTypeScores(values) {
  const raw = Object.fromEntries(TYPES.map((t) => [t.key, 0]));
  QUESTIONS.forEach((q, i) => {
    for (const [key, w] of Object.entries(q.weights)) raw[key] += values[i] * w;
  });
  return TYPES.map((t) => ({ key: t.key, raw: raw[t.key], score: raw[t.key] / TYPE_WEIGHT_TOTALS[t.key] }));
}

function identifierAverage(type, values) {
  return type.identifiers.reduce((acc, q) => acc + values[q - 1], 0) / type.identifiers.length;
}

// 1位を決める。決まらない場合は type: null と同点候補を返す
function determineType(typeScores, values) {
  const top = Math.max(...typeScores.map((s) => s.score));
  const near = typeScores.filter((s) => top - s.score <= CONFIG.nearTieMargin + 1e-9).map((s) => s.key);
  if (near.length === 1) return { type: typeByKey(near[0]), candidates: near, decidedBy: "score" };

  // 識別質問の平均回答値で比較
  const idAvg = near.map((key) => ({ key, avg: identifierAverage(typeByKey(key), values) }));
  const best = Math.max(...idAvg.map((s) => s.avg));
  const remaining = idAvg.filter((s) => Math.abs(s.avg - best) < 1e-9).map((s) => s.key);
  if (remaining.length === 1) return { type: typeByKey(remaining[0]), candidates: near, decidedBy: "identifier" };

  // それでも完全同点 → 二択質問で決める（ここでは決めない）
  return { type: null, candidates: remaining, decidedBy: null };
}

function typeByKey(key) {
  return TYPES.find((t) => t.key === key);
}

// ---------- 均一回答の検出 ----------

function detectUniform(answers, values, typeScores) {
  const reasons = [];
  if (answers.every((a) => a === answers[0])) reasons.push("all-same");
  if (answers.filter((a) => a === 3).length >= CONFIG.neutralThreshold) reasons.push("neutral");

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length);
  const scores = typeScores.map((s) => s.score);
  const range = Math.max(...scores) - Math.min(...scores);
  if (sd < CONFIG.lowSpreadStdDev && range < CONFIG.flatTypeRange) reasons.push("low-spread");

  return { isUniform: reasons.length > 0, reasons, stdDev: sd, typeRange: range };
}

// ---------- 5軸 ----------

// かなりそう思う=100 / そう思う=75 / なんとも言えない=50 / そう思わない=25 / かなりそう思わない=0
function calcAxisScores(answers) {
  return AXES.map((axis) => {
    const sum = axis.questions.reduce((acc, q) => acc + (answers[q - 1] - 1) * 25, 0);
    return { key: axis.key, name: axis.name, percent: sum / axis.questions.length };
  });
}

function diagnose(answers) {
  const values = answers.map((a) => choiceByScore(a).value);
  const typeScores = calcTypeScores(values);
  return {
    ...determineType(typeScores, values),
    typeScores,
    axisScores: calcAxisScores(answers),
    uniform: detectUniform(answers, values, typeScores),
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

function review() {
  state.current = 0;
  renderQuestion();
  showScreen("screen-question");
}

document.addEventListener("DOMContentLoaded", () => {
  $("btn-start").addEventListener("click", start);
  $("btn-retry").addEventListener("click", start);
  $("btn-notice-continue").addEventListener("click", proceedToResult);
  $("btn-notice-review").addEventListener("click", review);
  $("btn-back").addEventListener("click", () => {
    if (state.current > 0) {
      state.current -= 1;
      renderQuestion();
    }
  });
});
