"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

/**
 * アコーディオン。single=true で同時に1つだけ開く。
 * 高さは grid-template-rows のアニメーションで開閉。
 */
export function Accordion({
  items,
  single = false,
  defaultOpen = [],
  className,
  itemClassName,
  headerClassName,
  bodyClassName,
}: {
  items: AccordionItem[];
  single?: boolean;
  defaultOpen?: string[];
  className?: string;
  itemClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
}) {
  const [open, setOpen] = useState<string[]>(defaultOpen);

  const toggle = (id: string) =>
    setOpen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : single ? [id] : [...cur, id]));

  return (
    <div className={className}>
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        const panelId = `acc-panel-${it.id}`;
        const btnId = `acc-btn-${it.id}`;
        return (
          <div key={it.id} className={itemClassName}>
            <button
              id={btnId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(it.id)}
              className={cn("flex w-full items-center gap-3 text-left", headerClassName)}
            >
              <span className="min-w-0 flex-1">{it.title}</span>
              <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className={cn("grid transition-[grid-template-rows] duration-200 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <div className={bodyClassName}>{it.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
