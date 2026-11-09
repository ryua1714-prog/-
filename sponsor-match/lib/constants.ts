import type { ApplicationStatus, Area, Category } from "@/types";

export const CATEGORIES: { value: Category; label: string; short: string; description: string }[] = [
  {
    value: "sports",
    label: "スポーツ（選手・チーム）",
    short: "スポーツ",
    description: "アスリート個人、実業団・クラブチーム、競技団体の活動を支援",
  },
  {
    value: "community",
    label: "地域（祭り・地方創生）",
    short: "地域",
    description: "祭り・伝統行事、まちづくり、地方創生プロジェクトを支援",
  },
  {
    value: "students",
    label: "学生（部活・サークル・学生団体）",
    short: "学生",
    description: "部活動、大学サークル、学生団体の挑戦を支援",
  },
];

export const CATEGORY_LABEL: Record<Category, string> = {
  sports: "スポーツ",
  community: "地域",
  students: "学生",
};

export const CATEGORY_STYLE: Record<Category, string> = {
  sports: "bg-brand-50 text-brand-700 ring-brand-100",
  community: "bg-accent-50 text-accent-700 ring-accent-100",
  students: "bg-sky-50 text-sky-700 ring-sky-100",
};

export const AREAS: Area[] = [
  "全国",
  "北海道・東北",
  "関東",
  "中部",
  "近畿",
  "中国・四国",
  "九州・沖縄",
];

export const BUDGET_OPTIONS: { value: string; label: string; min: number; max: number }[] = [
  { value: "all", label: "指定なし", min: 0, max: Infinity },
  { value: "u30", label: "〜30万円", min: 0, max: 300_000 },
  { value: "30-100", label: "30万円〜100万円", min: 300_000, max: 1_000_000 },
  { value: "100-300", label: "100万円〜300万円", min: 1_000_000, max: 3_000_000 },
  { value: "o300", label: "300万円以上", min: 3_000_000, max: Infinity },
];

export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string; style: string }> = {
  pending: { label: "応募済み", style: "bg-white text-slate-700 ring-slate-300" },
  reviewing: { label: "選考中", style: "bg-sky-50 text-sky-700 ring-sky-200" },
  accepted: { label: "面談打診", style: "bg-brand-600 text-white ring-brand-600" },
  rejected: { label: "見送り", style: "bg-slate-100 text-slate-500 ring-slate-200" },
};

export const RETURN_PRESETS = [
  "ユニフォーム・ウェアへのロゴ掲載",
  "SNSでのPR投稿（月2回）",
  "会場・イベントでのバナー掲出",
  "社員向け体験会・講演会の実施",
  "公式サイトへのロゴ・リンク掲載",
  "試合・イベントへの招待",
  "商品・サービスのモニター協力",
  "活動報告書の提出",
];
