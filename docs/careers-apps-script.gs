/**
 * Critical Element: job application receiver.
 * Paste into Extensions > Apps Script of the "Applications" Google Sheet (a separate Sheet from
 * health check requests), then Deploy > New deployment > Web app, "Execute as: Me", "Who has access: Anyone".
 * The site POSTs JSON as text/plain (no CORS preflight). Resume PDFs arrive base64-encoded and are
 * saved to a Drive folder owned by the deploying account. See docs/careers-setup.md.
 */

var SHEET_NAME = 'Applications';
var NOTIFY_TO = 'hr@criticalelement.io';
var RESUME_FOLDER_NAME = 'Applications - Resumes';
var MIN_HUMAN_MS = 3000;
var MAX_PER_HOUR_PER_EMAIL = 3;
var MAX_RESUME_BYTES = 5 * 1024 * 1024;

function doGet() {
  return ContentService.createTextOutput('Critical Element applications endpoint is up.');
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || '{}';
    var d = JSON.parse(raw);

    if (d.website) return ok();
    if (typeof d.elapsed === 'number' && d.elapsed < MIN_HUMAN_MS) return ok();

    var role = clean(d.role, 120), name = clean(d.name, 120), email = clean(d.email, 200);
    var linkedin = clean(d.linkedin, 300), note = clean(d.note, 3000), page = clean(d.page, 200);
    var inUS = d.inUS === 'yes' ? 'Yes' : 'No';
    var sponsorship = d.sponsorship === 'yes' ? 'Yes' : 'No';
    if (!role || !name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('missing');
    if (inUS !== 'Yes' || sponsorship !== 'No') return fail('ineligible');
    if (overLimit(email)) return ok();

    var resumeUrl = '';
    if (d.resume && d.resume.data) {
      resumeUrl = saveResume(d.resume, name, role);
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      getSheet().appendRow([new Date(), role, name, email, linkedin, resumeUrl, inUS, sponsorship, note, page, 'New']);
    } finally {
      lock.releaseLock();
    }

    MailApp.sendEmail({
      to: NOTIFY_TO,
      replyTo: email,
      name: 'Critical Element website',
      subject: 'Application: ' + role + ' — ' + name,
      body: [
        'New application from criticalelement.io/careers',
        '',
        'Role:       ' + role,
        'Name:       ' + name,
        'Email:      ' + email,
        'LinkedIn:   ' + (linkedin || '-'),
        'Resume:     ' + (resumeUrl || '-'),
        'In the US:  ' + inUS,
        'Sponsorship needed: ' + sponsorship,
        '',
        'Note from the applicant:',
        note || '-',
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

function saveResume(resume, name, role) {
  var bytes = Utilities.base64Decode(String(resume.data));
  if (bytes.length > MAX_RESUME_BYTES) throw new Error('resume too large');
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var safe = function (s) { return String(s).replace(/[^\w .()-]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60); };
  var blob = Utilities.newBlob(bytes, 'application/pdf', stamp + ' ' + safe(name) + ' - ' + safe(role) + '.pdf');
  var file = getResumeFolder().createFile(blob);
  return file.getUrl();
}

function getResumeFolder() {
  var it = DriveApp.getFoldersByName(RESUME_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(RESUME_FOLDER_NAME);
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Role', 'Name', 'Email', 'LinkedIn', 'Resume', 'In US', 'Sponsorship', 'Note', 'Page', 'Status']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function overLimit(email) {
  var cache = CacheService.getScriptCache();
  var key = 'apply:' + email.toLowerCase();
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

/** Run once from the editor to grant Sheets, Drive and Mail permissions and confirm delivery. */
function testSend() {
  var pdf = Utilities.base64Encode(Utilities.newBlob('%PDF-1.4 test', 'application/pdf').getBytes());
  var res = doPost({ postData: { contents: JSON.stringify({
    role: 'Test Role', name: 'Test Person', email: 'test@example.com',
    linkedin: 'https://www.linkedin.com/in/test', inUS: 'yes', sponsorship: 'no',
    note: 'Manual test from the Apps Script editor.', page: '/careers/test/', elapsed: 9999,
    resume: { name: 'test.pdf', type: 'application/pdf', size: 13, data: pdf }
  }) } });
  Logger.log(res.getContent());
}
