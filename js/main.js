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

  const add = (product, qty = 1) => {
    const items = get();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx >= 0) items[idx].quantity += qty;
    else items.push({ ...product, quantity: qty });
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
    const link = el.closest('.nav-cart');
    if (link) link.setAttribute('aria-label', n === 0 ? 'View basket' : `View basket (${n} item${n === 1 ? '' : 's'})`);
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

  const scrollTopBtn = document.getElementById('scrollTop');
  const floatingBtn  = document.querySelector('.floating-shop-btn');
  const heroEl       = document.querySelector('.hero');

  const updateFloating = () => {
    if (!floatingBtn) return;
    const past = heroEl ? heroEl.getBoundingClientRect().bottom < 0 : window.scrollY > 300;
    floatingBtn.classList.toggle('hero-gone', past);
  };

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    if (navMenu && navMenu.classList.contains('open')) closeNav();
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
    updateFloating();
  }, { passive: true });

  updateFloating();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

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

  /* ── Qty selector (shop page) ───────────────────────────── */
  const qtyDec = document.getElementById('qtyDec');
  const qtyInc = document.getElementById('qtyInc');
  const qtyVal = document.getElementById('qtyVal');

  if (qtyDec && qtyInc && qtyVal) {
    const setQtyDisplay = (n) => {
      qtyVal.textContent = n;
      qtyVal.setAttribute('aria-label', `Quantity: ${n}`);
      qtyDec.disabled = n <= 1;
    };

    qtyDec.addEventListener('click', () => {
      const current = parseInt(qtyVal.textContent, 10) || 1;
      setQtyDisplay(Math.max(1, current - 1));
    });
    qtyInc.addEventListener('click', () => {
      const current = parseInt(qtyVal.textContent, 10) || 1;
      setQtyDisplay(current + 1);
    });
  }

  /* ── Add to Bag ──────────────────────────────────────────── */
  document.querySelectorAll('.js-add-bag').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (btn.classList.contains('btn-confirmed')) return;

      const qtyEl = document.getElementById('qtyVal');
      const selectedQty = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;

      Cart.add({
        id:     btn.dataset.productId    || 'zoor-beard-oil',
        name:   btn.dataset.productName  || 'ZOOR Beard Oil',
        volume: btn.dataset.productVolume || '30ml',
        image:  btn.dataset.productImage || 'product%20zoor.jpeg',
        price:  btn.dataset.productPrice ? parseFloat(btn.dataset.productPrice) : null
      }, selectedQty);

      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<span class="btn-confirm-inner"><svg class="btn-confirm-check" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3,10 8,15 17,5"/></svg>Added!</span>`;
      btn.classList.add('btn-confirmed');

      flyCartToBadge(btn);
      showToast();

      const qtyResetEl = document.getElementById('qtyVal');
      const qtyDecEl   = document.getElementById('qtyDec');
      if (qtyResetEl) { qtyResetEl.textContent = '1'; qtyResetEl.setAttribute('aria-label', 'Quantity: 1'); }
      if (qtyDecEl)   { qtyDecEl.disabled = true; }

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('btn-confirmed');
      }, 2000);
    });
  });

  function showToast() {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove('show'), 3200);
  }

  function flyCartToBadge(sourceBtn) {
    const badgeEl = document.getElementById('cartBadge');
    if (!badgeEl) return;

    const btnRect    = sourceBtn.getBoundingClientRect();
    const badgeRect  = badgeEl.getBoundingClientRect();
    const startX     = btnRect.left + btnRect.width / 2;
    const startY     = btnRect.top  + btnRect.height / 2;
    const dx         = (badgeRect.left + badgeRect.width  / 2) - startX;
    const dy         = (badgeRect.top  + badgeRect.height / 2) - startY;

    const fly = document.createElement('div');
    fly.className = 'cart-fly';
    fly.setAttribute('aria-hidden', 'true');
    fly.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
    fly.style.left = startX + 'px';
    fly.style.top  = startY + 'px';
    fly.style.setProperty('--dx', dx + 'px');
    fly.style.setProperty('--dy', dy + 'px');
    document.body.appendChild(fly);

    requestAnimationFrame(() => fly.classList.add('cart-fly-active'));

    fly.addEventListener('animationend', () => {
      fly.remove();
      badgeEl.classList.remove('badge-pop');
      void badgeEl.offsetWidth;
      badgeEl.classList.add('badge-pop');
      setTimeout(() => badgeEl.classList.remove('badge-pop'), 600);
    }, { once: true });
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
  const formArea    = document.getElementById('formArea');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm && formArea && formSuccess) {
    const fields = ['name', 'email', 'message'];

    const showErr = (id, msg) => {
      const field = document.getElementById(id);
      const err   = document.getElementById(id + '-error');
      field.setAttribute('aria-invalid', 'true');
      if (err) { err.textContent = msg; err.hidden = false; }
    };
    const clearErr = (id) => {
      const field = document.getElementById(id);
      const err   = document.getElementById(id + '-error');
      field.removeAttribute('aria-invalid');
      if (err) err.hidden = true;
    };

    fields.forEach(id => {
      document.getElementById(id).addEventListener('input', () => clearErr(id));
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      fields.forEach(clearErr);

      const nameVal  = document.getElementById('name').value.trim();
      const emailVal = document.getElementById('email').value.trim();
      const msgVal   = document.getElementById('message').value.trim();
      let firstInvalid = null;

      if (!nameVal) { showErr('name', 'Please enter your name.'); firstInvalid = firstInvalid || document.getElementById('name'); }
      if (!emailVal) { showErr('email', 'Please enter your email address.'); firstInvalid = firstInvalid || document.getElementById('email'); }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) { showErr('email', 'Please enter a valid email address.'); firstInvalid = firstInvalid || document.getElementById('email'); }
      if (!msgVal) { showErr('message', 'Please enter your message.'); firstInvalid = firstInvalid || document.getElementById('message'); }

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
    const fmt = (p) => p != null ? '£' + p.toFixed(2) : 'Price TBC';
    const say = (msg) => {
      const el = document.getElementById('cartAnnounce');
      if (!el) return;
      el.textContent = '';
      setTimeout(() => { el.textContent = msg; }, 10);
    };

    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <h2 tabindex="-1">Your basket is empty</h2>
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
            <button class="cart-qty-btn js-qty-dec" data-id="${item.id}" aria-label="Decrease quantity of ${item.name}">−</button>
            <span class="cart-qty-val" aria-label="Quantity: ${item.quantity}">${item.quantity}</span>
            <button class="cart-qty-btn js-qty-inc" data-id="${item.id}" aria-label="Increase quantity of ${item.name}">+</button>
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
        const newQty = item.quantity - 1;
        if (newQty > 0) Cart.setQty(btn.dataset.id, newQty);
        else Cart.remove(btn.dataset.id);
        renderCart(container);
        say(newQty > 0 ? `Quantity updated to ${newQty}` : `${item.name} removed from basket`);
      });
    });

    container.querySelectorAll('.js-qty-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = Cart.get().find(i => i.id === btn.dataset.id);
        if (item) {
          Cart.setQty(btn.dataset.id, item.quantity + 1);
          renderCart(container);
          say(`Quantity updated to ${item.quantity + 1}`);
        }
      });
    });

    container.querySelectorAll('.js-cart-remove').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const item = Cart.get().find(i => i.id === btn.dataset.id);
        Cart.remove(btn.dataset.id);
        renderCart(container);
        say(`${item ? item.name : 'Item'} removed from basket`);
        const nextBtns = container.querySelectorAll('.js-cart-remove');
        if (nextBtns.length > 0) {
          nextBtns[Math.min(idx, nextBtns.length - 1)].focus();
        } else {
          const heading = container.querySelector('h2[tabindex="-1"]');
          if (heading) heading.focus();
        }
      });
    });
  }

});
