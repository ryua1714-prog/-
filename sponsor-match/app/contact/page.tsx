import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "お問い合わせ" };

export default function ContactPage() {
  return (
    <>
      <PageHeader title="お問い合わせ" description="案件掲載のお申し込み、サービスに関するご質問はこちらからお送りください。" />
      <Suspense fallback={<div className="container-page py-10 text-sm text-slate-500">読み込み中...</div>}>
        <ContactForm />
      </Suspense>
    </>
  );
}
