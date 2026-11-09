import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * アイコンの代わりに使う、和風の目印と最小限の操作用記号。
 * 装飾目的のアイコンは使わず、はんこ（印）風の漢字や記号で表す。
 */

type Tone = "red" | "blue" | "navy" | "sky";

const HANKO_TONE: Record<Tone, string> = {
  red: "border-accent-500 text-accent-600",
  blue: "border-brand-600 text-brand-700",
  navy: "border-navy-700 text-navy-800",
  sky: "border-sky-600 text-sky-700",
};
const HANKO_FILL: Record<Tone, string> = {
  red: "border-accent-500 bg-accent-500 text-white",
  blue: "border-brand-600 bg-brand-600 text-white",
  navy: "border-navy-800 bg-navy-800 text-white",
  sky: "border-sky-600 bg-sky-600 text-white",
};

/** はんこ風の漢字マーク */
export function Hanko({
  char,
  tone = "red",
  filled = false,
  size = "md",
  className,
}: {
  char: string;
  tone?: Tone;
  filled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sz = size === "lg" ? "h-12 w-12 text-2xl" : size === "sm" ? "h-7 w-7 text-sm" : "h-10 w-10 text-xl";
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-[3px] border-2 font-brush leading-none",
        filled ? HANKO_FILL[tone] : HANKO_TONE[tone],
        sz,
        className,
      )}
    >
      {char}
    </span>
  );
}

/* ───── 操作用の最小限の記号（細い線で描く） ───── */
type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "square" as const,
  "aria-hidden": true,
  ...p,
});

export const ChevronDown = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
export const ChevronRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
export const ChevronLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
export const CloseMark = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const MenuMark = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const SearchMark = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15 15l5 5" />
  </svg>
);
export const PauseMark = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 6v12M15 6v12" />
  </svg>
);
export const PlayMark = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M8 5.5v13l10-6.5z" />
  </svg>
);
export const Spinner = ({ className }: { className?: string }) => (
  <span aria-hidden className={cn("inline-block animate-spin rounded-full border-2 border-current border-t-transparent", className)} />
);
