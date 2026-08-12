// malta.instasepa.eu — public proposal page addressed to the MFSA and the
// Central Bank of Malta: coordinate the Maltese market onto the EPC QR code
// and SEPA Request-to-Pay so retail payments run on SCT Inst.
//
// Static page, no inline JS. Copy follows ASD-STE100 style (Alex's rule).

import OG_PNG_B64 from './og.js';
import MARK_PNG_B64 from './mark.js';
import { trackVisit } from './analytics.js';

// ---------------------------------------------------------------------------
// SVG building blocks
// ---------------------------------------------------------------------------

// The instaSEPA mark is Alex's original PNG (instaSEPA-logo-dark.png,
// embedded byte for byte via src/mark.js by scripts/gen-assets.mjs).
// Served at /mark.png. Background color of the artwork: #081A54.
const LOGO_NAVY = '#081A54';
const LOGO_GOLD = '#FFC400';

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

const CSS = `
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
    outline: 3px solid var(--blue); outline-offset: 2px;
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
  .btn {
    display: inline-block; padding: 12px 22px; border-radius: 10px;
    font-weight: 700; font-size: 15.5px; text-decoration: none;
  }
  .btn.primary { background: var(--blue); color: #FFFFFF; }
  .btn.ghost { border: 2px solid var(--blue); color: var(--blue); }
  .hero-mark { text-align: center; }
  .hero-mark img { max-width: 100%; height: auto; border-radius: 14px; }
  .hero-mark .cap { font-size: 13px; color: var(--muted); margin-top: 10px; }
  section { padding: 40px 0; border-top: 1px solid var(--line); }
  h2 { font-size: clamp(23px, 3.4vw, 30px); color: var(--blue-deep); margin-bottom: 18px; }
  section p { margin-bottom: 14px; max-width: 46em; }
  section p a { color: var(--blue); }
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
  .steps { margin: 16px 0 16px 22px; max-width: 46em; }
  .steps li { margin-bottom: 10px; }
  .callout {
    background: var(--panel); border-left: 5px solid var(--gold);
    border-radius: 0 12px 12px 0; padding: 18px 22px; margin-top: 20px; max-width: 46em;
  }
  .callout b { color: var(--blue-deep); }
  .sticker-wrap { display: flex; justify-content: center; margin: 26px 0 10px; }
  .sticker-card {
    background: #081A54; border-radius: 24px; padding: 30px 34px 28px;
    max-width: 440px; text-align: center;
    box-shadow: 0 8px 22px rgba(8, 26, 84, 0.30);
  }
  .sticker-card img { max-width: 100%; height: auto; }
  .sticker-card .acc { color: #FFFFFF; font-weight: 800; font-size: 26px; margin-top: 14px; }
  .sticker-card .tag { color: #C9CED8; font-size: 16px; margin-top: 6px; }
  .demo-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; margin-top: 12px; }
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
    .btn::after { content: " (" attr(href) ")"; font-weight: 400; font-size: 12px; }
    section { page-break-inside: avoid; }
  }
`;

// ---------------------------------------------------------------------------
// The page: the discussion paper (Alex's Google Doc, promoted to root 2026-08-12)
// ---------------------------------------------------------------------------

const V2_CSS = `
  .status { font-size: 13.5px; color: var(--muted); margin-top: 18px; max-width: 36em; }
  .after-grid { margin-top: 15px; }
  .about { font-size: 13px; color: var(--muted); max-width: 60em; margin-bottom: 18px; }
`;

function pageHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Malta can run retail payments on SEPA &middot; instaSEPA Malta</title>
<meta name="description" content="A discussion paper for the MFSA and the Central Bank of Malta on coordinated adoption of EPC QR and SEPA Request-to-Pay in Malta, settled by SEPA Instant." />
<meta name="robots" content="index,follow" />
<link rel="canonical" href="https://malta.instasepa.eu/" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="instaSEPA" />
<meta property="og:url" content="https://malta.instasepa.eu/" />
<meta property="og:title" content="Malta can run retail payments on SEPA, and show Europe how" />
<meta property="og:description" content="A discussion paper for the MFSA and the Central Bank of Malta on coordinated adoption of EPC QR and SEPA Request-to-Pay in Malta." />
<meta property="og:image" content="https://malta.instasepa.eu/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="instaSEPA: Malta can run retail payments on SEPA" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebPage","name":"instaSEPA Malta","url":"https://malta.instasepa.eu/","inLanguage":"en","description":"A discussion paper for the MFSA and the Central Bank of Malta on coordinated adoption of EPC QR and SEPA Request-to-Pay in Malta, settled by SEPA Instant."}
</script>
<style>${CSS}${V2_CSS}</style>
</head>
<body>

<header class="top">
  <div class="wrap topbar">
    <a class="wordmark" href="https://instasepa.eu"><span class="w1">insta</span><span class="w2">SEPA</span></a>
    <div class="where"><b>Malta</b> &middot; discussion draft &middot; August 2026</div>
  </div>
</header>

<main>

<div class="wrap hero">
  <div class="hero-grid">
    <div>
      <div class="eyebrow">Coordinated adoption of EPC QR and SEPA Request-to-Pay in Malta</div>
      <h1>Malta can run retail payments on SEPA, and show Europe how.</h1>
      <p class="lead">Every euro-area citizen already has the rails to pay directly from a bank account. The market still needs coordination to use these rails at the till and the checkout. This paper proposes that Malta coordinate its banks, payment institutions and fintechs around standards Europe has already published: EPC QR codes and SEPA Request-to-Pay, settled by SEPA Instant Credit Transfer. Payments in Maltese shops and on Maltese websites can then run on SEPA instead of international card networks.</p>
      <p class="status">Discussion draft for consultation &middot; prepared for the Malta Financial Services Authority and the Central Bank of Malta &middot; contributed by smartIBAN, a Malta-license applicant, as a member of an open working group.</p>
    </div>
    <div class="hero-mark">
      <img src="/mark.png" width="320" height="179" alt="instaSEPA mark" />
      <div class="cap">The proposed mark: the SEPA identity with <i>insta</i> on top of it.</div>
    </div>
  </div>
</div>

<section id="proposal">
  <div class="wrap">
    <h2>The proposal in one paragraph</h2>
    <p>Malta can be the example where every citizen uses their own banking app in a shop: tap via NFC and pay in a matter of seconds, with the same user experience as card payments, while the funds flow only from one SEPA IBAN to another SEPA IBAN at different banks.</p>
    <p>The EU has mandated instant payments and <a href="https://eur-lex.europa.eu/eli/reg/2024/886/oj/eng" target="_blank" rel="noopener">published</a> the standards to initiate them at the point of sale. For our context, the size of the ecosystem in Malta, small but connected, brings the opportunity to execute easily the coordination between the two sides of the market: i) have all the banks &amp; PIs support SEPA-NFC &amp; QR-code, and ii) bring the physical-shop &amp; ecommerce merchants on board too. We propose a measured pilot, coordinated by the MFSA and the Central Bank of Malta and built by the market. The result would be a reference implementation other member states can copy, and a concrete Maltese contribution to the EU's payments strategic-autonomy agenda.</p>
    <p>No new scheme. No new clearing house. No proprietary network. Just adoption of standards that already exist, at island scale, where coordination is achievable.</p>
  </div>
</section>

<section id="whynow">
  <div class="wrap">
    <h2>Why now</h2>
    <p>Three things changed in the last two years:</p>
    <ol class="steps">
      <li><b>Instant settlement is now mandatory infrastructure.</b> Under the Instant Payments Regulation (EU&nbsp;2024/886), euro-area PSPs must receive SEPA Instant Credit Transfers since 9 January 2025 and send them since 9 October 2025, and must offer Verification of Payee since 9 October 2025.</li>
      <li><b>The standards to trigger those payments at a till or checkout are published.</b> The EPC QR code for mobile-initiated SEPA (Instant) Credit Transfers (EPC024-22) and the SEPA Request-to-Pay scheme (rulebook v4.0, in force since 5 October 2025) are public.</li>
      <li><b>The window to lead is open, and it will not stay open long.</b> Wero is live in Belgium, France and Germany, with point-of-sale NFC planned from H2&nbsp;2026. The EuroPA alliance and EPI signed an MoU in February 2026 to build pan-European interoperability for about 130 million users. Malta cannot out-scale those schemes. Malta can be first to ship an open, non-proprietary, standards-only implementation that other member states can replicate.</li>
    </ol>
  </div>
