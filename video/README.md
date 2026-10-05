# 紹介動画（Remotion）

子育てタイプ診断の紹介動画です。どちらも 1920×1080・30fps・H.264。

- `promo.mp4` … 30秒版
- `promo-60s.mp4` … 60秒版（実際に回答している操作画面・タップ音・結果画面のスクロール入り）

## 作り直す

```sh
npm install
npm run render     # 30秒版を out/promo.mp4 に書き出す
npm run render:60  # 60秒版を out/promo-60s.mp4 に書き出す
npm run studio     # ブラウザでプレビュー・調整
```

診断ページの見た目や文章を変えたら、`npm run capture` で操作画面を撮り直してください（日本語フォント Noto Sans JP のインストールが必要）。撮影中は外部への通信をすべて遮断するので、スプレッドシートには何も送られません。

- `src/Promo.tsx` … 30秒版と各シーン（つかみ・ツール紹介・ポイント・8タイプ・レーダーチャート・締め）
- `src/Promo60.tsx` … 60秒版の構成
- `src/Demo.tsx` … スマホの中で実際に回答し、結果をスクロールするシーン
- `src/AnimatedText.tsx` … 文字を1文字ずつ跳ねさせるアニメーション
- `scripts/capture.mjs` … 診断ページ（`../index.html`）を操作して `public/capture/` に撮影
- `scripts/make-music.mjs` … 明るいBGM（120BPM・ハ長調・60秒）と効果音（タップ・スワイプ・チャイム）を合成
- `public/fonts/` … M PLUS Rounded 1c（SIL Open Font License 1.1）

Chromium の場所は `remotion.config.ts` で指定しています。別の環境では `REMOTION_BROWSER` を設定するか、その行を消してください。
