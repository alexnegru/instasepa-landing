// Visitor analytics v2 → Telegram DM.
// One file, byte-identical in smartiban-paybybank, smartiban-crypto-checkout
// and instasepa-landing/malta. Change it in one place and copy it to the others.
//
// The page sends a small beacon after it has rendered; counting happens on
// that beacon, never on the page request. Clients that do not run JavaScript
// (scanners, crawlers, link-preview fetchers) never reach this code. On top of
// that: a user-agent blocklist, browser-only request headers, a datacenter
// network bucket, and a 30-minute dedupe per IP across all paths.
// Runs inside ctx.waitUntil() and can never throw into the request path.
// Recipients live in KV key `analytics` ({ enabled, chatIds }); visitor IPs are
// personal data, so this stays separate from any shared chat list.

const ANALYTICS_KEY = 'analytics';
const DEFAULT_ANALYTICS = { enabled: true, chatIds: [2094719306] };

// Self-declared crawlers, monitors, link-preview fetchers and scripted clients.
const BOT_UA = /bot\b|crawl|spider|slurp|preview|fetch|scan|inspect|externalagent|facebookexternalhit|whatsapp|telegrambot|discord|slack|twitterbot|linkedinbot|embedly|quora|pinterest|redditbot|applebot|petalbot|bingbot|googlebot|yandex|ahrefs|semrush|mj12|dotbot|curl\/|wget|python|httpx|aiohttp|go-http|java\/|okhttp|ruby|perl|php|node-fetch|axios|postman|insomnia|headless|phantomjs|selenium|puppeteer|playwright|lighthouse|pingdom|uptime|statuscake|monitoring|monitor|masscan|zgrab|nmap|nuclei|censys|shodan|expanse|palo alto|netcraft|dataprovider|bytespider|claude|gptbot|ccbot|anthropic|openai|perplexity|amazonbot|duckduck|qwant|seznam|baidu|sogou|360spider|coccoc|ia_archiver|archive\.org|wappalyzer|builtwith|validator|w3c|feed/i;

// Cloud and hosting networks. Humans browse from residential and mobile ISPs;
// a beacon from one of these goes into the `bots:` bucket with no ping.
const DC_ASN = new Set([
  16509, 14618, 8075, 15169, 396982, 14061, 62567, 24940, 16276, 63949, 20473,
  31898, 45102, 37963, 132203, 45090, 398324, 398705, 398722, 211298, 208091,
  206264, 202425, 49505, 9009, 60068, 212238, 46844, 36352, 55286, 51167,
  197540, 199524, 42831, 12876, 135377, 8560, 24961, 29802, 53667, 40021,
  399629, 47583, 204601, 57523, 200373, 43350, 30633, 12989, 26496, 19551,
]);
const DC_ORG = /amazon|aws|google|microsoft|azure|digitalocean|hetzner|ovh|linode|akamai|vultr|choopa|oracle|alibaba|tencent|huawei|censys|palo alto|expanse|shodan|scaleway|contabo|netcup|leaseweb|m247|datacamp|cdn77|gcore|g-core|ucloud|ionos|hostinger|godaddy|rackspace|servers\.com|equinix|fastly|hostpapa|colocrossing|selectel|xtom|ip volume|ipvolume|stretchoid|binaryedge|onyphe|shadowserver|netcraft|qrator|zscaler|hostwinds|psychz|frantech|buyvm|nocix|hivelocity|quadranet|limestone|packet|latitude|cloud|hosting|server|datacenter|data center|vps|dedicated/i;

// iCloud Private Relay egresses through Cloudflare, Akamai and Fastly. An
// iPhone behind Private Relay is a person, so Apple devices on these networks
// skip the datacenter check. Cloudflare itself (WARP) is never a datacenter here.
const RELAY_ASN = new Set([13335, 20940, 16625, 54113]);
const APPLE_UA = /iPhone|iPad|Macintosh/;

