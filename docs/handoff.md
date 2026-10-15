# Handoff: criticalelement.io

Written 2026-10-15 when website management moved from Cory's personal tooling to the Critical Element enterprise account. Everything an agent or a new maintainer needs that isn't obvious from the code.

## People

| Who | Role | GitHub |
|---|---|---|
| Cory Wallace | Runs the website. Final say on structure and copy. | `cwall75` (personal), `critical-element-cory` (company) |
| Tim Jaroch | Co-founder and CEO. Supplies one-pagers and briefs, reviews copy, requests changes. | `jarocht` |
| Grafana Labs Channel Sales | Reviews the site for brand and terminology before co-marketing use. | — |

Repo admins as of this writing: `cwall75`, `critical-element-cory`, `jarocht`, `FreakyFastDeli`.

## Accounts and ownership

Things that live outside this repo and who owns them. Confirm each when migrating.

| Thing | Where | Notes |
|---|---|---|
| Repo | `CriticalElement-io/criticalelement-io-website` | Public. Required: GitHub Pages on the Free plan only publishes public repos. Private needs the Team plan. |
| Hosting | GitHub Pages, `main` branch root | Custom domain via `CNAME`, HTTPS enforced. DNS A records point at GitHub's Pages IPs; `www` is a CNAME. |
| Domain | criticalelement.io | Registrar/DNS not managed from this repo. |
| Design system | `CriticalElement-io/ce-design-system` (private) | Source of `assets/css/tokens.css` and all logo files. Moved from `cwall75/ce-design-system` in Sept 2026. |
| Health check backend | Google Sheet "Health check requests" + bound Apps Script, deployed as web app | Deployed from cory@criticalelement.io in the company Workspace. Mail goes to sales@. Script source: `docs/health-check-apps-script.gs`. |
| Applications backend | Google Sheet "Applications" + bound Apps Script + Drive folder "Applications - Resumes" | Deployed from cory@criticalelement.io in the company Workspace. Separate from health check by design (candidate PII). Mail goes to hr@. Script source: `docs/careers-apps-script.gs`. |
| Email aliases | `sales@criticalelement.io`, `hr@criticalelement.io` (routes to Cory and Tim) | Google Workspace. |
| Email signature assets | `assets/email/` on the live site | Append-only. Every signature sent points at these URLs. |
| Homepage mockup | https://claude.ai/artifact/4ZApUxtWivKZe3cm2uhNvT | Cory's personal Claude account. Historical; the live site supersedes it. |

Migration checklist: both Apps Script projects were deployed from the company Workspace account from the start (confirmed 2026-10-15), so no redeploy is needed and the `data-endpoint` URLs stay as they are. If either is ever redeployed fresh, its web app URL changes; update `data-endpoint` on the forms. Share the two Sheets and the Drive folder with the people who review leads and candidates.

## History (PRs, in order)

1. **Website v1.0** — Replaced the placeholder with the branded single-page site on the design system. Dark theme, Saira / IBM Plex Sans / JetBrains Mono, chamfered cards.
2. **Email signature** — Hosted logo PNGs, a generator page at `/signature/`, Gmail instructions.
3. **Health check form** — Modal CTA; Sheet + Apps Script backend; honeypot, too-fast check, per-email rate limit.
4. **Cache busting** — `?v=N` on CSS and JS after a deploy paired fresh HTML with stale cached CSS.
5. **Compact signature** — Half the height, to match partner signatures.
6. **Grafana review** — Applied Grafana Labs' brand alignment review: deprecated product names removed, LGTM spelled out, mid-page CTA, "Open by design" section, 15+ years proof point.
7. **README link + tokens sync** — Design system moved to the org; tokens refreshed (additive only).
8. **Careers** — Index, two role pages with JSON-LD, application modal with resume upload, separate Sheet + script.
9. **AI Observability page + nav + tools** — Page built from Tim's AI readiness one-pager; dropdown nav with phone panel; `tools/chrome.py` and partials.
10. **Pillar numerals** — 01/02/03 eyebrows on the AI page cards.
11. **Nav flatten + assessment ask** — Services | AI Observability | About; Grafana Partner into About; AI page asks for a paid assessment, not the free health check; per-opener modal copy.

## Decisions and why

- **Static HTML, no build step.** Simplicity was the brief. The chrome tool exists so shared parts stay in sync without a generator.
- **Google Sheets + Apps Script for forms** over Formspree or similar: free, company-owned data, and the Sheet is a native Zapier trigger for later. The CORS trick is `text/plain` POST bodies.
- **Native `<dialog>` for modals**: focus trapping, Escape and focus restore for free.
- **Nav is three items plus the CTA** (Tim's call, Oct 2026): AI Observability visible at the top level; Grafana Partner demoted to About because the hero already says it; Careers nested under About.
- **AI page asks for an assessment, health check stays in the nav.** The assessment is paid; the health check is the free entry for traditional Grafana work. Mixing them on one page confused readers.
- **One Oxide moment per screen.** Nav button is outlined so the hero button can be Oxide.
- **Grafana terminology is exact** because Grafana Labs reviews the site. Their review is the reason the page carries no invented metrics or customer names.
- **EliteOps** (sister company) is never mentioned publicly.
- **Branch protection**: a ruleset requiring review was added by a new hire in Oct 2026 and disabled the same day because it blocked all merges, and therefore deploys. If protection is wanted, use deletion and force-push rules only, and avoid "require approval for unattributed commits," which flags AI co-author trailers.

## Open items

- **Privacy policy.** The site collects personal data via two forms and has no policy page. Low urgency, but worth a short page.
- **Proof points.** No customer names, metrics, or partner tier on the site yet. Add when citable.
- **Grafana co-marketing sign-off.** Their review asked for the revised copy to go to Grafana's Content & Communications team.
- **ObservabilityCon banner** (Oct 19–21, San Francisco) was on the one-pager and left off the site. Dated content belongs in a time-boxed banner if wanted.
- **Role close-out.** When either open role is filled, remove the page the same day (see `docs/careers-setup.md`).
- **Zapier.** Planned for later; trigger on new Sheet rows. No site change needed.

## Working style that has worked

- Mock up locally, show it, iterate on copy, then push on an explicit go. Tim catches things in review; expect a second pass.
- Test desktop and phone before every push. Three nav bugs were caught this way that would have shipped otherwise.
- After merge, verify the live site with a cache-busting query string. Pages caches for 10 minutes.
- Keep PR descriptions complete. They are the change log.