</section>

<section id="standards">
  <div class="wrap">
    <h2>Built on published standards</h2>
    <p>An open payment experience built only on published European Payments Council work:</p>
    <div class="std">
      <div class="card"><h3>SCT Inst <span class="tag">&middot; settlement</span></h3><p>The instant SEPA credit transfer. Funds move IBAN to IBAN in seconds, with a scheme maximum of 10 seconds. No card authorisation network.</p></div>
      <div class="card"><h3>EPC QR code <span class="tag">&middot; EPC024-22</span></h3><p>Encodes beneficiary, IBAN and amount at the till or checkout. The customer's own bank app scans it and pre-fills the transfer. EPC069-12 covers invoice and bill payments.</p></div>
      <div class="card"><h3>SEPA Request-to-Pay <span class="tag">&middot; EPC014-20 v4.0</span></h3><p>The target state for request messaging. The payee sends a structured request, and the payer approves it in their own bank app.</p></div>
      <div class="card"><h3>Verification of Payee <span class="tag">&middot; mandatory since Oct 2025</span></h3><p>Confirms that the payee name matches the IBAN before the payer approves. This check is the primary fraud control.</p></div>
      <div class="card"><h3>Proximity <span class="tag">&middot; NFC tap</span></h3><p>The buyer's banking app emits a unique IBAN over NFC at the till, through host-card emulation. The QR code is the fallback.</p></div>
      <div class="card"><h3>Virtual IBANs <span class="tag">&middot; acquiring side</span></h3><p>Merchant collection IBANs with a virtual-IBAN layer, in house or via a PSP, for per-terminal and per-checkout reconciliation.</p></div>
    </div>
    <p>The design does not require a new scheme rulebook, a new clearing house, a proprietary wallet, exclusive rights for any single fintech, or coordinated pricing.</p>
  </div>
</section>

<section id="gains">
  <div class="wrap">
    <h2>Who gains what</h2>
    <div class="cards">
      <div class="card"><h3>Citizens</h3><p>Pay from their own bank account, in the banking app they already have. No new wallet, no card number, no foreign network in the critical path. Approval uses their bank's own strong customer authentication, and the payee is verified before they approve.</p></div>
      <div class="card"><h3>Merchants</h3><p>Instant, final settlement to a SEPA IBAN. There is no batch clearing. One acceptance brand (instaSEPA or just SEPA) across physical retail and ecommerce.</p></div>
      <div class="card"><h3>Banks and PSPs</h3><p>The customer relationship and SCA stay in the IBAN issuer's own app. Each acquirer and PSP sets its own pricing. A new opportunity to monetise SEPA transactions at scale: a revenue-share scheme (SEPA Interchange), where the acquirer of the SEPA transaction shares the revenue with the payer's IBAN issuer.</p></div>
      <div class="card"><h3>Malta</h3><p>Malta becomes the reference implementation for SEPA at the point of sale. The standards are European, so the result transfers to any other member state without change. A jurisdiction that proves this attracts payment companies that want to build on it. The EU now looks for a leader on payment sovereignty. A small country with a coordinated market can take this role.</p></div>
    </div>
  </div>
</section>

<section id="money">
  <div class="wrap">
    <h2>How the funds flow</h2>
    <p>The customer pays only the shop price. The merchant receives an instant credit to a SEPA IBAN. The diagram shows an illustrative commercial example.</p>
    <div class="diagram" tabindex="0" role="region" aria-label="Funds flow diagram">${fundsFlowSvg}</div>
    <p>The fee level and the splits in the diagram are illustrations only. Each acquirer and PSP sets its own merchant pricing, bilaterally and competitively. There is no scheme-set interchange and no coordinated fee, and the working group's remit would explicitly exclude pricing, to stay clear of Article&nbsp;101 TFEU and Maltese competition rules.</p>
  </div>
