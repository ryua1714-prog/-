"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Briefcase,
  ClipboardList,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import type { Application, ApplicationStatus, SponsorProject } from "@/types";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/toast";
import { APPLICATION_STATUS, CATEGORY_LABEL } from "@/lib/constants";
import { cn, formatDate, formatDateTime, formatYen } from "@/lib/utils";
import { ApplicationStatusBadge, Badge, Button, Card, CategoryBadge, InitialLogo, Input, Select } from "@/components/ui";
import { Modal } from "@/components/modal";
import { useConfirm } from "@/components/confirm";
import { ProjectForm } from "./project-form";

type TabKey = "projects" | "applications" | "members";

export default function AdminPage() {
  const { projects, applications, seekers, hydrated, resetAll } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState<TabKey>("projects");
  const { ask, dialog } = useConfirm();

  const nav = [
    { key: "projects" as const, label: "案件管理", icon: Briefcase, count: projects.length },
    { key: "applications" as const, label: "応募管理", icon: ClipboardList, count: applications.length },
    { key: "members" as const, label: "募集側会員一覧", icon: Users, count: seekers.length },
  ];

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-3">
          <div className="rounded-lg bg-navy-900 p-4 text-white">
            <p className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
              <ShieldCheck className="h-4 w-4" />
              管理者モード
            </p>
            <p className="mt-1 text-sm font-bold">運営管理コンソール</p>
            <p className="mt-1 text-[11px] text-navy-300">ログイン中：運営スタッフ（デモ）</p>
          </div>
          <nav className="flex gap-1 overflow-x-auto rounded-lg bg-white p-1.5 shadow-sm lg:flex-col">
            {nav.map((n) => (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition-colors lg:w-full",
                  tab === n.key ? "bg-brand-600 text-white" : "text-navy-700 hover:bg-navy-50",
                )}
              >
                <n.icon className="h-4 w-4" />
                <span className="flex-1">{n.label}</span>
                <span className={cn("rounded-full px-2 text-xs", tab === n.key ? "bg-white/20" : "bg-slate-100")}>{n.count}</span>
              </button>
            ))}
          </nav>
          <button
            onClick={() => {
              ask(
                "すべてのデータを初期状態（モックデータ）に戻します。応募やプロフィールの変更も消えます。よろしいですか？",
                () => {
                  resetAll();
                  toast("データを初期状態に戻しました");
                },
                "初期化する",
              );
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            デモデータを初期化
          </button>
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "公開中の案件", value: projects.filter((p) => p.status === "open").length },
              { label: "非公開の案件", value: projects.filter((p) => p.status === "closed").length },
              { label: "未対応の応募", value: pendingCount, alert: pendingCount > 0 },
              { label: "登録会員数", value: seekers.length },
            ].map((s) => (
              <Card key={s.label} className="px-4 py-3">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className={cn("mt-1 text-2xl font-bold", s.alert ? "text-rose-600" : "text-navy-900")}>{s.value}</p>
              </Card>
            ))}
          </div>

          {!hydrated ? (
            <p className="text-sm text-slate-500">読み込み中...</p>
          ) : tab === "projects" ? (
            <ProjectsAdmin />
          ) : tab === "applications" ? (
            <ApplicationsAdmin />
          ) : (
            <MembersAdmin />
          )}
        </section>
      </div>
      {dialog}
    </div>
  );
}

