"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, GraduationCap, PartyPopper, Quote, Trophy } from "lucide-react";
import { Accordion } from "@/components/accordion";
import { Carousel } from "@/components/carousel";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CATEGORY_ICON = { sports: Trophy, community: PartyPopper, students: GraduationCap } as const;
const CATEGORY_TONE = {
  sports: "bg-brand-50 text-brand-600",
  community: "bg-accent-50 text-accent-600",
  students: "bg-sky-50 text-sky-600",
} as const;
const CATEGORY_EXAMPLES = {
  sports: "プロ・社会人チーム／個人アスリート／eスポーツ",
  community: "夏祭り・花火大会／伝統芸能／まちづくり",
  students: "体育会・部活動／ロボコン／学生団体",
} as const;

/** カテゴリー別の入口（募集中の件数つき） */
export function CategoryLinks() {
  const { projects } = useStore();
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {CATEGORIES.map((c) => {
        const Icon = CATEGORY_ICON[c.value];
        const count = projects.filter((p) => p.category === c.value && p.status === "open").length;
        return (
          <Link
            key={c.value}
            href={`/projects?category=${c.value}`}
            className="group flex items-center gap-4 rounded-md border border-slate-200 bg-white p-4 transition hover:border-brand-500"
          >
            <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", CATEGORY_TONE[c.value])}>
              <Icon className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className="font-bold text-navy-900 group-hover:text-brand-600">{c.short}</span>
                <span className="text-xs text-slate-500">募集中 {count}件</span>
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">{CATEGORY_EXAMPLES[c.value]}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 group-hover:text-brand-600" />
          </Link>
        );
      })}
    </div>
  );
}

const FLOWS = {
  seeker: {
    label: "選手・団体の方",
    steps: [
      { title: "会員登録", text: "活動内容や実績、提供できる見返りをプロフィールに登録します。" },
      { title: "案件をさがす", text: "カテゴリー・地域・金額から、活動に合う案件を見つけます。" },
      { title: "応募する", text: "希望金額と自己PRを書いて応募。プロフィールの内容が自動で入ります。" },
      { title: "面談・契約", text: "企業から面談の打診が届いたら、条件をすり合わせて契約します。" },
    ],
  },
  company: {
    label: "企業の方",
    steps: [
      { title: "掲載のお申し込み", text: "お問い合わせフォームから、支援したい内容をお知らせください。" },
      { title: "案件ページの制作", text: "担当者がヒアリングし、案件ページを制作・公開します。" },
      { title: "応募の確認", text: "届いた提案を比べて、話を聞きたい相手に面談を打診します。" },
      { title: "協賛スタート", text: "契約後の活動報告の取りまとめまで、担当者がサポートします。" },
    ],
  },
} as const;

