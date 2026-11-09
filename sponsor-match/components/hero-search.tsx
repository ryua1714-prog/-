"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { AREAS, CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui";
import { Autocomplete } from "@/components/autocomplete";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (area) params.set("area", area);
    router.push(`/projects${params.toString() ? `?${params}` : ""}`);
  };

  const field =
    "h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
  const label = "mb-1 block text-xs font-bold text-navy-700";

  return (
    <form action="/projects" onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-4 shadow-[0_8px_24px_-12px_rgba(18,32,61,0.25)] sm:p-5">
      <p className="mb-3 text-sm font-bold text-navy-900">スポンサー案件をさがす</p>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.6fr_auto] sm:items-end">
        <label>
          <span className={label}>カテゴリー</span>
          <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
            <option value="">すべて</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.short}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={label}>地域</span>
          <select name="area" value={area} onChange={(e) => setArea(e.target.value)} className={field}>
            <option value="">すべて</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={label}>キーワード</span>
          <Autocomplete
            name="q"
            value={q}
            onChange={setQ}
            placeholder="例：ユニフォーム、祭り、SNS"
            inputClassName={field}
          />
        </label>
        <Button type="submit" variant="accent" className="h-11 px-6">
          <Search className="h-4 w-4" />
          検索する
        </Button>
      </div>
    </form>
  );
}
