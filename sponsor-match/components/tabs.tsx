"use client";

import { cn } from "@/lib/utils";

export interface TabItem<K extends string> {
  key: K;
  label: string;
  count?: number;
}

export function Tabs<K extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto border-b border-slate-200", className)} role="tablist">
      {items.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={value === t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
            value === t.key ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-navy-800",
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={cn("rounded-full px-2 py-0.5 text-xs", value === t.key ? "bg-brand-50" : "bg-slate-100")}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
