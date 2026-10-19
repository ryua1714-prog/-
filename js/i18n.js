// 多言語対応（画面の文言・回答選択肢・タイプ名・5軸の名前）
// 質問文と結果文章の翻訳は js/content.js の CONTENT_I18N（content/i18n/*/ から生成）にあります。
// 日本語は原稿そのまま。管理者用ダッシュボードは日本語のみ。

const LANGUAGES = [
  { code: "ja", name: "日本語" },
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
  { code: "ko", name: "한국어" },
  { code: "es", name: "Español" },
  { code: "ru", name: "Русский" },
];

const I18N = {
  ja: {
    title: "子育てタイプ診断",
    description: "50の質問に答えて、あなたの子育てタイプを8つのタイプで診断します。",
    lead: "50の質問に答えて、あなたが子育てで大切にしている価値観を8つのタイプで診断します。",
    note1: "全50問・所要時間は約5分",
    note2: "直感で、いちばん近いものを選んでください",
    start: "診断をはじめる",
    back: "← 前の質問に戻る",
    noticeTitle: "回答の傾向がかなり均一でした。",
    noticeBody: "『理想の親ならどうするか』ではなく、実際の自分ならどう考えるかを意識すると、より特徴が出やすくなります。",
    noticeContinue: "このまま結果を見る",
    noticeRestart: "初めから診断する",
    tiebreakLead: "あと1問だけ答えてください",
    tiebreakQuestion: "次のうち、あなたの考えにより近いのはどちらですか？",
    resultCaption: "あなたは",
    balance: "子育てバランス",
    retry: "もう一度診断する",
    radarLabel: "5軸レーダーチャート：",
    radarSep: "、",
    choices: ["かなりそう思う", "そう思う", "なんとも言えない", "そう思わない", "かなりそう思わない"],
    axes: { learning: "学び", individuality: "個性", growth: "成長", manners: "礼儀", stability: "安定" },
  },
  en: {
    title: "Parenting Style Assessment",
    description: "Answer 50 questions to find out which of 8 parenting types fits you best.",
    lead: "Answer 50 questions to discover which of 8 types best describes the values you hold most dear as a parent.",
    note1: "50 questions · about 5 minutes",
    note2: "Go with your gut and pick the answer closest to you",
    start: "Start the assessment",
    back: "← Previous question",
    noticeTitle: "Your answers were very uniform.",
    noticeBody:
      "Try answering based on what you would actually think, rather than what an “ideal parent” would do. Your results will show more of your own character.",
    noticeContinue: "See my results anyway",
    noticeRestart: "Start over",
    tiebreakLead: "Just one more question",
    tiebreakQuestion: "Which of these is closer to the way you think?",
    resultCaption: "You are",
    balance: "Your Parenting Balance",
    retry: "Take the assessment again",
    radarLabel: "Five-axis radar chart: ",
    radarSep: ", ",
    choices: ["Strongly agree", "Agree", "Not sure", "Disagree", "Strongly disagree"],
    axes: { learning: "Learning", individuality: "Individuality", growth: "Growth", manners: "Manners", stability: "Stability" },
  },
  zh: {
    title: "育儿类型诊断",
    description: "回答50个问题，在8种类型中找到你的育儿类型。",
    lead: "回答50个问题，用8种类型来诊断你在育儿中最看重的价值观。",
    note1: "共50题 · 约需5分钟",
    note2: "请凭直觉选择最接近你的选项",
    start: "开始诊断",
    back: "← 返回上一题",
    noticeTitle: "你的回答倾向相当一致。",
    noticeBody: "请不要按照“理想的父母会怎么做”来回答，而是想一想真实的自己会怎么想，这样更容易体现出你的特点。",
    noticeContinue: "直接查看结果",
    noticeRestart: "重新开始诊断",
    tiebreakLead: "请再回答最后一个问题",
    tiebreakQuestion: "以下哪一项更接近你的想法？",
    resultCaption: "你是",
    balance: "育儿平衡",
    retry: "再诊断一次",
    radarLabel: "五维雷达图：",
    radarSep: "，",
    choices: ["非常同意", "同意", "说不清", "不同意", "非常不同意"],
    axes: { learning: "学习", individuality: "个性", growth: "成长", manners: "礼仪", stability: "安定" },
  },
  ko: {
    title: "육아 유형 진단",
    description: "50개의 질문에 답하고 8가지 유형 중 나의 육아 유형을 알아보세요.",
    lead: "50개의 질문에 답하면, 당신이 육아에서 소중히 여기는 가치관을 8가지 유형으로 진단합니다.",
    note1: "총 50문항 · 약 5분 소요",
    note2: "직감적으로 가장 가까운 것을 골라 주세요",
    start: "진단 시작하기",
    back: "← 이전 질문으로",
    noticeTitle: "응답 경향이 상당히 균일했습니다.",
    noticeBody: "‘이상적인 부모라면 어떻게 할까’가 아니라 실제의 나라면 어떻게 생각할지를 의식하면 특징이 더 잘 드러납니다.",
    noticeContinue: "이대로 결과 보기",
    noticeRestart: "처음부터 다시 진단하기",
    tiebreakLead: "한 문항만 더 답해 주세요",
    tiebreakQuestion: "다음 중 당신의 생각에 더 가까운 것은 무엇인가요?",
    resultCaption: "당신은",
    balance: "육아 밸런스",
    retry: "다시 진단하기",
    radarLabel: "5축 레이더 차트: ",
    radarSep: ", ",
    choices: ["매우 그렇다", "그렇다", "잘 모르겠다", "그렇지 않다", "전혀 그렇지 않다"],
    axes: { learning: "배움", individuality: "개성", growth: "성장", manners: "예의", stability: "안정" },
  },
  es: {
    title: "Test de estilo de crianza",
    description: "Responde 50 preguntas y descubre cuál de los 8 tipos de crianza es el tuyo.",
    lead: "Responde 50 preguntas y descubre, entre 8 tipos, cuáles son los valores que más te importan en la crianza.",
    note1: "50 preguntas · unos 5 minutos",
    note2: "Déjate llevar por la intuición y elige la opción más cercana a ti",
    start: "Empezar el test",
    back: "← Pregunta anterior",
    noticeTitle: "Tus respuestas han sido muy uniformes.",
    noticeBody:
      "Intenta responder pensando en lo que tú harías de verdad, no en lo que haría un «padre o madre ideal». Así tus resultados reflejarán mejor tu manera de ser.",
    noticeContinue: "Ver los resultados igualmente",
    noticeRestart: "Empezar de nuevo",
    tiebreakLead: "Solo una pregunta más",
    tiebreakQuestion: "¿Cuál de estas opciones se acerca más a tu forma de pensar?",
    resultCaption: "Tu resultado",
    balance: "Tu equilibrio en la crianza",
    retry: "Hacer el test otra vez",
    radarLabel: "Gráfico radar de cinco ejes: ",
    radarSep: ", ",
    choices: ["Muy de acuerdo", "De acuerdo", "No sé", "En desacuerdo", "Muy en desacuerdo"],
    axes: { learning: "Aprendizaje", individuality: "Individualidad", growth: "Crecimiento", manners: "Modales", stability: "Estabilidad" },
  },
  ru: {
    title: "Тест на стиль воспитания",
    description: "Ответьте на 50 вопросов и узнайте, какой из 8 типов воспитания вам ближе.",
    lead: "Ответьте на 50 вопросов, и тест определит, какие ценности в воспитании для вас главные, — по одному из 8 типов.",
    note1: "50 вопросов · около 5 минут",
    note2: "Отвечайте интуитивно и выбирайте самый близкий вариант",
    start: "Начать тест",
    back: "← К предыдущему вопросу",
    noticeTitle: "Ваши ответы оказались очень однородными.",
    noticeBody:
      "Попробуйте отвечать не так, как поступил бы «идеальный родитель», а так, как думаете вы сами на самом деле. Тогда результат лучше покажет ваши особенности.",
    noticeContinue: "Всё равно посмотреть результат",
    noticeRestart: "Пройти тест заново",
    tiebreakLead: "Остался всего один вопрос",
    tiebreakQuestion: "Что из этого ближе к вашему образу мыслей?",
    resultCaption: "Ваш результат",
    balance: "Баланс в воспитании",
    retry: "Пройти тест ещё раз",
    radarLabel: "Лепестковая диаграмма по пяти осям: ",
    radarSep: ", ",
    choices: ["Полностью согласен(на)", "Скорее согласен(на)", "Затрудняюсь ответить", "Скорее не согласен(на)", "Совсем не согласен(на)"],
    axes: { learning: "Обучение", individuality: "Индивидуальность", growth: "Рост", manners: "Воспитанность", stability: "Стабильность" },
  },
};

