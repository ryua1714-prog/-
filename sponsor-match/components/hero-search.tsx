"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { AREAS, CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui";

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

  const selectClass =
    "h-12 w-full rounded-md border-0 bg-white px-3 text-sm text-navy-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none";

  return (
    <form
      action="/projects"
      onSubmit={submit}
      className="grid gap-2 rounded-xl bg-white/10 p-2 ring-1 ring-white/20 backdrop-blur sm:grid-cols-[1fr_auto_auto_auto] sm:bg-white sm:p-2 sm:ring-0 sm:shadow-xl"
    >
      <label className="relative block">
        <span className="sr-only">キーワード</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="キーワード（例：ユニフォーム、祭り、SNS）"
          className={`${selectClass} pl-10`}
        />
      </label>
      <label>
        <span className="sr-only">カテゴリー</span>
        <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={`${selectClass} sm:w-44`}>
          <option value="">全カテゴリー</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.short}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">地域</span>
        <select name="area" value={area} onChange={(e) => setArea(e.target.value)} className={`${selectClass} sm:w-44`}>
          <option value="">全地域</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" variant="accent" size="lg" className="h-12">
        <Search className="h-5 w-5" />
        検索する
      </Button>
    </form>
  );
}
