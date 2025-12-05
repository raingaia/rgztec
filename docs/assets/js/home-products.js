/* RGZTEC HOME PRODUCTS MANAGER
   - Veriyi "data/store.data.json" yolundan çeker.
   - Hata olursa "Yedek Veri" kullanır (Site çökmez).
*/

const BASE = "/rgztec/";
const STORE_DATA_URL = "data/store.data.json"; // DÜZELTİLEN YOL
const STORE_IMAGE_BASE = "assets/images/store/";

// YEDEK VERİ (JSON Yüklenemezse devreye girer)
const BACKUP_STORES = [
  { slug: 'hardware', title: 'Hardware Lab', tagline: 'High-performance AI accelerators & IoT kits.', isFeatured: true },
  { slug: 'game-makers', title: 'Game Makers', tagline: 'Unity & Unreal assets for pro developers.' },
  { slug: 'ai-tools-hub', title: 'AI Tools Hub', tagline: 'Agents, automations and workflow tools.' },
  { slug: 'dev-studio-one', title: 'Dev Studio One', tagline: 'Dashboards, admin templates and starters.' },
  { slug: 'html-templates', title: 'HTML Templates', tagline: 'Landing pages, marketing sites and UI layouts.' },
  { slug: 'reactorium', title: 'Reactorium', tagline: 'React UI kits, dashboards and chart systems.' },
  { slug: 'unity-hub', title: 'Unity Hub', tagline: 'Game systems, controllers and tools.' },
  { slug: 'wp-plugins', title: 'WP Plugins', tagline: 'Commerce and utility plugins for WordPress.' },
  { slug: 'email-forge', title: 'Email Forge', tagline: 'High-converting email templates.' },
  { slug: 'icon-smith', title: 'Icon Smith', tagline: 'Premium icon packs and UI assets.' },
  { slug: 'tiny-js-lab', title: 'Tiny JS Lab', tagline: 'Vanilla JS widgets and utilities.' }
];

document.addEventListener('DOMContentLoaded', async () => {
  let storesData = {};

  try {
    // 1. Veriyi doğru yoldan çek
    const response = await fetch(STORE_DATA_URL);
    if (!response.ok) throw new Error("JSON Fetch Failed");
    storesData = await response.json();
    console.log("RGZTEC: Data loaded successfully from data/store.data.json");
  } catch (error) {
    // 2. Hata varsa Yedek Veriyi Kullan
    console.warn("RGZTEC: JSON Error, loading BACKUP.", error);
    BACKUP_STORES.forEach(s => { storesData[s.slug] = s; });
  }

  renderGallery(storesData);
  renderSubNav(storesData);
  initMegaMenu(storesData);
});

// GALERİ RENDER (Etsy Tarzı Kartlar)
function renderGallery(data) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  const html = Object.values(data).map(store => {
    const href = `store/${store.slug}/`;
    const imgSrc = `${STORE_IMAGE_BASE}${store.slug}.webp`;
    
    // Featured Kart (Büyük & Yatay)
    if (store.slug === 'hardware' || store.isFeatured) {
      return `
        <article class="card card--featured">
          <a href="${href}" class="card-media">
            <img src="${imgSrc}" alt="${store.title}" loading="lazy" onerror="this.style.display='none'">
          </a>
          <div class="card-content">
            <span class="card-badge">Featured • Hardware</span>
            <h3 class="card-title">${store.title}</h3>
            <p class="card-desc">${store.tagline || 'Premium hardware for developers.'}</p>
            <a href="${href}" class="card-link">Visit Store &rarr;</a>
          </div>
        </article>
      `;
    }

    // Standart Kart
    return `
      <article class="card">
        <a href="${href}" class="card-media">
          <img src="${imgSrc}" alt="${store.title}" loading="lazy" onerror="this.style.display='none'">
        </a>
        <div class="card-content">
          <span class="card-badge">Official Store</span>
          <h3 class="card-title">${store.title}</h3>
          <p class="card-desc">${store.tagline || 'Premium digital assets.'}</p>
          <a href="${href}" class="card-link">Visit Store &rarr;</a>
        </div>
      </article>
    `;
  }).join('');

  gallery.innerHTML = html;
}

// SUB NAV RENDER
function renderSubNav(data) {
  const list = document.getElementById('sub-nav-list');
  if (!list) return;
  list.innerHTML = Object.values(data).map(s => `<div class="sub-nav-item"><a href="store/${s.slug}/">${s.title}</a></div>`).join('');
}

// MEGA MENU LOGIC
function initMegaMenu(data) {
  const btn = document.getElementById('btn-categories');
  const header = document.querySelector('.app-header');
  const panel = document.getElementById('categories-panel');
  const listEl = document.getElementById('categories-list');
  const detailEl = document.getElementById('categories-detail');

  if (!btn || !panel) return;

  const stores = Object.values(data);
  
  // Listeyi Doldur
  listEl.innerHTML = stores.map((s, i) => `
    <button class="cat-item ${i===0?'cat-item--active':''}" data-slug="${s.slug}">
      <span>${s.title}</span>
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
    </button>
  `).join('');

  // İlk detayı göster
  renderDetail(stores[0], detailEl);

  // Hover Events
  listEl.querySelectorAll('.cat-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      listEl.querySelectorAll('.cat-item').forEach(b => b.classList.remove('cat-item--active'));
      item.classList.add('cat-item--active');
      const store = stores.find(s => s.slug === item.dataset.slug);
      renderDetail(store, detailEl);
    });
  });

  // Toggle
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = header.classList.contains('has-cat-open');
    header.classList.toggle('has-cat-open', !isOpen);
  });

  document.addEventListener('click', (e) => {
    if(!header.contains(e.target)) header.classList.remove('has-cat-open');
  });
}

function renderDetail(store, container) {
  if (!store || !container) return;
  const links = (store.sections || []).map(s => `<a href="store/${store.slug}/">${s.name || s.label}</a>`).join('');
  container.innerHTML = `
    <div class="cat-detail-eyebrow">STORE</div>
    <div class="cat-detail-title">${store.title}</div>
    <div class="cat-detail-subtitle">${store.tagline || 'Explore products.'}</div>
    <div class="cat-detail-links">${links}<a href="store/${store.slug}/">View All</a></div>
  `;
}
