/* Critical Element: site navigation.
   Click-to-open dropdowns on desktop, a full-width menu panel on phones and tablets.
   Keyboard: Tab through items, Enter/Space toggles a dropdown, Escape closes everything.
   No dependencies. Markup lives in tools/partials/nav.html. */
(function () {
  'use strict';
  var nav = document.querySelector('.nav');
  if (!nav) return;
  var toggle = nav.querySelector('.menu-toggle');
  var subs = Array.prototype.slice.call(nav.querySelectorAll('.has-sub'));
  var desktop = window.matchMedia('(min-width: 900px)');

  function setSub(li, open) {
    li.classList.toggle('open', open);
    li.querySelector('.sub-toggle').setAttribute('aria-expanded', String(open));
  }
  function closeSubs(except) {
    subs.forEach(function (li) { if (li !== except) setSub(li, false); });
  }
  function setMenu(open) {
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.classList.toggle('menu-lock', open);
    if (!open) closeSubs();
  }

  subs.forEach(function (li) {
    li.querySelector('.sub-toggle').addEventListener('click', function () {
      var open = !li.classList.contains('open');
      if (desktop.matches) closeSubs(li);
      setSub(li, open);
    });
  });

  toggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('menu-open'));
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) closeSubs();
  });

  // Choosing a link closes the menu, so same-page anchors don't leave the panel or dropdown open.
  nav.querySelector('.menu').addEventListener('click', function (e) {
    if (!e.target.closest('a')) return;
    closeSubs();
    if (nav.classList.contains('menu-open')) setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var anyOpen = subs.some(function (li) { return li.classList.contains('open'); });
    if (nav.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
    else if (anyOpen) {
      var li = subs.filter(function (l) { return l.classList.contains('open'); })[0];
      closeSubs();
      li.querySelector('.sub-toggle').focus();
    }
  });

  // Focus leaving a desktop dropdown closes it.
  nav.addEventListener('focusout', function (e) {
    if (!desktop.matches) return;
    var li = e.target.closest('.has-sub');
    if (li && e.relatedTarget && !li.contains(e.relatedTarget)) setSub(li, false);
  });

  // Leaving phone width closes the panel so the desktop bar is never stuck locked.
  (desktop.addEventListener ? desktop.addEventListener('change', onChange) : desktop.addListener(onChange));
  function onChange(m) { if (m.matches && nav.classList.contains('menu-open')) setMenu(false); }
  window.addEventListener('resize', function () { if (desktop.matches && nav.classList.contains('menu-open')) setMenu(false); });

  // Mark the current page in the menu (not on the homepage, whose links are anchors).
  var path = location.pathname.replace(/index\.html$/, '');
  Array.prototype.forEach.call(nav.querySelectorAll('.menu a[href]'), function (a) {
    var href = a.getAttribute('href').split('#')[0];
    if (href && href !== '/' && href === path) {
      a.setAttribute('aria-current', 'page');
      var li = a.closest('.has-sub');
      if (li) li.classList.add('current');
    }
  });
})();
