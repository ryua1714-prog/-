import Link from "next/link";
import { Logo } from "@/components/header";

const COLUMNS = [
  {
    title: "スポンサー案件を探す",
    links: [
      { href: "/projects?category=sports", label: "スポーツ（選手・チーム）" },
      { href: "/projects?category=community", label: "地域（祭り・地方創生）" },
      { href: "/projects?category=students", label: "学生（部活・サークル）" },
      { href: "/projects", label: "すべての案件" },
    ],
  },
  {
    title: "ご利用案内",
    links: [
      { href: "/pricing", label: "料金プラン" },
      { href: "/#flow", label: "ご利用の流れ" },
      { href: "/contact?tab=company", label: "案件掲載のお申し込み" },
      { href: "/contact", label: "お問い合わせ" },
    ],
  },
  {
    title: "会員メニュー",
    links: [
      { href: "/mypage", label: "マイページ" },
      { href: "/mypage?tab=history", label: "応募履歴" },
      { href: "/admin", label: "運営者管理画面" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-navy-950 text-navy-200">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-xs leading-relaxed text-navy-300">
            挑戦する人と、応援する企業をつなぐ
            <br />
            スポンサーマッチングプラットフォーム
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-sm font-bold text-white">{col.title}</p>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-navy-800">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-navy-400 sm:flex-row sm:justify-between">
          <p>© 2026 Sponsor Bridge（MVPデモ）</p>
          <p>掲載の企業・団体名はすべて架空のダミーデータです。</p>
        </div>
      </div>
    </footer>
  );
}
