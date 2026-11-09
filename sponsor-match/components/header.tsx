"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CloseMark, MenuMark } from "@/components/marks";
import { Dropdown } from "@/components/dropdown";
import { Accordion } from "@/components/accordion";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/toast";
import { AREAS, CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Hanko } from "@/components/marks";

const CAT_MARK = { sports: { char: "競", tone: "blue" }, community: { char: "祭", tone: "red" }, students: { char: "学", tone: "sky" } } as const;

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Hanko char="橋" tone={light ? "red" : "blue"} filled className="h-9 w-9 text-lg" />
      <span className="leading-tight">
        <span className={cn("block font-brush text-lg tracking-wide", light ? "text-white" : "text-navy-900")}>スポンサーブリッジ</span>
        <span className={cn("block text-[10px] tracking-widest", light ? "text-navy-200" : "text-slate-500")}>SPONSOR BRIDGE</span>
      </span>
    </Link>
  );
}

/** ヘッダーの「スポンサー案件を探す」プルダウン */
function ProjectsMenu() {
  const { projects } = useStore();
  return (
    <Dropdown
      label="スポンサー案件を探す"
      buttonClassName="rounded-md px-3 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
      panelClassName="w-[520px] p-5"
    >
      <div className="grid grid-cols-[1.1fr_1fr] gap-6">
        <div>
          <p className="mb-2 text-xs font-bold text-slate-500">カテゴリーから</p>
          <ul className="space-y-1">
            {CATEGORIES.map((c) => {
              const mark = CAT_MARK[c.value];
              const n = projects.filter((p) => p.category === c.value && p.status === "open").length;
              return (
                <li key={c.value}>
                  <Link href={`/projects?category=${c.value}`} className="flex items-center gap-2 rounded px-2 py-2 text-sm text-navy-800 hover:bg-navy-50">
                    <Hanko char={mark.char} tone={mark.tone} size="sm" className="h-6 w-6 text-xs" />
                    <span className="flex-1">{c.label}</span>
                    <span className="text-xs text-slate-400">{n}件</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/projects" className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline">
            すべての案件を見る ›
          </Link>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold text-slate-500">地域から</p>
          <ul className="grid grid-cols-2 gap-1">
            {AREAS.map((a) => (
              <li key={a}>
                <Link href={`/projects?area=${encodeURIComponent(a)}`} className="flex items-center gap-1.5 rounded px-2 py-1.5 text-sm text-navy-800 hover:bg-navy-50">
                  {a}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Dropdown>
  );
}

/** ヘッダーの「マイページ」プルダウン */
function AccountMenu() {
  const { currentSeeker } = useStore();
  const toast = useToast();
  return (
    <Dropdown
      align="right"
      label={
        <>
          マイページ
        </>
      }
      buttonClassName="h-8 rounded-md bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700"
      panelClassName="w-64 py-2"
    >
      {(close) => (
        <>
          <div className="border-b border-slate-100 px-4 pb-3 pt-1">
            <p className="text-[11px] text-slate-500">ログイン中（デモ）</p>
            <p className="truncate text-sm font-bold text-navy-900">{currentSeeker.name}</p>
          </div>
          <ul className="py-1 text-sm">
            <li>
              <Link href="/mypage" className="flex items-center gap-2 px-4 py-2 text-navy-800 hover:bg-navy-50">
                プロフィール設定
              </Link>
            </li>
            <li>
              <Link href="/mypage?tab=history" className="flex items-center gap-2 px-4 py-2 text-navy-800 hover:bg-navy-50">
                応募履歴
              </Link>
            </li>
            <li className="mt-1 border-t border-slate-100 pt-1">
              <button
                type="button"
                onClick={() => {
                  close();
                  toast("デモ版のためログアウトはできません", "info");
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-slate-600 hover:bg-navy-50"
              >
                ログアウト
              </button>
            </li>
          </ul>
        </>
      )}
    </Dropdown>
  );
}

/** ハンバーガーメニューで開くドロワー */
function DrawerMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const linkCls = "flex items-center gap-2 rounded px-2 py-2.5 text-sm text-navy-800 hover:bg-navy-50";

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="メニュー">
      <div className="fade-in absolute inset-0 bg-navy-950/50" onClick={onClose} />
      <div
        className="drawer-in absolute bottom-0 right-0 top-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) onClose();
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <span className="font-brush text-lg text-navy-900">メニュー</span>
          <button onClick={onClose} className="rounded p-2 text-slate-500 hover:bg-slate-100" aria-label="メニューを閉じる">
            <CloseMark className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <Accordion
            defaultOpen={["cat"]}
            itemClassName="border-b border-slate-100"
            headerClassName="px-2 py-3 text-sm font-bold text-navy-900"
            bodyClassName="pb-2"
            items={[
              {
                id: "cat",
                title: "カテゴリーから探す",
                content: (
                  <ul>
                    {CATEGORIES.map((c) => {
                      const mark = CAT_MARK[c.value];
                      return (
                        <li key={c.value}>
                          <Link href={`/projects?category=${c.value}`} className={linkCls}>
                            <Hanko char={mark.char} tone={mark.tone} size="sm" className="h-6 w-6 text-xs" />
                            {c.label}
                          </Link>
                        </li>
                      );
                    })}
                    <li>
                      <Link href="/projects" className={cn(linkCls, "font-semibold text-brand-600")}>
                        すべての案件を見る ›
                      </Link>
                    </li>
                  </ul>
                ),
              },
              {
                id: "area",
                title: "地域から探す",
                content: (
                  <ul className="grid grid-cols-2">
                    {AREAS.map((a) => (
                      <li key={a}>
                        <Link href={`/projects?area=${encodeURIComponent(a)}`} className={linkCls}>
                          {a}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                id: "me",
                title: "マイページ",
                content: (
                  <ul>
                    <li>
                      <Link href="/mypage" className={linkCls}>
                        プロフィール設定
                      </Link>
                    </li>
                    <li>
                      <Link href="/mypage?tab=history" className={linkCls}>
                        応募履歴
                      </Link>
                    </li>
                  </ul>
                ),
              },
            ]}
          />
          <ul className="mt-2">
            <li>
              <Link href="/pricing" className={cn(linkCls, "font-bold")}>
                料金プラン
              </Link>
            </li>
            <li>
              <Link href="/contact" className={cn(linkCls, "font-bold")}>
                お問い合わせ
              </Link>
            </li>
            <li>
              <Link href="/admin" className={cn(linkCls, "font-bold")}>
                管理画面（運営者）
              </Link>
            </li>
          </ul>
        </nav>
        <div className="border-t border-slate-200 p-4">
          <Link href="/contact?tab=company" className="flex h-11 items-center justify-center rounded-md bg-accent-500 text-sm font-bold text-white hover:bg-accent-600">
            企業の方：掲載のご相談
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-t-[3px] border-b-slate-200 border-t-accent-500 bg-white/95 backdrop-blur">
        {isAdmin && (
          <div className="bg-accent-600 py-1.5 text-center text-xs font-bold text-white">
            管理者モードで表示中です（運営者専用画面）
          </div>
        )}
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            <ProjectsMenu />
            <Link
              href="/pricing"
              className={cn("rounded-md px-3 py-2 text-sm font-medium hover:bg-navy-50", pathname.startsWith("/pricing") ? "text-brand-600" : "text-navy-700")}
            >
              料金プラン
            </Link>
            <Link
              href="/contact"
              className={cn("rounded-md px-3 py-2 text-sm font-medium hover:bg-navy-50", pathname.startsWith("/contact") ? "text-brand-600" : "text-navy-700")}
            >
              お問い合わせ
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <AccountMenu />
            </div>
            <button
              className="flex flex-col items-center rounded-md px-2 py-1 text-navy-800 hover:bg-navy-50"
              onClick={() => setOpen(true)}
              aria-label="メニューを開く"
              aria-expanded={open}
            >
              <MenuMark className="h-6 w-6" />
              <span className="text-[10px] font-bold leading-none">メニュー</span>
            </button>
          </div>
        </div>
      </header>
      <DrawerMenu open={open} onClose={close} />
    </>
  );
}
