import { chromium } from 'playwright';

const SCREENSHOT_DIR = '/Users/atauya/first-business/first-business/design/generated';

const message = `Dear Sir/Madam,

My name is Atsuya Maeda, founder of Duality Inc., a Japanese matcha brand currently in the development phase. I am reaching out to inquire about custom tea tin and tea scoop manufacturing.

■ Product Overview
We are developing a premium matcha canister that integrates a tea scoop inside the tin, enabling an "open and serve" experience.

■ Tea Tin Specifications
- Shape: Flat round tin (shallow, compact-style design)
- Diameter: 110-120mm
- Height: 40-50mm
- Capacity: 30g matcha powder (approx. 15 servings)
- Material: Tinplate or aluminum (food grade)
- Lid structure: Double lid
  - Outer lid: Slip-on type with custom brand design printing. A scoop holder mechanism is mounted on the underside of this lid. The scoop sits horizontally in the space between the outer and inner lids.
  - Inner lid: Airtight seal with food-grade silicone gasket
- Airtightness: Must maintain freshness for 30 days after opening
- Printing: Full custom design on outer lid and body

■ Tea Scoop Specifications
- Material: Stainless steel (SUS304)
- Total length: 80-90mm (must fit within the tin diameter)
- Scoop head: approx. 25mm wide x 30mm long x 5mm deep
- Measuring: One level scoop = approx. 2g of matcha
- Mounting: Magnetic or silicone clip, fixed horizontally on the underside of the outer lid

■ Questions
1. Can you manufacture flat round tins with the above specifications?
2. Can you also manufacture the stainless steel tea scoop and the lid-mounted holder mechanism?
3. What is the MOQ?
4. What is the estimated unit price?
5. Lead time and cost for samples?
6. Printing options available?
7. Food safety certifications held?

Thank you for your time.

Atsuya Maeda
Founder, Duality Inc.
Phone: +81-80-5686-1194
Email: atsuya.maeda@duality.co.jp`;

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Step 1: Navigate to the contact page
  console.log('Step 1: Navigating to contact page...');
  await page.goto('https://tinwonder.com/contact-us/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Dismiss cookie banner if present
  try {
    const agreeBtn = await page.$('text=I Agree');
    if (agreeBtn && await agreeBtn.isVisible()) {
      await agreeBtn.click();
      console.log('Dismissed cookie banner');
      await page.waitForTimeout(500);
    }
  } catch (e) {
    console.log('No cookie banner or could not dismiss');
  }

  // Take initial screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/form-tinwonder-1.png`, fullPage: true });
  console.log('Screenshot 1 saved: form structure');

  // Step 2: Fill the visible form fields using specific IDs from the visible form (ff_4_2_*)
  console.log('Step 2: Filling form fields...');

  // Name field
  await page.fill('#ff_4_2_input_text', 'Atsuya Maeda');
  console.log('Filled: Name');

  // Email field
  await page.fill('#ff_4_2_email', 'atsuya.maeda@duality.co.jp');
  console.log('Filled: Email');

  // Contact Number field
  await page.fill('#ff_4_2_input_text_1', '+81-80-5686-1194');
  console.log('Filled: Phone');

  // Company Name field
  await page.fill('#ff_4_2_input_text_2', 'Duality Inc.');
  console.log('Filled: Company');

  // Message field
  await page.fill('#ff_4_2_description', message);
  console.log('Filled: Message');

  await page.waitForTimeout(1000);

  // Step 3: Screenshot before submission
  await page.screenshot({ path: `${SCREENSHOT_DIR}/form-tinwonder-2.png`, fullPage: true });
  console.log('Screenshot 2 saved: filled form before submission');

  // Check for reCAPTCHA
  const hasRecaptcha = await page.evaluate(() => {
    return !!(
      document.querySelector('.g-recaptcha') ||
      document.querySelector('[data-sitekey]') ||
      document.querySelector('iframe[src*="recaptcha"]') ||
      document.querySelector('.recaptcha') ||
      document.querySelector('[class*="captcha" i]')
    );
  });

  if (hasRecaptcha) {
    console.log('WARNING: reCAPTCHA detected! Cannot auto-submit.');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/form-tinwonder-recaptcha.png`, fullPage: true });
    console.log('Screenshot saved showing reCAPTCHA. Manual submission required.');
    await browser.close();
    process.exit(0);
  }

  // Step 4: Submit the form - find Submit Form button in the visible form
  console.log('Step 4: Submitting form...');

  // The submit button is inside the second form (the visible one)
  // Look for button with text "Submit Form"
  const submitBtn = await page.$('.fluentform >> nth=1 >> button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    console.log('Clicked submit button (form context)');
  } else {
    // Try other approaches
    const buttons = await page.$$('button[type="submit"]');
    for (const btn of buttons) {
      if (await btn.isVisible()) {
        await btn.click();
        console.log('Clicked visible submit button');
        break;
      }
    }
    // Also try input[type=submit]
    if (buttons.length === 0) {
      const inputs = await page.$$('input[type="submit"]');
      for (const inp of inputs) {
        if (await inp.isVisible()) {
          await inp.click();
          console.log('Clicked visible submit input');
          break;
        }
      }
    }
    // Try by text
    try {
      await page.click('button:visible:has-text("Submit")');
      console.log('Clicked submit by text');
    } catch(e) {
      console.log('Trying broader click...');
      try {
        await page.click('text=Submit Form');
        console.log('Clicked "Submit Form" text');
      } catch(e2) {
        console.log('Could not find submit button:', e2.message);
      }
    }
  }

  // Step 5: Wait and take post-submission screenshot
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/form-tinwonder-3.png`, fullPage: true });
  console.log('Screenshot 3 saved: after submission');

  await browser.close();
  console.log('Done!');
})();
