# criticalelement.io

Company website for Critical Element, a Grafana Partner and Reseller focused on observability and telemetry.

## Stack

Static HTML and CSS, no build step. Hosted on GitHub Pages from the `main` branch root; `CNAME` points the custom domain at it. Pushing to `main` deploys.

GitHub Pages caches every file for 10 minutes, so a visitor can get new HTML with old CSS. Stylesheet and script links carry a `?v=N` query string; **bump `N` in every HTML file whenever you change `site.css`, `tokens.css` or `health-check.js`** so browsers fetch the new version.

## Layout

- `index.html` — the homepage
- `404.html` — not-found page served by GitHub Pages
- `assets/css/tokens.css` — design tokens, copied verbatim from the [CE design system](https://github.com/cwall75/ce-design-system) (`tokens/tokens.css`). Edit it there, then copy here.
- `assets/css/site.css` — page styles, built on the tokens
- `assets/logo/` — mark, lockup and app icon SVGs plus PNG icons from the design system
- `favicon.ico`, `apple-touch-icon.png` — favicons
- `robots.txt`, `sitemap.xml`
- `signature/index.html` — internal email-signature generator at https://criticalelement.io/signature/ (noindex)
- `assets/email/` — signature logo PNGs and the raw HTML template. Append-only: every signature ever sent points at these URLs.
- `docs/email-signature.md` — Gmail setup instructions for staff
- `assets/js/health-check.js` — the "Request a health check" modal (the site's only JavaScript)
- `docs/health-check-setup.md` — one-time Google Sheet + Apps Script setup for form delivery; `docs/health-check-apps-script.gs` is the script, `docs/mock-endpoint.py` a local stand-in

## Brand rules in use

Dark theme is the default. Oxide is the one accent moment per screen (the primary button). Blue carries eyebrows, links and numerals. Cards and panels are chamfered with `clip-path`; only buttons use a small radius. Fonts: Saira (display), IBM Plex Sans (body), JetBrains Mono (eyebrows and data), loaded from Google Fonts.

## Contact

All contact routes to sales@criticalelement.io. The health check form delivers there too, via Google Sheets + Apps Script (see `docs/health-check-setup.md`).

## Local preview

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
