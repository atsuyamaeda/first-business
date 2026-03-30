import { chromium } from 'playwright';

const FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@200;300;400&display=swap";
const G = '#2D5A3D';
const cx = 160, cy = 160, r = 95;

// CW circle for top text (25% = top center)
const cwCircle = `M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy} A ${r},${r} 0 0,1 ${cx-r},${cy}`;
// CCW arc for bottom text reading L-to-R
const ccwBot = `M ${cx-r},${cy} A ${r},${r} 0 0,0 ${cx+r},${cy}`;

function page(w, h, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <path id="cw" d="${cwCircle}"/>
    <path id="ccw" d="${ccwBot}"/>
  </defs>
  <rect width="${w}" height="${h}" fill="white"/>
  ${content}
</svg>`;
}

const variants = [
  {
    name: 'v3-1',
    desc: 'Serif upper arc + circle',
    svg: page(320, 320, `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${G}" stroke-width="1.5"/>
      <text font-family="'Cormorant Garamond',serif" font-weight="400"
            font-size="22" letter-spacing="4" fill="${G}">
        <textPath href="#cw" startOffset="25%" text-anchor="middle">matcha  &amp;  me</textPath>
      </text>
    `),
  },
  {
    name: 'v3-2',
    desc: 'Sans + italic & on top arc',
    svg: page(320, 320, `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${G}" stroke-width="1.3"/>
      <text fill="${G}">
        <textPath href="#cw" startOffset="25%" text-anchor="middle">
          <tspan font-family="'Jost',sans-serif" font-weight="300" font-size="20" letter-spacing="5">matcha </tspan>
          <tspan font-family="'Cormorant Garamond',serif" font-style="italic" font-weight="400" font-size="23" letter-spacing="2"> &amp; </tspan>
          <tspan font-family="'Jost',sans-serif" font-weight="300" font-size="20" letter-spacing="5"> me</tspan>
        </textPath>
      </text>
    `),
  },
  {
    name: 'v3-3',
    desc: 'Top matcha + bottom & me + dots (fixed)',
    svg: page(320, 320, `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${G}" stroke-width="1.3"/>
      <text font-family="'Jost',sans-serif" font-weight="300"
            font-size="18" letter-spacing="8" fill="${G}">
        <textPath href="#cw" startOffset="25%" text-anchor="middle">matcha</textPath>
      </text>
      <text fill="${G}" dy="-6">
        <textPath href="#ccw" startOffset="50%" text-anchor="middle">
          <tspan font-family="'Cormorant Garamond',serif" font-style="italic" font-weight="400" font-size="20" letter-spacing="2">&amp;</tspan>
          <tspan font-family="'Jost',sans-serif" font-weight="300" font-size="18" letter-spacing="6">  me</tspan>
        </textPath>
      </text>
      <circle cx="${cx-r}" cy="${cy}" r="2" fill="${G}"/>
      <circle cx="${cx+r}" cy="${cy}" r="2" fill="${G}"/>
    `),
  },
  {
    name: 'v3-4',
    desc: 'Top matcha + bottom me + center & (fixed)',
    svg: page(320, 320, `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${G}" stroke-width="1.3"/>
      <text font-family="'Cormorant Garamond',serif" font-weight="400"
            font-size="20" letter-spacing="5" fill="${G}">
        <textPath href="#cw" startOffset="25%" text-anchor="middle">matcha</textPath>
      </text>
      <text font-family="'Cormorant Garamond',serif" font-weight="400"
            font-size="20" letter-spacing="5" fill="${G}" dy="-5">
        <textPath href="#ccw" startOffset="50%" text-anchor="middle">me</textPath>
      </text>
      <text x="${cx}" y="${cy+14}" text-anchor="middle"
            font-family="'Cormorant Garamond',serif" font-style="italic" font-weight="400"
            font-size="58" fill="${G}">&amp;</text>
    `),
  },
  {
    name: 'v3-5',
    desc: 'Double circle + CAPS (fixed alignment)',
    svg: (() => {
      const ro = 108, ri = 82;
      const cwOuter = `M ${cx-ro},${cy} A ${ro},${ro} 0 0,1 ${cx+ro},${cy} A ${ro},${ro} 0 0,1 ${cx-ro},${cy}`;
      const ccwOuter = `M ${cx-ro},${cy} A ${ro},${ro} 0 0,0 ${cx+ro},${cy}`;
      return page(320, 320, `
        <defs>
          <path id="cwO" d="${cwOuter}"/>
          <path id="ccwO" d="${ccwOuter}"/>
        </defs>
        <circle cx="${cx}" cy="${cy}" r="${ro}" fill="none" stroke="${G}" stroke-width="1.5"/>
        <circle cx="${cx}" cy="${cy}" r="${ri}" fill="none" stroke="${G}" stroke-width="1"/>
        <text font-family="'Jost',sans-serif" font-weight="300"
              font-size="14" letter-spacing="10" fill="${G}">
          <textPath href="#cwO" startOffset="25%" text-anchor="middle">MATCHA</textPath>
        </text>
        <text fill="${G}" dy="-6">
          <textPath href="#ccwO" startOffset="50%" text-anchor="middle">
            <tspan font-family="'Cormorant Garamond',serif" font-style="italic" font-weight="400" font-size="16">&amp;</tspan>
            <tspan font-family="'Jost',sans-serif" font-weight="300" font-size="14" letter-spacing="10">  ME</tspan>
          </textPath>
        </text>
        <circle cx="${cx-ro+13}" cy="${cy}" r="1.5" fill="${G}"/>
        <circle cx="${cx+ro-13}" cy="${cy}" r="1.5" fill="${G}"/>
      `);
    })(),
  },
  {
    name: 'v3-6',
    desc: 'Serif + small leaf at bottom',
    svg: page(320, 320, `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${G}" stroke-width="1.3"/>
      <text font-family="'Cormorant Garamond',serif" font-weight="400"
            font-size="21" letter-spacing="4" fill="${G}">
        <textPath href="#cw" startOffset="25%" text-anchor="middle">matcha  &amp;  me</textPath>
      </text>
      <g transform="translate(${cx}, ${cy+62}) scale(0.9)">
        <path d="M 0,-9 C 6,-6 9,-1 9,4 C 9,9 5,13 0,14 C -5,13 -9,9 -9,4 C -9,-1 -6,-6 0,-9 Z"
              fill="none" stroke="${G}" stroke-width="1"/>
        <path d="M 0,-9 Q 1,0 0,14" fill="none" stroke="${G}" stroke-width="0.7"/>
        <path d="M -5,3 Q -1,1 0,2" fill="none" stroke="${G}" stroke-width="0.5"/>
        <path d="M 5,6 Q 1,4 0,5" fill="none" stroke="${G}" stroke-width="0.5"/>
      </g>
    `),
  },
];

const browser = await chromium.launch();
const page2 = await browser.newPage({ deviceScaleFactor: 3 });

for (const v of variants) {
  await page2.setViewportSize({ width: 320, height: 320 });
  const html = `<!DOCTYPE html><html><head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${FONTS}" rel="stylesheet">
    <style>*{margin:0;padding:0}body{width:320px;height:320px;overflow:hidden}</style>
  </head><body>${v.svg}</body></html>`;
  await page2.setContent(html);
  await page2.evaluate(() => document.fonts.ready);
  await page2.waitForTimeout(500);
  await page2.screenshot({ path: `design/generated/${v.name}.png`, type: 'png' });
  console.log(`✓ ${v.name} — ${v.desc}`);
}

await browser.close();
console.log('\nDone.');
