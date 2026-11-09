import { Suspense } from "react";
import type { Metadata } from "next";
import { MyPageContent } from "./mypage-content";

export const metadata: Metadata = { title: "マイページ" };

export default function MyPage() {
  return (
    <Suspense fallback={<div className="container-page py-10 text-sm text-slate-500">読み込み中...</div>}>
      <MyPageContent />
    </Suspense>
  );
}