// タイプ名（メイン・サブ）と中心思想
const TYPE_I18N = {
  en: {
    education: { label: "Education Type", role: "The Architect", concept: "Parents prepare future options and a good learning environment" },
    individuality: { label: "Individuality Type", role: "The Producer", concept: "Nurture the child's strengths, passions and uniqueness" },
    independence: { label: "Independence Type", role: "The Counselor", concept: "Leave choices, and their outcomes, to the child" },
    challenge: { label: "Challenge Type", role: "The Cheerleader", concept: "Widen the child's world through the unknown, experience and challenge" },
    social: { label: "Social Type", role: "The Mentor", concept: "Cultivate manners, cooperation and relationships with others" },
    security: { label: "Security Type", role: "The Guardian", concept: "Protect happiness, peace of mind and an emotional safe base" },
    effort: { label: "Effort Type", role: "The Coach", concept: "Value persistence, steady progress and not giving up easily" },
    strategy: { label: "Strategy Type", role: "The Strategist", concept: "Work backward from the goal to optimize methods and environment" },
  },
  zh: {
    education: { label: "教育型", role: "设计师", concept: "由父母为孩子准备未来的选择和教育环境" },
    individuality: { label: "个性型", role: "制作人", concept: "发展孩子的特长、爱好和独特之处" },
    independence: { label: "自立型", role: "顾问", concept: "把选择和结果都交给孩子本人" },
    challenge: { label: "挑战型", role: "啦啦队长", concept: "通过未知、经历和挑战拓宽孩子的世界" },
    social: { label: "社会型", role: "导师", concept: "培养礼仪、协作精神和人际关系" },
    security: { label: "安心型", role: "守护者", concept: "守护幸福、安心和心灵的安全基地" },
    effort: { label: "努力型", role: "教练", concept: "重视坚持、积累和不轻易放弃" },
    strategy: { label: "战略型", role: "军师", concept: "从目标倒推，优化方法和环境" },
  },
  ko: {
    education: { label: "교육형", role: "설계자", concept: "부모가 미래의 선택지와 교육 환경을 마련한다" },
    individuality: { label: "개성형", role: "프로듀서", concept: "잘하는 것, 좋아하는 것, 그 아이다움을 키운다" },
    independence: { label: "자립형", role: "상담자", concept: "선택과 그 결과를 아이에게 맡긴다" },
    challenge: { label: "도전형", role: "응원단장", concept: "미지의 것, 경험, 도전으로 세상을 넓힌다" },
    social: { label: "사회형", role: "지도자", concept: "예의와 협동, 사람과의 관계를 키운다" },
    security: { label: "안심형", role: "보호자", concept: "행복과 안심, 마음의 안전기지를 지킨다" },
    effort: { label: "노력형", role: "감독", concept: "꾸준함과 쌓아 올림, 쉽게 포기하지 않는 것을 중시한다" },
    strategy: { label: "전략형", role: "책사", concept: "목적에서 거꾸로 계산해 방법과 환경을 최적화한다" },
  },
  es: {
    education: { label: "Tipo Educación", role: "Arquitecto", concept: "Los padres preparan las opciones de futuro y el entorno educativo" },
    individuality: { label: "Tipo Individualidad", role: "Productor", concept: "Potenciar los talentos, los gustos y la forma de ser del niño" },
    independence: { label: "Tipo Autonomía", role: "Consejero", concept: "Dejar en manos del niño sus decisiones y sus consecuencias" },
    challenge: { label: "Tipo Desafío", role: "Animador", concept: "Ampliar su mundo con lo desconocido, la experiencia y los retos" },
    social: { label: "Tipo Convivencia", role: "Mentor", concept: "Cultivar los modales, la cooperación y las relaciones con los demás" },
    security: { label: "Tipo Seguridad", role: "Protector", concept: "Proteger la felicidad, la tranquilidad y su refugio emocional" },
    effort: { label: "Tipo Esfuerzo", role: "Entrenador", concept: "Valorar la constancia, el progreso paso a paso y no rendirse fácilmente" },
    strategy: { label: "Tipo Estrategia", role: "Estratega", concept: "Partir del objetivo para optimizar los métodos y el entorno" },
  },
  ru: {
    education: { label: "Тип «Образование»", role: "Архитектор", concept: "Родители готовят будущие возможности и образовательную среду" },
    individuality: { label: "Тип «Индивидуальность»", role: "Продюсер", concept: "Развивать сильные стороны, увлечения и неповторимость ребёнка" },
    independence: { label: "Тип «Самостоятельность»", role: "Советник", concept: "Доверять ребёнку выбор и ответственность за его последствия" },
    challenge: { label: "Тип «Вызов»", role: "Главный болельщик", concept: "Расширять мир ребёнка через новое, опыт и испытания" },
    social: { label: "Тип «Общество»", role: "Наставник", concept: "Воспитывать вежливость, умение сотрудничать и строить отношения" },
    security: { label: "Тип «Спокойствие»", role: "Хранитель", concept: "Беречь счастье, спокойствие и надёжную эмоциональную опору" },
    effort: { label: "Тип «Упорство»", role: "Тренер", concept: "Ценить постоянство, накопление усилий и умение не сдаваться" },
    strategy: { label: "Тип «Стратегия»", role: "Стратег", concept: "Идти от цели и подбирать лучшие методы и среду" },
  },
};

