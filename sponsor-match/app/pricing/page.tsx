import type { Metadata } from "next";
import { ButtonLink, PageHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "料金プラン" };

const SEEKER_PLANS = [
  {
    name: "基本プラン",
    price: "1,000",
    unit: "円／月（税抜）",
    note: "まずは気軽に始めたい方に",
    features: ["プロフィール掲載", "スポンサー案件の検索・閲覧", "案件への応募（月3件まで）", "応募履歴の管理"],
    highlight: false,
  },
  {
    name: "有料プラン",
    price: "5,000",
    unit: "円／月（税抜）",
    note: "本格的にスポンサーを獲得したい方に",
    features: ["基本プランのすべての機能", "案件への応募 無制限", "プロフィールの優先表示", "提案書の添削サポート", "新着案件の優先通知"],
    highlight: true,
  },
];

const SEEKER_COMPARE: { label: string; basic: boolean | string; premium: boolean | string }[] = [
  { label: "プロフィール掲載", basic: true, premium: true },
  { label: "案件の検索・閲覧", basic: true, premium: true },
  { label: "案件への応募", basic: "月3件まで", premium: "無制限" },
  { label: "応募履歴・ステータス管理", basic: true, premium: true },
  { label: "プロフィールの優先表示", basic: false, premium: true },
  { label: "新着案件の優先通知", basic: false, premium: true },
  { label: "提案書の添削サポート", basic: false, premium: true },
  { label: "成約手数料", basic: "初年度15%／次年度5%", premium: "初年度15%／次年度5%" },
];

const COMPANY_COMPARE: { label: string; value: boolean | string }[] = [
  { label: "スポンサー案件ページの掲載", value: true },
  { label: "案件ページの制作代行（取材・原稿作成）", value: true },
  { label: "応募の受付・一覧管理", value: true },
  { label: "候補者のスクリーニング代行", value: true },
  { label: "面談日程の調整代行", value: true },
  { label: "協賛後の活動レポート取りまとめ", value: true },
  { label: "掲載案件数", value: "無制限" },
];

function Cell({ v }: { v: boolean | string }) {
  if (v === true)
    return (
      <span className="text-lg font-bold text-brand-600" aria-label="あり">
        ○
      </span>
    );
  if (v === false)
    return (
      <span className="text-lg text-slate-300" aria-label="なし">
        －
      </span>
    );
  return <span className="text-sm font-semibold text-navy-800">{v}</span>;
}

export default function PricingPage() {
  return (
    <>
      <PageHeader title="料金プラン" description="募集側（選手・団体）とスポンサー企業、それぞれのご利用料金をご案内します。" />

      {/* 募集側 */}
      <section className="container-page py-12">
        <h2 className="flex items-center gap-2 text-xl font-bold text-navy-900">
          募集側（選手・チーム・団体）プラン
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {SEEKER_PLANS.map((p) => (
            <div
              key={p.name}
              className={cn(
                "relative flex flex-col rounded-md border bg-white p-6",
                p.highlight ? "border-brand-500 ring-2 ring-brand-500" : "border-slate-200",
              )}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-accent-500 px-3 py-0.5 text-xs font-bold text-white">おすすめ</span>
              )}
              <p className="font-bold text-navy-900">{p.name}</p>
              <p className="mt-1 text-xs text-slate-500">{p.note}</p>
              <p className="mt-4 text-4xl font-bold text-navy-900">
                {p.price}
                <span className="ml-1 text-sm font-medium text-slate-500">{p.unit}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy-800">
                    <span className="shrink-0 font-bold text-brand-600">○</span>
                    {f}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/mypage" variant={p.highlight ? "primary" : "outline"} className="mt-6 w-full">
                このプランで始める
              </ButtonLink>
            </div>
          ))}
          <div className="flex flex-col rounded-md border border-slate-200 bg-navy-50 p-6">
            <p className="font-bold text-navy-900">成約手数料</p>
            <p className="mt-1 text-xs text-slate-500">スポンサー契約が成立した場合のみ発生</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-md bg-white p-4">
                <p className="text-xs text-slate-500">初年度</p>
                <p className="text-3xl font-bold text-navy-900">
                  15<span className="text-base">%</span>
                </p>
              </div>
              <div className="rounded-md bg-white p-4">
                <p className="text-xs text-slate-500">次年度以降</p>
                <p className="text-3xl font-bold text-navy-900">
                  5<span className="text-base">%</span>
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">※協賛金額に対して算出します。物品提供のみの契約は対象外です。</p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="bg-navy-800 text-white">
                <th className="px-5 py-3 text-left font-semibold">機能比較</th>
                <th className="w-48 px-5 py-3 font-semibold">基本プラン</th>
                <th className="w-48 bg-brand-600 px-5 py-3 font-semibold">有料プラン</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SEEKER_COMPARE.map((r) => (
                <tr key={r.label}>
                  <td className="px-5 py-3 text-navy-800">{r.label}</td>
                  <td className="px-5 py-3 text-center">
                    <Cell v={r.basic} />
                  </td>
                  <td className="bg-brand-50/50 px-5 py-3 text-center">
                    <Cell v={r.premium} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 企業側 */}
      <section className="bg-navy-50/70 py-12">
        <div className="container-page">
          <h2 className="flex items-center gap-2 text-xl font-bold text-navy-900">
            スポンサー企業プラン
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-white p-6">
              <p className="font-bold text-navy-900">初回システム登録料</p>
              <p className="mt-4 text-4xl font-bold text-navy-900">
                30,000<span className="ml-1 text-sm font-medium text-slate-500">円（税抜・初回のみ）</span>
              </p>
              <p className="mt-3 text-sm text-slate-600">企業アカウントの開設、初回ヒアリング、管理画面の設定を含みます。</p>
            </div>
            <div className="rounded-md border-2 border-navy-700 bg-white p-6">
              <p className="font-bold text-navy-900">月額掲載・管理料</p>
              <p className="mt-4 text-4xl font-bold text-navy-900">
                10,000<span className="ml-1 text-sm font-medium text-slate-500">円／月（税抜）</span>
              </p>
              <p className="mt-3 text-sm text-slate-600">案件ページの制作・運用代行込み。応募の受付から面談調整まで運営チームがサポートします。</p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="bg-navy-800 text-white">
                  <th className="px-5 py-3 text-left font-semibold">含まれるサービス</th>
                  <th className="w-48 px-5 py-3 font-semibold">月額掲載・管理料</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPANY_COMPARE.map((r) => (
                  <tr key={r.label}>
                    <td className="px-5 py-3 text-navy-800">{r.label}</td>
                    <td className="px-5 py-3 text-center">
                      <Cell v={r.value} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 text-center">
            <ButtonLink href="/contact?tab=company" size="lg">
              案件掲載を申し込む
            </ButtonLink>
            <p className="mt-3 text-xs text-slate-500">※本ページは料金のご案内です。お見積り・決済機能はありません。</p>
          </div>
        </div>
      </section>
    </>
  );
}
