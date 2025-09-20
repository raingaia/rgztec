/* ======================= RGZTEC • Store Page ======================= */
/* Kök (proje) yolu */
const ROOT = '/rgztec/apps/web/public/';

/* Helpers */
const usd = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
const esc = (s='') => s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/* URL/slug */
const params = new URLSearchParams(location.search);
const slug = (params.get('slug') || '').trim().toLowerCase();
document.body.dataset.store = slug || '';

/* Header search -> listings */
document.getElementById('searchForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const q = (document.getElementById('q')?.value || '').trim();
  location.href = `${ROOT}listings.html?store=${encodeURIComponent(slug)}${q ? `&q=${encodeURIComponent(q)}`:''}`;
});

/* Featured store tile */
function tile(s){
  const name = s.name || s.slug;
  const letter = (name||'?')[0].toUpperCase();
  const [light,dark] = (s.colors || s.colorPalette || ['#a5d6ff','#3b82f6']);
  const href = (String(s.slug).toLowerCase() === 'hardware') ? `${ROOT}hardware.html`
              : `${ROOT}store.html?slug=${encodeURIComponent(s.slug)}`;
  return `<li>
    <a class="tile" href="${href}" title="${esc(name)}">
      <div class="badge" style="background:radial-gradient(circle at 70% 30%, ${light}, ${dark})">
        <div class="letter">${letter}</div>
      </div>
      <div class="sname">${esc(name)}</div>
    </a>
  </li>`;
}

/* Asset path (thumbs) — önce normal, hata olursa %20 */
function thumbPath(filename){
  const clean = String(filename||'').replace(/\.(png|jpe?g|webp)$/i,'') || 'placeholder';
  // normal yol
  return {
    primary: `${ROOT}assets/thumbs/${clean}.png`,
    fallback: `${ROOT}assets%20/thumbs/${clean}.png`,
    placeholder: `${ROOT}assets/thumbs/placeholder.png`
  };
}

/* Product card */
function card(p){
  const img = thumbPath(p.thumb || p.image);
  return `
  <div class="card">
    <img loading="lazy" src="${img.primary}" alt="${esc(p.title)}"
         onerror="this.onerror=null;this.src='${img.fallback}';"
         onload="this.onerror=null;">
    <div class="pad">
      <div class="title">${esc(p.title)}</div>
      <p class="sub">${esc(p.desc||'')}</p>
      <div class="row">
        <span class="price">${usd.format(Number(p.price||0))}</span>
        <a class="btn" href="${ROOT}product.html?id=${encodeURIComponent(p.id)}">Details</a>
      </div>
    </div>
  </div>`;
}

function renderProducts(list){
  const g = document.getElementById('grid');
  if(!list?.length){ g.innerHTML = `<div class="sub">No products found in this store.</div>`; return; }
  g.innerHTML = list.map(card).join('');
}

/* Normalizers */
function normalizeProducts(raw){
  const normalizeOne = o => ({
    id:o.id,
    cat:(o.cat||o.category||o.store||'').toLowerCase(),
    title:o.title,
    desc:o.desc||o.description||'',
    price:o.price,
    // sadece isim ver; card() kendi path’ini kurar
    thumb:o.thumb || o.image || 'placeholder',
    tags:Array.isArray(o.tags)?o.tags:[]
  });

  if (Array.isArray(raw)) return raw.map(normalizeOne);

  const prods   = Array.isArray(raw?.products)? raw.products.map(normalizeOne) : [];
  const gallery = Array.isArray(raw?.gallery)?  raw.gallery.map(x=>normalizeOne({id:`g-${x.id}`, ...x})) : [];
  return prods.length ? prods : gallery;
}

/* JSON fetch (mutlak) */
async function getJSON(path){
  const url = path.startsWith('http') ? path : `${ROOT}${path.replace(/^\/+/,'')}`;
  const r = await fetch(url,{cache:'no-store'});
  if(!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
}

/* Ürün seçim — cat/category/store veya tags eşleşmesi */
function pickProductsFor(slug, all){
  const s = (slug||'').toLowerCase();
  return all.filter(p=>{
    const cat   = (p.cat || p.category || p.store || '').toLowerCase();
    const tags  = Array.isArray(p.tags) ? p.tags.map(t=>String(t).toLowerCase()) : [];
    return cat === s || tags.includes(s);
  });
}

/* Main */
(async function main(){
  try{
    /* stores.json -> header + vitrin */
    const storesDoc = await getJSON('data/stores.json');
    const stores = Array.isArray(storesDoc?.stores) ? storesDoc.stores : [];
    const meta = stores.find(s => (s.slug||'').toLowerCase() === slug);

    const pill = document.getElementById('studioName');
    if (meta){
      pill.textContent = meta.name || meta.slug;
      if (meta.color) pill.style.background = meta.color;
      document.getElementById('heroTitle').textContent = meta.name || meta.slug;
      document.getElementById('heroTag').textContent = meta.tagline || '';
      document.title = `RGZTEC • ${meta.name || meta.slug}`;
    } else {
      document.getElementById('heroTitle').textContent = slug || 'Store';
      document.getElementById('heroTag').textContent = '';
    }

    /* hardware’da vitrin sayısını kısıtla; diğerlerinde tümü */
    const featured = (slug === 'hardware') ? stores.slice(0, 20) : stores;
    document.getElementById('storeRow').innerHTML = featured.map(tile).join('');

    /* store-content.json -> üst kategori barı */
    try{
      const content = await getJSON('data/store-content.json');
      const cats = Array.isArray(content?.[slug]?.categories) ? content[slug].categories : [];
      const bar = document.getElementById('storeBar');
      bar.innerHTML = cats.map(c => `<a href="${ROOT}listings.html?store=${encodeURIComponent(slug)}&tag=${encodeURIComponent(c)}">${esc(c)}</a>`).join('');
      bar.style.setProperty('--cols', String(Math.max(1, cats.length || 1)));
    }catch(e){ console.warn('store-content.json yok/boş:', e); }

    /* products.json -> ürün grid */
    const raw  = await getJSON('data/products.json');
    const all  = normalizeProducts(raw);
    const list = pickProductsFor(slug, all);
    renderProducts(list);
  }catch(e){
    console.error(e);
    document.getElementById('grid').innerHTML = `<div class="sub">${esc(String(e.message||e))}</div>`;
  }
})();
