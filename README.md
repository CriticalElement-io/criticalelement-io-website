# criticalelement.io

Company website for Critical Element, a Grafana Partner and Reseller focused on observability and telemetry.

## Stack

Static HTML and CSS, no build step. Hosted on GitHub Pages from the `main` branch root; `CNAME` points the custom domain at it. Pushing to `main` deploys.

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

## Brand rules in use

Dark theme is the default. Oxide is the one accent moment per screen (the primary button). Blue carries eyebrows, links and numerals. Cards and panels are chamfered with `clip-path`; only buttons use a small radius. Fonts: Saira (display), IBM Plex Sans (body), JetBrains Mono (eyebrows and data), loaded from Google Fonts.

## Contact

All contact routes to sales@criticalelement.io.

## Local preview

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
