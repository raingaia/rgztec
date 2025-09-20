/* RGZTEC • cart logic (drop-in, backendless) */
(function(){
  const ROOT = 'https://raingaia.github.io/rgztec/apps/web/public/';
  const usd = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
  const esc = s => String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  // localStorage anahtar adayları (hangisi varsa)
  const KEYS = ['rgz-cart','cart','cartItems'];

  function readCart(){
    for(const k of KEYS){
      try{
        const raw = localStorage.getItem(k);
        if(raw){
          const arr = JSON.parse(raw);
          if(Array.isArray(arr)) return arr;
        }
      }catch(e){}
    }
    return [];
  }
  function writeCart(items){
    localStorage.setItem('rgz-cart', JSON.stringify(items||[]));
  }

  function lineTotal(it){ return (Number(it.price||0) * Number(it.qty||1)) || 0; }
  function subtotal(items){ return items.reduce((a,x)=>a+lineTotal(x),0); }

  function thumbUrl(x){
    const id = String(x.thumb||x.image||'').replace(/\.(png|jpe?g|webp)$/i,'') || 'placeholder';
    // assets ve assets%20 için iki varyant – <img onerror> ile fallback
    return ROOT + 'assets/thumbs/' + id + '.png';
  }

  const elItems = document.getElementById('cartItems');
  const elSub   = document.getElementById('sumSubtotal');
  const elTot   = document.getElementById('sumTotal');
  const elBtn   = document.getElementById('btnCheckout');
  const elEmpty = document.getElementById('emptyState');

  let items = readCart();

  function render(){
    if(!items.length){
      elItems.innerHTML = '';
      elEmpty.hidden = false;
      elSub.textContent = usd.format(0);
      elTot.textContent = usd.format(0);
      elBtn.disabled = true;
      return;
    }
    elEmpty.hidden = true;
    elBtn.disabled = false;

    elItems.innerHTML = items.map((p,i)=>`
      <article class="item" data-i="${i}">
        <div class="thumb">
          <img loading="lazy"
               src="${thumbUrl(p)}"
               onerror="this.onerror=null;this.src='${ROOT}assets%20/thumbs/${(p.thumb||p.image||'placeholder').replace(/\.(png|jpe?g|webp)$/i,'')||'placeholder'}.png'">
        </div>
        <div class="meta">
          <div class="title">${esc(p.title||'Untitled')}</div>
          <div class="sku">SKU: ${esc(p.sku||p.id||'-')}</div>
          <div class="qty">
            <button type="button" class="dec" aria-label="Decrease quantity">−</button>
            <input type="text" inputmode="numeric" pattern="[0-9]*" value="${Number(p.qty||1)}" aria-label="Quantity">
            <button type="button" class="inc" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="actions">
          <div class="price">${usd.format(Number(p.price||0))}</div>
          <button class="remove" type="button">Remove</button>
        </div>
      </article>
    `).join('');

    bindRowEvents();
    updateSummary();
  }

  function bindRowEvents(){
    elItems.querySelectorAll('.item').forEach(row=>{
      const idx = Number(row.dataset.i);
      const input = row.querySelector('input');
      row.querySelector('.inc')?.addEventListener('click', ()=>{
        items[idx].qty = Number(items[idx].qty||1) + 1;
        writeCart(items); render();
      });
      row.querySelector('.dec')?.addEventListener('click', ()=>{
        const q = Math.max(1, Number(items[idx].qty||1) - 1);
        items[idx].qty = q; writeCart(items); render();
      });
      input?.addEventListener('change', ()=>{
        const v = Math.max(1, parseInt(input.value||'1',10)||1);
        items[idx].qty = v; writeCart(items); render();
      });
      row.querySelector('.remove')?.addEventListener('click', ()=>{
        items.splice(idx,1); writeCart(items); render();
      });
    });
  }

  function updateSummary(){
    const sub = subtotal(items);
    elSub.textContent = usd.format(sub);
    elTot.textContent = usd.format(sub); // vergiyi checkout’a bırakıyoruz
  }

  elBtn?.addEventListener('click', ()=>{
    // Eğer bir Payment Link’imiz yoksa bilgi ver
    const link = localStorage.getItem('rgz-payment-link');
    if(link){ location.href = link; return; }
    alert('Demo checkout: Backend / ödeme entegrasyonu yapılandırılmadı.\n\nSepet JSON’u console’a yazıldı.');
    console.log('RGZTEC CART →', items);
  });

  render();
})();
