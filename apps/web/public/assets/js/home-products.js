/* RGZTEC HOME PRODUCTS MANAGER - FINAL FIX */

const BASE = "/rgztec/";
const STORE_DATA_URL = "data/store.data.json"; 
const STORE_IMAGE_BASE = "assets/images/store/";

// --- YEDEK VERİ (Garantili Çalışması İçin) ---
const STORES = [
  { slug: 'hardware', title: 'Hardware Lab', tagline: 'High-performance AI accelerators, dev boards & IoT kits.', isFeatured: true },
  { slug: 'game-makers', title: 'Game Makers', tagline: 'Unity & Unreal assets for pro developers.' },
  { slug: 'ai-tools-hub', title: 'AI Tools Hub', tagline: 'Agents, automations and workflow tools.' },
  { slug: 'dev-studio-one', title: 'Dev Studio One', tagline: 'Dashboards, admin templates and starters.' },
  { slug: 'html-templates', title: 'HTML Templates', tagline: 'Landing pages, marketing sites and UI layouts.' },
  { slug: 'email-forge', title: 'Email Forge', tagline: 'High-converting email templates.' },
  { slug: 'icon-smith', title: 'Icon Smith', tagline: 'Premium icon packs and UI assets.' },
  { slug: 'reactorium', title: 'Reactorium', tagline: 'React UI kits, dashboards and chart systems.' },
  { slug: 'tiny-js-lab', title: 'Tiny JS Lab', tagline: 'Vanilla JS widgets and utilities.' },
  { slug: 'unity-hub', title: 'Unity Hub', tagline: 'Game systems, controllers and tools.' },
  { slug: 'wp-plugins', title: 'WP Plugins', tagline: 'Commerce and utility plugins for WordPress.' }
];

document.addEventListener('DOMContentLoaded', async () => {
  let dataToUse = {};
  
  try {
    const res = await fetch(STORE_DATA_URL);
    if(res.ok) {
        dataToUse = await res.json();
    } else {
        throw new Error("Local JSON error");
    }
  } catch(e) {
    console.warn("JSON fetch failed, using backup data.", e);
    STORES.forEach(s => dataToUse[s.slug] = s);
  }

  renderGallery(dataToUse);
  renderSubNav(dataToUse);
});

function renderGallery(data) {
  const gallery = document.getElementById('gallery');
  if(!gallery) return;

  const html = Object.values(data).map(store => {
    const href = `store/${store.slug}/`;
    // Varsayılan görsel yolu (.webp)
    const imgUrl = `${STORE_IMAGE_BASE}${store.slug}.webp`;

    // Görsel Hata Yönetimi (Fallback)
    const imgErrorAttr = `onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'card-img-placeholder\\'><svg viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\' ry=\\'2\\'></rect><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'></circle><polyline points=\\'21 15 16 10 5 21\\'></polyline></svg><span>No Image</span></div>'"`;

    if(store.slug === 'hardware' || store.isFeatured) {
      // FEATURED CARD
      return `
        <a href="${href}" class="card card-featured">
          <div class="card-image-wrap">
             <img src="${imgUrl}" class="card-img" alt="${store.title}" ${imgErrorAttr}>
          </div>
          <div class="card-details">
             <span class="card-badge">Featured Store</span>
             <h3 class="card-title">${store.title}</h3>
             <p class="card-meta">${store.tagline}</p>
             <div class="btn-visit">Visit Store</div>
          </div>
        </a>
      `;
    }

    // NORMAL CARD
    return `
      <a href="${href}" class="card">
        <div class="card-image-wrap">
           <img src="${imgUrl}" class="card-img" alt="${store.title}" ${imgErrorAttr}>
        </div>
        <div class="card-details">
           <h3 class="card-title">${store.title}</h3>
           <p class="card-meta">${store.tagline}</p>
        </div>
      </a>
    `;
  }).join('');

  gallery.innerHTML = html;
}

function renderSubNav(data) {
    const list = document.getElementById('sub-nav-list');
    if(!list) return;
    list.innerHTML = Object.values(data).map(s => `
        <div class="sub-nav-item"><a href="store/${s.slug}/">${s.title}</a></div>
    `).join('');
}
