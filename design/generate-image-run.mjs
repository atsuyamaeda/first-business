import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, ".playwright-profile");
const OUTPUT_DIR = path.join(__dirname, "generated");

const BG = `The logo is EMBOSSED (blind debossing, no ink) on thick matte white paper. Realistic 3D depth — the design is pressed INTO the paper. Soft shadows on the lower-right edges, subtle highlights on the upper-left edges. Shot with a macro lens with dramatic side lighting from the upper-left to reveal the depth of the embossing. The paper has a subtle cotton/linen texture visible at this close range. The entire image feels tactile and premium — you want to reach out and touch it. No color whatsoever — just white paper, shadow, and light. Large, centered, high resolution.`;

const PROMPTS = [
  {
    name: "logo-emboss-1",
    text: `A macro photograph of an embossed logo for "matcha & me", a premium Japanese matcha brand.

Design: "matcha & me" curves along the UPPER ARC of a single thin circle. The circle is complete (360 degrees). Text on the top 40%. The bottom 60% is just the thin circle line. Inside the circle: empty.

Typography: Thin high-contrast serif (Didot or Bodoni). All lowercase. The "&" is italic and slightly more ornate. Wide, even letter-spacing.

${BG}`,
  },
  {
    name: "logo-emboss-2",
    text: `A macro photograph of an embossed logo for "matcha & me", a premium Japanese matcha brand.

Design: A thin circle. "matcha" curves along the TOP arc. "& me" curves along the BOTTOM arc (reading left-to-right, not upside down). Two tiny dots (·) on the left and right sides separate the phrases. Nothing inside the circle.

Typography: Thin geometric sans-serif (Futura Light). All lowercase. Very wide letter-spacing. The "&" is the only character in a contrasting italic serif.

${BG}`,
  },
  {
    name: "logo-emboss-3",
    text: `A macro photograph of an embossed logo for "matcha & me", a premium Japanese matcha brand.

Design: "matcha" curves along the top arc of a thin circle. "me" curves along the bottom arc. In the CENTER of the circle, a large elegant calligraphic "&" — the brand's icon. The "&" is the hero of the composition.

Typography: Thin serif for "matcha" and "me". The central "&" is ornate italic serif, about 3x the size of the other text. All lowercase.

${BG}`,
  },
  {
    name: "logo-emboss-4",
    text: `A macro photograph of an embossed logo for "matcha & me", a premium Japanese matcha brand.

Design: "matcha & me" in a straight horizontal line. No circle, no arc — just the text, embossed into paper. Ultra-simple. The power comes entirely from the embossing quality and the typography.

Typography: Thin modern serif. All lowercase. The "&" is in italic, slightly different from the rest. Perfect letter-spacing — each character meticulously kerned.

${BG}`,
  },
  {
    name: "logo-emboss-5",
    text: `A macro photograph of an embossed logo for "matcha & me", a premium Japanese matcha brand.

Design: A thin circle with "matcha & me" curving along the top arc. Inside the circle at the bottom, a single tiny tea leaf silhouette — simple, geometric, minimal. Just the circle, the curved text, and one small leaf. That's the entire logo.

Typography: High-contrast serif (Bodoni). Lowercase. The "&" is italic. Wide tracking.

${BG}`,
  },
  {
    name: "logo-emboss-6",
    text: `A macro photograph of an embossed logo for "matcha & me", a premium Japanese matcha brand.

Design: Two concentric thin circles (like a tin lid). "matcha & me" curves along the top arc, between the two circles (in the ring-shaped space between inner and outer circles). The inner circle is empty. The effect is like a wax seal or luxury emblem.

Typography: ALL CAPS. Thin elegant serif with wide letter-spacing. The "&" is smaller and in italic. Classic, timeless, institutional.

${BG}`,
  },
];

async function waitForLogin(page) {
  console.log("\nGeminiにログインしてください...");
  await page.waitForURL(/gemini\.google\.com\/app/, { timeout: 300000 });
  await page.waitForTimeout(3000);
  console.log("ログイン確認！\n");
}

