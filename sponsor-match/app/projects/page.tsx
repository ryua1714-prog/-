import { Suspense } from "react";
import type { Metadata } from "next";
import { ProjectSearch } from "./project-search";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "スポンサー案件を探す" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="スポンサー案件を探す"
        description="カテゴリー・地域・協賛金額から、あなたの活動に合ったスポンサー案件を見つけましょう。"
      />
      <Suspense fallback={<div className="container-page py-10 text-sm text-slate-500">読み込み中...</div>}>
        <ProjectSearch />
      </Suspense>
    </>
  );
}
