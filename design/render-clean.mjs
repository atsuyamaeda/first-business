import { chromium } from 'playwright';

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@200;300;400&display=swap";

const cx = 250, cy = 250, r = 130;
const GREEN = '#2D5A3D';
const circlePath = `M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy} A ${r},${r} 0 0,1 ${cx-r},${cy}`;
const bottomArc = `M ${cx+r},${cy} A ${r},${r} 0 0,1 ${cx-r},${cy}`;

function svg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <path id="top" d="${circlePath}" fill="none"/>
    <path id="bot" d="${bottomArc}" fill="none"/>
  </defs>
  <rect width="500" height="500" fill="white"/>
  ${content}
</svg>`;
}

const C = GREEN;

const variants = [
  {
    name: 'clean-1',
    desc: 'Serif, upper arc + circle',
    svg: svg(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C}" stroke-width="1.2"/>
      <text font-family="'Cormorant Garamond',serif" font-weight="400" font-size="28" letter-spacing="5" fill="${C}">
        <textPath href="#top" startOffset="25%" text-anchor="middle">matcha &amp; me</textPath>
      </text>
    `),
  },
  {
    name: 'clean-2',
    desc: 'Sans + italic &, upper arc + circle',
    svg: svg(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C}" stroke-width="1"/>
      <text fill="${C}">
        <textPath href="#top" startOffset="25%" text-anchor="middle">
          <tspan font-family="'Jost',sans-serif" font-weight="300" font-size="24" letter-spacing="7">matcha </tspan>
          <tspan font-family="'Cormorant Garamond',serif" font-style="italic" font-weight="400" font-size="27">&amp;</tspan>
          <tspan font-family="'Jost',sans-serif" font-weight="300" font-size="24" letter-spacing="7"> me</tspan>
        </textPath>
      </text>
    `),
  },
  {
    name: 'clean-3',
    desc: 'Top matcha + bottom & me + dots',
    svg: svg(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C}" stroke-width="1"/>
      <text font-family="'Jost',sans-serif" font-weight="300" font-size="20" letter-spacing="10" fill="${C}">
        <textPath href="#top" startOffset="25%" text-anchor="middle">matcha</textPath>
      </text>
      <text fill="${C}">
        <textPath href="#bot" startOffset="50%" text-anchor="middle">
          <tspan font-family="'Cormorant Garamond',serif" font-style="italic" font-weight="400" font-size="22">&amp;</tspan>
          <tspan font-family="'Jost',sans-serif" font-weight="300" font-size="20" letter-spacing="8"> me</tspan>
        </textPath>
      </text>
      <circle cx="${cx-r}" cy="${cy}" r="2" fill="${C}"/>
      <circle cx="${cx+r}" cy="${cy}" r="2" fill="${C}"/>
    `),
  },
  {
    name: 'clean-4',
    desc: 'Top matcha + bottom me + center &',
    svg: svg(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C}" stroke-width="1"/>
      <text font-family="'Cormorant Garamond',serif" font-weight="400" font-size="24" letter-spacing="6" fill="${C}">
        <textPath href="#top" startOffset="25%" text-anchor="middle">matcha</textPath>
      </text>
      <text font-family="'Cormorant Garamond',serif" font-weight="400" font-size="24" letter-spacing="6" fill="${C}">
        <textPath href="#bot" startOffset="50%" text-anchor="middle">me</textPath>
      </text>
      <text x="${cx}" y="${cy+16}" text-anchor="middle"
            font-family="'Cormorant Garamond',serif" font-style="italic" font-weight="400"
            font-size="72" fill="${C}">&amp;</text>
    `),
  },
  {
    name: 'clean-5',
    desc: 'Double circle + caps between rings',
    svg: svg(`
      <circle cx="${cx}" cy="${cy}" r="145" fill="none" stroke="${C}" stroke-width="1.2"/>
      <circle cx="${cx}" cy="${cy}" r="115" fill="none" stroke="${C}" stroke-width="0.8"/>
      <defs>
        <path id="outerR" d="M ${cx-145},${cy} A 145,145 0 0,1 ${cx+145},${cy} A 145,145 0 0,1 ${cx-145},${cy}" fill="none"/>
        <path id="outerBot" d="M ${cx+145},${cy} A 145,145 0 0,1 ${cx-145},${cy}" fill="none"/>
      </defs>
      <text font-family="'Jost',sans-serif" font-weight="300" font-size="16" letter-spacing="14" fill="${C}">
        <textPath href="#outerR" startOffset="25%" text-anchor="middle">MATCHA</textPath>
      </text>
      <text fill="${C}">
        <textPath href="#outerBot" startOffset="50%" text-anchor="middle">
          <tspan font-family="'Cormorant Garamond',serif" font-style="italic" font-weight="400" font-size="18">&amp;</tspan>
          <tspan font-family="'Jost',sans-serif" font-weight="300" font-size="16" letter-spacing="14"> ME</tspan>
        </textPath>
      </text>
      <circle cx="${cx-130}" cy="${cy}" r="1.8" fill="${C}"/>
      <circle cx="${cx+130}" cy="${cy}" r="1.8" fill="${C}"/>
    `),
  },
  {
    name: 'clean-6',
    desc: 'Circle + leaf + serif text',
    svg: svg(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C}" stroke-width="1"/>
      <text font-family="'Cormorant Garamond',serif" font-weight="400" font-size="26" letter-spacing="5" fill="${C}">
        <textPath href="#top" startOffset="25%" text-anchor="middle">matcha &amp; me</textPath>
      </text>
      <!-- Small tea leaf at bottom of circle -->
      <g transform="translate(${cx}, ${cy+85})">
        <path d="M 0,-10 C 5,-8 8,-3 8,2 C 8,7 5,11 0,12 C -5,11 -8,7 -8,2 C -8,-3 -5,-8 0,-10 Z"
              fill="none" stroke="${C}" stroke-width="0.8"/>
        <path d="M 0,-10 C 0,-4 0,4 0,12" fill="none" stroke="${C}" stroke-width="0.6"/>
      </g>
    `),
  },
];

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
