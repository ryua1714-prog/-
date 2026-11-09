"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { ProjectCard } from "@/components/project-card";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "new", label: "新着案件" },
  { key: "featured", label: "おすすめ案件" },
] as const;

export function FeaturedProjects() {
  const { projects } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("new");

  const list = useMemo(() => {
    const open = projects.filter((p) => p.status === "open");
    if (tab === "featured") return open.filter((p) => p.featured).slice(0, 6);
    return [...open].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 6);
  }, [projects, tab]);

  return (
    <div>
      <div className="mb-6 flex justify-center gap-2" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              tab === t.key ? "bg-navy-800 text-white" : "bg-white text-navy-700 ring-1 ring-slate-200 hover:bg-navy-50",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">該当する案件はありません。</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
