"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useState, type FormEvent } from "react";
import { ClipboardList, ExternalLink, Plus, Save, UserRound, X } from "lucide-react";
import type { Category, SeekerProfile } from "@/types";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/toast";
import { CATEGORIES, CATEGORY_LABEL, RETURN_PRESETS } from "@/lib/constants";
import { formatDateTime, formatYen } from "@/lib/utils";
import { ApplicationStatusBadge, Badge, Button, ButtonLink, Card, CategoryBadge, Input, Label, Required, Select, Textarea } from "@/components/ui";
import { Tabs } from "@/components/tabs";

type TabKey = "profile" | "history";

export function MyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: TabKey = searchParams.get("tab") === "history" ? "history" : "profile";
  const { currentSeeker, applications, hydrated } = useStore();

  const myApps = applications.filter((a) => a.seekerId === currentSeeker.id);

  const setTab = (t: TabKey) => router.replace(t === "profile" ? pathname : `${pathname}?tab=${t}`, { scroll: false });

  return (
    <div className="bg-navy-50/50 pb-16">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page flex flex-col gap-4 py-8 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
            {currentSeeker.name.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-500">募集側マイページ</p>
            <h1 className="mt-1 truncate text-xl font-bold text-navy-900 sm:text-2xl">{currentSeeker.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CategoryBadge category={currentSeeker.category} />
              <Badge className={currentSeeker.plan === "premium" ? "bg-accent-500/10 text-accent-600 ring-accent-500/30" : undefined}>
                {currentSeeker.plan === "premium" ? "有料プラン" : "基本プラン"}
              </Badge>
              <span className="text-xs text-slate-500">{currentSeeker.region}</span>
            </div>
          </div>
          <ButtonLink href="/projects" variant="outline">
            案件を探す
          </ButtonLink>
        </div>
        <div className="container-page">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { key: "profile", label: "プロフィール設定", icon: UserRound },
              { key: "history", label: "応募履歴", icon: ClipboardList, count: myApps.length },
            ]}
            className="border-b-0"
          />
        </div>
      </div>

      <div className="container-page py-8">
        {!hydrated ? (
          <p className="text-sm text-slate-500">読み込み中...</p>
        ) : tab === "profile" ? (
          <ProfileForm key={currentSeeker.id} />
        ) : (
          <History />
        )}
      </div>
    </div>
  );
}

