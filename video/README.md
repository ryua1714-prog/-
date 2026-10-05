# 紹介動画（Remotion）

子育てタイプ診断の30秒紹介動画です。完成品は `promo.mp4`（1920×1080・30fps・H.264）。

## 作り直す

```sh
npm install
npm run render   # BGMを合成して out/promo.mp4 に書き出す
npm run studio   # ブラウザでプレビュー・調整
```

- `src/Promo.tsx` … シーン構成（つかみ → ツール紹介 → ポイント → 8タイプ → レーダーチャート → 締め）
- `src/AnimatedText.tsx` … 文字を1文字ずつ跳ねさせるアニメーション
- `scripts/make-music.mjs` … 明るいBGM（120BPM・ハ長調）をその場で合成
- `public/fonts/` … M PLUS Rounded 1c（SIL Open Font License 1.1）

Chromium の場所は `remotion.config.ts` で指定しています。別の環境では `REMOTION_BROWSER` を設定するか、その行を消してください。
