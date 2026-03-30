import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, ".playwright-profile");
const OUTPUT_DIR = path.join(__dirname, "generated");

const SHARED = `
ABSOLUTELY CRITICAL — SHAPE:
This is a FLAT, SHALLOW, WIDE circular metal tin. Think cosmetics compact or premium shoe polish tin.
- Diameter: 11-12cm (WIDE)
- Height: only 4-5cm (VERY SHORT — about 1/3 of the diameter)
- The tin is MUCH wider than it is tall. The height-to-diameter ratio is roughly 1:3.
- The lid sits ON TOP with a slight overhang. There is a visible precision seam/step where the outer lid meets the body.
- The lid is the dominant visual surface — it's a large flat circle.
- DO NOT make this look like a standard tall tea canister. It must look like a wide, flat disc.

BRAND CONTEXT:
- Brand: "matcha & me" — ultra-premium matcha lifestyle brand
- Target: 25-50, urban, design-conscious. Culture brand, not commodity.
- Design references: Kettl Tea (gunmetal + spec data), EKTA (color blob), một matcha (pastel gradient)
- Typography: clean modern sans-serif (Helvetica Neue, Aktiv Grotesk, or similar). Data as design.

MATERIAL QUALITY:
- Metal tin with REAL metallic texture — brushed, satin, or matte finishes. NOT plastic-looking.
- The lid edge/rim should show precision machining — a satisfying metal-on-metal fit.
- Soft-touch matte coating where specified — you can almost FEEL the surface through the photo.

PHOTO QUALITY: 4K, photorealistic, professional studio product photography. Sharp focus, controlled lighting.
`;

