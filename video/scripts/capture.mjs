// 実際の診断ページ（../index.html）をスマホ幅で操作して、動画用の画面を撮影する。
// 外部への通信（結果の保存など）はすべて遮断するので、本番のデータには何も送られない。
// 日本語フォントとして Noto Sans JP がインストールされている必要がある。
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const out = fileURLToPath(new URL("../public/capture/", import.meta.url));
const page_url = pathToFileURL(fileURLToPath(new URL("../../index.html", import.meta.url))).href;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  colorScheme: "light",
  isMobile: true,
  hasTouch: true,
});
await context.route("**/*", (route) => (route.request().url().startsWith("file:") ? route.continue() : route.abort()));
const page = await context.newPage();
await page.goto(page_url);
await page.evaluate(() => document.fonts.ready);
// 撮影中は画面のアニメーションを止める
await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });

const meta = {};
const rect = (sel) => page.locator(sel).first().evaluate((el) => {
  const r = el.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
const shot = (name, fullPage = false) => page.screenshot({ path: `${out}${name}.png`, fullPage });

// スタート画面
await shot("start");
meta.startButton = await rect("#btn-start");

// 質問画面：最初の4問は選ぶ前と選んだ後を撮る
const answers = [2, 1, 2, 0]; // 押す選択肢（0=かなりそう思う … 4=かなりそう思わない）
await page.evaluate(() => { renderQuestion(); state.current = 0; renderQuestion(); showScreen("screen-question"); });
meta.questions = [];
for (let i = 0; i < 4; i++) {
  await page.evaluate((i) => { state.current = i; renderQuestion(); }, i);
  await shot(`q${i + 1}`);
  const target = await rect(`#choices .choice:nth-child(${answers[i] + 1})`);
  await page.evaluate((n) => document.querySelectorAll("#choices .choice").forEach((b, k) => b.classList.toggle("selected", k === n)), answers[i]);
  await shot(`q${i + 1}-selected`);
  meta.questions.push(target);
}
// 早送り用に途中の質問を何枚か
const fast = [8, 15, 22, 29, 36, 43, 49];
const fastAnswers = [1, 0, 3, 1, 2, 0, 1];
meta.fast = [];
for (const [k, i] of fast.entries()) {
  await page.evaluate((i) => { state.current = i; renderQuestion(); }, i);
  const target = await rect(`#choices .choice:nth-child(${fastAnswers[k] + 1})`);
  await page.evaluate((n) => document.querySelectorAll("#choices .choice").forEach((b, j) => b.classList.toggle("selected", j === n)), fastAnswers[k]);
  await shot(`fast-${i + 1}`);
  meta.fast.push({ image: `fast-${i + 1}`, ...target });
}

// 結果画面：挑戦型になる回答を決まった乱数で探し、実際の判定ロジックで結果を出す
meta.resultType = await page.evaluate(() => {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let n = 0; n < 5000; n++) {
    const answers = QUESTIONS.map(() => 1 + Math.floor(rand() * 5));
    const result = diagnose(answers);
    if (result.type && result.type.key === "challenge" && !result.uniform.isUniform) {
      state.answers = answers;
      state.result = result;
      showResult(result.type);
      return result.type.label;
    }
  }
  throw new Error("挑戦型になる回答が見つかりませんでした");
});
await page.evaluate(() => window.scrollTo(0, 0));
// 結果画面は上から RESULT_HEIGHT 分だけ使う（タイプ・グラフ・解説の前半）
const RESULT_HEIGHT = 5200;
await page.screenshot({ path: `${out}result.png`, fullPage: true, clip: { x: 0, y: 0, width: 390, height: RESULT_HEIGHT } });
meta.resultHeight = RESULT_HEIGHT;

writeFileSync(`${out}meta.json`, JSON.stringify(meta, null, 2));
await browser.close();
console.log("public/capture/ に撮影しました");
