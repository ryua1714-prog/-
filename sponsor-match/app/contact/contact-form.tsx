"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Building2, CircleCheck, Mail, Send } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { useToast } from "@/components/toast";
import { Tabs } from "@/components/tabs";
import { Button, Card, Input, Label, Required, Select, Textarea } from "@/components/ui";

type TabKey = "company" | "general";

export function ContactForm() {
  const searchParams = useSearchParams();
  const initialTab: TabKey = searchParams.get("tab") === "company" ? "company" : "general";
  // URLの tab パラメータが変わったら（フッター等からの遷移）フォームを初期化
  return <ContactFormInner key={initialTab} initialTab={initialTab} />;
}

function ContactFormInner({ initialTab }: { initialTab: TabKey }) {
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [sent, setSent] = useState<TabKey | null>(null);
  const [error, setError] = useState("");
  const toast = useToast();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setError("必須項目をすべて正しく入力してください。");
      form.reportValidity();
      return;
    }
    setError("");
    setSent(tab);
    toast("お問い合わせを送信しました（デモのため実際には送信されません）");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="container-page max-w-3xl py-10">
      <Tabs
        value={tab}
        onChange={(t) => {
          setTab(t);
          setSent(null);
          setError("");
        }}
        items={[
          { key: "company", label: "企業向け：案件掲載申し込み", icon: Building2 },
          { key: "general", label: "一般お問い合わせ", icon: Mail },
        ]}
      />

      {sent === tab ? (
        <Card className="mt-6 p-10 text-center">
          <CircleCheck className="mx-auto h-14 w-14 text-brand-600" />
          <h2 className="mt-4 text-xl font-bold text-navy-900">送信が完了しました</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {sent === "company"
              ? "案件掲載のお申し込みありがとうございます。2営業日以内に担当者よりヒアリング日程のご連絡を差し上げます。"
              : "お問い合わせありがとうございます。内容を確認のうえ、3営業日以内にご返信いたします。"}
          </p>
          <p className="mt-2 text-xs text-slate-400">※MVPデモのため、実際にはメールは送信されません。</p>
          <Button variant="outline" className="mt-6" onClick={() => setSent(null)}>
            続けて入力する
          </Button>
        </Card>
      ) : (
        <form key={tab} onSubmit={submit} noValidate>
          <Card className="mt-6 p-6">
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              {tab === "company"
                ? "スポンサー案件の掲載をご希望の企業様は、以下のフォームからお申し込みください。担当者がヒアリングのうえ、案件ページを制作いたします。"
                : "サービス内容、ご利用方法、料金などに関するご質問はこちらからお問い合わせください。"}
            </p>
            {error && <p className="mb-4 rounded-md bg-accent-50 px-3 py-2 text-sm font-semibold text-accent-600">{error}</p>}
            <div className="grid gap-5 sm:grid-cols-2">
              {tab === "company" ? (
                <>
                  <div className="sm:col-span-2">
                    <Label htmlFor="c-company">
                      会社名
                      <Required />
                    </Label>
                    <Input id="c-company" name="company" required placeholder="例：株式会社サンプル" />
                  </div>
                  <div>
                    <Label htmlFor="c-dept">部署名</Label>
                    <Input id="c-dept" name="dept" placeholder="例：広報部" />
                  </div>
                  <div>
                    <Label htmlFor="c-name">
                      ご担当者名
                      <Required />
                    </Label>
                    <Input id="c-name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="c-email">
                      メールアドレス
                      <Required />
                    </Label>
                    <Input id="c-email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="c-tel">電話番号</Label>
                    <Input id="c-tel" name="tel" type="tel" placeholder="03-1234-5678" />
                  </div>
                  <div>
                    <Label htmlFor="c-category">支援したいカテゴリー</Label>
                    <Select id="c-category" name="category" defaultValue="">
                      <option value="">未定・相談したい</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="c-budget">想定予算</Label>
                    <Select id="c-budget" name="budget" defaultValue="">
                      <option value="">未定</option>
                      <option>〜30万円</option>
                      <option>30万円〜100万円</option>
                      <option>100万円〜300万円</option>
                      <option>300万円以上</option>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="c-body">
                      協賛の目的・ご要望
                      <Required />
                    </Label>
                    <Textarea id="c-body" name="body" required placeholder="例：地域のスポーツチームを応援し、ブランド認知を高めたい" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="g-name">
                      お名前
                      <Required />
                    </Label>
                    <Input id="g-name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="g-email">
                      メールアドレス
                      <Required />
                    </Label>
                    <Input id="g-email" name="email" type="email" required />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="g-type">お問い合わせ種別</Label>
                    <Select id="g-type" name="type" defaultValue="service">
                      <option value="service">サービス内容について</option>
                      <option value="price">料金・お支払いについて</option>
                      <option value="account">会員登録・アカウントについて</option>
                      <option value="other">その他</option>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="g-body">
                      お問い合わせ内容
                      <Required />
                    </Label>
                    <Textarea id="g-body" name="body" required />
                  </div>
                </>
              )}
              <label className="flex items-center gap-2 text-sm text-navy-800 sm:col-span-2">
                <input type="checkbox" name="agree" required className="h-4 w-4 accent-brand-600" />
                個人情報の取り扱いに同意する
                <Required />
              </label>
            </div>
            <Button type="submit" size="lg" className="mt-6 w-full">
              <Send className="h-5 w-5" />
              {tab === "company" ? "掲載を申し込む" : "送信する"}
            </Button>
          </Card>
        </form>
      )}
    </div>
  );
}
