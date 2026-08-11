// Generates the instaSEPA mark (mark.png) and the link-preview image (og.png)
// from one SVG design, then wraps both as base64 JS modules for the Worker.
//
// Design source: Alex's navy wordmark artwork (2026-08-11): gold "insta",
// white/gold contactless arcs, silver S€PA with the euro sign as the E.
//
// Run on the Hetzner box (sharp comes from the crypto project):
//   node malta/scripts/gen-assets.mjs

import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('/root/claudealex/smartiban-crypto-checkout/x.js');
const sharp = require('sharp');

const NAVY = '#16235F';
const GOLD = '#FFC400';
const SILVER = '#C9CED8';

function arcs(cx, cy, sw, radii) {
  return radii.map((r, i) => {
    const d = +(r * Math.SQRT1_2).toFixed(2);
    return '<path d="M ' + (cx + d) + ' ' + (cy - d) +
      ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + d) + ' ' + (cy + d) + '"' +
      ' fill="none" stroke="' + (i % 2 === 0 ? '#FFFFFF' : GOLD) + '"' +
      ' stroke-width="' + sw + '" stroke-linecap="round"/>';
  }).join('');
}

// Wordmark content on a 640x360 canvas, navy background included.
function wordmark(withBackground) {
  return (withBackground ? '<rect width="640" height="360" rx="0" fill="' + NAVY + '"/>' : '') +
    '<text x="38" y="112" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="82" fill="' + GOLD + '" letter-spacing="2">insta</text>' +
    arcs(310, 74, 11, [12, 24, 36, 48]) +
    '<text x="26" y="330" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="176" fill="' + SILVER + '">' +
    '<tspan>S</tspan>' +
    '<tspan font-size="200" dy="10" fill="' + GOLD + '" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round" paint-order="stroke">&#8364;</tspan>' +
    '<tspan dy="-10">PA</tspan>' +
    '</text>';
}

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// mark.png: 3x of the ~320px display size, rounded corners.
const markSvg = '<svg width="1280" height="720" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="640" height="360" rx="28" fill="' + NAVY + '"/>' + wordmark(false) + '</svg>';
const mark = await sharp(Buffer.from(markSvg)).png({ compressionLevel: 9, palette: true }).toBuffer();
writeFileSync(join(root, 'mark.png'), mark);
writeFileSync(join(root, 'src', 'mark.js'), 'export default "' + mark.toString('base64') + '";\n');

// og.png: 1200x630 navy card with the wordmark and the page caption.
const ogSvg = '<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="1200" height="630" fill="' + NAVY + '"/>' +
  '<svg x="280" y="30" width="640" height="360" viewBox="0 0 640 360">' + wordmark(false) + '</svg>' +
  '<text x="600" y="500" font-family="Arial, Helvetica, sans-serif" font-size="40" fill="#FFFFFF" text-anchor="middle">Malta: instant SEPA payments at the point of sale</text>' +
  '<text x="600" y="562" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="' + SILVER + '" text-anchor="middle">Tap &amp; Pay with your banking app.</text>' +
  '</svg>';
const og = await sharp(Buffer.from(ogSvg)).png({ compressionLevel: 9, palette: true }).toBuffer();
writeFileSync(join(root, 'og.png'), og);
writeFileSync(join(root, 'src', 'og.js'), 'export default "' + og.toString('base64') + '";\n');

console.log('mark.png', mark.length, 'bytes; og.png', og.length, 'bytes');
