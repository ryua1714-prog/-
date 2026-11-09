"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * カルーセル（スクロールスナップ方式）。
 * スワイプ・矢印・ドット・自動再生（ホバー／操作中は停止）に対応。
 */
export function Carousel({
  children,
  label,
  slideClassName = "basis-full",
  autoPlayMs = 0,
  className,
}: {
  children: ReactNode;
  label: string;
  /** 1枚あたりの幅（例: "basis-full sm:basis-1/2 lg:basis-1/3"） */
  slideClassName?: string;
  autoPlayMs?: number;
  className?: string;
}) {
  const slides = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [pages, setPages] = useState(1);
  const [hovering, setHovering] = useState(false);
  const [playing, setPlaying] = useState(autoPlayMs > 0);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    if (!first) return;
    const perView = Math.max(1, Math.round(el.clientWidth / first.offsetWidth));
    const p = Math.max(1, slides.length - perView + 1);
    setPages(p);
    const i = Math.round(el.scrollLeft / first.offsetWidth);
    setIndex(Math.min(i, p - 1));
  }, [slides.length]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return;
    el.scrollTo({ left: i * first.offsetWidth, behavior: "smooth" });
  }, []);

  const next = useCallback(() => goTo(index + 1 >= pages ? 0 : index + 1), [goTo, index, pages]);
  const prev = () => goTo(index - 1 < 0 ? pages - 1 : index - 1);

  useEffect(() => {
    if (!playing || hovering || autoPlayMs <= 0 || pages <= 1) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(next, autoPlayMs);
    return () => clearInterval(t);
  }, [playing, hovering, autoPlayMs, pages, next]);

  const arrow =
    "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-navy-800 shadow hover:bg-white disabled:opacity-0";

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative min-w-0 w-full", className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
      onTouchStart={() => setHovering(true)}
      onTouchEnd={() => setTimeout(() => setHovering(false), 3000)}
    >
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={measure}
          className="no-scrollbar relative -mx-2 flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
        >
          {slides.map((s, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${slides.length}`}
              className={cn("shrink-0 snap-start px-2", slideClassName)}
            >
              {s}
            </div>
          ))}
        </div>
        {pages > 1 && (
          <>
            <button type="button" onClick={prev} className={cn(arrow, "left-1 sm:-left-3")} aria-label="前へ">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={next} className={cn(arrow, "right-1 sm:-right-3")} aria-label="次へ">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="flex gap-1.5">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1}枚目へ`}
                aria-current={i === index}
                className={cn("h-2 rounded-full transition-all", i === index ? "w-6 bg-accent-500" : "w-2 bg-slate-300 hover:bg-slate-400")}
              />
            ))}
          </div>
          {autoPlayMs > 0 && (
            <button
              type="button"
              onClick={() => setPlaying((v) => !v)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              aria-label={playing ? "自動再生を停止" : "自動再生を開始"}
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
