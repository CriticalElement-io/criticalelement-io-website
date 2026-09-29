# Careers: application form backend and how to manage roles

Applications from `/careers/` post to a Google Apps Script web app, separate from the health check one. The script saves the resume PDF to a Drive folder, appends a row to the **Applications** Sheet, and emails hr@criticalelement.io. The Sheet is the applicant tracker; the `Status` column is yours to edit.

## One-time setup (about ten minutes)

Do this from the company Workspace account that should own applicant data. The Drive folder and the Sheet will belong to that account; share both with whoever else reviews candidates.

1. Create a Google Sheet named **Applications**. Leave it empty; the script creates the `Applications` tab and headers on first submission.
2. **Extensions → Apps Script.** Replace the placeholder with [`careers-apps-script.gs`](careers-apps-script.gs). Save as "Applications receiver".
3. Function dropdown → **testSend** → **Run**. Approve the permissions prompt (Sheets, Drive, Mail). Confirm: a row in the Sheet, a `test.pdf` in a new Drive folder called **Applications - Resumes**, and an email at hr@.
4. **Deploy → New deployment → Web app.** Execute as **Me**, access **Anyone**. Copy the URL (use the plain `https://script.google.com/macros/s/<ID>/exec` form).
5. Paste the URL into `data-endpoint` on the `#apply-form` in **each** role page under `careers/`. Until then the form shows the email fallback.

Redeploying after script edits: **Deploy → Manage deployments → pencil → New version → Deploy.** The URL stays the same.

## Screening

Both roles are US-only with no visa sponsorship. The form asks both questions and, if the answers rule the applicant out, shows a polite message and does not submit. The script rejects anything that slips past the browser. Nothing is stored for ineligible applicants.

## Limits

- Resumes: PDF only, 5 MB max. Larger files are refused in the browser with a message.
- Bot filters: honeypot, too-fast check (3 s), 3 submissions per email per hour.
- Mail quota: 1,500/day on Workspace. Not a concern.

## Adding a role

1. Copy an existing role folder, e.g. `careers/implementation-engineer/` → `careers/new-role/`.
2. Edit `index.html`: title, meta description, canonical and og:url, the header facts, the description, the `data-open-apply` role name on both Apply buttons, and the JSON-LD block at the bottom (title, description, datePosted, validThrough, baseSalary, identifier).
3. Add a card to `careers/index.html` and a `<url>` to `sitemap.xml`.
4. Bump the `?v=N` on stylesheet links if you touched CSS.

## Closing a role

Google indexes the JSON-LD as a job listing and penalizes expired postings, so take the page down the same day the role closes:

1. Delete the role folder and its card on `careers/index.html`; remove it from `sitemap.xml`.
2. If it was the last open role, `careers/index.html` already has the "no open roles" copy ready in a comment; swap it in.

`validThrough` in each JSON-LD block is set 90 days from posting. If a role stays open longer, move the date forward; if it lapses, Google drops the listing on its own but the page should still come down.

## Testing locally

```bash
python3 docs/mock-endpoint.py
```

Then on a local role page, in the console:

```js
document.getElementById('apply-form').dataset.endpoint = 'http://localhost:8767/ok'
```

The mock logs the payload (resume base64 included) and answers like the real script. `/fail` exercises the error path.