// Visit beacon. Sent 1.2s after load so prefetchers and instant bounces do not
// count; text/plain keeps it a simple request. Plain string concatenation on
// purpose: the demo pages allow no backticks inside inline JS.
export const BEACON_JS = ''
  + '(function () {'
  + 'try {'
  + 'var send = function () {'
  + 'var body = JSON.stringify({ p: location.pathname, r: document.referrer || \'\', w: window.innerWidth || 0, l: navigator.language || \'\' });'
  + 'if (navigator.sendBeacon) { navigator.sendBeacon(\'/api/v\', new Blob([body], { type: \'text/plain\' })); }'
  + 'else { fetch(\'/api/v\', { method: \'POST\', headers: { \'content-type\': \'text/plain\' }, body: body, keepalive: true }).catch(function () {}); }'
  + '};'
  + 'var go = function () { setTimeout(send, 1200); };'
  + 'if (document.readyState === \'complete\') { go(); } else { window.addEventListener(\'load\', go); }'
  + '} catch (e) {}'
  + '})();';

// Adds the beacon to a rendered page, just before </body>.
export function withBeacon(html) {
  const tag = '<script>' + BEACON_JS + '</script>';
  const i = html.lastIndexOf('</body>');
  return i === -1 ? html + tag : html.slice(0, i) + tag + html.slice(i);
}

// POST /api/v — the beacon endpoint. Always 204; the work runs in the background.
export async function handleBeacon(request, env, ctx) {
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  let data = {};
  try {
    const txt = await request.text();
    if (txt && txt.length < 2048) data = JSON.parse(txt);
  } catch (e) { data = {}; }
  const job = trackBeacon(request, env, data);
  if (ctx) ctx.waitUntil(job); else await job;
  return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
}

export async function getAnalyticsCfg(env) {
  const cfg = await env.STATE.get(ANALYTICS_KEY, 'json');
  return { ...DEFAULT_ANALYTICS, ...(cfg || {}) };
}

export async function setAnalyticsEnabled(env, enabled) {
  const cfg = await getAnalyticsCfg(env);
  cfg.enabled = !!enabled;
  await env.STATE.put(ANALYTICS_KEY, JSON.stringify(cfg));
  return cfg;
}

export function visitsKey(d = new Date(), prefix = 'visits') {
  return prefix + ':' + d.toISOString().slice(0, 10);
}

export async function visitsToday(env) {
  const n = await env.STATE.get(visitsKey());
  return n ? parseInt(n, 10) : 0;
}

export async function botsToday(env) {
  const n = await env.STATE.get(visitsKey(new Date(), 'bots'));
  return n ? parseInt(n, 10) : 0;
}

async function bump(env, key) {
  const prev = await env.STATE.get(key);
  const n = (prev ? parseInt(prev, 10) : 0) + 1;
  await env.STATE.put(key, String(n), { expirationTtl: 60 * 60 * 24 * 40 });
  return n;
}

function describeUa(ua) {
  let device = 'Desktop';
  if (/iPhone/i.test(ua)) device = 'iPhone';
  else if (/iPad/i.test(ua)) device = 'iPad';
  else if (/Android/i.test(ua)) device = /Mobile/i.test(ua) ? 'Android phone' : 'Android tablet';
  else if (/Macintosh|Mac OS X/i.test(ua)) device = 'Mac';
  else if (/Windows/i.test(ua)) device = 'Windows PC';
  else if (/Linux/i.test(ua)) device = 'Linux';

  let browser = 'browser';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/Brave/i.test(ua)) browser = 'Brave';
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua)) browser = 'Safari';
  return device + ' · ' + browser;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// Per-colo dedupe via the Cache API, keyed on the IP alone, so one person
// browsing several pages is one ping.
const DEDUPE_SECONDS = 1800;

async function seenRecently(ip) {
  try {
    const cache = caches.default;
    const key = new Request('https://analytics.invalid/seen/' + encodeURIComponent(ip));
    if (await cache.match(key)) return true;
    await cache.put(key, new Response('1', {
      headers: { 'cache-control': 'max-age=' + DEDUPE_SECONDS },
    }));
    return false;
  } catch (e) {
    return false;
  }
}

