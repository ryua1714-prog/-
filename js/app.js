// 診断ロジックと画面制御

// ---------- スコア計算 ----------

function average(answers, questionNumbers) {
  const sum = questionNumbers.reduce((acc, q) => acc + answers[q - 1], 0);
  return sum / questionNumbers.length;
}

// 平均点(1〜5)を0〜100に変換
function toPercent(avg) {
  return ((avg - 1) / 4) * 100;
}

// 8タイプの平均スコアを計算（内部保持用。結果画面には一覧表示しない）
function calcTypeScores(answers) {
  return TYPES.map((type) => ({ key: type.key, score: average(answers, type.questions) }));
}

// 最も平均スコアが高いタイプを返す（同点の場合はTYPESの並び順で先のもの）
function determineType(typeScores) {
  let best = typeScores[0];
  for (const s of typeScores) {
    if (s.score > best.score) best = s;
  }
  return TYPES.find((t) => t.key === best.key);
}

function calcAxisScores(answers) {
  return AXES.map((axis) => {
    const avg = average(answers, axis.questions);
    return { key: axis.key, name: axis.name, average: avg, percent: toPercent(avg) };
  });
}

function diagnose(answers) {
  const typeScores = calcTypeScores(answers);
  return {
    type: determineType(typeScores),
    typeScores,
    axisScores: calcAxisScores(answers),
  };
}

// ---------- レーダーチャート ----------

function renderRadar(axisScores, color) {
  const size = 320;
  const c = size / 2;
  const r = 105;
  const n = axisScores.length;
  const ns = "http://www.w3.org/2000/svg";

  const point = (i, ratio) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [c + r * ratio * Math.cos(angle), c + r * ratio * Math.sin(angle)];
  };
  const polygon = (ratio) =>
    axisScores.map((_, i) => point(i, ratio).map((v) => v.toFixed(2)).join(",")).join(" ");

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
    el("polygon", { points: polygon(ratio), class: ratio === 1 ? "radar-grid outer" : "radar-grid" });
  });
  axisScores.forEach((_, i) => {
    const [x, y] = point(i, 1);
    el("line", { x1: c, y1: c, x2: x, y2: y, class: "radar-spoke" });
  });

  // スコア
  const scorePoints = axisScores
    .map((a, i) => point(i, Math.max(a.percent, 0) / 100).map((v) => v.toFixed(2)).join(","))
    .join(" ");
  el("polygon", { points: scorePoints, class: "radar-area", fill: color, stroke: color });
  axisScores.forEach((a, i) => {
    const [x, y] = point(i, a.percent / 100);
    el("circle", { cx: x, cy: y, r: 4, fill: color, class: "radar-dot" });
  });

  // ラベル
  axisScores.forEach((a, i) => {
    const [x, y] = point(i, 1.28);
    const label = el("text", { x, y, class: "radar-label", "text-anchor": "middle" });
    label.textContent = a.name;
    const value = el("text", { x, y: y + 17, class: "radar-value", "text-anchor": "middle" });
    value.textContent = Math.round(a.percent);
  });

  return svg;
}

// ---------- 画面制御 ----------

const state = {
  current: 0,
  answers: new Array(QUESTIONS.length).fill(null),
};

const $ = (id) => document.getElementById(id);

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === name));
  window.scrollTo(0, 0);
}

function renderQuestion() {
  const i = state.current;
  $("q-number").textContent = `Q${i + 1}`;
  $("q-text").textContent = QUESTIONS[i];
  $("progress-text").textContent = `${i + 1} / ${QUESTIONS.length}`;
  $("progress-bar").style.width = `${(i / QUESTIONS.length) * 100}%`;
  $("btn-back").disabled = i === 0;

  const list = $("choices");
  list.innerHTML = "";
  CHOICES.forEach((choice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.dataset.score = choice.score;
    if (state.answers[i] === choice.score) btn.classList.add("selected");
    btn.innerHTML = `<span class="choice-mark" aria-hidden="true"></span><span>${choice.label}</span>`;
    btn.addEventListener("click", () => selectAnswer(choice.score, btn));
    list.appendChild(btn);
  });

  const card = $("question-card");
  card.classList.remove("enter");
  void card.offsetWidth;
  card.classList.add("enter");
}

let advancing = false;

function selectAnswer(score, btn) {
  if (advancing) return;
  state.answers[state.current] = score;
  document.querySelectorAll(".choice").forEach((b) => b.classList.toggle("selected", b === btn));
  advancing = true;
  setTimeout(() => {
    advancing = false;
    if (state.current < QUESTIONS.length - 1) {
      state.current += 1;
      renderQuestion();
    } else {
      showResult();
    }
  }, 220);
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

function showResult() {
  const result = diagnose(state.answers);
  const type = result.type;

  document.documentElement.style.setProperty("--type-color", type.color);
  $("r-emoji").textContent = type.emoji;
  $("r-animal").textContent = type.animal;
  $("r-name").textContent = type.name;

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
  chart.appendChild(renderRadar(result.axisScores, type.color));

  renderParagraphs("r-about", type.about);
  renderParagraphs("r-child", type.child);
  renderParagraphs("r-caution", type.caution);

  showScreen("screen-result");
}

function start() {
  state.current = 0;
  state.answers.fill(null);
  renderQuestion();
  showScreen("screen-question");
}

document.addEventListener("DOMContentLoaded", () => {
  $("btn-start").addEventListener("click", start);
  $("btn-retry").addEventListener("click", start);
  $("btn-back").addEventListener("click", () => {
    if (state.current > 0) {
      state.current -= 1;
      renderQuestion();
    }
  });
});
