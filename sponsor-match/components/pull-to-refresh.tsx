"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Spinner } from "@/components/marks";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const THRESHOLD = 64;
const MAX = 96;

/**
 * プルトゥリフレッシュ（スマホのタッチ操作）。
 * ページ最上部で下に引っぱって離すと、保存データを読み直す。
 */
export function PullToRefresh({ children }: { children: ReactNode }) {
  const { reload } = useStore();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);

  useEffect(() => {
    const atTop = () => (document.scrollingElement?.scrollTop ?? window.scrollY) <= 0;

    const onStart = (e: TouchEvent) => {
      if (refreshing || e.touches.length !== 1 || !atTop()) return;
      // モーダルやドロワーが開いているときは無効
      if (document.body.style.overflow === "hidden") return;
      startY.current = e.touches[0].clientY;
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0 || !atTop()) {
        pullRef.current = 0;
        setPull(0);
        return;
      }
      e.preventDefault();
      const p = Math.min(MAX, dy * 0.5);
      pullRef.current = p;
      setPull(p);
    };
    const onEnd = () => {
      if (startY.current === null) return;
      startY.current = null;
      if (pullRef.current >= THRESHOLD) {
        setRefreshing(true);
        setPull(THRESHOLD);
        setTimeout(() => {
          reload();
          setRefreshing(false);
          setPull(0);
          pullRef.current = 0;
        }, 900);
      } else {
        setPull(0);
        pullRef.current = 0;
      }
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, [refreshing, reload]);

  const ready = pull >= THRESHOLD;

  return (
    <>
      <div
        aria-live="polite"
        className={cn("flex items-end justify-center overflow-hidden bg-navy-50 text-xs font-semibold text-navy-700", pull === 0 && "transition-[height] duration-200")}
        style={{ height: pull }}
      >
        {pull > 8 && (
          <span className="mb-3 flex items-center gap-2">
            {refreshing ? (
              <Spinner className="h-5 w-5 text-brand-600" />
            ) : (
              <span className={cn("text-base leading-none text-brand-600 transition-transform", ready && "rotate-180")}>↓</span>
            )}
          </span>
        )}
      </div>
      {children}
    </>
  );
}
