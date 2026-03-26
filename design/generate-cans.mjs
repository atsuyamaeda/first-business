import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, ".playwright-profile");
const OUTPUT_DIR = path.join(__dirname, "generated");

const prompts = [
  {
    name: "pink",
    text: `高級抹茶缶のプロダクト写真を生成してください。Instagram映えする商品撮影スタイルで。

- 円筒形の缶（直径8-9cm、高さ8-10cm）
- 桜ピンク(#F2C4C4)のマット仕上げボディ
- ブランド名「COCO 抹茶」を深い抹茶グリーン(#2D6A4F)のモダンなサンセリフ体で缶の正面に大きく印刷（ラベルではなくデザインの一部として統合）
- 蓋の縁にゴールドのアクセントライン
- 大理石カウンターの上に配置
- 横に竹の茶筅と鮮やかな緑の抹茶が入った白いマグカップ
- 柔らかい自然光、左からのディレクショナルライティング
- 浅い被写界深度、85mmレンズ風のエディトリアル商品撮影
- 背景はクリーム色/白でミニマル
- 正方形（1:1）のアスペクト比`,
  },
  {
    name: "green",
    text: `高級抹茶缶のプロダクト写真を生成してください。Instagram映えする商品撮影スタイルで。

- 円筒形の缶（直径8-9cm、高さ8-10cm）
- 深い抹茶グリーン(#2D6A4F)のマット仕上げボディ（Burberry的なリッチで都会的な深緑）
- ブランド名「COCO 抹茶」を桜ピンク(#F2C4C4)のモダンなサンセリフ体で缶の正面に大きく印刷（ラベルではなくデザインの一部として統合）
- 蓋の下部にバーチウッドカラー(#D4B896)のアクセントリング
- ダークウォールナットの木の表面に配置
- 横にステンレスの茶杓、抹茶パウダーが少し散らされている
- ドラマチックなサイドライティング、ムーディな雰囲気
- 浅い被写界深度、85mmレンズ風のエディトリアル商品撮影
- 背景はダーク（チャコール/フォレストトーン）
- 正方形（1:1）のアスペクト比`,
  },
  {
    name: "white-black",
    text: `高級抹茶缶のプロダクト写真を生成してください。Instagram映えする商品撮影スタイルで。

- 円筒形の缶（直径8-9cm、高さ8-10cm）
- 本体はクリーンなマットホワイト、蓋はジェットブラックのサテン仕上げ
- ブランド名「COCO 抹茶」をマットブラックのモダンなサンセリフ体で白い本体の正面に大きく印刷（ラベルではなくデザインの一部として統合）
- 蓋と本体の間に抹茶グリーン(#2D6A4F)の細いラインが一本
- ライトグレーのコンクリート面に配置
- 横に緑茶の小枝と鮮やかな緑の抹茶ラテが入った白いカップ
- 明るくクリーンなライティング、ソフトシャドウ、Kinfolk誌のようなミニマル美学
- 浅い被写界深度、85mmレンズ風のエディトリアル商品撮影
- 背景はピュアホワイトまたは非常に薄いグレー
- 正方形（1:1）のアスペクト比`,
  },
];

async function waitForLogin(page) {
  console.log("\n========================================");
  console.log("Geminiのログイン画面が表示されています。");
  console.log("ブラウザでログインしてください。");
  console.log("ログイン完了後、自動的に続行します...");
  console.log("========================================\n");

  // Wait until we're on the Gemini app page (not login/accounts page)
  await page.waitForURL(/gemini\.google\.com\/app/, { timeout: 300000 });
  // Give it a moment to fully load
  await page.waitForTimeout(3000);
  console.log("ログイン確認！自動操作を開始します。\n");
}

