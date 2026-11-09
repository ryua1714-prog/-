import { ButtonLink } from "@/components/ui";

export function NotFoundProject() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="mt-4 text-xl font-bold text-navy-900">案件が見つかりませんでした</h1>
      <p className="mt-2 text-sm text-slate-500">削除されたか、URLが間違っている可能性があります。</p>
      <ButtonLink href="/projects" className="mt-6">
        案件一覧へ戻る
      </ButtonLink>
    </div>
  );
}

export function LoadingBlock() {
  return <div className="container-page py-24 text-center text-sm text-slate-500">読み込み中...</div>;
}
