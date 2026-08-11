// Embeds Alex's original logo file (instaSEPA-logo-dark.png, 1920x1071,
// background #081A54) as the base64 module src/mark.js, and composites the
// link-preview image og.png (1200x630) from it into src/og.js.
//
// The logo file itself is the source of truth. Replace it and re-run:
//   node malta/scripts/gen-assets.mjs
// (sharp comes from the crypto project's node_modules on the Hetzner box)

import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('/root/claudealex/smartiban-crypto-checkout/x.js');
const sharp = require('sharp');

const NAVY = '#081A54';
const SILVER = '#C9CED8';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const logoPath = join(root, 'instaSEPA-logo-dark.png');

// /mark.png serves Alex's file byte for byte.
const logo = readFileSync(logoPath);
writeFileSync(join(root, 'src', 'mark.js'), 'export default "' + logo.toString('base64') + '";\n');

// og.png: the logo on a matching navy canvas with the page caption.
const scaledLogo = await sharp(logoPath).resize({ width: 720 }).png().toBuffer();
const scaledMeta = await sharp(scaledLogo).metadata();
const captionSvg = '<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">' +
  '<text x="600" y="510" font-family="Arial, Helvetica, sans-serif" font-size="40" fill="#FFFFFF" text-anchor="middle">Malta: instant SEPA payments at the point of sale</text>' +
  '<text x="600" y="568" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="' + SILVER + '" text-anchor="middle">Tap &amp; Pay with your banking app.</text>' +
  '</svg>';
const og = await sharp({ create: { width: 1200, height: 630, channels: 4, background: NAVY } })
  .composite([
    { input: scaledLogo, left: Math.round((1200 - scaledMeta.width) / 2), top: 28 },
    { input: Buffer.from(captionSvg), left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9, palette: true })
  .toBuffer();
writeFileSync(join(root, 'og.png'), og);
writeFileSync(join(root, 'src', 'og.js'), 'export default "' + og.toString('base64') + '";\n');

console.log('mark.js from original', logo.length, 'bytes; og.png', og.length, 'bytes,', scaledMeta.width + 'x' + scaledMeta.height, 'logo on canvas');
