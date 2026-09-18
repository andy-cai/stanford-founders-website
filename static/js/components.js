/**
 * components.js: loads shared header/footer, marks the active nav link,
 * runs the mobile menu and scroll reveals, and wires the contact form to
 * the Google Apps Script endpoint.
 */
(function () {
  function load(placeholderId, file) {
    var el = document.getElementById(placeholderId);
    if (!el) return Promise.resolve();
    return fetch(file, { cache: 'no-cache' })
      .then(function (r) { return r.text(); })
      .then(function (html) { el.innerHTML = html; });
  }

  function activeLink() {
    var page = (document.body.dataset.page || '').toLowerCase();
    if (!page) return;
    document.querySelectorAll('nav.primary a[data-page]').forEach(function (a) {
      if ((a.dataset.page || '').toLowerCase() === page) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  function mobileNav() {
    var nav = document.getElementById('primary-nav');
    var toggle = nav && nav.querySelector('.nav-toggle');
    var panel = nav && nav.querySelector('.mobile-nav');
    if (!toggle || !panel) return;
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      panel.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    var mq = window.matchMedia('(min-width: 881px)');
    if (mq.addEventListener) mq.addEventListener('change', function (e) { if (e.matches) setOpen(false); });
  }

  function footerYear() {
    var y = document.getElementById('footer-year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function reveals() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // Apps Script endpoint owns rolling-membership + contact form rows.
  // Pages set window.SFS_FORM_ENDPOINT before this script runs (see contact.html).
  var APPS_SCRIPT_URL = window.SFS_FORM_ENDPOINT || '';

  function wireContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');
    var originalLabel = btn ? btn.textContent : 'Send';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!APPS_SCRIPT_URL) {
        status.textContent = 'Form endpoint not configured. Email stanfordfounders@stanford.edu instead.';
        status.className = 'form-status err';
        return;
      }
      status.textContent = 'Sending…';
      status.className = 'form-status';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      var data = new FormData(form);
      var params = new URLSearchParams();
      data.forEach(function (v, k) { params.append(k, v); });

      fetch(APPS_SCRIPT_URL + '?' + params.toString(), { method: 'GET', mode: 'no-cors' })
        .then(function () {
          status.textContent = 'Sent. We\'ll be in touch.';
          status.className = 'form-status ok';
          form.reset();
          if (btn) { btn.textContent = 'Sent'; }
          setTimeout(function () {
            if (btn) { btn.disabled = false; btn.textContent = originalLabel; }
          }, 2000);
        })
        .catch(function () {
          status.textContent = 'Error. Try again, or email stanfordfounders@stanford.edu.';
          status.className = 'form-status err';
          if (btn) { btn.disabled = false; btn.textContent = 'Try again'; }
        });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    reveals();
    Promise.all([
      load('header-placeholder', 'header.html'),
      load('footer-placeholder', 'footer.html')
    ]).then(function () {
      activeLink();
      mobileNav();
      footerYear();
      wireContactForm();
    });
  });
})();
