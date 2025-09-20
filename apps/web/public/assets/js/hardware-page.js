/* ========= RGZTEC • Hardware Page ========= */

/* Sayfa klasörüne göre mutlaklaştır */
const PAGE_BASE = location.origin + location.pathname.replace(/[^/]*$/, '');
const abs = (p='') => new URL((p||'').replace(/^\.?\//,''), PAGE_BASE).href;

const usd = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
const esc = (s='') => s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const SLUG = 'hardware';
document.body.dataset.store = SLUG;

/* Arama -> listings */
document.getElementById('searchForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const q = (document.getElementById('q')?.value || '').trim();
  location.href = `./listings.html?store=${encodeURIComponent(SLUG)}${q ? `&q=${encodeURIComponent(q)}`:''}`;
});

/* Tile */
function tile(s){
  const name = s.name || s.slug;
  const letter = (name||'?')[0].toUpperCase();
  const [light,dark] = (s.colors || s.colorPalette || ['#a5d6ff','#3b82f6']);
  const href = `./store.html?slug=${encodeURIComponent(s.slug)}`;
  return `<li>
    <a class="tile" href="${href}" title="${esc(name)}">
      <div class="badge" style="background:radial-gradient(circle at 70% 30%, ${light}, ${dark})">
        <div class="letter">${letter}</div>
      </div>
      <div class="sname">${esc(name)}</div>
    </a>
  </li>`;
}

/* 1x1 şeffaf PNG (placeholder) */
const P1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+N3qkAAAAASUVORK5CYII=';

/* Card */
function card(p){
  const img = p.thumb || `assets/thumbs/${(p.image||'').replace(/\.(png|jpe?g|webp)$/i,'')||'placeholder'}.png`;
  return `
  <div class="card">
    <img loading="lazy" src="${abs(img)}" alt="${esc(p.title)}"
         onerror="this.onerror=null;this.src='${P1}'">
    <div class="pad">
      <div class="title">${esc(p.title)}</div>
      <p class="sub">${esc(p.desc||'')}</p>
      <div class="row">
        <span class="price">${usd.format(Number(p.price||0))}</span>
        <a class="btn" href="./product.html?id=${encodeURIComponent(p.id)}">Details</a>
      </div>
    </div>
  </div>`;
}

function renderProducts(list){
  const g = document.getElementById('grid');
  if(!list?.length){ g.innerHTML = `<div class="sub">No hardware products found.</div>`; return; }
  g.innerHTML = list.map(card).join('');
}

/* Normalizers */
function normalizeProducts(raw){
  const norm = o => ({
    id:o.id,
    cat:(o.cat||o.category||o.store||'').toLowerCase(),
    title:o.title,
    desc:o.desc||o.description||'',
    price:o.price,
    image:o.image||'',
    thumb:o.thumb||'',
    tags:Array.isArray(o.tags)?o.tags:[]
  });

  if (Array.isArray(raw)) return raw.map(norm);

  const prods   = Array.isArray(raw?.products)? raw.products.map(norm) : [];
  const gallery = Array.isArray(raw?.gallery)?  raw.gallery.map(x=>norm({id:`g-${x.id}`, ...x})) : [];
  return prods.length ? prods : gallery;
}

/* JSON fetch */
async function getJSON(url){
  const full = abs(url);
  const r = await fetch(full,{cache:'no-store'});
  if(!r.ok) throw new Error(`${full}: ${r.status}`);
  return r.json();
}

/* Sadece hardware ürünleri */
function pickHardware(all){
  return all.filter(p=>{
    const cat  = (p.cat || p.category || p.store || '').toLowerCase();
    const tags = Array.isArray(p.tags) ? p.tags.map(t=>String(t).toLowerCase()) : [];
    return cat === SLUG || tags.includes(SLUG);
  });
}

/* Main */
(async function main(){
  try{
    /* Vitrin */
    const storesDoc = await getJSON('./data/stores.json');
    const stores = Array.isArray(storesDoc?.stores) ? storesDoc.stores : [];
    document.getElementById('storeRow').innerHTML = stores.slice(0,20).map(tile).join('');

    /* Üst kategori barı */
    try{
      const content = await getJSON('./data/store-content.json');
      const cats = Array.isArray(content?.[SLUG]?.categories) ? content[SLUG].categories : [];
      const bar = document.getElementById('storeBar');
      bar.innerHTML = cats.map(c => `<a href="./listings.html?store=${encodeURIComponent(SLUG)}&tag=${encodeURIComponent(c)}">${esc(c)}</a>`).join('');
      bar.style.setProperty('--cols', String(Math.max(1, cats.length || 1)));
    }catch(e){ console.warn('store-content.json yok/boş:', e); }

    /* Ürünler */
    const raw = await getJSON('./data/products.json');
    const all = normalizeProducts(raw);
    const list = pickHardware(all);
    renderProducts(list);

    /* Başlıklar */
    document.getElementById('studioName').textContent = 'Hardware';
    document.getElementById('heroTitle').textContent = 'Hardware';
    document.title = 'RGZTEC • Hardware';
  }catch(e){
    console.error(e);
    document.getElementById('grid').innerHTML = `<div class="sub">${esc(String(e.message||e))}</div>`;
  }
})();
