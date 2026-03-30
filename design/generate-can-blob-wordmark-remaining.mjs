import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, ".playwright-profile");
const OUTPUT_DIR = path.join(__dirname, "generated");

const SHARED = `
ABSOLUTELY CRITICAL — SHAPE:
This is a FLAT, SHALLOW, WIDE circular metal tin. Like a cosmetics compact.
- Diameter: 11-12cm (WIDE), Height: only 4-5cm (VERY SHORT — 1:3 ratio)
- Precision seam where lid meets body.
- DO NOT make this tall. Wide flat disc.

BRAND: "MATCHA&ME" — ultra-premium matcha lifestyle brand.
DESIGN STYLE: EKTA tea inspired — organic color blob bleeding into the base color like watercolor.
PHOTO: 4K, photorealistic, professional studio product photography. TOP-DOWN VIEW.

CRITICALLY IMPORTANT — TYPOGRAPHY ON THE LID:
The brand wordmark appears on the lid in TWO LINES, upper-left area:
  Line 1: "MATCHA"
  Line 2: "&ME"
- ALL CAPS letters
- Ultra-thin, hairline weight sans-serif font (like Outfit ExtraLight 200)
- Tight letter spacing — letters are close together
- Clean, modern, minimal — NOT bold, NOT medium weight. As THIN as possible.
- The "&" is full-size, same weight as the letters
- Small word "ceremonial" rotated 90° vertically on right edge, tiny
`;

const PROMPTS = [
  {
    name: "can-blob-white-lightgreen",
    text: `Photorealistic TOP-DOWN product shot of a luxury flat matcha tin on pure black background.

${SHARED}

BASE COLOR: Warm white / cream (#F5F0E8) — soft, warm, like washi paper.
BLOB COLOR: Sage green (#8AAE92) — soft, dusty celadon green.

The blob is organic, watercolor-like, bleeding into the cream. About 25-30% of lid surface, lower-right quadrant.

Typography color: dark green (#1B3A2C).

White + sage = the most minimal, refined variant. Whisper of matcha on paper.`,
  },
  {
    name: "can-blob-white-darkgreen",
    text: `Photorealistic TOP-DOWN product shot of a luxury flat matcha tin on pure black background.

${SHARED}

BASE COLOR: Warm white / cream (#F5F0E8) — soft, warm, like washi paper.
BLOB COLOR: Deep forest green (#1B4332) — dark, dramatic contrast against the light base.

The blob is organic, watercolor-like, bleeding into the cream. About 25-30% of lid surface, lower-right quadrant.

Typography color: dark green (#1B3A2C).

White + deep green = bold calligraphy ink on paper.`,
  },
  {
    name: "can-blob-silver-pink",
    text: `Photorealistic TOP-DOWN product shot of a luxury flat matcha tin on pure black background.

${SHARED}

BASE COLOR: Brushed silver / platinum — metallic, cool, luxurious.
BLOB COLOR: Sakura pink (#F2C4C4) — soft cherry blossom pink.

The blob is organic, watercolor-like, bleeding into the silver. About 25-30% of lid surface, lower-right quadrant.

Typography color: dark (#1A1A1A).

Silver + pink = modern luxury, jewelry-like.`,
  },
  {
    name: "can-blob-silver-salmon",
    text: `Photorealistic TOP-DOWN product shot of a luxury flat matcha tin on pure black background.

${SHARED}

BASE COLOR: Brushed silver / platinum — metallic, cool, luxurious.
BLOB COLOR: Salmon pink (#E8967D) — warm terracotta-salmon.

The blob is organic, watercolor-like, bleeding into the silver. About 25-30% of lid surface, lower-right quadrant.

Typography color: dark (#1A1A1A).

Silver + salmon = unexpected warmth on cool metal.`,
  },
  {
    name: "can-blob-silver-white",
    text: `Photorealistic TOP-DOWN product shot of a luxury flat matcha tin on pure black background.

${SHARED}

BASE COLOR: Brushed silver / platinum — metallic, cool, luxurious.
BLOB COLOR: Warm white / cream (#F5F0E8) — subtle, almost invisible on silver.

The blob is organic, watercolor-like, bleeding into the silver. About 25-30% of lid surface, lower-right quadrant.

Typography color: dark (#1A1A1A).

Silver + white = the most understated, pure luxury.`,
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

  if (index > 0) {
    await page.waitForTimeout(2000);
    try {
      const overlay = page.locator('.cdk-overlay-backdrop').first();
      if (await overlay.isVisible({ timeout: 1000 })) {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(1000);
      }
    } catch {}
    try {
      const newChatBtn = page.locator(
        'button[aria-label="New chat"], a[aria-label="New chat"], ' +
        'button:has-text("New chat"), button:has-text("新しいチャット")'
      ).first();
      await newChatBtn.click({ timeout: 5000 });
      await page.waitForTimeout(2000);
    } catch {
      await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);
    }
    try {
      const overlay = page.locator('.cdk-overlay-backdrop').first();
      if (await overlay.isVisible({ timeout: 1000 })) {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(1000);
      }
    } catch {}
  }

  // Try to navigate to fresh page first to avoid stale elements
  if (index === 0) {
    await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    try {
      const overlay = page.locator('.cdk-overlay-backdrop').first();
      if (await overlay.isVisible({ timeout: 1000 })) {
        await page.keyboard.press("Escape");
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
  console.log("========================================");
  console.log("Color Blob — Remaining 5 Variants");
  console.log("========================================\n");

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const page = browser.pages()[0] || await browser.newPage();
  await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const needsLogin = async () => {
    try {
      const loginBtn = page.locator('a:has-text("ログイン"), button:has-text("ログイン"), button:has-text("Sign in"), a:has-text("Sign in")').first();
      if (await loginBtn.isVisible({ timeout: 3000 })) return true;
    } catch {}
    try {
      const loginInput = page.locator('input[type="email"], input[type="password"]').first();
      if (await loginInput.isVisible({ timeout: 2000 })) return true;
    } catch {}
    return false;
  };

  if (await needsLogin()) {
    console.log("\nログインが必要です。ブラウザでログインしてください...\n");
    try {
      const loginBtn = page.locator('a:has-text("ログイン"), button:has-text("ログイン")').first();
      if (await loginBtn.isVisible({ timeout: 2000 })) await loginBtn.click();
    } catch {}
    await waitForLogin(page);
  } else {
    console.log("ログイン済み。続行。\n");
  }

  for (let i = 0; i < PROMPTS.length; i++) {
    await generateImage(page, PROMPTS[i], i);
    if (i < PROMPTS.length - 1) await page.waitForTimeout(3000);
  }

  console.log("\n========================================");
  console.log(`${PROMPTS.length} Variants 生成完了！`);
  console.log("========================================\n");
  console.log("10秒後にブラウザを閉じます...");
  await page.waitForTimeout(10000);
  await browser.close();
}

main().catch(e => { console.error("エラー:", e); process.exit(1); });
