import { chromium } from 'playwright';

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300&display=swap";

// SVG emboss filter — realistic deboss (pressed into paper)
const DEBOSS_FILTER = `
  <filter id="deboss" x="-10%" y="-10%" width="120%" height="120%"
          color-interpolation-filters="sRGB">
    <!-- Shadow: lower-right (dark, strong) -->
    <feOffset in="SourceAlpha" dx="3" dy="3" result="shOff"/>
    <feGaussianBlur in="shOff" stdDeviation="1.8" result="shBlur"/>
    <feFlood flood-color="#0a0805" flood-opacity="0.5"/>
    <feComposite in2="shBlur" operator="in" result="shadow"/>

    <!-- Highlight: upper-left (white, crisp) -->
    <feOffset in="SourceAlpha" dx="-2.2" dy="-2.2" result="hlOff"/>
    <feGaussianBlur in="hlOff" stdDeviation="1.3" result="hlBlur"/>
    <feFlood flood-color="#ffffff" flood-opacity="0.95"/>
    <feComposite in2="hlBlur" operator="in" result="highlight"/>

    <!-- Base: the pressed area itself -->
    <feFlood flood-color="#8a857a" flood-opacity="0.35"/>
    <feComposite in2="SourceAlpha" operator="in" result="base"/>

    <feMerge>
      <feMergeNode in="shadow"/>
      <feMergeNode in="highlight"/>
      <feMergeNode in="base"/>
    </feMerge>
  </filter>`;

// Subtle paper texture filter
const PAPER_FILTER = `
  <filter id="paper" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="2" result="noise"/>
    <feColorMatrix in="noise" type="saturate" values="0" result="grayNoise"/>
    <feComponentTransfer in="grayNoise" result="subtleNoise">
      <feFuncR type="linear" slope="0.03" intercept="0.985"/>
      <feFuncG type="linear" slope="0.03" intercept="0.982"/>
      <feFuncB type="linear" slope="0.03" intercept="0.975"/>
    </feComponentTransfer>
    <feBlend in="SourceGraphic" in2="subtleNoise" mode="multiply"/>
  </filter>`;

const cx = 250, cy = 250, r = 140;
const circlePath = `M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy} A ${r},${r} 0 0,1 ${cx-r},${cy}`;
const circlePathSmall = (radius) => `M ${cx-radius},${cy} A ${radius},${radius} 0 0,1 ${cx+radius},${cy} A ${radius},${radius} 0 0,1 ${cx-radius},${cy}`;
// Bottom arc (for text reading left-to-right on bottom)
const bottomPath = `M ${cx+r},${cy} A ${r},${r} 0 0,1 ${cx-r},${cy}`;

