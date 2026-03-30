import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, ".playwright-profile");
const OUTPUT_DIR = path.join(__dirname, "generated");

const CONTEXT = `
BRAND: "matcha & me" — ultra-premium matcha lifestyle brand.
TARGET: 25-50, urban, design-conscious. Culture brand, not commodity.
PRODUCT: flat luxury matcha tins with organic watercolor color blobs (EKTA tea inspired).
BRAND COLORS: sage green (#8AAE92), deep forest green (#1B4332), sakura pink (#F2C4C4), salmon (#E8967D), cream white (#F5F0E8).
DESIGN PHILOSOPHY: "What to remove, not what to add." Extreme minimalism. Aesop, Byredo, Le Labo level refinement.
REFERENCES: Kettl Tea, EKTA tea, một matcha, Apothékary, Glossier.
KEY BRAND IDEA: 800-year Japanese tradition reimagined as modern culture brand. "matcha & me" = the intimate daily ritual between you and your matcha.

LOGO REQUIREMENTS:
- Must work on ALL the can variants (sage green, deep green, pink, salmon, white, silver backgrounds)
- Must be SMALL on the can lid — the logo is NOT the hero, the color blob is. The logo is quiet, confident, understated.
- Must work at very small sizes (10-15mm on the tin) AND at larger sizes (website, packaging)
- Must feel CONTEMPORARY, not traditional Japanese
- All lowercase for brand name
- The "&" is the soul of the brand — it connects "matcha" with "me" (the personal ritual)

OUTPUT: Logo on a plain white background. Clean vector-style rendering. NO mockups, NO textures, NO shadows. Just the logo, large, centered, on pure white (#FFFFFF).
`;

