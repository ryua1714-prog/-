import Link from "next/link";
import { ChevronRight, House } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

/** パンくずリスト（先頭は常にトップページ） */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const all: Crumb[] = [{ label: "トップ", href: "/" }, ...items];
  return (
    <nav aria-label="パンくずリスト" className={cn("text-xs", className)}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-slate-500">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />}
              {c.href && !last ? (
                <Link href={c.href} className="flex items-center gap-1 hover:text-brand-600 hover:underline">
                  {i === 0 && <House className="h-3.5 w-3.5" aria-hidden />}
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="max-w-[16rem] truncate font-medium text-navy-800">
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
