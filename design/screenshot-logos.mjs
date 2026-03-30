import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import path from 'path';

const browser = await chromium.launch();
const page = await browser.newPage();

const logos = ['logo-C', 'logo-D', 'logo-E', 'logo-F'];

for (const logo of logos) {
  const svgPath = path.resolve(`design/generated/${logo}.svg`);
  const svgContent = readFileSync(svgPath, 'utf-8');

  // Get viewBox dimensions
  const viewBoxMatch = svgContent.match(/viewBox="0 0 (\d+) (\d+)"/);
  const width = parseInt(viewBoxMatch[1]);
  const height = parseInt(viewBoxMatch[2]);

  await page.setViewportSize({ width: width, height: height });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head><style>
      * { margin: 0; padding: 0; }
      body { width: ${width}px; height: ${height}px; overflow: hidden; }
      svg { width: 100%; height: 100%; }
    </style></head>
    <body>${svgContent}</body>
    </html>
  `);

  await page.screenshot({
    path: `design/generated/screenshot-${logo}.png`,
    type: 'png',
  });
  console.log(`Saved screenshot-${logo}.png`);
}

await browser.close();