function makeSVG(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    ${DEBOSS_FILTER}
    ${PAPER_FILTER}
    <path id="topCircle" d="${circlePath}" fill="none"/>
    <path id="botArc" d="${bottomPath}" fill="none"/>
    <path id="innerCircle" d="${circlePathSmall(105)}" fill="none"/>
    <path id="outerRing" d="${circlePathSmall(155)}" fill="none"/>
    <path id="innerRing" d="${circlePathSmall(125)}" fill="none"/>
  </defs>

  <!-- Paper background -->
  <rect width="500" height="500" fill="#F5F3EE" filter="url(#paper)"/>

  <!-- Logo content with deboss -->
  <g filter="url(#deboss)">
    ${content}
  </g>
</svg>`;
}

const variants = [
  {
    name: 'emboss-svg-1',
    desc: 'Upper arc serif + full circle',
    svg: makeSVG(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="black" stroke-width="2"/>
      <text font-family="'Cormorant Garamond',serif" font-weight="400" font-size="32" letter-spacing="6" fill="black">
        <textPath href="#topCircle" startOffset="25%" text-anchor="middle">matcha &amp; me</textPath>
      </text>
    `),
  },
  {
    name: 'emboss-svg-2',
    desc: 'Upper arc sans + italic & + full circle',
    svg: makeSVG(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="black" stroke-width="2"/>
      <text font-family="'Jost',sans-serif" font-weight="200" font-size="24" letter-spacing="8" fill="black">
        <textPath href="#topCircle" startOffset="25%" text-anchor="middle">matcha</textPath>
      </text>
      <text font-family="'Cormorant Garamond',serif" font-style="italic" font-weight="300" font-size="24" fill="black">
        <textPath href="#topCircle" startOffset="25%" text-anchor="middle" dx="0 0 0 0 0 0 100">&amp;</textPath>
      </text>
      <!-- Actually let me use a different approach for the & -->
      <text x="${cx}" y="${cy+8}" text-anchor="middle"
            font-family="'Cormorant Garamond',serif" font-style="italic" font-weight="400"
            font-size="52" fill="black" opacity="0.9">&amp;</text>
    `),
  },
  {
    name: 'emboss-svg-3',
    desc: 'Top matcha + bottom & me + dots',
    svg: makeSVG(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="black" stroke-width="2"/>
      <!-- matcha on top -->
      <text font-family="'Jost',sans-serif" font-weight="300" font-size="22" letter-spacing="10" fill="black">
        <textPath href="#topCircle" startOffset="25%" text-anchor="middle">matcha</textPath>
      </text>
      <!-- & me on bottom -->
      <text font-family="'Jost',sans-serif" font-weight="300" font-size="22" letter-spacing="8" fill="black">
        <textPath href="#botArc" startOffset="50%" text-anchor="middle">&amp; me</textPath>
      </text>
      <!-- Dots -->
      <circle cx="${cx-r}" cy="${cy}" r="2.5" fill="black"/>
      <circle cx="${cx+r}" cy="${cy}" r="2.5" fill="black"/>
    `),
  },
  {
    name: 'emboss-svg-4',
    desc: 'Top matcha + bottom me + center &',
    svg: makeSVG(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="black" stroke-width="2"/>
      <!-- matcha on top -->
      <text font-family="'Cormorant Garamond',serif" font-weight="300" font-size="26" letter-spacing="7" fill="black">
        <textPath href="#topCircle" startOffset="25%" text-anchor="middle">matcha</textPath>
      </text>
      <!-- me on bottom -->
      <text font-family="'Cormorant Garamond',serif" font-weight="300" font-size="26" letter-spacing="7" fill="black">
        <textPath href="#botArc" startOffset="50%" text-anchor="middle">me</textPath>
      </text>
      <!-- Large & in center -->
      <text x="${cx}" y="${cy+18}" text-anchor="middle"
            font-family="'Cormorant Garamond',serif" font-style="italic" font-weight="400"
            font-size="80" fill="black">&amp;</text>
    `),
  },
  {
    name: 'emboss-svg-5',
    desc: 'Straight horizontal text only',
    svg: makeSVG(`
      <text x="${cx}" y="${cy+8}" text-anchor="middle"
            font-family="'Cormorant Garamond',serif" font-weight="300"
            font-size="42" letter-spacing="4" fill="black">matcha
        <tspan font-style="italic" font-weight="400" letter-spacing="2"> &amp; </tspan>
        <tspan font-style="normal" letter-spacing="4">me</tspan>
      </text>
    `),
  },
  {
    name: 'emboss-svg-6',
    desc: 'Double circle + ALL CAPS',
    svg: makeSVG(`
      <circle cx="${cx}" cy="${cy}" r="155" fill="none" stroke="black" stroke-width="1.2"/>
      <circle cx="${cx}" cy="${cy}" r="125" fill="none" stroke="black" stroke-width="1.5"/>
      <!-- Text between the two circles -->
      <text font-family="'Jost',sans-serif" font-weight="300" font-size="18" letter-spacing="12" fill="black">
        <textPath href="#outerRing" startOffset="25%" text-anchor="middle">MATCHA</textPath>
      </text>
      <text font-family="'Jost',sans-serif" font-weight="300" font-size="18" letter-spacing="12" fill="black">
        <textPath href="#outerRing" startOffset="75%" text-anchor="middle">&amp; ME</textPath>
      </text>
      <!-- Dots at 3 and 9 o'clock between circles -->
      <circle cx="${cx-140}" cy="${cy}" r="2" fill="black"/>
      <circle cx="${cx+140}" cy="${cy}" r="2" fill="black"/>
    `),
  },
];

// Render
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });

for (const v of variants) {
  const html = `<!DOCTYPE html><html><head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${FONTS_URL}" rel="stylesheet">
    <style>*{margin:0;padding:0}body{width:500px;height:500px;overflow:hidden}</style>
  </head><body>${v.svg}</body></html>`;

  await page.setViewportSize({ width: 500, height: 500 });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `design/generated/${v.name}.png`, type: 'png' });
  console.log(`✓ ${v.name} — ${v.desc}`);
}

await browser.close();
console.log('\nDone.');
