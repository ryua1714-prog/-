"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Handshake, LayoutDashboard, Menu, ShieldCheck, User, X } from "lucide-react";
import { buttonClass } from "@/components/ui";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/projects", label: "スポンサー案件を探す" },
  { href: "/pricing", label: "料金プラン" },
  { href: "/contact", label: "お問い合わせ" },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white">
        <Handshake className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <span className={cn("block text-base font-bold tracking-wide", light ? "text-white" : "text-navy-900")}>
          スポンサーブリッジ
        </span>
        <span className={cn("block text-[10px] tracking-widest", light ? "text-navy-200" : "text-slate-500")}>
          SPONSOR BRIDGE
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 border-b border-t-[3px] border-b-slate-200 border-t-accent-500 bg-white/95 backdrop-blur">
      {isAdmin && (
        <div className="bg-accent-600 py-1.5 text-center text-xs font-bold text-white">
          <ShieldCheck className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
          管理者モードで表示中です（運営者専用画面）
        </div>
      )}
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-navy-50",
                pathname.startsWith(n.href) ? "text-brand-600" : "text-navy-700",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/admin" className={buttonClass("ghost", "sm")}>
            <LayoutDashboard className="h-4 w-4" />
            管理画面
          </Link>
          <Link href="/mypage" className={buttonClass("primary", "sm")}>
            <User className="h-4 w-4" />
            マイページ
          </Link>
        </div>
        <button
          className="rounded-md p-2 text-navy-800 hover:bg-navy-50 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="メニュー"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="container-page flex flex-col py-2" onClick={() => setOpen(false)}>
            {[...NAV, { href: "/mypage", label: "マイページ" }, { href: "/admin", label: "管理画面（運営者）" }].map((n) => (
              <Link key={n.href} href={n.href} className="rounded-md px-2 py-3 text-sm font-medium text-navy-800 hover:bg-navy-50">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
