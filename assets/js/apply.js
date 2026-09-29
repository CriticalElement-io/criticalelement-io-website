/* Critical Element: job application modal.
   No dependencies. Native <dialog> for focus trapping, Escape and focus restore.
   Endpoint: data-endpoint on #apply-form (the careers Apps Script web app URL; see docs/careers-setup.md).
   Empty endpoint = show the email fallback instead of sending.
   Resume PDFs are sent base64-encoded inside the same POST and saved to Drive by the script. */
(function () {
  'use strict';
  var dlg = document.getElementById('apply');
  if (!dlg) return;
  var form = document.getElementById('apply-form');
  var done = dlg.querySelector('.hc-done');
  var ineligible = dlg.querySelector('.hc-ineligible');
  var errEl = document.getElementById('apply-error');
  var submit = document.getElementById('apply-submit');
  var roleEl = document.getElementById('apply-role');
  var f = form.elements;
  var native = typeof dlg.showModal === 'function';
  var openedAt = 0;
  var HR = 'hr@criticalelement.io';
  var MIN_HUMAN_MS = 3000;
  var MAX_RESUME_BYTES = 5 * 1024 * 1024;

  function open(role) {
    openedAt = Date.now();
    reset();
    f.role.value = role || '';
    roleEl.textContent = role || 'Open role';
    if (native) { if (!dlg.open) dlg.showModal(); } else { dlg.setAttribute('open', ''); }
    window.setTimeout(function () { f.name.focus(); }, 0);
  }
  function close() {
    if (native) { if (dlg.open) dlg.close(); } else { dlg.removeAttribute('open'); }
  }
  function show(el) {
    form.hidden = el !== form;
    done.hidden = el !== done;
    ineligible.hidden = el !== ineligible;
  }
  function reset() {
    show(form);
    hideError();
    form.reset();
    Array.prototype.forEach.call(form.querySelectorAll('[aria-invalid]'), function (el) { el.removeAttribute('aria-invalid'); });
    setSending(false);
  }
  function setSending(on) {
    submit.disabled = on;
    submit.textContent = on ? 'Sending…' : 'Send application';
  }
  function showError(html) { errEl.innerHTML = html; errEl.hidden = false; }
  function hideError() { errEl.hidden = true; errEl.textContent = ''; }
  function mailtoFallback(p) {
    var body = 'Role: ' + p.role + '\nName: ' + p.name + '\nLinkedIn: ' + (p.linkedin || '-') + '\nLocated in the US: ' + p.inUS + '\nNeeds sponsorship: ' + p.sponsorship + '\n\n' + (p.note || '') + '\n\n(Please attach your resume.)';
    return 'mailto:' + HR + '?subject=' + encodeURIComponent('Application: ' + p.role + ' — ' + p.name) + '&body=' + encodeURIComponent(body);
  }
  function fail(p) {
    setSending(false);
    showError('That didn’t send. <a href="' + mailtoFallback(p) + '">Email your application</a> to ' + HR + ' instead, with your resume attached.');
  }
  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { reject(r.error); };
      r.readAsDataURL(file);
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open-apply]');
    if (!t) return;
    e.preventDefault();
    open(t.getAttribute('data-open-apply'));
  });
  Array.prototype.forEach.call(dlg.querySelectorAll('[data-apply-close]'), function (b) { b.addEventListener('click', close); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dlg.hasAttribute('open')) { e.preventDefault(); close(); } });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideError();
    var name = f.name.value.trim(), email = f.email.value.trim(), linkedin = f.linkedin.value.trim();
    var inUS = form.querySelector('input[name="inUS"]:checked');
    var sponsorship = form.querySelector('input[name="sponsorship"]:checked');
    var file = f.resume.files && f.resume.files[0];

    f.name.setAttribute('aria-invalid', name ? 'false' : 'true');
    f.email.setAttribute('aria-invalid', email ? 'false' : 'true');
    if (!name || !email) { showError('Name and email are required.'); (name ? f.email : f.name).focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { f.email.setAttribute('aria-invalid', 'true'); showError('That email doesn’t look right.'); f.email.focus(); return; }
    if (linkedin && !/^https?:\/\/([a-z]+\.)?linkedin\.com\//i.test(linkedin)) { f.linkedin.setAttribute('aria-invalid', 'true'); showError('The LinkedIn link should start with https://www.linkedin.com/'); f.linkedin.focus(); return; }
    if (!linkedin && !file) { showError('Add a LinkedIn profile or upload a resume, so we have something to read.'); f.linkedin.focus(); return; }
    if (file && !/\.pdf$/i.test(file.name)) { showError('Resumes need to be PDF.'); f.resume.focus(); return; }
    if (file && file.size > MAX_RESUME_BYTES) { showError('That PDF is over 5 MB. Please compress it or share a LinkedIn profile instead.'); f.resume.focus(); return; }
    if (!inUS || !sponsorship) { showError('Please answer both eligibility questions.'); return; }

    // Screening: both roles are US-only and we cannot sponsor visas. Say so instead of collecting an application we can't act on.
    if (inUS.value !== 'yes' || sponsorship.value !== 'no') { show(ineligible); ineligible.querySelector('.btn').focus(); return; }

    var payload = {
      role: f.role.value, name: name, email: email, linkedin: linkedin,
      inUS: inUS.value, sponsorship: sponsorship.value, note: f.note.value.trim(),
      website: f.website.value, page: location.pathname, elapsed: Date.now() - openedAt
    };
    if (payload.website || payload.elapsed < MIN_HUMAN_MS) { show(done); return; }

    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    if (!endpoint) { fail(payload); return; }

    setSending(true);
    var start = file ? readFile(file).then(function (b64) { payload.resume = { name: file.name, type: 'application/pdf', size: file.size, data: b64 }; }) : Promise.resolve();
    start.then(function () {
      var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = ctrl && window.setTimeout(function () { ctrl.abort(); }, 45000);
      return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow',
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        if (timer) window.clearTimeout(timer);
        if (!res.ok) throw new Error('http ' + res.status);
        return res.text().then(function (t) {
          var j = null;
          try { j = JSON.parse(t); } catch (_) { /* non-JSON 2xx: treat as delivered */ }
          if (j && j.ok === false) throw new Error(j.error || 'rejected');
        });
      });
    }).then(function () { show(done); done.querySelector('.btn').focus(); }, function () { fail(payload); });
  });
})();
