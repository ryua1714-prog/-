// 画面制御（判定ロジックは js/scoring.js）

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
    candidates.map((key) => ({ label: typeByKey(key).concept, type: key })),
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

function paragraph(text, className) {
  const p = document.createElement("p");
  if (className) p.className = className;
  p.textContent = text;
  return p;
}

// 結果文章（js/content.js の RESULTS）を原稿の順番どおりにカードとして並べる
function renderResultSections(key) {
  const result = RESULTS[key];

  const intro = $("r-intro");
  intro.innerHTML = "";
  result.intro.forEach((text, i) => intro.appendChild(paragraph(text, i === 0 ? "result-catch" : "")));

  const box = $("r-sections");
  box.innerHTML = "";
  result.sections.forEach((section) => {
    const card = document.createElement("div");
    card.className = "card";
    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = section.title;
    const body = document.createElement("div");
    body.className = "card-body";
    section.items.forEach((item) => {
      if (item.name) {
        const name = document.createElement("h4");
        name.className = "card-subtitle";
        name.textContent = item.name;
        body.appendChild(name);
      } else {
        body.appendChild(paragraph(item.p));
      }
    });
    card.append(title, body);
    box.appendChild(card);
  });
}

function showResult(type) {
  applyTheme(type);
  $("r-emoji").textContent = type.emoji;
  $("r-label").textContent = type.label;
  $("r-role").textContent = type.role;
  $("r-role-emoji").textContent = type.emoji;

  const chart = $("r-chart");
  chart.innerHTML = "";
  chart.appendChild(renderRadar(state.result.axisScores));

  renderResultSections(type.key);
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