// 結果画面のカード見出し（原稿の10項目の順）
const SECTION_TITLES_I18N = {
  en: [
    "What kind of type is this?",
    "How do children tend to grow up?",
    "What should you watch out for?",
    "When conflicts with your child are likely",
    "A parenting environment that suits you",
    "Your strengths",
    "Your weaknesses",
    "Compatible types",
    "Characters and famous people of the same type",
    "Advice for you",
  ],
  zh: [
    "这是什么类型？",
    "孩子容易成长为什么样？",
    "需要注意什么？",
    "容易和孩子发生冲突的场景",
    "适合你的育儿环境",
    "你的优势",
    "你的弱点",
    "合拍的类型",
    "同类型的角色・名人",
    "给你的建议",
  ],
  ko: [
    "어떤 유형인가요?",
    "어떤 아이로 자라기 쉬울까요?",
    "어떤 점을 조심해야 할까요?",
    "아이와 부딪히기 쉬운 장면",
    "당신에게 맞는 육아 환경",
    "당신의 강점",
    "당신의 약점",
    "잘 맞는 유형",
    "같은 유형의 캐릭터・유명인",
    "당신에게 주는 조언",
  ],
  es: [
    "¿Cómo es este tipo?",
    "¿Cómo suelen crecer los niños?",
    "¿A qué conviene prestar atención?",
    "Cuándo es fácil chocar con tu hijo",
    "El entorno de crianza que mejor te va",
    "Tus puntos fuertes",
    "Tus puntos débiles",
    "Tipos compatibles",
    "Personajes y personas famosas del mismo tipo",
    "Consejos para ti",
  ],
  ru: [
    "Что это за тип?",
    "Какими обычно вырастают дети?",
    "На что стоит обратить внимание?",
    "Когда легко возникают конфликты с ребёнком",
    "Подходящая для вас среда воспитания",
    "Ваши сильные стороны",
    "Ваши слабые стороны",
    "Совместимые типы",
    "Персонажи и знаменитости того же типа",
    "Совет для вас",
  ],
};

