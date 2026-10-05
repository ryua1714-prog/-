// 管理者用分析ダッシュボード（db の responses を集計して表示）

const dashboard = {
  docs: [],
  unsubscribe: null,
  basis: "respondent", // respondent: 回答者ごとの最新結果 / run: すべての診断
  days: 0, // 0 = 全期間
  loaded: false,
};

// ---------- 集計（画面に依存しない） ----------

function summarize(docs, { basis, days, now = Date.now() }) {
  const since = days ? now - days * 86400000 : 0;
  const inRange = (r) => r && r.at && Date.parse(r.at) >= since;
  const records =
    basis === "run"
      ? docs.flatMap((d) => (d.runs || []).filter(inRange))
      : docs.map((d) => d.latest).filter(inRange);

  const total = records.length;
  const typeCounts = Object.fromEntries(TYPES.map((t) => [t.key, 0]));
  records.forEach((r) => {
    if (r.type in typeCounts) typeCounts[r.type] += 1;
  });

  const axisAverages = AXES.map((axis) => {
    const vals = records.map((r) => r.axes && r.axes[axis.key]).filter((v) => typeof v === "number");
    return { key: axis.key, name: axis.name, value: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null };
  });

  // 質問ごとの回答分布（かなりそう思う … かなりそう思わない の件数）
  const questionDist = QUESTIONS.map((_, i) => {
    const counts = CHOICES.map((c) => records.filter((r) => r.answers && r.answers[i] === c.score).length);
    const answered = counts.reduce((a, b) => a + b, 0);
    const mean = answered
      ? records.reduce((acc, r) => acc + (r.answers && r.answers[i] ? choiceByScore(r.answers[i]).value : 0), 0) / answered
      : null;
    return { counts, answered, mean };
  });

  const respondents = new Set(
    docs.filter((d) => (basis === "run" ? (d.runs || []).some(inRange) : inRange(d.latest))).map((d) => d.id)
  ).size;

  return {
    total,
    respondents,
    runs: docs.reduce((acc, d) => acc + (d.runs || []).filter(inRange).length, 0),
    typeCounts,
    closeRate: total ? records.filter((r) => r.decidedBy && r.decidedBy !== "score").length / total : 0,
    uniformRate: total ? records.filter((r) => r.uniform).length / total : 0,
    axisAverages,
    questionDist,
  };
}

// ---------- 表示 ----------

