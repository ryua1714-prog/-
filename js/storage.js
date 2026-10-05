// 回答データの保存
//
// 保存先は次のどちらか（js/config.js と公開先で自動的に決まる）
// - db:     claude.ai で公開したページ。db 機能の responses/<回答者ID> に保存する
// - sheets: 一般のWebサイトとして置いたページ。SHEETS_ENDPOINT の Googleスプレッドシートに1行ずつ追加する
//
// db の保存形式: responses/<回答者ID>（1人1ドキュメント）
//   { latest: 最新の診断, runs: 直近20回までの診断, updatedAt }
// 回答者IDは claude.ai が発行する匿名のIDで、名前やメールアドレスは保存しない。
// 回答者は自分のドキュメントだけを書き込め、全員分を読めるのは管理者（編集者以上）だけ。
// どちらも使えない環境（ファイルを直接開いた場合など）では保存しない。

const MAX_RUNS_PER_RESPONDENT = 20;

const storage = {
  mode: null, // "db" | "sheets" | null
  db: null,
  userId: null,
  isAdmin: false,
  ready: null,
};

// スプレッドシート用の匿名の回答者ID（このブラウザに保存。使えなければこの訪問限り）
function sheetsRespondentId() {
  const make = () =>
    window.crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12);
  try {
    let id = localStorage.getItem("kosodate-respondent-id");
    if (!id) {
      id = make();
      localStorage.setItem("kosodate-respondent-id", id);
    }
    return id;
  } catch (e) {
    storage.sessionId = storage.sessionId || make();
    return storage.sessionId;
  }
}

storage.ready = (async () => {
  if (window.claude && typeof window.claude.use === "function") {
    const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
    if (db) {
      storage.mode = "db";
      storage.db = db;
      if (user) {
        storage.userId = await user.id();
        storage.isAdmin = await user.canEdit();
      }
      return;
    }
  }
  if (typeof SHEETS_ENDPOINT === "string" && SHEETS_ENDPOINT) storage.mode = "sheets";
})().catch(() => {});

function buildRecord(type) {
  const result = state.result;
  return {
    at: new Date().toISOString(),
    type: type.key,
    decidedBy: result.type ? result.decidedBy : "choice",
    uniform: result.uniform.isUniform,
    answers: state.answers.slice(),
    axes: Object.fromEntries(result.axisScores.map((a) => [a.key, Math.round(a.percent * 10) / 10])),
  };
}

// 診断が完了したときに1回だけ呼ぶ
async function saveResult(type) {
  await storage.ready;
  if (storage.mode === "sheets") return saveToSheets(buildRecord(type));
  if (!storage.db || !storage.userId) return;
  const record = buildRecord(type);
  try {
    const ref = storage.db.doc("responses/" + storage.userId);
    const snap = await ref.get();
    const prev = snap.exists ? snap.data().runs || [] : [];
    const runs = [...prev, record].slice(-MAX_RUNS_PER_RESPONDENT);
    await ref.set({ latest: record, runs, updatedAt: record.at });
  } catch (e) {
    // 閲覧のみの権限など、保存できない場合は診断結果の表示だけを続ける
    console.warn("回答を保存できませんでした:", e && e.code);
  }
}

// スプレッドシートへ送る（回答は内部値 -2〜+2 で送る）
async function saveToSheets(record) {
  try {
    await fetch(SHEETS_ENDPOINT, {
      method: "POST",
      // text/plain にすると事前確認（CORS preflight）なしで Apps Script に届く
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        respondentId: sheetsRespondentId(),
        type: record.type,
        decidedBy: record.decidedBy,
        uniform: record.uniform,
        axes: record.axes,
        answers: record.answers.map((score) => choiceByScore(score).value),
      }),
    });
  } catch (e) {
    console.warn("スプレッドシートに送信できませんでした");
  }
}
