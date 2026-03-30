---
name: generate-image
description: 画像生成・画像作成の依頼時に使用。「画像を作って」「画像生成して」「デザインを生成」「モックアップ作って」「写真を生成」等のリクエストに自動で反応する。Gemini（Google AI）をPlaywrightで操作して画像を生成・保存する。
argument-hint: "プロンプト or 指示内容"
---

# Gemini 画像生成スキル

Playwright を使って Gemini（gemini.google.com）にアクセスし、画像を生成して保存する。

## 前提条件

- Playwright と Chromium がインストール済み（`npx playwright install chromium`）
- `design/` ディレクトリに `playwright` パッケージがインストール済み
- 初回ログインは手動で行い、以降は永続化されたプロファイルを使用

## 実行手順

### 1. 引数の解釈

`$ARGUMENTS` をもとに、以下を決定する:
- **生成するプロンプト**: 画像の内容・スタイルの指示
- **出力ファイル名**: 引数から推測、または `generated-{timestamp}.png`
- **枚数**: 指定がなければ1枚

### 2. スクリプトの生成と実行

以下のテンプレートをベースに、引数に応じた Playwright スクリプトを `design/generate-image-run.mjs` に書き出して `node` で実行する。

```javascript
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, ".playwright-profile");
const OUTPUT_DIR = path.join(__dirname, "generated");

// --- ここにプロンプトと出力ファイル名を動的に設定 ---
const PROMPTS = [
  { name: "output-name", text: "プロンプト内容" }
];

async function waitForLogin(page) {
  console.log("\\nGeminiのログイン画面が表示されています。ブラウザでログインしてください...");
  await page.waitForURL(/gemini\.google\.com\/app/, { timeout: 300000 });
  await page.waitForTimeout(3000);
  console.log("ログイン確認！\\n");
}

async function generateImage(page, prompt, index) {
  console.log(`\\n[${index + 1}/${PROMPTS.length}] "${prompt.name}" を生成中...`);

  // 2枚目以降は新しいチャットを開く
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

  // プロンプトを入力
  await inputEl.click();
  await page.waitForTimeout(500);
  try { await inputEl.fill(prompt.text); }
  catch { await inputEl.pressSequentially(prompt.text, { delay: 5 }); }
  await page.waitForTimeout(1000);

  // 送信ボタンを押す
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

  // 画像の出現を待つ
  try {
    await page.waitForTimeout(5000);
    const imgSelector = 'img[src*="blob:"], img[src*="data:image"], img[src*="lh3.googleusercontent"], img.generated-image, [data-test-id="image-result"] img, .response-container img';
    const imageLocator = page.locator(imgSelector).first();
    await imageLocator.waitFor({ state: "visible", timeout: 180000 });
    await page.waitForTimeout(5000);

    const images = await page.locator(imgSelector).all();
    if (images.length > 0) {
      const img = images[images.length - 1];
      const src = await img.getAttribute("src");
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
      else console.log("ログイン済み。続行。\\n");
    } catch { console.log("ログイン済み。続行。\\n"); }
  }

  for (let i = 0; i < PROMPTS.length; i++) {
    await generateImage(page, PROMPTS[i], i);
    if (i < PROMPTS.length - 1) await page.waitForTimeout(3000);
  }

  console.log("\\n全画像の生成完了！");
  console.log(`保存先: ${OUTPUT_DIR}`);
  console.log("10秒後にブラウザを閉じます...");
  await page.waitForTimeout(10000);
  await browser.close();
}

main().catch(e => { console.error("エラー:", e); process.exit(1); });
```

### 3. 実行方法

```bash
node design/generate-image-run.mjs
```

### 4. 出力

- 生成画像: `design/generated/{name}.png`
- スクリーンショット: `design/generated/screenshot-{name}.png`
- デバッグ用（失敗時）: `design/generated/debug-{name}.png`

## 注意事項

- 初回実行時はログイン画面が出るので、ユーザーに手動ログインしてもらう
- プロファイルは `design/.playwright-profile/` に永続化されるので、2回目以降は自動ログイン
- Geminiの UI が変わるとセレクタが壊れる可能性がある。その場合はブラウザのDevToolsで最新のセレクタを確認して更新する
- 画像の自動ダウンロードに失敗した場合はスクリーンショットがフォールバックとして保存される