const pct = (x, digits = 1) => (x * 100).toFixed(digits) + "%";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderDashboard() {
  const s = summarize(dashboard.docs, dashboard);
  const root = $("dash-body");
  root.innerHTML = "";

  if (!dashboard.loaded) {
    root.appendChild(el("p", "dash-empty", "回答データを読み込んでいます…"));
    return;
  }

  // 概要
  const kpis = el("div", "dash-kpis");
  [
    ["回答者数", s.respondents.toLocaleString() + "人"],
    ["診断回数", s.runs.toLocaleString() + "回"],
    ["僅差で判定した割合", s.total ? pct(s.closeRate) : "—"],
    ["回答が均一だった割合", s.total ? pct(s.uniformRate) : "—"],
  ].forEach(([label, value]) => {
    const tile = el("div", "dash-kpi");
    tile.append(el("span", "dash-kpi-label", label), el("span", "dash-kpi-value", value));
    kpis.appendChild(tile);
  });
  root.appendChild(kpis);

  if (!s.total) {
    root.appendChild(
      el("p", "dash-empty", "この条件に当てはまる回答はまだありません。診断を最後まで終えると、ここに集計されます。")
    );
    return;
  }

  // タイプ別の割合
  const typeCard = el("section", "dash-card");
  typeCard.appendChild(el("h3", "dash-card-title", "タイプ別の割合"));
  typeCard.appendChild(
    el("p", "dash-note", `${s.total.toLocaleString()}件（${dashboard.basis === "run" ? "すべての診断" : "回答者ごとの最新の結果"}）。点線は目標の12.5%です。`)
  );
  const maxShare = Math.max(0.25, ...TYPES.map((t) => s.typeCounts[t.key] / s.total));
  const list = el("div", "dash-bars");
  TYPES.forEach((t) => {
    const count = s.typeCounts[t.key];
    const share = count / s.total;
    const row = el("div", "dash-bar-row");
    row.title = `${t.label}｜${t.role}：${count}件（${pct(share)}）`;
    const label = el("span", "dash-bar-label");
    label.append(el("span", "dash-bar-emoji", t.emoji), el("span", "", t.label));
    const track = el("span", "dash-bar-track");
    const fill = el("span", "dash-bar-fill");
    fill.style.width = (share / maxShare) * 100 + "%";
    fill.style.background = t.theme.primary;
    const target = el("span", "dash-bar-target");
    target.style.left = (0.125 / maxShare) * 100 + "%";
    track.append(fill, target);
    const value = el("span", "dash-bar-value");
    value.append(el("strong", "", pct(share)), el("span", "dash-bar-count", ` ${count}件`));
    row.append(label, track, value);
    list.appendChild(row);
  });
  typeCard.appendChild(list);
  root.appendChild(typeCard);

  // 5軸の平均
  const axisCard = el("section", "dash-card");
  axisCard.appendChild(el("h3", "dash-card-title", "5軸の平均"));
  axisCard.appendChild(el("p", "dash-note", "0〜100。中央の線が中立の50です。"));
  const axisList = el("div", "dash-bars");
  s.axisAverages.forEach((a) => {
    const row = el("div", "dash-bar-row");
    row.title = `${a.name}：${a.value === null ? "—" : a.value.toFixed(1)}`;
    const track = el("span", "dash-bar-track");
    const fill = el("span", "dash-bar-fill dash-axis-fill");
    fill.style.width = (a.value || 0) + "%";
    const mid = el("span", "dash-bar-target");
    mid.style.left = "50%";
    track.append(fill, mid);
    row.append(el("span", "dash-bar-label", a.name), track, el("span", "dash-bar-value", a.value === null ? "—" : a.value.toFixed(1)));
    axisList.appendChild(row);
  });
  axisCard.appendChild(axisList);
  root.appendChild(axisCard);

  // 質問ごとの回答分布
  const qCard = el("details", "dash-card dash-questions");
  qCard.appendChild(el("summary", "dash-card-title", "質問ごとの回答分布"));
  const legend = el("div", "dash-legend");
  CHOICES.forEach((c, i) => {
    const item = el("span", "dash-legend-item");
    item.append(el("span", `dash-swatch dash-level-${i}`), el("span", "", c.label));
    legend.appendChild(item);
  });
  qCard.appendChild(legend);
  const table = el("div", "dash-qtable");
  s.questionDist.forEach((q, i) => {
    const row = el("div", "dash-qrow");
    row.title = `Q${i + 1} ${QUESTIONS[i].text}\n` + CHOICES.map((c, l) => `${c.label} ${q.counts[l]}件`).join(" / ");
    const head = el("div", "dash-qhead");
    head.append(el("span", "dash-qnum", `Q${i + 1}`), el("span", "dash-qtext", QUESTIONS[i].text));
    const bar = el("div", "dash-stack");
    q.counts.forEach((n, l) => {
      if (!n) return;
      const seg = el("span", `dash-seg dash-level-${l}`);
      seg.style.flexGrow = n;
      bar.appendChild(seg);
    });
    const mean = el("span", "dash-qmean", q.mean === null ? "—" : (q.mean > 0 ? "+" : "") + q.mean.toFixed(2));
    row.append(head, bar, mean);
    table.appendChild(row);
  });
  qCard.appendChild(table);
  root.appendChild(qCard);
}

// ---------- データの読み込み ----------

// スプレッドシートの行を、db と同じ形（回答者ごとの { id, latest, runs }）にまとめる
function groupSheetRecords(records) {
  const byRespondent = {};
  records.forEach((r) => {
    const rec = { ...r, answers: (r.answers || []).map((v) => v + 3) }; // 内部値 → 回答番号（1〜5）
    (byRespondent[r.respondentId] = byRespondent[r.respondentId] || []).push(rec);
  });
  return Object.entries(byRespondent).map(([id, runs]) => {
    runs.sort((x, y) => Date.parse(x.at) - Date.parse(y.at));
    return { id, runs, latest: runs[runs.length - 1] };
  });
}

