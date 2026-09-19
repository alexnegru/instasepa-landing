// instasepa.eu — static landing page advocating open SEPA payment standards
// (EPC QR Code + SEPA Request-to-Pay). Served on instasepa.eu + www.

import { handleBeacon, withBeacon } from './analytics.js';
import MARK_PNG_B64 from './mark.js';
import { PAPER_CSS, paperHtml, VIDEO_OVERLAY_HTML, VIDEO_OVERLAY_JS, FAVICON_SVG } from './paper.js';
import { handleJoin } from './join.js';

// EU flag: 12 five-pointed gold stars in a circle on blue (official geometry:
// star circumradius = 1/18 of flag height, star centers on a circle of
// radius 1/3 of flag height, one point of each star facing straight up).
function starPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? r : r * 0.382;
    pts.push((cx + radius * Math.cos(angle)).toFixed(2) + ',' + (cy + radius * Math.sin(angle)).toFixed(2));
  }
  return pts.join(' ');
}

function euFlagSvg(width) {
  const h = 120, w = 180, rC = h / 3, rS = h / 9 / 2 * 1.0; // star circumradius = h/18*... official: h/18
  const stars = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6 - Math.PI / 2;
    const cx = w / 2 + rC * Math.cos(a);
    const cy = h / 2 + rC * Math.sin(a);
    stars.push(`<polygon points="${starPoints(cx, cy, h / 18)}" fill="#FFCC00"/>`);
  }
  return `<svg width="${width}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Flag of the European Union">
<rect width="${w}" height="${h}" fill="#003399"/>${stars.join('')}</svg>`;
}

const sepaMark = `<svg width="150" viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SEPA">
<rect width="180" height="120" rx="14" fill="#10298E"/>
<text x="90" y="74" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-style="italic" font-size="44" fill="#FFCC00" text-anchor="middle">SEPA</text>
<text x="90" y="97" font-family="Arial, Helvetica, sans-serif" font-size="8.5" fill="#9FB3E8" text-anchor="middle" letter-spacing="0.6">SINGLE EURO PAYMENTS AREA</text></svg>`;

function landingHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>instaSEPA — open standards for instant SEPA payments</title>
<meta name="description" content="EPC QR Code and SEPA Request-to-Pay: the open, pan-European standards that give SEPA payments a user experience as good as cards." />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<style>
  :root {
    --eu-blue: #003399;
    --eu-blue-dark: #002266;
    --gold: #FFCC00;
    --ink: #1F2430;
    --muted: #5B6472;
    --bg: #F7F8FB;
    --card: #ffffff;
    --border: #E3E7F0;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: var(--ink); background: var(--bg);
    -webkit-font-smoothing: antialiased;
  }
  .hero {
    background: linear-gradient(160deg, var(--eu-blue) 0%, var(--eu-blue-dark) 100%);
    color: #fff; padding: 56px 24px 64px; text-align: center;
  }
  .flags { display: flex; gap: 28px; justify-content: center; align-items: center; flex-wrap: wrap; margin-bottom: 34px; }
  .flags svg { border-radius: 8px; box-shadow: 0 8px 30px rgba(0,0,0,0.35); height: auto; }
  .hero h1 {
    max-width: 780px; margin: 0 auto 22px;
    font-size: clamp(22px, 3.4vw, 34px); font-weight: 700; line-height: 1.35;
  }
  .hero h1 em { color: var(--gold); font-style: normal; }
  .hero .call {
    max-width: 680px; margin: 0 auto; font-size: clamp(16px, 2.2vw, 19px);
    line-height: 1.6; color: #D6DEF5;
  }
  .hero .call strong { color: #fff; }
  .standards {
    display: inline-flex; gap: 14px; flex-wrap: wrap; justify-content: center; margin-top: 26px;
  }
  .standards span {
    background: rgba(255,255,255,0.10); border: 1px solid rgba(255,204,0,0.55);
    color: var(--gold); font-weight: 700; padding: 10px 20px; border-radius: 999px;
    font-size: 15px; letter-spacing: 0.02em;
  }
  main { max-width: 880px; margin: 40px auto 40px; padding: 0 20px; }
  main > .card {
    background: var(--card); border: 1px solid var(--border); border-radius: 16px;
    padding: 30px 32px; margin-bottom: 22px;
    box-shadow: 0 2px 6px rgba(15,23,42,0.05), 0 12px 34px rgba(15,23,42,0.06);
  }
  main > .card h2 {
    margin: 0 0 12px; font-size: 20px; color: var(--eu-blue);
    display: flex; align-items: center; gap: 10px;
  }
  main > .card h2 .tag {
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: var(--eu-blue);
    background: #E8EDFB; border: 1px solid #C9D6F5; padding: 3px 10px; border-radius: 999px;
  }
  main > .card p { margin: 0 0 12px; font-size: 15.5px; line-height: 1.65; color: var(--muted); }
  main > .card p:last-child { margin-bottom: 0; }
  main > .card strong { color: var(--ink); }
  .epc-demo {
    display: flex; gap: 26px; align-items: flex-start; flex-wrap: wrap;
    margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);
  }
  .epc-fields { flex: 1 1 300px; min-width: 260px; }
  .epc-fields h3 { margin: 0 0 10px; font-size: 14px; color: var(--eu-blue); text-transform: uppercase; letter-spacing: 0.05em; }
  .epc-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .epc-table td { padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: top; }
  .epc-table td:first-child { color: var(--muted); white-space: nowrap; width: 42%; }
  .epc-table td:last-child { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 12.5px; color: var(--ink); word-break: break-all; }
  .epc-table tr:last-child td { border-bottom: none; }
  .epc-qr { flex: 0 0 auto; text-align: center; }
  .epc-qr .qrbox {
    background: #fff; border: 1px solid var(--border); border-radius: 12px;
    padding: 14px; display: inline-block;
  }
  .epc-qr .cap { font-size: 12.5px; color: var(--muted); margin-top: 10px; max-width: 220px; line-height: 1.5; }
  footer {
    text-align: center; padding: 28px 20px 40px; font-size: 14px; color: var(--muted);
  }
  footer a { color: var(--eu-blue); font-weight: 600; text-decoration: none; }
  footer a:hover { text-decoration: underline; }
  footer .about { max-width: 60em; margin: 0 auto 14px; font-size: 13px; line-height: 1.6; }
