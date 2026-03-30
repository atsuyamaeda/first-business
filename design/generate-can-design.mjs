import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, ".playwright-profile");
const OUTPUT_DIR = path.join(__dirname, "generated");

// Brand colors
const GREEN = "#2D6A4F";
const PINK = "#F2C4C4";
const BIRCH = "#D4B896";

const SHARED_CONTEXT = `
IMPORTANT CONTEXT — READ CAREFULLY:
This is a FLAT/SHALLOW luxury matcha tea canister (tin). NOT a tall beverage can.
- Shape: flat circular tin, like a luxury cosmetics compact or premium shoe polish tin
- Dimensions: 11-12cm diameter, only 4-5cm tall (very shallow)
- The lid is the MAIN design surface — large circular area for branding
- Think: Burberry meets Japanese minimalism. Bold yet refined.
- Brand: "matcha & me" — a premium matcha lifestyle brand
- Logo: "matcha & me" text curves along the upper arc of a thin circle (like a Japanese hanko seal)
- The "&" in the logo is in an italic serif typeface, contrasting with the rest in thin sans-serif
- Color palette: Deep matcha green ${GREEN}, soft sakura pink ${PINK}, birchwood ${BIRCH}
- Design philosophy: "What to remove, not what to add" — extreme minimalism, generous whitespace
- Target: Urban lifestyle, 25-50, culture brand not just beverage
- Must look like an interior object you'd proudly display on a kitchen counter
- Multiple flavor variants exist — each can should feel part of a collectible series
`;

