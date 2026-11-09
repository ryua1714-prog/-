# スポンサーブリッジ（スポンサーマッチングプラットフォーム MVP）

挑戦する人（スポーツ・地域・学生）と、応援する企業をつなぐマッチングプラットフォームのMVPです。
Next.js (App Router) + TypeScript + Tailwind CSS + lucide-react で構築しています。

## 起動方法

```bash
cd sponsor-match
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます。本番ビルドの確認は `npm run build && npm start`。

## 画面一覧

| 画面 | URL |
| --- | --- |
| トップページ | `/` |
| スポンサー案件一覧・検索 | `/projects`（`?q=` `?category=sports|community|students` `?area=関東` に対応） |
| 案件詳細 | `/projects/p-001` 〜 `/projects/p-012` |
| 応募フォーム | `/projects/p-001/apply` |
| 募集側マイページ | `/mypage`（応募履歴は `/mypage?tab=history`） |
| 運営者管理画面 | `/admin` |
| 料金プラン | `/pricing` |
| お問い合わせ | `/contact`（企業向けは `/contact?tab=company`） |

## データについて

- 初期データは `lib/mock-data.ts`（企業・団体名はすべて架空）。
- 初回アクセス時にブラウザの localStorage（キー `sponsor-match:v1`）へ複製され、応募・プロフィール編集・案件の作成/編集/削除・ステータス変更はリロード後も保持されます。
- 管理画面左下の「デモデータを初期化」で初期状態に戻せます。
- マイページは会員 `s-001`（横浜ブルーウェーブス）でログインしている想定です。

## ディレクトリ構成

```
app/          各ページ（App Router）
components/   ヘッダー・フッター・案件カード・検索フィルター・UI部品・モーダル・トースト
lib/          モックデータ、localStorage ストア、定数、ユーティリティ
types/        型定義（SponsorProject / SeekerProfile / Application）
```
