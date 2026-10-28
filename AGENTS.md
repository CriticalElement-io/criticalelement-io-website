# Agent guide: criticalelement.io

Read this before changing anything. It applies to every AI coding agent (Claude Code, Codex, Cursor, others) and to people.

## What this is

The company website for Critical Element, a Grafana Partner and Reseller focused on observability and telemetry. Plain HTML, CSS and vanilla JavaScript. No framework, no package manager, no build step. GitHub Pages serves the `main` branch root at https://criticalelement.io, so **merging to `main` is deploying**.

## Workflow (non-negotiable)

1. **Branch from `main`.** Never commit to `main` directly. The `main-protection` ruleset rejects direct pushes for everyone except the `repogods` team.
2. **Run the site locally and test before you push.** `python3 -m http.server 8000` from the repo root. Check desktop (1280px) and phone (375px) at minimum. Open the browser console; there should be no errors.
3. **Open a pull request.** Describe what changed, why, and what you tested. A human merges.
4. **After merge, verify the live site.** GitHub Pages publishes in about a minute. Hard-reload; Pages caches files for 10 minutes.

If you edited CSS or JavaScript, run `python3 tools/chrome.py --bump` before committing so browsers fetch the new files (see "Shared chrome" below). If you only edited page content, no bump is needed.

## Repository map

| Path | What it is |
|---|---|
| `index.html` | Homepage. Sections: hero, technology strip, services, Grafana partner, open standards, how we work, about, contact. Carries the Organization JSON-LD (name, URL, logo, email, postal address) |
| `ai-observability/index.html` | AI Observability services page |
| `careers/index.html`, `careers/<role>/index.html` | Careers index and one page per open role, each with Google Jobs JSON-LD |
| `signature/index.html` | Internal email-signature generator (noindex) |
| `404.html`, `robots.txt`, `sitemap.xml`, `CNAME` | Pages plumbing. Add new public pages to the sitemap |
| `llms.txt` | Plain-text summary for AI answer engines, linked from the homepage. Repeats site copy, contact details and open roles; keep it in step when those change |
| `_config.yml` | Keeps `docs/`, `tools/`, `README.md`, `AGENTS.md` and `CLAUDE.md` off the live site. Add any new repo-only file or folder to its `exclude` list |
| `assets/css/tokens.css` | Design tokens, **copied verbatim** from the design system repo. Edit there, then copy here |
| `assets/css/site.css` | All page styles, written against the `--ce-*` tokens |
| `assets/js/nav.js` | Navigation: dropdowns, phone panel, keyboard, current-page marking |
| `assets/js/health-check.js` | "Request a health check" modal and its POST to Apps Script |
| `assets/js/apply.js` | Job application modal, including PDF resume upload |
| `assets/logo/`, `assets/email/`, `favicon.ico`, `apple-touch-icon.png` | Brand assets. `assets/email/` is **append-only**: every email signature ever sent points at those URLs |
| `tools/chrome.py`, `tools/partials/` | The shared-chrome stamping tool (below) |
| `docs/` | Setup guides for the form backends, Apps Script sources, staff instructions, and `handoff.md` with project history and decisions |

## Shared chrome: nav, footer, health check modal

The header, footer and health check modal are identical on every page. Their only source of truth is `tools/partials/`. Each page contains marker pairs like:

```html
<!-- nav:start -->
...generated, do not edit by hand...
<!-- nav:end -->
```

- **Edit the partial, then run `python3 tools/chrome.py`.** It rewrites the block on every page.
- **Never edit inside the markers by hand.** Your change will be overwritten and `--check` will fail.
- `python3 tools/chrome.py --bump` increments `tools/assets-version.txt` and rewrites every `?v=N` on CSS and JS links. Run it after any CSS or JS change.
- `python3 tools/chrome.py --check` exits non-zero if any page is out of sync. Run it before opening a PR.

A new page needs the three marker pairs (drop the health-check pair if the page should not carry the modal), then run the tool.

## Design rules

The design system lives at https://github.com/CriticalElement-io/ce-design-system (private). Its README is the authority. The rules that come up most:

- **Dark theme is the default** for the website. Don't add a light mode.
- **Oxide (`--ce-accent`) leads, once per screen.** Usually the primary button. Don't add a second Oxide element to a view that already has one.
- **Blue (`--ce-secondary`) supports:** eyebrows, links, section numerals, dropdown rules. Never the primary button.
- **Chamfer, don't round.** Cards and panels use the `.chamfer` clip-path. Only small controls (buttons, inputs) get a 4–6px radius.
- **Status colors are separate from brand accents.** Oxide is never an alert color.
- **Fonts:** Saira (display), IBM Plex Sans (body), JetBrains Mono (eyebrows, data). Loaded from Google Fonts.
- Use the tokens. Don't introduce hex values in `site.css`.

## Content rules

- **Grafana product names must be exact** and current. Grafana Labs reviews this site for co-marketing. Use: Grafana Cloud, Grafana Enterprise, Grafana LGTM Stack (Loki, Grafana, Tempo, Mimir), Agent Observability, AI Observability, Adaptive Telemetry, Grafana Assistant, Investigations, Grafana Cloud k6, Grafana Alloy. **Never** "Grafana Enterprise Metrics/Logs/Traces" (deprecated 2025).
- **EliteOps** is a sister company. It is never named or linked on the public site.
- **Contact:** everything sales-related routes to `sales@criticalelement.io`. Job applications route to `hr@criticalelement.io`. Don't invent other addresses.
- **The free health check** is for traditional Grafana stack work. **The AI readiness assessment** is a paid engagement. The AI page asks for an assessment, not a health check; the nav button is the health check everywhere.
- **Don't invent proof points.** No customer names, metrics or partner tiers unless someone from the company supplies them. The one cited figure ("Grafana customers report 35–50% lower costs") is Grafana's own claim from company marketing material.
- Copy is in US English with sentence-case headings. Use en dashes in ranges ($135,000–$155,000). Em dashes appear only in role titles that already carry them.

## Forms

Both forms POST JSON as `text/plain` (avoids a CORS preflight) to Google Apps Script web apps that append a Sheet row and send email. Endpoints live in `data-endpoint` attributes on the forms. The script sources are in `docs/*.gs`; setup is in `docs/health-check-setup.md` and `docs/careers-setup.md`.

- Don't change the field names; the scripts depend on them.
- **The backend code is `docs/*.gs`.** The `assets/js/*.js` files with similar names are the browser side. A `.gs` change only goes live after someone pastes it into the bound Apps Script editor and publishes it with **Deploy → Manage deployments → pencil → New version**. **New deployment** creates a new URL and breaks the form until `data-endpoint` is updated (health check: `tools/partials/health-check.html`; careers: each role page).
- **Keep the safeguards from the 2026-10-23 security review:** `sheetSafe()` on every user-supplied value written to a Sheet, the `%PDF-` signature check on resumes (browser and script), and the site-wide hourly caps that answer `busy`.
- Don't add third-party form services, trackers or analytics without a human decision.
- For local testing, `python3 docs/mock-endpoint.py` stands in for the scripts.

## Careers

- One folder per open role under `careers/`, each with `JobPosting` JSON-LD. Google indexes these.
- **When a role closes, remove its page the same day** and update `careers/index.html`, `sitemap.xml` and, if no roles remain, the Careers line in `llms.txt`. Google penalizes expired postings.

## Things not to do

- No frameworks, bundlers, npm, or CSS preprocessors. The no-build-step property is deliberate.
- No new top-level nav items without a human decision. The nav is a product decision, not a code decision.
- No analytics, cookies, or third-party scripts. The site currently sets none and has no privacy policy.
- Don't rename or move anything under `assets/email/` or `assets/logo/`.
- Don't commit secrets. There are none in this repo and none are needed; the Apps Script URLs are public by design.
- Don't change the `main-protection` ruleset without talking to the team: a blocked merge is a blocked deploy. In particular, never turn on **Restrict updates**, **Require approval for unattributed changes** (it flags AI co-authored commits), or a required approval count above 0. Don't add AI apps or bots to its bypass list. `docs/handoff.md` explains why.

## Definition of done for a PR

- Branch, local test on desktop and phone, no console errors.
- `python3 tools/chrome.py --check` passes.
- Version bumped if CSS or JS changed.
- Sitemap updated if a public page was added or removed.
- `llms.txt` and the homepage JSON-LD updated if the facts they repeat changed.
- PR description says what changed, why, and what was tested.
