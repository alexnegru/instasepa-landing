// /admin — password-protected text editor for the public page.
//
// Login sets a signed, HttpOnly cookie for 12 hours. The password lives in the
// worker secret ADMIN_PASSWORD and is never stored in KV or in the repo.
// Failed logins are counted per IP. Saves are written to KV and announced on
// Telegram, so every edit leaves a trail.

import { CONTENT_KEY, extractBlocks, blockStates, applyOverrides, cleanValue, noteWrite, freshRaw } from './content.js';
import { getAnalyticsCfg } from './analytics.js';

const COOKIE = 'isadmin';
const SESSION_HOURS = 12;
const MAX_FAILS = 10;

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function page(title, body) {
  return new Response(`<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>${esc(title)}</title>
<style>
  :root { --blue:#003399; --deep:#002266; --ink:#1F2430; --muted:#5B6472; --line:#E3E7F0; --bg:#F7F8FB; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:var(--ink); background:var(--bg); line-height:1.5; }
  header { background:var(--blue); color:#fff; padding:14px 20px; display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
  header b { font-size:17px; }
  header a { color:#FFCC00; font-weight:700; text-decoration:none; margin-left:auto; }
  header a + a { margin-left:16px; }
  main { max-width:900px; margin:0 auto; padding:20px; }
  .flash { background:#E7F6EC; border:1px solid #9AD3AE; color:#14532D; padding:12px 14px; border-radius:10px; margin-bottom:18px; }
  .warn { background:#FFF6CC; border:1px solid #E3B800; color:#6B5600; padding:12px 14px; border-radius:10px; margin-bottom:18px; }
  fieldset { border:1px solid var(--line); border-radius:12px; background:#fff; padding:14px 16px; margin:0 0 18px; }
  legend { font-weight:700; color:var(--blue); padding:0 6px; }
  .b { padding:10px 0; border-top:1px solid var(--line); }
  .b:first-of-type { border-top:0; }
  .k { font:12px ui-monospace,Menlo,monospace; color:var(--muted); display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
  .tagpill { background:#E8EDFB; color:var(--blue); border-radius:99px; padding:1px 8px; font-weight:700; }
  .edited { background:#FFF3D6; color:#6B5600; border-radius:99px; padding:1px 8px; font-weight:700; }
  .stalepill { background:#FDE2E2; color:#8A1C1C; border-radius:99px; padding:1px 8px; font-weight:700; }
  textarea { width:100%; font:14px/1.5 ui-monospace,Menlo,monospace; padding:9px 10px; border:1px solid #C9D6F5; border-radius:8px; margin-top:6px; resize:vertical; }
  textarea:focus { outline:3px solid rgba(0,51,153,.3); border-color:var(--blue); }
  .old { font:12px/1.5 ui-monospace,Menlo,monospace; background:#F7F8FB; border:1px dashed var(--line); border-radius:8px; padding:8px 10px; margin-top:6px; color:var(--muted); white-space:pre-wrap; }
  .bar { position:sticky; bottom:0; background:#fff; border-top:1px solid var(--line); padding:12px 20px; display:flex; gap:12px; align-items:center; }
  button { font:inherit; font-weight:700; padding:11px 20px; border:0; border-radius:10px; background:var(--blue); color:#fff; cursor:pointer; }
  button.ghost { background:#fff; color:var(--blue); border:2px solid var(--blue); }
  .hint { color:var(--muted); font-size:13.5px; }
  form.login { max-width:380px; margin:12vh auto; background:#fff; border:1px solid var(--line); border-radius:14px; padding:26px; }
  form.login h1 { margin:0 0 6px; font-size:20px; color:var(--blue); }
  form.login p { margin:0 0 16px; color:var(--muted); font-size:14px; }
  input[type=password] { width:100%; font:inherit; font-size:16px; padding:11px 12px; border:1px solid #C9D6F5; border-radius:10px; }
  form.login button { width:100%; margin-top:14px; }
  .err { color:#8A1C1C; font-size:14px; margin-top:12px; }
</style></head><body>${body}</body></html>`, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
  });
}

function redirect(to, extra) {
  return new Response(null, { status: 303, headers: { location: to, 'cache-control': 'no-store', ...(extra || {}) } });
}

