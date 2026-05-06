/**
 * components.js: loads shared header/footer, marks the active nav link,
 * and wires the contact form to the Google Apps Script endpoint.
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
    var links = document.querySelectorAll('nav.primary .links a');
    links.forEach(function (a) {
      if ((a.dataset.page || '').toLowerCase() === page) {
        a.classList.add('active');
      }
    });
  }

  function wireMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.getElementById('primary-nav-links');
    var backdrop = document.querySelector('.nav-backdrop');
    if (!toggle || !links || !backdrop) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      links.classList.toggle('is-open', open);
      backdrop.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-locked', open);
      if (open) {
        backdrop.removeAttribute('hidden');
      } else {
        // Hide backdrop after fade-out so it doesn't intercept clicks.
        setTimeout(function () {
          if (!backdrop.classList.contains('is-open')) {
            backdrop.setAttribute('hidden', '');
          }
        }, 250);
      }
    }

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!open);
    });
    backdrop.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
      }
    });
    // Close drawer when a link inside it is tapped, so the drawer
    // doesn't briefly remain visible on top of the next page during
    // a same-tab navigation.
    links.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== links) {
        if (t.tagName === 'A') { setOpen(false); break; }
        t = t.parentNode;
      }
    });
    // If the viewport grows back to desktop while the drawer is open,
    // close it so the desktop nav layout isn't stuck in mobile state.
    var mq = window.matchMedia('(min-width: 881px)');
    var mqHandler = function (e) { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', mqHandler);
    else if (mq.addListener) mq.addListener(mqHandler);
  }

  // Apps Script endpoint owns rolling-membership + contact form rows.
  // Update this when the form integration is migrated to the new officer.
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
    Promise.all([
      load('header-placeholder', 'header.html'),
      load('footer-placeholder', 'footer.html')
    ]).then(function () {
      activeLink();
      wireMobileNav();
      wireContactForm();
    });
  });
})();
