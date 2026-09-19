// The instaSEPA paper: the malta.instasepa.eu discussion paper, addressed to
// Europe. Rendered on the root page between the hero and the two standard
// cards. Styles are scoped under .paper so they do not touch the root page.
//
// Static markup, one small inline script for the video overlay (in index.js).
// Copy follows ASD-STE100 style (Alex's rule).

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
// Styles, scoped under .paper
// ---------------------------------------------------------------------------

export const PAPER_CSS = `
  .paper {
    --blue: #10298E; --blue-deep: #0A1E6B; --pmuted: #58627A; --panel: #F5F7FC; --line: #DCE3F2;
    background: #FFFFFF; color: #1C2233; line-height: 1.65;
    border-bottom: 1px solid var(--line);
  }
  .paper * { box-sizing: border-box; margin: 0; padding: 0; }
  .paper .wrap { max-width: 980px; margin: 0 auto; padding: 0 22px; }
  .paper a:focus-visible, .paper .btn:focus-visible, .paper .diagram:focus-visible {
    outline: 3px solid var(--blue); outline-offset: 2px;
  }
  .paper .phero { padding: 56px 22px 44px; }
  .paper .phero-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 44px; align-items: center; }
  .paper .eyebrow {
    font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--blue); font-weight: 700; margin-bottom: 14px;
  }
  .paper .headline { font-size: clamp(30px, 5vw, 44px); line-height: 1.15; color: var(--blue-deep); margin-bottom: 18px; font-weight: 700; }
  .paper .phero p.lead { font-size: 18px; color: var(--pmuted); max-width: 34em; }
  .paper .btn {
    display: inline-block; padding: 12px 22px; border-radius: 10px;
    font-weight: 700; font-size: 15.5px; text-decoration: none;
  }
  .paper .btn.primary { background: var(--blue); color: #FFFFFF; }
  .paper .btn.ghost { border: 2px solid var(--blue); color: var(--blue); }
  .paper .phero-mark { text-align: center; }
  .paper .phero-mark img { max-width: 100%; height: auto; border-radius: 14px; }
  .paper .phero-mark .cap { font-size: 13px; color: var(--pmuted); margin-top: 10px; }
  .paper section { padding: 40px 0; border-top: 1px solid var(--line); }
  .paper h2 { font-size: clamp(23px, 3.4vw, 30px); color: var(--blue-deep); margin-bottom: 18px; }
  .paper section p { margin-bottom: 14px; max-width: 46em; }
  .paper section p a { color: var(--blue); }
  .paper section p:last-child { margin-bottom: 0; }
  .paper .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 10px; }
  .paper .card {
    background: var(--panel); border: 1px solid var(--line); border-radius: 14px;
    padding: 20px 22px;
  }
  .paper .card h3 { font-size: 17px; color: var(--blue); margin-bottom: 8px; }
  .paper .card p { font-size: 15px; margin-bottom: 0; }
  .paper .std { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 18px 0; }
  .paper .std .card h3 { color: var(--blue-deep); }
  .paper .std .card .tag { font-size: 12px; color: var(--pmuted); font-weight: 400; }
  .paper .diagram {
    overflow-x: auto; margin: 22px 0 8px;
    border: 1px solid var(--line); border-radius: 14px; background: #FFFFFF;
    padding: 14px;
  }
  .paper .diagram svg { display: block; min-width: 680px; width: 100%; height: auto; }
  .paper .steps { margin: 16px 0 16px 22px; max-width: 46em; }
  .paper .steps li { margin-bottom: 10px; }
  .paper .sticker-wrap { display: flex; justify-content: center; margin: 26px 0 10px; }
  .paper .sticker-card {
    background: #081A54; border-radius: 24px; padding: 30px 34px 28px;
    max-width: 440px; text-align: center;
    box-shadow: 0 8px 22px rgba(8, 26, 84, 0.30);
  }
  .paper .sticker-card img { max-width: 100%; height: auto; }
  .paper .sticker-card .acc { color: #FFFFFF; font-weight: 800; font-size: 26px; margin-top: 14px; }
  .paper .sticker-card .tag { color: #C9CED8; font-size: 16px; margin-top: 6px; }
  .paper .demo-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; margin-top: 12px; }
  .paper .demo-cards .card a.btn { margin-top: 14px; }
  .paper .after-grid { margin-top: 15px; }
  .paper .vthumb {
    display: block; position: relative; width: 100%; margin-top: 14px;
    aspect-ratio: 16 / 9; border: 1px solid var(--line); border-radius: 10px;
    overflow: hidden; cursor: pointer; padding: 0; background: #081A54;
  }
  .paper .vthumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .paper .vplay {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    background: rgba(8, 26, 84, 0.25);
  }
  .paper .vthumb:hover .vplay, .paper .vthumb:focus-visible .vplay { background: rgba(8, 26, 84, 0.45); }
  .voverlay {
    position: fixed; inset: 0; z-index: 50; background: rgba(8, 26, 84, 0.88);
    display: flex; align-items: center; justify-content: center; padding: 4vmin;
  }
  .voverlay[hidden] { display: none; }
  .vbox { position: relative; width: min(1100px, 96vw); }
  .vframe { aspect-ratio: 16 / 9; background: #000; border-radius: 12px; overflow: hidden; }
  .vframe iframe { width: 100%; height: 100%; border: 0; display: block; }
  .vclose {
    position: absolute; top: -46px; right: 0; width: 38px; height: 38px;
    border: 0; border-radius: 50%; background: #FFFFFF; color: #081A54;
    font-size: 22px; font-weight: 700; line-height: 1; cursor: pointer;
  }
  @media (max-width: 760px) {
    .paper .phero { padding: 26px 22px 34px; }
    .paper .phero-grid { grid-template-columns: 1fr; gap: 26px; }
    .paper .cards, .paper .std, .paper .demo-cards { grid-template-columns: 1fr; }
  }
  @media print {
    .paper .btn::after { content: " (" attr(href) ")"; font-weight: 400; font-size: 12px; }
    .paper section { page-break-inside: avoid; }
  }
`;