// ---- session ---------------------------------------------------------------

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function same(a, b) {
  const x = String(a), y = String(b);
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}

async function makeToken(secret) {
  const exp = String(Date.now() + SESSION_HOURS * 3600 * 1000);
  return exp + '.' + (await hmac(secret, exp));
}

async function validToken(secret, token) {
  if (!token || token.indexOf('.') < 0) return false;
  const [exp, sig] = token.split('.');
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return same(sig, await hmac(secret, exp));
}

function cookieValue(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return '';
}

function setCookie(token) {
  return { 'set-cookie': COOKIE + '=' + token + '; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=' + SESSION_HOURS * 3600 };
}

function clearCookie() {
  return { 'set-cookie': COOKIE + '=; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=0' };
}

function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).hostname === new URL(request.url).hostname; } catch (e) { return false; }
}

// ---- storage ---------------------------------------------------------------

async function readItems(env) {
  const fresh = freshRaw();
  if (fresh !== null) { try { return JSON.parse(fresh) || {}; } catch (e) { /* fall through */ } }
  if (!env.STATE) return {};
  try { return (await env.STATE.get(CONTENT_KEY, 'json')) || {}; } catch (e) { return {}; }
}

async function writeItems(env, items) {
  const raw = JSON.stringify(items);
  await env.STATE.put(CONTENT_KEY, raw);
  noteWrite(raw);
}

async function notify(env, lines) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.STATE) return;
  try {
    const cfg = await getAnalyticsCfg(env);
    const text = ['✏️ <b>Page text edited</b>', ...lines].join('\n');
    await Promise.all((cfg.chatIds || []).map((id) =>
      fetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: id, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      }).catch(() => null)));
  } catch (e) { /* an edit must never fail on a notification */ }
}

// ---- views -----------------------------------------------------------------

function loginView(error) {
  return page('Sign in', `<form class="login" method="POST" action="/admin/login">
  <h1>instasepa.eu</h1>
  <p>Sign in to edit the page text.</p>
  <label for="p" class="hint">Password</label>
  <input id="p" name="p" type="password" autocomplete="current-password" autofocus required />
  <button type="submit">Sign in</button>
  ${error ? '<p class="err">' + esc(error) + '</p>' : ''}
</form>`);
}

function editorView(states, flash) {
  const areas = [];
  for (const s of states) {
    let a = areas.find((x) => x.area === s.area);
    if (!a) { a = { area: s.area, label: s.areaLabel, items: [] }; areas.push(a); }
    a.items.push(s);
  }
  const edited = states.filter((s) => s.edited).length;
  const stale = states.filter((s) => s.stale).length;

  const body = areas.map((a) => `<fieldset><legend>${esc(a.label)}</legend>
${a.items.map((s) => {
    const rows = Math.max(2, Math.min(12, Math.ceil(s.value.length / 90) + s.value.split('\n').length));
    return `<div class="b">
  <div class="k"><span class="tagpill">${esc(s.tag)}</span><span>${esc(s.key)}</span>${s.edited ? '<span class="edited">edited</span>' : ''}${s.stale ? '<span class="stalepill">stale, the code text changed</span>' : ''}</div>
  ${s.stale ? '<div class="old">Your saved text, not shown on the page:\n' + esc(s.saved) + '</div>' : ''}
  <input type="hidden" name="__o:${esc(s.key)}" value="${esc(s.value)}" />
  <textarea name="${esc(s.key)}" rows="${rows}">${esc(s.value)}</textarea>
</div>`;
  }).join('\n')}
</fieldset>`).join('\n');

  return page('Edit instasepa.eu', `<header>
  <b>instasepa.eu text</b>
  <span class="hint" style="color:#C9D4F2">${edited} edited${stale ? ', ' + stale + ' stale' : ''}</span>
  <a href="/?v=${Date.now()}" target="_blank" rel="noopener">View the page</a>
  <a href="/admin/logout">Sign out</a>
</header>
<main>
  ${flash ? '<div class="flash">' + esc(flash) + '</div>' : ''}
  <div class="warn">Edit the text, then save. Clear a box to put the original text back. HTML tags such as &lt;b&gt; and &lt;a&gt; are allowed. Your change shows at once on the link above, and reaches every visitor within about a minute.</div>
  <form method="POST" action="/admin/save">
    ${body}
    <div class="bar">
      <button type="submit">Save changes</button>
      <span class="hint">Tables, diagrams and the join form are not editable here.</span>
    </div>
  </form>
  <form method="POST" action="/admin/reset" onsubmit="return confirm('Put the original text back everywhere?')" style="margin:18px 0 40px">
    <button type="submit" class="ghost">Reset every block to the original text</button>
  </form>
</main>`);
}

