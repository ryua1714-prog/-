"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "@/components/marks";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * プルダウンメニュー。クリックで開閉、外側クリック・Esc・ページ移動で閉じる。
 */
export function Dropdown({
  label,
  children,
  align = "left",
  buttonClassName,
  panelClassName,
}: {
  label: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "left" | "right";
  buttonClassName?: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn("flex items-center gap-1", buttonClassName)}
      >
        {label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          className={cn(
            "fade-in absolute top-full z-50 mt-2 rounded-md border border-slate-200 bg-white shadow-lg",
            align === "right" ? "right-0" : "left-0",
            panelClassName,
          )}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) close();
          }}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </div>
  );
}