// ---------------------------------------------------------------------------
// The paper (text from the Malta discussion paper, edited for Europe 2026-09-19)
// ---------------------------------------------------------------------------

export function paperHtml() {
  return `<div class="paper">

<div class="wrap phero">
  <div class="phero-grid">
    <div>
      <div class="eyebrow">Coordinated adoption of EPC QR and SEPA Request-to-Pay in Europe</div>
      <h2 class="headline">Europe can run POS retail payments on SEPA</h2>
      <p class="lead">Every euro-area citizen already has the rails to pay directly from a bank account. The market still needs coordination to use these rails at the till and the checkout. This paper proposes that Europe coordinate its banks, payment institutions and fintechs around standards Europe has already published: EPC QR codes and SEPA Request-to-Pay, settled by SEPA Instant Credit Transfer. Payments in European shops and on European websites can then run on SEPA instead of international card networks.</p>
    </div>
    <div class="phero-mark">
      <img src="/mark.png" width="320" height="179" alt="instaSEPA mark" />
      <div class="cap">The proposed mark: the SEPA identity with <i>insta</i> on top of it.</div>
    </div>
  </div>
</div>

<section id="proposal">
  <div class="wrap">
    <h2>Proposal summary</h2>
    <p>Every citizen uses their own banking app in a shop: tap via NFC and pay in a matter of seconds, with the same user experience as card payments, while the funds originate from one SEPA IBAN and are credited to another SEPA IBAN maintained at a different bank.</p>
    <p>The EU has mandated instant payments and published the standards to initiate them at the point of sale. The opportunity to execute easily the coordination between the two sides of the market: i) have all the banks &amp; PIs support SEPA-NFC &amp; QR-code, and ii) bring the physical-shop &amp; ecommerce merchants on board too. We propose a measured pilot, built by the market.</p>
    <p>No new scheme. No new clearing house. No proprietary network. Just adoption of standards that already exist.</p>
  </div>
</section>

<section id="whynow">
  <div class="wrap">
    <h2>Why now</h2>
    <p>Three things changed in the last two years:</p>
    <ol class="steps">
      <li><b>Instant settlement is now mandatory infrastructure.</b> Under the Instant Payments Regulation, euro-area PSPs must receive SEPA Instant Credit Transfers and must offer Verification of Payee since 9 October 2025.</li>
      <li><b>The standards to trigger those payments at a till or checkout are published.</b> The EPC QR code for mobile-initiated SEPA (Instant) Credit Transfers and the SEPA Request-to-Pay scheme are public.</li>
      <li><b>The window to lead is open, and it will not stay open long.</b> Wero is live in Belgium, France and Germany, with point-of-sale NFC planned from H2&nbsp;2026. The EuroPA alliance and EPI signed an MoU in February 2026 to build pan-European interoperability for about 130 million users. Europe can be first to ship an open, non-proprietary, standards-only implementation that other member states can replicate.</li>
    </ol>
  </div>
</section>

<section id="standards">
  <div class="wrap">
    <h2>Built on published standards</h2>
    <p>An open payment experience built only on published European Payments Council work:</p>
    <div class="std">
      <div class="card"><h3>SCT Inst <span class="tag">&middot; settlement</span></h3><p>The instant SEPA credit transfer. Funds move IBAN to IBAN in seconds, with a scheme maximum of 10 seconds. No card authorisation network.</p></div>
      <div class="card"><h3>EPC QR code <span class="tag">&middot; EPC024-22</span></h3><p>Encodes beneficiary, IBAN and amount at the till or checkout. The customer's own bank app scans it and pre-fills the transfer.</p></div>
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
      <div class="card"><h3>Europe</h3><p>European PSPs and banks can have now the 4th silver bullet instead of just 3: digital Euro, Euro stablecoins, Wero. instaSEPA (via SRTP) is the 4th silver bullet that allows the open market to adopt the solutions that have the best User Experience for them.</p></div>
    </div>
  </div>
</section>

<section id="money">
  <div class="wrap">
    <h2>How the funds flow</h2>
    <p>The customer pays only the shop price. The merchant receives an instant credit to a SEPA IBAN. The diagram shows an illustrative commercial example.</p>
    <div class="diagram" tabindex="0" role="region" aria-label="Funds flow diagram">${fundsFlowSvg}</div>
    <p>The fee level and the splits in the diagram are illustrative only. Each acquirer and PSP sets its own merchant pricing, bilaterally and competitively. There is no scheme-set interchange and no coordinated fee, and the working group would explicitly exclude pricing, to stay clear of European competition rules.</p>
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
      <li><b>Irrevocability and disputes.</b> SEPA Instant payments are final; there is no chargeback. Protection therefore comes before authorisation: Verification of Payee confirms the payee first, and PSD2 liability and refund rules apply to unauthorised or incorrectly executed transactions. Merchant refunds run as ordinary credit transfers.</li>
      <li><b>Competition law.</b> The coordination asked is technical interoperability and standards adoption only, never price. There is no imposed interchange pricing and no coordinated fee split. We introduce a SEPA Interchange scheme as a structure and not at pricing level.</li>
      <li><b>Data protection.</b> The design applies GDPR data minimisation and purpose limitation. Strong customer authentication and credentials remain with the customer's own bank. No third party holds them.</li>
    </ul>
  </div>
</section>

<section id="propose">
  <div class="wrap">
    <h2>What we propose to all European fintechs and banks: join this initiative and be part of the infrastructure of the most popular payment method that Europe can have: SEPA</h2>
    <p>No endorsement of any single vendor is implied or sought, and participation is open to every licensed player on equal, non-discriminatory terms.</p>
    <p>A proposed path:</p>
    <ol class="steps">
      <li><b>Working group and term sheet.</b> The market participates. Scope, governance and success metrics.</li>
      <li><b>Technical specification,</b> industry-led: EPC QR initiation, Verification of Payee, SCT Inst settlement, the SRTP migration path, and the consumer-rights note.</li>
      <li><b>Issuer app support</b> in the banks: QR scan, request receipt with SCA approval, and app-to-app return.</li>
      <li><b>Acquirer and PSP acceptance</b> at till and checkout, settled to SEPA IBANs, with virtual-IBAN reconciliation for clean per-terminal reporting.</li>
      <li><b>A measured pilot</b> in the sandbox with selected retail and ecommerce merchants, measured on time-to-pay, authorisation success, consumer experience, and merchant cost versus cards.</li>
      <li><b>Publish the playbook:</b> an open reference implementation other member states can copy.</li>
    </ol>
    <p><b>If only some banks join.</b> A minimum viable coalition of two core domestic banks plus the PI and EMI community is enough for a meaningful pilot. Customers of non-adopting banks can still pay with a standard SEPA Instant transfer to the same merchant IBAN.</p>
  </div>
</section>

<section id="demo">
  <div class="wrap">
    <h2>See it work today</h2>
    <div class="demo-cards">
      <div class="card">
        <h3>Live checkout demo</h3>
        <p>A web checkout with a real EPC QR code simulation and a fake SRTP simulation using bunq NL IBANs for payers.</p>
        <a class="btn primary" href="https://bank.instasepa.eu/#sepa">Open the demo</a>
      </div>
      <div class="card">
        <h3>Android tap demo</h3>
        <p>An Android APK that helps simulate the SRTP POC. The supermarket can accept an IBAN via NFC to send the SRTP to.</p>
        <a class="btn ghost" href="https://bank.instasepa.eu/app.apk">Download the APK</a>
      </div>
      <div class="card">
        <h3>NFC tap video</h3>
        <p>A <a href="https://www.youtube.com/watch?v=EpbdYG3nliY" target="_blank" rel="noopener">short video</a> shows a simulated SRTP POC where an NL buyer pays for bananas via NFC in a supermarket.</p>
        <button class="vthumb" id="nfc-video-open" aria-label="Play the NFC tap video">
          <img src="https://i.ytimg.com/vi/EpbdYG3nliY/maxresdefault.jpg" alt="" width="1280" height="720" loading="lazy" />
          <span class="vplay"><svg width="58" height="58" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="29" cy="29" r="27" fill="#FFFFFF"/><path d="M23 18 L42 29 L23 40 z" fill="#081A54"/></svg></span>
        </button>
      </div>
    </div>
    <p class="after-grid">A working reference experience exists and can be demonstrated live. The proposal is that Europe owns the national rollout under open standards.</p>
  </div>
</section>

<section id="closing">
  <div class="wrap">
    <h2>Closing</h2>
    <p>Cards solved the user experience. SEPA already solved the money movement.</p>
  </div>
</section>

</div>`;
}

