/* RGZTEC • Cart (localStorage + gift-card support) */
(function () {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  // Storage key
  const KEY = 'rgz_cart_v1';

  // Currency formatter
  const money = (amount = 0, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount) || 0);

  // Seed demo items if cart empty (dev only)
  function seedIfEmpty() {
    const cur = localStorage.getItem(KEY);
    if (cur) return;
    const demo = [
      {
        id: 'icon-200',
        title: '200 Icon Pack',
        sku: 'ICON-PAK',
        price: 24.0,
        qty: 2,
        thumb:
          'https://raingaia.github.io/rgztec/apps/web/public/assets/thumbs/placeholder.png',
      },
      {
        id: 'tpl-001',
        title: 'Landing Page Template',
        sku: 'TPL-001',
        price: 29.0,
        qty: 1,
        thumb:
          'https://raingaia.github.io/rgztec/apps/web/public/assets/thumbs/placeholder.png',
      },
      // örnek hediye kartı (görmek isterseniz yorumu kaldırın)
      // { type:'gift-card', currency:'USD', amount:50, to:{email:'demo@rgztec.com'}, from:'Demo' }
    ];
    localStorage.setItem(KEY, JSON.stringify(demo));
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch (e) {
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

  function render() {
    const box = $('#cartItems');
    const empty = $('#emptyState');
    const items = load();

    if (!items.length) {
      box.innerHTML = '';
      empty.hidden = false;
      updateTotals();
      return;
    }
    empty.hidden = true;

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
    $('#sumSubtotal').textContent = money(sub, 'USD');
    $('#sumTotal').textContent = money(sub, 'USD'); // vergiyi checkout'ta hesaplarız
  }

  $('#btnCheckout')?.addEventListener('click', () => {
    // Backend yoksa burada Payment Link’e yönlendir veya uyarı göster
    alert('Demo checkout — backend yok.');
  });

  // init
  seedIfEmpty();
  render();
})();
