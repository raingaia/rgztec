// apps/web/public/assets/js/card.js
const ABS_BASE = '/rgztec/apps/web/public/';
const abs = (p='') => /^https?:|^\/rgztec\//.test(p) ? p : (ABS_BASE + p.replace(/^\.?\//,''));
const usd = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});

export function renderCard(p){
  const img = abs(p.thumb || 'assets/img/placeholder.png');
  const title = (p.title||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const desc  = (p.desc||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const price = usd.format(Number(p.price||0));

  return `
  <div class="card rgz-card" data-id="${p.id}">
    <div class="rgz-media">
      <img loading="lazy" src="${img}" alt="${title}"
           onerror="this.onerror=null;this.src='${abs('assets/img/placeholder.png')}'">
      <button class="rgz-wish" type="button" aria-label="Add to wishlist">❤</button>
      <button class="rgz-quick" type="button" aria-label="Quick view">Quick view</button>
    </div>
    <div class="pad rgz-body">
      <div class="title rgz-title">${title}</div>
      <p class="sub rgz-desc">${desc}</p>
      <div class="row rgz-row">
        <span class="price rgz-price">${price}</span>
        <a class="btn rgz-btn" href="product.html?id=${encodeURIComponent(p.id)}">Details</a>
      </div>
    </div>
  </div>`;
}

export function mountCardInteractions(rootEl = document){
  // wishlist toggle
  rootEl.addEventListener('click', (e)=>{
    const btn = e.target.closest('.rgz-wish');
    if(!btn) return;
    const wrap = btn.closest('.rgz-card');
    const id = wrap?.dataset?.id;
    btn.classList.toggle('on');
    console.log('[wishlist]', id, btn.classList.contains('on'));
  });

  // quick view (basit)
  rootEl.addEventListener('click', (e)=>{
    const btn = e.target.closest('.rgz-quick');
    if(!btn) return;
    const title = btn.closest('.rgz-card')?.querySelector('.rgz-title')?.textContent || 'Product';
    alert('Quick view: ' + title);
  });
}
