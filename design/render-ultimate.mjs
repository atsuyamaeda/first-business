import { chromium } from 'playwright';

// ─── Ensō path (filled brush-stroke with pressure dynamics) ───
// Mean radius 28, width varies 1.5 (tips) → 5.5 (7 o'clock)
// Outer edge CW, inner edge CCW → ring fill
const ENSO = `
  M 14 -25
  C 23 -20, 30 -11, 30 0
  C 30 11, 25 21, 15 26
  C 6 32, -6 32, -15 27
  C -25 21, -30 11, -30 0
  C -30 -11, -23 -20, -14 -25
  L -14 -24
  C -22 -19, -26 -9, -26 0
  C -26 9, -20 17, -13 22
  C -5 26, 5 27, 13 22
  C 21 18, 27 10, 27 0
  C 27 -10, 22 -19, 14 -24
  Z
`.replace(/\n\s+/g, ' ').trim();

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,200;0,300;0,400&family=Cormorant+Garamond:ital,wght@0,400;1,300;1,400;1,500&display=swap";

// ─── Color palettes ───
const LIGHT = {
  bg: '#FAF9F7',
  text: '#1D1D1B',
  green: '#3A6B4E',
};
const DARK = {
  bg: '#141413',
  text: '#EDE9E3',
  green: '#6B9E7A',
};

function makeHTML({ width, height, colors, content }) {
  return `<!DOCTYPE html>
<html>
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONTS_URL}" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${width}px;
      height: ${height}px;
      background: ${colors.bg};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body>${content}</body>
</html>`;
}

// ─── Variant: Horizontal Wordmark ───
function wordmark(colors, fontSize = 54) {
  const ensoSize = fontSize * 1.08;
  return `
  <div style="display:flex; align-items:center;">
    <span style="
      font-family:'Jost',sans-serif;
      font-weight:300;
      font-size:${fontSize}px;
      letter-spacing:0.13em;
      color:${colors.text};
      line-height:1;
    ">matcha</span>

    <svg width="${ensoSize}" height="${ensoSize}" viewBox="-34 -34 68 68"
         style="margin:0 ${fontSize * 0.12}px; flex-shrink:0;">
      <path d="${ENSO}" fill="${colors.green}" opacity="0.88"/>
      <text x="-1" y="5" text-anchor="middle"
            font-family="'Cormorant Garamond',serif"
            font-style="italic" font-weight="400"
            font-size="33" fill="${colors.text}">&amp;</text>
    </svg>

    <span style="
      font-family:'Jost',sans-serif;
      font-weight:300;
      font-size:${fontSize}px;
      letter-spacing:0.13em;
      color:${colors.text};
      line-height:1;
    ">me</span>
  </div>`;
}

// ─── Variant: Pure Typography (no ensō) ───
function pureType(colors, fontSize = 54) {
  return `
  <div style="display:flex; align-items:baseline; gap:${fontSize * 0.22}px;">
    <span style="
      font-family:'Jost',sans-serif;
      font-weight:300;
      font-size:${fontSize}px;
      letter-spacing:0.13em;
      color:${colors.text};
    ">matcha</span>

    <span style="
      font-family:'Cormorant Garamond',serif;
      font-style:italic;
      font-weight:400;
      font-size:${fontSize * 0.88}px;
      color:${colors.green};
    ">&amp;</span>

    <span style="
      font-family:'Jost',sans-serif;
      font-weight:300;
      font-size:${fontSize}px;
      letter-spacing:0.13em;
      color:${colors.text};
    ">me</span>
  </div>`;
}

// ─── Variant: Icon Mark ───
function iconMark(colors) {
  return `
  <svg width="240" height="240" viewBox="-44 -44 88 88">
    <path d="${ENSO}" fill="${colors.green}" opacity="0.88"/>
    <text x="-1" y="6" text-anchor="middle"
          font-family="'Cormorant Garamond',serif"
          font-style="italic" font-weight="400"
          font-size="40" fill="${colors.text}">&amp;</text>
  </svg>`;
}

// ─── Variant: Stacked ───
function stacked(colors) {
  const ensoSmall = 38;
  return `
  <div style="display:flex; flex-direction:column; align-items:center;">
    <span style="
      font-family:'Jost',sans-serif;
      font-weight:300;
      font-size:72px;
      letter-spacing:0.15em;
      color:${colors.text};
      line-height:1;
    ">matcha</span>

    <div style="display:flex; align-items:center; margin-top:12px; gap:6px;">
      <svg width="${ensoSmall}" height="${ensoSmall}" viewBox="-34 -34 68 68" style="flex-shrink:0;">
        <path d="${ENSO}" fill="${colors.green}" opacity="0.88"/>
        <text x="-1" y="5" text-anchor="middle"
              font-family="'Cormorant Garamond',serif"
              font-style="italic" font-weight="400"
              font-size="33" fill="${colors.text}">&amp;</text>
      </svg>
      <span style="
        font-family:'Jost',sans-serif;
        font-weight:300;
        font-size:32px;
        letter-spacing:0.13em;
        color:${colors.text};
        line-height:1;
      ">me</span>
    </div>
  </div>`;
}

// ─── Render all variants ───
const variants = [
  { name: 'logo-ultimate',       w: 780, h: 200, content: (c) => wordmark(c) ,      colors: LIGHT },
  { name: 'logo-ultimate-dark',  w: 780, h: 200, content: (c) => wordmark(c),        colors: DARK },
  { name: 'logo-ultimate-pure',  w: 700, h: 180, content: (c) => pureType(c),        colors: LIGHT },
  { name: 'logo-ultimate-pure-dark', w: 700, h: 180, content: (c) => pureType(c),    colors: DARK },
  { name: 'logo-ultimate-icon',  w: 280, h: 280, content: (c) => iconMark(c),        colors: LIGHT },
  { name: 'logo-ultimate-icon-dark', w: 280, h: 280, content: (c) => iconMark(c),    colors: DARK },
  { name: 'logo-ultimate-stacked', w: 460, h: 280, content: (c) => stacked(c),       colors: LIGHT },
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const v of variants) {
  await page.setViewportSize({ width: v.w, height: v.h });

  const html = makeHTML({
    width: v.w,
    height: v.h,
    colors: v.colors,
    content: v.content(v.colors),
  });

  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  // Extra wait for font rendering
  await page.waitForTimeout(300);

  await page.screenshot({
    path: `design/generated/${v.name}.png`,
    type: 'png',
  });
  console.log(`✓ ${v.name}.png`);
}

await browser.close();
console.log('\nDone — all variants rendered.');
