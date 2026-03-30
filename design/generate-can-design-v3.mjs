import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, ".playwright-profile");
const OUTPUT_DIR = path.join(__dirname, "generated");

const SHARED = `
CRITICAL — READ EVERY WORD:
- This is a FLAT/SHALLOW circular metal tin. 11-12cm diameter, only 4-5cm tall. Like a luxury cosmetics compact.
- Brand: "matcha & me" — premium matcha, culture brand.
- DESIGN REFERENCES (the aesthetic we're targeting):
  * Kettl Tea's gunmetal silver tin with white spec-sheet typography (Grade: CEREMONIAL / Cultivar: YABUKITA / Region: KAGOSHIMA)
  * EKTA tea's matte sage green canister with an organic warm orange gradient blob bleeding into the surface
  * một matcha's soft pink-to-mint pastel gradient with playful modern typography
- KEY AESTHETIC PRINCIPLES from these references:
  * Metallic finishes (silver, gunmetal) OR soft pastel gradients (pink↔mint)
  * Typography as information design — spec-sheet style, data-driven, organized
  * Contemporary art sensibility — color blobs, gradients, unexpected color combinations
  * Modern and playful, NOT traditional Japanese
  * Clean sans-serif fonts with intentional hierarchy
- Photo: 4K photorealistic product photography, studio lighting.
`;

