# Handoff: criticalelement.io

Written 2026-10-15 when website management moved from Cory's personal tooling to the Critical Element enterprise account; updated 2026-10-27 after the security review and branch protection. Everything an agent or a new maintainer needs that isn't obvious from the code.

## People

| Who | Role | GitHub |
|---|---|---|
| Cory Wallace | Runs the website. Final say on structure and copy. | `cwall75` (personal), `critical-element-cory` (company) |
| Tim Jaroch | Co-founder and CEO. Supplies one-pagers and briefs, reviews copy, requests changes. | `jarocht` |
| Grafana Labs Channel Sales | Reviews the site for brand and terminology before co-marketing use. | — |

Org owners (and so repo admins) as of 2026-10-27: `cwall75`, `critical-element-cory`, `jarocht`, `FreakyFastDeli`. The org requires 2FA. Only the `repogods` team (`critical-element-cory`) can bypass branch protection.

GitHub Apps with write access to repo contents: Claude, Cursor, and the ChatGPT/Codex connector. None of them can bypass branch protection, so their work arrives as PRs. Requests made to the Engineering channel's Grok bot get handed to a Cursor cloud agent, which opens the PR under the requester's GitHub account (PR 17 came in as `jarocht`). Cursor picks its model automatically unless the team restricts it.

## Accounts and ownership

Things that live outside this repo and who owns them. Confirm each when migrating.

| Thing | Where | Notes |
|---|---|---|
| Repo | `CriticalElement-io/criticalelement-io-website` | Public. Required: GitHub Pages on the Free plan only publishes public repos. Private needs the Team plan. |
| Hosting | GitHub Pages, `main` branch root | Custom domain via `CNAME`, HTTPS enforced. DNS A records point at GitHub's Pages IPs; `www` is a CNAME. Legacy Jekyll build; `_config.yml` keeps `docs/`, `tools/` and the agent docs off the live site. |
| Branch protection | Ruleset `main-protection` on the default branch | Active since 2026-10-27. See "Decisions" for the exact rules. |
| Domain | criticalelement.io | Registrar/DNS not managed from this repo. |
| Design system | `CriticalElement-io/ce-design-system` (private) | Source of `assets/css/tokens.css` and all logo files. Moved from `cwall75/ce-design-system` in Sept 2026. |
| Health check backend | Google Sheet "Health check requests" + bound Apps Script, deployed as web app | Deployed from cory@criticalelement.io in the company Workspace. Mail goes to sales@. Script source: `docs/health-check-apps-script.gs`. Web app URL changed on 2026-10-23 (`…/AKfycbwxYt8u…/exec`); the earlier deployment returns 404. |
| Applications backend | Google Sheet "Applications" + bound Apps Script + Drive folder "Applications - Resumes" | Deployed from cory@criticalelement.io in the company Workspace. Separate from health check by design (candidate PII). Mail goes to hr@. Script source: `docs/careers-apps-script.gs`. |
| Email aliases | `sales@criticalelement.io`, `hr@criticalelement.io` (routes to Cory and Tim) | Google Workspace. |
| Email signature assets | `assets/email/` on the live site | Append-only. Every signature sent points at these URLs. |
| Homepage mockup | https://claude.ai/artifact/4ZApUxtWivKZe3cm2uhNvT | Cory's personal Claude account. Historical; the live site supersedes it. |

Migration checklist: both Apps Script projects were deployed from the company Workspace account from the start (confirmed 2026-10-15). To ship script changes, paste the `.gs` file into the editor and use **Manage deployments → pencil → New version**. **New deployment** creates a new web app URL; that is how the health check URL changed on 2026-10-23, and `data-endpoint` then has to be updated in `tools/partials/health-check.html`. Share the two Sheets and the Drive folder with the people who review leads and candidates.

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
12. **Agent handoff** — `AGENTS.md`, `CLAUDE.md` and this file, for the move to the company Claude account.
13. **Apps Script ownership** — Recorded that both form backends were deployed from the company Workspace.
14. **Pages exclusions** — `_config.yml` stops Pages publishing `docs/`, `tools/`, `README.md`, `AGENTS.md` and `CLAUDE.md`. Before this, `docs/handoff.md` and the script sources were served on criticalelement.io.
15. **Form backend hardening** (security review, 2026-10-23) — Sheet values starting with `=` `+` `-` `@` are stored as text (formula injection); resumes must carry the `%PDF-` signature, checked in the browser and the script; site-wide hourly caps (30 health checks, 20 applications) return `busy` and send visitors to the email fallback.
16. **Health check endpoint** — The old deployment URL had started returning 404 and visitors were getting the email fallback; the form now points at the active deployment.
17. **Office address** (Cursor agent via the Grok bot, for Tim) — Address in the homepage Contact section and the site-wide footer; Organization JSON-LD on the homepage; `/llms.txt` for answer-engine optimization.

