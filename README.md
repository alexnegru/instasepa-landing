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
