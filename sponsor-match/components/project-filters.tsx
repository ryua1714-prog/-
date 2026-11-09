"use client";

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import type { Area, Category, SponsorProject } from "@/types";
import { AREAS, BUDGET_OPTIONS, CATEGORIES } from "@/lib/constants";
import { cn, formatManYen } from "@/lib/utils";
import { Select } from "@/components/ui";
import { Accordion } from "@/components/accordion";
import { Autocomplete } from "@/components/autocomplete";

const inputBase =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export interface FilterState {
  q: string;
  categories: Category[];
  area: Area | "";
  budget: string;
  minAmount: number;
  openOnly: boolean;
}

export const SLIDER_MAX = 3_000_000;
export const SLIDER_STEP = 100_000;

export const defaultFilters: FilterState = {
  q: "",
  categories: [],
  area: "",
  budget: "all",
  minAmount: 0,
  openOnly: true,
};

export function applyFilters(projects: SponsorProject[], f: FilterState) {
  const keyword = f.q.trim().toLowerCase();
  const opt = BUDGET_OPTIONS.find((o) => o.value === f.budget) ?? BUDGET_OPTIONS[0];
  return projects.filter((p) => {
    if (f.openOnly && p.status !== "open") return false;
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    // 地域：選択したブロックの案件＋「全国」対象の案件を表示
    if (f.area && p.area !== f.area && p.area !== "全国") return false;
    if (!(p.budgetMax >= opt.min && p.budgetMin <= opt.max)) return false;
    if (f.minAmount > 0 && p.budgetMax < f.minAmount) return false;
    if (keyword) {
      const haystack = [
        p.title,
        p.companyName,
        p.industry,
        p.description,
        p.targetRegion,
        ...p.expectedReturns,
        ...p.conditions,
      ]
        .join(" ")
        .toLowerCase();
      if (!keyword.split(/\s+/).every((k) => haystack.includes(k))) return false;
    }
    return true;
  });
}

export function ProjectFilters({
  value,
  onChange,
  onReset,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}) {
  const set = <K extends keyof FilterState>(key: K, v: FilterState[K]) => onChange({ ...value, [key]: v });

  const toggleCategory = (c: Category) =>
    set("categories", value.categories.includes(c) ? value.categories.filter((x) => x !== c) : [...value.categories, c]);

  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-navy-800 px-4 py-3 text-white lg:rounded-t-lg">
        <p className="flex items-center gap-2 text-sm font-bold">
          <SlidersHorizontal className="h-4 w-4" />
          条件を絞り込む
        </p>
        <button onClick={onReset} className="flex items-center gap-1 text-xs text-navy-200 hover:text-white">
          <RotateCcw className="h-3.5 w-3.5" />
          クリア
        </button>
      </div>

      <section className="border-b border-slate-100 p-4">
        <p className="mb-2 text-sm font-bold text-navy-800">フリーワード</p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Autocomplete
            value={value.q}
            onChange={(v) => set("q", v)}
            placeholder="企業名・見返り・業種など"
            inputClassName={cn(inputBase, "pl-9")}
          />
        </div>
      </section>

      <Accordion
        defaultOpen={["category", "area", "budget"]}
        itemClassName="border-b border-slate-100"
        headerClassName="px-4 py-3 text-sm font-bold text-navy-800 hover:bg-slate-50"
        bodyClassName="px-4 pb-4"
        items={[
          {
            id: "category",
            title: (
              <>
                カテゴリー
                {value.categories.length > 0 && <span className="ml-2 text-xs font-semibold text-brand-600">{value.categories.length}件選択中</span>}
              </>
            ),
            content: (
              <div className="space-y-2">
                {CATEGORIES.map((c) => (
                  <label key={c.value} className="flex cursor-pointer items-start gap-2 text-sm text-navy-800">
                    <input
                      type="checkbox"
                      checked={value.categories.includes(c.value)}
                      onChange={() => toggleCategory(c.value)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-600"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            ),
          },
          {
            id: "area",
            title: (
              <>
                地域
                {value.area && <span className="ml-2 text-xs font-semibold text-brand-600">{value.area}</span>}
              </>
            ),
            content: (
              <>
                <Select value={value.area} onChange={(e) => set("area", e.target.value as Area | "")}>
                  <option value="">すべての地域</option>
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </Select>
                <p className="mt-1.5 text-xs text-slate-500">※地域を選ぶと「全国」対象の案件も表示されます</p>
              </>
            ),
          },
          {
            id: "budget",
            title: "協賛金額",
            content: (
              <>
                <div className="space-y-2">
                  {BUDGET_OPTIONS.map((o) => (
                    <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm text-navy-800">
                      <input
                        type="radio"
                        name="budget"
                        checked={value.budget === o.value}
                        onChange={() => set("budget", o.value)}
                        className="h-4 w-4 accent-brand-600"
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-navy-700">上限額がこの金額以上</span>
                    <span className="font-bold text-brand-600">
                      {value.minAmount === 0 ? "指定なし" : `${formatManYen(value.minAmount)}〜`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={SLIDER_MAX}
                    step={SLIDER_STEP}
                    value={value.minAmount}
                    onChange={(e) => set("minAmount", Number(e.target.value))}
                    className="mt-2 w-full accent-brand-600"
                    aria-label="協賛金額の下限"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0円</span>
                    <span>300万円</span>
                  </div>
                </div>
              </>
            ),
          },
        ]}
      />

      <section className="p-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-navy-800">
          <input
            type="checkbox"
            checked={value.openOnly}
            onChange={(e) => set("openOnly", e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          募集中の案件のみ表示
        </label>
      </section>
    </div>
  );
}
