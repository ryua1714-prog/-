export type Chapter = {
  era: string; // small label above the year
  year: number; // big counter target
  yearSuffix?: string; // e.g. "— 1926"
  bgWord: string; // huge outlined word in the background
  title: string;
  lines: string[];
  keyword: string; // gold accent tag
};

export const chapters: Chapter[] = [
  {
    era: 'ORIGIN',
    year: 1896,
    yearSuffix: '— 1926',
    bgWord: 'LOOM',
    title: '織機から始まった',
    lines: ['豊田佐吉「豊田式木製人力織機」を発明', '世界最高性能「G型自動織機」を完成'],
    keyword: '豊田自動織機製作所',
  },
  {
    era: 'CHALLENGE',
    year: 1933,
    yearSuffix: '— 1937',
    bgWord: 'MOTOR',
    title: '自動車への挑戦',
    lines: ['豊田喜一郎が「自動車部」を設立', '1935年「AA型乗用車」完成'],
    keyword: 'トヨダ → トヨタ　縁起の8画',
  },
  {
    era: 'REBIRTH',
    year: 1950,
    yearSuffix: '— 1955',
    bgWord: 'TPS',
    title: '危機が、革新を生む',
    lines: ['工販分離を経て大野耐一らが', '「ジャスト・イン・タイム」を体系化'],
    keyword: '1955　初代クラウン誕生',
  },
  {
    era: 'MOTORIZATION',
    year: 1966,
    bgWord: 'COROLLA',
    title: '国民の足、カローラ',
    lines: ['爆発的ヒットで日本の', 'モータリゼーションを牽引'],
    keyword: '世界ベストセラーカーへ',
  },
  {
    era: 'GLOBAL',
    year: 1982,
    yearSuffix: '— 1997',
    bgWord: 'HYBRID',
    title: '世界品質への飛躍',
    lines: ['1982　工販合体「トヨタ自動車」誕生', '1989　レクサスを北米で投入'],
    keyword: '1997　世界初の量産HV「プリウス」',
  },
  {
    era: 'TRIAL',
    year: 2008,
    yearSuffix: '— 2015',
    bgWord: 'TNGA',
    title: '頂点と、試練',
    lines: ['世界首位へ躍進、そして危機', '2009　豊田章男 社長就任'],
    keyword: 'もっといいクルマづくり',
  },
  {
    era: 'MOBILITY',
    year: 2020,
    yearSuffix: '— NOW',
    bgWord: 'WOVEN',
    title: 'モビリティ・カンパニーへ',
    lines: ['EV・HEV・PHEV・FCEV', '全方位の「マルチパスウェイ」戦略'],
    keyword: '実証都市 Woven City',
  },
  {
    era: 'NEXT',
    year: 2027,
    yearSuffix: '— 2028',
    bgWord: 'FUTURE',
    title: '決まっている未来',
    lines: ['車載OS「Arene」次世代EV', '全固体電池　航続1,000km超へ'],
    keyword: 'Woven City Phase 2',
  },
];
