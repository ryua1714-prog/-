/**
 * 子育てタイプ診断 × Googleスプレッドシート連携（Google Apps Script）
 *
 * 使い方は docs/spreadsheet-setup.md を参照。
 * - 診断ページから送られた結果を「回答」シートに1行ずつ追加する
 * - 「タイプ集計」シートにタイプ別の件数・割合とグラフを用意し、回答が来るたびに更新する
 * - 管理者キー付きのリクエストにだけ、ダッシュボード用に回答データを返す
 */

const SHEET_RESPONSES = '回答';
const SHEET_SUMMARY = 'タイプ集計';
const QUESTION_COUNT = 50;

const TYPES = [
  ['education', '教育型', '設計者'],
  ['individuality', '個性型', 'プロデューサー'],
  ['independence', '自立型', '相談役'],
  ['challenge', '挑戦型', '応援団長'],
  ['social', '社会型', '指導者'],
  ['security', '安心型', '保護者'],
  ['effort', '努力型', '監督'],
  ['strategy', '戦略型', '軍師'],
];
const AXES = [
  ['learning', '学び'],
  ['individuality', '個性'],
  ['growth', '成長'],
  ['manners', '礼儀'],
  ['stability', '安定'],
];
const DECIDED_BY = ['score', 'core', 'strong', 'first-split', 'choice'];

const HEADER = ['日時', '回答者ID', 'タイプキー', 'タイプ', '判定方法', '回答が均一']
  .concat(AXES.map((a) => a[1]))
  .concat(Array.from({ length: QUESTION_COUNT }, (_, i) => 'Q' + (i + 1)));
const COL = { at: 0, respondent: 1, typeKey: 2, typeLabel: 3, decidedBy: 4, uniform: 5, axes: 6, answers: 6 + AXES.length };

// ---------- 初期設定（最初に1回、エディタから実行する） ----------

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const responses = ss.getSheetByName(SHEET_RESPONSES) || ss.insertSheet(SHEET_RESPONSES);
  responses.getRange(1, 1, 1, HEADER.length).setValues([HEADER]).setFontWeight('bold');
  responses.setFrozenRows(1);

  const summary = ss.getSheetByName(SHEET_SUMMARY) || ss.insertSheet(SHEET_SUMMARY, 0);
  updateSummary_();
  if (summary.getCharts().length === 0) {
    const chart = summary
      .newChart()
      .asBarChart()
      .addRange(summary.getRange(4, 1, TYPES.length + 1, 1))
      .addRange(summary.getRange(4, 3, TYPES.length + 1, 1))
      .setPosition(4, 8, 0, 0)
      .setOption('title', 'タイプ別の割合（回答者ごとの最新の結果）')
      .setOption('legend', { position: 'none' })
      .setOption('hAxis', { format: 'percent', minValue: 0 })
      .build();
    summary.insertChart(chart);
  }

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ADMIN_KEY')) props.setProperty('ADMIN_KEY', Utilities.getUuid().replace(/-/g, ''));
  Logger.log('管理者キー: ' + props.getProperty('ADMIN_KEY'));
}

// ---------- 受信（診断ページから結果を受け取る） ----------

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'invalid_json' });
  }
  const row = toRow_(body);
  if (!row) return json_({ ok: false, error: 'invalid_data' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RESPONSES);
    sheet.appendRow(row);
    updateSummary_();
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

// 送られてきた内容を検査して1行にする。おかしなデータは保存しない
function toRow_(body) {
  if (!body || typeof body !== 'object') return null;
  const type = TYPES.find((t) => t[0] === body.type);
  if (!type) return null;
  if (typeof body.respondentId !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(body.respondentId)) return null;
  const answers = body.answers;
  if (!Array.isArray(answers) || answers.length !== QUESTION_COUNT) return null;
  if (!answers.every((v) => Number.isInteger(v) && v >= -2 && v <= 2)) return null;
  const axes = AXES.map((a) => {
    const v = body.axes && Number(body.axes[a[0]]);
    return Number.isFinite(v) && v >= 0 && v <= 100 ? Math.round(v * 10) / 10 : '';
  });
  const decidedBy = DECIDED_BY.indexOf(body.decidedBy) >= 0 ? body.decidedBy : '';
  return [new Date(), body.respondentId, type[0], type[1] + '｜' + type[2], decidedBy, body.uniform === true]
    .concat(axes)
    .concat(answers);
}

// ---------- 集計シートの更新 ----------

function readRecords_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RESPONSES);
  const last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet
    .getRange(2, 1, last - 1, HEADER.length)
    .getValues()
    .filter((r) => r[COL.typeKey]);
}

function updateSummary_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const summary = ss.getSheetByName(SHEET_SUMMARY);
  if (!summary) return;
  const rows = readRecords_();

  // 回答者ごとの最新の結果
  const latest = {};
  rows.forEach((r) => {
    const id = r[COL.respondent];
    if (!latest[id] || r[COL.at] >= latest[id][COL.at]) latest[id] = r;
  });
  const latestRows = Object.keys(latest).map((k) => latest[k]);

  const count = (list, key) => list.filter((r) => r[COL.typeKey] === key).length;
  const share = (n, total) => (total ? n / total : 0);

  const table = [['タイプ', '回答者数（最新の結果）', '割合', '診断回数（すべて）', '割合']];
  TYPES.forEach((t) => {
    const a = count(latestRows, t[0]);
    const b = count(rows, t[0]);
    table.push([t[1] + '｜' + t[2], a, share(a, latestRows.length), b, share(b, rows.length)]);
  });
  table.push(['合計', latestRows.length, latestRows.length ? 1 : 0, rows.length, rows.length ? 1 : 0]);

  summary.getRange(1, 1).setValue('タイプ別の集計').setFontWeight('bold').setFontSize(14);
  summary.getRange(2, 1).setValue('最終更新: ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm'));
  summary.getRange(4, 1, table.length, table[0].length).setValues(table);
  summary.getRange(4, 1, 1, table[0].length).setFontWeight('bold');
  summary.getRange(5, 3, TYPES.length + 1, 1).setNumberFormat('0.0%');
  summary.getRange(5, 5, TYPES.length + 1, 1).setNumberFormat('0.0%');
  summary.getRange(4 + TYPES.length + 1, 1, 1, table[0].length).setFontWeight('bold');
  summary.getRange(4 + TYPES.length + 2, 1).setValue('目標はどのタイプも12.5%です。');
  summary.autoResizeColumns(1, table[0].length);
}

// ---------- 管理者ダッシュボード用の読み出し ----------

function doGet(e) {
  const key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!key || !e || !e.parameter || e.parameter.key !== key) return json_({ ok: false, error: 'unauthorized' });
  const records = readRecords_().map((r) => ({
    at: new Date(r[COL.at]).toISOString(),
    respondentId: String(r[COL.respondent]),
    type: r[COL.typeKey],
    decidedBy: r[COL.decidedBy],
    uniform: r[COL.uniform] === true,
    axes: Object.fromEntries(AXES.map((a, i) => [a[0], r[COL.axes + i] === '' ? null : Number(r[COL.axes + i])])),
    answers: r.slice(COL.answers, COL.answers + QUESTION_COUNT).map(Number),
  }));
  return json_({ ok: true, records });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