// ---- routes ----------------------------------------------------------------

export async function handleAdmin(request, env, ctx, defaultHtml) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/admin';
  const secret = env.ADMIN_PASSWORD;

  if (!secret) {
    return page('Not configured', '<main><div class="warn">No admin password is set. Run <code>wrangler secret put ADMIN_PASSWORD</code> for this worker.</div></main>');
  }

  if (path === '/admin/login') {
    if (request.method !== 'POST' || !sameOrigin(request)) return redirect('/admin');
    const ip = request.headers.get('cf-connecting-ip') || '';
    const failKey = 'adminfail:' + ip;
    const fails = Number(env.STATE && ip ? await env.STATE.get(failKey) : 0) || 0;
    if (fails >= MAX_FAILS) return loginView('Too many attempts. Try again in fifteen minutes.');
    const form = await request.formData();
    if (!same(String(form.get('p') || ''), secret)) {
      if (env.STATE && ip) await env.STATE.put(failKey, String(fails + 1), { expirationTtl: 900 });
      return loginView('Wrong password.');
    }
    if (env.STATE && ip) await env.STATE.delete(failKey).catch(() => {});
    return redirect('/admin', setCookie(await makeToken(secret)));
  }

  if (path === '/admin/logout') return redirect('/admin', clearCookie());

  if (!(await validToken(secret, cookieValue(request, COOKIE)))) return loginView('');

  const blocks = extractBlocks(defaultHtml);

  if (path === '/admin/save') {
    if (request.method !== 'POST' || !sameOrigin(request)) return redirect('/admin');
    const form = await request.formData();
    const items = await readItems(env);
    const next = { ...items };
    const changed = [];
    const reverted = [];
    const now = new Date().toISOString();
    // Each box carries the text it was rendered with. A box whose text is
    // unchanged is never written, so an editor page opened on an older copy
    // cannot put old words back, and one person's save cannot undo another's.
    for (const b of blocks) {
      if (!form.has(b.key)) continue;
      const v = cleanValue(form.get(b.key));
      const shown = form.has('__o:' + b.key) ? cleanValue(form.get('__o:' + b.key)) : null;
      if (shown !== null && v === shown) continue;
      const had = items[b.key];
      if (!v || v === b.html) {
        if (had) { delete next[b.key]; reverted.push(b.key); }
        continue;
      }
      if (had && had.v === v && had.d === b.html) continue;
      next[b.key] = { v, d: b.html, at: now };
      changed.push(b.key);
    }
    if (JSON.stringify(next) !== JSON.stringify(items)) {
      await writeItems(env, next);
      const lines = [];
      if (changed.length) lines.push('changed: ' + changed.join(', '));
      if (reverted.length) lines.push('back to the original: ' + reverted.join(', '));
      const job = notify(env, lines.length ? lines : ['content updated']);
      if (ctx) ctx.waitUntil(job);
    }
    const parts = [];
    if (changed.length) parts.push(changed.length + ' block' + (changed.length > 1 ? 's' : '') + ' saved');
    if (reverted.length) parts.push(reverted.length + ' back to the original');
    return redirect('/admin?m=' + encodeURIComponent(parts.join(', ') || 'Nothing changed'));
  }

  if (path === '/admin/reset') {
    if (request.method !== 'POST' || !sameOrigin(request)) return redirect('/admin');
    await writeItems(env, {});
    if (ctx) ctx.waitUntil(notify(env, ['every block is back to the original text']));
    return redirect('/admin?m=' + encodeURIComponent('Every block is back to the original text'));
  }

  const items = await readItems(env);
  return editorView(blockStates(blocks, items), url.searchParams.get('m') || '');
}

export { applyOverrides };
