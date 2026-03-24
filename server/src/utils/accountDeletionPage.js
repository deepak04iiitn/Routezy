function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderAccountDeletionPage(options = {}) {
  const appName = escapeHtml(options.appName || 'Routezy');
  const supportEmail = escapeHtml(options.supportEmail || 'support@example.com');
  const androidPath = escapeHtml(options.androidPath || 'Account > Delete Account');
  const retentionNote = escapeHtml(
    options.retentionNote || 'Some records may be retained when required for legal, fraud-prevention, or security reasons.'
  );

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${appName} Account Deletion</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f5f7fb;
        --card: #ffffff;
        --text: #102347;
        --muted: #5f6f8b;
        --accent: #ff6b6b;
        --border: #dbe4f0;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: linear-gradient(180deg, #fff7f1 0%, var(--bg) 100%);
        color: var(--text);
      }
      main {
        max-width: 760px;
        margin: 0 auto;
        padding: 48px 20px 72px;
      }
      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 16px 40px rgba(16, 35, 71, 0.08);
      }
      h1, h2 { margin: 0 0 12px; }
      h1 { font-size: 32px; }
      h2 { font-size: 20px; margin-top: 28px; }
      p, li { line-height: 1.6; color: var(--muted); }
      ol, ul { padding-left: 20px; }
      a {
        color: var(--accent);
        text-decoration: none;
        font-weight: 700;
      }
      .badge {
        display: inline-block;
        margin-bottom: 16px;
        padding: 8px 12px;
        border-radius: 999px;
        background: #ffe7de;
        color: var(--accent);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .highlight {
        border-left: 4px solid var(--accent);
        background: #fff6f3;
        padding: 14px 16px;
        border-radius: 12px;
        margin-top: 18px;
      }
      code {
        background: #eef3fb;
        padding: 2px 6px;
        border-radius: 6px;
        color: var(--text);
      }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <div class="badge">${appName}</div>
        <h1>Account and Data Deletion</h1>
        <p>
          If you use ${appName}, you can request deletion of your account and associated data at any time.
        </p>

        <h2>Delete directly inside the app</h2>
        <ol>
          <li>Open the ${appName} app.</li>
          <li>Go to <code>${androidPath}</code>.</li>
          <li>Tap <strong>Delete Account</strong> and confirm.</li>
        </ol>

        <h2>Request deletion by email</h2>
        <p>
          If you cannot access the app, email
          <a href="mailto:${supportEmail}?subject=${encodeURIComponent(`${options.appName || 'Routezy'} account deletion request`)}">${supportEmail}</a>
          from the address linked to your account and ask for account deletion.
        </p>

        <div class="highlight">
          <p><strong>Deleted data:</strong> account profile, profile image, saved trips, created trips, session history, and related activity records.</p>
          <p><strong>Retention notice:</strong> ${retentionNote}</p>
        </div>
      </div>
    </main>
  </body>
</html>`;
}
