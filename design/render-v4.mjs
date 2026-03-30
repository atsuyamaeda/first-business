import { chromium } from 'playwright';

const FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@200;300;400&display=swap";
const G = '#2D5A3D';

// Place each character individually on a circle arc
function arcText(chars, startDeg, endDeg, r, cx, cy, opts = {}) {
  const { inward = false, fontFamily, fontSize, fontWeight = '400', fontStyle = '', fill = G, letterSpacingDeg = 0 } = opts;
  const n = chars.length;
  if (n === 0) return '';
  if (n === 1) {
    const θ = ((startDeg + endDeg) / 2) * Math.PI / 180;
    const x = cx + r * Math.sin(θ);
    const y = cy - r * Math.cos(θ);
    const rot = inward ? (startDeg + endDeg) / 2 - 180 : (startDeg + endDeg) / 2;
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${rot.toFixed(1)},${x.toFixed(1)},${y.toFixed(1)})" text-anchor="middle" dominant-baseline="central" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" ${fontStyle ? `font-style="${fontStyle}"` : ''} fill="${fill}">${chars[0]}</text>`;
  }

  return chars.map((char, i) => {
    const angle = startDeg + (endDeg - startDeg) * i / (n - 1);
    const θ = angle * Math.PI / 180;
    const x = cx + r * Math.sin(θ);
    const y = cy - r * Math.cos(θ);
    const rot = inward ? angle - 180 : angle;
    if (char === ' ') return '';
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${rot.toFixed(1)},${x.toFixed(1)},${y.toFixed(1)})" text-anchor="middle" dominant-baseline="central" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" ${fontStyle ? `font-style="${fontStyle}"` : ''} fill="${fill}">${char === '&' ? '&amp;' : char}</text>`;
  }).join('\n');
}

const S = 280; // viewport size
const cx = S / 2, cy = S / 2;
const r = 90;

