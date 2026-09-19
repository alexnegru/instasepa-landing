// Join / Contact form → Telegram DM.
// POST /api/join with JSON { c: "email or phone", w: "" }. The `w` field is a
// honeypot: real browsers leave it empty, form bots fill every field.
// Every message is stored in KV first (key contact:<time>-<rand>, kept one
// year), then sent to the analytics recipients (KV key `analytics`, default
// Alex's DM). Limits: 3 messages per IP per 10 minutes, same-origin only.

import { getAnalyticsCfg } from './analytics.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ().-]{6,24}$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function contactKind(contact) {
  if (EMAIL.test(contact)) return 'email';
  if (PHONE.test(contact) && contact.replace(/\D/g, '').length >= 6) return 'phone';
  return '';
}

export async function handleJoin(request, env, ctx) {
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  let data = {};
  try {
    const txt = await request.text();
    if (txt && txt.length < 2048) data = JSON.parse(txt);
  } catch (e) { return json({ ok: false, error: 'bad-json' }, 400); }
  if (data.w) return json({ ok: true }); // honeypot: answer as if it worked

  const host = new URL(request.url).hostname;
  const origin = request.headers.get('origin') || '';
  if (origin) {
    try { if (new URL(origin).hostname !== host) return json({ ok: false, error: 'origin' }, 403); }
    catch (e) { return json({ ok: false, error: 'origin' }, 403); }
  }

  const contact = String(data.c || '').trim().slice(0, 120);
  const kind = contactKind(contact);
  if (!kind) return json({ ok: false, error: 'invalid' }, 400);

  const ip = request.headers.get('cf-connecting-ip') || '';
  if (env.STATE && ip) {
    const key = 'join:' + ip;
    const n = Number(await env.STATE.get(key)) || 0;
    if (n >= 3) return json({ ok: false, error: 'rate' }, 429);
    await env.STATE.put(key, String(n + 1), { expirationTtl: 600 });
  }

  const cf = request.cf || {};
  const where = [cf.city, cf.country].filter(Boolean).join(', ') || 'unknown';
  const ua = (request.headers.get('user-agent') || '').slice(0, 160);
  const ref = (request.headers.get('referer') || '').slice(0, 200);
  const record = { at: new Date().toISOString(), host, kind, contact, ip, where, org: cf.asOrganization || '', ua, ref };

  let stored = false;
  if (env.STATE) {
    try {
      const id = 'contact:' + record.at.replace(/[-:.TZ]/g, '').slice(0, 14) + '-' + Math.random().toString(36).slice(2, 8);
      await env.STATE.put(id, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 365 });
      stored = true;
    } catch (e) { stored = false; }
  }

  let sent = false;
  if (env.TELEGRAM_BOT_TOKEN && env.STATE) {
    const cfg = await getAnalyticsCfg(env);
    const text = [
      '📩 <b>Join / Contact — ' + esc(host) + '</b>',
      kind + ': <code>' + esc(contact) + '</code>',
      'from: ' + esc(where) + (cf.asOrganization ? ' · ' + esc(cf.asOrganization) : ''),
      ref ? 'page: ' + esc(ref) : '',
      'ua: ' + esc(ua),
    ].filter(Boolean).join('\n');
    const sends = (cfg.chatIds || []).map((id) =>
      fetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: id, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      }).then((r) => r.ok).catch(() => false));
    sent = (await Promise.all(sends)).some(Boolean);
  }

  if (!stored && !sent) return json({ ok: false, error: 'send' }, 502);
  return json({ ok: true });
}