/* ───────── プロフィール設定 ───────── */
function ProfileForm() {
  const { currentSeeker, updateSeeker } = useStore();
  const toast = useToast();
  const [form, setForm] = useState<SeekerProfile>(currentSeeker);
  const [customReturn, setCustomReturn] = useState("");

  useEffect(() => setForm(currentSeeker), [currentSeeker]);

  const set = <K extends keyof SeekerProfile>(k: K, v: SeekerProfile[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setSns = (k: keyof SeekerProfile["snsLinks"], v: string) => setForm((f) => ({ ...f, snsLinks: { ...f.snsLinks, [k]: v } }));
  const toggleReturn = (r: string) =>
    set("offeredReturns", form.offeredReturns.includes(r) ? form.offeredReturns.filter((x) => x !== r) : [...form.offeredReturns, r]);

  const allReturns = Array.from(new Set([...RETURN_PRESETS, ...form.offeredReturns]));

  const addCustom = () => {
    const v = customReturn.trim();
    if (!v) return;
    if (!form.offeredReturns.includes(v)) set("offeredReturns", [...form.offeredReturns, v]);
    setCustomReturn("");
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast("選手・団体名を入力してください", "info");
      return;
    }
    updateSeeker({ ...form, name: form.name.trim() });
    toast("プロフィールを保存しました（ブラウザに保存されます）");
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <Card>
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-navy-900">基本情報</h2>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">
              選手・団体名
              <Required />
            </Label>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="category">カテゴリー</Label>
            <Select id="category" value={form.category} onChange={(e) => set("category", e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="region">活動地域</Label>
            <Input id="region" value={form.region} onChange={(e) => set("region", e.target.value)} placeholder="例：神奈川県" />
          </div>
          <div>
            <Label htmlFor="email">連絡先メールアドレス</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="scale">規模（部員数・フォロワー数）</Label>
            <Input id="scale" value={form.scale} onChange={(e) => set("scale", e.target.value)} placeholder="例：選手28名／SNS総フォロワー1.2万人" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-navy-900">活動内容・実績</h2>
        </div>
        <div className="grid gap-5 p-6">
          <div>
            <Label htmlFor="activity">活動内容</Label>
            <Textarea id="activity" value={form.activityDetails} onChange={(e) => set("activityDetails", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="achievements">活動実績</Label>
            <Textarea id="achievements" className="min-h-[90px]" value={form.achievements} onChange={(e) => set("achievements", e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-navy-900">SNS・Webサイト</h2>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          {(
            [
              ["x", "X（旧Twitter）"],
              ["instagram", "Instagram"],
              ["youtube", "YouTube"],
              ["website", "公式サイト"],
            ] as const
          ).map(([k, label]) => (
            <div key={k}>
              <Label htmlFor={`sns-${k}`}>{label}</Label>
              <Input id={`sns-${k}`} type="url" placeholder="https://" value={form.snsLinks[k] ?? ""} onChange={(e) => setSns(k, e.target.value)} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-navy-900">協賛条件</h2>
        </div>
        <div className="grid gap-5 p-6">
          <div className="max-w-md">
            <Label htmlFor="budget">希望協賛額</Label>
            <Input id="budget" value={form.desiredBudget} onChange={(e) => set("desiredBudget", e.target.value)} placeholder="例：年間100万円〜200万円" />
          </div>
          <div>
            <Label>提供できる見返り（応募フォームに初期入力されます）</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {allReturns.map((r) => (
                <label
                  key={r}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-sm ${
                    form.offeredReturns.includes(r) ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input type="checkbox" checked={form.offeredReturns.includes(r)} onChange={() => toggleReturn(r)} className="h-4 w-4 accent-brand-600" />
                  <span className="flex-1 text-navy-800">{r}</span>
                  {!RETURN_PRESETS.includes(r) && (
                    <button type="button" onClick={(e) => { e.preventDefault(); set("offeredReturns", form.offeredReturns.filter((x) => x !== r)); }} aria-label="削除" className="text-slate-400 hover:text-accent-500">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </label>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                value={customReturn}
                onChange={(e) => setCustomReturn(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="独自の見返りを追加（例：ホームゲームでの始球式）"
              />
              <Button type="button" variant="outline" onClick={addCustom}>
                <Plus className="h-4 w-4" />
                追加
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button type="button" variant="outline" onClick={() => setForm(currentSeeker)}>
          変更を破棄
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4" />
          プロフィールを保存
        </Button>
      </div>
    </form>
  );
}

/* ───────── 応募履歴 ───────── */
function History() {
  const { applications, currentSeeker, getProject } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);

  const myApps = useMemo(
    () => applications.filter((a) => a.seekerId === currentSeeker.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [applications, currentSeeker.id],
  );

  const counts = {
    total: myApps.length,
    reviewing: myApps.filter((a) => a.status === "pending" || a.status === "reviewing").length,
    accepted: myApps.filter((a) => a.status === "accepted").length,
    rejected: myApps.filter((a) => a.status === "rejected").length,
  };

  if (myApps.length === 0) {
    return (
      <Card className="py-16 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 font-semibold text-navy-800">まだ応募履歴はありません</p>
        <ButtonLink href="/projects" className="mt-5">
          スポンサー案件を探す
        </ButtonLink>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "応募総数", value: counts.total, tone: "text-navy-900" },
          { label: "選考中", value: counts.reviewing, tone: "text-sky-600" },
          { label: "面談打診", value: counts.accepted, tone: "text-brand-600" },
          { label: "見送り", value: counts.rejected, tone: "text-slate-500" },
        ].map((s) => (
          <Card key={s.label} className="px-4 py-3">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.tone}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-navy-800 text-left text-xs text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">応募案件</th>
                <th className="px-4 py-3 font-semibold">応募日時</th>
                <th className="px-4 py-3 text-right font-semibold">希望金額</th>
                <th className="px-4 py-3 font-semibold">ステータス</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myApps.map((a) => {
                const p = getProject(a.projectId);
                const open = openId === a.id;
                return (
                  <Fragment key={a.id}>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        {p ? (
                          <Link href={`/projects/${p.id}`} className="font-semibold text-navy-900 hover:text-brand-600">
                            {p.title}
                          </Link>
                        ) : (
                          <span className="text-slate-400">削除された案件</span>
                        )}
                        <p className="mt-0.5 text-xs text-slate-500">
                          {p?.companyName} ・ {CATEGORY_LABEL[a.category]}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">{formatDateTime(a.createdAt)}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-navy-900">{formatYen(a.desiredAmount)}</td>
                      <td className="px-4 py-4">
                        <ApplicationStatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button onClick={() => setOpenId(open ? null : a.id)} className="text-xs font-semibold text-brand-600 hover:underline">
                          {open ? "閉じる" : "内容を見る"}
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr className="bg-navy-50/50">
                        <td colSpan={5} className="px-4 py-4">
                          <p className="text-xs font-bold text-navy-700">提案理由・自己PR</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-navy-800">{a.pitchMessage}</p>
                          <p className="mt-3 text-xs font-bold text-navy-700">提案した見返り</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {a.offeredReturns.map((r) => (
                              <Badge key={r}>{r}</Badge>
                            ))}
                          </div>
                          {p && (
                            <Link href={`/projects/${p.id}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                              案件詳細を開く <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-slate-500">
        ステータスの意味：「応募済み」企業未確認／「選考中」企業が確認中／「面談打診」企業から面談の打診あり／「見送り」今回は見送り
      </p>
    </div>
  );
}
