# Adding your Critical Element email signature in Gmail

Takes about two minutes. You only do this once.

## 1. Build the signature

1. Open **https://criticalelement.io/signature/**
2. Fill in your name, title, email and phone. Leave phone blank if you don't want it shown.
3. Click **Copy signature**. You'll see "Copied" next to the button.

If the button says copy was blocked, click inside the white preview box, press **Cmd+A** then **Cmd+C** (Ctrl on Windows), and continue.

## 2. Paste it into Gmail

1. In Gmail on the web, click the **gear icon** (top right), then **See all settings**.
2. On the **General** tab, scroll down to **Signature**.
3. Click **Create new**, name it `Critical Element`, and click **Create**.
4. Click inside the signature editor and paste (**Cmd+V** / **Ctrl+V**). You should see the logo, the orange rule and your details.
5. Under **Signature defaults**, set both **For new emails use** and **On reply/forward use** to **Critical Element**.
6. Scroll to the bottom of the page and click **Save Changes**.

Send yourself a test email to confirm it looks right.

## Updating a signature you already have

When the design changes, rebuild it once:

1. Open **https://criticalelement.io/signature/**, fill in your details, click **Copy signature**.
2. Gmail → gear → **See all settings** → **General** → **Signature**. Click your **Critical Element** signature.
3. Click inside the editor, press **Cmd+A** (Ctrl+A) to select the old one, then paste (**Cmd+V** / **Ctrl+V**).
4. Scroll down and click **Save Changes**.

## Phones and tablets

The Gmail mobile apps don't use your web signature and can't show images. Set a plain-text signature there instead:

- **iPhone / iPad:** Gmail app → menu → **Settings** → your account → **Signature settings** → turn on **Mobile signature** and type your name, title and `criticalelement.io`.
- **Android:** Gmail app → menu → **Settings** → your account → **Mobile signature**.

## Troubleshooting

- **Logo shows as a broken image or a box.** Some recipients' mail clients block remote images until they click "Show images". That's normal; your name and details still read fine.
- **The orange rule is missing after pasting.** Gmail occasionally drops it. Delete the signature, copy again from the generator page, and paste with **Cmd+Shift+V** off (plain paste strips formatting).
- **Fonts look different from the website.** Expected. Email clients don't load web fonts, so the signature uses Arial on purpose.

## For admins

- Images live at `https://criticalelement.io/assets/email/`. Never rename or move a file there: every signature ever sent points at it.
- The raw template is in `assets/email/signature-template.html`. The generator page is `signature/index.html`.
- Google Workspace can append a company-wide footer (Admin console → Apps → Google Workspace → Gmail → Compliance → Append footer), but it's plain text and not per-person. The generator above is the per-user path.
