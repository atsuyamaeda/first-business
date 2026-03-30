import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, ".playwright-profile");
const OUTPUT_DIR = path.join(__dirname, "generated");

const SHARED = `
CRITICAL — SHAPE OF EACH TIN:
Every tin is FLAT, SHALLOW, WIDE — 11-12cm diameter, only 4-5cm tall. Like a cosmetics compact. Ratio 1:3 height to diameter.
Brand: "matcha & me" — ultra-premium matcha lifestyle brand.
Each tin has "matcha & me" in small text and an organic watercolor-like color BLOB on the lid.
PHOTO: 4K, photorealistic, professional editorial product photography.
`;

const PROMPTS = [
  {
    name: "can-display-shelf",
    text: `Create a stunning photorealistic EDITORIAL product photograph of NINE luxury flat matcha tins displayed on a beautiful shelf or table.

${SHARED}

THE 9 TINS (3 rows of 3, or artfully arranged):
Row 1 — Sage green (#8AAE92) base:
  - Sage + soft pink blob (#F2C4C4)
  - Sage + salmon blob (#E8967D)
  - Sage + cream white blob (#F5F0E8)

Row 2 — Deep forest green (#1B4332) base:
  - Dark green + soft pink blob (#F2C4C4)
  - Dark green + salmon blob (#E8967D)
  - Dark green + cream white blob (#F5F0E8)

Row 3 — Brushed silver metallic base:
  - Silver + soft pink blob (#F2C4C4)
  - Silver + salmon blob (#E8967D)
  - Silver + cream white blob (#F5F0E8)

Each tin has a different organic watercolor blob in its accent color, positioned differently on each lid (some lower-right, some center-left, some upper area) so they all feel unique.

SETTING: A beautiful JAPANDI interior shelf display. Think a high-end concept store in Aoyama, Tokyo or Copenhagen.
- The tins are arranged on a natural oak wood floating shelf or console table
- The wall behind is warm off-white or light plaster
- Soft natural daylight from the left
- A few minimal props: a small ceramic vase with a single dried branch, a book with a linen cover
- The 9 tins are arranged in a visually pleasing layout — not a rigid grid, but a curated display with slight variations in spacing and angle. Some tins slightly overlapping. Like a shopkeeper arranged them with care.
- The overall image feels like an editorial spread in Kinfolk or Monocle magazine.

This is the BRAND COLLECTION SHOT — the image that goes on the website hero banner or in a press kit. It must feel aspirational, beautiful, and make someone want to own the entire collection.`,
  },
  {
    name: "can-display-marble",
    text: `Create a stunning photorealistic product photograph of NINE luxury flat matcha tins arranged on a large white marble surface, shot from DIRECTLY ABOVE (top-down).

${SHARED}

THE 9 TINS arranged in a perfect 3x3 GRID:
Top row (sage green #8AAE92 base): pink blob, salmon blob, white blob
Middle row (deep green #1B4332 base): pink blob, salmon blob, white blob
Bottom row (brushed silver base): pink blob, salmon blob, white blob

Each tin has "matcha & me" text and an organic watercolor blob in its accent color. The blobs are positioned slightly differently on each tin for variety.

ARRANGEMENT: Perfect 3x3 grid with exactly equal spacing (about 2-3cm between tins). All tins perfectly parallel. The geometric order of the grid contrasts beautifully with the organic blobs on each lid.

SURFACE: White Carrara marble with subtle grey veining. The marble texture adds richness without competing with the tins.

LIGHTING: Soft, even studio top-light. Each tin casts a tiny, precise shadow. Clean and clinical, like a luxury catalog or museum archive photo.

PROPS: None inside the grid. Outside the grid, bottom-right corner: a single bamboo chasen (matcha whisk) lying on its side. Top-left corner outside grid: a small pinch of vivid green matcha powder scattered on the marble.

This is the DEFINITIVE collection overview shot — orderly, complete, beautiful.`,
  },
  {
    name: "can-display-lifestyle",
    text: `Create a stunning photorealistic LIFESTYLE photograph showing multiple luxury flat matcha tins in a beautiful home setting.

${SHARED}

SCENE: A gorgeous modern kitchen / living space. Morning golden light streaming through large windows.

- On a light wood kitchen counter: 3-4 of the tins are casually placed — not perfectly arranged, but as if someone actually lives with them. One tin is open (showing green powder inside).
- Next to the tins: a handmade ceramic mug with bright green matcha latte (foam visible), a bamboo whisk on a ceramic holder.
- The tins visible are a MIX of the variants: one sage green with pink blob, one dark green with salmon blob, one silver with white blob.
- In the background: more tins visible on an open kitchen shelf, alongside cookbooks and ceramics. They're PART OF THE DECOR — not products on display, but objects that live in this kitchen.
- Other life details: a plant, a fruit bowl, a linen tea towel. This is a REAL home, not a showroom.
- The feeling: "This person collects them all. Each one is for a different mood or moment."

Mood: Warm, lived-in, aspirational. Like the home of a food editor or a design-conscious chef. Cereal magazine or Apartamento magazine aesthetic.

4K, lifestyle editorial, natural morning light, shallow depth of field.`,
  },
  {
    name: "can-display-dark",
    text: `Create a stunning photorealistic product photograph of NINE luxury flat matcha tins arranged dramatically on a dark surface.

${SHARED}

THE 9 TINS arranged in 3 rows of 3:
Row 1 (sage green base): pink blob, salmon blob, white blob
Row 2 (deep green base): pink blob, salmon blob, white blob
Row 3 (silver base): pink blob, salmon blob, white blob

SETTING: Dark, moody, dramatic.
- Surface: dark charcoal slate or black marble
- The tins are arranged in a slightly staggered formation — each row offset slightly, creating depth and dynamism
- Some tins are slightly tilted or leaning against each other at gentle angles
- Dramatic directional lighting from the upper left — creating strong highlights on the metal surfaces and deep shadows
- The blobs on each tin GLOW in the moody light — the pinks and salmons are warm spots of color in the darkness
- Background fades to pure black

This is the LUXURY / EDITORIAL version — like a Tom Ford beauty campaign or a high-end spirits advertisement. Dark, seductive, premium. The kind of image that belongs in Wallpaper* magazine or a gallery.

4K, dramatic studio lighting, luxury product photography.`,
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
  console.log("9-Can Display Shots (4 settings)");
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
    console.log("\nログインが必要です...\n");
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
  console.log("Display Shots 生成完了！");
  console.log("========================================\n");
  console.log("10秒後にブラウザを閉じます...");
  await page.waitForTimeout(10000);
  await browser.close();
}

main().catch(e => { console.error("エラー:", e); process.exit(1); });
