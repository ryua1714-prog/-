"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { SearchX, SlidersHorizontal } from "lucide-react";
import type { Area, Category } from "@/types";
import { AREAS, CATEGORIES } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { applyFilters, defaultFilters, ProjectFilters, type FilterState } from "@/components/project-filters";
import { ProjectListItem } from "@/components/project-card";
import { Button, Select } from "@/components/ui";

type SortKey = "new" | "amount" | "deadline";

function filtersFromParams(params: URLSearchParams): FilterState {
  const category = params.get("category");
  const area = params.get("area");
  return {
    ...defaultFilters,
    q: params.get("q") ?? "",
    categories: CATEGORIES.some((c) => c.value === category) ? [category as Category] : [],
    area: AREAS.includes(area as Area) ? (area as Area) : "",
  };
}

export function ProjectSearch() {
  const searchParams = useSearchParams();
  // URLが外部から変わった場合（フッターのカテゴリーリンク等）は状態を初期化する
  return <ProjectSearchInner key={searchParams.toString()} initial={filtersFromParams(searchParams)} />;
}

function ProjectSearchInner({ initial }: { initial: FilterState }) {
  const { projects } = useStore();
  const [filters, setFilters] = useState<FilterState>(initial);
  const [sort, setSort] = useState<SortKey>("new");
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    const list = applyFilters(projects, filters);
    return [...list].sort((a, b) => {
      if (sort === "amount") return b.budgetMax - a.budgetMax || b.budgetMin - a.budgetMin;
      if (sort === "deadline") return a.deadline.localeCompare(b.deadline);
      return b.publishedAt.localeCompare(a.publishedAt);
    });
  }, [projects, filters, sort]);

  return (
    <div className="container-page py-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside>
          <Button variant="outline" className="mb-3 w-full lg:hidden" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? "絞り込み条件を閉じる" : "絞り込み条件を開く"}
          </Button>
          <div className={`${showFilters ? "block" : "hidden"} lg:sticky lg:top-24 lg:block`}>
            <ProjectFilters value={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />
          </div>
        </aside>

        <section>
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              検索結果 <span className="text-2xl font-bold text-navy-900">{results.length}</span> 件
            </p>
            <label className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-600">
              並び替え
              <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="w-40">
                <option value="new">新着順</option>
                <option value="amount">金額が高い順</option>
                <option value="deadline">締切が近い順</option>
              </Select>
            </label>
          </div>

          {results.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
              <SearchX className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-semibold text-navy-800">条件に一致する案件が見つかりませんでした</p>
              <p className="mt-1 text-sm text-slate-500">条件を変更して再度お試しください。</p>
              <Button variant="outline" className="mt-5" onClick={() => setFilters(defaultFilters)}>
                条件をクリア
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((p) => (
                <ProjectListItem key={p.id} project={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
