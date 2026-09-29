# instasepa.eu — landing page

Static landing page advocating the open standards that give SEPA payments a
card-grade user experience: the **EPC QR Code** (EPC069-12) and **SRTP —
SEPA Request-to-Pay**.

Single Cloudflare Worker (`instasepa-landing`), no build step; the whole page
(EU flag + SEPA mark drawn as inline SVG, manifesto, two standard explainers,
footer) is rendered from `src/index.js`.

**Live:** https://instasepa.eu · https://www.instasepa.eu

Related demos on the same zone: [bank.instasepa.eu](https://bank.instasepa.eu)
(pay-by-bank checkout) · [crypto.instasepa.eu](https://crypto.instasepa.eu)
(crypto checkout) · smartiban.instasepa.eu (main site, Cloudflare Pages).

## Deploy

```bash
export CLOUDFLARE_API_TOKEN=...   # Workers edit
npx wrangler deploy               # attaches instasepa.eu + www custom domains
```

## Editing the text without touching the code

`https://instasepa.eu/admin` is a password-protected editor for every prose
block on the page (headings, paragraphs, list items, the hero pills).

* The text in `src/index.js` and `src/paper.js` stays the default and the
  source of truth. The editor saves an override per block in KV (key
  `content`), and the worker splices those into the page it renders.
* Clearing a box puts the original text back.
* If a default changes in code while an override exists, the override is
  **not** applied and the editor shows it as stale with both versions, so no
  wording is lost and nothing silently reverts.
* Password: worker secret `ADMIN_PASSWORD`
  (`wrangler secret put ADMIN_PASSWORD`). Sessions last 12 hours, the cookie is
  signed, and logins lock out after ten wrong tries per IP.
* Saves go to the same Telegram recipients as the visitor analytics.

Tests for the editor live in the session scratchpad, not in the repo.