async function generateImage(page, prompt, index) {
  console.log(`\n[${index + 1}/3] ${prompt.name}の缶を生成中...`);

  // If not the first prompt, start a new chat
  if (index > 0) {
    await page.waitForTimeout(2000);
    // Click "New chat" button
    const newChatBtn = page.locator('button[aria-label="New chat"], a[aria-label="New chat"], button:has-text("New chat"), button:has-text("新しいチャット")').first();
    try {
      await newChatBtn.click({ timeout: 5000 });
      await page.waitForTimeout(2000);
    } catch {
      // Fallback: navigate directly
      await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);
    }
  }

  // Find the input area and type the prompt
  // Gemini uses a rich text editor, try multiple selectors
  const inputSelectors = [
    'div[contenteditable="true"]',
    'rich-textarea div[contenteditable="true"]',
    '.ql-editor',
    'textarea',
    '[aria-label*="prompt"]',
    '[aria-label*="メッセージ"]',
  ];

  let inputEl = null;
  for (const sel of inputSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 3000 })) {
        inputEl = el;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!inputEl) {
    console.log(`  入力欄が見つかりません。スクリーンショットを保存します...`);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `debug-${prompt.name}.png`) });
    return;
  }

  await inputEl.click();
  await page.waitForTimeout(500);

  // Type the prompt (use fill for textarea, or keyboard for contenteditable)
  try {
    await inputEl.fill(prompt.text);
  } catch {
    // For contenteditable, use keyboard
    await inputEl.pressSequentially(prompt.text, { delay: 5 });
  }

  await page.waitForTimeout(1000);

  // Click send button
  const sendSelectors = [
    'button[aria-label="Send message"]',
    'button[aria-label="メッセージを送信"]',
    'button[aria-label*="Send"]',
    'button[aria-label*="送信"]',
    'button.send-button',
    'button[data-test-id="send-button"]',
  ];

  let sent = false;
  for (const sel of sendSelectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 2000 })) {
        await btn.click();
        sent = true;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!sent) {
    // Try pressing Enter
    await page.keyboard.press("Enter");
  }

  console.log(`  プロンプト送信完了。画像生成を待機中...`);

  // Wait for image to appear (Gemini generates images inline)
  // Look for img tags that appear in the response
  try {
    // Wait for response to start generating
    await page.waitForTimeout(5000);

    // Wait for an image in the response area (generous timeout for image generation)
    const imageLocator = page.locator('img[src*="blob:"], img[src*="data:image"], img[src*="lh3.googleusercontent"], img.generated-image, [data-test-id="image-result"] img, .response-container img').first();

    await imageLocator.waitFor({ state: "visible", timeout: 120000 });
    await page.waitForTimeout(5000); // Let image fully render

    // Try to find and download the image
    const images = await page.locator('img[src*="blob:"], img[src*="data:image"], img[src*="lh3.googleusercontent"], img.generated-image, [data-test-id="image-result"] img, .response-container img').all();

    if (images.length > 0) {
      // Take the last/newest image
      const img = images[images.length - 1];
      const src = await img.getAttribute("src");

      if (src) {
        // Download via page context
        const filePath = path.join(OUTPUT_DIR, `can-${prompt.name}.png`);

        if (src.startsWith("data:image")) {
          // Base64 encoded
          const base64 = src.split(",")[1];
          fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
        } else {
          // URL - download it
          const response = await page.request.get(src);
          const buffer = await response.body();
          fs.writeFileSync(filePath, buffer);
        }
        console.log(`  画像保存完了: ${filePath}`);
      }
    }

    // Also take a screenshot of the full result
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `screenshot-${prompt.name}.png`),
      fullPage: false,
    });
    console.log(`  スクリーンショット保存完了`);

  } catch (e) {
    console.log(`  画像の自動ダウンロードに失敗: ${e.message}`);
    // Take screenshot as fallback
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `screenshot-${prompt.name}.png`),
      fullPage: false,
    });
    console.log(`  フォールバック: スクリーンショットを保存しました`);
  }
}

async function main() {
  console.log("Playwright ブラウザを起動中...");
  console.log(`プロファイル保存先: ${USER_DATA_DIR}\n`);

  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = browser.pages()[0] || (await browser.newPage());

  // Navigate to Gemini
  await page.goto("https://gemini.google.com/app", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(3000);

  // Check if we need to login
  const currentUrl = page.url();
  if (!currentUrl.includes("gemini.google.com/app")) {
    await waitForLogin(page);
  } else {
    // Check if there's a login prompt on the page
    try {
      const loginIndicator = page.locator('input[type="email"], input[type="password"], [data-identifier]').first();
      if (await loginIndicator.isVisible({ timeout: 3000 })) {
        await waitForLogin(page);
      } else {
        console.log("既存のログインセッションを検出。続行します。\n");
      }
    } catch {
      console.log("ログイン済みと判断。続行します。\n");
    }
  }

  // Generate all 3 images
  for (let i = 0; i < prompts.length; i++) {
    await generateImage(page, prompts[i], i);
    // Wait between generations
    if (i < prompts.length - 1) {
      await page.waitForTimeout(3000);
    }
  }

  console.log("\n========================================");
  console.log("全3パターンの生成が完了しました！");
  console.log(`保存先: ${OUTPUT_DIR}`);
  console.log("========================================");
  console.log("\nブラウザを10秒後に閉じます...");
  await page.waitForTimeout(10000);
  await browser.close();
}

main().catch((e) => {
  console.error("エラー:", e);
  process.exit(1);
});
