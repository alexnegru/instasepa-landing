// malta.instasepa.eu — public proposal page addressed to the MFSA and the
// Central Bank of Malta: coordinate the Maltese market onto the EPC QR code
// and SEPA Request-to-Pay so retail payments run on SCT Inst.
//
// Static page, no inline JS. Copy follows ASD-STE100 style (Alex's rule).

import OG_PNG_B64 from './og.js';

// ---------------------------------------------------------------------------
// SVG building blocks
// ---------------------------------------------------------------------------

// The instaSEPA wordmark (Alex's artwork, 2026-08-11): outlined gold "insta"
// with two-color contactless arcs, above the SEPA logotype with the euro sign
// as the E. Drawn with text + tspans so browsers kern it natively.
const LOGO_BLUE = '#10298E';
const LOGO_GOLD = '#FFC400';

// Contactless arcs, alternating blue/gold from the smallest out.
function logoArcs(cx, cy, sw, radii) {
  const parts = radii.map(function (r, i) {
    const dx = +(r * Math.SQRT1_2).toFixed(2);
    return '<path d="M ' + (cx + dx) + ' ' + (cy - dx) +
      ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + dx) + ' ' + (cy + dx) + '"' +
      ' fill="none" stroke="' + (i % 2 === 0 ? LOGO_BLUE : LOGO_GOLD) + '"' +
      ' stroke-width="' + sw + '" stroke-linecap="round"/>';
  });
  return parts.join('');
}

const wordmarkInner =
  '<text x="16" y="92" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="78" fill="' + LOGO_GOLD + '" stroke="' + LOGO_BLUE + '" stroke-width="5" stroke-linejoin="round" paint-order="stroke" letter-spacing="2">insta</text>' +
  logoArcs(268, 56, 11, [12, 24, 36, 48]) +
  '<text x="8" y="286" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="172" fill="' + LOGO_BLUE + '">' +
  '<tspan>S</tspan>' +
  '<tspan font-size="196" dy="10" fill="' + LOGO_GOLD + '" stroke="' + LOGO_BLUE + '" stroke-width="6" stroke-linejoin="round" paint-order="stroke">&#8364;</tspan>' +
  '<tspan dy="-10">PA</tspan>' +
  '</text>';

export { wordmarkInner };

function wordmarkSvg(width) {
  return '<svg width="' + width + '" viewBox="0 0 620 310" overflow="visible" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="instaSEPA mark">' +
    wordmarkInner + '</svg>';
}

// Shop-door acceptance sticker.
const stickerSvg = '<svg viewBox="0 0 460 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sticker: instaSEPA accepted here. Tap and Pay with your banking app." class="sticker">' +
  '<rect x="8" y="8" width="444" height="284" rx="24" fill="#FFFFFF" stroke="#10298E" stroke-width="3"/>' +
  '<svg x="95" y="28" width="270" height="135" viewBox="0 0 620 310">' + wordmarkInner + '</svg>' +
  '<text x="230" y="212" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="27" fill="#1C2233" text-anchor="middle">Accepted here</text>' +
  '<text x="230" y="246" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="#58627A" text-anchor="middle">Tap &amp; Pay with your banking app.</text>' +
  '</svg>';