async function generateImage(page, prompt, index) {
  console.log(`\n[${index + 1}/${PROMPTS.length}] "${prompt.name}" を生成中...`);

  // Dismiss any overlay dialogs
  try {
    const overlay = page.locator('.cdk-overlay-backdrop');
    if (await overlay.isVisible({ timeout: 1000 })) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  } catch {}

  if (index > 0) {
    await page.waitForTimeout(3000);
    await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);
    // Dismiss any overlay again
    try {
      const overlay = page.locator('.cdk-overlay-backdrop');
      if (await overlay.isVisible({ timeout: 1000 })) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    } catch {}
  }

  const inputSelectors = [
    'div[contenteditable="true"]',
    'rich-textarea div[contenteditable="true"]',
    '.ql-editor', 'textarea',
    '[aria-label*="prompt"]', '[aria-label*="メッセージ"]',
  ];
  let inputEl = null;
  for (const sel of inputSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 3000 })) { inputEl = el; break; }
    } catch { continue; }
  }
  if (!inputEl) {
    console.log("  入力欄が見つかりません");
    await page.screenshot({ path: path.join(OUTPUT_DIR, `debug-${prompt.name}.png`) });
    return;
  }

  await inputEl.click();
  await page.waitForTimeout(500);
  try { await inputEl.fill(prompt.text); }
  catch { await inputEl.pressSequentially(prompt.text, { delay: 5 }); }
  await page.waitForTimeout(1000);

  const sendSelectors = [
    'button[aria-label="Send message"]', 'button[aria-label="メッセージを送信"]',
    'button[aria-label*="Send"]', 'button[aria-label*="送信"]',
  ];
  let sent = false;
  for (const sel of sendSelectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 2000 })) { await btn.click(); sent = true; break; }
    } catch { continue; }
  }
  if (!sent) await page.keyboard.press("Enter");
  console.log("  プロンプト送信完了。画像生成を待機中...");

  try {
    await page.waitForTimeout(8000);
    const broadSelector = 'img[src*="blob:"], img[src*="data:image"], img[src*="lh3.googleusercontent"], img[src*="gstatic"]';
    const imageLocator = page.locator(broadSelector).first();
    await imageLocator.waitFor({ state: "visible", timeout: 180000 });
    await page.waitForTimeout(10000);

    const allImages = await page.locator('img').all();
    let bestImg = null;
    let bestSize = 0;
    for (const img of allImages) {
      try {
        const box = await img.boundingBox();
        if (!box) continue;
        const area = box.width * box.height;
        if (area > 10000 && area > bestSize) {
          const src = await img.getAttribute("src");
          if (src && !src.includes("googleusercontent.com/a/")) {
            bestSize = area;
            bestImg = img;
          }
        }
      } catch { continue; }
    }

    if (bestImg) {
      console.log(`  最大画像を検出 (${Math.round(bestSize)}px²)`);
      const filePath = path.join(OUTPUT_DIR, `${prompt.name}.png`);
      await bestImg.screenshot({ path: filePath });
      console.log(`  画像保存: ${filePath}`);
    } else {
      console.log("  適切なサイズの画像が見つかりませんでした");
    }
    await page.screenshot({ path: path.join(OUTPUT_DIR, `screenshot-${prompt.name}.png`) });
    console.log("  スクリーンショット保存完了");
  } catch (e) {
    console.log(`  画像DL失敗: ${e.message}`);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `screenshot-${prompt.name}.png`) });
    console.log("  フォールバック: スクリーンショット保存");
  }
}

async function main() {
  console.log("Playwright ブラウザ起動中...\n");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const page = browser.pages()[0] || await browser.newPage();
  await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const url = page.url();
  if (!url.includes("gemini.google.com/app")) {
    await waitForLogin(page);
  } else {
    try {
      const login = page.locator('input[type="email"], input[type="password"]').first();
      if (await login.isVisible({ timeout: 3000 })) await waitForLogin(page);
      else console.log("ログイン済み。続行。\n");
    } catch { console.log("ログイン済み。続行。\n"); }
  }

  for (let i = 0; i < PROMPTS.length; i++) {
    await generateImage(page, PROMPTS[i], i);
    if (i < PROMPTS.length - 1) await page.waitForTimeout(3000);
  }

  console.log("\n========================================");
  console.log("生成完了！");
  console.log(`保存先: ${OUTPUT_DIR}`);
  console.log("========================================");
  console.log("\n10秒後にブラウザを閉じます...");
  await page.waitForTimeout(10000);
  await browser.close();
}

main().catch(e => { console.error("エラー:", e); process.exit(1); });
