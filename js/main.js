/* ── ZOOR – Main JS ──────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar: scroll behaviour & toggle ──────────────────── */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
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

  /* ── Contact form placeholder submit ────────────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Message Sent';
      btn.disabled = true;
      btn.style.background = '#2a7a2a';
      btn.style.borderColor = '#2a7a2a';
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        btn.style.background = '';
        btn.style.borderColor = '';
        contactForm.reset();
      }, 3500);
    });
  }

});
