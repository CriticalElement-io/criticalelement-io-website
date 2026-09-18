# Health check form: backend setup

The "Request a health check" modal on the homepage posts to a Google Apps Script web app. The script appends a row to a Google Sheet and emails sales@criticalelement.io. No paid form product, nothing to host, and the Sheet is the record.

Setup takes about ten minutes. Do it from a **company Google Workspace account** that should own the data, not a personal Gmail: the script runs as that account and mail is sent from it.

## 1. Create the Sheet

1. Create a Google Sheet named **Health check requests** in the company Drive.
2. Leave it empty. The script creates a `Requests` tab with headers on first submission.

## 2. Add the script

1. In the Sheet: **Extensions → Apps Script**.
2. Delete the placeholder code, paste the contents of [`health-check-apps-script.gs`](health-check-apps-script.gs), and save. Name the project "Health check receiver".
3. In the function dropdown choose **testSend**, click **Run**, and approve the permissions prompt (Sheets and Mail). Confirm a row appeared in the Sheet and that sales@ received the test email.

## 3. Deploy as a web app

1. **Deploy → New deployment**. Type: **Web app**.
2. Description `v1`. **Execute as: Me**. **Who has access: Anyone**.
3. Click **Deploy** and copy the **Web app URL** (ends in `/exec`).
4. Open that URL in a browser. You should see "Critical Element health check endpoint is up."

"Anyone" means anyone can POST to it. That's the trade-off for a static site. The honeypot, the too-fast check, and the per-email rate limit in the script handle drive-by spam. There are no secrets to leak: the script only writes to the Sheet and sends mail.

## 4. Wire the site

Use the plain `https://script.google.com/macros/s/<ID>/exec` form of the URL. The deploy dialog may show an `/a/macros/criticalelement.io/` variant; both work, but the plain one never prompts outside visitors to sign in.

In `index.html`, find the form and paste the URL into `data-endpoint`:

```html
<form id="hc-form" class="hc-form" novalidate data-endpoint="https://script.google.com/macros/s/AKfy.../exec">
```

Commit on a branch, open a PR, merge. Submit the form on the live site once and confirm the Sheet row and the email.

## Updating the script later

Edit the code in the Apps Script editor, then **Deploy → Manage deployments → pencil icon → Version: New version → Deploy**. The URL stays the same. Saving alone does not update the live endpoint.

## Limits

- Google Workspace mail quota is 1,500 messages per day per account. Consumer Gmail is 100. Either is plenty.
- Apps Script executions take a few seconds. The button shows "Sending…" and the page waits up to 15 seconds before offering the email fallback.

## Moving to Zapier later

Nothing on the site changes. Zapier's free plan can trigger on **Google Sheets → New Spreadsheet Row**, so point a Zap at the `Requests` tab and route from there (CRM, Slack, whatever comes next). The Apps Script email can stay on or be removed.

## Testing locally without Google

Any endpoint that accepts a POST and returns 200 works. `docs/mock-endpoint.py` does that:

```bash
python3 docs/mock-endpoint.py
```

Then in the browser console on the local site:

```js
document.getElementById('hc-form').dataset.endpoint = 'http://localhost:8767/ok'
```

Use `/fail` for the error path and `/slow` for the timeout path.