const PROMPTS = [
  // === A: Pure Typography — Stacked ===
  {
    name: "logo-v2-stacked",
    text: `Design a luxury logo for "matcha & me" on plain white background.

${CONTEXT}

CONCEPT: STACKED TYPOGRAPHY
- "matcha" on first line
- "&" on second line, centered, slightly larger and in a contrasting italic serif (like Cormorant Garamond italic or similar)
- "me" on third line
- All in deep green (#1B4332)
- Font for "matcha" and "me": ultra-thin geometric sans-serif (like Futura Light, Jost 200, or Century Gothic Light). ALL LOWERCASE.
- Very wide letter-spacing on "matcha" and "me"
- The "&" is the visual anchor — ornate, calligraphic, but refined. It's the ONLY decorative element.
- Vertically centered, balanced, breathing.
- Think: if Celine's logo designer made a tea brand.

Plain white background. Large, centered, high resolution.`,
  },

  // === B: Inline with Ampersand Accent ===
  {
    name: "logo-v2-inline",
    text: `Design a luxury logo for "matcha & me" on plain white background.

${CONTEXT}

CONCEPT: INLINE SINGLE LINE
- "matcha & me" all on one line, all lowercase
- Ultra-thin sans-serif font (like Helvetica Neue Ultralight or Aktiv Grotesk Thin)
- Very wide letter-spacing — each letter breathes
- The "&" is in a CONTRASTING typeface: an italic serif (like Didot italic or Cormorant italic) — this is the Apothékary approach where one character stands out
- The "&" is the same size as the other characters but its serif italic form makes it the focal point
- Color: deep green (#1B4332)
- Nothing else. No circle, no icon, no underline. Just beautifully set type.
- The simplicity is radical — like the Celine or Saint Laurent rebrand.

Plain white background. Large, centered.`,
  },

  // === C: Circle Seal — Refined ===
  {
    name: "logo-v2-seal",
    text: `Design a luxury logo for "matcha & me" on plain white background.

${CONTEXT}

CONCEPT: CIRCLE SEAL (refined version)
- A thin circle (hairline weight)
- "matcha & me" curves along the UPPER ARC of the circle, occupying about 40% of the circumference
- Inside the circle: completely EMPTY. Nothing. Pure negative space.
- The text is in a thin sans-serif (geometric, like Futura Light), all lowercase, wide letter-spacing
- The "&" is in italic serif — the one decorative touch
- The circle's stroke weight matches the font's thinnest hairlines
- Color: deep green (#1B4332) for both text and circle
- This is a Japanese hanko seal reimagined by a Swiss typographer

Plain white background. Large, centered.`,
  },

  // === D: Monogram — m&m ===
  {
    name: "logo-v2-monogram",
    text: `Design a luxury MONOGRAM logo for "matcha & me" on plain white background.

${CONTEXT}

CONCEPT: m&m MONOGRAM
- A compact monogram using "m", "&", "m" — representing "matcha & me"
- The two "m"s are in ultra-thin geometric sans-serif, lowercase
- The "&" is centered between them, in a beautiful italic serif — slightly larger and more ornate
- The three characters are tightly composed into a single mark, like a jeweler's hallmark or a fashion house monogram
- Can be used as an icon/favicon at tiny sizes
- Color: deep green (#1B4332)
- Below the monogram (separate, smaller): "matcha & me" spelled out in full, same thin sans-serif, very wide letter-spacing — for when you need the full name
- The monogram alone should be recognizable and elegant

Plain white background. Large, centered.`,
  },

  // === E: Blob Integration ===
  {
    name: "logo-v2-blob",
    text: `Design a luxury logo for "matcha & me" on plain white background.

${CONTEXT}

CONCEPT: LOGO WITH INTEGRATED BLOB
- "matcha & me" in thin sans-serif, all lowercase, deep green (#1B4332)
- Text arranged in a stacked layout: "matcha" top, "& me" bottom
- A small organic watercolor BLOB (like on the tin designs) in soft pink (#F2C4C4) sits BEHIND the "&" character — the blob is translucent, subtle, like a watercolor wash
- The blob is the ONLY color accent, the ONLY non-typographic element
- The blob connects the logo to the tin design language — you see the blob on the logo and immediately associate it with the product
- The blob is small — about the size of the "&" character. Not dominant.
- The "&" itself is in italic serif, darker, standing out against the soft pink blob

Plain white background. Large, centered.`,
  },

  // === F: Split Typography ===
  {
    name: "logo-v2-split",
    text: `Design a luxury logo for "matcha & me" on plain white background.

${CONTEXT}

CONCEPT: SPLIT TYPOGRAPHY
- "matcha" on the left in deep green (#1B4332), thin sans-serif, lowercase
- "me" on the right in the SAME font and color
- Between them: a single "&" in italic serif, positioned as a BRIDGE between the two words
- A thin vertical hairline separates "matcha" from "& me" — like the dividing line on the two-tone split can design
- The composition reads left-to-right: matcha | & me
- Wide letter-spacing throughout
- The vertical line and the "&" together create a visual center of gravity
- Clean, architectural, editorial

Plain white background. Large, centered.`,
  },

  // === G: Minimal Mark ===
  {
    name: "logo-v2-ampersand",
    text: `Design a luxury ICON/MARK for "matcha & me" on plain white background.

${CONTEXT}

CONCEPT: THE AMPERSAND AS BRAND MARK
- Just a single beautiful "&" character — THIS IS THE ENTIRE MARK
- The "&" is in an exquisite calligraphic italic serif — refined, elegant, with visible stroke contrast (thick/thin)
- It should look like it was drawn by a master calligrapher with a pointed pen
- Color: deep green (#1B4332)
- The "&" IS the brand. It represents the connection between matcha and you. The ritual. The relationship.
- Below the ampersand (separate, much smaller): "matcha & me" in thin sans-serif, very wide tracking — the full name for context
- The ampersand alone should work as an icon, app icon, embossing mark, or wax seal
- Think: if a luxury house used a single punctuation mark as their entire identity

Plain white background. Large, centered.`,
  },

  // === H: Japanese-Modern Hybrid ===
  {
    name: "logo-v2-hybrid",
    text: `Design a luxury logo for "matcha & me" on plain white background.

${CONTEXT}

CONCEPT: JAPANESE-MODERN HYBRID
- "matcha" in a thin, elegant LATIN sans-serif (all lowercase, wide tracking)
- Below "matcha": the kanji "抹茶" very small, as a subtle cultural anchor — NOT prominent, just a whisper
- "& me" below, same thin sans-serif as "matcha"
- The "&" is in italic serif, slightly ornate
- A single thin ENSO (zen brush circle) wraps loosely around the entire composition — imperfect, organic, with a gap where the brush lifted. The enso is drawn with a single confident stroke.
- The enso is in a slightly lighter green or sage green (#8AAE92) — not as dark as the text
- The composition lives WITHIN the enso circle
- This bridges 800 years of tradition with contemporary design

Plain white background. Large, centered.`,
  },

  // === I: Wordmark with Ligature ===
  {
    name: "logo-v2-ligature",
    text: `Design a luxury logo for "matcha & me" on plain white background.

${CONTEXT}

CONCEPT: CUSTOM LIGATURE WORDMARK
- "matcha & me" as a single continuous wordmark, all lowercase
- The key feature: custom LIGATURES where letters connect:
  - The "a" at the end of "matcha" flows into the "&" with a smooth connected stroke
  - The "&" flows into the "m" of "me" — creating one unbroken visual rhythm
  - These connections represent the seamless daily ritual
- Font base: thin, modern, geometric sans-serif EXCEPT where the ligatures create organic connections
- The ligatures should feel natural, not forced — like elegant handwriting moments within precise typography
- Color: deep green (#1B4332)
- The result: a wordmark that is partly mechanical (the straight letters) and partly human (the flowing connections)

Plain white background. Large, centered.`,
  },

  // === J: Two-line Architectural ===
  {
    name: "logo-v2-arch",
    text: `Design a luxury logo for "matcha & me" on plain white background.

${CONTEXT}

CONCEPT: ARCHITECTURAL TWO-LINE
- First line: "matcha" in CAPS, ultra-thin geometric sans-serif, extreme letter-spacing (think A R C H I T E C T U R A L)
- Second line: "& me" in lowercase italic serif, much smaller, positioned flush-right under "matcha"
- A thin horizontal rule (hairline) between the two lines, same width as "matcha"
- The contrast between the STRONG uppercase top line and the intimate lowercase bottom line tells the brand story: matcha is big and ancient, "me" is personal and intimate
- Color: deep green (#1B4332)
- The asymmetry (big top, small bottom-right) creates sophisticated tension
- Think: Peter Saville's typography for fashion houses

Plain white background. Large, centered.`,
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
  console.log("Logo v2 — 10 Concepts for Color Blob Era");
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
  console.log("Logo v2 全コンセプト生成完了！");
  console.log("========================================\n");
  console.log("10秒後にブラウザを閉じます...");
  await page.waitForTimeout(10000);
  await browser.close();
}

main().catch(e => { console.error("エラー:", e); process.exit(1); });
