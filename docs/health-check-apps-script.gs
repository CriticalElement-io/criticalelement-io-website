/**
 * Critical Element: health check request receiver.
 * Paste into Extensions > Apps Script of the "Health check requests" Google Sheet,
 * then Deploy > New deployment > Web app, "Execute as: Me", "Who has access: Anyone".
 * The site POSTs JSON as text/plain (no CORS preflight). See docs/health-check-setup.md.
 */

var SHEET_NAME = 'Requests';
var NOTIFY_TO = 'sales@criticalelement.io';
var MIN_HUMAN_MS = 2000;      // submissions faster than this are treated as bots
var MAX_PER_HOUR_PER_EMAIL = 5;

function doGet() {
  return ContentService.createTextOutput('Critical Element health check endpoint is up.');
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || '{}';
    var d = JSON.parse(raw);

    // Bot filters: honeypot, too-fast, and a soft per-email rate limit. Bots get a 200 so they stop retrying.
    if (d.website) return ok();
    if (typeof d.elapsed === 'number' && d.elapsed < MIN_HUMAN_MS) return ok();

    var name = clean(d.name, 120), email = clean(d.email, 200), company = clean(d.company, 120);
    var grafana = clean(d.grafana, 60), message = clean(d.message, 2000);
    var source = clean(d.source, 40), page = clean(d.page, 200);
    if (!name || !email || !company || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('missing');
    if (overLimit(email)) return ok();

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = getSheet();
      sheet.appendRow([new Date(), name, email, company, grafana, message, source, page]);
    } finally {
      lock.releaseLock();
    }

    MailApp.sendEmail({
      to: NOTIFY_TO,
      replyTo: email,
      name: 'Critical Element website',
      subject: 'Health check request: ' + company,
      body: [
        'New health check request from criticalelement.io',
        '',
        'Name:     ' + name,
        'Email:    ' + email,
        'Company:  ' + company,
        'Grafana:  ' + (grafana || '-'),
        'Source:   ' + (source || '-') + (page ? ' (' + page + ')' : ''),
        '',
        "What's not working today?",
        message || '-',
        '',
        'Sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
      ].join('\n')
    });

    return ok();
  } catch (err) {
    console.error(err);
    return fail('server');
  }
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Company', 'Grafana today', 'Message', 'Source', 'Page']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function overLimit(email) {
  var cache = CacheService.getScriptCache();
  var key = 'hc:' + email.toLowerCase();
  var n = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(n), 3600);
  return n > MAX_PER_HOUR_PER_EMAIL;
}

// Strip ASCII control characters (keeps newlines and tabs), trim, cap length.
function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim().slice(0, max);
}

function ok() { return json({ ok: true }); }
function fail(code) { return json({ ok: false, error: code }); }
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor to grant Sheets + Mail permissions and confirm delivery. */
function testSend() {
  var res = doPost({ postData: { contents: JSON.stringify({
    name: 'Test Person', email: 'test@example.com', company: 'Test Co',
    grafana: 'Grafana Cloud', message: 'Manual test from the Apps Script editor.',
    source: 'test', page: '/', elapsed: 9999
  }) } });
  Logger.log(res.getContent());
}
