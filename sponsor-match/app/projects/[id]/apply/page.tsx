"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CircleCheck, ClipboardList, Send } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/toast";
import { RETURN_PRESETS } from "@/lib/constants";
import { formatYen } from "@/lib/utils";
import { Button, ButtonLink, Card, CategoryBadge, InitialLogo, Input, Label, Required, Textarea } from "@/components/ui";
import { LoadingBlock, NotFoundProject } from "@/components/not-found-project";

interface FormState {
  applicantName: string;
  email: string;
  desiredAmount: string;
  pitchMessage: string;
  offeredReturns: string[];
  otherReturns: string;
  agree: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

const STEPS = ["応募内容の入力", "応募完了"];

export default function ApplyPage() {
  const { id } = useParams<{ id: string }>();
  const { getProject, hydrated, currentSeeker, addApplication } = useStore();
  const toast = useToast();
  const project = getProject(id);

  const [form, setForm] = useState<FormState>({
    applicantName: "",
    email: "",
    desiredAmount: "",
    pitchMessage: "",
    offeredReturns: [],
    otherReturns: "",
    agree: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  // プロフィール情報で初期入力
  useEffect(() => {
    if (!hydrated) return;
    setForm((f) => ({
      ...f,
      applicantName: f.applicantName || currentSeeker.name,
      email: f.email || currentSeeker.email,
      offeredReturns: f.offeredReturns.length ? f.offeredReturns : currentSeeker.offeredReturns,
    }));
  }, [hydrated, currentSeeker]);

  if (!project) return hydrated ? <NotFoundProject /> : <LoadingBlock />;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggleReturn = (r: string) =>
    set("offeredReturns", form.offeredReturns.includes(r) ? form.offeredReturns.filter((x) => x !== r) : [...form.offeredReturns, r]);

  const returnOptions = Array.from(new Set([...project.expectedReturns, ...RETURN_PRESETS]));

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.applicantName.trim()) e.applicantName = "申請者／団体名を入力してください";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "正しいメールアドレスを入力してください";
    const amount = Number(form.desiredAmount);
    if (!form.desiredAmount || !Number.isFinite(amount) || amount <= 0) e.desiredAmount = "希望協賛金額を半角数字で入力してください";
    if (form.pitchMessage.trim().length < 20) e.pitchMessage = "提案理由・自己PRを20文字以上で入力してください";
    if (form.offeredReturns.length === 0 && !form.otherReturns.trim()) e.offeredReturns = "提供可能な見返りを1つ以上選択または入力してください";
    if (!form.agree) e.agree = "利用規約への同意が必要です";
    return e;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast("入力内容に不備があります。赤字の項目をご確認ください。", "info");
      return;
    }
    const extra = form.otherReturns
      .split(/[\n、,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    addApplication({
      projectId: project.id,
      seekerId: currentSeeker.id,
      applicantName: form.applicantName.trim(),
      email: form.email.trim(),
      category: project.category,
      desiredAmount: Number(form.desiredAmount),
      pitchMessage: form.pitchMessage.trim(),
      offeredReturns: [...form.offeredReturns, ...extra],
    });
    toast("応募を送信しました。企業からの連絡をお待ちください。");
    setDone(true);
    window.scrollTo({ top: 0 });
  };

  const err = (k: keyof FormState) => errors[k] && <p className="mt-1 text-xs font-semibold text-accent-600">{errors[k]}</p>;

  return (
    <div className="bg-navy-50/50 pb-16">
      <div className="container-page max-w-3xl py-6">
        <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" />
          案件詳細に戻る
        </Link>

        <ol className="mt-5 flex items-center gap-2 text-xs font-semibold">
          {STEPS.map((s, i) => {
            const active = (done ? 1 : 0) >= i;
            return (
              <li key={s} className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${active ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                  {i + 1}
                </span>
                <span className={active ? "text-navy-900" : "text-slate-400"}>{s}</span>
                {i < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-slate-300" />}
              </li>
            );
          })}
        </ol>

        <Card className="mt-5 flex items-center gap-3 p-4">
          <InitialLogo text={project.companyLogo} color={project.logoColor} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CategoryBadge category={project.category} />
              <span className="text-xs text-slate-500">{project.companyName}</span>
            </div>
            <p className="mt-1 truncate text-sm font-bold text-navy-900">{project.title}</p>
          </div>
        </Card>

        {done ? (
          <Card className="mt-5 p-8 text-center">
            <CircleCheck className="mx-auto h-14 w-14 text-brand-600" />
            <h1 className="mt-4 text-2xl font-bold text-navy-900">応募が完了しました</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {project.companyName} へ応募内容を送信しました。
              <br />
              選考状況はマイページの「応募履歴」からご確認いただけます。
            </p>
            <dl className="mx-auto mt-6 max-w-sm divide-y divide-slate-100 rounded-md border border-slate-200 text-left text-sm">
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-slate-500">申請者</dt>
                <dd className="font-semibold text-navy-900">{form.applicantName}</dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-slate-500">希望協賛金額</dt>
                <dd className="font-semibold text-navy-900">{formatYen(Number(form.desiredAmount))}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/mypage?tab=history">
                <ClipboardList className="h-4 w-4" />
                応募履歴を見る
              </ButtonLink>
              <ButtonLink href="/projects" variant="outline">
                他の案件を探す
              </ButtonLink>
            </div>
          </Card>
        ) : (
          <form onSubmit={submit} noValidate>
            <Card className="mt-5 divide-y divide-slate-100">
              <div className="p-6">
                <h1 className="text-xl font-bold text-navy-900">応募フォーム</h1>
                <p className="mt-1 text-sm text-slate-500">マイページのプロフィール情報が初期入力されています。</p>
              </div>
              <div className="grid gap-5 p-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="applicantName">
                    申請者／団体名
                    <Required />
                  </Label>
                  <Input id="applicantName" value={form.applicantName} onChange={(e) => set("applicantName", e.target.value)} />
                  {err("applicantName")}
                </div>
                <div>
                  <Label htmlFor="email">
                    連絡先メールアドレス
                    <Required />
                  </Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                  {err("email")}
                </div>
                <div>
                  <Label htmlFor="desiredAmount">
                    希望協賛金額（円）
                    <Required />
                  </Label>
                  <div className="relative">
                    <Input
                      id="desiredAmount"
                      inputMode="numeric"
                      placeholder="例：500000"
                      value={form.desiredAmount}
                      onChange={(e) => set("desiredAmount", e.target.value.replace(/[^\d]/g, ""))}
                      className="pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">円</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    案件の目安：{project.budgetRange}
                    {form.desiredAmount && ` ／ 入力額：${formatYen(Number(form.desiredAmount))}`}
                  </p>
                  {err("desiredAmount")}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="pitch">
                    提案理由・自己PR
                    <Required />
                  </Label>
                  <Textarea
                    id="pitch"
                    rows={6}
                    placeholder="活動内容、この案件に応募した理由、協賛金の使い道などをご記入ください。"
                    value={form.pitchMessage}
                    onChange={(e) => set("pitchMessage", e.target.value)}
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">{form.pitchMessage.length} 文字</p>
                  {err("pitchMessage")}
                </div>
                <div className="sm:col-span-2">
                  <Label>
                    提供可能なリターン・見返り
                    <Required />
                  </Label>
                  <p className="mb-2 text-xs text-slate-500">
                    <span className="mr-1 rounded bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700">企業希望</span>
                    は、この案件で企業が求めている見返りです。
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {returnOptions.map((r) => {
                      const wanted = project.expectedReturns.includes(r);
                      return (
                        <label
                          key={r}
                          className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors ${
                            form.offeredReturns.includes(r) ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input type="checkbox" checked={form.offeredReturns.includes(r)} onChange={() => toggleReturn(r)} className="mt-0.5 h-4 w-4 accent-brand-600" />
                          <span className="flex-1 text-navy-800">
                            {r}
                            {wanted && <span className="ml-1.5 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">企業希望</span>}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <Textarea
                    className="mt-3 min-h-[80px]"
                    placeholder="その他の提案（自由記述・読点区切りで複数入力可）"
                    value={form.otherReturns}
                    onChange={(e) => set("otherReturns", e.target.value)}
                  />
                  {err("offeredReturns")}
                </div>
              </div>
              <div className="p-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-navy-800">
                  <input type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} className="h-4 w-4 accent-brand-600" />
                  利用規約および個人情報の取り扱いに同意する
                </label>
                {err("agree")}
                <Button type="submit" variant="accent" size="lg" className="mt-5 w-full">
                  <Send className="h-5 w-5" />
                  この内容で応募する
                </Button>
              </div>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}