const PROMPTS = [
  // === CONCEPT 1: The Zen Minimalist ===
  {
    name: "can-zen-top",
    text: `Create a photorealistic product shot of a luxury flat matcha tea tin, TOP-DOWN VIEW showing the lid.

${SHARED_CONTEXT}

DESIGN CONCEPT — "ZEN MINIMALIST":
- The lid is deep matte matcha green (${GREEN}) with a subtle soft-touch texture
- Center: the "matcha & me" logo debossed (pressed into the metal) — not printed, DEBOSSED so you can feel it
- Logo is a thin circle with "matcha & me" curving along the top arc, the "&" in italic serif
- Below the logo circle, in small elegant tracking: the flavor name "CEREMONIAL" in ${PINK} with extreme letter-spacing
- A single thin line in ${PINK} runs horizontally across the lid, passing through the center — dividing the circle
- The edge/rim of the tin has a subtle ${BIRCH} gold band — barely visible, just a whisper of warmth
- Overall: 95% green, 5% pink accent. Radical simplicity. Like a Dieter Rams product meets a Japanese temple.

Shot: top-down on a white marble surface with soft natural light. One small green tea leaf placed next to the tin for scale. The tin should look REAL — metal texture, light catching the debossed logo.

4K, product photography, studio lighting, editorial quality.`,
  },
  {
    name: "can-zen-angle",
    text: `Create a photorealistic product shot of a luxury flat matcha tea tin, 3/4 ANGLE VIEW showing both the lid and the shallow side.

${SHARED_CONTEXT}

DESIGN CONCEPT — "ZEN MINIMALIST":
- Flat circular tin, matte deep green (${GREEN}) with soft-touch finish
- Lid: "matcha & me" logo debossed in center — thin circle with text on upper arc
- Below logo: "CEREMONIAL" in tiny ${PINK} letters with wide tracking
- A thin ${PINK} line crosses the lid horizontally
- Side of the tin: clean matte green, with a minimal ${BIRCH} metallic band at the very bottom edge
- The lid has a slight overhang over the body — you can see the seam where lid meets body

Shot: 3/4 angle on a muted linen surface. Soft morning light from the left. A matcha whisk (chasen) placed behind the tin, slightly out of focus. Show the tin's shallow proportions — it should look like a beautiful compact object.

4K, product photography, luxury beauty brand aesthetic, editorial.`,
  },

  // === CONCEPT 2: The Sakura Line ===
  {
    name: "can-sakura-top",
    text: `Create a photorealistic product shot of a luxury flat matcha tea tin, TOP-DOWN VIEW.

${SHARED_CONTEXT}

DESIGN CONCEPT — "SAKURA LINE":
- The lid is a sophisticated two-tone design
- Upper 70%: deep matte green (${GREEN})
- Lower 30%: soft sakura pink (${PINK})
- The division between green and pink is NOT a straight line — it's a gentle, organic wave, like a single brushstroke or the horizon of rolling hills. Subtle, not dramatic.
- "matcha & me" logo in the green area, rendered in ${PINK} — thin circle with text on upper arc
- On the pink area: the flavor name "FIRST HARVEST" in ${GREEN}, small, wide letter-spacing
- The tin edge has a thin ${BIRCH} metallic rim
- The overall effect: like looking down at a matcha field with cherry blossoms at the horizon

Shot: top-down on dark slate surface. A few dried sakura petals scattered nearby. Dramatic but natural lighting.

4K, product photography, Aesop/Byredo aesthetic, editorial luxury.`,
  },
  {
    name: "can-sakura-angle",
    text: `Create a photorealistic product shot of a luxury flat matcha tea tin, 3/4 ANGLE VIEW.

${SHARED_CONTEXT}

DESIGN CONCEPT — "SAKURA LINE":
- Flat circular tin with two-tone lid: 70% deep matte green (${GREEN}) on top, 30% soft pink (${PINK}) on bottom
- The color division is a gentle organic wave/curve — like brushwork
- "matcha & me" circular seal logo on the green portion in pink
- Side of tin: entirely matte green with a hairline ${BIRCH} gold band at the base
- Show the lid slightly ajar/lifted to hint at the interior

Shot: 3/4 angle on warm wood surface. A small ceramic cup of matcha in the background, out of focus. Warm afternoon light.

4K, photorealistic product photography, luxury brand campaign.`,
  },

  // === CONCEPT 3: The Enso ===
  {
    name: "can-enso-top",
    text: `Create a photorealistic product shot of a luxury flat matcha tea tin, TOP-DOWN VIEW.

${SHARED_CONTEXT}

DESIGN CONCEPT — "ENSO":
- The entire lid is matte black (yes, BLACK — a bold departure)
- In the center: a hand-painted enso circle (zen brush circle) in matcha green (${GREEN}) — imperfect, organic, with visible brush texture and a deliberate gap where the circle doesn't close
- Inside the enso: "matcha & me" in thin white or ${PINK} letters, very small, very refined
- Below the enso: flavor name "UMAMI RESERVE" in ${BIRCH} gold, tiny, wide letter-spacing
- The contrast of black + green enso is striking and very modern
- The tin rim: thin ${GREEN} band

This is the PREMIUM/LIMITED EDITION variant — it breaks from the main green palette but maintains brand coherence through the logo and enso symbolism. It should look like something from a Tokyo concept store or a MoMA gift shop.

Shot: top-down on a dark textured stone surface. One bamboo matcha scoop (chashaku) placed diagonally. Moody, dramatic lighting — like a luxury watch advertisement.

4K, product photography, high-end editorial, dramatic.`,
  },
  {
    name: "can-enso-angle",
    text: `Create a photorealistic product shot of a luxury flat matcha tea tin, 3/4 ANGLE VIEW.

${SHARED_CONTEXT}

DESIGN CONCEPT — "ENSO":
- Flat circular tin in matte black
- Lid: hand-painted green (${GREEN}) enso (zen brush circle) in center, imperfect and organic
- "matcha & me" in delicate ${PINK} inside the enso
- "UMAMI RESERVE" in ${BIRCH} below the enso
- Side: matte black with a thin ${GREEN} stripe around the middle
- Show the tin's satisfying shallow proportions

Shot: 3/4 angle on dark marble. A small matcha whisk beside it. Single shaft of light creating dramatic shadows. Premium limited edition feeling.

4K, photorealistic product shot, luxury campaign aesthetic.`,
  },

  // === CONCEPT 4: The Collection (multiple cans together) ===
  {
    name: "can-collection-3",
    text: `Create a photorealistic product shot of THREE luxury flat matcha tea tins arranged together, TOP-DOWN VIEW.

${SHARED_CONTEXT}

THREE TINS IN A COLLECTION — each the same shape but different flavor/color variant:

TIN 1 (left): "CEREMONIAL" — lid is deep matte green (${GREEN}), logo debossed, flavor name in ${PINK}
TIN 2 (center): "FIRST HARVEST" — lid is matte green with a soft ${PINK} organic wave across the lower third, logo in contrasting color
TIN 3 (right): "UMAMI RESERVE" — lid is matte black with a green enso brush circle, logo inside in pink

All three tins share: the same "matcha & me" circular seal logo, same dimensions (flat/shallow), same ${BIRCH} metallic rim. They clearly belong to the same family but each has its own character.

Arranged in a loose triangle formation — not perfectly aligned, slightly casual like a styled editorial layout.

Shot: top-down on a light oak wood surface. A few props: a small bowl of matcha powder, a single chasen whisk, a linen napkin corner. Natural morning light. The image should make you want to collect all three.

4K, product photography, editorial lifestyle, luxury brand campaign.`,
  },

  // === CONCEPT 5: The Foil Stamp ===
  {
    name: "can-foil-top",
    text: `Create a photorealistic product shot of a luxury flat matcha tea tin, TOP-DOWN VIEW.

${SHARED_CONTEXT}

DESIGN CONCEPT — "FOIL STAMP":
- The lid is deep matte matcha green (${GREEN}), perfectly smooth, soft-touch finish
- The ONLY decoration: the "matcha & me" circular seal logo in GOLD FOIL STAMPING (${BIRCH} metallic gold)
- The logo catches the light — you can see the metallic sheen of real hot foil stamping
- Below the logo: "DAILY RITUAL" in the same gold foil, tiny, letter-spaced
- NO other decoration. Just green + gold. Maximum restraint. Maximum luxury.
- The rim of the tin: same gold as the logo
- Think: if Hermès made a matcha tin

The simplicity is the statement. One color. One logo. One accent. Nothing else.

Shot: top-down on a cream-colored textured paper surface. Soft even studio lighting that makes the gold foil shimmer. Perhaps the shadow of a window frame falling across the scene.

4K, product photography, ultra-luxury, Hermès/Celine aesthetic.`,
  },
  {
    name: "can-foil-angle",
    text: `Create a photorealistic product shot of a luxury flat matcha tea tin, 3/4 ANGLE VIEW.

${SHARED_CONTEXT}

DESIGN CONCEPT — "FOIL STAMP":
- Flat circular tin, deep matte green (${GREEN}), soft-touch texture
- Only decoration: "matcha & me" circular seal logo in real gold foil (${BIRCH})
- "DAILY RITUAL" below in matching gold foil
- Side: clean matte green, thin gold band at lid edge and base
- The gold foil catches light beautifully from the angle

Shot: 3/4 angle on a light surface. The tin is slightly elevated on a small marble block. Soft directional light making the gold foil gleam. A small green plant or tea branch in soft focus behind.

4K, photorealistic, ultra-luxury product photography, Hermès aesthetic.`,
  },

  // === CONCEPT 6: The Texture ===
  {
    name: "can-texture-top",
    text: `Create a photorealistic product shot of a luxury flat matcha tea tin, TOP-DOWN VIEW.

${SHARED_CONTEXT}

DESIGN CONCEPT — "WASHI TEXTURE":
- The lid has a unique tactile finish: it looks like Japanese washi paper texture pressed into metal
- Color: matte green (${GREEN}) with the washi texture creating subtle depth and shadow play
- The washi texture is subtle — visible close up, adds a handmade quality to the industrial metal
- "matcha & me" circular seal logo EMBOSSED (raised) in the center — same green but catching light differently due to the raised surface against the textured background
- Small: "STONE GROUND" in ${PINK}, beneath the logo, very delicate
- Edge rim: natural brushed metal (silver/steel tone) — no gold, keeping it more wabi-sabi
- This design embodies "imperfection as beauty" — the washi texture means no two tins look exactly alike

Shot: extreme close-up top-down, filling the frame with the tin lid so you can see the texture detail. On a dark indigo fabric (like Japanese boro cloth). Raking light from the side to emphasize the texture.

4K, macro product photography, texture-focused, artisanal luxury.`,
  },

  // === CONCEPT 7: Interior/Lifestyle Context ===
  {
    name: "can-lifestyle-kitchen",
    text: `Create a photorealistic LIFESTYLE product shot showing a luxury flat matcha tea tin in a real kitchen setting.

${SHARED_CONTEXT}

SCENE:
- A beautiful modern minimalist kitchen counter (light wood or white marble)
- The matcha tin sits proudly on the counter — it's an interior object, not hidden in a cupboard
- The tin: flat circular, matte deep green (${GREEN}), "matcha & me" logo in gold foil (${BIRCH})
- Next to the tin: a handmade ceramic mug with freshly whisked matcha (vibrant green with foam)
- A bamboo matcha whisk (chasen) rests on a small ceramic holder
- Background: clean kitchen with perhaps a window, a small plant, morning light streaming in
- The scene tells the story: this is someone's morning ritual. The tin is ALWAYS on the counter.
- The tin should look like it BELONGS there — like a piece of kitchen decor, not a food product

Mood: calm morning, golden hour light, aspirational but attainable lifestyle. Think Kinfolk magazine or Cereal magazine editorial.

4K, lifestyle product photography, editorial, warm natural light.`,
  },

  // === CONCEPT 8: Gift/Unboxing ===
  {
    name: "can-gift-set",
    text: `Create a photorealistic product shot of a luxury matcha gift set.

${SHARED_CONTEXT}

SCENE — GIFT SET:
- A flat circular matcha tin (matte green ${GREEN}, "matcha & me" gold foil logo) sitting inside a beautiful minimal box
- The box: clean white or cream, with subtle embossed "matcha & me" logo
- Tissue paper in ${PINK} (sakura pink) partially wrapping the tin
- Next to the tin in the box: a bamboo matcha whisk (chasen) with a design that matches the tin's aesthetic
- Perhaps a small card: "Your Daily Ritual" in elegant typography
- The box lid is placed beside the box, showing the unboxing moment
- Everything is harmonious — the tin, whisk, box, tissue paper form a cohesive world

This is the image that makes someone say "I want to give this as a gift." It should look like opening a Tiffany box — that moment of delight.

Shot: slightly overhead angle on a clean white surface. Soft studio lighting. Rose petals or sakura petals optional.

4K, product photography, gift/luxury unboxing, editorial.`,
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
    // Dismiss any overlay/dialog first
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
    // Dismiss overlay again after navigation
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
  console.log("缶デザイン生成 — matcha & me");
  console.log(`${PROMPTS.length}種類のデザインコンセプトを生成します`);
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

  // Check if actually logged in by looking for login buttons/prompts
  const url = page.url();
  const needsLogin = async () => {
    try {
      // Check for login button or "ログイン" text
      const loginBtn = page.locator('a:has-text("ログイン"), button:has-text("ログイン"), button:has-text("Sign in"), a:has-text("Sign in")').first();
      if (await loginBtn.isVisible({ timeout: 3000 })) return true;
    } catch {}
    try {
      const loginInput = page.locator('input[type="email"], input[type="password"]').first();
      if (await loginInput.isVisible({ timeout: 2000 })) return true;
    } catch {}
    return false;
  };

  if (!url.includes("gemini.google.com/app") || await needsLogin()) {
    console.log("\nログインが必要です。ブラウザでGeminiにログインしてください。");
    console.log("ログイン後、自動で続行します...\n");
    // Click login button if visible
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
  console.log("全デザイン生成完了！");
  console.log(`保存先: ${OUTPUT_DIR}`);
  console.log("========================================");
  console.log("\nデザイン一覧:");
  console.log("  1. can-zen-*        — 禅ミニマリスト（デボス加工、極限の引き算）");
  console.log("  2. can-sakura-*     — 桜ライン（グリーン×ピンクの有機的な波）");
  console.log("  3. can-enso-*       — 円相（マットブラック×墨の円、限定版）");
  console.log("  4. can-collection-* — 3缶コレクション（並べた時の美しさ）");
  console.log("  5. can-foil-*       — 箔押し（エルメス的ミニマル、金箔ロゴ）");
  console.log("  6. can-texture-*    — 和紙テクスチャ（触感の記憶、侘び寂び）");
  console.log("  7. can-lifestyle-*  — ライフスタイル（キッチンに置かれた情景）");
  console.log("  8. can-gift-*       — ギフトセット（開封の喜び）");
  console.log("\n10秒後にブラウザを閉じます...");
  await page.waitForTimeout(10000);
  await browser.close();
}

main().catch(e => { console.error("エラー:", e); process.exit(1); });