/** ご利用の流れ（募集側／企業側の切り替え） */
export function FlowSteps() {
  const [who, setWho] = useState<keyof typeof FLOWS>("seeker");
  const flow = FLOWS[who];
  return (
    <div>
      <div className="mb-5 inline-flex rounded-md border border-slate-300 bg-white p-1" role="tablist">
        {(Object.keys(FLOWS) as (keyof typeof FLOWS)[]).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={who === k}
            onClick={() => setWho(k)}
            className={cn(
              "rounded px-4 py-1.5 text-sm font-semibold transition-colors",
              who === k ? "bg-navy-800 text-white" : "text-navy-700 hover:bg-navy-50",
            )}
          >
            {FLOWS[k].label}
          </button>
        ))}
      </div>
      <ol className="grid gap-3 md:grid-cols-4">
        {flow.steps.map((s, i) => (
          <li key={s.title} className="relative rounded-md border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold text-accent-500">STEP {i + 1}</p>
            <p className="mt-1 font-display text-base font-bold text-navy-900">{s.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
            {i < flow.steps.length - 1 && (
              <ChevronRight className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-0.5 text-slate-400 md:block" />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

const FAQS = [
  {
    q: "個人の選手でも登録できますか？",
    a: "はい、個人のアスリートの方も登録できます。チームや団体と同じように、案件への応募やプロフィールの公開ができます。",
  },
  {
    q: "学生団体の場合、大学の許可は必要ですか？",
    a: "案件によって異なります。学校の公認や承認書が必要な案件は、案件ページの「応募要件」に記載しています。",
  },
  {
    q: "協賛金を受け取るまでの流れを教えてください。",
    a: "企業との面談で条件が合えば、協賛契約を結びます。協賛金は契約書に記載した時期に、企業から直接お支払いいただきます。",
  },
  {
    q: "企業側で、案件ページを自分たちで作る必要はありますか？",
    a: "ありません。月額掲載・管理料に制作・運用代行が含まれており、担当者がヒアリングしたうえで作成します。",
  },
];

export function Faq() {
  return (
    <Accordion
      single
      defaultOpen={["faq-0"]}
      className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white"
      headerClassName="px-5 py-4 font-semibold text-navy-900 hover:bg-slate-50"
      bodyClassName="flex gap-3 px-5 pb-5 text-sm leading-relaxed text-slate-700"
      items={FAQS.map((f, i) => ({
        id: `faq-${i}`,
        title: (
          <span className="flex gap-3">
            <span className="font-display font-bold text-brand-600">Q</span>
            {f.q}
          </span>
        ),
        content: (
          <>
            <span className="font-display font-bold text-accent-500">A</span>
            <p className="flex-1">{f.a}</p>
          </>
        ),
      }))}
    />
  );
}

const MATCHES = [
  {
    when: "2026年10月 成約",
    seeker: { initial: "横", name: "横浜ブルーウェーブス", sub: "社会人バスケットボール／神奈川県" },
    company: { initial: "ミ", name: "株式会社ミナトフーズ", sub: "食品メーカー／東京都" },
    amount: "年間150万円",
    returns: "胸ロゴ・試供品配布",
    voice: "地元の企業さんと組めたことで、子ども向けのバスケ教室を月4回に増やせました。",
  },
  {
    when: "2026年9月 成約",
    seeker: { initial: "あ", name: "NPO法人あきた空き家リビング", sub: "まちづくり／秋田県" },
    company: { initial: "み", name: "みちのく信用金庫", sub: "金融／宮城県" },
    amount: "60万円",
    returns: "報告会登壇・ロゴ掲載",
    voice: "職員の方がボランティアで改修に参加してくださり、資金以上の支えになりました。",
  },
  {
    when: "2026年8月 成約",
    seeker: { initial: "名", name: "名古屋工業高専 ロボット研究会", sub: "ロボコン／愛知県" },
    company: { initial: "中", name: "中部精密工業株式会社", sub: "製造業／愛知県" },
    amount: "40万円＋部材提供",
    returns: "機体ロゴ・工場見学",
    voice: "現場の技術者さんに加工のコツを教わり、機体の精度が大きく上がりました。",
  },
];

/** トップの成約事例カルーセル（デモ用のダミー） */
export function MatchCarousel() {
  return (
    <Carousel label="成約事例" autoPlayMs={5000}>
      {MATCHES.map((m) => (
        <div key={m.seeker.name} className="rounded-md border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-12px_rgba(18,32,61,0.25)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-accent-500">成約事例</p>
            <p className="text-[11px] text-slate-400">{m.when}</p>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{m.seeker.initial}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-navy-900">{m.seeker.name}</p>
                <p className="text-xs text-slate-500">{m.seeker.sub}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-5 text-xs text-slate-400">
              <span className="h-5 w-px bg-slate-300" />
              協賛
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-navy-800 font-bold text-white">{m.company.initial}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-navy-900">{m.company.name}</p>
                <p className="text-xs text-slate-500">{m.company.sub}</p>
              </div>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded border border-slate-200 bg-slate-200 text-xs">
            <div className="bg-slate-50 px-3 py-2">
              <dt className="text-slate-500">協賛金額</dt>
              <dd className="mt-0.5 text-sm font-bold text-navy-900">{m.amount}</dd>
            </div>
            <div className="bg-slate-50 px-3 py-2">
              <dt className="text-slate-500">見返り</dt>
              <dd className="mt-0.5 font-semibold text-navy-900">{m.returns}</dd>
            </div>
          </dl>
          <p className="mt-4 flex gap-2 text-sm leading-relaxed text-slate-700">
            <Quote className="h-4 w-4 shrink-0 rotate-180 text-brand-500" />
            {m.voice}
          </p>
          <p className="mt-3 text-[10px] text-slate-400">※事例はデモ用のダミーです</p>
        </div>
      ))}
    </Carousel>
  );
}