${PAPER_CSS}
  .joverlay {
    position: fixed; inset: 0; z-index: 60; background: rgba(8, 26, 84, 0.80);
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .joverlay[hidden] { display: none; }
  .jbox {
    position: relative; width: 100%; max-width: 440px; background: #fff; color: var(--ink);
    border-radius: 16px; padding: 28px 26px 24px; box-shadow: 0 18px 50px rgba(8, 26, 84, 0.35);
  }
  .jbox h3 { margin: 0 32px 8px 0; font-size: 20px; color: var(--eu-blue); }
  .jbox p { margin: 0 0 14px; font-size: 15px; line-height: 1.55; color: var(--muted); }
  .jbox label { display: block; font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
  .jbox input[type="text"] {
    width: 100%; font: inherit; font-size: 16px; padding: 11px 12px;
    border: 1px solid #C9D6F5; border-radius: 10px; color: var(--ink); background: #fff;
  }
  .jbox input[type="text"]:focus { outline: 3px solid rgba(0, 51, 153, 0.35); outline-offset: 1px; border-color: var(--eu-blue); }
  .jhp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
  .jbtn {
    margin-top: 14px; width: 100%; font: inherit; font-weight: 700; font-size: 15.5px;
    padding: 12px 20px; border: 0; border-radius: 10px; background: var(--eu-blue); color: #fff; cursor: pointer;
  }
  .jbtn:disabled { opacity: 0.6; cursor: default; }
  .jmsg { min-height: 1.4em; margin: 12px 0 0; font-size: 14px; color: var(--ink); }
  .jclose {
    position: absolute; top: 12px; right: 12px; width: 34px; height: 34px;
    border: 0; border-radius: 50%; background: #E8EDFB; color: #081A54;
    font-size: 20px; font-weight: 700; line-height: 1; cursor: pointer;
  }
</style>
</head>
<body>
<header class="hero">
  <div class="flags">
    ${euFlagSvg(150)}
    ${sepaMark}
  </div>
  <h1>Open standards to make SEPA payments have an UX (User&nbsp;Experience) as good as the UX that <em>VISA</em> and <em>Mastercard</em> have today.</h1>
  <p class="call">For this to happen, we invite all <strong>EEA banks</strong> to join the <strong>instaSEPA</strong> pan-European initiative and adopt:</p>
  <div class="standards">
    <span>EPC QR Code standard</span>
    <span>SRTP &mdash; SEPA Request-to-Pay</span>
  </div>
</header>

${paperHtml()}

<main>
  <section class="card">
    <h2>The EPC QR Code standard <span class="tag">EPC069-12</span></h2>
    <p>The <strong>EPC QR Code</strong> is the European Payments Council's open standard for <strong>scan-to-pay</strong> SEPA Credit Transfers. One QR code encodes everything a payment needs — beneficiary name, IBAN, amount and reference — so the payer simply scans it with their own banking app, sees a fully pre-filled transfer, and approves it with one tap.</p>
    <p>No card networks, no interchange fees, no manual IBAN typing — and combined with <strong>SEPA Instant</strong>, the money arrives in seconds. Banking apps in Austria, Belgium, Germany, Finland and the Netherlands already scan it today; when <strong>every</strong> EEA banking app does, any invoice, checkout or donation box in Europe becomes payable in one scan.</p>
    <div class="epc-demo">
      <div class="epc-fields">
        <h3>The elements inside an EPC QR code</h3>
        <table class="epc-table">
          <tr><td>Service tag</td><td>BCD</td></tr>
          <tr><td>Version</td><td>002</td></tr>
          <tr><td>Character set</td><td>1 (UTF-8)</td></tr>
          <tr><td>Identification</td><td>SCT (SEPA Credit Transfer)</td></tr>
          <tr><td>BIC</td><td><em>(optional within the EEA)</em></td></tr>
          <tr><td>Beneficiary name</td><td>Demo A N</td></tr>
          <tr><td>Beneficiary IBAN</td><td>RO35REVO0000172343073545</td></tr>
          <tr><td>Amount</td><td>EUR1.00</td></tr>
          <tr><td>Purpose code</td><td><em>(optional)</em></td></tr>
          <tr><td>Remittance info</td><td>unique IBAN per trx</td></tr>
        </table>
      </div>
      <div class="epc-qr">
        <div class="qrbox"><div id="epcqr"></div></div>
        <div class="cap">A live example built from the fields on the left — scan it with your banking app and it pre-fills a <strong>&euro;1.00</strong> SEPA transfer to the maintainer's Revolut account.</div>
      </div>
    </div>
  </section>

  <section class="card">
    <h2>SRTP &mdash; SEPA Request-to-Pay <span class="tag">EPC SRTP scheme</span></h2>
    <p><strong>SEPA Request-to-Pay</strong> is the EPC scheme that lets a payee send a structured payment request (pain.013) through the banking network straight to the payer's own app. The payer gets a notification, reviews the amount and the merchant's name, and approves with strong customer authentication — which triggers an instant SEPA credit transfer back to the payee.</p>
    <p>It is the open, account-to-account answer to "tap to approve": request, notify, authenticate, settle — in seconds, at European scale. Adopted by all EEA banks, SRTP would give every merchant and subscription business a native, card-free way to collect payments with a user experience equal to the best card wallets.</p>
    <div class="epc-demo">
      <div class="epc-fields">
        <h3>Technical overview — the EPC scheme</h3>
        <table class="epc-table">
          <tr><td>Scheme rulebook</td><td>EPC SEPA Request-to-Pay (SRTP) Scheme Rulebook</td></tr>
          <tr><td>Message standard</td><td>ISO 20022</td></tr>
          <tr><td>Request message</td><td>pain.013 &mdash; payment activation request (payee &rarr; payer)</td></tr>
          <tr><td>Status message</td><td>pain.014 &mdash; accept / reject status report (payer &rarr; payee)</td></tr>
          <tr><td>Model</td><td>4-corner: payee &harr; payee's RTP provider &harr; payer's RTP provider &harr; payer</td></tr>
          <tr><td>Transport</td><td>API-based exchange between RTP service providers (EPC API specifications)</td></tr>
          <tr><td>Payer options</td><td>Accept now &middot; accept later &middot; reject; requests carry an expiry date/time</td></tr>
          <tr><td>Funds movement</td><td>none &mdash; SRTP is messaging only; settlement follows as SCT / SCT Inst</td></tr>
          <tr><td>Participants</td><td>PSPs and licensed non-PSP RTP service providers</td></tr>
          <tr><td>Authentication</td><td>payer approves in their own app with SCA (PSD2 Art. 97)</td></tr>
        </table>
      </div>
    </div>
  </section>
</main>

<footer>
  <p class="about">About this page: this is a discussion draft contributed by smartIBAN, a Malta-license applicant. It does not represent the position of the EPC or the ECB. The instaSEPA mark is proposed as a shared, openly governed acceptance brand, not a single company's product.</p>
  Maintained by <a href="https://www.linkedin.com/in/alexmtzcom" target="_blank" rel="noopener">Alexandru Negru</a>
</footer>
${VIDEO_OVERLAY_HTML}
<div class="joverlay" id="join-overlay" hidden>
  <div class="jbox" role="dialog" aria-modal="true" aria-labelledby="join-title">
    <button type="button" class="jclose" id="join-close" aria-label="Close">&#215;</button>
    <h3 id="join-title">Join the instaSEPA initiative</h3>
    <p>Leave an email address or a phone number. We contact you directly.</p>
    <form id="join-form" novalidate>
      <label for="join-contact">Email address or phone number</label>
      <input id="join-contact" name="c" type="text" autocomplete="email" maxlength="120" required />
      <input id="join-web" name="w" type="text" class="jhp" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <button type="submit" class="jbtn" id="join-submit">Send</button>
    </form>
    <p class="jmsg" id="join-msg" aria-live="polite"></p>
  </div>
</div>
<script>
(function () {
  var overlay = document.getElementById('join-overlay');
  var form = document.getElementById('join-form');
  var input = document.getElementById('join-contact');
  var msg = document.getElementById('join-msg');
  var btn = document.getElementById('join-submit');
  if (!overlay || !form) return;
  var last = null;
  function openJoin(e) {
    last = e.currentTarget;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    msg.textContent = '';
    form.hidden = false;
    input.focus();
  }
  function closeJoin() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (last) last.focus();
  }
  var opens = document.querySelectorAll('.join-open');
  for (var i = 0; i < opens.length; i++) opens[i].addEventListener('click', openJoin);
  document.getElementById('join-close').addEventListener('click', closeJoin);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeJoin(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) closeJoin();
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var c = input.value.trim();
    if (!c) { msg.textContent = 'Enter an email address or a phone number.'; input.focus(); return; }
    btn.disabled = true;
    msg.textContent = 'Sending...';
    fetch('/api/join', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ c: c, w: document.getElementById('join-web').value })
    }).then(function (r) {
      return r.json().catch(function () { return { ok: false }; });
    }).then(function (j) {
      btn.disabled = false;
      if (j.ok) { form.hidden = true; msg.textContent = 'Thank you. We will contact you.'; return; }
      if (j.error === 'invalid') { msg.textContent = 'That does not look like an email address or a phone number.'; return; }
      if (j.error === 'rate') { msg.textContent = 'Too many requests from your network. Try again in ten minutes.'; return; }
      msg.textContent = 'Something went wrong. Contact us on LinkedIn instead.';
    }).catch(function () {
      btn.disabled = false;
      msg.textContent = 'Network error. Try again.';
    });
  });
})();
</script>
<script>
${VIDEO_OVERLAY_JS}
</script>
<script>
(function () {
  if (typeof QRCode === 'undefined') return;
  var payload = 'BCD\\n002\\n1\\nSCT\\n\\nDemo A N\\nRO35REVO0000172343073545\\nEUR1.00\\n\\n\\nunique IBAN per trx';
  new QRCode(document.getElementById('epcqr'), {
    text: payload, width: 180, height: 180,
    correctLevel: QRCode.CorrectLevel.M,
  });
})();
</script>
</body>
</html>`;
}

// Visitor analytics: counted on the page's beacon, never on the request
// itself, so clients that do not run JavaScript never reach the feed.
const PAGE_HTML = withBeacon(landingHtml());

function b64Bytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
const MARK_PNG = b64Bytes(MARK_PNG_B64);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname === 'www.instasepa.eu') {
      return new Response(null, {
        status: 301,
        headers: { location: 'https://instasepa.eu' + url.pathname + url.search, 'cache-control': 'public, max-age=86400' },
      });
    }
    if (url.pathname === '/api/v') return handleBeacon(request, env, ctx);
    if (url.pathname === '/api/join') return handleJoin(request, env, ctx);
    if (url.pathname === '/mark.png') {
      return new Response(MARK_PNG, {
        headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' },
      });
    }
    if (url.pathname === '/favicon.svg') {
      return new Response(FAVICON_SVG, {
        headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' },
      });
    }
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(PAGE_HTML, {
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' },
      });
    }
    return Response.redirect(url.origin + '/', 302);
  },
};