// Returns '' for a beacon that looks like it came from a real browser on our
// own page, otherwise a short reason for the drop.
export function beaconDropReason(request) {
  const h = request.headers;
  const ua = h.get('user-agent') || '';
  if (!ua || BOT_UA.test(ua)) return 'ua';
  if (!h.get('accept-language')) return 'no-language';
  const site = h.get('sec-fetch-site');
  if (site && site !== 'same-origin') return 'cross-site';
  let host = '';
  try { host = new URL(request.url).hostname; } catch (_) {}
  const ref = h.get('origin') || h.get('referer') || '';
  if (ref) {
    try { if (new URL(ref).hostname !== host) return 'foreign-origin'; } catch (_) { return 'bad-origin'; }
  }
  return '';
}

export function isDatacenter(cf, ua) {
  const asn = Number(cf && cf.asn);
  if (asn === 13335) return false;
  if (RELAY_ASN.has(asn) && APPLE_UA.test(ua || '')) return false;
  const org = (cf && cf.asOrganization) || '';
  return DC_ASN.has(asn) || DC_ORG.test(org);
}

// data = the parsed beacon body: { p: path, r: referrer, w: innerWidth, l: language }
export async function trackBeacon(request, env, data) {
  try {
    if (!env.STATE) return;
    const cfg = await getAnalyticsCfg(env);
    if (!cfg.enabled) return;
    if (beaconDropReason(request)) return;

    const cf = request.cf || {};
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || '';
    const d = data && typeof data === 'object' ? data : {};
    const path = typeof d.p === 'string' && d.p.startsWith('/') ? d.p.slice(0, 64) : '/';

    if (isDatacenter(cf, ua)) {
      await bump(env, visitsKey(new Date(), 'bots'));
      return;
    }
    if (await seenRecently(ip)) return;

    const count = await bump(env, visitsKey());
    if (!env.TELEGRAM_BOT_TOKEN || !(cfg.chatIds || []).length) return;

    let refHost = '';
    try { refHost = d.r ? new URL(String(d.r)).hostname : ''; } catch (_) {}
    const width = Number(d.w) > 0 ? Math.round(Number(d.w)) + 'px' : '';
    const lang = typeof d.l === 'string' ? d.l.slice(0, 12) : '';

    const place = [cf.city, cf.region, cf.country].filter(Boolean).join(', ') || 'unknown location';
    const org = cf.asOrganization ? cf.asOrganization + (cf.asn ? ' (AS' + cf.asn + ')' : '') : null;
    const time = new Date().toLocaleTimeString('en-GB', {
      timeZone: cf.timezone || 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit',
    });
    let host = '';
    try { host = new URL(request.url).hostname; } catch (_) {}

    const lines = [
      '👀 <b>Visit — ' + esc(host) + esc(path) + '</b>',
      '',
      '📍 ' + esc(place),
    ];
    if (org) lines.push('🏢 ' + esc(org));
    lines.push('📱 ' + esc(describeUa(ua)) + (width ? ' · ' + width : '') + (lang ? ' · ' + esc(lang) : ''));
    if (refHost) lines.push('🔗 from ' + esc(refHost));
    lines.push('🌐 <code>' + esc(ip) + '</code>' + (cf.colo ? ' · via ' + esc(cf.colo) : ''));
    lines.push('🕒 ' + esc(time) + (cf.timezone ? ' ' + esc(cf.timezone) : '') + ' · visit #' + count + ' today');

    const text = lines.join('\n');
    for (const chatId of cfg.chatIds) {
      try {
        const r = await fetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true,
            disable_notification: true,
          }),
        });
        if (!r.ok) console.error('analytics send failed', chatId, r.status);
      } catch (e) {
        console.error('analytics send error', e && e.message);
      }
    }
  } catch (e) {
    console.error('analytics error', e && e.message);
  }
}
