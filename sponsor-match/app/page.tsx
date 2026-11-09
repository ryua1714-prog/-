import { ArrowRight, Building2, FileCheck2, Headset, PenLine } from "lucide-react";
import { BrushStroke } from "@/components/brush";
import { HeroSearch } from "@/components/hero-search";
import { FeaturedProjects } from "@/components/featured-projects";
import { CategoryLinks, Faq, FlowSteps, MatchCarousel } from "@/components/home-sections";
import { ButtonLink, SectionTitle } from "@/components/ui";

const POINTS = [
  { icon: FileCheck2, title: "全案件を運営が確認", text: "掲載前に企業情報と協賛条件を確認しています。" },
  { icon: PenLine, title: "案件ページは制作代行", text: "企業の担当者が原稿を用意する必要はありません。" },
  { icon: Headset, title: "成約まで担当者が伴走", text: "面談の日程調整や条件のすり合わせをお手伝いします。" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-[#f3f7fc]">
        <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.25fr_1fr]">
          <div className="min-w-0">
            <p className="text-sm font-bold text-accent-500">スポーツ・地域・学生のスポンサー探しに</p>
            <h1 className="mt-4 font-brush text-[2.1rem] font-normal leading-[1.45] text-navy-900 sm:text-[3.2rem]">
              挑戦する人と、
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">応援する企業をつなぐ。</span>
                <BrushStroke className="absolute -bottom-3 left-[-3%] z-0 h-[0.5em] w-[106%] sm:-bottom-4" />
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-loose text-slate-700 sm:text-base sm:leading-loose">
              スポンサーブリッジは、選手・チーム、地域のお祭りやまちづくり、学生の部活・サークルと、それを応援したい企業が出会えるマッチングサービスです。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/projects" variant="accent" size="lg">
                スポンサー案件をさがす
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/contact?tab=company" variant="outline" size="lg">
                <Building2 className="h-4 w-4" />
                企業の方はこちら
              </ButtonLink>
            </div>
          </div>
          <div className="mx-auto w-full min-w-0 max-w-sm lg:mr-0">
            <MatchCarousel />
          </div>
        </div>
      </section>

      {/* Search + points */}
      <section className="container-page pt-8">
        <HeroSearch />
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {POINTS.map((p) => (
            <li key={p.title} className="flex gap-3">
              <p.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-bold text-navy-900">{p.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Categories */}
      <section className="container-page py-14">
        <SectionTitle title="カテゴリーからさがす" />
        <CategoryLinks />
      </section>

      {/* Projects */}
      <section className="border-y border-slate-200 bg-[#f3f7fc] py-14">
        <div className="container-page">
          <FeaturedProjects />
        </div>
      </section>

      {/* Flow */}
      <section id="flow" className="container-page scroll-mt-24 py-14">
        <SectionTitle title="ご利用の流れ" lead="登録から協賛スタートまで、4つのステップで進みます。" />
        <FlowSteps />
      </section>

      {/* Pricing */}
      <section className="container-page pb-14">
        <SectionTitle title="料金" action={{ href: "/pricing", label: "料金プランの詳細" }} />
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-navy-50 text-left text-xs text-navy-700">
              <tr>
                <th className="px-5 py-2.5 font-bold">ご利用者</th>
                <th className="px-5 py-2.5 font-bold">月額</th>
                <th className="px-5 py-2.5 font-bold">そのほか</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-5 py-4 font-bold text-navy-900">選手・団体</td>
                <td className="px-5 py-4 text-navy-900">
                  <span className="text-lg font-bold">1,000円</span>（基本）／<span className="text-lg font-bold">5,000円</span>（有料）
                </td>
                <td className="px-5 py-4 text-slate-600">成約手数料：初年度15%・次年度以降5%</td>
              </tr>
              <tr>
                <td className="px-5 py-4 font-bold text-navy-900">企業</td>
                <td className="px-5 py-4 text-navy-900">
                  <span className="text-lg font-bold">10,000円</span>（ページ制作・運用代行込み）
                </td>
                <td className="px-5 py-4 text-slate-600">初回システム登録料：30,000円</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 bg-[#f3f7fc] py-14">
        <div className="container-page max-w-4xl">
          <SectionTitle title="よくあるご質問" />
          <Faq />
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-slate-200 p-6">
            <p className="text-xs font-bold text-brand-600">選手・団体の方</p>
            <h3 className="mt-1 text-lg font-bold text-navy-900">まずはプロフィールを登録しましょう</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">活動内容や実績を登録しておくと、応募のたびに入力する手間が省けます。</p>
            <ButtonLink href="/mypage" variant="accent" className="mt-5">
              プロフィールを登録する
            </ButtonLink>
          </div>
          <div className="rounded-md border border-slate-200 p-6">
            <p className="text-xs font-bold text-brand-600">企業の方</p>
            <h3 className="mt-1 text-lg font-bold text-navy-900">協賛のご相談を受け付けています</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">予算や支援したい分野が決まっていなくても大丈夫です。担当者がご提案します。</p>
            <ButtonLink href="/contact?tab=company" className="mt-5">
              掲載について相談する
            </ButtonLink>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          お電話でのご相談：<span className="font-bold text-navy-900">03-0000-0000</span>（平日 10:00〜18:00）
          <span className="ml-1 text-xs text-slate-400">※デモ用の番号です</span>
        </p>
      </section>
    </>
  );
}