</section>

<section id="tap">
  <div class="wrap">
    <h2>What happens on a tap for SEPA NFC pay</h2>
    <p>The diagram shows the target flow, with SEPA Request-to-Pay end to end.</p>
    <div class="diagram" tabindex="0" role="region" aria-label="Message sequence diagram">${seqSvg()}</div>
    <ol class="steps">
      <li>The buyer holds the phone against the till. The banking app transmits a unique IBAN over NFC.</li>
      <li>The till sends a Request-to-Pay to that unique IBAN. The request contains the amount and the merchant name.</li>
      <li>The issuing bank maps the unique IBAN to the buyer's real account and shows the request in the banking app.</li>
      <li>The buyer approves with strong customer authentication (SCA).</li>
      <li>The issuing bank sends an SCT Inst transfer to the acquirer. The acquirer credits the merchant and confirms to the till.</li>
    </ol>
  </div>
</section>

<section id="mark">
  <div class="wrap">
    <h2>One mark on every shop door</h2>
    <p>Customers must see one sign and know that they can pay, the same in-store and online. The instaSEPA mark is proposed as a shared acceptance brand, governed by the working group on open, non-discriminatory terms. It is available to every licensed player and controlled by no single company.</p>
    <div class="sticker-wrap">
      <div class="sticker-card">
        <img src="/mark.png" width="340" height="190" alt="instaSEPA mark" />
        <div class="acc">Accepted here</div>
        <div class="tag">Tap &amp; Pay with your banking app.</div>
      </div>
    </div>
  </div>
</section>

<section id="integrity">
  <div class="wrap">
    <h2>Consumer protection, competition and integrity</h2>
    <p>A national payments capability must be safe, lawful and fair before it is fast.</p>
    <ul class="steps">
      <li><b>Irrevocability and disputes.</b> SEPA Instant payments are final; there is no chargeback. Protection therefore comes before authorisation: Verification of Payee confirms the payee first, and PSD2 liability and refund rules apply to unauthorised or incorrectly executed transactions. Merchant refunds run as ordinary credit transfers. Disputes have a clear route to the Office of the Arbiter for Financial Services.</li>
      <li><b>Competition law.</b> The coordination asked of the MFSA and the CBM is technical interoperability and standards adoption only, never price. There is no imposed interchange pricing and no coordinated fee split. We introduce a SEPA Interchange scheme as a structure and not at pricing level.</li>
      <li><b>Data protection.</b> The design applies GDPR data minimisation and purpose limitation. Strong customer authentication and credentials remain with the customer's own bank. No third party holds them.</li>
    </ul>
  </div>
</section>

<section id="propose">
  <div class="wrap">
    <h2>What we propose to the MFSA and the Central Bank of Malta</h2>
    <div class="callout"><b>We ask the MFSA and the CBM</b> to put this topic on the programme of the <i>FinTech 2030: Shaping the Next Era of Financial Services</i> event on 22 September 2026, or to co-host a one-day technical roundtable with Malta's core domestic banks and the licensed PI and EMI community. The goal of that day is a term sheet for a feasibility study and a measured pilot in the MFSA FinTech Regulatory Sandbox.</div>
    <p class="after-grid">No endorsement of any single vendor is implied or sought, and participation is open to every licensed player on equal, non-discriminatory terms.</p>
    <p>A proposed path:</p>
    <ol class="steps">
      <li><b>Working group and term sheet.</b> The MFSA and the CBM convene; the market participates. Scope, governance and success metrics.</li>
      <li><b>Technical specification,</b> industry-led: EPC QR (EPC024-22) initiation, Verification of Payee, SCT Inst settlement, the SRTP migration path, and the consumer-rights note.</li>
      <li><b>Issuer app support</b> in the banks: QR scan, request receipt with SCA approval, and app-to-app return.</li>
      <li><b>Acquirer and PSP acceptance</b> at till and checkout, settled to SEPA IBANs, with virtual-IBAN reconciliation for clean per-terminal reporting.</li>
      <li><b>A measured pilot</b> in the sandbox with selected retail and ecommerce merchants, measured on time-to-pay, authorisation success, consumer experience, and merchant cost versus cards.</li>
      <li><b>Publish the playbook:</b> an open reference implementation other member states can copy.</li>
    </ol>
    <p><b>If only some banks join.</b> A minimum viable coalition of two core domestic banks plus the PI and EMI community is enough for a meaningful pilot. Customers of non-adopting banks can still pay with a standard SEPA Instant transfer to the same merchant IBAN.</p>
  </div>
