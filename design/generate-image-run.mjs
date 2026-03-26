import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, ".playwright-profile");
const OUTPUT_DIR = path.join(__dirname, "generated");

const PROMPTS = [
  {
    name: "can-pink-v2",
    text: `Generate a ultra-realistic product photo of a premium matcha tin canister. Cha Cha Matcha / Aesop aesthetic.

The tin:
- Cylindrical matte tin, 8cm diameter x 9cm tall
- Soft cherry blossom pink (#F2C4C4) matte body
- Minimal gold lid with subtle sheen
- "COCO" in large, elegant sans-serif (like Futura or Helvetica Neue Light) in dark forest green (#2D6A4F), centered on the front
- "抹茶" in smaller matching font directly below "COCO"
- Nothing else on the tin — no taglines, no weight, no extra text. Ultra minimal.

Scene:
- Sitting on a white marble shelf in a bright, airy modern apartment
- Soft golden hour light from a window on the left
- Very shallow depth of field, creamy bokeh background
- A few scattered cherry blossom petals nearby
- The tin looks like a piece of home decor, not just a product
- Photography style: editorial lifestyle, like Kinfolk or Cereal magazine
- Square 1:1 aspect ratio`,
  },
  {
    name: "can-green-v2",
    text: `Generate a ultra-realistic product photo of a premium matcha tin canister. Cha Cha Matcha / Aesop aesthetic.

The tin:
- Cylindrical matte tin, 8cm diameter x 9cm tall
- Deep, rich matcha green (#2D6A4F) matte body — like Burberry's signature green, luxurious and urban
- Matte black lid
- "COCO" in large, elegant sans-serif (like Futura or Helvetica Neue Light) in soft pink (#F2C4C4), centered on the front
- "抹茶" in smaller matching font directly below "COCO"
- Nothing else on the tin — no taglines, no weight, no extra text. Ultra minimal.

Scene:
- Sitting on a dark walnut wood shelf next to a small ceramic vase
- Moody, warm directional lighting from the side
- Very shallow depth of field
- The tin looks like a luxury object you'd find in a design store
- Photography style: editorial lifestyle, like Kinfolk or Cereal magazine
- Square 1:1 aspect ratio`,
  },
  {
    name: "can-monochrome-v2",
    text: `Generate a ultra-realistic product photo of a premium matcha tin canister. Cha Cha Matcha / Aesop aesthetic.

The tin:
- Cylindrical matte tin, 8cm diameter x 9cm tall
- Clean matte white body
- Jet black satin-finish lid
- A single thin line of matcha green (#2D6A4F) where the lid meets the body
- "COCO" in large, elegant sans-serif (like Futura or Helvetica Neue Light) in matte black, centered on the front
- "抹茶" in smaller matching font directly below "COCO"
- Nothing else on the tin — no taglines, no weight, no extra text. Ultra minimal.

Scene:
- Sitting on a light concrete or light grey stone surface near a window
- Bright, clean natural light, soft shadows
- Very shallow depth of field
- A single green leaf or small plant nearby for a pop of color
- The tin looks architectural, like a gallery object
- Photography style: editorial lifestyle, like Kinfolk or Cereal magazine
- Square 1:1 aspect ratio`,
  },
  {
    name: "collection-3cans-v2",
    text: `Generate a ultra-realistic product photo showing THREE premium matcha tin canisters arranged together as a beautiful collection. Cha Cha Matcha / Aesop aesthetic.

The three tins (all same size: 8cm diameter x 9cm tall, matte finish):
1. LEFT: Soft cherry blossom pink (#F2C4C4) body with gold lid, "COCO 抹茶" in dark green
2. CENTER: Deep matcha green (#2D6A4F) body with black lid, "COCO 抹茶" in soft pink
3. RIGHT: Matte white body with black lid and a thin green accent line, "COCO 抹茶" in black

All three tins use the same elegant sans-serif font (Futura / Helvetica Neue Light). Ultra minimal — no extra text, no taglines.

Scene:
- The three tins are arranged in a slight triangle formation on a white marble countertop
- They look like a curated collection — like luxury skincare products on a bathroom shelf
- Soft, warm natural light from the left side
- Very shallow depth of field with creamy bokeh
- A small bamboo whisk (chasen) and a few matcha powder specks scattered artfully nearby
- The image should make someone think "I want all three on my shelf"
- Photography style: editorial lifestyle, Kinfolk / Cereal magazine / Aesop store display
- Square 1:1 aspect ratio`,
  },
];

async function waitForLogin(page) {
  console.log("\n========================================");
  console.log("Geminiのログイン画面が表示されています。");
  console.log("ブラウザでログインしてください。");
  console.log("========================================\n");
  await page.waitForURL(/gemini\.google\.com\/app/, { timeout: 300000 });
  await page.waitForTimeout(3000);
  console.log("ログイン確認！\n");
}

async function generateImage(page, prompt, index) {
  console.log(`\n[${index + 1}/${PROMPTS.length}] "${prompt.name}" を生成中...`);

  if (index > 0) {
    await page.waitForTimeout(2000);
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
  }

  // 入力欄を探す
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
    console.log("  入力欄が見つかりません。デバッグスクリーンショットを保存...");
    await page.screenshot({ path: path.join(OUTPUT_DIR, `debug-${prompt.name}.png`) });
    return;
  }

  await inputEl.click();
  await page.waitForTimeout(500);
  try { await inputEl.fill(prompt.text); }
  catch { await inputEl.pressSequentially(prompt.text, { delay: 5 }); }
  await page.waitForTimeout(1000);

  // 送信
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

  // 画像を待つ
  try {
    await page.waitForTimeout(8000);

    const broadSelector = 'img[src*="blob:"], img[src*="data:image"], img[src*="lh3.googleusercontent"], img[src*="gstatic"]';
    const imageLocator = page.locator(broadSelector).first();
    await imageLocator.waitFor({ state: "visible", timeout: 180000 });
    await page.waitForTimeout(10000);

    // 全imgタグからサイズでフィルタリング
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
      const src = await bestImg.getAttribute("src");
      console.log(`  最大画像を検出 (${Math.round(bestSize)}px²)`);
      if (src) {
        const filePath = path.join(OUTPUT_DIR, `${prompt.name}.png`);
        if (src.startsWith("data:image")) {
          fs.writeFileSync(filePath, Buffer.from(src.split(",")[1], "base64"));
        } else {
          const resp = await page.request.get(src);
          fs.writeFileSync(filePath, await resp.body());
        }
        console.log(`  画像保存: ${filePath}`);
      }
    } else {
      console.log("  適切なサイズの画像が見つかりませんでした");
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, `screenshot-${prompt.name}.png`) });
    console.log("  スクリーンショット保存完了");
  } catch (e) {
    console.log(`  画像の自動DLに失敗: ${e.message}`);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `screenshot-${prompt.name}.png`) });
    console.log("  フォールバック: スクリーンショットを保存");
  }
}

async function main() {
  console.log("Playwright ブラウザ起動中...");
  console.log(`プロファイル: ${USER_DATA_DIR}\n`);
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
  console.log("全4パターンの生成が完了しました！");
  console.log(`保存先: ${OUTPUT_DIR}`);
  console.log("========================================");
  console.log("\n10秒後にブラウザを閉じます...");
  await page.waitForTimeout(10000);
  await browser.close();
}

main().catch(e => { console.error("エラー:", e); process.exit(1); });
