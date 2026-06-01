/* ── ZOOR – Main JS ──────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar: scroll behaviour & toggle ──────────────────── */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  const closeNav = () => {
    navToggle.classList.remove('open');
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    if (navMenu && navMenu.classList.contains('open')) closeNav();
  }, { passive: true });

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(navMenu.classList.contains('open')));
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeNav);
    });
  }

  /* ── Active nav link ─────────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Hero Ken Burns on load ──────────────────────────────── */
  const hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(() => hero.classList.add('loaded'));
  }

  /* ── Scroll fade-in (IntersectionObserver) ───────────────── */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(el => io.observe(el));
  }

  /* ── Add to Bag toast ────────────────────────────────────── */
  const addBagBtns = document.querySelectorAll('.js-add-bag');
  const toast = document.getElementById('toast');

  if (addBagBtns.length && toast) {
    let toastTimer;
    addBagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
      });
    });
  }

  /* ── Cookie consent ──────────────────────────────────────── */
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    const accepted = localStorage.getItem('zoor_cookies_accepted');
    if (!accepted) {
      setTimeout(() => banner.classList.add('visible'), 1200);
    } else {
      banner.classList.add('hidden');
    }

    const acceptBtn = document.getElementById('cookieAccept');
    const declineBtn = document.getElementById('cookieDecline');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('zoor_cookies_accepted', 'true');
        banner.classList.remove('visible');
        setTimeout(() => banner.classList.add('hidden'), 400);
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        localStorage.setItem('zoor_cookies_accepted', 'declined');
        banner.classList.remove('visible');
        setTimeout(() => banner.classList.add('hidden'), 400);
      });
    }
  }

  /* ── Contact form validation & submit ───────────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const showError = (id, msg) => {
      const field = document.getElementById(id);
      const err   = document.getElementById(id + '-error');
      field.setAttribute('aria-invalid', 'true');
      err.textContent = msg;
      err.hidden = false;
    };

    const clearError = (id) => {
      const field = document.getElementById(id);
      const err   = document.getElementById(id + '-error');
      field.removeAttribute('aria-invalid');
      err.hidden = true;
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      ['name', 'email', 'message'].forEach(clearError);

      const nameVal  = document.getElementById('name').value.trim();
      const emailVal = document.getElementById('email').value.trim();
      const msgVal   = document.getElementById('message').value.trim();
      let firstInvalid = null;

      if (!nameVal) {
        showError('name', 'Please enter your name.');
        firstInvalid = firstInvalid || document.getElementById('name');
      }
      if (!emailVal) {
        showError('email', 'Please enter your email address.');
        firstInvalid = firstInvalid || document.getElementById('email');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        showError('email', 'Please enter a valid email address.');
        firstInvalid = firstInvalid || document.getElementById('email');
      }
      if (!msgVal) {
        showError('message', 'Please enter your message.');
        firstInvalid = firstInvalid || document.getElementById('message');
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const btn = contactForm.querySelector('[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Message Sent';
      btn.disabled = true;
      btn.classList.add('js-submitted');
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        btn.classList.remove('js-submitted');
        contactForm.reset();
      }, 3500);
    });
  }

});
