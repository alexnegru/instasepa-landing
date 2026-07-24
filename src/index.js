// instasepa.eu — static landing page advocating open SEPA payment standards
// (EPC QR Code + SEPA Request-to-Pay). Served on instasepa.eu + www.

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
<text x="90" y="98" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#9FB3E8" text-anchor="middle" letter-spacing="1">SINGLE EURO PAYMENTS AREA</text></svg>`;

function landingHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>instaSEPA — open standards for instant SEPA payments</title>
<meta name="description" content="EPC QR Code and SEPA Request-to-Pay: the open, pan-European standards that give SEPA payments a user experience as good as cards." />
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
  main { max-width: 880px; margin: -26px auto 40px; padding: 0 20px; }
  .card {
    background: var(--card); border: 1px solid var(--border); border-radius: 16px;
    padding: 30px 32px; margin-bottom: 22px;
    box-shadow: 0 2px 6px rgba(15,23,42,0.05), 0 12px 34px rgba(15,23,42,0.06);
  }
  .card h2 {
    margin: 0 0 12px; font-size: 20px; color: var(--eu-blue);
    display: flex; align-items: center; gap: 10px;
  }
  .card h2 .tag {
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: var(--eu-blue);
    background: #E8EDFB; border: 1px solid #C9D6F5; padding: 3px 10px; border-radius: 999px;
  }
  .card p { margin: 0 0 12px; font-size: 15.5px; line-height: 1.65; color: var(--muted); }
  .card p:last-child { margin-bottom: 0; }
  .card strong { color: var(--ink); }
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
</style>
</head>
<body>
<header class="hero">
  <div class="flags">
    ${euFlagSvg(150)}
    ${sepaMark}
  </div>
  <h1>Welcome to open standards to make SEPA payments have a UX (User&nbsp;Experience) as good as the UX that <em>VISA</em> and <em>Mastercard</em> have today.</h1>
  <p class="call">For these, all <strong>EEA banks</strong> should join the pan-European solution and adopt:</p>
  <div class="standards">
    <span>EPC QR Code standard</span>
    <span>SRTP &mdash; SEPA Request-to-Pay</span>
  </div>
</header>

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
          <tr><td>Beneficiary name</td><td>Alexandru Negru</td></tr>
          <tr><td>Beneficiary IBAN</td><td>RO35REVO0000172343073545</td></tr>
          <tr><td>Amount</td><td>EUR1.00</td></tr>
          <tr><td>Purpose code</td><td><em>(optional)</em></td></tr>
          <tr><td>Remittance info</td><td>unique IBAN by smartIBAN</td></tr>
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
  </section>
</main>

<footer>
  Maintained by <a href="https://www.linkedin.com/in/alexmtzcom" target="_blank" rel="noopener">Alex</a>
</footer>
<script>
(function () {
  if (typeof QRCode === 'undefined') return;
  var payload = 'BCD\\n002\\n1\\nSCT\\n\\nAlexandru Negru\\nRO35REVO0000172343073545\\nEUR1.00\\n\\n\\nunique IBAN by smartIBAN';
  new QRCode(document.getElementById('epcqr'), {
    text: payload, width: 180, height: 180,
    correctLevel: QRCode.CorrectLevel.M,
  });
})();
</script>
</body>
</html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(landingHtml(), {
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' },
      });
    }
    return Response.redirect(url.origin + '/', 302);
  },
};
