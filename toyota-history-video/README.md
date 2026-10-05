# トヨタの歴史 — 30秒縦型動画（Remotion）

1080×1920 / 30fps / 900フレーム（30秒）。黒×ゴールドのシックなトーンで、
織機の発明（1896）から全固体電池・Woven City Phase 2（〜2028）までを8章で構成。

- `src/data.ts` — 各章のテキスト（年・タイトル・本文・キーワード）
- `src/ToyotaHistory.tsx` — 演出（文字のブラー＆スタッガー表示、マスク表示、年号カウントアップ、トラッキング収束など）
- `public/fonts/` — Noto Serif JP / Cormorant Garamond（使用文字のみのサブセット）

```bash
npm install
npm run studio          # プレビュー
npm run fonts           # テキストを変更したらフォントを再サブセット
npm run render          # out/toyota-history.mp4 を書き出し
```
