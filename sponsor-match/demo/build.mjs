// 単一HTMLのデモ版を書き出す: node demo/build.mjs [出力先]
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(process.argv[2] ?? resolve(root, "demo/dist/sponsor-bridge.html"));
mkdirSync(dirname(out), { recursive: true });

const js = await build({
  entryPoints: [resolve(root, "demo/entry.tsx")],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  target: "es2019",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "next/link": resolve(root, "demo/shims/link.tsx"),
    "next/navigation": resolve(root, "demo/shims/navigation.tsx"),
  },
  tsconfig: resolve(root, "tsconfig.json"),
  external: ["*.css"],
  logLevel: "warning",
});

const css = execSync(
  `npx tailwindcss -c tailwind.config.ts -i app/globals.css --content "./app/**/*.tsx,./components/**/*.tsx,./lib/**/*.{ts,tsx},./demo/**/*.tsx" --minify`,
  { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
);

const extraCss = `:root{color-scheme:light}body{background:#fff;color:#12203d}header.sticky{top:env(safe-area-inset-top,0px)}`;
const code = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

const html = `<title>スポンサーブリッジ</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@500;700&display=swap">
<style>${css}${extraCss}</style>
<div id="root"></div>
<script>${code}</script>
`;
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
