"use client";

import { useState, type FormEvent } from "react";
import type { Area, Category, SponsorProject } from "@/types";
import { AREAS, CATEGORIES } from "@/lib/constants";
import { newId } from "@/lib/utils";
import { Button, Input, Label, Required, Select, Textarea } from "@/components/ui";

const LOGO_COLORS = ["bg-sky-600", "bg-indigo-700", "bg-violet-600", "bg-teal-600", "bg-emerald-700", "bg-orange-600", "bg-pink-600", "bg-slate-700"];

interface Draft {
  companyName: string;
  industry: string;
  title: string;
  description: string;
  background: string;
  companyOverview: string;
  category: Category;
  targetRegion: string;
  area: Area;
  budgetRange: string;
  budgetMinMan: string;
  budgetMaxMan: string;
  conditions: string;
  expectedReturns: string;
  requirements: string;
  deadline: string;
  status: SponsorProject["status"];
  featured: boolean;
  logoColor: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

function toDraft(p?: SponsorProject): Draft {
  if (!p) {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return {
      companyName: "",
      industry: "",
      title: "",
      description: "",
      background: "",
      companyOverview: "",
      category: "sports",
      targetRegion: "全国",
      area: "全国",
      budgetRange: "",
      budgetMinMan: "",
      budgetMaxMan: "",
      conditions: "",
      expectedReturns: "",
      requirements: "",
      deadline: d.toISOString().slice(0, 10),
      status: "open",
      featured: false,
      logoColor: LOGO_COLORS[Math.floor(Math.random() * LOGO_COLORS.length)],
    };
  }
  return {
    ...p,
    budgetMinMan: String(p.budgetMin / 10_000),
    budgetMaxMan: String(p.budgetMax / 10_000),
    conditions: p.conditions.join("\n"),
    expectedReturns: p.expectedReturns.join("\n"),
    requirements: p.requirements.join("\n"),
    featured: !!p.featured,
  };
}

export function ProjectForm({
  project,
  onSubmit,
  onCancel,
}: {
  project?: SponsorProject;
  onSubmit: (p: SponsorProject) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState<Draft>(() => toDraft(project));
  const [error, setError] = useState("");
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const min = Number(d.budgetMinMan) * 10_000;
    const max = Number(d.budgetMaxMan) * 10_000;
    if (!d.companyName.trim() || !d.title.trim()) return setError("企業名と案件タイトルは必須です。");
    if (!min || !max || min > max) return setError("協賛金額（下限・上限）を正しく入力してください。");
    if (lines(d.expectedReturns).length === 0) return setError("求める見返りを1つ以上入力してください。");
    setError("");
    onSubmit({
      id: project?.id ?? newId("p"),
      companyName: d.companyName.trim(),
      companyLogo: d.companyName.trim().replace(/^(株式会社|有限会社)/, "").slice(0, 1),
      logoColor: d.logoColor,
      industry: d.industry.trim() || "未設定",
      title: d.title.trim(),
      description: d.description.trim(),
      background: d.background.trim(),
      companyOverview: d.companyOverview.trim(),
      category: d.category,
      targetRegion: d.targetRegion.trim() || d.area,
      area: d.area,
      budgetRange: d.budgetRange.trim() || `${d.budgetMinMan}万円〜${d.budgetMaxMan}万円`,
      budgetMin: min,
      budgetMax: max,
      conditions: lines(d.conditions),
      expectedReturns: lines(d.expectedReturns),
      requirements: lines(d.requirements),
      publishedAt: project?.publishedAt ?? today(),
      deadline: d.deadline,
      status: d.status,
      featured: d.featured,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-company">
            企業名
            <Required />
          </Label>
          <Input id="f-company" value={d.companyName} onChange={(e) => set("companyName", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="f-industry">業種</Label>
          <Input id="f-industry" value={d.industry} onChange={(e) => set("industry", e.target.value)} placeholder="例：食品メーカー" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="f-title">
            案件タイトル
            <Required />
          </Label>
          <Input id="f-title" value={d.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="f-category">カテゴリー</Label>
          <Select id="f-category" value={d.category} onChange={(e) => set("category", e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-area">地域ブロック</Label>
          <Select id="f-area" value={d.area} onChange={(e) => set("area", e.target.value as Area)}>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-region">対象地域（表示用）</Label>
          <Input id="f-region" value={d.targetRegion} onChange={(e) => set("targetRegion", e.target.value)} placeholder="例：大阪府" />
        </div>
        <div>
          <Label htmlFor="f-deadline">募集締切</Label>
          <Input id="f-deadline" type="date" value={d.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="f-min">
            協賛金額 下限（万円）
            <Required />
          </Label>
          <Input id="f-min" inputMode="numeric" value={d.budgetMinMan} onChange={(e) => set("budgetMinMan", e.target.value.replace(/[^\d]/g, ""))} />
        </div>
        <div>
          <Label htmlFor="f-max">
            協賛金額 上限（万円）
            <Required />
          </Label>
          <Input id="f-max" inputMode="numeric" value={d.budgetMaxMan} onChange={(e) => set("budgetMaxMan", e.target.value.replace(/[^\d]/g, ""))} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="f-range">協賛金額（表示用・空欄なら自動生成）</Label>
          <Input id="f-range" value={d.budgetRange} onChange={(e) => set("budgetRange", e.target.value)} placeholder="例：年間50万円〜100万円" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="f-desc">案件概要</Label>
          <Textarea id="f-desc" className="min-h-[80px]" value={d.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="f-bg">協賛の背景</Label>
          <Textarea id="f-bg" className="min-h-[80px]" value={d.background} onChange={(e) => set("background", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="f-overview">企業概要</Label>
          <Textarea id="f-overview" className="min-h-[60px]" value={d.companyOverview} onChange={(e) => set("companyOverview", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="f-returns">
            求める見返り（1行に1つ）
            <Required />
          </Label>
          <Textarea id="f-returns" className="min-h-[80px]" value={d.expectedReturns} onChange={(e) => set("expectedReturns", e.target.value)} placeholder={"ユニフォーム胸ロゴ掲載\nSNS月2回PR投稿"} />
        </div>
        <div>
          <Label htmlFor="f-cond">協賛条件（1行に1つ）</Label>
          <Textarea id="f-cond" className="min-h-[80px]" value={d.conditions} onChange={(e) => set("conditions", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="f-req">応募要件・提出物（1行に1つ）</Label>
          <Textarea id="f-req" className="min-h-[80px]" value={d.requirements} onChange={(e) => set("requirements", e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-navy-800">
            <input type="checkbox" checked={d.status === "open"} onChange={(e) => set("status", e.target.checked ? "open" : "closed")} className="h-4 w-4 accent-brand-600" />
            公開する
          </label>
          <label className="flex items-center gap-2 text-sm text-navy-800">
            <input type="checkbox" checked={d.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-brand-600" />
            トップの「おすすめ案件」に表示
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">{project ? "変更を保存" : "案件を作成"}</Button>
      </div>
    </form>
  );
}
