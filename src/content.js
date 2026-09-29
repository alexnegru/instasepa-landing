// Editable content: blocks, overrides and how they merge.
//
// The page text lives in code and stays the source of truth. The admin page
// saves an override per block in KV (key `content`), and the worker splices
// those overrides into the rendered page.
//
// A block is one prose element (h1, h2, h3, p, li, the eyebrow line, the hero
// pills). Blocks are found once per isolate, by scanning the default HTML, so
// no template carries edit markers and no HTML is parsed per request.
//
// Each override stores the default it was written against. When the default
// changes in code, the override is NOT applied; the admin shows it as stale
// with both texts, so nobody's words are lost and nothing silently reverts.

export const CONTENT_KEY = 'content';

// KV is eventually consistent: a read seconds after a write can return the old
// value. Whatever this isolate wrote last is kept here for two minutes and
// preferred over a read, so a save is never undone by a stale copy and the
// page shows the new text at once.
let lastWrite = { raw: null, at: 0 };
export function noteWrite(raw) { lastWrite = { raw, at: Date.now() }; }
export function freshRaw() { return Date.now() - lastWrite.at < 120000 ? lastWrite.raw : null; }

const EDITABLE = new Set(['h1', 'h2', 'h3', 'p', 'li']);

// Where a block sits. Landmarks switch the area as the scan walks the page.
function areaLabel(area) {
  const names = {
    hero: 'Hero (blue band)',
    intro: 'Paper intro',
    cards: 'Standard cards',
    footer: 'Footer',
  };
  return names[area] || 'Section: ' + area;
}

function findClose(html, tag, from) {
  const re = new RegExp('<(/?)' + tag + '\\b[^>]*>', 'gi');
  re.lastIndex = from;
  let depth = 1;
  let m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return m.index;
  }
  return -1;
}

export function extractBlocks(html) {
  const blocks = [];
  const counts = new Map();
  let area = null;
  const re = /<(\/?)([a-zA-Z0-9]+)([^>]*)>/g;
  let m;
  while ((m = re.exec(html))) {
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const attrs = m[3] || '';

    if (!closing && tag === 'header' && /class="[^"]*\bhero\b/.test(attrs)) { area = 'hero'; continue; }
    if (closing && tag === 'header') { area = 'intro'; continue; }
    if (!closing && tag === 'section') { area = (attrs.match(/id="([^"]+)"/) || [])[1] || area; continue; }
    if (closing && tag === 'section') { area = 'gap'; continue; }
    if (!closing && tag === 'main') { area = 'cards'; continue; }
    if (closing && tag === 'main') { area = 'gap'; continue; }
    if (!closing && tag === 'footer') { area = 'footer'; continue; }
    if (closing && tag === 'footer') { area = null; continue; }

    if (closing || !area || area === 'gap') continue;

    const isEyebrow = tag === 'div' && /class="[^"]*\beyebrow\b/.test(attrs);
    const isPill = tag === 'span' && area === 'hero';
    if (!EDITABLE.has(tag) && !isEyebrow && !isPill) continue;

    const start = m.index + m[0].length;
    const end = findClose(html, tag, start);
    if (end < 0) continue;
    const base = area + '.' + tag;
    const n = (counts.get(base) || 0) + 1;
    counts.set(base, n);
    blocks.push({ key: base + '-' + n, area, areaLabel: areaLabel(area), tag, start, end, html: html.slice(start, end) });
    re.lastIndex = end;
  }
  return blocks;
}

// What the admin renders: every block with its current text and its state.
export function blockStates(blocks, items) {
  return blocks.map((b) => {
    const it = items[b.key];
    const has = !!(it && typeof it.v === 'string');
    const stale = has && it.d !== undefined && it.d !== b.html;
    return {
      key: b.key,
      area: b.area,
      areaLabel: b.areaLabel,
      tag: b.tag,
      def: b.html,
      value: has && !stale ? it.v : b.html,
      saved: has ? it.v : '',
      savedAgainst: has ? (it.d || '') : '',
      edited: has && !stale,
      stale,
      at: has ? (it.at || '') : '',
    };
  });
}

export function applyOverrides(html, blocks, items) {
  const edits = [];
  for (const b of blocks) {
    const it = items[b.key];
    if (!it || typeof it.v !== 'string') continue;
    if (it.d !== undefined && it.d !== b.html) continue;
    if (it.v === b.html) continue;
    edits.push({ start: b.start, end: b.end, v: it.v });
  }
  if (!edits.length) return html;
  edits.sort((a, b) => b.start - a.start);
  let out = html;
  for (const e of edits) out = out.slice(0, e.start) + e.v + out.slice(e.end);
  return out;
}

// Saved text is rendered as HTML on a public page, so scripts never pass.
export function cleanValue(v) {
  return String(v == null ? '' : v)
    .replace(/<\s*\/?\s*(script|iframe|object|embed|link|meta|style)\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, 8000);
}
