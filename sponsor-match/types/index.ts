export type Category = "sports" | "community" | "students";

export type Area =
  | "全国"
  | "北海道・東北"
  | "関東"
  | "中部"
  | "近畿"
  | "中国・四国"
  | "九州・沖縄";

export type ProjectStatus = "open" | "closed";

export interface SponsorProject {
  id: string;
  companyName: string;
  /** ロゴ代わりの頭文字（MVPでは画像を使わずイニシャル表示） */
  companyLogo: string;
  /** ロゴ背景色（Tailwind の bg-* クラス） */
  logoColor: string;
  industry: string;
  title: string;
  description: string;
  /** 協賛の背景 */
  background: string;
  /** 企業概要 */
  companyOverview: string;
  category: Category;
  /** 表示用の対象地域（例: "全国", "関東", "大阪府"） */
  targetRegion: string;
  /** 絞り込み用の地域ブロック */
  area: Area;
  /** 表示用の協賛金額（例: "30万円〜100万円"） */
  budgetRange: string;
  /** 絞り込み・並び替え用（円） */
  budgetMin: number;
  budgetMax: number;
  /** 協賛条件・必須要件 */
  conditions: string[];
  /** 求める見返り */
  expectedReturns: string[];
  /** 応募要件・提出物 */
  requirements: string[];
  publishedAt: string;
  deadline: string;
  status: ProjectStatus;
  featured?: boolean;
}

export interface SnsLinks {
  x?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
}

export interface SeekerProfile {
  id: string;
  name: string;
  category: Category;
  region: string;
  activityDetails: string;
  achievements: string;
  scale: string;
  snsLinks: SnsLinks;
  desiredBudget: string;
  offeredReturns: string[];
  avatarUrl: string;
  email: string;
  plan: "basic" | "premium";
  joinedAt: string;
}

export type ApplicationStatus = "pending" | "reviewing" | "accepted" | "rejected";

export interface Application {
  id: string;
  projectId: string;
  seekerId: string;
  applicantName: string;
  email: string;
  category: Category;
  desiredAmount: number;
  pitchMessage: string;
  offeredReturns: string[];
  status: ApplicationStatus;
  createdAt: string;
}
