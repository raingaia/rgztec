/* RGZTEC • Cart (localStorage demo) */
(function(){
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];
  const USD = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});

  // Basit storage anahtarı
  const KEY = 'rgz_cart_v1';

  // DEMO fallback – localStorage boşsa örnek doldur
  function seedIfEmpty(){
    const cur = localStorage.getItem(KEY);
    if (cur) return;
    const demo = [
      { id:'icon-200', title:'200 Icon Pack', sku:'ICON-PAK', price:24.00, qty:2,
        thumb:'https://raingaia.github.io/rgztec/apps/web/public/assets/thumbs/placeholder.png' },
      { id:'tpl-001', title:'Landing Page Template', sku:'TPL-001', price:29.00, qty:1,
        thumb:'https://raingaia.github.io/rgztec/apps/web/public/assets/thumbs/placeholder.png' },
    ];
    localStorage.setItem(KEY, JSON.stringify(demo));
  }

  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }catch(e){ return []; } }
  function save(items){ localStorage.setItem(KEY, JSON.stringify(items)); }

  function render(){
    const box = $('#cartItems');
    const empty = $('#emptyState');
    const items = load();

    if (!items.length){
      box.innerHTML = '';
      empty.hidden = false;
      updateTotals();
      return;
    }
    empty.hidden = true;

    box.innerHTML = items.map(it => `
      <article class="item" data-id="${it.id}">
        <div class="thumb"><img alt="${escapeHtml(it.title)}" src="${it.thumb||''}"></div>
        <div>
          <div class="tit">${escapeHtml(it.title)}</div>
          <div class="sku">SKU: ${escapeHtml(it.sku||'-')}</div>
          <div class="actions">
            <div class="qty">
              <button class="dec" aria-label="Decrease">−</button>
              <input class="q" value="${it.qty||1}" inputmode="numeric">
              <button class="inc" aria-label="Increase">+</button>
            </div>
            <button class="rem" aria-label="Remove">Remove</button>
          </div>
        </div>
        <div class="price">${USD.format((it.price||0)*(it.qty||1))}</div>
      </article>
    `).join('');

    // events
    $$('.item').forEach(el=>{
      const id = el.dataset.id;
      const qEl = $('.q', el);

      $('.inc', el).addEventListener('click', ()=> changeQty(id, +1));
      $('.dec', el).addEventListener('click', ()=> changeQty(id, -1));
      qEl.addEventListener('change', ()=> setQty(id, Number(qEl.value||1)));
      $('.rem', el).addEventListener('click', ()=> removeItem(id));
    });

    updateTotals();
  }

  function changeQty(id, delta){
    const items = load();
    const it = items.find(x=>x.id===id);
    if (!it) return;
    it.qty = Math.max(1, (it.qty||1) + delta);
    save(items); render();
  }
  function setQty(id, q){
    const items = load();
    const it = items.find(x=>x.id===id);
    if (!it) return;
    it.qty = Math.max(1, isFinite(q)? q : 1);
    save(items); render();
  }
  function removeItem(id){
    const items = load().filter(x=>x.id!==id);
    save(items); render();
  }

  function updateTotals(){
    const items = load();
    const sub = items.reduce((a,b)=> a + (b.price||0)*(b.qty||1), 0);
    $('#sumSubtotal').textContent = USD.format(sub);
    $('#sumTotal').textContent = USD.format(sub); // vergiyi checkout'ta hesaplarız
  }

  function escapeHtml(s=''){
    return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  $('#btnCheckout').addEventListener('click', ()=>{
    // Placeholder: ödeme linkin varsa buraya koy
    // location.href = 'https://pay.rgztec.com/session/abc123';
    alert('Demo checkout — backend yok.');
  });

  // init
  seedIfEmpty();
  render();
})();