</section>

<section id="wins">
  <div class="wrap">
    <h2>What Malta wins</h2>
    <ul class="steps">
      <li>A working, island-scale demonstration that a member state can deliver open, sovereign account-to-account retail payments in production.</li>
      <li>A concrete contribution to the EU's strategic-autonomy agenda on payments, aligned with the Eurosystem's and the Commission's retail payments strategies.</li>
      <li>A magnet for high-quality payment institutions and infrastructure builders, in line with the MFSA's FinTech Strategy objective: Malta as an international FinTech hub.</li>
      <li>A story larger than national interest: Malta as the open reference node for SEPA retail payments, the interoperable complement to Wero and EuroPA, and the model other small member states can adopt.</li>
    </ul>
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
    <p class="after-grid">A working reference experience exists and can be demonstrated live. The proposal is that Malta owns the national rollout under open standards.</p>
  </div>
</section>

<section id="closing">
  <div class="wrap">
    <h2>Closing</h2>
    <p>Cards solved the user experience. SEPA already solved the money movement. Malta can join the two: openly, and first among the small states.</p>
    <p>We ask the MFSA and the Central Bank of Malta to open a structured dialogue with Malta's banking and payments community on coordinated, open-standards adoption for retail and ecommerce payments, beginning with a single technical roundtable to scope a feasibility study and a sandbox pilot.</p>
  </div>
</section>

</main>

<footer>
  <div class="wrap">
    <p class="about">About this page: this is a discussion draft contributed by smartIBAN, a Malta-license applicant. It does not represent the position of the MFSA or the Central Bank of Malta. The instaSEPA mark is proposed as a shared, openly governed acceptance brand, not a single company's product.</p>
    <div class="foot">
      <a class="wordmark" href="https://instasepa.eu"><span class="w1">insta</span><span class="w2">SEPA</span></a>
      <div class="small">Discussion draft &middot; 2026 &middot; <a href="https://instasepa.eu">instasepa.eu</a> &middot; Maintained by <a href="https://www.linkedin.com/in/alexmtzcom" target="_blank" rel="noopener">Alexandru Negru</a></div>
    </div>
  </div>
</footer>

</body>
</html>`;
}

const faviconSvg = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="64" height="64" rx="12" fill="' + LOGO_NAVY + '"/>' +
  '<text x="32" y="50" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="48" fill="' + LOGO_GOLD + '" text-anchor="middle">&#8364;</text>' +
  '</svg>';

const robotsTxt = 'User-agent: *\nAllow: /\n';

// Static outputs, computed once per isolate.
const PAGE = pageHtml();

function b64Bytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
const OG_PNG = b64Bytes(OG_PNG_B64);
const MARK_PNG = b64Bytes(MARK_PNG_B64);

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'",
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname;
    // Visitor analytics: the HTML page only, never assets or redirects.
    if (p === '/' && ctx && env && env.STATE) {
      ctx.waitUntil(trackVisit(request, env, p));
    }
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
    if (p === '/mark.png') {
      return new Response(MARK_PNG, {
        headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' },
      });
    }
    if (p === '/robots.txt') {
      return new Response(robotsTxt, {
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' },
      });
    }
    if (p === '/v2' || p === '/v2/') {
      return new Response(null, {
        status: 301,
        headers: { location: url.origin + '/', 'cache-control': 'public, max-age=300' },
      });
    }
    if (p !== '/') {
      return new Response(null, {
        status: 302,
        headers: { location: url.origin + '/', 'cache-control': 'no-store' },
      });
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