## Decisions and why

- **Static HTML, no build step.** Simplicity was the brief. The chrome tool exists so shared parts stay in sync without a generator.
- **Google Sheets + Apps Script for forms** over Formspree or similar: free, company-owned data, and the Sheet is a native Zapier trigger for later. The CORS trick is `text/plain` POST bodies.
- **Native `<dialog>` for modals**: focus trapping, Escape and focus restore for free.
- **Nav is three items plus the CTA** (Tim's call, Oct 2026): AI Observability visible at the top level; Grafana Partner demoted to About because the hero already says it; Careers nested under About.
- **AI page asks for an assessment, health check stays in the nav.** The assessment is paid; the health check is the free entry for traditional Grafana work. Mixing them on one page confused readers.
- **One Oxide moment per screen.** Nav button is outlined so the hero button can be Oxide.
- **Grafana terminology is exact** because Grafana Labs reviews the site. Their review is the reason the page carries no invented metrics or customer names.
- **EliteOps** (sister company) is never mentioned publicly.
- **Branch protection** (`main-protection` ruleset, active 2026-10-27): require a pull request with **0 approvals**, restrict deletions, block force pushes. Bypass: the `repogods` team only, "Always". Nobody can push straight to `main`, including AI agents and anyone they act as, but no merge waits on a reviewer.
  - Why these settings: the first version of this ruleset (Oct 2026) blocked every merge, and so every deploy. Two settings caused it. **Restrict updates** with an empty bypass list blocks all changes to `main`, merges included. **Require approval for unattributed changes** treats AI co-authored commits as unattributed and demands a second person's approval. Keep both off, along with **Restrict creations**.
  - Bypass is a team rather than "Organization admin" because all four accounts are owners. An agent working under an owner's account (as Cursor did with PR 17) would otherwise be able to push straight to `main`.
- **`/llms.txt` and Organization JSON-LD** (Oct 2026, Tim's AEO request): plain, factual summaries for crawlers and AI answer engines. They repeat site copy, so they have to change when that copy, the contact details or the open roles change.

## Open items

- **Privacy policy.** The site collects personal data via two forms and has no policy page. Low urgency, but worth a short page.
- **Proof points.** No customer names, metrics, or partner tier on the site yet. Add when citable.
- **Grafana co-marketing sign-off.** Their review asked for the revised copy to go to Grafana's Content & Communications team.
- **Account hardening still to do** (from the 2026-10-23 security review): reduce `cwall75` from org owner to member, or remove it; turn on secret scanning and push protection (free on public repos). Consider whether all four accounts need to be owners.
- **Cursor model settings.** Restrict Cursor to approved models if model choice matters for agent-written PRs.
- **Role close-out.** When either open role is filled, remove the page the same day (see `docs/careers-setup.md`).
- **Zapier.** Planned for later; trigger on new Sheet rows. No site change needed.

## Working style that has worked

- Mock up locally, show it, iterate on copy, then push on an explicit go. Tim catches things in review; expect a second pass.
- Test desktop and phone before every push. Three nav bugs were caught this way that would have shipped otherwise.
- After merge, verify the live site with a cache-busting query string. Pages caches for 10 minutes.
- Keep PR descriptions complete. They are the change log.
- Apps Script changes are two steps: merge the `.gs` change here, then paste it into the editor and publish a new version. The scripts are `docs/*.gs`, not `assets/js/*.js`. Pasting the browser script by mistake leaves the editor showing "No functions" with Run grayed out.
- Test the live form after any backend change with one submission labeled TEST, then delete the row and email.