/* ───────── 案件管理 ───────── */
function ProjectsAdmin() {
  const { projects, applications, upsertProject, deleteProject, toggleProjectStatus } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState<SponsorProject | "new" | null>(null);
  const { ask, dialog } = useConfirm();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return projects
      .filter((p) => !k || `${p.title}${p.companyName}`.toLowerCase().includes(k))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [projects, q]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-navy-900">スポンサー案件管理</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="案件名・企業名" className="h-9 w-48 pl-8" />
          </div>
          <Button size="md" className="h-9" onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" />
            新規作成
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="whitespace-nowrap bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">案件 / 企業</th>
              <th className="px-3 py-3 font-semibold">カテゴリー</th>
              <th className="px-3 py-3 font-semibold">協賛金額</th>
              <th className="px-3 py-3 font-semibold">締切</th>
              <th className="px-3 py-3 text-center font-semibold">応募</th>
              <th className="px-3 py-3 font-semibold">公開状態</th>
              <th className="px-5 py-3 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((p) => {
              const count = applications.filter((a) => a.projectId === p.id).length;
              const open = p.status === "open";
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <InitialLogo text={p.companyLogo} color={p.logoColor} size="sm" />
                      <div className="min-w-0">
                        <p className="max-w-[320px] truncate font-semibold text-navy-900">{p.title}</p>
                        <p className="text-xs text-slate-500">
                          {p.companyName} ・ {p.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <CategoryBadge category={p.category} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-navy-800">{p.budgetRange}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-600">{formatDate(p.deadline)}</td>
                  <td className="px-3 py-3 text-center font-semibold text-navy-900">{count}</td>
                  <td className="px-3 py-3">
                    <button
                      role="switch"
                      aria-checked={open}
                      onClick={() => {
                        toggleProjectStatus(p.id);
                        toast(open ? "案件を非公開にしました" : "案件を公開しました");
                      }}
                      className="flex items-center gap-2"
                    >
                      <span className={cn("relative h-5 w-9 rounded-full transition-colors", open ? "bg-emerald-500" : "bg-slate-300")}>
                        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", open ? "left-[18px]" : "left-0.5")} />
                      </span>
                      <span className={cn("text-xs font-semibold", open ? "text-emerald-700" : "text-slate-500")}>{open ? "公開" : "非公開"}</span>
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/projects/${p.id}`} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-800" title="プレビュー">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button onClick={() => setEditing(p)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="編集">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          ask(
                            `「${p.title}」を削除しますか？この操作は取り消せません。`,
                            () => {
                              deleteProject(p.id);
                              toast("案件を削除しました");
                            },
                            "削除する",
                          );
                        }}
                        className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        title="削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                  案件がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "スポンサー案件の新規作成" : "スポンサー案件の編集"} size="lg">
        {editing !== null && (
          <ProjectForm
            project={editing === "new" ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSubmit={(p) => {
              upsertProject(p);
              toast(editing === "new" ? "案件を作成しました" : "案件を更新しました");
              setEditing(null);
            }}
          />
        )}
      </Modal>
      {dialog}
    </Card>
  );
}

/* ───────── 応募管理 ───────── */
function ApplicationsAdmin() {
  const { applications, getProject, updateApplicationStatus } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [detail, setDetail] = useState<Application | null>(null);

  const list = useMemo(
    () =>
      applications
        .filter((a) => filter === "all" || a.status === filter)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [applications, filter],
  );

  const changeStatus = (id: string, s: ApplicationStatus) => {
    updateApplicationStatus(id, s);
    toast(`ステータスを「${APPLICATION_STATUS[s].label}」に更新しました`);
    setDetail((d) => (d && d.id === id ? { ...d, status: s } : d));
  };

  const statusOptions = (Object.keys(APPLICATION_STATUS) as ApplicationStatus[]).map((s) => (
    <option key={s} value={s}>
      {APPLICATION_STATUS[s].label}
    </option>
  ));

  const detailProject = detail ? getProject(detail.projectId) : undefined;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-navy-900">応募管理</h2>
        <div className="flex flex-wrap gap-1">
          {(["all", "pending", "reviewing", "accepted", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                filter === s ? "bg-navy-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {s === "all" ? "すべて" : APPLICATION_STATUS[s].label}
              <span className="ml-1 opacity-70">
                {s === "all" ? applications.length : applications.filter((a) => a.status === s).length}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="whitespace-nowrap bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">応募者</th>
              <th className="px-3 py-3 font-semibold">応募先案件</th>
              <th className="px-3 py-3 text-right font-semibold">希望金額</th>
              <th className="px-3 py-3 font-semibold">応募日時</th>
              <th className="px-3 py-3 font-semibold">ステータス</th>
              <th className="px-5 py-3 text-right font-semibold">詳細</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((a) => {
              const p = getProject(a.projectId);
              return (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="max-w-[220px] truncate font-semibold text-navy-900">{a.applicantName}</p>
                    <p className="text-xs text-slate-500">{CATEGORY_LABEL[a.category]} ・ {a.email}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="max-w-[260px] truncate text-navy-800">{p?.title ?? "（削除された案件）"}</p>
                    <p className="text-xs text-slate-500">{p?.companyName}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-navy-900">{formatYen(a.desiredAmount)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-600">{formatDateTime(a.createdAt)}</td>
                  <td className="px-3 py-3">
                    <Select
                      aria-label="ステータス"
                      value={a.status}
                      onChange={(e) => changeStatus(a.id, e.target.value as ApplicationStatus)}
                      className={cn("h-8 w-32 min-w-[8rem] text-xs font-semibold", APPLICATION_STATUS[a.status].style)}
                    >
                      {statusOptions}
                    </Select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => setDetail(a)}>
                      内容を確認
                    </Button>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                  該当する応募はありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title="応募内容の詳細"
        footer={
          detail && (
            <>
              <Button variant="danger" onClick={() => changeStatus(detail.id, "rejected")}>
                見送り
              </Button>
              <Button variant="outline" onClick={() => changeStatus(detail.id, "reviewing")}>
                選考中にする
              </Button>
              <Button onClick={() => changeStatus(detail.id, "accepted")}>承認（面談打診）</Button>
            </>
          )
        }
      >
        {detail && (
          <div className="space-y-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-navy-900">{detail.applicantName}</p>
                <p className="text-xs text-slate-500">{detail.email}</p>
              </div>
              <ApplicationStatusBadge status={detail.status} />
            </div>
            <dl className="grid grid-cols-2 gap-3 rounded-md bg-slate-50 p-4">
              <div>
                <dt className="text-xs text-slate-500">応募先案件</dt>
                <dd className="font-semibold text-navy-900">{detailProject?.title ?? "（削除された案件）"}</dd>
                <dd className="text-xs text-slate-500">{detailProject?.companyName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">希望協賛金額</dt>
                <dd className="text-lg font-bold text-navy-900">{formatYen(detail.desiredAmount)}</dd>
                <dd className="text-xs text-slate-500">案件の目安：{detailProject?.budgetRange ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">カテゴリー</dt>
                <dd className="text-navy-800">{CATEGORY_LABEL[detail.category]}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">応募日時</dt>
                <dd className="text-navy-800">{formatDateTime(detail.createdAt)}</dd>
              </div>
            </dl>
            <div>
              <p className="mb-1 text-xs font-bold text-navy-700">提案理由・自己PR</p>
              <p className="whitespace-pre-wrap rounded-md border border-slate-200 p-3 leading-relaxed text-navy-800">{detail.pitchMessage}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-bold text-navy-700">提供可能な見返り</p>
              <div className="flex flex-wrap gap-1.5">
                {detail.offeredReturns.map((r) => (
                  <Badge key={r} className={detailProject?.expectedReturns.includes(r) ? "bg-brand-50 text-brand-700 ring-brand-100" : undefined}>
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}

/* ───────── 会員一覧 ───────── */
function MembersAdmin() {
  const { seekers, applications } = useStore();
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-navy-900">募集側会員一覧</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="whitespace-nowrap bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">選手・団体名</th>
              <th className="px-3 py-3 font-semibold">カテゴリー</th>
              <th className="px-3 py-3 font-semibold">地域</th>
              <th className="px-3 py-3 font-semibold">規模</th>
              <th className="px-3 py-3 font-semibold">希望協賛額</th>
              <th className="px-3 py-3 font-semibold">プラン</th>
              <th className="px-3 py-3 text-center font-semibold">応募数</th>
              <th className="px-5 py-3 font-semibold">登録日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {seekers.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-100 text-sm font-bold text-navy-700">{s.name.slice(0, 1)}</div>
                    <div className="min-w-0">
                      <p className="max-w-[240px] truncate font-semibold text-navy-900">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <CategoryBadge category={s.category} />
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-navy-800">{s.region}</td>
                <td className="px-3 py-3 text-xs text-slate-600">{s.scale}</td>
                <td className="whitespace-nowrap px-3 py-3 text-navy-800">{s.desiredBudget}</td>
                <td className="px-3 py-3">
                  <Badge className={s.plan === "premium" ? "bg-accent-500/10 text-accent-600 ring-accent-500/30" : undefined}>
                    {s.plan === "premium" ? "有料" : "基本"}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-center font-semibold text-navy-900">{applications.filter((a) => a.seekerId === s.id).length}</td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDate(s.joinedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
