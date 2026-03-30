import { chromium } from 'playwright';

const SCREENSHOT_DIR = '/Users/atauya/first-business/first-business/design/generated';

const inquiry = `抹茶ブランドの立ち上げに伴い、オリジナル茶缶および付属の茶杓の製造についてご相談させていただきたく、ご連絡いたしました。

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
    // Step 1: Access the form page
    console.log('Step 1: Accessing form page...');
    await page.goto('https://www.shizukan.co.jp/contact/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/form-shizucan-1.png`, fullPage: true });
    console.log('Screenshot 1 saved');

    // Step 2: Fill in the form with exact field names
    console.log('Step 2: Filling form...');

    // 会社名
    await page.fill('#company_name', '株式会社Duality');

    // お取引状況: ご新規 (radio, value="1")
    await page.click('input[name="question"][value="1"]');

    // 業種: 流通・小売系（日本茶） seems most relevant for matcha
    await page.selectOption('select[name="job"]', '1'); // 流通・小売系（日本茶）

    // お名前: 姓(name01) / 名(name02)
    await page.fill('#name01', '前田');
    await page.fill('#name02', '敦也');

    // フリガナ: セイ(kana01) / メイ(kana02)
    await page.fill('#kana01', 'マエダ');
    await page.fill('#kana02', 'アツヤ');

    // 郵便番号: zip01 / zip02
    await page.fill('#zip01', '160');
    await page.fill('#zip02', '0022');

    // 都道府県: 東京都 (value="13")
    await page.selectOption('select[name="pref"]', '13');

    // 住所: addr01 (市区町村名) / addr02 (番地・ビル名)
    await page.fill('#addr01', '新宿区新宿');
    await page.fill('#addr02', '2-2-1-1402');

    // 電話番号: tel01 / tel02 / tel03
    await page.fill('input[name="tel01"]', '080');
    await page.fill('input[name="tel02"]', '5686');
    await page.fill('input[name="tel03"]', '1194');

    // メールアドレス / メールアドレス（確認）
    await page.fill('#email', 'atsuya.maeda@duality.co.jp');
    await page.fill('input[name="email02"]', 'atsuya.maeda@duality.co.jp');

    // お問い合わせ内容
    await page.fill('#contents', inquiry);

    await page.waitForTimeout(1000);

    // Step 3: Pre-submission screenshot
    console.log('Step 3: Taking pre-submission screenshot...');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/form-shizucan-2.png`, fullPage: true });
    console.log('Screenshot 2 saved: filled form');

    // Check for reCAPTCHA
    const hasRecaptcha = await page.evaluate(() => {
      return !!(
        document.querySelector('.g-recaptcha') ||
        document.querySelector('iframe[src*="recaptcha"]') ||
        document.querySelector('[data-sitekey]')
      );
    });

    if (hasRecaptcha) {
      console.log('WARNING: reCAPTCHA detected! Cannot auto-submit.');
      await page.screenshot({ path: `${SCREENSHOT_DIR}/form-shizucan-recaptcha.png`, fullPage: true });
      await browser.close();
      process.exit(0);
    }

    // Step 4: Click 確認ページへ button
    console.log('Step 4: Clicking confirm button...');
    await page.click('input[name="confirm"]');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Screenshot after clicking confirm
    await page.screenshot({ path: `${SCREENSHOT_DIR}/form-shizucan-3.png`, fullPage: true });
    console.log('Screenshot 3 saved: confirmation page or result');

    // Check if we're on a confirmation page (look for final submit button)
    const finalSubmitBtn = await page.locator('input[type="submit"][name="send"], input[type="submit"][value*="送信"], button:has-text("送信")').first();
    if (await finalSubmitBtn.count() > 0) {
      console.log('Confirmation page detected. Reviewing and submitting...');

      // Check for reCAPTCHA on confirmation page
      const hasRecaptcha2 = await page.evaluate(() => {
        return !!(
          document.querySelector('.g-recaptcha') ||
          document.querySelector('iframe[src*="recaptcha"]') ||
          document.querySelector('[data-sitekey]')
        );
      });

      if (hasRecaptcha2) {
        console.log('WARNING: reCAPTCHA detected on confirmation page!');
        await page.screenshot({ path: `${SCREENSHOT_DIR}/form-shizucan-recaptcha.png`, fullPage: true });
        await browser.close();
        process.exit(0);
      }

      await finalSubmitBtn.click();
      console.log('Clicked final submit');
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle').catch(() => {});

      await page.screenshot({ path: `${SCREENSHOT_DIR}/form-shizucan-4.png`, fullPage: true });
      console.log('Screenshot 4 saved: after final submission');
    } else {
      // Maybe directly submitted or error page
      console.log('No further submit button found. Checking page state...');

      // Try looking for other submit buttons
      const anySubmit = await page.locator('input[type="submit"]').all();
      console.log(`Found ${anySubmit.length} submit buttons`);
      for (const btn of anySubmit) {
        const val = await btn.getAttribute('value');
        const name = await btn.getAttribute('name');
        console.log(`  Button: name=${name}, value=${val}`);
      }
    }

    console.log('Done!');

  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/form-shizucan-error.png`, fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
