"use client";

import { useId, useMemo, useRef, useState, type InputHTMLAttributes } from "react";
import { Building2, Clock, Gift, MapPin, Search, Tag } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Kind = "company" | "return" | "region" | "industry" | "popular";

interface Suggestion {
  value: string;
  kind: Kind;
}

const KIND_META: Record<Kind, { label: string; icon: typeof Search }> = {
  company: { label: "企業名", icon: Building2 },
  return: { label: "見返り", icon: Gift },
  region: { label: "地域", icon: MapPin },
  industry: { label: "業種", icon: Tag },
  popular: { label: "よく検索", icon: Clock },
};

const POPULAR = ["ユニフォーム", "SNS", "祭り", "遠征費", "全国", "講演会"];

function useSuggestionSource() {
  const { projects } = useStore();
  return useMemo(() => {
    const seen = new Set<string>();
    const out: Suggestion[] = [];
    const add = (value: string, kind: Kind) => {
      const v = value.trim();
      if (!v || seen.has(v)) return;
      seen.add(v);
      out.push({ value: v, kind });
    };
    projects.forEach((p) => {
      add(p.companyName, "company");
      add(p.industry, "industry");
      add(p.targetRegion, "region");
      p.expectedReturns.forEach((r) => add(r, "return"));
    });
    return out;
  }, [projects]);
}

function Highlight({ text, query }: { text: string; query: string }) {
  const i = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-bold text-brand-600">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

/**
 * オートコンプリート付きのキーワード入力。
 * ↑↓で候補を移動、Enterで確定、Escで閉じる。
 */
export function Autocomplete({
  value,
  onChange,
  onSelect,
  className,
  inputClassName,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  /** 候補を確定したとき（検索の実行などに使う） */
  onSelect?: (v: string) => void;
  className?: string;
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "onSelect" | "className">) {
  const source = useSuggestionSource();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const blurTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const q = value.trim();
  const items: Suggestion[] = useMemo(() => {
    if (!q) return POPULAR.map((v) => ({ value: v, kind: "popular" as const }));
    const lower = q.toLowerCase();
    return source
      .filter((s) => s.value.toLowerCase().includes(lower) && s.value !== q)
      .sort((a, b) => a.value.toLowerCase().indexOf(lower) - b.value.toLowerCase().indexOf(lower))
      .slice(0, 8);
  }, [q, source]);

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
    setActive(-1);
    onSelect?.(v);
  };

  const show = open && items.length > 0;

  return (
    <div className={cn("relative", className)}>
      <input
        {...rest}
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        value={value}
        className={inputClassName}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => {
          clearTimeout(blurTimer.current);
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((a) => (a + 1) % Math.max(items.length, 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
          } else if (e.key === "Enter" && show && active >= 0) {
            e.preventDefault();
            choose(items[active].value);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {show && (
        <ul
          id={listId}
          role="listbox"
          className="fade-in absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg"
        >
          {!q && <li className="px-3 pb-1 pt-1.5 text-[11px] font-bold text-slate-400">よく検索されるキーワード</li>}
          {items.map((s, i) => {
            const Icon = KIND_META[s.kind].icon;
            return (
              <li
                key={`${s.kind}-${s.value}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(s.value);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn("flex cursor-pointer items-center gap-2 px-3 py-2", i === active ? "bg-brand-50" : "hover:bg-slate-50")}
              >
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1 truncate text-navy-800">
                  <Highlight text={s.value} query={q} />
                </span>
                <span className="shrink-0 text-[11px] text-slate-400">{KIND_META[s.kind].label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
