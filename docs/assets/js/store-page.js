/* ======================= RGZTEC • Store Page (FINAL • no-404) ======================= */
/* Sabit kök: tüm yolları bunun üstünden kuruyoruz */
const ROOT = 'https://raingaia.github.io/rgztec/apps/web/public/';

/* Kesin mutlaklaştırma (ROOT tabanlı) */
const abs = (p = '') => p.startsWith('http') ? p : (ROOT + String(p).replace(/^\/+/, ''));

/* Helpers */
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const esc = (s = '') =>
  s.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[m]));
const slugify = s => String(s||'').trim().toLowerCase().replace(/[_\s]+/g,'-').replace(/[^a-z0-9-]/g,'');
const titleCase = s => String(s||'')
  .split(/[-_\s]+/).map(w => w ? w[0].toUpperCase()+w.slice(1) : '').join(' ');

/* URL/slug */
const params = new URLSearchParams(location.search);
const slug = slugify(params.get('slug') || '');
document.body.dataset.store = slug || '';

/* Header search -> listings */
document.getElementById('searchForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = (document.getElementById('q')?.value || '').trim();
  const to = `listings.html?store=${encodeURIComponent(slug)}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
  location.href = abs(to);
});

/* Featured store tile (tek tip link) */
function tile(s) {
  const sslug = slugify(s.slug || '');
  const name = s.name || sslug || '';
  const letter = (name||'?')[0].toUpperCase();
  const [light,dark] = (s.colors || s.colorPalette || ['#a5d6ff','#3b82f6']);
  const href = abs(`store.html?slug=${encodeURIComponent(sslug)}`);

  return `<li>
    <a class="tile" href="${href}" title="${esc(name)}">
      <div class="badge" style="background:radial-gradient(circle at 70% 30%, ${light}, ${dark})">
        <div class="letter">${letter}</div>
      </div>
      <div class="sname">${esc(name)}</div>
    </a>
  </li>`;
}

/* Product card */
function card(p){
  const idFromImg = (p.image || '').replace(/\.(png|jpe?g|webp)$/i,'') || 'placeholder';
  const imgRel = p.thumb || `assets/thumbs/${idFromImg}.png`;
  const imgSrc = abs(imgRel);

  return `
  <div class="card">
    <div class="media">
      <img loading="lazy" src="${imgSrc}" alt="${esc(p.title||'')}"
           onerror="this.onerror=null;this.src='${esc(abs('assets/thumbs/placeholder.png'))}';">
    </div>
    <div class="pad">
      <div class="title">${esc(p.title||'')}</div>
      <p class="sub">${esc(p.desc||'')}</p>
      <div class="row">
        <span class="price">${usd.format(Number(p.price||0))}</span>
        <a class="btn" href="${esc(abs(`product.html?id=${encodeURIComponent(p.id)}`))}">Details</a>
      </div>
    </div>
  </div>`;
}

/* Render grid */
function renderProducts(list){
  const g = document.getElementById('grid');
  if(!g) return;
  if(!list?.length){ g.innerHTML = `<div class="sub">No products found in this store.</div>`; return; }
  g.innerHTML = list.map(card).join('');
  g.querySelectorAll('.card .media img').forEach(img=>{
    const done = ()=> img.parentElement.classList.add('loaded');
    img.addEventListener('load', done, {once:true});
    img.addEventListener('error', done, {once:true});
  });
}

/* Normalize */
function normalizeProducts(raw){
  const norm = o => ({
    id:o.id,
    cat: slugify(o.cat || o.category || o.store || ''),
    title:o.title,
    desc:o.desc || o.description || '',
    price:o.price,
    image:o.image || '',
    thumb:o.thumb || '',
    tags: Array.isArray(o.tags) ? o.tags.map(slugify) : []
  });
  if(Array.isArray(raw)) return raw.map(norm);
  const prods = Array.isArray(raw?.products) ? raw.products.map(norm) : [];
  const gallery = Array.isArray(raw?.gallery) ? raw.gallery.map(x=>norm({id:`g-${x.id}`, ...x})) : [];
  return prods.length ? prods : gallery;
}

/* JSON fetch (ROOT tabanlı) */
async function getJSON(path){
  const url = abs(path);
  const r = await fetch(url, {cache:'no-store'});
  if(!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
}

/* Ürün seçimi */
function pickProductsFor(slugName, all){
  const s = slugify(slugName);
  return all.filter(p => p.cat === s || p.tags.includes(s));
}

/* Main */
(async function main(){
  try{
    /* stores.json -> header + vitrin */
    const storesDoc = await getJSON('data/stores.json');
    const stores = Array.isArray(storesDoc?.stores) ? storesDoc.stores : [];
    const meta = stores.find(s => slugify(s.slug) === slug);

    const pill = document.getElementById('studioName');
    const heroTitle = document.getElementById('heroTitle');
    const heroTag = document.getElementById('heroTag');

    const displayName = meta?.name || (slug ? titleCase(slug) : 'Store');

    // Mağaza adı header’daki pill’de; hero başlığını boşaltıyoruz
    if(pill){
      pill.textContent = displayName;
      if(meta?.color) pill.style.background = meta.color;
      pill.classList.add('is-filled');
    }
    if(heroTitle) heroTitle.textContent = '';
    if(heroTag) heroTag.textContent = meta?.tagline || '';

    document.title = `RGZTEC • ${displayName}`;

    // Vitrin
    const storeRow = document.getElementById('storeRow');
    if(storeRow){
      const featured = (slug === 'hardware') ? stores.slice(0,20) : stores;
      storeRow.innerHTML = featured.map(tile).join('');
    }

    /* store-content.json -> üst kategori barı */
    try{
      const content = await getJSON('data/store-content.json');
      const cats = Array.isArray(content?.[slug]?.categories) ? content[slug].categories : [];
      const bar = document.getElementById('storeBar');
      if(bar){
        bar.innerHTML = cats.map(c =>
          `<a href="${esc(abs(`listings.html?store=${encodeURIComponent(slug)}&tag=${encodeURIComponent(c)}`))}">${esc(c)}</a>`
        ).join('');
        bar.style.setProperty('--cols', String(Math.max(1, cats.length || 1)));
      }
    }catch(e){ console.warn('store-content.json yok/boş:', e); }

    /* products.json -> ürünler */
    const raw  = await getJSON('data/products.json');
    const all  = normalizeProducts(raw);
    const list = pickProductsFor(slug, all);
    renderProducts(list);

  }catch(e){
    console.error(e);
    const g = document.getElementById('grid');
    if(g) g.innerHTML = `<div class="sub">${esc(String(e.message||e))}</div>`;
  }
})();
