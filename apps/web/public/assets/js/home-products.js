/* RGZTEC HOME MANAGER
   - Veriyi store.data.json'dan çeker.
   - Hata olursa "Acil Durum" verisini devreye sokar (Site asla çökmez).
*/

const BASE = "/rgztec/";
const STORE_DATA_URL = "assets/data/store.data.json"; // Fetch yolu
const STORE_IMAGE_BASE = "assets/images/store/";      // Resim yolu

// ACİL DURUM VERİSİ (JSON bozuksa veya bulunamazsa bu devreye girer)
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

// Ana Başlatıcı
document.addEventListener('DOMContentLoaded', async () => {
  let storesData = {};

  try {
    // 1. Veriyi çekmeye çalış
    const response = await fetch(STORE_DATA_URL);
    if (!response.ok) throw new Error("JSON Fetch Failed");
    storesData = await response.json();
    console.log("RGZTEC: Data loaded from JSON.");
  } catch (error) {
    // 2. Hata varsa Backup verisini kullan
    console.warn("RGZTEC: JSON not found, loading BACKUP data.", error);
    // Backup dizisini objeye çevir (Mevcut yapıya uydurmak için)
    BACKUP_STORES.forEach(s => { storesData[s.slug] = s; });
  }

  // 3. Arayüzü Oluştur
  renderGallery(storesData);
  renderSubNav(storesData);
  initMegaMenu(storesData);
});

// --- RENDER FONKSİYONLARI ---

function renderGallery(data) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  const cardsHTML = Object.values(data).map(store => {
    const href = `store/${store.slug}/`;
    const imgSrc = `${STORE_IMAGE_BASE}${store.slug}.webp`;
    
    // FEATURED (HARDWARE) KARTI
    if (store.slug === 'hardware') {
      return `
        <article class="card card--featured">
          <a href="${href}" class="card-media">
            <img src="${imgSrc}" alt="${store.title}" loading="lazy" onerror="this.src='assets/images/placeholder.png'">
          </a>
          <div class="card-content">
            <span class="card-badge">Featured • Hardware</span>
            <h3 class="card-title">${store.title}</h3>
            <p class="card-desc">${store.tagline || 'Premium hardware for developers.'}</p>
            <a href="${href}" class="card-link">Visit Store <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>
          </div>
        </article>
      `;
    }

    // STANDART KART
    return `
      <article class="card">
        <a href="${href}" class="card-media">
          <img src="${imgSrc}" alt="${store.title}" loading="lazy" onerror="this.style.display='none'">
        </a>
        <div class="card-content">
          <span class="card-badge">Official Store</span>
          <h3 class="card-title">${store.title}</h3>
          <p class="card-desc">${store.tagline || 'Premium digital assets.'}</p>
          <a href="${href}" class="card-link">
            Visit Store 
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </div>
      </article>
    `;
  }).join('');

  gallery.innerHTML = cardsHTML;
}

function renderSubNav(data) {
  const navList = document.getElementById('sub-nav-list');
  if (!navList) return;
  
  navList.innerHTML = Object.values(data).map(store => `
    <div class="sub-nav-item"><a href="store/${store.slug}/">${store.title}</a></div>
  `).join('');
}

function initMegaMenu(data) {
  const btn = document.getElementById('btn-categories');
  const header = document.querySelector('.app-header');
  const panel = document.getElementById('categories-panel');
  const listEl = document.getElementById('categories-list');
  const detailEl = document.getElementById('categories-detail');

  if (!btn || !panel) return;

  const stores = Object.values(data);

  // Listeyi Doldur
  listEl.innerHTML = stores.map((store, i) => `
    <button class="cat-item ${i === 0 ? 'cat-item--active' : ''}" data-slug="${store.slug}">
      <span>${store.title}</span>
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

  // Toggle Menu
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = header.classList.contains('has-cat-open');
    header.classList.toggle('has-cat-open', !isOpen);
    
    if (!isOpen) { 
      const btnRect = btn.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const offset = btnRect.left - headerRect.left + (btnRect.width / 2);
      panel.querySelector('.categories-panel').style.setProperty('--cat-pointer-left', offset + 'px');
    }
  });

  // Kapatma
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) header.classList.remove('has-cat-open');
  });
}

function renderDetail(store, container) {
  if (!store || !container) return;
  
  const linksHtml = (store.sections || []).map(s => {
    // Section link yapısı
    const href = s.href ? s.href : `store/${store.slug}/`;
    return `<a href="${href}">${s.name || s.label}</a>`;
  }).join('');

  container.innerHTML = `
    <div class="cat-detail-eyebrow">STORE</div>
    <div class="cat-detail-title">${store.title}</div>
    <div class="cat-detail-subtitle">${store.tagline || 'Explore products.'}</div>
    <div class="cat-detail-links">
      ${linksHtml}
      <a href="store/${store.slug}/">View All Products</a>
    </div>
  `;
}