const PROMPTS = [
  // === 1: Gunmetal Spec Sheet ===
  {
    name: "can-v3-gunmetal-top",
    text: `Photorealistic top-down product shot of a luxury FLAT matcha tin.

${SHARED}

DESIGN: GUNMETAL SPEC SHEET
- The tin is GUNMETAL SILVER — dark metallic grey with a subtle matte metallic sheen. Like brushed titanium or dark pewter.
- On the lid, white sans-serif typography arranged as a clean spec sheet:
  Left-aligned, lower portion of the lid:
  "Grade       CEREMONIAL"
  "Cultivar    YABUKITA"
  "Origin      SINGLE ORIGIN"
  "Region      UJI, KYOTO"
- The label/value pairs use two weights: light for the labels (Grade, Cultivar...), bold for the values (CEREMONIAL, YABUKITA...)
- Upper portion of lid: "matcha & me" in small, wide letter-spaced white text
- A single thin white line or dot detail as a graphic accent
- NO color other than gunmetal + white. Industrial. Precise. Like a spec plate on high-end audio equipment.
- The flat tin shape makes the lid look like a vinyl record label or a watch case back.

Shot: top-down on a cool grey background. Even studio lighting that catches the metallic sheen. Minimal shadow. Clean, technical, precise.`,
  },
  {
    name: "can-v3-gunmetal-angle",
    text: `Photorealistic 3/4 angle product shot of a luxury FLAT matcha tin.

${SHARED}

DESIGN: GUNMETAL SPEC SHEET
- Flat circular tin in dark gunmetal silver — brushed metallic finish, like premium audio equipment or a Leica camera body.
- Lid: white sans-serif text arranged as spec data: "Grade CEREMONIAL / Cultivar YABUKITA / Origin SINGLE ORIGIN / Region UJI, KYOTO"
- "matcha & me" in small white text at top of lid.
- Side: clean gunmetal, razor-thin seam where lid meets body.
- The overall feel: if Bang & Olufsen or Braun designed a tea tin.

Shot: 3/4 angle on a light concrete surface. One ceramic matcha bowl with bright green matcha behind, slightly out of focus. Cool, precise lighting.`,
  },

  // === 2: Pastel Gradient (pink → mint) ===
  {
    name: "can-v3-gradient-top",
    text: `Photorealistic top-down product shot of a luxury FLAT matcha tin.

${SHARED}

DESIGN: PASTEL GRADIENT
- The tin lid has a SOFT GRADIENT that transitions from pale sakura pink (#F2C4C4) on one side to soft mint green (#B8E0D2) on the other side.
- The gradient is smooth, dreamy, like watercolor bleeding — not a hard line. Think morning sky colors.
- Typography in deep forest green (#1B4332):
  Center: "matcha & me" in a clean modern sans-serif, moderate size
  Below: "001" as a small number identifier
  Bottom: "ceremonial grade" in tiny text, wide letter-spacing
- The lid has a silver metallic rim/edge visible from top-down — the metal edge frames the pastel gradient beautifully.
- The vibe: một matcha meets Glossier. Soft, modern, Instagram-worthy, gender-neutral.

Shot: top-down on a white surface. Soft, diffused lighting. Maybe a light dusting of matcha powder scattered artfully nearby. Fresh and airy.`,
  },
  {
    name: "can-v3-gradient-angle",
    text: `Photorealistic 3/4 angle product shot of a luxury FLAT matcha tin.

${SHARED}

DESIGN: PASTEL GRADIENT
- Flat tin with a lid that gradients from soft pink (#F2C4C4) to mint green (#B8E0D2) — smooth, dreamy transition.
- "matcha & me" in dark green (#1B4332) on the lid. "001" below. Silver metallic rim.
- Side of tin: silver/brushed metal. The contrast of pastel top + metallic side is beautiful.
- The gradient shifts depending on viewing angle — it feels alive, like an opal.

Shot: 3/4 angle on white marble. A bamboo matcha whisk beside the tin. Soft natural window light. The pink-to-green gradient catches the light beautifully. Glossier/Aesop campaign aesthetic.`,
  },

  // === 3: Color Blob (EKTA-inspired) ===
  {
    name: "can-v3-blob-top",
    text: `Photorealistic top-down product shot of a luxury FLAT matcha tin.

${SHARED}

DESIGN: COLOR BLOB
- The tin lid is matte sage green (#8FB996) — a soft, muted, slightly dusty green. Like unglazed celadon.
- On the lower-right area of the lid: an organic WARM BLOB of color — a soft orange-coral (#E07A5F) that bleeds and fades into the green. Like heat appearing on a thermal camera, or watercolor dropped on wet paper. The blob has NO hard edge — it's a gradient that dissolves into the green.
- The blob covers about 25-30% of the lid surface. Organic, asymmetric, unexpected.
- Typography in dark green or black, minimal:
  "matcha & me" small, upper left area
  "ceremonial" in tiny text, rotated 90 degrees, running vertically along the right edge
- This is the most artful, gallery-worthy design. The blob makes each viewing angle unique.

Shot: top-down on a black background (high contrast). The warm blob glows against the sage green. Dramatic studio lighting. Contemporary art gallery feeling.`,
  },
  {
    name: "can-v3-blob-angle",
    text: `Photorealistic 3/4 angle product shot of a luxury FLAT matcha tin.

${SHARED}

DESIGN: COLOR BLOB
- Flat tin in matte sage green (#8FB996).
- An organic warm orange-coral (#E07A5F) blob on the lid — like a heat signature or watercolor bleed. Soft edges, asymmetric.
- "matcha & me" in small dark text. "ceremonial" vertically on the side.
- Side of tin: the sage green continues, with the orange blob wrapping slightly around the edge.

Shot: 3/4 angle on dark slate. Dramatic side lighting that emphasizes the color contrast. A single stem of dried botanical nearby. Art-directed, editorial. Like an EKTA tea product shot.`,
  },

  // === 4: Silver + Single Accent Color ===
  {
    name: "can-v3-silver-accent-top",
    text: `Photorealistic top-down product shot of a luxury FLAT matcha tin.

${SHARED}

DESIGN: SILVER + MATCHA GREEN ACCENT
- The tin is polished silver — real metal, reflective but not mirror-bright. Satin silver finish.
- On the lid, most text is in a subtle dark grey (almost invisible against silver):
  "matcha & me" centered, small
  Spec data below: "Grade: Ceremonial / 30g / Uji, Kyoto"
- ONE accent element in vivid matcha green (#2D6A4F): a small solid circle (about 12mm) positioned off-center (upper right quadrant). Just a dot of pure green on silver.
- That green dot is the only color on the entire tin. It represents the matcha itself — a concentrated point of green energy.
- The rim of the lid: polished silver, catching light.

Shot: top-down on off-white textured paper. Studio lighting that creates beautiful reflections on the silver surface. The green dot pops. Jewelry-level product photography.`,
  },

  // === 5: Matte Green + Data Typography ===
  {
    name: "can-v3-data-top",
    text: `Photorealistic top-down product shot of a luxury FLAT matcha tin.

${SHARED}

DESIGN: DATA-DRIVEN MINIMAL
- Tin lid is deep matte green (#1B4332). Soft-touch finish.
- White typography arranged as elegant data visualization:
  Upper area: "matcha & me" small, centered, generous letter-spacing
  A thin white horizontal line spanning 60% of the lid width
  Below the line, left-aligned with wide spacing between label and value:
  "grade          ceremonial"
  "cultivar       okumidori"
  "region         uji, kyoto"
  "harvest        spring 2026"
  All lowercase. Two different weights: labels in light, values in regular.
- Bottom right corner: "30g" in slightly larger text
- A small "01" number in a thin circle, positioned upper-left as a collection identifier
- The typography is the entire design. No icons, no graphics, no patterns. Just perfectly set type on green.

Shot: top-down on medium grey background. Even, clinical lighting. No props. The typography should be the hero. Like reading a beautifully designed data sheet.`,
  },
  {
    name: "can-v3-data-angle",
    text: `Photorealistic 3/4 angle product shot of a luxury FLAT matcha tin.

${SHARED}

DESIGN: DATA-DRIVEN MINIMAL
- Flat tin, deep matte green (#1B4332).
- Lid: white text — "matcha & me" top, thin line, then spec data (grade/cultivar/region/harvest) below in clean columns.
- "01" in a thin circle upper-left. "30g" lower-right. All lowercase, all white.
- Side: clean matte green. Maybe a small "matcha & me" running along the circumference in tiny text.

Shot: 3/4 angle on a warm oak desk. A MacBook edge visible in the background (out of focus) — suggesting this tin lives on someone's work desk, part of their daily ritual. Morning light. Aspirational but real.`,
  },

  // === 6: Two-tone split ===
  {
    name: "can-v3-split-top",
    text: `Photorealistic top-down product shot of a luxury FLAT matcha tin.

${SHARED}

DESIGN: TWO-TONE SPLIT
- The tin lid is split into TWO HALVES by a perfectly straight vertical line through the center:
  Left half: matte deep green (#1B4332)
  Right half: soft sakura pink (#F2C4C4)
- "matcha" in white on the green side, "& me" in dark green on the pink side — the brand name split across the two worlds.
- Below, spanning both halves: "ceremonial grade" in tiny text (white on green side, green on pink side), perfectly aligned across the split.
- The dividing line is SHARP — no gradient, no blend. A clean geometric split.
- Silver metallic rim around the edge.
- This is a bold, graphic, fashion-forward design. Like a Marni or Jacquemus accessory.

Shot: top-down on a pure white surface. Hard studio lighting, crisp shadows. The two-tone split is striking and immediate. Fashion editorial feeling.`,
  },

  // === 7: Collection shot ===
  {
    name: "can-v3-collection",
    text: `Photorealistic top-down product shot of FOUR luxury flat matcha tins arranged together.

${SHARED}

FOUR TINS — same shape, different aesthetics forming a collection:

TIN 1: Gunmetal silver with white spec-sheet typography (Grade: CEREMONIAL). Industrial, precise.
TIN 2: Pink-to-mint pastel gradient with dark green "matcha & me" text. Dreamy, soft.
TIN 3: Matte sage green with an organic warm orange blob bleeding into the surface. Artful.
TIN 4: Deep matte green with clean white data typography (grade/cultivar/region). Sophisticated.

Arranged in a 2x2 grid with equal spacing, perfectly aligned. Each tin is 11-12cm diameter, shallow/flat.

Shot: top-down on a light warm grey surface. Clean even studio lighting. A bamboo chasen (whisk) placed below the grid. The four tins show the range of the brand — different moods, same family.

This is the hero image that makes someone say "I want all of them."`,
  },

  // === 8: Lifestyle ===
  {
    name: "can-v3-lifestyle",
    text: `Photorealistic lifestyle product shot of a luxury flat matcha tin in a real setting.

${SHARED}

The tin: gunmetal silver, flat/shallow, with white spec-sheet text (Grade: CEREMONIAL etc.). Like premium audio equipment.

SCENE:
- A modern apartment kitchen counter or a stylish desk setup.
- The gunmetal tin sits next to a ceramic mug with bright green matcha latte (foam art visible).
- A bamboo whisk rests on a small ceramic holder.
- The environment: Japandi or Scandinavian minimal. Light wood, white walls, morning light.
- Maybe a smartphone and a book nearby — this is someone's real morning, not a styled shoot.
- The tin looks like it belongs between their AirPods case and their Aesop hand cream. It's a lifestyle object.
- Mood: "I drink matcha every morning and my kitchen looks like this." Aspirational but believable.

4K, lifestyle editorial, natural morning light, shallow depth of field.`,
  },

  // === 9: Gift box ===
  {
    name: "can-v3-gift",
    text: `Photorealistic product shot of a luxury matcha gift set, slightly overhead angle.

${SHARED}

GIFT SET:
- A rigid box — matte off-white exterior with subtle "matcha & me" embossed on top.
- Inside: charcoal grey foam insert with precision-cut wells.
- In the wells:
  (1) The gunmetal silver flat tin with white spec typography
  (2) A bamboo chasen (matcha whisk)
  (3) A small bamboo chashaku (tea scoop)
  (4) A small card: cream paper, "your daily ritual" in clean sans-serif
- The box interior contrasts beautifully: dark charcoal foam + silver tin + natural bamboo + white card.
- Everything feels considered, precise, premium. Like unboxing an Apple product or a Byredo gift set.

Shot: slightly overhead (30 degrees) on a clean white surface. Soft studio light. The box lid rests beside. One small eucalyptus stem as the only prop. Clean, desirable, giftable.`,
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
  console.log("缶デザイン v3 — REFERENCE-INSPIRED");
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
  console.log("v3 全デザイン生成完了！");
  console.log("========================================\n");
  console.log("10秒後にブラウザを閉じます...");
  await page.waitForTimeout(10000);
  await browser.close();
}

main().catch(e => { console.error("エラー:", e); process.exit(1); });
