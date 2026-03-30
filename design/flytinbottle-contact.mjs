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

  // Step 1: Navigate to form page
  console.log('Step 1: Navigating to contact form...');
  await page.goto('https://www.flytinbottle.com/contact-us/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Take initial screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/form-flytinbottle-1.png`, fullPage: true });
  console.log('Screenshot 1 saved: form structure');

  // Get labels to confirm field order
  const labels = await page.$$eval('.kb-adv-form-field label', els =>
    els.map(el => ({ text: el.textContent.trim(), for: el.getAttribute('for') }))
  );
  console.log('Labels found:', JSON.stringify(labels, null, 2));

  // Step 2: Fill in form fields by their kb_field IDs
  // Based on screenshot analysis:
  // kb_field_0 = Name (text)
  // kb_field_1 = Email (email)
  // kb_field_2 = Company name (text)
  // kb_field_3 = Phone number (tel)
  // kb_field_4 = Product type (text)
  // kb_field_5 = Country (text)
  // kb_field_6 = Message (textarea)

  console.log('Step 2: Filling in form fields...');

  // Name
  const nameField = await page.$('input[name="kb_field_0"]');
  if (nameField) {
    await nameField.fill('Atsuya Maeda');
    console.log('  Filled: Name');
  }

  // Email
  const emailField = await page.$('input[name="kb_field_1"]');
  if (emailField) {
    await emailField.fill('atsuya.maeda@duality.co.jp');
    console.log('  Filled: Email');
  }

  // Company name
  const companyField = await page.$('input[name="kb_field_2"]');
  if (companyField) {
    await companyField.fill('Duality Inc.');
    console.log('  Filled: Company');
  }

  // Phone number
  const phoneField = await page.$('input[name="kb_field_3"]');
  if (phoneField) {
    await phoneField.fill('+81-80-5686-1194');
    console.log('  Filled: Phone');
  }

  // Product type / Subject
  const productField = await page.$('input[name="kb_field_4"]');
  if (productField) {
    await productField.fill('Custom Tea Tin Manufacturing Inquiry');
    console.log('  Filled: Product type / Subject');
  }

  // Country
  const countryField = await page.$('input[name="kb_field_5"]');
  if (countryField) {
    await countryField.fill('Japan');
    console.log('  Filled: Country');
  }

  // Message
  const messageField = await page.$('textarea[name="kb_field_6"]');
  if (messageField) {
    await messageField.fill(message);
    console.log('  Filled: Message');
  }

  await page.waitForTimeout(1000);

  // Step 3: Pre-submit screenshot
  console.log('Step 3: Taking pre-submit screenshot...');
  // Scroll to top first for full view
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/form-flytinbottle-2.png`, fullPage: true });
  console.log('Screenshot 2 saved: filled form');

  // Check for reCAPTCHA
  const recaptchaIframe = await page.$('iframe[src*="recaptcha"], iframe[src*="hcaptcha"]');
  const recaptchaDiv = await page.$('.g-recaptcha, [data-sitekey]');
  if (recaptchaIframe || recaptchaDiv) {
    console.log('WARNING: reCAPTCHA/CAPTCHA detected! Cannot auto-submit.');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/form-flytinbottle-captcha.png`, fullPage: true });
    console.log('Screenshot saved: captcha detected');
    await browser.close();
    process.exit(1);
  }

  // Also check for invisible reCAPTCHA in page source
  const hasRecaptchaScript = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script[src*="recaptcha"], script[src*="hcaptcha"]');
    return scripts.length > 0;
  });
  if (hasRecaptchaScript) {
    console.log('WARNING: reCAPTCHA script detected in page (possibly invisible reCAPTCHA). Will attempt submit but may fail.');
  }

  // Step 4: Submit the form
  console.log('Step 4: Submitting form...');
  const submitBtn = await page.$('button[type="submit"], .kb-forms-submit');
  if (submitBtn) {
    await submitBtn.click();
    console.log('  Submit button clicked');
  } else {
    console.log('  WARNING: Submit button not found');
  }

  // Wait for response
  await page.waitForTimeout(5000);

  // Step 5: Post-submit screenshot
  console.log('Step 5: Taking post-submit screenshot...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/form-flytinbottle-3.png`, fullPage: true });
  console.log('Screenshot 3 saved: post-submit');

  // Check for success/error messages
  const pageText = await page.evaluate(() => document.body.innerText);
  if (pageText.includes('success') || pageText.includes('thank') || pageText.includes('Thank')) {
    console.log('SUCCESS: Form appears to have been submitted successfully');
  }
  if (pageText.includes('error') || pageText.includes('Error') || pageText.includes('failed')) {
    console.log('POSSIBLE ERROR: Error text detected on page');
  }

  console.log('Done!');
  await browser.close();
})();
