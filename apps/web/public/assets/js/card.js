/* RGZTEC • Cart (localStorage + gift-card + real checkout) */
(function () {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  /* -------------------- CONFIG -------------------- */
  // Backend kökü: <meta name="rgztec-api" content="https://your-api.vercel.app"> ile override edilir
  const API_BASE =
    document.querySelector('meta[name="rgztec-api"]')?.content ||
    window.RGZTEC_API ||
    ''; // aynı domainde barındırıyorsan boş bırak
  const CHECKOUT_ENDPOINT = (API_BASE ? API_BASE.replace(/\/$/, '') : '') + '/api/checkout';

  // Storage key
  const KEY = 'rgz_cart_v1';

  // Currency formatter
  const money = (amount = 0, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount) || 0);

  /* -------------------- DEV SEED (isteğe bağlı) -------------------- */
  function seedIfEmpty() {
    // sadece localhost veya ?seed=1 iken doldur
    const isDev = /localhost|127\.0\.0\.1/.test(location.hostname) || /[?&]seed=1\b/.test(location.search);
    if (!isDev) return;

    const cur = localStorage.getItem(KEY);
    if (cur) return;
    const demo = [
      {
        id: 'icon-200',
        title: '200 Icon Pack',
        sku: 'ICON-PAK',
        price: 24.0,
        qty: 2,
        thumb: 'https://raingaia.github.io/rgztec/apps/web/public/assets/thumbs/placeholder.png',
      },
      {
        id: 'tpl-001',
        title: 'Landing Page Template',
        sku: 'TPL-001',
        price: 29.0,
        qty: 1,
        thumb: 'https://raingaia.github.io/rgztec/apps/web/public/assets/thumbs/placeholder.png',
      },
      // örnek gift card görmek için yorumdan çıkar:
      // { type:'gift-card', currency:'USD', amount:50, to:{email:'demo@rgztec.com'}, from:'Demo' }
    ];
    localStorage.setItem(KEY, JSON.stringify(demo));
  }

  /* -------------------- Storage helpers -------------------- */
  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch (_e) {
      return [];
    }
  }
  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  // line total (gift-card: amount; normal ürün: price*qty)
  function lineTotal(it) {
    if (it?.type === 'gift-card') return Number(it.amount) || 0;
    return (Number(it.price) || 0) * (Number(it.qty) || 1);
  }

  /* -------------------- Render -------------------- */
  function render() {
    const box = $('#cartItems');
    const empty = $('#emptyState');
    const items = load();

    if (!items.length) {
      if (box) box.innerHTML = '';
      if (empty) empty.hidden = false;
      updateTotals();
      toggleCheckoutDisabled(true);
      return;
    }
    if (empty) empty.hidden = true;

    if (box) {
      box.innerHTML = items
        .map((it, idx) => {
          // Gift card görünümü
          if (it?.type === 'gift-card') {
            const to = it.to?.email || it.to?.name || '-';
            const metaBits = [
              to ? `To: ${escapeHtml(String(to))}` : '',
              it.deliveryDate ? `Delivery: ${escapeHtml(String(it.deliveryDate))}` : '',
            ].filter(Boolean);
            return `
          <article class="item gift" data-idx="${idx}">
            <div class="thumb gift" aria-hidden="true">🎁</div>
            <div>
              <div class="tit">RGZTEC Gift Card</div>
              <div class="sku">${metaBits.join(' • ') || 'Gift card'}</div>
              <div class="actions">
                <button class="rem" aria-label="Remove">Remove</button>
              </div>
            </div>
            <div class="price">${money(it.amount, it.currency || 'USD')}</div>
          </article>`;
          }

          // Normal ürün görünümü
          return `
        <article class="item" data-idx="${idx}">
          <div class="thumb"><img alt="${escapeHtml(it.title)}" src="${it.thumb || ''}"></div>
          <div>
            <div class="tit">${escapeHtml(it.title)}</div>
            <div class="sku">SKU: ${escapeHtml(it.sku || '-')}</div>
            <div class="actions">
              <div class="qty">
                <button class="dec" aria-label="Decrease">−</button>
                <input class="q" value="${it.qty || 1}" inputmode="numeric" aria-label="Quantity">
                <button class="inc" aria-label="Increase">+</button>
              </div>
              <button class="rem" aria-label="Remove">Remove</button>
            </div>
          </div>
          <div class="price">${money((it.price || 0) * (it.qty || 1), 'USD')}</div>
        </article>`;
        })
        .join('');
    }

    // events
    $$('.item').forEach((el) => {
      const idx = Number(el.dataset.idx);
      const it = load()[idx];

      // Only normal items have qty controls
      const inc = $('.inc', el);
      const dec = $('.dec', el);
      const qEl = $('.q', el);

      if (inc) inc.addEventListener('click', () => changeQty(idx, +1));
      if (dec) dec.addEventListener('click', () => changeQty(idx, -1));
      if (qEl) qEl.addEventListener('change', () => setQty(idx, Number(qEl.value || 1)));

      $('.rem', el)?.addEventListener('click', () => removeAt(idx));
    });

    updateTotals();
    toggleCheckoutDisabled(false);
  }

  function changeQty(idx, delta) {
    const items = load();
    const it = items[idx];
    if (!it || it?.type === 'gift-card') return; // gift-card qty yok
    it.qty = Math.max(1, (Number(it.qty) || 1) + delta);
    save(items);
    render();
  }

  function setQty(idx, q) {
    const items = load();
    const it = items[idx];
    if (!it || it?.type === 'gift-card') return; // gift-card qty yok
    it.qty = Math.max(1, Number.isFinite(q) ? q : 1);
    save(items);
    render();
  }

  function removeAt(idx) {
    const items = load();
    items.splice(idx, 1);
    save(items);
    render();
  }

  function updateTotals() {
    const items = load();
    const sub = items.reduce((a, b) => a + lineTotal(b), 0);
    $('#sumSubtotal') && ($('#sumSubtotal').textContent = money(sub, 'USD'));
    $('#sumTotal') && ($('#sumTotal').textContent = money(sub, 'USD')); // vergiyi checkout'ta hesaplarız
  }

  function toggleCheckoutDisabled(disabled) {
    const btn = $('#btnCheckout');
    if (!btn) return;
    if (disabled) btn.setAttribute('disabled', 'disabled');
    else btn.removeAttribute('disabled');
  }

  /* -------------------- REAL CHECKOUT -------------------- */
  function serializeForCheckout(items) {
    return items.map((it) => {
      if (it?.type === 'gift-card') {
        return {
          id: it.id || 'gift-card',
          type: 'gift-card',
          title: 'RGZTEC Gift Card',
          price: Number(it.amount) || 0, // cent’e çevirme backend’de
          qty: 1,
          sku: it.sku || 'GFT-CARD',
          to: it.to || {},
          from: it.from || '',
          message: it.message || '',
          delivery_date: it.deliveryDate || it.delivery_date || '',
          currency: it.currency || 'USD',
        };
      }
      // normal product
      return {
        id: it.id,
        type: 'product',
        title: it.title,
        price: Number(it.price) || 0,
        qty: Number(it.qty) || 1,
        sku: it.sku || it.id || '',
        currency: it.currency || 'USD',
      };
    });
  }

  async function goCheckout() {
    const items = load();
    if (!items.length) return alert('Your cart is empty.');

    const btn = $('#btnCheckout');
    btn?.setAttribute('disabled', 'disabled');
    btn?.classList.add('loading');

    try {
      const payload = { items: serializeForCheckout(items) };
      const r = await fetch(CHECKOUT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok || !data?.url) {
        const msg = data?.error || `Checkout failed (${r.status})`;
        throw new Error(msg);
      }

      // Stripe Checkout’a yönlendir
      location.href = data.url;
    } catch (err) {
      console.error(err);
      alert(err?.message || String(err) || 'Checkout error');
      btn?.removeAttribute('disabled');
      btn?.classList.remove('loading');
    }
  }

  $('#btnCheckout')?.addEventListener('click', goCheckout);

  // init
  seedIfEmpty();
  render();
})();
