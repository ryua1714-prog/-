// 回答データの保存（claude.ai で公開したページの db 機能を使う）
//
// 保存先: responses/<回答者ID>（1人1ドキュメント）
//   { latest: 最新の診断, runs: 直近20回までの診断, updatedAt }
// 回答者IDは claude.ai が発行する匿名のIDで、名前やメールアドレスは保存しない。
// 回答者は自分のドキュメントだけを書き込め、全員分を読めるのは管理者（編集者以上）だけ。
// db 機能がない環境（ファイルを直接開いた場合など）では保存しない。

const MAX_RUNS_PER_RESPONDENT = 20;

const storage = {
  db: null,
  userId: null,
  isAdmin: false,
  ready: null,
};

storage.ready = (async () => {
  if (!window.claude || typeof window.claude.use !== "function") return;
  const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
  storage.db = db;
  if (user) {
    storage.userId = await user.id();
    storage.isAdmin = await user.canEdit();
  }
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
