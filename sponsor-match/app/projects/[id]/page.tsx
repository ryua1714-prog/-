"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Banknote, Building2, CalendarClock, ChevronRight, CircleCheck, FileText, Gift, MapPin, Send, Target } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { ButtonLink, Card, CategoryBadge, InitialLogo } from "@/components/ui";
import { DeadlineBadge } from "@/components/project-card";
import { LoadingBlock, NotFoundProject } from "@/components/not-found-project";
import type { ReactNode } from "react";

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="border-t border-slate-100 px-6 py-6 first:border-t-0">
      <h2 className="mb-3 flex items-center gap-2 border-l-4 border-brand-600 pl-3 text-lg font-bold text-navy-900">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-navy-800">
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          {i}
        </li>
      ))}
    </ul>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getProject, hydrated, applications, currentSeeker } = useStore();
  const project = getProject(id);

  if (!project) return hydrated ? <NotFoundProject /> : <LoadingBlock />;

  const isOpen = project.status === "open";
  const alreadyApplied = applications.some((a) => a.projectId === project.id && a.seekerId === currentSeeker.id);

  const cta = isOpen ? (
    alreadyApplied ? (
      <ButtonLink href="/mypage?tab=history" variant="outline" size="lg" className="w-full">
        応募済み（応募履歴を見る）
      </ButtonLink>
    ) : (
      <ButtonLink href={`/projects/${project.id}/apply`} variant="accent" size="lg" className="w-full">
        <Send className="h-5 w-5" />
        この案件に応募する
      </ButtonLink>
    )
  ) : (
    <div className="rounded-md bg-slate-100 py-3 text-center text-sm font-semibold text-slate-500">この案件の募集は終了しました</div>
  );

  return (
    <div className="bg-navy-50/50 pb-28 lg:pb-12">
      <div className="container-page py-4">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-600">
            トップ
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/projects" className="hover:text-brand-600">
            スポンサー案件一覧
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-navy-700">{project.companyName}</span>
        </nav>
      </div>

      <div className="container-page grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={project.category} />
              <DeadlineBadge project={project} />
              <span className="text-xs text-slate-500">案件ID：{project.id}</span>
            </div>
            <h1 className="mt-3 text-xl font-bold leading-snug text-navy-900 sm:text-2xl">{project.title}</h1>
            <div className="mt-4 flex items-center gap-3">
              <InitialLogo text={project.companyLogo} color={project.logoColor} />
              <div>
                <p className="font-bold text-navy-900">{project.companyName}</p>
                <p className="text-sm text-slate-500">{project.industry}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">{project.description}</p>
          </Card>

          <Card>
            <Section icon={<Building2 className="h-5 w-5 text-brand-600" />} title="企業概要">
              <p className="text-sm leading-relaxed text-navy-800">{project.companyOverview}</p>
            </Section>
            <Section icon={<Target className="h-5 w-5 text-brand-600" />} title="協賛の背景">
              <p className="text-sm leading-relaxed text-navy-800">{project.background}</p>
            </Section>
            <Section icon={<FileText className="h-5 w-5 text-brand-600" />} title="協賛条件・必須要件">
              <CheckList items={project.conditions} />
            </Section>
            <Section icon={<Gift className="h-5 w-5 text-brand-600" />} title="求める見返り">
              <div className="grid gap-2 sm:grid-cols-2">
                {project.expectedReturns.map((r) => (
                  <div key={r} className="rounded-md border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">
                    {r}
                  </div>
                ))}
              </div>
            </Section>
            <Section icon={<FileText className="h-5 w-5 text-brand-600" />} title="応募要件・提出物">
              <CheckList items={project.requirements} />
            </Section>
          </Card>

          <div className="hidden lg:block">{cta}</div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <div className="bg-navy-800 px-5 py-3 text-sm font-bold text-white">募集概要</div>
            <dl className="divide-y divide-slate-100 text-sm">
              {[
                { icon: Banknote, label: "協賛金額", value: project.budgetRange, strong: true },
                { icon: MapPin, label: "対象地域", value: project.targetRegion },
                { icon: CalendarClock, label: "募集締切", value: formatDate(project.deadline) },
                { icon: CalendarClock, label: "掲載日", value: formatDate(project.publishedAt) },
              ].map((row) => (
                <div key={row.label} className="flex gap-3 px-5 py-3">
                  <dt className="flex w-24 shrink-0 items-center gap-1.5 text-slate-500">
                    <row.icon className="h-4 w-4" />
                    {row.label}
                  </dt>
                  <dd className={row.strong ? "font-bold text-navy-900" : "text-navy-800"}>{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="hidden border-t border-slate-100 p-4 lg:block">{cta}</div>
          </Card>
          <p className="px-1 text-xs leading-relaxed text-slate-500">
            応募後、企業担当者が内容を確認し、面談を希望する場合はマイページの応募履歴に「面談打診」と表示されます。
          </p>
        </aside>
      </div>

      {/* モバイル用フローティングCTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">{cta}</div>
    </div>
  );
}
