// Lite visitor analytics → Telegram DM.
// Runs inside ctx.waitUntil() so it never delays a page render, and can never
// throw into the request path. Deliberately kept out of the public IPN
// channel: visitor IPs are personal data, so recipients live in their own KV
// config (analytics.chatIds) rather than reusing telegramChatIds.

const ANALYTICS_KEY = 'analytics';
const DEFAULT_ANALYTICS = { enabled: true, chatIds: [2094719306] };

// Crawlers, uptime monitors and link-preview fetchers (pasting a link in
// Telegram/WhatsApp/Slack triggers one) — none of these are visitors.
const BOT_UA = /bot\b|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegrambot|discord|slack|twitterbot|linkedinbot|embedly|quora|pinterest|redditbot|applebot|petalbot|bingbot|googlebot|yandex|ahrefs|semrush|mj12|dotbot|curl\/|wget|python-requests|httpx|aiohttp|go-http|java\/|okhttp|ruby|postman|insomnia|headless|phantomjs|lighthouse|pingdom|uptime|statuscake|monitoring|scanner|masscan|zgrab/i;

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

export function visitsKey(d = new Date()) {
  return 'visits:' + d.toISOString().slice(0, 10);
}

export async function visitsToday(env) {
  const n = await env.STATE.get(visitsKey());
  return n ? parseInt(n, 10) : 0;
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
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua)) browser = 'Safari';
  return device + ' · ' + browser;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// Per-colo dedupe using the Cache API — free and not subject to the KV
// write quota. A visitor served by a different edge inside the window can
// ping twice; acceptable for a demo.
const DEDUPE_SECONDS = 1800;

async function seenRecently(ip, path) {
  try {
    const cache = caches.default;
    const key = new Request('https://analytics.invalid/seen/' + encodeURIComponent(ip + '|' + path));
    if (await cache.match(key)) return true;
    await cache.put(key, new Response('1', {
      headers: { 'cache-control': 'max-age=' + DEDUPE_SECONDS },
    }));
    return false;
  } catch (e) {
    return false; // cache unavailable — better a duplicate ping than none
  }
}

export async function trackVisit(request, env, path) {
  try {
    const cfg = await getAnalyticsCfg(env);
    if (!cfg.enabled || !env.TELEGRAM_BOT_TOKEN || !(cfg.chatIds || []).length) return;

    const ua = request.headers.get('user-agent') || '';
    if (!ua || BOT_UA.test(ua)) return;

    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    if (await seenRecently(ip, path)) return;

    const cf = request.cf || {};
    const ref = request.headers.get('referer') || '';
    let refHost = '';
    try { refHost = ref ? new URL(ref).hostname : ''; } catch (_) {}

    // Daily counter (one write per unique visitor, well inside the free quota)
    const key = visitsKey();
    const prev = await env.STATE.get(key);
    const count = (prev ? parseInt(prev, 10) : 0) + 1;
    await env.STATE.put(key, String(count), { expirationTtl: 60 * 60 * 24 * 40 });

    const place = [cf.city, cf.region, cf.country].filter(Boolean).join(', ') || 'unknown location';
    const org = cf.asOrganization ? cf.asOrganization + (cf.asn ? ' (AS' + cf.asn + ')' : '') : null;
    const time = new Date().toLocaleTimeString('en-GB', {
      timeZone: cf.timezone || 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit',
    });

    // Host in the title so several demo workers can share one DM feed.
    let host = '';
    try { host = new URL(request.url).hostname; } catch (_) {}

    const lines = [
      '👀 <b>Visit — ' + esc(host) + esc(path === '/' ? '/' : path) + '</b>',
      '',
      '📍 ' + esc(place),
    ];
    if (org) lines.push('🏢 ' + esc(org));
    lines.push('📱 ' + esc(describeUa(ua)));
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
