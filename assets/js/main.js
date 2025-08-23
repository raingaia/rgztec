/* RGZTEC – main.js (universal) */
/* -------------------------------------------------- */
/* 1) ROOT güvenli yol kurucu (GitHub Pages /rgztec/ altında her sayfada çalışır) */
const ROOT = (() => {
  const parts = location.pathname.split('/').filter(Boolean); // ["rgztec", ...]
  return parts.length ? `/${parts[0]}/` : '/';
})();
const url = (p) => ROOT + p;

/* 2) Yardımcılar */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const slugify = (s) => (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

/* 3) Header ve CTA bağları */
function wireHeader(){
  $('#y') && ($('#y').textContent = new Date().getFullYear());

  $$('.logo').forEach(a=>{
    a.addEventListener('click', (e)=>{ e.preventDefault(); location.href = url('index.html'); });
  });
  $('#btnSignIn')  && $('#btnSignIn').addEventListener('click', ()=> location.href = url('login.html'));
  $('#btnSell')    && $('#btnSell').addEventListener('click', ()=> location.href = url('advertise.html'));
  $('#lnkDemo')    && $('#lnkDemo').addEventListener('click', ()=> location.href = url('demo/index.html'));
  $('#lnkLogin')   && $('#lnkLogin').addEventListener('click',()=> location.href = url('login.html'));
  $('#lnkSeller')  && $('#lnkSeller').addEventListener('click',()=> location.href = url('advertise.html'));
  $('#ctaStart')   && $('#ctaStart').addEventListener('click', ()=> location.href = url('index.html#trending'));
  $('#ctaSeller')  && $('#ctaSeller').addEventListener('click',()=> location.href = url('advertise.html'));

  // Üst menü link düzeltmeleri
  $$('nav a.nav-link').forEach(a=>{
    const t=a.textContent.trim().toLowerCase();
    if(t==='categories') a.href = url('catalog/index.html');
    else if(t==='about') a.href = url('privacy.html');
    else if(t==='explore') a.href = url('index.html');
  });

  // Kısayol: Ctrl+Shift+A → admin
  window.addEventListener('keydown', (e)=>{
    const tag = (document.activeElement?.tagName||'').toLowerCase();
    if(e.key==='/' && !/input|textarea/.test(tag)){ e.preventDefault(); $('#q')?.focus(); }
    if(e.key.toLowerCase()==='a' && e.ctrlKey && e.shiftKey){ location.href = url('admin/index.html'); }
  });

  // Kategori barı → products
  $$('#cats a[data-prod]')?.forEach(a=>{
    a.addEventListener('click', ()=> location.href = url(`products/${a.dataset.prod}.html`));
  });
}

/* 4) Ürünleri JSON'dan yükle ve kartları oluştur */
async function renderGridFromJSON(){
  const grid = $('#grid'); if(!grid) return;

  // Eğer sayfa kendi ürünlerini statik veriyorsa atla: data-static="1"
  if(grid.dataset.static==='1') return;

  // JSON’u çek
  let products = [];
  try{
    const res = await fetch(url('assets/data/products.json'), {cache:'no-store'});
    products = await res.json();
  }catch(e){
    console.error('products.json okunamadı:', e);
    return;
  }

  // Opsiyonel limit
  const limit = parseInt(grid.dataset.limit||'0', 10);
  if(limit>0) products = products.slice(0, limit);

  // Kartları çiz
  grid.innerHTML = '';
  products.forEach(p=>{
    const s = slugify(p.title);
    const art = document.createElement('article');
    art.className = 'col-3 card';

    // iç: flipli yapı varsa kullanmak isteyen sayfalar için esnek
    const hasFlip = grid.dataset.flip === '1';

    if(hasFlip){
      art.innerHTML = `
        <div class="card-inner">
          <div class="face front">
            <div class="thumb" aria-hidden="true"></div>
            <div><h3>${p.title}</h3><div class="meta"><span>${p.stack||''}</span><span class="tag">${p.version||''}</span></div></div>
          </div>
          <div class="face back">
            <div>
              <div class="seller"><span class="avatar"></span><div><strong>${p.seller||'creator'}</strong><div class="muted" style="font-size:12px">${p.badge||''}</div></div></div>
              <p class="muted">${p.description}</p>
            </div>
            <div class="row" style="justify-content:space-between">
              <span class="price">$${p.price}</span>
              <div class="actions">
                <a class="btn ghost" href="${url(`demo/index.html?item=${p.id}&slug=${s}`)}" target="_blank" rel="noopener">Demo</a>
                <a class="btn primary add" href="${url(`cart.html?add=${p.id}`)}" data-id="${p.id}">Buy</a>
              </div>
            </div>
          </div>
        </div>`;
      // Ön yüzde küçük aksiyonlar
      const qa = document.createElement('div');
      qa.className = 'quick-actions';
      qa.innerHTML = `<a class="btn" href="${url(`demo/index.html?item=${p.id}&slug=${s}`)}" target="_blank" rel="noopener">Demo</a>
                      <a class="btn primary" href="${url(`cart.html?add=${p.id}`)}">Buy</a>`;
      art.querySelector('.front').appendChild(qa);
      // Front tıkla → detail
      art.querySelector('.front').addEventListener('click', ev=>{
        if(!ev.target.closest('.quick-actions')) location.href = url(`products/detail.html?id=${p.id}&slug=${s}`);
      });
    } else {
      // Etsy tarzı kart
      art.innerHTML = `
        <div class="thumb"><img alt="${p.title}" loading="lazy" decoding="async" style="visibility:hidden"><div class="ph">Loading preview…</div></div>
        <div class="body">
          <div class="title">${p.title}</div>
          <div class="desc">${p.description}</div>
          <div class="meta"><div class="price">$${p.price}</div></div>
          <div class="actions">
            <a class="btn" href="${url(`demo/index.html?item=${p.id}&slug=${s}`)}" target="_blank" rel="noopener">Live Demo</a>
            <a class="btn" href="${url(`products/detail.html?id=${p.id}&slug=${s}`)}">Details</a>
            <a class="btn primary" href="${url(`cart.html?add=${p.id}`)}">Add to cart</a>
          </div>
        </div>`;
    }

    grid.appendChild(art);

    // Görsel yükleyici (fallback’li)
    const thumbEl = art.querySelector('.thumb');
    const imgEl   = art.querySelector('.thumb img'); // Etsy tarzında var
    const base = url('images/catalog/');
    const custom = (p.image||'').trim();
    const candidates = [
      ...(custom ? [custom] : []),
      `html${p.id}.webp`, `${p.id}.webp`, `${s}.webp`,
      `html${p.id}.png`,  `${p.id}.png`,  `${s}.png`,
      `html${p.id}.jpg`,  `${p.id}.jpg`,  `${s}.jpg`
    ];
    (function loadN(i=0){
      if(i>=candidates.length){
        const ph = art.querySelector('.ph'); if(ph) ph.textContent = 'No preview';
        return;
      }
      const src = base + candidates[i];
      const test = new Image();
      test.onload = () => {
        if(imgEl){
          imgEl.src = src; imgEl.style.visibility = 'visible';
          art.querySelector('.ph')?.remove();
        }else{
          // front yüzeyi arkaplan
          thumbEl.style.background = `url('${src}') center/cover no-repeat`;
        }
      };
      test.onerror = () => loadN(i+1);
      test.src = src;
    })();
  });
}

/* 5) Arama + Chip filtre (varsa) */
function wireFilters(){
  const grid = $('#grid');
  if(!grid) return;
  const cards = () => [...grid.children];

  const q = $('#q');
  q && q.addEventListener('input', ()=>{
    const t=(q.value||'').toLowerCase();
    cards().forEach(card=>{
      const title=card.querySelector('.title')?.textContent.toLowerCase()||card.querySelector('h3')?.textContent.toLowerCase()||'';
      const desc =card.querySelector('.desc') ?.textContent.toLowerCase()||card.querySelector('.muted')?.textContent.toLowerCase()||'';
      card.style.display=(title.includes(t)||desc.includes(t))?'':'none';
    });
  });

  const chipBar = $('#chipBar');
  if(chipBar){
    let activeChip='';
    const chipToProducts = {
      landing:'products/html-templates.html',
      dashboard:'products/js-widgets.html',
      portfolio:'products/html-templates.html',
      ecommerce:'products/html-templates.html',
      components:'products/js-widgets.html',
      starter:'products/html-templates.html',
      bootstrap:'products/html-templates.html',
      tailwind:'products/css-ui-kits.html'
    };
    chipBar.addEventListener('click',(e)=>{
      const c=e.target.closest('.chip'); if(!c) return;
      const key=(c.dataset.chip||'').toLowerCase();
      if(activeChip===key){ activeChip=''; chipBar.querySelectorAll('.chip').forEach(x=>x.classList.remove('active')); }
      else { activeChip=key; chipBar.querySelectorAll('.chip').forEach(x=>x.classList.remove('active')); c.classList.add('active'); }
      // istersen sayfa içi filtre de yap
      q && (q.value = key); q && q.dispatchEvent(new Event('input'));
      // ürün sayfasına yönlendir
      const prod = chipToProducts[key]; if(prod) location.href = url(prod);
    });
  }
}

/* 6) Başlatıcı */
document.addEventListener('DOMContentLoaded', async ()=>{
  wireHeader();
  wireFilters();
  await renderGridFromJSON(); // grid varsa JSON’dan doldurur
});
