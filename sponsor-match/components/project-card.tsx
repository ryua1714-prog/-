import Link from "next/link";
import { Banknote, CalendarClock, MapPin } from "lucide-react";
import type { SponsorProject } from "@/types";
import { Badge, CategoryBadge, InitialLogo, ReturnTag } from "@/components/ui";
import { cn, daysUntil, formatDate } from "@/lib/utils";

export function DeadlineBadge({ project }: { project: SponsorProject }) {
  if (project.status === "closed") return <Badge className="bg-slate-100 text-slate-500 ring-slate-200">募集終了</Badge>;
  const d = daysUntil(project.deadline);
  if (d < 0) return <Badge className="bg-slate-100 text-slate-500 ring-slate-200">締切済み</Badge>;
  if (d <= 14) return <Badge className="bg-accent-50 text-accent-600 ring-accent-100">締切まで{d}日</Badge>;
  return <Badge className="bg-brand-50 text-brand-700 ring-brand-100">募集中</Badge>;
}

/** グリッド表示用（トップページ） */
export function ProjectCard({ project }: { project: SponsorProject }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex h-full flex-col rounded-md border border-slate-200 bg-white p-5 transition hover:border-brand-500"
    >
      <div className="flex items-center gap-2">
        <CategoryBadge category={project.category} />
        <DeadlineBadge project={project} />
      </div>
      <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-navy-900 group-hover:text-brand-600">
        {project.title}
      </h3>
      <div className="mt-3 flex items-center gap-2">
        <InitialLogo text={project.companyLogo} color={project.logoColor} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-navy-800">{project.companyName}</p>
          <p className="text-xs text-slate-500">{project.industry}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 shrink-0 text-brand-600" />
          <dt className="sr-only">協賛金額</dt>
          <dd className="font-bold text-navy-900">{project.budgetRange}</dd>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          <dt className="sr-only">対象地域</dt>
          <dd>{project.targetRegion}</dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.expectedReturns.slice(0, 3).map((r) => (
          <ReturnTag key={r}>{r}</ReturnTag>
        ))}
      </div>
    </Link>
  );
}

/** リスト表示用（案件一覧ページ） */
export function ProjectListItem({ project }: { project: SponsorProject }) {
  const closed = project.status === "closed";
  return (
    <Link
      href={`/projects/${project.id}`}
      className={cn(
        "group block rounded-md border border-slate-200 bg-white transition hover:border-brand-500",
        closed && "opacity-70",
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row">
        <InitialLogo text={project.companyLogo} color={project.logoColor} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={project.category} />
            <DeadlineBadge project={project} />
            <span className="text-xs text-slate-500">掲載日 {formatDate(project.publishedAt)}</span>
          </div>
          <h3 className="mt-2 text-lg font-bold leading-snug text-navy-900 group-hover:text-brand-600">{project.title}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {project.companyName}
            <span className="mx-2 text-slate-300">|</span>
            {project.industry}
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{project.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.expectedReturns.map((r) => (
              <ReturnTag key={r}>{r}</ReturnTag>
            ))}
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-1 divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/70 text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex items-center gap-2 px-5 py-2.5">
          <Banknote className="h-4 w-4 text-brand-600" />
          <dt className="shrink-0 whitespace-nowrap text-xs text-slate-500">協賛金額</dt>
          <dd className="font-bold text-navy-900">{project.budgetRange}</dd>
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5">
          <MapPin className="h-4 w-4 text-slate-400" />
          <dt className="shrink-0 whitespace-nowrap text-xs text-slate-500">対象地域</dt>
          <dd className="font-medium text-navy-800">{project.targetRegion}</dd>
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5">
          <CalendarClock className="h-4 w-4 text-slate-400" />
          <dt className="shrink-0 whitespace-nowrap text-xs text-slate-500">募集締切</dt>
          <dd className="font-medium text-navy-800">{formatDate(project.deadline)}</dd>
        </div>
      </dl>
    </Link>
  );
}