// Diagram 1: funds flow and revenue split.
const fundsFlowSvg = '<svg viewBox="0 0 900 410" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Funds flow: the buyer pays 100 euro by SCT Inst to the acquiring virtual IBAN. The merchant receives 99 euro. The 1 euro fee splits between the issuing bank and the acquiring bank." font-family="Arial, Helvetica, sans-serif">' +
  '<defs><marker id="ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#10298E"/></marker></defs>' +
  // three party boxes
  '<rect x="20" y="70" width="200" height="86" rx="12" fill="#F5F7FC" stroke="#10298E" stroke-width="2"/>' +
  '<text x="120" y="105" font-size="17" font-weight="bold" fill="#0A1E6B" text-anchor="middle">Buyer</text>' +
  '<text x="120" y="128" font-size="12.5" fill="#58627A" text-anchor="middle">account at the issuing bank</text>' +
  '<rect x="350" y="70" width="200" height="86" rx="12" fill="#F5F7FC" stroke="#10298E" stroke-width="2"/>' +
  '<text x="450" y="105" font-size="17" font-weight="bold" fill="#0A1E6B" text-anchor="middle">Acquiring vIBAN</text>' +
  '<text x="450" y="128" font-size="12.5" fill="#58627A" text-anchor="middle">acquiring bank or PSP</text>' +
  '<rect x="680" y="70" width="200" height="86" rx="12" fill="#F5F7FC" stroke="#10298E" stroke-width="2"/>' +
  '<text x="780" y="105" font-size="17" font-weight="bold" fill="#0A1E6B" text-anchor="middle">Merchant</text>' +
  '<text x="780" y="128" font-size="12.5" fill="#58627A" text-anchor="middle">shop or webshop</text>' +
  // arrows across
  '<line x1="222" y1="113" x2="346" y2="113" stroke="#10298E" stroke-width="2.5" marker-end="url(#ar1)"/>' +
  '<text x="284" y="98" font-size="15" font-weight="bold" fill="#0A1E6B" text-anchor="middle">&#8364;100.00</text>' +
  '<text x="284" y="134" font-size="12" fill="#58627A" text-anchor="middle">SCT Inst, seconds</text>' +
  '<line x1="552" y1="113" x2="676" y2="113" stroke="#10298E" stroke-width="2.5" marker-end="url(#ar1)"/>' +
  '<text x="614" y="98" font-size="15" font-weight="bold" fill="#0A1E6B" text-anchor="middle">&#8364;99.00</text>' +
  '<text x="614" y="134" font-size="12" fill="#58627A" text-anchor="middle">instant credit</text>' +
  // buyer pays nothing extra
  '<rect x="45" y="176" width="150" height="34" rx="17" fill="#FFF6CC" stroke="#E3B800" stroke-width="1.5"/>' +
  '<text x="120" y="198" font-size="13.5" font-weight="bold" fill="#7A6200" text-anchor="middle">pays &#8364;0.00 extra</text>' +
  // fee branch
  '<line x1="450" y1="158" x2="450" y2="206" stroke="#10298E" stroke-width="2.5" marker-end="url(#ar1)"/>' +
  '<rect x="365" y="210" width="170" height="52" rx="12" fill="#10298E"/>' +
  '<text x="450" y="232" font-size="16" font-weight="bold" fill="#FFCC00" text-anchor="middle">&#8364;1.00 fee</text>' +
  '<text x="450" y="252" font-size="12" fill="#C9D4F2" text-anchor="middle">1% of the payment</text>' +
  '<line x1="410" y1="264" x2="355" y2="298" stroke="#10298E" stroke-width="2.5" marker-end="url(#ar1)"/>' +
  '<line x1="490" y1="264" x2="545" y2="298" stroke="#10298E" stroke-width="2.5" marker-end="url(#ar1)"/>' +
  '<rect x="240" y="302" width="170" height="48" rx="12" fill="#F5F7FC" stroke="#10298E" stroke-width="2"/>' +
  '<text x="325" y="323" font-size="15" font-weight="bold" fill="#0A1E6B" text-anchor="middle">&#8364;0.50</text>' +
  '<text x="325" y="341" font-size="12.5" fill="#58627A" text-anchor="middle">issuing bank</text>' +
  '<rect x="490" y="302" width="170" height="48" rx="12" fill="#F5F7FC" stroke="#10298E" stroke-width="2"/>' +
  '<text x="575" y="323" font-size="15" font-weight="bold" fill="#0A1E6B" text-anchor="middle">&#8364;0.50</text>' +
  '<text x="575" y="341" font-size="12.5" fill="#58627A" text-anchor="middle">acquiring bank</text>' +
  '<text x="450" y="388" font-size="13" fill="#58627A" text-anchor="middle">Second example: &#8364;0.50 acquirer, &#8364;0.40 issuer, &#8364;0.10 PSP that connects the acquirer.</text>' +
  '</svg>';

