import { chromium } from '@playwright/test';

const SCREENSHOT_DIR = '/Users/atauya/first-business/first-business/design/generated';

const INQUIRY_TEXT = `抹茶ブランドの立ち上げに伴い、オリジナル茶缶および付属の茶杓の製造についてご相談させていただきたく、ご連絡いたしました。

■ 製品概要
抹茶パウダーと茶杓を1つの缶に内蔵し、「缶を開けたらすぐ飲める」体験を実現するプロダクトです。

■ 茶缶の希望仕様
・形状：平型丸缶（化粧品コンパクトのような浅型デザイン）
・直径：110〜120mm
・高さ：40〜50mm
・容量：抹茶30g（約15杯分）を収納
・素材：ブリキ or アルミ（食品グレード）
・蓋構造：二重蓋（被せ式の外蓋 + パッキン付き密封内蓋）
  - 外蓋：ブランドデザインを印刷。裏面に茶杓を横向きに固定するホルダー機構を搭載（外蓋と内蓋の間の空間に茶杓が収まる構造）
  - 内蓋：食品グレードシリコンパッキンで気密性を確保
・気密性：開封後30日間の品質維持が目標
・印刷：外蓋・本体側面にカスタムデザイン印刷（銘柄ごとに複数バリエーション）
・遮光：金属缶による完全遮光

■ 茶杓の希望仕様
・素材：ステンレス（SUS304）
・全長：80〜90mm（缶の内径以内）
・すくい部：幅約25mm × 長さ約30mm × 深さ約5mm
・計量：すりきり1杯で抹茶約2g（薄茶1杯分）
・固定方式：外蓋の裏面にマグネット式またはシリコンクリップ式で横向きに固定

■ お伺いしたい点
1. 上記仕様での茶缶の製造対応の可否
2. 茶杓およびホルダー機構の製造対応の可否
3. 最小ロット数
4. 概算単価（ロット別）
5. サンプル製作の可否と費用・納期
6. カスタム印刷の対応範囲`;

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    // Step 1: Access form and screenshot
    console.log('Step 1: Navigating to contact form...');
    await page.goto('https://www.kotodo-can.co.jp/contact/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/form-kotodo-1.png`, fullPage: true });
    console.log('Screenshot 1 saved (initial form).');

    // Step 2: Fill in the form with exact field names from wpcf7
    console.log('\nStep 2: Filling in the form...');

    await page.fill('[name="your-name"]', '前田 敦也');
    console.log('  your-name: 前田 敦也');

    await page.fill('[name="your-name-kana"]', 'マエダ アツヤ');
    console.log('  your-name-kana: マエダ アツヤ');

    // 用途: "商用：小売販売" is closest to matcha retail
    await page.selectOption('[name="your-use"]', '商用：小売販売');
    console.log('  your-use: 商用：小売販売');

    await page.fill('[name="your-corporate"]', '株式会社Duality');
    console.log('  your-corporate: 株式会社Duality');

    await page.fill('[name="your-corporate-kana"]', 'カブシキガイシャデュアリティ');
    console.log('  your-corporate-kana: カブシキガイシャデュアリティ');

    // 郵便番号 is split into two fields: your-postalcode and your-postalcode02
    await page.fill('[name="your-postalcode"]', '160');
    await page.fill('[name="your-postalcode02"]', '0022');
    console.log('  postal code: 160-0022');

    // 都道府県
    await page.selectOption('[name="your-prefectures"]', '東京都');
    console.log('  prefectures: 東京都');

    await page.fill('[name="your-address"]', '新宿区新宿2-2-1-1402');
    console.log('  your-address: 新宿区新宿2-2-1-1402');

    await page.fill('[name="your-tel"]', '080-5686-1194');
    console.log('  your-tel: 080-5686-1194');

    // FAX - leave empty (skip)
    console.log('  your-fax: (empty)');

    await page.fill('[name="your-email"]', 'atsuya.maeda@duality.co.jp');
    console.log('  your-email: atsuya.maeda@duality.co.jp');

    // 会社URL - leave empty (skip)
    console.log('  your-url: (empty)');

    await page.fill('[name="your-message"]', INQUIRY_TEXT);
    console.log('  your-message: (inquiry text filled)');

    // Step 3: Screenshot before submission
    console.log('\nStep 3: Taking pre-submission screenshot...');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/form-kotodo-2.png`, fullPage: true });
    console.log('Screenshot 2 saved (filled form).');

    // Check for reCAPTCHA
    const hasRecaptcha = await page.evaluate(() => {
      return !!(document.querySelector('.g-recaptcha') ||
                document.querySelector('[data-sitekey]') ||
                document.querySelector('iframe[src*="recaptcha"]') ||
                document.querySelector('iframe[src*="hcaptcha"]'));
    });

    if (hasRecaptcha) {
      console.log('\n*** reCAPTCHA detected! Cannot submit automatically. ***');
      await page.screenshot({ path: `${SCREENSHOT_DIR}/form-kotodo-recaptcha.png`, fullPage: true });
      await browser.close();
      process.exit(0);
    }

    // Step 4: Submit - the form uses an image input for submit
    console.log('\nStep 4: Submitting form...');
    await page.click('input[type="image"]');
    console.log('  Clicked submit button.');

    // Wait for response
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/form-kotodo-3.png`, fullPage: true });
    console.log('Screenshot 3 saved (after submit).');

    // Check page state
    const responseText = await page.evaluate(() => {
      const msg = document.querySelector('.wpcf7-response-output');
      return msg ? msg.textContent.trim() : '';
    });
    console.log('Response message:', responseText);

    const pageUrl = page.url();
    console.log('Current URL:', pageUrl);

    // If there's a confirmation page, handle it
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    if (bodyText.includes('確認') && bodyText.includes('送信')) {
      console.log('Confirmation page detected, looking for final submit...');
      try {
        await page.click('text=送信');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/form-kotodo-4.png`, fullPage: true });
        console.log('Screenshot 4 saved (after final submit).');
      } catch (e) {
        console.log('No additional submit needed.');
      }
    }

    // Final screenshot
    console.log('\nStep 5: Final screenshot...');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/form-kotodo-final.png`, fullPage: true });
    console.log('Final screenshot saved.');

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/form-kotodo-error.png`, fullPage: true });
    console.log('Error screenshot saved.');
  } finally {
    await browser.close();
  }
})();
