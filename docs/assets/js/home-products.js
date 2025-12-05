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
  // Veriyi önce localden dene, olmazsa yedek veriyi kullan
  let dataToUse = {};
  
  try {
    const res = await fetch(STORE_DATA_URL);
    if(res.ok) {
        dataToUse = await res.json();
    } else {
        throw new Error("Local JSON error");
    }
  } catch(e) {
    // Yedek veriyi objeye çevir
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
    const img = `${STORE_IMAGE_BASE}${store.slug}.webp`;

    if(store.slug === 'hardware') {
      // FEATURED CARD
      return `
        <a href="${href}" class="card card-featured">
          <div class="card-image-wrap">
             <img src="${img}" class="card-img" alt="${store.title}" onerror="this.style.display='none'">
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
           <img src="${img}" class="card-img" alt="${store.title}" onerror="this.style.display='none'">
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
