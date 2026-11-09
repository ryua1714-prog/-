import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  FileSearch,
  GraduationCap,
  Handshake,
  MessagesSquare,
  PartyPopper,
  Send,
  ShieldCheck,
  Trophy,
  UserPlus,
} from "lucide-react";
import { HeroSearch } from "@/components/hero-search";
import { FeaturedProjects } from "@/components/featured-projects";
import { ButtonLink, SectionTitle } from "@/components/ui";
import { CATEGORIES } from "@/lib/constants";

const CATEGORY_ICON = { sports: Trophy, community: PartyPopper, students: GraduationCap } as const;
const CATEGORY_COLOR = {
  sports: "from-brand-600 to-navy-700",
  community: "from-accent-500 to-accent-700",
  students: "from-sky-500 to-brand-700",
} as const;

const SEEKER_FLOW = [
  { icon: UserPlus, title: "会員登録・プロフィール作成", text: "活動実績やSNS、提供できる見返りを登録します。" },
  { icon: FileSearch, title: "スポンサー案件を探す", text: "カテゴリー・地域・金額で条件に合う案件を検索。" },
  { icon: Send, title: "応募・提案", text: "希望金額と提案内容を添えてワンクリックで応募。" },
  { icon: Handshake, title: "面談・成約", text: "企業からの面談打診を経て、協賛契約を締結します。" },
];

const COMPANY_FLOW = [
  { icon: MessagesSquare, title: "掲載のお申し込み", text: "お問い合わせフォームから掲載をお申し込みください。" },
  { icon: ClipboardList, title: "案件ページの制作", text: "運営チームがヒアリングし、案件ページを制作・公開。" },
  { icon: FileSearch, title: "応募を確認・選考", text: "届いた提案を比較し、面談したい相手を選べます。" },
  { icon: Handshake, title: "協賛スタート", text: "契約後も運営チームが活動報告までサポートします。" },
];

const STATS = [
  { value: "1,280+", label: "登録選手・団体数" },
  { value: "340社", label: "協賛企業数" },
  { value: "620件", label: "累計マッチング数" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700 text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="container-page relative py-16 sm:py-24">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-navy-100 ring-1 ring-white/20">
            <ShieldCheck className="h-4 w-4 text-accent-500" />
            運営チームが全案件を審査・掲載しています
          </p>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl sm:leading-tight">
            <span className="underline decoration-accent-500 decoration-4 underline-offset-[10px]">挑戦する人</span>と、
            <br className="sm:hidden" />
            応援する企業をつなぐ
            <br />
            <span className="text-2xl text-navy-200 sm:text-4xl">マッチングプラットフォーム</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-navy-200 sm:text-base">
            スポーツ選手・チーム、地域の祭りや地方創生、学生の部活・サークル。
            <br className="hidden sm:block" />
            さまざまな挑戦と、それを応援したい企業のスポンサー案件が集まります。
          </p>
          <div className="mt-8 max-w-4xl">
            <HeroSearch />
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="text-[11px] text-navy-300 sm:text-xs">{s.label}</dt>
                <dd className="mt-1 text-xl font-bold sm:text-2xl">{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-[10px] text-navy-400">※数値はデモ用のダミーです</p>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16">
        <div className="container-page">
          <SectionTitle en="Category" title="カテゴリーから探す" />
          <div className="grid gap-5 md:grid-cols-3">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICON[c.value];
              return (
                <Link
                  key={c.value}
                  href={`/projects?category=${c.value}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className={`flex items-center gap-3 bg-gradient-to-r ${CATEGORY_COLOR[c.value]} px-5 py-5 text-white`}>
                    <Icon className="h-8 w-8" />
                    <span className="text-lg font-bold">{c.label}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-5 py-4">
                    <p className="text-sm leading-relaxed text-slate-600">{c.description}</p>
                    <ArrowRight className="h-5 w-5 shrink-0 text-brand-600 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="bg-navy-50/70 py-16">
        <div className="container-page">
          <SectionTitle en="Projects" title="注目のスポンサー案件" />
          <FeaturedProjects />
          <div className="mt-10 text-center">
            <ButtonLink href="/projects" variant="outline" size="lg">
              すべての案件を見る
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section id="flow" className="scroll-mt-20 bg-white py-16">
        <div className="container-page">
          <SectionTitle en="How it works" title="ご利用の流れ" />
          <div className="grid gap-8 lg:grid-cols-2">
            {[
              { title: "募集側（選手・団体）の方", icon: Trophy, steps: SEEKER_FLOW, tone: "brand" },
              { title: "協賛企業の方", icon: Building2, steps: COMPANY_FLOW, tone: "navy" },
            ].map((block) => (
              <div key={block.title} className="rounded-xl border border-slate-200 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
                  <block.icon className="h-5 w-5 text-brand-600" />
                  {block.title}
                </h3>
                <ol className="mt-5 space-y-4">
                  {block.steps.map((s, i) => (
                    <li key={s.title} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${
                            block.tone === "brand" ? "bg-brand-600" : "bg-navy-800"
                          }`}
                        >
                          {i + 1}
                        </span>
                        {i < block.steps.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
                      </div>
                      <div className="pb-2">
                        <p className="flex items-center gap-2 font-bold text-navy-900">
                          <s.icon className="h-4 w-4 text-slate-400" />
                          {s.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{s.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing summary */}
      <section className="bg-navy-50/70 py-16">
        <div className="container-page">
          <SectionTitle en="Pricing" title="料金プラン" />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-brand-600">募集側（選手・団体）</p>
              <p className="mt-2 text-3xl font-bold text-navy-900">
                月額 1,000<span className="text-base font-medium">円〜</span>
              </p>
              <p className="mt-2 text-sm text-slate-600">基本プラン 月額1,000円／有料プラン 月額5,000円</p>
              <p className="text-sm text-slate-600">成約手数料：初年度15%・次年度以降5%</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-navy-700">スポンサー企業</p>
              <p className="mt-2 text-3xl font-bold text-navy-900">
                月額 10,000<span className="text-base font-medium">円</span>
              </p>
              <p className="mt-2 text-sm text-slate-600">初回システム登録料 30,000円</p>
              <p className="text-sm text-slate-600">ページ制作・運用代行込み</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <ButtonLink href="/pricing" variant="outline">
              料金プランの詳細を見る
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900 py-14 text-white">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
            <h3 className="text-xl font-bold">スポンサーを探している方へ</h3>
            <p className="mt-2 text-sm text-navy-200">プロフィールを登録して、あなたの挑戦を応援してくれる企業と出会いましょう。</p>
            <ButtonLink href="/mypage" variant="accent" className="mt-5">
              プロフィールを登録する
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
            <h3 className="text-xl font-bold">協賛を検討中の企業の方へ</h3>
            <p className="mt-2 text-sm text-navy-200">案件ページの制作から運用まで、運営チームが代行します。まずはお気軽にご相談ください。</p>
            <ButtonLink href="/contact?tab=company" variant="primary" className="mt-5">
              案件掲載を申し込む
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
