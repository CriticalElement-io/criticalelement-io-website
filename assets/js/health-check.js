/* Critical Element: "Request a health check" modal.
   No dependencies. Uses the native <dialog> element for focus trapping, Escape and focus restore.
   Endpoint: data-endpoint on #hc-form (the Apps Script web app URL; see docs/health-check-setup.md).
   Empty endpoint = show the mailto fallback instead of sending. */
(function () {
  'use strict';
  var dlg = document.getElementById('health-check');
  if (!dlg) return;
  var form = document.getElementById('hc-form');
  var done = dlg.querySelector('.hc-done');
  var errEl = document.getElementById('hc-error');
  var submit = document.getElementById('hc-submit');
  var f = form.elements;
  var native = typeof dlg.showModal === 'function';
  var openedAt = 0;
  var source = '';
  var SALES = 'sales@criticalelement.io';
  var MIN_HUMAN_MS = 2000;

  function open(src) {
    source = src || '';
    openedAt = Date.now();
    reset();
    if (native) { if (!dlg.open) dlg.showModal(); } else { dlg.setAttribute('open', ''); }
    window.setTimeout(function () { f.name.focus(); }, 0);
  }
  function close() {
    if (native) { if (dlg.open) dlg.close(); } else { dlg.removeAttribute('open'); }
  }
  function reset() {
    form.hidden = false;
    done.hidden = true;
    hideError();
    form.reset();
    ['name', 'email', 'company'].forEach(function (n) { f[n].removeAttribute('aria-invalid'); });
    setSending(false);
  }
  function setSending(on) {
    submit.disabled = on;
    submit.textContent = on ? 'Sending…' : 'Send it';
  }
  function showError(html) { errEl.innerHTML = html; errEl.hidden = false; }
  function hideError() { errEl.hidden = true; errEl.textContent = ''; }
  function succeed() { form.hidden = true; done.hidden = false; done.querySelector('.btn').focus(); }
  function mailtoFallback(payload) {
    var body = 'Name: ' + payload.name + '\nCompany: ' + payload.company + '\nGrafana today: ' + (payload.grafana || '-') + '\n\n' + (payload.message || '');
    return 'mailto:' + SALES + '?subject=' + encodeURIComponent('Health check request: ' + payload.company) + '&body=' + encodeURIComponent(body);
  }
  function fail(payload) {
    setSending(false);
    showError('That didn’t send. <a href="' + mailtoFallback(payload) + '">Email us instead</a> and we’ll take it from there.');
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // openers
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open-health-check]');
    if (!t) return;
    e.preventDefault();
    open(t.getAttribute('data-open-health-check'));
  });
  // closers: X, done button, backdrop click (the dialog itself covers the viewport), Escape (native 'cancel')
  Array.prototype.forEach.call(dlg.querySelectorAll('[data-hc-close]'), function (b) { b.addEventListener('click', close); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
  // Native <dialog> closes on Escape by itself; this also covers the polyfill path and any browser quirk.
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dlg.hasAttribute('open')) { e.preventDefault(); close(); } });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideError();
    var name = f.name.value.trim(), email = f.email.value.trim(), company = f.company.value.trim();
    var missing = [];
    [['name', name], ['email', email], ['company', company]].forEach(function (p) {
      var bad = !p[1];
      f[p[0]].setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad) missing.push(p[0]);
    });
    if (missing.length) {
      showError('Name, work email and company are required.');
      f[missing[0]].focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      f.email.setAttribute('aria-invalid', 'true');
      showError('That email doesn’t look right.');
      f.email.focus();
      return;
    }
    var payload = {
      name: name, email: email, company: company,
      grafana: f.grafana.value, message: f.message.value.trim(),
      website: f.website.value, source: source, page: location.pathname,
      elapsed: Date.now() - openedAt
    };
    // Bots: honeypot filled or submitted faster than a person could type. Pretend it worked.
    if (payload.website || payload.elapsed < MIN_HUMAN_MS) { succeed(); return; }

    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    if (!endpoint) { fail(payload); return; }

    setSending(true);
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl && window.setTimeout(function () { ctrl.abort(); }, 15000);
    // text/plain avoids a CORS preflight, which Apps Script cannot answer.
    fetch(endpoint, {
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
        try { j = JSON.parse(t); } catch (_) { /* non-JSON body: treat a 2xx as delivered */ }
        if (j && j.ok === false) throw new Error(j.error || 'rejected');
      });
    }).then(function () { succeed(); }, function () { fail(payload); });
  });
})();
