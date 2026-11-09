"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { ProjectCard } from "@/components/project-card";
import { Carousel } from "@/components/carousel";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "new", label: "新着" },
  { key: "featured", label: "おすすめ" },
] as const;

export function FeaturedProjects() {
  const { projects } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("new");

  const list = useMemo(() => {
    const open = projects.filter((p) => p.status === "open");
    if (tab === "featured") return open.filter((p) => p.featured).slice(0, 8);
    return [...open].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 8);
  }, [projects, tab]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="flex items-center gap-2.5 text-xl font-bold text-navy-900 sm:text-2xl">
            <span className="h-5 w-1.5 rounded-sm bg-accent-500" aria-hidden />
            スポンサー案件
          </h2>
          <div className="flex border-b border-slate-200" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "-mb-px border-b-2 px-3 py-1.5 text-sm font-semibold transition-colors",
                  tab === t.key ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-navy-800",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <Link href="/projects" className="text-sm font-semibold text-brand-600 hover:underline">
          すべての案件を見る ›
        </Link>
      </div>
      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">該当する案件はありません。</p>
      ) : (
        <Carousel key={tab} label="スポンサー案件" slideClassName="basis-[88%] sm:basis-1/2 lg:basis-1/3">
          {list.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </Carousel>
      )}
    </div>
  );
}