// Video overlay (the NFC tap video opens on the page, not on YouTube).
export const VIDEO_OVERLAY_HTML = `<div class="voverlay" id="nfc-video-overlay" hidden>
  <div class="vbox">
    <button class="vclose" id="nfc-video-close" aria-label="Close the video">&#215;</button>
    <div class="vframe" id="nfc-video-frame"></div>
  </div>
</div>`;

export const VIDEO_OVERLAY_JS = `(function () {
  var overlay = document.getElementById('nfc-video-overlay');
  var frame = document.getElementById('nfc-video-frame');
  if (!overlay || !frame) return;
  var SRC = 'https://www.youtube-nocookie.com/embed/EpbdYG3nliY?autoplay=1&vq=hd1080&rel=0&modestbranding=1';
  function openVideo() {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    var f = document.createElement('iframe');
    f.src = SRC;
    f.title = 'NFC tap video';
    f.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
    f.allowFullscreen = true;
    frame.appendChild(f);
    document.getElementById('nfc-video-close').focus();
  }
  function closeVideo() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    frame.innerHTML = '';
    document.getElementById('nfc-video-open').focus();
  }
  document.getElementById('nfc-video-open').addEventListener('click', openVideo);
  document.getElementById('nfc-video-close').addEventListener('click', closeVideo);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeVideo(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) closeVideo();
  });
})();`;

export const FAVICON_SVG = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="64" height="64" rx="12" fill="#081A54"/>' +
  '<text x="32" y="50" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="48" fill="#FFC400" text-anchor="middle">&#8364;</text>' +
  '</svg>';
