import { chromium } from 'playwright';

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,200;0,300;0,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400;1,500&family=Playfair+Display:ital,wght@1,400&display=swap";

// ─── Refined ensō: thinner, more elegant ───
// Stroked arc approach (clean circular arc + subtle pressure accent)
function ensoSVG(size, colors, ampSize = 30) {
  const r = 26;
  return `
    <svg width="${size}" height="${size}" viewBox="-36 -36 72 72" style="flex-shrink:0;">
      <!-- Main arc: thin, clean stroke -->
      <path d="M ${r * Math.sin(25 * Math.PI/180)} ${-r * Math.cos(25 * Math.PI/180)}
               A ${r} ${r} 0 1 1 ${r * Math.sin(335 * Math.PI/180)} ${-r * Math.cos(335 * Math.PI/180)}"
            fill="none" stroke="${colors.green}" stroke-width="1.6"
            stroke-linecap="round" opacity="0.92"/>
      <!-- Pressure accent: bottom-left thicker -->
      <path d="M ${r * Math.sin(200 * Math.PI/180)} ${-r * Math.cos(200 * Math.PI/180)}
               A ${r} ${r} 0 0 1 ${r * Math.sin(280 * Math.PI/180)} ${-r * Math.cos(280 * Math.PI/180)}"
            fill="none" stroke="${colors.green}" stroke-width="3.8"
            stroke-linecap="round" opacity="0.18"/>
      <!-- & -->
      <text x="0" y="${ampSize * 0.16}" text-anchor="middle"
            font-family="'Cormorant Garamond',serif"
            font-style="italic" font-weight="400"
            font-size="${ampSize}" fill="${colors.text}">&amp;</text>
    </svg>`;
}

const LIGHT = { bg: '#FAF9F7', text: '#1D1D1B', green: '#3A6B4E' };
const DARK  = { bg: '#131312', text: '#ECE8E1', green: '#6B9E7A' };

function html(w, h, colors, body) {
  return `<!DOCTYPE html><html><head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONTS_URL}" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{width:${w}px;height:${h}px;background:${colors.bg};
         display:flex;align-items:center;justify-content:center;
         overflow:hidden;-webkit-font-smoothing:antialiased}
  </style></head><body>${body}</body></html>`;
}

// ─── A: Pure typography (推奨) ───
function pureA(colors, weight = 300, fs = 52) {
  return `<div style="display:flex;align-items:baseline;">
    <span style="font-family:'Jost',sans-serif;font-weight:${weight};font-size:${fs}px;
                 letter-spacing:0.1em;color:${colors.text}">matcha</span>
    <span style="font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;
                 font-size:${fs * 0.92}px;color:${colors.green};
                 margin:0 ${fs * 0.08}px">&amp;</span>
    <span style="font-family:'Jost',sans-serif;font-weight:${weight};font-size:${fs}px;
                 letter-spacing:0.1em;color:${colors.text}">me</span>
  </div>`;
}

// ─── B: Pure typography, ultra-thin (200) ───
function pureB(colors) {
  return pureA(colors, 200, 56);
}

// ─── C: All caps ───
function allCaps(colors) {
  return `<div style="display:flex;align-items:baseline;">
    <span style="font-family:'Jost',sans-serif;font-weight:300;font-size:44px;
                 letter-spacing:0.22em;color:${colors.text};text-transform:uppercase">matcha</span>
    <span style="font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;
                 font-size:42px;color:${colors.green};
                 margin:0 12px">&amp;</span>
    <span style="font-family:'Jost',sans-serif;font-weight:300;font-size:44px;
                 letter-spacing:0.22em;color:${colors.text};text-transform:uppercase">me</span>
  </div>`;
}

// ─── D: Ensō (refined thin stroke) ───
function ensoD(colors) {
  return `<div style="display:flex;align-items:center;">
    <span style="font-family:'Jost',sans-serif;font-weight:300;font-size:52px;
                 letter-spacing:0.1em;color:${colors.text};line-height:1">matcha</span>
    <div style="margin:0 4px">${ensoSVG(54, colors, 30)}</div>
    <span style="font-family:'Jost',sans-serif;font-weight:300;font-size:52px;
                 letter-spacing:0.1em;color:${colors.text};line-height:1">me</span>
  </div>`;
}

// ─── E: Stacked with ensō ───
function stackedE(colors) {
  return `<div style="display:flex;flex-direction:column;align-items:center">
    <span style="font-family:'Jost',sans-serif;font-weight:200;font-size:68px;
                 letter-spacing:0.12em;color:${colors.text};line-height:1">matcha</span>
    <div style="display:flex;align-items:center;margin-top:10px;gap:4px">
      <div>${ensoSVG(30, colors, 18)}</div>
      <span style="font-family:'Jost',sans-serif;font-weight:300;font-size:28px;
                   letter-spacing:0.1em;color:${colors.text};line-height:1">me</span>
    </div>
  </div>`;
}

// ─── F: Icon (ensō + &) ───
function iconF(colors) {
  return ensoSVG(200, colors, 76);
}

// ─── G: Playfair & variant ───
function playfairG(colors) {
  return `<div style="display:flex;align-items:baseline;">
    <span style="font-family:'Jost',sans-serif;font-weight:300;font-size:52px;
                 letter-spacing:0.1em;color:${colors.text}">matcha</span>
    <span style="font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
                 font-size:46px;color:${colors.green};
                 margin:0 6px">&amp;</span>
    <span style="font-family:'Jost',sans-serif;font-weight:300;font-size:52px;
                 letter-spacing:0.1em;color:${colors.text}">me</span>
  </div>`;
}

const variants = [
  // Pure typography
  { name: 'v2-pure-300',       w: 660, h: 160, fn: pureA,     c: LIGHT },
  { name: 'v2-pure-200',       w: 700, h: 160, fn: pureB,     c: LIGHT },
  { name: 'v2-allcaps',        w: 700, h: 160, fn: allCaps,   c: LIGHT },
  { name: 'v2-playfair',       w: 660, h: 160, fn: playfairG, c: LIGHT },
  // Ensō
  { name: 'v2-enso',           w: 700, h: 160, fn: ensoD,     c: LIGHT },
  { name: 'v2-stacked',        w: 400, h: 240, fn: stackedE,  c: LIGHT },
  { name: 'v2-icon',           w: 240, h: 240, fn: iconF,     c: LIGHT },
  // Dark variants of best
  { name: 'v2-pure-300-dark',  w: 660, h: 160, fn: pureA,     c: DARK },
  { name: 'v2-enso-dark',      w: 700, h: 160, fn: ensoD,     c: DARK },
  { name: 'v2-icon-dark',      w: 240, h: 240, fn: iconF,     c: DARK },
];

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });

for (const v of variants) {
  await page.setViewportSize({ width: v.w, height: v.h });
  await page.setContent(html(v.w, v.h, v.c, v.fn(v.c)));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `design/generated/${v.name}.png`, type: 'png' });
  console.log(`✓ ${v.name}`);
}

await browser.close();
console.log('\nDone.');