function page(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <rect width="${S}" height="${S}" fill="white"/>
  ${content}
</svg>`;
}

const serif = "'Cormorant Garamond',serif";
const sans = "'Jost',sans-serif";

const variants = [
  {
    name: 'v4-1',
    desc: 'Serif upper arc + circle',
    svg: page(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${G}" stroke-width="1"/>
      ${arcText([...'matcha & me'], -68, 68, r - 2, cx, cy,
        { fontFamily: serif, fontSize: 18, fontWeight: '400', fill: G })}
    `),
  },
  {
    name: 'v4-2',
    desc: 'Sans top + italic & + circle',
    svg: page(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${G}" stroke-width="0.8"/>
      ${arcText([...'matcha'], -52, -6, r - 2, cx, cy,
        { fontFamily: sans, fontSize: 16, fontWeight: '300', fill: G })}
      ${arcText([...'&'], -1000, -1000, r - 2, cx, cy,
        { fontFamily: serif, fontSize: 20, fontWeight: '400', fontStyle: 'italic', fill: G })}
      ${arcText([...'me'], 18, 42, r - 2, cx, cy,
        { fontFamily: sans, fontSize: 16, fontWeight: '300', fill: G })}
    `),
  },
  {
    name: 'v4-3',
    desc: 'Top matcha + bottom & me + dots',
    svg: page(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${G}" stroke-width="0.8"/>
      ${arcText([...'matcha'], -42, 42, r - 2, cx, cy,
        { fontFamily: sans, fontSize: 15, fontWeight: '300', fill: G })}
      ${arcText([...'& me'], 218, 322, r - 2, cx, cy,
        { inward: true, fontFamily: sans, fontSize: 15, fontWeight: '300', fill: G })}
      <circle cx="${cx - r}" cy="${cy}" r="1.8" fill="${G}"/>
      <circle cx="${cx + r}" cy="${cy}" r="1.8" fill="${G}"/>
    `),
  },
  {
    name: 'v4-4',
    desc: 'Top matcha + bottom me + large center &',
    svg: page(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${G}" stroke-width="0.8"/>
      ${arcText([...'matcha'], -42, 42, r - 2, cx, cy,
        { fontFamily: serif, fontSize: 17, fontWeight: '400', fill: G })}
      ${arcText([...'me'], 252, 288, r - 2, cx, cy,
        { inward: true, fontFamily: serif, fontSize: 17, fontWeight: '400', fill: G })}
      <text x="${cx}" y="${cy + 6}" text-anchor="middle" dominant-baseline="central"
            font-family="${serif}" font-style="italic" font-weight="400"
            font-size="48" fill="${G}">&amp;</text>
    `),
  },
  {
    name: 'v4-5',
    desc: 'Double circle + CAPS',
    svg: (() => {
      const ro = 95, ri = 72;
      return page(`
        <circle cx="${cx}" cy="${cy}" r="${ro}" fill="none" stroke="${G}" stroke-width="1"/>
        <circle cx="${cx}" cy="${cy}" r="${ri}" fill="none" stroke="${G}" stroke-width="0.6"/>
        ${arcText([...'MATCHA'], -48, 48, (ro + ri) / 2, cx, cy,
          { fontFamily: sans, fontSize: 13, fontWeight: '300', fill: G })}
        ${arcText([...'& ME'], 230, 310, (ro + ri) / 2, cx, cy,
          { inward: true, fontFamily: sans, fontSize: 13, fontWeight: '300', fill: G })}
        <circle cx="${cx - (ro + ri) / 2}" cy="${cy}" r="1.5" fill="${G}"/>
        <circle cx="${cx + (ro + ri) / 2}" cy="${cy}" r="1.5" fill="${G}"/>
      `);
    })(),
  },
  {
    name: 'v4-6',
    desc: 'Upper arc + leaf',
    svg: page(`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${G}" stroke-width="0.8"/>
      ${arcText([...'matcha & me'], -62, 62, r - 2, cx, cy,
        { fontFamily: serif, fontSize: 17, fontWeight: '400', fill: G })}
      <g transform="translate(${cx}, ${cy + 52}) scale(0.8)">
        <path d="M 0,-10 C 6,-7 10,-2 10,4 C 10,10 6,14 0,16 C -6,14 -10,10 -10,4 C -10,-2 -6,-7 0,-10 Z"
              fill="none" stroke="${G}" stroke-width="0.9"/>
        <path d="M 0,-10 Q 0.5,2 0,16" fill="none" stroke="${G}" stroke-width="0.6"/>
      </g>
    `),
  },
];

// Fix v4-2: place & individually at center angle
variants[1].svg = page(`
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${G}" stroke-width="0.8"/>
  ${arcText([...'matcha'], -55, -8, r - 2, cx, cy,
    { fontFamily: sans, fontSize: 16, fontWeight: '300', fill: G })}
  ${(() => {
    const angle = 4;
    const θ = angle * Math.PI / 180;
    const x = cx + (r - 2) * Math.sin(θ);
    const y = cy - (r - 2) * Math.cos(θ);
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${angle},${x.toFixed(1)},${y.toFixed(1)})" text-anchor="middle" dominant-baseline="central" font-family="${serif}" font-size="21" font-weight="400" font-style="italic" fill="${G}">&amp;</text>`;
  })()}
  ${arcText([...'me'], 18, 42, r - 2, cx, cy,
    { fontFamily: sans, fontSize: 16, fontWeight: '300', fill: G })}
`);

const browser = await chromium.launch();
const pg = await browser.newPage({ deviceScaleFactor: 3 });

for (const v of variants) {
  await pg.setViewportSize({ width: S, height: S });
  const html = `<!DOCTYPE html><html><head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${FONTS}" rel="stylesheet">
    <style>*{margin:0;padding:0}body{width:${S}px;height:${S}px;overflow:hidden}</style>
  </head><body>${v.svg}</body></html>`;
  await pg.setContent(html);
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(500);
  await pg.screenshot({ path: `design/generated/${v.name}.png`, type: 'png' });
  console.log(`✓ ${v.name} — ${v.desc}`);
}

await browser.close();
console.log('\nDone.');
