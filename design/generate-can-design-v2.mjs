import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, ".playwright-profile");
const OUTPUT_DIR = path.join(__dirname, "generated");

const SHARED = `
CRITICAL CONSTRAINTS:
- This is a FLAT/SHALLOW circular metal tin (like a luxury cosmetics compact). 11-12cm diameter, only 4-5cm tall.
- Brand: "matcha & me" — ultra-premium matcha. Culture brand, not commodity.
- The design must be EXTREMELY MINIMAL. Think Aesop, Byredo, Le Labo, Diptyque level of restraint.
- "What to remove, not what to add" — if an element doesn't NEED to be there, it shouldn't be.
- NO busy patterns. NO decorative flourishes. NO gradients. NO glossy finishes.
- Every element must earn its place. Whitespace and negative space are features, not emptiness.
- The tin must look like a design object — something you'd see in Monocle magazine or a Tokyo concept store.
- Photo must be 4K, photorealistic, editorial product photography, studio lighting.
`;

const PROMPTS = [
  // === A: Absolute Minimum — single color, typography only ===
  {
    name: "can-v2-mono-top",
    text: `Photorealistic top-down product shot of a luxury flat matcha tin on pure white background.

${SHARED}

DESIGN: ABSOLUTE MONOCHROME
- The entire tin lid is a single flat matte color: deep forest green (#1B4332). Completely uniform. No texture variation.
- Dead center of the lid: just the words "matcha & me" in a TINY sans-serif font (think 6pt equivalent). White text. All lowercase. Extreme letter-spacing (each letter breathes).
- Below it, even smaller: "ceremonial grade" — same white, same font, even wider letter-spacing.
- That's IT. Nothing else. No circle, no icon, no border, no rim detail. Just a green disc with tiny white text in the center.
- The edge of the tin: same green, clean, no decoration.
- The restraint IS the design. It should feel almost uncomfortably minimal — like it's daring you to look closer.

Shot: perfectly centered top-down on a seamless white surface. Hard, even studio lighting. No props. No shadows except the tin's own contact shadow. The tin floating in white space.`,
  },
  {
    name: "can-v2-mono-angle",
    text: `Photorealistic 3/4 angle product shot of a luxury flat matcha tin.

${SHARED}

DESIGN: ABSOLUTE MONOCHROME
- Flat circular tin, entirely matte deep forest green (#1B4332). Soft-touch finish.
- Lid: only "matcha & me" in tiny white sans-serif, dead center. Extreme letter-spacing. Below: "ceremonial grade" even smaller.
- Nothing else on the surface. No borders, no icons, no embellishments.
- Side of tin: clean matte green. A razor-thin line where the lid meets the body — that's the only visual detail.
- The tin looks like it was designed by Jony Ive for a Japanese tea master.

Shot: 3/4 angle on a light concrete surface. Single directional light from upper left creating a soft gradient shadow. One small matcha bowl with frothy green matcha placed 15cm behind the tin, slightly out of focus. That's the only prop. Clean, editorial.`,
  },

  // === B: Blind Emboss — no ink, just depth ===
  {
    name: "can-v2-emboss-top",
    text: `Photorealistic top-down product shot of a luxury flat matcha tin.

${SHARED}

DESIGN: BLIND EMBOSS ON MATTE WHITE
- The tin is MATTE WHITE. Smooth, chalky, like unglazed porcelain. Almost paper-like.
- The logo "matcha & me" is BLIND EMBOSSED — pressed into the metal with NO ink, NO color. You can only see it from the shadows created by the depth. The text curves along the upper arc of a thin embossed circle.
- Below the circle: "first harvest" blind embossed in tiny uppercase letters.
- The entire tin is monochromatic white-on-white. The only visual information comes from light and shadow playing on the embossed surfaces.
- Edge/rim: same white, with a hairline step where lid meets body.
- This is the ultimate in restraint. It looks like a piece of contemporary ceramics.

Shot: top-down, raking light from the right side at a low angle to make the embossing visible through shadows. Off-white linen surface beneath. One dried tea leaf placed casually to the left. Soft, quiet, contemplative.`,
  },
  {
    name: "can-v2-emboss-angle",
    text: `Photorealistic 3/4 angle product shot of a luxury flat matcha tin.

${SHARED}

DESIGN: BLIND EMBOSS ON MATTE WHITE
- Flat circular tin in matte white — like unglazed porcelain or fine paper.
- Logo "matcha & me" is blind embossed (no ink, depth only). Thin circle with text on upper arc.
- "first harvest" embossed below in tiny letters.
- Completely white-on-white. Light reveals the design.
- Side: matte white, clean.

Shot: 3/4 angle on a raw linen cloth. Warm soft window light from the left. A bamboo chasen (matcha whisk) rests beside the tin. The light catches the embossing beautifully. Kinfolk magazine aesthetic. Serene, tactile, intimate.`,
  },

  // === C: Single Line — one horizontal rule divides the world ===
  {
    name: "can-v2-line-top",
    text: `Photorealistic top-down product shot of a luxury flat matcha tin.

${SHARED}

DESIGN: THE LINE
- Tin lid is matte deep green (#1B4332).
- A single thin horizontal line in pale pink (#F2C4C4) crosses the exact center of the lid from edge to edge.
- Above the line, right-aligned: "matcha" in tiny thin white sans-serif (like Helvetica Neue Ultralight). Very small. Hugging close to the line.
- Below the line, right-aligned: "& me" in the same tiny white font. Same position, mirrored.
- Bottom left quadrant, very small: "01 — ceremonial" in the same pink as the line.
- That's all. A green circle bisected by a pink line, with whisper-quiet typography. The composition is asymmetric and editorial — like a page from a typography book.

Shot: top-down on dark charcoal surface. Hard directional light creating a crisp shadow on one side. No props. Pure graphic impact.`,
  },

  // === D: Negative space stamp ===
  {
    name: "can-v2-stamp-top",
    text: `Photorealistic top-down product shot of a luxury flat matcha tin.

${SHARED}

DESIGN: NEGATIVE SPACE STAMP
- Tin lid is matte deep green (#1B4332).
- In the center: a small circle (about 3cm diameter) that is RECESSED — physically pressed down 1mm into the lid surface, creating a shallow circular indent.
- Inside this indent: the metal is a different finish — polished/brushed brass (#B8963E), catching light differently from the surrounding matte green.
- Around the outer edge of this brass circle, debossed into the brass: "matcha & me" curving along the top, incredibly small and precise.
- Nothing else on the lid. Just the matte green plane interrupted by this small golden well in the center. Like a zen garden with one stone.

Shot: top-down, slightly off-center composition (rule of thirds). The brass circle catches a highlight from studio lighting. Dark stone surface beneath. One bamboo chashaku (tea scoop) placed at the edge of frame.`,
  },

  // === E: The Slit — lid as interaction ===
  {
    name: "can-v2-slit-angle",
    text: `Photorealistic 3/4 angle product shot of a luxury flat matcha tin with the lid slightly lifted.

${SHARED}

DESIGN: THE REVEAL
- Tin is matte black exterior — completely black, no markings visible on the side.
- The lid is being lifted about 1cm, revealing a BRIGHT matcha green (#2D6A4F) interior — the inside of the lid and the rim of the body are this vivid green.
- On the exterior of the black lid (visible at this angle): just "m&m" in a tiny, refined monogram. White. Centered. (This stands for matcha & me.)
- The concept: the tin is black and secretive on the outside. The green is hidden inside — like the covered tea plants (ooika/覆い香) that create matcha. Darkness on the outside, vibrant life within.
- The contrast between matte black exterior and bright green interior is striking.

Shot: 3/4 angle on a dark marble surface. The green interior glowing from the gap. Dramatic side lighting. One matcha whisk in soft focus behind. Moody, cinematic.`,
  },

  // === F: Swiss Typography ===
  {
    name: "can-v2-swiss-top",
    text: `Photorealistic top-down product shot of a luxury flat matcha tin.

${SHARED}

DESIGN: SWISS INTERNATIONAL STYLE
- Tin lid is matte off-white / warm cream (#F5F0E8).
- All typography is in deep green (#1B4332), aligned to a strict grid.
- Top left corner (with generous margin): "matcha" in a medium-weight grotesque sans-serif (like Aktiv Grotesk). Lowercase. Moderate size.
- Directly below: "& me" in the same font but lighter weight.
- Bottom right corner: "01" large, as a numerical identifier for the flavor variant. Bold weight.
- Between them, a single thin green horizontal rule spanning about 60% of the lid width.
- Bottom left, very small: "ceremonial — 30g — kyoto"
- The layout follows modernist grid principles. Asymmetric. Structured. Every element placed with mathematical intention.
- No circles, no icons, no decorative elements. Pure typography and grid.

Shot: top-down, perfectly flat, on a medium grey background. Even lighting, no dramatic shadows. The design should read like a poster by Josef Muller-Brockmann reimagined as a tea tin.`,
  },

  // === G: All black with single green dot ===
  {
    name: "can-v2-dot-top",
    text: `Photorealistic top-down product shot of a luxury flat matcha tin.

${SHARED}

DESIGN: THE DOT
- Tin lid is matte black. Completely, perfectly matte black.
- In the exact center: a single small circle (about 8mm diameter) of vibrant matcha green (#2D6A4F). A perfect dot of green on infinite black.
- That's the ENTIRE front design. One dot. On black. No text on the lid at all.
- On the side of the tin (not visible from top but mentioned for context): "matcha & me" runs in tiny white text along the circumference.
- This is the most extreme version of minimalism. The green dot represents: matcha powder, a zen circle, a single point of focus in meditation. It's a statement piece.

Shot: top-down, centered, on a pure black surface so the tin nearly disappears — only the matte vs. surface texture difference defines its edge. The green dot is the only color in the entire image. One single shaft of light illuminates just the dot area. Dramatic. Art gallery installation feeling.`,
  },

  // === H: Collection of 3 — minimal variants ===
  {
    name: "can-v2-collection",
    text: `Photorealistic top-down product shot of THREE luxury flat matcha tins arranged in a row.

${SHARED}

THREE MINIMAL VARIANTS side by side, each the same dimensions:

TIN 1 (left): Matte deep green (#1B4332). Tiny centered white text: "matcha & me" with "01 ceremonial" below. Nothing else.

TIN 2 (center): Matte white, blind embossed logo (no color, just pressed depth). "02 first harvest" embossed below. White on white.

TIN 3 (right): Matte black with a single small green (#2D6A4F) dot in center. "03 umami" in tiny white text on the side only.

All three share the same flat proportions and diameter. The trio shows range while maintaining a coherent family — green/white/black, each with a different approach to extreme minimalism.

Arranged in a perfectly straight horizontal line with equal spacing. Top-down on a light warm grey surface. Clean, even studio lighting. A single chasen (matcha whisk) placed below the center tin.

This image should make someone think: "I need to collect all three."`,
  },

  // === I: Lifestyle — new minimal version ===
  {
    name: "can-v2-lifestyle",
    text: `Photorealistic lifestyle product shot of a luxury flat matcha tin in a beautiful home setting.

${SHARED}

The tin design: matte deep forest green (#1B4332), tiny centered white text "matcha & me". Extremely minimal — no decoration.

SCENE:
- A minimal Scandinavian-Japanese (Japandi) apartment. Morning light streaming through a large window.
- A white marble or light wood kitchen counter.
- The matcha tin sits naturally on the counter — not staged, but lived-in.
- Next to it: a handmade ceramic cup with bright green matcha latte, foam visible on top.
- A bamboo matcha whisk on a small ceramic rest.
- Background: clean, minimal kitchen. Maybe one plant. A book. Soft morning atmosphere.
- The tin looks like it BELONGS — like a permanent fixture, not a product placed for a photo.
- Mood: Cereal magazine, Kinfolk, The Monocle Guide to Better Living.

4K, lifestyle editorial photography, natural morning light, warm tones, depth of field.`,
  },

  // === J: Gift — elevated minimal ===
  {
    name: "can-v2-gift",
    text: `Photorealistic product shot of a luxury matcha gift set, slightly overhead angle.

${SHARED}

GIFT SET DESIGN — extreme minimalism:
- A rigid box in matte off-white / natural unbleached cardboard. No printing on the outside except a tiny blind-embossed "matcha & me" on the lid.
- Inside: black foam or dark grey felt insert with precision-cut wells.
- In the wells: (1) the matcha tin — matte green, tiny white text, (2) a bamboo chasen (matcha whisk), (3) a small bamboo chashaku (tea scoop).
- A small folded card in the box: cream paper, "your daily ritual" in tiny green type.
- The box lid is placed beside the open box, showing the unboxing moment.
- Everything whispers luxury through material quality and restraint, not decoration.
- Think: if Aesop made a matcha set. Or Apple's packaging team designed tea.

Shot: slightly overhead (about 30 degrees), on a clean surface. Soft studio lighting. Maybe one small stem of dried botanical as the only prop. Clean, precise, desirable.`,
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
  console.log("缶デザイン v2 — ULTRA MINIMAL");
  console.log(`${PROMPTS.length}種類を生成します`);
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
  console.log("v2 全デザイン生成完了！");
  console.log("========================================\n");
  console.log("10秒後にブラウザを閉じます...");
  await page.waitForTimeout(10000);
  await browser.close();
}

main().catch(e => { console.error("エラー:", e); process.exit(1); });
