/* RGZTEC • Cart logic (assets + assets%20 aware) */

const USD = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
const CART_KEY = 'rgztec_cart';

/* if base is set, use it to build fallbacks */
const BASE = document.querySelector('base')?.href || location.origin + location.pathname.replace(/[^/]*$/,'');

/* helpers */
const $ = s => document.querySelector(s);
const esc = s => String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/* storage */
function readCart(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  }catch{ return []; }
}
function saveCart(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

/* image url with assets%20 fallback */
function thumbURL(filename){
  const id = String(filename||'').replace(/\.(png|jpe?g|webp)$/i,'') || 'placeholder';
  return {
    primary: BASE + `assets/thumbs/${id}.png`,
    fallback: BASE + `assets%20/thumbs/${id}.png`
  };
}

/* render */
function render(){
  const list = readCart();
  const wrap = $('#cartItems');
  const empty = $('#emptyState');

  // skeleton off
  wrap.innerHTML = '';

  if(!list.length){
    empty.hidden = false;
    updateSummary(0);
    return;
  }
  empty.hidden = true;

  const html = list.map(item=>{
    const {primary,fallback} = thumbURL(item.thumb || item.id);
    const price = Number(item.price||0);
    const qty = Math.max(1, Math.min(99, Number(item.qty||1)));

    return `
      <article class="item" data-id="${esc(item.id)}">
        <div class="thumb">
          <img loading="lazy" src="${primary}" alt="${esc(item.title)}"
               onerror="this.onerror=null;this.src='${fallback}'">
        </div>

        <div class="info">
          <h3 class="title">${esc(item.title)}</h3>
          ${item.sku ? `<p class="sku">SKU: ${esc(item.sku)}</p>` : ``}
          ${item.desc ? `<p class="meta">${esc(item.desc)}</p>` : ``}
        </div>

        <div class="right">
          <div class="price">${USD.format(price * qty)}</div>
          <label class="qty" aria-label="Quantity">
            <button type="button" class="dec" aria-label="Decrease">−</button>
            <input type="text" inputmode="numeric" pattern="[0-9]*" value="${qty}" aria-label="Quantity input">
            <button type="button" class="inc" aria-label="Increase">+</button>
          </label>
          <button type="button" class="remove">Remove</button>
        </div>
      </article>
    `;
  }).join('');

  wrap.innerHTML = html;

  // bind events
  wrap.querySelectorAll('.item').forEach(row=>{
    const id = row.dataset.id;
    const input = row.querySelector('input');
    const priceEl = row.querySelector('.price');

    function sync(newQty){
      const items = readCart();
      const it = items.find(x=>String(x.id)===String(id));
      if(!it) return;
      it.qty = Math.max(1, Math.min(99, Number(newQty||1)));
      saveCart(items);
      priceEl.textContent = USD.format(Number(it.price||0) * it.qty);
      updateSummary(items.reduce((s,x)=>s + Number(x.price||0)*Math.max(1,Number(x.qty||1)), 0));
      input.value = it.qty;
    }

    row.querySelector('.dec').addEventListener('click', ()=> sync(Number(input.value||1) - 1));
    row.querySelector('.inc').addEventListener('click', ()=> sync(Number(input.value||1) + 1));
    input.addEventListener('input',  ()=> {
      const v = input.value.replace(/[^\d]/g,'').slice(0,2);
      input.value = v; // keep display numeric
    });
    input.addEventListener('change', ()=> sync(Number(input.value||1)));

    row.querySelector('.remove').addEventListener('click', ()=>{
      const items = readCart().filter(x=>String(x.id)!==String(id));
      saveCart(items);
      if(items.length){ render(); } else { render(); } // full re-render
    });
  });

  // summary
  const subtotal = list.reduce((s,x)=> s + Number(x.price||0)*Math.max(1, Number(x.qty||1)), 0);
  updateSummary(subtotal);
}

function updateSummary(subtotal){
  $('#sumSubtotal').textContent = USD.format(subtotal);
  $('#sumTotal').textContent = USD.format(subtotal); // taxes at checkout
}

/* checkout */
$('#btnCheckout')?.addEventListener('click', ()=>{
  const items = readCart();
  if(!items.length){
    alert('Your cart is empty.');
    return;
  }
  // Payment link yoksa bilgi ver; varsa yönlendir
  const PAYMENT_LINK = window.RGZTEC_PAYMENT_LINK || '';
  if(PAYMENT_LINK){
    location.href = PAYMENT_LINK;
  }else{
    alert('No backend configured. This would open a Payment Link in production.');
  }
});

/* seed demo (isteğe bağlı): ?seed=1 eklenirse örnek doldurur */
(function seed(){
  const url = new URL(location.href);
  if(url.searchParams.get('seed')==='1' && !readCart().length){
    saveCart([
      {id:'icon-pack-200', title:'200 Icon Pack', sku:'ICON-PAK', price:24, qty:2, thumb:'icon-pack'},
      {id:'tpl-001', title:'Landing Page Template', sku:'TPL-001', price:29, qty:1, thumb:'landing-starter'}
    ]);
  }
})();

/* go */
document.addEventListener('DOMContentLoaded', render);

