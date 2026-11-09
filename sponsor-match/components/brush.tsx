"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 筆で払ったような赤い線（SVG）。
 * 左の打ち込みが太く、右へ向かって細く払い上げる形。
 */
export function BrushStroke({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden className={cn("brush-draw text-accent-500", className)}>
      <defs>
        <filter id={`rough-${id}`} x="-5%" y="-40%" width="110%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.08" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#rough-${id})`} fill="currentColor">
        {/* 主線：打ち込み→送り→右上へ払う */}
        <path d="M6 24 C 4 15, 14 11, 26 12 C 90 14, 180 16, 262 14 C 312 13, 352 9, 396 2 C 380 12, 350 20, 300 24 C 220 30, 120 31, 30 32 C 14 32, 7 30, 6 24 Z" />
        {/* かすれ */}
        <path opacity="0.45" d="M40 34 C 120 33, 200 31, 280 27 C 230 33, 150 36, 60 37 Z" />
        <path opacity="0.35" d="M30 9 C 90 9, 160 10, 230 11 C 170 13, 100 13, 36 12 Z" />
      </g>
    </svg>
  );
}

/** 習字風の見出し。下に払いの赤線が入る */
export function BrushTitle({
  children,
  as: Tag = "h1",
  className,
  strokeClassName,
}: {
  children: ReactNode;
  as?: "h1" | "h2";
  className?: string;
  strokeClassName?: string;
}) {
  return (
    <Tag className={cn("relative inline-block font-brush font-normal text-navy-900", className)}>
      <span className="relative z-10">{children}</span>
      <BrushStroke className={cn("absolute -bottom-2 left-[-2%] z-0 h-[0.45em] w-[104%] opacity-90", strokeClassName)} />
    </Tag>
  );
}
