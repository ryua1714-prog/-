import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-5xl font-bold text-navy-200">404</p>
      <h1 className="mt-4 text-xl font-bold text-navy-900">ページが見つかりませんでした</h1>
      <p className="mt-2 text-sm text-slate-500">URLが間違っているか、ページが移動・削除された可能性があります。</p>
      <ButtonLink href="/" className="mt-6">
        トップページへ戻る
      </ButtonLink>
    </div>
  );
}
