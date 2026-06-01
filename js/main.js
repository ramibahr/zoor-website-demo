/* ── ZOOR – Main JS ──────────────────────────────────────── */

/* ── Cart ──────────────────────────────────────────────────── */
const Cart = (() => {
  const KEY = 'zoor_cart';

  const get = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  };

  const save = (items) => {
    localStorage.setItem(KEY, JSON.stringify(items));
    _badge();
  };

  const add = (product) => {
    const items = get();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx >= 0) items[idx].quantity += 1;
    else items.push({ ...product, quantity: 1 });
    save(items);
  };

  const remove = (id) => save(get().filter(i => i.id !== id));

  const setQty = (id, qty) => {
    const items = get();
    const item = items.find(i => i.id === id);
    if (item) { item.quantity = Math.max(1, qty); save(items); }
  };

  const totalItems = () => get().reduce((s, i) => s + i.quantity, 0);

  const _badge = () => {
    const el = document.getElementById('cartBadge');
    if (!el) return;
    const n = totalItems();
    el.textContent = n;
    el.hidden = n === 0;
  };

  return { get, add, remove, setQty, totalItems, updateBadge: _badge };
})();

document.addEventListener('DOMContentLoaded', () => {

  Cart.updateBadge();

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

  /* ── Add to Bag ──────────────────────────────────────────── */
  document.querySelectorAll('.js-add-bag').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (btn.classList.contains('btn-confirmed')) return;

      Cart.add({
        id:     btn.dataset.productId    || 'zoor-beard-oil',
        name:   btn.dataset.productName  || 'ZOOR Beard Oil',
        volume: btn.dataset.productVolume || '30ml',
        image:  btn.dataset.productImage || 'product%20zoor.jpeg',
        price:  btn.dataset.productPrice ? parseFloat(btn.dataset.productPrice) : null
      });

      const original = btn.textContent.trim();
      btn.textContent = '✓  Added!';
      btn.classList.add('btn-confirmed');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('btn-confirmed');
      }, 2000);
    });
  });

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
  const formArea    = document.getElementById('formArea');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm && formArea && formSuccess) {
    const fields = ['name', 'email', 'message'];

    const markInvalid = (id) => document.getElementById(id).setAttribute('aria-invalid', 'true');
    const clearInvalid = (id) => document.getElementById(id).removeAttribute('aria-invalid');

    fields.forEach(id => {
      document.getElementById(id).addEventListener('input', () => clearInvalid(id));
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      fields.forEach(clearInvalid);

      const nameVal  = document.getElementById('name').value.trim();
      const emailVal = document.getElementById('email').value.trim();
      const msgVal   = document.getElementById('message').value.trim();
      let firstInvalid = null;

      if (!nameVal)  { markInvalid('name');    firstInvalid = firstInvalid || document.getElementById('name'); }
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        markInvalid('email'); firstInvalid = firstInvalid || document.getElementById('email');
      }
      if (!msgVal)   { markInvalid('message'); firstInvalid = firstInvalid || document.getElementById('message'); }

      if (firstInvalid) { firstInvalid.focus(); return; }

      /* show success */
      formArea.hidden = true;
      formSuccess.removeAttribute('hidden');
      requestAnimationFrame(() => requestAnimationFrame(() => formSuccess.classList.add('visible')));

      setTimeout(() => {
        formSuccess.classList.remove('visible');
        setTimeout(() => {
          formSuccess.setAttribute('hidden', '');
          formArea.hidden = false;
          contactForm.reset();
        }, 450);
      }, 4000);
    });
  }

  /* ── Cart page renderer ──────────────────────────────────── */
  const cartContent = document.getElementById('cartContent');
  if (cartContent) renderCart(cartContent);

  function renderCart(container) {
    const items = Cart.get();
    const tbc = 'Price TBC';
    const fmt = (p) => p != null ? '£' + p.toFixed(2) : tbc;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <h2>Your basket is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <a href="shop.html" class="btn btn-primary" style="display:inline-block;margin-top:8px;">Shop Now</a>
        </div>`;
      return;
    }

    const rows = items.map(item => {
      const lineTotal = item.price != null ? item.price * item.quantity : null;
      return `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-img">
            <img src="${item.image}" alt="${item.name}" width="80" height="80" loading="lazy" />
          </div>
          <div class="cart-item-info">
            <p class="cart-item-name">${item.name}</p>
            <p class="cart-item-volume">${item.volume}</p>
            <p class="cart-item-price">${fmt(item.price)}</p>
          </div>
          <div class="cart-item-qty">
            <button class="cart-qty-btn js-qty-dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span class="cart-qty-val">${item.quantity}</span>
            <button class="cart-qty-btn js-qty-inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
          <div class="cart-item-total">${fmt(lineTotal)}</div>
          <button class="cart-remove js-cart-remove" data-id="${item.id}" aria-label="Remove ${item.name} from basket">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>`;
    }).join('');

    const hasPrice = items.every(i => i.price != null);
    const subtotal = hasPrice ? items.reduce((s, i) => s + i.price * i.quantity, 0) : null;
    const lockIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

    container.innerHTML = `
      <div class="cart-layout">
        <div class="cart-items">
          <div class="cart-items-header">
            <span></span>
            <span>Product</span>
            <span>Qty</span>
            <span style="text-align:right">Total</span>
            <span></span>
          </div>
          ${rows}
          <div class="cart-actions-row">
            <a href="shop.html" class="btn btn-outline" style="padding:12px 28px;font-size:0.72rem;">← Continue Shopping</a>
          </div>
        </div>
        <div class="cart-summary">
          <h2 class="cart-summary-title">Order Summary</h2>
          <div class="cart-summary-row">
            <span>Subtotal</span>
            <span>${fmt(subtotal)}</span>
          </div>
          <div class="cart-summary-row">
            <span>Shipping</span>
            <span class="cart-summary-shipping">Calculated at checkout</span>
          </div>
          <div class="cart-summary-divider"></div>
          <div class="cart-summary-total">
            <span>Total</span>
            <span>${fmt(subtotal)}</span>
          </div>
          <a href="STRIPE_CHECKOUT_LINK" class="btn btn-primary cart-checkout">Proceed to Checkout</a>
          <p class="cart-secure-note">${lockIcon} Secure checkout</p>
        </div>
      </div>`;

    container.querySelectorAll('.js-qty-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = Cart.get().find(i => i.id === btn.dataset.id);
        if (!item) return;
        if (item.quantity > 1) Cart.setQty(btn.dataset.id, item.quantity - 1);
        else Cart.remove(btn.dataset.id);
        renderCart(container);
      });
    });

    container.querySelectorAll('.js-qty-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = Cart.get().find(i => i.id === btn.dataset.id);
        if (item) Cart.setQty(btn.dataset.id, item.quantity + 1);
        renderCart(container);
      });
    });

    container.querySelectorAll('.js-cart-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        Cart.remove(btn.dataset.id);
        renderCart(container);
      });
    });
  }

});