// Diagram 2: message sequence for one tap.
function seqSvg() {
  const lanes = [
    { x: 120, label1: 'Buyer', label2: 'banking app' },
    { x: 340, label1: 'Shop till', label2: 'POS' },
    { x: 580, label1: 'Acquirer', label2: 'bank or PSP' },
    { x: 790, label1: 'Issuing bank', label2: 'holds the account' },
  ];
  let s = '<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Message sequence: NFC tap with a unique IBAN, Request-to-Pay to that IBAN, approval with SCA, SCT Inst transfer, confirmation to the till." font-family="Arial, Helvetica, sans-serif">' +
    '<defs><marker id="ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#10298E"/></marker></defs>';
  for (const l of lanes) {
    s += '<line x1="' + l.x + '" y1="72" x2="' + l.x + '" y2="548" stroke="#8792B3" stroke-width="1.2" stroke-dasharray="4 5"/>' +
      '<rect x="' + (l.x - 88) + '" y="16" width="176" height="52" rx="10" fill="#10298E"/>' +
      '<text x="' + l.x + '" y="38" font-size="14.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">' + l.label1 + '</text>' +
      '<text x="' + l.x + '" y="56" font-size="11.5" fill="#C9D4F2" text-anchor="middle">' + l.label2 + '</text>';
  }
  const halo = ' stroke="#FFFFFF" stroke-width="5" paint-order="stroke"';
  function msg(x1, x2, y, main, sub) {
    let t = '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="#10298E" stroke-width="2.5" marker-end="url(#ar2)"/>' +
      '<text x="' + ((x1 + x2) / 2) + '" y="' + (y - 10) + '" font-size="13.5" font-weight="bold" fill="#0A1E6B" text-anchor="middle"' + halo + '>' + main + '</text>';
    if (sub) t += '<text x="' + ((x1 + x2) / 2) + '" y="' + (y + 20) + '" font-size="12" fill="#58627A" text-anchor="middle"' + halo + '>' + sub + '</text>';
    return t;
  }
  function note(cx, y, w, line1, line2) {
    let t = '<rect x="' + (cx - w / 2) + '" y="' + y + '" width="' + w + '" height="' + (line2 ? 46 : 30) + '" rx="8" fill="#FFF6CC" stroke="#E3B800" stroke-width="1.5"/>' +
      '<text x="' + cx + '" y="' + (y + 20) + '" font-size="12.5" fill="#7A6200" text-anchor="middle">' + line1 + '</text>';
    if (line2) t += '<text x="' + cx + '" y="' + (y + 37) + '" font-size="12.5" fill="#7A6200" text-anchor="middle">' + line2 + '</text>';
    return t;
  }
  s += msg(124, 336, 110, '&#9312; NFC tap', 'the phone sends a unique IBAN');
  s += msg(344, 576, 175, '&#9313; amount + unique IBAN', '');
  s += msg(584, 786, 240, '&#9314; Request-to-Pay (SRTP)', 'addressed to the unique IBAN');
  s += note(790, 280, 195, '&#9315; finds the real account', 'behind the unique IBAN');
  s += msg(786, 124, 375, '&#9316; payment request appears in the banking app', '');
  s += note(120, 400, 190, '&#9317; buyer approves', 'with SCA');
  s += msg(786, 584, 480, '&#9318; SCT Inst transfer', '');
  s += msg(576, 344, 535, '&#9319; confirmation: paid', '');
  s += '<text x="450" y="588" font-size="13.5" font-weight="bold" fill="#0A1E6B" text-anchor="middle">From tap to confirmation: under 5 seconds in the demo.</text>';
  s += '</svg>';
  return s;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function pageHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>instaSEPA Malta &middot; instant SEPA payments at the point of sale</title>
<meta name="description" content="A proposal to the MFSA and the Central Bank of Malta: instant SEPA payments in shops and online, built on the EPC QR code and SEPA Request-to-Pay." />
<meta name="robots" content="index,follow" />
<link rel="canonical" href="https://malta.instasepa.eu/" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="instaSEPA" />
<meta property="og:url" content="https://malta.instasepa.eu/" />
<meta property="og:title" content="instaSEPA Malta: instant SEPA payments at the point of sale" />
<meta property="og:description" content="A proposal to the MFSA and the Central Bank of Malta: instant SEPA payments in shops and online, built on the EPC QR code and SEPA Request-to-Pay." />
<meta property="og:image" content="https://malta.instasepa.eu/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebPage","name":"instaSEPA Malta","url":"https://malta.instasepa.eu/","inLanguage":"en","description":"A proposal to the MFSA and the Central Bank of Malta: instant SEPA payments in shops and online, built on the EPC QR code and SEPA Request-to-Pay."}
</script>
<style>
  :root {
    --blue: #10298E;
    --blue-deep: #0A1E6B;
    --gold: #FFCC00;
    --ink: #1C2233;
    --muted: #58627A;
    --panel: #F5F7FC;
    --line: #DCE3F2;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @media (prefers-reduced-motion: no-preference) {
    html { scroll-behavior: smooth; }
  }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--ink);
    background: #FFFFFF;
    line-height: 1.65;
    -webkit-text-size-adjust: 100%;
  }
  .wrap { max-width: 980px; margin: 0 auto; padding: 0 22px; }
  a:focus-visible, .btn:focus-visible, .diagram:focus-visible {
    outline: 3px solid var(--gold); outline-offset: 2px;
  }
  header.top {
    border-bottom: 1px solid var(--line);
    background: #FFFFFF;
  }
  .topbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 16px 0; }
  .wordmark { font-size: 22px; color: var(--blue); text-decoration: none; }
  .wordmark .w1 { font-style: italic; font-weight: 400; }
  .wordmark .w2 { font-style: italic; font-weight: 800; }
  .topbar .where { font-size: 14px; color: var(--muted); text-align: right; }
  .topbar .where b { color: var(--blue-deep); }
  .hero { padding: 56px 0 44px; }
  .hero-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 44px; align-items: center; }
  .eyebrow {
    font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--blue); font-weight: 700; margin-bottom: 14px;
  }
  h1 { font-size: clamp(30px, 5vw, 44px); line-height: 1.15; color: var(--blue-deep); margin-bottom: 18px; }
  .hero p.lead { font-size: 18px; color: var(--muted); max-width: 34em; }
  .cta { margin-top: 26px; display: flex; gap: 14px; flex-wrap: wrap; }
  .btn {
    display: inline-block; padding: 12px 22px; border-radius: 10px;
    font-weight: 700; font-size: 15.5px; text-decoration: none;
  }
  .btn.primary { background: var(--blue); color: #FFFFFF; }
  .btn.ghost { border: 2px solid var(--blue); color: var(--blue); }
  .hero-mark { text-align: center; }
  .hero-mark svg { max-width: 100%; height: auto; }
  .hero-mark .cap { font-size: 13px; color: var(--muted); margin-top: 10px; }
  section { padding: 40px 0; border-top: 1px solid var(--line); }
  h2 { font-size: clamp(23px, 3.4vw, 30px); color: var(--blue-deep); margin-bottom: 18px; }
  section p { margin-bottom: 14px; max-width: 46em; }
  section p:last-child { margin-bottom: 0; }
  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 10px; }
  .card {
    background: var(--panel); border: 1px solid var(--line); border-radius: 14px;
    padding: 20px 22px;
  }
  .card h3 { font-size: 17px; color: var(--blue); margin-bottom: 8px; }
  .card p { font-size: 15px; margin-bottom: 0; }
  .std { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 18px 0; }
  .std .card h3 { color: var(--blue-deep); }
  .std .card .tag { font-size: 12px; color: var(--muted); font-weight: 400; }
  .diagram {
    overflow-x: auto; margin: 22px 0 8px;
    border: 1px solid var(--line); border-radius: 14px; background: #FFFFFF;
    padding: 14px;
  }
  .diagram svg { display: block; min-width: 680px; width: 100%; height: auto; }
  ol.steps { margin: 16px 0 16px 22px; max-width: 46em; }
  ol.steps li { margin-bottom: 10px; }
  .callout {
    background: var(--panel); border-left: 5px solid var(--gold);
    border-radius: 0 12px 12px 0; padding: 18px 22px; margin-top: 20px; max-width: 46em;
  }
  .callout b { color: var(--blue-deep); }
  .sticker-wrap { display: flex; justify-content: center; margin: 26px 0 10px; }
  svg.sticker { width: min(460px, 100%); height: auto; filter: drop-shadow(0 8px 22px rgba(16, 41, 142, 0.18)); }
  .demo-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 12px; }
  .demo-cards .card a.btn { margin-top: 14px; }
  .vslot {
    margin-top: 14px; aspect-ratio: 16 / 9; border: 2px dashed var(--line);
    border-radius: 10px; background: #FFFFFF; color: var(--muted);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 8px; font-size: 13.5px;
  }
  footer { border-top: 1px solid var(--line); padding: 26px 0 40px; }
  .foot { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
  .foot .small { font-size: 13.5px; color: var(--muted); }
  .foot a { color: var(--blue); }
  @media (max-width: 760px) {
    .hero-grid { grid-template-columns: 1fr; gap: 30px; }
    .cards, .std, .demo-cards { grid-template-columns: 1fr; }
    .topbar { flex-wrap: wrap; }
    .topbar .where { text-align: left; }
  }
  @media print {
    .cta, .btn { display: none; }
    section { page-break-inside: avoid; }
  }
</style>
</head>
<body>

<header class="top">
  <div class="wrap topbar">
    <a class="wordmark" href="https://instasepa.eu"><span class="w1">insta</span><span class="w2">SEPA</span></a>
    <div class="where"><b>Malta</b> &middot; proposal to the MFSA and the Central Bank of Malta</div>
  </div>
</header>

<main>

<div class="wrap hero">
  <div class="hero-grid">
    <div>
      <div class="eyebrow">An open proposal for Malta</div>
      <h1>Pay in any shop in Malta, straight from your bank account.</h1>
      <p class="lead">Malta can bring instant SEPA payments to the shop counter with standards that already exist. A customer taps a phone, and the merchant has the money in seconds. The payment moves directly from one Maltese bank account to another.</p>
      <div class="cta">
        <a class="btn primary" href="https://bank.instasepa.eu/#sepa">Try the live demo</a>
        <a class="btn ghost" href="#proposal">Read the proposal</a>
      </div>
    </div>
    <div class="hero-mark">
      ${wordmarkSvg(280)}
      <div class="cap">The proposed mark: the SEPA identity with <i>insta</i> on top of it.</div>
    </div>
  </div>
</div>

<section id="proposal">
  <div class="wrap">
    <h2>The proposal</h2>
    <p>Every retail bank in Malta operates SEPA Instant today. The Instant Payments Regulation (EU&nbsp;2024/886) made that mandatory in 2025. The European Payments Council also publishes two standards that connect this rail to the point of sale: the EPC QR code and SEPA Request-to-Pay.</p>
    <p>When the Maltese market adopts both standards, customers can pay every merchant from a bank account. This works in shops and online. The payment settles in seconds. The banks keep their existing systems and add two functions to their apps.</p>
    <p>A small group of banks and payment institutions serves the whole Maltese market. They must agree on one adoption timeline.</p>
  </div>
</section>

<section id="standards">
  <div class="wrap">
    <h2>Built on published standards</h2>
    <p>instaSEPA is an open payment method. It uses four building blocks, and European bodies define all of them:</p>
    <div class="std">
      <div class="card"><h3>SCT Inst <span class="tag">&middot; the rail</span></h3><p>The instant SEPA credit transfer. Every Maltese retail bank supports it today.</p></div>
      <div class="card"><h3>EPC QR code <span class="tag">&middot; EPC024-22 (MSCT)</span></h3><p>One QR standard for merchant-presented payments, at the till and in webshops.</p></div>
      <div class="card"><h3>SEPA Request-to-Pay <span class="tag">&middot; EPC014-20</span></h3><p>The merchant requests the payment. The customer approves it inside the banking app.</p></div>
      <div class="card"><h3>Virtual IBANs <span class="tag">&middot; acquiring side</span></h3><p>The acquirer assigns them to merchants and transactions. Routing and reconciliation become automatic.</p></div>
    </div>
    <p>Any licensed bank or payment institution can take part. instaSEPA is the shared retail brand for the method, like the SEPA mark. The participants own the brand together.</p>
  </div>
</section>

<section id="gains">
  <div class="wrap">
    <h2>Who gains what</h2>
    <div class="cards">
      <div class="card"><h3>Citizens</h3><p>Tap your phone at the till. Your banking app opens and shows the amount and the shop name. Approve the payment the way you approve any transfer. The merchant has the money in seconds. You pay with the banking app you already have.</p></div>
      <div class="card"><h3>Merchants</h3><p>The money arrives in seconds, and the payment is final. SEPA credit transfers have no chargebacks. The all-in cost is about 1% per payment. Compare that with the fees you pay now to accept cards.</p></div>
      <div class="card"><h3>Banks</h3><p>Acquiring becomes a new business line for the merchants you already serve. The issuing side earns a share of the fee for every payment that starts in your app. Card acquiring can continue in parallel.</p></div>
      <div class="card"><h3>Fintechs and PSPs</h3><p>Acquiring banks need virtual IBAN management, and PSPs can supply it as a service. PSPs can also onboard merchants and connect till systems and webshops. This creates new licensed business on infrastructure that already operates.</p></div>
    </div>
  </div>
</section>

<section id="money">
  <div class="wrap">
    <h2>Where the money goes</h2>
    <p>The customer pays only the shop price. The merchant receives 99% within seconds. The remaining 1% pays the institutions that operate the payment. The diagram shows two example splits.</p>
    <div class="diagram" tabindex="0" role="region" aria-label="Funds flow diagram">${fundsFlowSvg}</div>
    <p>The split gives every institution in the chain a commercial reason to take part. Card interchange plays that role today. This model is transparent, and the full fee stays with the banks and PSPs that do the work.</p>
  </div>
</section>

<section id="tap">
  <div class="wrap">
    <h2>What happens on a tap</h2>
    <p>The chain uses standard messages from end to end.</p>
    <div class="diagram" tabindex="0" role="region" aria-label="Message sequence diagram">${seqSvg()}</div>
    <ol class="steps">
      <li>The buyer holds the phone against the till. The banking app transmits a unique IBAN over NFC. A QR code carries the same data when NFC is not available.</li>
      <li>The till sends a Request-to-Pay to that unique IBAN. The request contains the amount and the merchant name.</li>
      <li>The issuing bank maps the unique IBAN to the buyer's real account and shows the request in the banking app.</li>
      <li>The buyer approves with strong customer authentication (SCA).</li>
      <li>The issuing bank sends an SCT Inst transfer to the acquirer. The acquirer credits the merchant and confirms to the till.</li>
    </ol>
    <p>The demo completes this chain in under 5 seconds. The SCT Inst scheme caps the transfer leg at 10 seconds. The unique IBAN also protects the buyer. Each tap transmits a different IBAN, and the merchant never sees the real account number.</p>
    <p>The banking apps need two additions: EPC QR scanning and SRTP handling. A bank joins the SRTP scheme and keeps its settlement systems unchanged.</p>
  </div>
</section>

<section id="mark">
  <div class="wrap">
    <h2>One mark on every shop door</h2>
    <p>Customers must see one sign and know that they can pay. The mark places <i>insta</i> in front of the SEPA identity that Europeans already know. All participants display the same mark.</p>
    <div class="sticker-wrap">${stickerSvg}</div>
  </div>
</section>

<section id="why">
  <div class="wrap">
    <h2>Why Malta is ready now</h2>
    <p>Malta has a short list of retail banks. One national authority licenses all of them, together with the payment institutions. Malta can bring every relevant institution into one room.</p>
    <p>The payment infrastructure is ready. Since October 2025 the Instant Payments Regulation requires every euro-area bank to send and to receive instant transfers. The banks have already paid for this capability. The point of sale can turn that investment into revenue. This opportunity is still open.</p>
    <p>Europe depends on two non-EU card schemes for most card payments. The Commission and the ECB have this problem on their agenda. A member state that runs daily payments on open EPC standards gives the EU its first working example.</p>
  </div>
</section>

<section id="wins">
  <div class="wrap">
    <h2>What Malta gains</h2>
    <p>Malta becomes the reference implementation for SEPA at the point of sale. The standards are European, so the result transfers to any other member state without change. A jurisdiction that proves this attracts payment companies that want to build on it.</p>
    <p>The credit goes to the institutions that bring the market together: the MFSA and the Central Bank of Malta. The timing works in their favour. The EU now looks for a leader on payment sovereignty. A small country with a coordinated market can take this role.</p>
  </div>
</section>

<section id="plan">
  <div class="wrap">
    <h2>What has to happen</h2>
    <ol class="steps">
      <li>Banks and payment institutions in Malta add EPC QR scanning and SRTP handling to their existing apps.</li>
      <li>Acquiring banks add virtual IBAN management. They can build it or buy it from a PSP.</li>
      <li>The market agrees on one adoption timeline. The regulator calls the institutions together.</li>
    </ol>
    <div class="callout"><b>The first step</b> is a pilot in the MFSA FinTech Regulatory Sandbox. A small group of banks and PSPs, together with a defined set of merchants, tests the full payment chain in Malta.</div>
  </div>
</section>

<section id="demo">
  <div class="wrap">
    <h2>See it work today</h2>
    <div class="demo-cards">
      <div class="card">
        <h3>Live checkout demo</h3>
        <p>A web checkout with a real EPC QR code and a live instant SEPA flow.</p>
        <a class="btn primary" href="https://bank.instasepa.eu/#sepa">Open the demo</a>
      </div>
      <div class="card">
        <h3>Android tap demo</h3>
        <p>The buyer phone transmits a unique IBAN over NFC, as in the diagram above. Install it on any Android phone.</p>
        <a class="btn ghost" href="https://bank.instasepa.eu/app.apk">Download the APK</a>
      </div>
      <div class="card">
        <h3>NFC tap video</h3>
        <p>A short video shows the tap on a real phone. It will appear here soon.</p>
        <div class="vslot">
          <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="22" cy="22" r="20" fill="none" stroke="#DCE3F2" stroke-width="2.5"/><path d="M18 14 L32 22 L18 30 z" fill="#DCE3F2"/></svg>
          <span>Video coming soon</span>
        </div>
      </div>
    </div>
  </div>
</section>

</main>

<footer>
  <div class="wrap foot">
    <a class="wordmark" href="https://instasepa.eu"><span class="w1">insta</span><span class="w2">SEPA</span></a>
    <div class="small">An open proposal for Malta &middot; 2026 &middot; <a href="https://instasepa.eu">instasepa.eu</a> &middot; Maintained by <a href="https://www.linkedin.com/in/alexmtzcom" target="_blank" rel="noopener">Alex</a></div>
  </div>
</footer>

</body>
</html>`;
}

const faviconSvg = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="64" height="64" rx="12" fill="' + LOGO_BLUE + '"/>' +
  '<text x="32" y="50" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="48" fill="' + LOGO_GOLD + '" text-anchor="middle">&#8364;</text>' +
  '</svg>';

const robotsTxt = 'User-agent: *\nAllow: /\n';

// Static outputs, computed once per isolate.
const PAGE = pageHtml();

function ogPngBytes() {
  const bin = atob(OG_PNG_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
const OG_PNG = ogPngBytes();

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = url.pathname;
    if (p === '/favicon.svg') {
      return new Response(faviconSvg, {
        headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' },
      });
    }
    if (p === '/favicon.ico') {
      return Response.redirect(url.origin + '/favicon.svg', 302);
    }
    if (p === '/og.png') {
      return new Response(OG_PNG, {
        headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' },
      });
    }
    if (p === '/robots.txt') {
      return new Response(robotsTxt, {
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' },
      });
    }
    if (p !== '/') {
      return Response.redirect(url.origin + '/', 301);
    }
    return new Response(PAGE, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300',
        ...SECURITY_HEADERS,
      },
    });
  },
};
