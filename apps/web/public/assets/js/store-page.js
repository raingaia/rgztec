/* ======================= RGZTEC • Store Page (robust) ======================= */
/* Base URL: <base href="..."> varsa onu, yoksa sayfanın klasörünü kullanır */
const BASE = (document.querySelector('base')?.href)
  || (location.origin + location.pathname.replace(/[^/]*$/, ''));

/* Abs helper: her yolu BASE’e göre mutlak yapar */
const abs = (p = '') => new URL(String(p).replace(/^\.?\//, ''), BASE).href;

/* Helpers */
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const esc = (s = '') =>
  s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const slugify = s => String(s || '')
  .trim().toLowerCase()
  .replace(/[_\s]+/g, '-')
  .replace(/[^a-z0-9-]/g, '');

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

/* Featured store tile (hardware özel sayfasına gider, diğerleri store.html) */
function tile(s) {
  const sslug = slugify(s.slug || '');
  const name = s.name || sslug || '';
  const letter = (name || '?')[0].toUpperCase();
  const [light, dark] = (s.colors || s.colorPalette || ['#a5d6ff', '#3b82f6']);
  const href = (sslug === 'hardware')
    ? abs('hardware.html')
    : abs(`store.html?slug=${encodeURIComponent(sslug)}`);

  return `<li>
    <a class="tile" href="${href}" title="${esc(name)}">
      <div class="badge" style="background:radial-gradient(circle at 70% 30%, ${light}, ${dark})">
        <div class="letter">${letter}</div>
      </div>
      <div class="sname">${esc(name)}</div>
    </a>
  </li>`;
}

/* Product card (16:9 media + skeleton için .media sarmalı) */
function card(p) {
  const idFromImg = (p.image || '').replace(/\.(png|jpe?g|webp)$/i, '') || 'placeholder';
  const imgRel = p.thumb
    || `assets/thumbs/${idFromImg}.png`
    || 'assets/thumbs/placeholder.png';

  const imgSrc = abs(imgRel);

  return `
  <div class="card">
    <div class="media">
      <img loading="lazy" src="${imgSrc}" alt="${esc(p.title || '')}"
           onerror="this.onerror=null;this.src='${esc(abs('assets/thumbs/placeholder.png'))}';">
    </div>
    <div class="pad">
      <div class="title">${esc(p.title || '')}</div>
      <p class="sub">${esc(p.desc || '')}</p>
      <div class="row">
        <span class="price">${usd.format(Number(p.price || 0))}</span>
        <a class="btn" href="${esc(abs(`product.html?id=${encodeURIComponent(p.id)}`))}">Details</a>
      </div>
    </div>
  </div>`;
}
/* Render */
function renderProducts(list) {
  const g = document.getElementById('grid');
  if (!list?.length) {
    g.innerHTML = `<div class="sub">No products found in this store.</div>`;
    return;
  }
  g.innerHTML = list.map(card).join('');

  // Görsel yüklendiğinde shimmer'ı kapat
  document.querySelectorAll('.card .media img').forEach((img) => {
    const done = () => img.parentElement.classList.add('loaded');
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });
}

/* Normalizers */
function normalizeProducts(raw) {
  const norm = (o) => ({
    id: o.id,
    cat: slugify(o.cat || o.category || o.store || ''),
    title: o.title,
    desc: o.desc || o.description || '',
    price: o.price,
    image: o.image || '',
    thumb: o.thumb || '',
    tags: Array.isArray(o.tags) ? o.tags.map(slugify) : [],
  });

  if (Array.isArray(raw)) return raw.map(norm);

  const prods = Array.isArray(raw?.products) ? raw.products.map(norm) : [];
  const gallery = Array.isArray(raw?.gallery) ? raw.gallery.map((x) => norm({ id: `g-${x.id}`, ...x })) : [];
  return prods.length ? prods : gallery;
}

/* JSON fetch */
async function getJSON(path) {
  const url = /^https?:/i.test(path) ? path : abs(path);
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
}

/* Ürün seçim (cat veya tag slug eşleşmesi) */
function pickProductsFor(slugName, all) {
  const s = slugify(slugName);
  return all.filter((p) => p.cat === s || p.tags.includes(s));
}

/* Main */
(async function main() {
  try {
    /* stores.json -> header + vitrin */
    const storesDoc = await getJSON('data/stores.json');
    const stores = Array.isArray(storesDoc?.stores) ? storesDoc.stores : [];
    const meta = stores.find((s) => slugify(s.slug) === slug);

    const pill = document.getElementById('studioName');
    if (meta) {
      pill.textContent = meta.name || meta.slug;
      if (meta.color) pill.style.background = meta.color;
      document.getElementById('heroTitle').textContent = meta.name || meta.slug;
      document.getElementById('heroTag').textContent = meta.tagline || '';
      document.title = `RGZTEC • ${meta.name || meta.slug}`;
    } else {
      document.getElementById('heroTitle').textContent = slug || 'Store';
      document.getElementById('heroTag').textContent = '';
    }

    // hardware vitrini kısıtlı; diğerleri tam liste
    const featured = (slug === 'hardware') ? stores.slice(0, 20) : stores;
    document.getElementById('storeRow').innerHTML = featured.map(tile).join('');

    /* store-content.json -> üst kategori barı */
    try {
      const content = await getJSON('data/store-content.json');
      const cats = Array.isArray(content?.[slug]?.categories) ? content[slug].categories : [];
      const bar = document.getElementById('storeBar');
      bar.innerHTML = cats.map((c) =>
        `<a href="${esc(abs(`listings.html?store=${encodeURIComponent(slug)}&tag=${encodeURIComponent(c)}`))}">${esc(c)}</a>`
      ).join('');
      bar.style.setProperty('--cols', String(Math.max(1, cats.length || 1)));
    } catch (e) {
      console.warn('store-content.json yok/boş:', e);
    }

    /* products.json -> ürün grid */
    const raw = await getJSON('data/products.json');
    const all = normalizeProducts(raw);
    const list = pickProductsFor(slug, all);
    renderProducts(list);
  } catch (e) {
    console.error(e);
    document.getElementById('grid').innerHTML = `<div class="sub">${esc(String(e.message || e))}</div>`;
  }
})();