const PROMPTS = [
  // === 1: Gunmetal Spec Sheet — REFINED ===
  {
    name: "can-v4-gunmetal-hero",
    text: `Create a stunning photorealistic product photograph. HERO SHOT — this is the main image for a brand campaign.

${SHARED}

DESIGN: GUNMETAL SPEC SHEET (refined)
- Material: dark gunmetal / brushed titanium finish. The surface has fine directional brushing marks visible under studio light. Think Leica camera body or Bang & Olufsen speaker.
- The tin is FLAT and WIDE — diameter is 3x the height. Like a large hockey puck or cosmetics compact.

LID TYPOGRAPHY (all in white, clean sans-serif):
- Upper area, centered: "matcha & me" — small, wide letter-spacing, light weight
- Below, a hairline white rule (about 40% of lid width, centered)
- Below the rule, LEFT-ALIGNED with generous margin:
    Grade         CEREMONIAL
    Cultivar      YABUKITA
    Origin        SINGLE ORIGIN
    Region        UJI, KYOTO
  Labels in thin/light weight, values in medium weight. Consistent vertical alignment.
- Lower right corner: "30g" small
- The typography is set with Swiss precision — every baseline aligned, every space intentional.

SIDE OF TIN: clean gunmetal. A precision step where the lid overlaps the body — about 2mm overhang. The seam is razor-sharp, showing quality manufacturing.

SHOT: 3/4 angle (about 30 degrees from horizontal) on a smooth medium-grey concrete surface. Single soft directional light from upper-left creating a gentle gradient across the metal surface. The brushed metal texture catches the light beautifully. ONE prop: a small handmade ceramic matcha bowl with vivid green matcha and fine foam, placed behind and to the right, slightly out of focus. Nothing else. Clean, precise, expensive-looking.`,
  },
  {
    name: "can-v4-gunmetal-top",
    text: `Photorealistic TOP-DOWN product shot of a luxury flat matcha tin.

${SHARED}

DESIGN: GUNMETAL SPEC SHEET
- Flat, wide tin in dark gunmetal / brushed titanium. Fine directional brush marks on the metal surface.
- The tin seen from directly above is a perfect circle — the large lid surface is the hero.

LID TYPOGRAPHY (white sans-serif):
- Center-top: "matcha & me" small, wide tracking
- Hairline rule below
- Spec data left-aligned:
    Grade         CEREMONIAL
    Cultivar      YABUKITA
    Origin        SINGLE ORIGIN
    Region        UJI, KYOTO
- Lower right: "30g"

SHOT: perfectly centered top-down on a cool grey background. Even studio lighting. The circular tin fills about 60% of the frame. No props except perhaps ONE small green tea leaf placed 3cm from the tin edge. Jewelry-level photography. The gunmetal surface should show subtle light reflections.`,
  },

  // === 2: Pastel Gradient — REFINED ===
  {
    name: "can-v4-gradient-hero",
    text: `Create a stunning photorealistic product photograph. HERO SHOT.

${SHARED}

DESIGN: PASTEL GRADIENT (refined)
- The lid has a smooth, dreamy gradient: soft sakura pink (#F0C0C0) on the left fading to mint green (#A8D8C8) on the right. The transition is SMOOTH like watercolor on wet paper — no hard edges, no banding.
- The gradient has a very slight organic quality — not a perfect linear gradient, more like pigment bleeding naturally.
- The lid surface is MATTE with a satin finish — the gradient colors are soft, not glossy.

LID TYPOGRAPHY (dark forest green #1B4332):
- Center: "matcha & me" — clean sans-serif, moderate size, the "&" slightly stylized
- Below: "001" small
- Below that: "ceremonial grade · 30g" tiny, wide letter-spacing

RIM/EDGE: brushed silver metal. The contrast between the pastel matte lid and the metallic silver rim is beautiful.
SIDE: silver brushed metal — clean and reflective.

SHOT: 3/4 angle on white Carrara marble surface. Soft natural window light from the right. A bamboo chasen (matcha whisk) laid on its side behind the tin. A light dusting of vivid green matcha powder scattered casually on the marble surface. The atmosphere is AIRY, LIGHT, FRESH — like a Glossier campaign. Shallow depth of field — the whisk is slightly soft.`,
  },
  {
    name: "can-v4-gradient-top",
    text: `Photorealistic TOP-DOWN product shot of a luxury flat matcha tin.

${SHARED}

DESIGN: PASTEL GRADIENT
- Wide, flat tin. Lid gradients from soft pink (#F0C0C0) on left to mint green (#A8D8C8) on right. Smooth, dreamy, watercolor-like.
- Typography in dark green (#1B4332): "matcha & me" centered, "001" below, "ceremonial grade · 30g" at bottom.
- Silver metallic rim visible as a thin ring framing the pastel gradient.

SHOT: top-down on white surface. Soft diffused light. A few pinches of vivid matcha powder scattered artfully near the tin. Fresh, clean, Instagrammable.`,
  },

  // === 3: Color Blob — REFINED ===
  {
    name: "can-v4-blob-hero",
    text: `Create a stunning photorealistic product photograph. HERO SHOT.

${SHARED}

DESIGN: COLOR BLOB (EKTA-inspired, refined)
- The lid is matte sage green (#8AAE92) — dusty, muted, sophisticated. Like celadon ceramics.
- On the lower-right quadrant: a warm organic BLOB of color — coral/terracotta (#D4735E) that BLEEDS softly into the sage green. The blob has NO hard edges — it dissolves like watercolor or a heat signature. About 30% of the lid surface.
- The blob wraps very slightly over the rim edge — it's not contained perfectly within the lid boundaries, adding to the organic feel.

LID TYPOGRAPHY:
- Upper-left: "matcha & me" in dark green (#1B3A2C), small, clean sans-serif
- Right edge, rotated 90°: "ceremonial" in tiny dark text running vertically

RIM: same sage green matte finish, continuing seamlessly from the lid.
SIDE: clean sage green matte, with the blob color wrapping slightly onto the side surface.

SHOT: 3/4 angle on dark charcoal slate surface. Dramatic studio lighting from the left — the coral blob almost seems to GLOW against the muted green. A single dried botanical stem (Japanese miscanthus or similar) placed to the right. Dark, moody, gallery-like atmosphere. The image should feel like a piece of contemporary art.`,
  },
  {
    name: "can-v4-blob-top",
    text: `Photorealistic TOP-DOWN product shot of a luxury flat matcha tin.

${SHARED}

DESIGN: COLOR BLOB
- Wide flat tin, matte sage green (#8AAE92) lid.
- Lower-right: organic warm coral (#D4735E) blob bleeding into the green. Soft edges, watercolor-like.
- "matcha & me" upper-left in dark green. "ceremonial" rotated vertically on right.

SHOT: top-down on pure black background. The warm coral blob contrasts dramatically against the sage green and black. Studio spot lighting emphasizing the blob. Art gallery installation feeling.`,
  },

  // === 4: Data Typography — REFINED ===
  {
    name: "can-v4-data-hero",
    text: `Create a stunning photorealistic product photograph. HERO SHOT.

${SHARED}

DESIGN: DATA-DRIVEN TYPOGRAPHY (refined)
- Lid: deep matte forest green (#1A3C34) with soft-touch coating. The surface looks velvety — you want to touch it.
- The tin is WIDE and FLAT.

LID TYPOGRAPHY (all white, clean sans-serif like Helvetica Neue or Aktiv Grotesk):
- Top center: "matcha & me" — moderate size, very wide letter-spacing (each letter breathes)
- Below: a thin white horizontal line, about 50% of lid width, centered
- Below the line, neatly arranged:
    grade           ceremonial
    cultivar        okumidori
    region          uji, kyoto
    harvest         spring 2026
  All lowercase. Labels in Ultra Light weight, values in Regular weight. Clean column alignment.
- Upper-left: "01" inside a thin white circle (about 10mm diameter) — collection number
- Lower-right: "30g"

RIM: thin band of brushed brass/gold at the very edge of the lid — barely there, just a whisper of warmth against the green.
SIDE: same deep matte green.

SHOT: 3/4 angle on warm light oak surface. A MacBook Pro edge visible in the far background, blurred. A handmade ceramic mug with matcha latte to the right, slightly out of focus. Warm morning light from a window on the left. This tin lives on someone's desk — it's their daily companion. Aspirational but REAL — not over-styled.`,
  },
  {
    name: "can-v4-data-top",
    text: `Photorealistic TOP-DOWN product shot of a luxury flat matcha tin.

${SHARED}

DESIGN: DATA-DRIVEN TYPOGRAPHY
- Wide flat tin, deep matte green (#1A3C34), soft-touch finish.
- White typography: "matcha & me" top, thin rule, then spec data (grade/cultivar/region/harvest) below. "01" in circle upper-left. "30g" lower-right.
- Thin brass rim at lid edge.

SHOT: top-down on medium grey background. Even clinical lighting. Typography is sharp and legible. The design reads like a beautifully set page of data. No props — pure graphic impact.`,
  },

  // === 5: Two-Tone Split — REFINED ===
  {
    name: "can-v4-split-hero",
    text: `Create a stunning photorealistic product photograph. HERO SHOT.

${SHARED}

DESIGN: TWO-TONE SPLIT (refined)
- The lid is divided into TWO HALVES by a perfectly straight DIAGONAL line (from upper-left to lower-right):
  Upper-right half: deep matte green (#1B4332)
  Lower-left half: soft sakura pink (#F0C4C4)
- The split is CLEAN and SHARP — geometric, precise, deliberate. NOT a gradient.
- On the green half: "matcha" in white, small, positioned near the split line
- On the pink half: "& me" in dark green, same size, mirrored position near the split line
- Together they read as "matcha & me" split across two worlds.
- Along the split line, running diagonally: "ceremonial · 30g · uji" in tiny text
- The two-tone continues onto the side of the tin — the diagonal split wraps around.

RIM: silver metallic edge.

SHOT: 3/4 angle on pure white surface. Hard, even studio light creating crisp shadows. The diagonal split is striking and immediate — like a fashion editorial. The tin looks like a Marni or COS accessory. Clean, graphic, bold.`,
  },

  // === 6: COLLECTION of all 4 designs ===
  {
    name: "can-v4-collection",
    text: `Photorealistic TOP-DOWN product shot of FOUR luxury flat matcha tins arranged together. This is the MOST IMPORTANT image — the hero collection shot.

${SHARED}

FOUR TINS in a 2x2 grid, each the same flat/wide shape (diameter 3x height), each a different design:

TOP-LEFT: GUNMETAL — dark brushed titanium, white spec-sheet typography (Grade: CEREMONIAL etc.)
TOP-RIGHT: PASTEL GRADIENT — pink-to-mint smooth gradient, dark green "matcha & me", silver rim
BOTTOM-LEFT: COLOR BLOB — sage green with organic coral blob bleeding in lower-right area
BOTTOM-RIGHT: DATA TYPOGRAPHY — deep matte green, white lowercase spec data, thin brass rim, "01" in circle

Each tin is 11-12cm diameter. They are arranged in a perfect 2x2 grid with about 2cm spacing between them. All tins are the same size and shape — they clearly belong to the same family despite different surface treatments.

SHOT: top-down on a warm light grey linen surface. Clean, even studio lighting — no dramatic shadows. Between the four tins (in the center gap): a single bamboo chasen (matcha whisk) laid horizontally. The image is SYMMETRICAL and ORDERED — like a museum catalog or brand lookbook page.

This image must make someone say: "I need the whole collection."`,
  },

  // === 7: Lid-Open / Interior ===
  {
    name: "can-v4-open",
    text: `Photorealistic product shot showing a luxury flat matcha tin with the LID REMOVED and placed beside it.

${SHARED}

The tin: GUNMETAL spec-sheet design (dark brushed titanium, white text).

SCENE: The outer lid is placed upside-down NEXT TO the tin body, leaning slightly against it. This reveals:
- The UNDERSIDE of the outer lid: clean metal interior. A small metallic chashaku (tea scoop) is attached magnetically to the lid interior — this is a key product feature.
- The INNER LID still in place on the body: a clean, tight-fitting secondary lid with a small finger tab. This inner lid seals the matcha powder.
- The inner lid is slightly lifted/ajar, revealing a glimpse of vivid green matcha powder inside.

The composition shows the "double lid" innovation: outer lid (with attached scoop) + inner lid (airtight seal) + powder.

SHOT: 3/4 angle on a light surface. Warm directional light. The viewer should understand the ingenious engineering: open outer lid → grab scoop → open inner lid → scoop matcha → close. Show all the layers. This is a product-feature shot, not just beauty.`,
  },

  // === 8: Lifestyle — Morning Ritual ===
  {
    name: "can-v4-lifestyle",
    text: `Photorealistic LIFESTYLE product photograph. This is a REAL morning scene, not an overly styled product shot.

${SHARED}

The tin: deep matte green with white data typography (the "Data" design variant). Flat, wide shape.

SCENE — someone's actual morning:
- A beautiful Japandi kitchen counter. Light oak wood with white countertop, or light marble.
- The matcha tin sits naturally — not centered, slightly to the left. It LIVES here permanently.
- To its right: a handmade ceramic cup (cream/beige, irregular glaze) with bright vibrant matcha latte, foam on top, a small latte art pattern.
- A bamboo chasen rests on a small ceramic whisk holder.
- Background: a kitchen window with morning light streaming in. Plants on the sill. A kettle. Maybe a cookbook.
- The light: warm golden morning sun, with soft shadows. Natural, not studio.
- The feeling: "This is my morning. Every morning. The tin is always here."
- Think: Kinfolk magazine, Cereal magazine, or a Scandinavian lifestyle blog.

4K, lifestyle editorial, natural light, shallow depth of field (tin and cup sharp, background softly blurred).`,
  },

  // === 9: Gift Set — REFINED ===
  {
    name: "can-v4-gift",
    text: `Photorealistic product shot of a luxury matcha GIFT SET. This should make someone want to buy it as a gift IMMEDIATELY.

${SHARED}

GIFT SET CONTENTS (inside a rigid presentation box):
- The matcha tin: gunmetal spec-sheet design, flat/wide
- A bamboo chasen (matcha whisk) — natural golden bamboo, fine tines
- A bamboo chashaku (tea scoop) — elegant curve, natural color
- A small folded card: cream heavy stock paper, "your daily ritual" in small green type

BOX DESIGN:
- Exterior: matte warm grey rigid box. "matcha & me" blind-embossed (no ink, just pressed) on the lid. Clean, understated.
- Interior: dark charcoal felt or suede-like insert with PRECISION-CUT wells for each item. Every piece has its exact place.
- The box lid is placed to the side, angled, showing the moment of unboxing.

THE CONTRAST: dark charcoal interior + silver gunmetal tin + warm natural bamboo + white card = a perfect palette of neutrals with the bamboo providing warmth.

SHOT: slightly overhead (about 25 degrees) on a clean white or light cream surface. Soft studio lighting. ONE small sprig of eucalyptus or dried flower as the only styling prop. The composition should feel like an Apple product unboxing crossed with a Byredo gift set.`,
  },

  // === 10: Size/Scale Reference ===
  {
    name: "can-v4-scale",
    text: `Photorealistic product shot showing the SIZE and PROPORTIONS of the luxury flat matcha tin, with a human hand for scale.

${SHARED}

SCENE: A person's hand (clean, well-groomed, gender-neutral) is HOLDING the tin in their palm, or picking it up from a surface. The tin should sit comfortably in one hand — about the size of a large compact mirror.

The tin: gunmetal spec-sheet design. The flat, wide shape is emphasized by being held — it's satisfyingly thin and wide, like a high-end compact or a really premium coaster.

The hand demonstrates:
- The tin is about the width of a palm (11-12cm)
- The tin is only 4-5cm tall — barely taller than two fingers stacked
- It has a pleasing weight and presence in the hand

SHOT: close-up, slightly overhead. Clean blurred background (kitchen or desk). Focus on the tin and hand. Warm, natural light. The image communicates: "this is a SMALL, PRECIOUS object — not a large canister."`,
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
  console.log("缶デザイン v4 — REFINED & IMPROVED");
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
  console.log("v4 全デザイン生成完了！");
  console.log("========================================\n");
  console.log("10秒後にブラウザを閉じます...");
  await page.waitForTimeout(10000);
  await browser.close();
}

main().catch(e => { console.error("エラー:", e); process.exit(1); });
