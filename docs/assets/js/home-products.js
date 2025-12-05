/* RGZTEC HOME MANAGER - GARANTİLİ ÇÖZÜM
   - Veriyi doğrudan içeriye gömer (Hardcoded).
   - Dosya yolu hatası riskini sıfırlar.
   - Görselleri ve menüyü otomatik doldurur.
*/

const BASE = "/rgztec/";
const STORE_IMAGE_BASE = "assets/images/store/";

// TÜM MAĞAZA VERİSİ (ELLE GİRİLDİ - GARANTİ ÇALIŞIR)
const STORES_DATA = [
  { 
    slug: 'hardware', 
    title: 'Hardware Lab', 
    tagline: 'High-performance AI accelerators, dev boards & IoT kits.', 
    isFeatured: true,
    sections: [{name: 'AI Boards'}, {name: 'Sensors'}, {name: 'Microcontrollers'}]
  },
  { 
    slug: 'game-makers', 
    title: 'Game Makers', 
    tagline: 'Unity & Unreal assets for pro developers.',
    sections: [{name: '3D Models'}, {name: 'Audio'}, {name: 'Shaders'}]
  },
  { 
    slug: 'ai-tools-hub', 
    title: 'AI Tools Hub', 
    tagline: 'Agents, automations and workflow tools.',
    sections: [{name: 'Agents'}, {name: 'Automation'}, {name: 'Big Data'}]
  },
  { 
    slug: 'dev-studio-one', 
    title: 'Dev Studio One', 
    tagline: 'Dashboards, admin templates and starters.',
    sections: [{name: 'Dashboards'}, {name: 'Admin Kits'}, {name: 'Starters'}]
  },
  { 
    slug: 'email-forge', 
    title: 'Email Forge', 
    tagline: 'High-converting email templates.',
    sections: [{name: 'Newsletters'}, {name: 'Transactional'}, {name: 'Marketing'}]
  },
  { 
    slug: 'html-templates', 
    title: 'HTML Templates', 
    tagline: 'Landing pages, marketing sites and UI layouts.',
    sections: [{name: 'Landing Pages'}, {name: 'Portfolios'}, {name: 'Blogs'}]
  },
  { 
    slug: 'icon-smith', 
    title: 'Icon Smith', 
    tagline: 'Premium icon packs and UI assets.',
    sections: [{name: 'Line Icons'}, {name: 'Solid Icons'}, {name: 'Illustrations'}]
  },
  { 
    slug: 'reactorium', 
    title: 'Reactorium', 
    tagline: 'React UI kits, dashboards and chart systems.',
    sections: [{name: 'UI Kits'}, {name: 'Charts'}, {name: 'Hooks'}]
  },
  { 
    slug: 'tiny-js-lab', 
    title: 'Tiny JS Lab', 
    tagline: 'Vanilla JS widgets and utilities.',
    sections: [{name: 'Widgets'}, {name: 'Utilities'}, {name: 'Plugins'}]
  },
  { 
    slug: 'unity-hub', 
    title: 'Unity Hub', 
    tagline: 'Game systems, controllers and tools.',
    sections: [{name: 'Controllers'}, {name: 'Physics'}, {name: 'Tools'}]
  },
  { 
    slug: 'wp-plugins', 
    title: 'WP Plugins', 
    tagline: 'Commerce and utility plugins for WordPress.',
    sections: [{name: 'SEO'}, {name: 'Security'}, {name: 'Commerce'}]
  }
];

// BAŞLAT
document.addEventListener('DOMContentLoaded', () => {
  renderGallery(STORES_DATA);
  renderSubNav(STORES_DATA);
  initMegaMenu(STORES_DATA);
});

// GALERİ RENDER
function renderGallery(data) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  const html = data.map(store => {
    const href = `store/${store.slug}/`;
    const imgSrc = `${STORE_IMAGE_BASE}${store.slug}.webp`;
    
    // Featured Kart (Büyük & Yatay)
    if (store.isFeatured) {
      return `
        <article class="card card--featured">
          <a href="${href}" class="card-media">
            <img src="${imgSrc}" alt="${store.title}" loading="lazy" onerror="this.src='assets/images/placeholder.png'">
          </a>
          <div class="card-content">
            <span class="card-badge">Featured • Hardware</span>
            <h3 class="card-title">${store.title}</h3>
            <p class="card-desc">${store.tagline}</p>
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
          <p class="card-desc">${store.tagline}</p>
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
  list.innerHTML = data.map(s => `<div class="sub-nav-item"><a href="store/${s.slug}/">${s.title}</a></div>`).join('');
}

// MEGA MENU
function initMegaMenu(data) {
  const btn = document.getElementById('btn-categories');
  const header = document.querySelector('.app-header');
  const panel = document.getElementById('categories-panel');
  const listEl = document.getElementById('categories-list');
  const detailEl = document.getElementById('categories-detail');

  if (!btn || !panel) return;

  // Listeyi Doldur
  listEl.innerHTML = data.map((s, i) => `
    <button class="cat-item ${i===0?'cat-item--active':''}" data-slug="${s.slug}">
      <span>${s.title}</span>
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
    </button>
  `).join('');

  // İlk detayı göster
  renderDetail(data[0], detailEl);

  // Hover Events
  listEl.querySelectorAll('.cat-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      listEl.querySelectorAll('.cat-item').forEach(b => b.classList.remove('cat-item--active'));
      item.classList.add('cat-item--active');
      const store = data.find(s => s.slug === item.dataset.slug);
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
  const links = (store.sections || []).map(s => `<a href="store/${store.slug}/">${s.name}</a>`).join('');
  container.innerHTML = `
    <div class="cat-detail-eyebrow">STORE</div>
    <div class="cat-detail-title">${store.title}</div>
    <div class="cat-detail-subtitle">${store.tagline}</div>
    <div class="cat-detail-links">${links}<a href="store/${store.slug}/">View All</a></div>
  `;
}