function dashMessage(text) {
  $("dash-body").innerHTML = "";
  $("dash-body").appendChild(el("p", "dash-empty", text));
}

function readAdminKey() {
  try {
    return sessionStorage.getItem("kosodate-admin-key") || "";
  } catch (e) {
    return dashboard.adminKey || "";
  }
}

function rememberAdminKey(key) {
  dashboard.adminKey = key;
  try {
    if (key) sessionStorage.setItem("kosodate-admin-key", key);
    else sessionStorage.removeItem("kosodate-admin-key");
  } catch (e) {}
}

async function loadFromSheets() {
  const key = readAdminKey();
  $("dash-login").hidden = Boolean(key);
  $("btn-dash-reload").hidden = !key;
  if (!key) {
    $("dash-body").innerHTML = "";
    return;
  }
  dashMessage("スプレッドシートから回答データを読み込んでいます…");
  try {
    const res = await fetch(SHEETS_ENDPOINT + "?key=" + encodeURIComponent(key));
    const json = await res.json();
    if (!json.ok) {
      rememberAdminKey("");
      $("dash-login").hidden = false;
      $("btn-dash-reload").hidden = true;
      $("dash-login-error").hidden = false;
      $("dash-body").innerHTML = "";
      return;
    }
    dashboard.docs = groupSheetRecords(json.records || []);
    dashboard.loaded = true;
    renderDashboard();
  } catch (e) {
    dashMessage("スプレッドシートに接続できませんでした。js/config.js のURLと、Apps Script の公開設定を確認してください。");
  }
}

// ---------- 開閉 ----------

async function openDashboard() {
  await storage.ready;
  if (storage.mode === "sheets") {
    showScreen("screen-dashboard");
    $("dash-source").textContent = "データ元：Googleスプレッドシート";
    return loadFromSheets();
  }
  if (!storage.db || !storage.isAdmin) return;
  showScreen("screen-dashboard");
  $("dash-source").textContent = "データ元：このページに保存された回答";
  renderDashboard();
  if (!dashboard.unsubscribe) {
    dashboard.unsubscribe = storage.db
      .collection("responses")
      .limit(1000)
      .onSnapshot(
        (snap) => {
          dashboard.docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          dashboard.loaded = true;
          renderDashboard();
        },
        () => {
          dashboard.loaded = true;
          dashMessage("回答データを読み込めませんでした。ページを開き直してください。");
        }
      );
  }
}
function setupDashboardControls() {
  document.querySelectorAll("[data-dash-basis]").forEach((btn) =>
    btn.addEventListener("click", () => {
      dashboard.basis = btn.dataset.dashBasis;
      document.querySelectorAll("[data-dash-basis]").forEach((b) => b.setAttribute("aria-pressed", b === btn));
      renderDashboard();
    })
  );
  document.querySelectorAll("[data-dash-days]").forEach((btn) =>
    btn.addEventListener("click", () => {
      dashboard.days = Number(btn.dataset.dashDays);
      document.querySelectorAll("[data-dash-days]").forEach((b) => b.setAttribute("aria-pressed", b === btn));
      renderDashboard();
    })
  );
  $("btn-dash-close").addEventListener("click", () => showScreen("screen-start"));
  document.querySelectorAll(".btn-admin").forEach((btn) => btn.addEventListener("click", openDashboard));

  $("dash-login").addEventListener("submit", (e) => {
    e.preventDefault();
    const key = $("dash-key").value.trim();
    if (!key) return;
    $("dash-login-error").hidden = true;
    rememberAdminKey(key);
    $("dash-key").value = "";
    loadFromSheets();
  });
  $("btn-dash-reload").addEventListener("click", loadFromSheets);

  storage.ready.then(() => {
    // claude.ai では管理者（編集者以上）にだけ入口を表示する
    if (storage.mode === "db" && storage.isAdmin) {
      document.querySelectorAll(".btn-admin").forEach((btn) => (btn.hidden = false));
    }
    // スプレッドシート連携では、URLの末尾に #admin を付けて開くと管理者キーの入力画面になる
    if (location.hash === "#admin") openDashboard();
    window.addEventListener("hashchange", () => {
      if (location.hash === "#admin") openDashboard();
    });
  });
}
