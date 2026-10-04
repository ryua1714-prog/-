// 診断データ（回答選択肢・8タイプ・5軸・補正値）
// 質問文・配点・結果文章は js/content.js（content/*.md から生成）にあります。

// score: 回答番号（1〜5）／value: 内部値（-2〜+2）
const CHOICES = [
  { label: "かなりそう思う", score: 5, value: 2 },
  { label: "そう思う", score: 4, value: 1 },
  { label: "なんとも言えない", score: 3, value: 0 },
  { label: "そう思わない", score: 2, value: -1 },
  { label: "かなりそう思わない", score: 1, value: -2 },
];

// 8タイプ（完全に同格。並び順は判定に影響しない）
// core: コア質問 / concept: 中心思想 / theme: 結果画面のタイプカラー
const TYPES = [
  {
    key: "education",
    emoji: "🦉",
    label: "教育型",
    role: "設計者",
    concept: "親が未来の選択肢や教育環境を整える",
    core: [4, 17, 25, 48],
    theme: { primary: "#2f5d9e", deep: "#1f3a6b", soft: "#e4ecf8", bgFrom: "#e9f0fb", bgTo: "#f8fafd" },
  },
  {
    key: "individuality",
    emoji: "🐱",
    label: "個性型",
    role: "プロデューサー",
    concept: "得意・好き・その子らしさを伸ばす",
    core: [6, 22, 30, 39],
    theme: { primary: "#8b64c9", deep: "#5d3f96", soft: "#eee7fa", bgFrom: "#f1eafb", bgTo: "#fbf9fe" },
  },
  {
    key: "independence",
    emoji: "🐴",
    label: "自立型",
    role: "相談役",
    concept: "本人に選択と結果を委ねる",
    core: [15, 29, 40, 49],
    theme: { primary: "#2a9a7f", deep: "#17674f", soft: "#e0f3ec", bgFrom: "#e5f5ef", bgTo: "#f8fcfa" },
  },
  {
    key: "challenge",
    emoji: "🐒",
    label: "挑戦型",
    role: "応援団長",
    concept: "未知・経験・挑戦によって世界を広げる",
    core: [8, 9, 20, 45],
    theme: { primary: "#ee7d1f", deep: "#ae570c", soft: "#fdecd9", bgFrom: "#fff0df", bgTo: "#fffaf4" },
  },
  {
    key: "social",
    emoji: "🐶",
    label: "社会型",
    role: "指導者",
    concept: "礼儀・協調・人との関係を育てる",
    core: [3, 14, 28, 35],
    theme: { primary: "#d4a21a", deep: "#87650a", soft: "#faf1d2", bgFrom: "#fcf4d9", bgTo: "#fffdf5" },
  },
  {
    key: "security",
    emoji: "🐨",
    label: "安心型",
    role: "保護者",
    concept: "幸福・安心・心の安全基地を守る",
    core: [16, 36, 44, 47],
    theme: { primary: "#d98f93", deep: "#a45d63", soft: "#f9ebe6", bgFrom: "#fbeee9", bgTo: "#fdf9f4" },
  },
  {
    key: "effort",
    emoji: "🐯",
    label: "努力型",
    role: "監督",
    concept: "継続・積み重ね・簡単に投げないことを重視する",
    core: [5, 27, 37, 46],
    theme: { primary: "#d4422a", deep: "#962b19", soft: "#fbe2dc", bgFrom: "#fde6df", bgTo: "#fff8f5" },
  },
  {
    key: "strategy",
    emoji: "🦊",
    label: "戦略型",
    role: "軍師",
    concept: "目的から逆算して方法や環境を最適化する",
    core: [18, 23, 31, 41],
    theme: { primary: "#4d8291", deep: "#2c5663", soft: "#e2edf0", bgFrom: "#e6f0f2", bgTo: "#f8fbfb" },
  },
];

// タイプごとの補正値（判定用スコアに加算）。
// 配点の構造上、特定のタイプが出やすくならないように、tools/calibrate.js で
// 想定回答者集団に対して各タイプが12.5%ずつになるよう算出した固定値。
// 回答ごとに変わることはないため、同じ回答なら常に同じ結果になる。
const CALIBRATION = {
  education: -4.01,
  individuality: 1.27,
  independence: -7.1,
  challenge: 6.41,
  social: 5.58,
  security: -3.44,
  effort: -2.34,
  strategy: 3.65,
};

// 5軸レーダーチャート（タイプ判定とは別に回答から計算）
// pos: 「そう思う」ほど高くなる質問 / neg: 「そう思わない」ほど高くなる質問
const AXES = [
  {
    key: "learning",
    name: "学び",
    pos: [1, 4, 11, 12, 17, 25, 31, 34, 42, 48, 50],
    neg: [15, 22, 30, 38, 40],
  },
  {
    key: "individuality",
    name: "個性",
    pos: [2, 6, 10, 15, 22, 24, 29, 31, 35, 38, 39, 40, 45, 49],
    neg: [3, 4, 14, 17, 21, 28, 34, 48, 50],
  },
  {
    key: "growth",
    name: "成長",
    pos: [5, 7, 8, 13, 18, 19, 20, 26, 27, 32, 37, 41, 43, 46],
    neg: [23, 36, 44, 47],
  },
  {
    key: "manners",
    name: "礼儀",
    pos: [3, 14],
    neg: [9, 24, 35, 39],
  },
  {
    key: "stability",
    name: "安定",
    pos: [16, 28, 30, 33, 36, 44, 47],
    neg: [1, 5, 8, 11, 13, 19, 25, 26, 27, 29, 32, 42, 45],
  },
];

// 判定ルールをすべて使っても決まらないときに使う、タイプ間の二択質問。
// 後から追加する場合は次の形式で書く（types の2タイプが同点のときに出題）:
// {
//   types: ["education", "strategy"],
//   text: "子どもが新しいことを始めるとき、より大切にしたいのは？",
//   options: [
//     { label: "将来の土台になる環境を整えること", type: "education" },
//     { label: "それを実現する道筋を一緒に考えること", type: "strategy" },
//   ],
// },
const TIEBREAK_QUESTIONS = [];