// ---------- 現在の言語 ----------

let currentLang = "ja";

const t = (key) => (I18N[currentLang] && I18N[currentLang][key] !== undefined ? I18N[currentLang][key] : I18N.ja[key]);

// 画面に出すタイプ名（日本語は TYPES の原文）
function typeText(type) {
  const tr = currentLang !== "ja" && TYPE_I18N[currentLang] && TYPE_I18N[currentLang][type.key];
  return tr || { label: type.label, role: type.role, concept: type.concept };
}

function questionText(index) {
  const tr = currentLang !== "ja" && CONTENT_I18N[currentLang];
  return tr ? tr.questions[index] : QUESTIONS[index].text;
}

function choiceLabel(choiceIndex) {
  return t("choices")[choiceIndex];
}

function axisName(key) {
  return t("axes")[key];
}

// 結果文章（日本語は原稿そのもの。ほかの言語は翻訳＋見出し）
function resultContent(typeKey) {
  if (currentLang === "ja" || !CONTENT_I18N[currentLang]) return RESULTS[typeKey];
  const tr = CONTENT_I18N[currentLang].results[typeKey];
  return {
    intro: tr.intro,
    sections: tr.sections.map((items, i) => ({ title: SECTION_TITLES_I18N[currentLang][i], items })),
  };
}

function readSavedLang() {
  try {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (fromUrl && I18N[fromUrl]) return fromUrl;
  } catch (e) {}
  try {
    const saved = localStorage.getItem("kosodate-lang");
    if (saved && I18N[saved]) return saved;
  } catch (e) {}
  return "ja";
}

// 静的な文言（data-i18n 属性の要素）を切り替える
function applyLanguage(lang) {
  if (!I18N[lang]) lang = "ja";
  currentLang = lang;
  try {
    localStorage.setItem("kosodate-lang", lang);
  } catch (e) {}
  document.documentElement.lang = lang;
  document.title = t("title");
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", t("description"));
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  const current = LANGUAGES.find((l) => l.code === lang);
  const label = document.getElementById("lang-current");
  if (label) label.textContent = current.name;
  document.querySelectorAll("[data-lang]").forEach((btn) => btn.setAttribute("aria-checked", String(btn.dataset.lang === lang)));
}

function setupLanguageMenu() {
  const toggle = document.getElementById("btn-lang");
  const menu = document.getElementById("lang-menu");
  LANGUAGES.forEach((l) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "lang-option";
    item.setAttribute("role", "menuitemradio");
    item.dataset.lang = l.code;
    item.lang = l.code;
    item.textContent = l.name;
    item.addEventListener("click", () => {
      applyLanguage(l.code);
      closeMenu();
      toggle.focus();
    });
    menu.appendChild(item);
  });
  const closeMenu = () => {
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      const selected = menu.querySelector('[aria-checked="true"]');
      if (selected) selected.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      closeMenu();
      toggle.focus();
    }
  });
  applyLanguage(readSavedLang());
}
