/* RGZTEC HOME MANAGER - COMPLETE EDITION
   Tüm veriler, alt kategoriler ve ayarlar dahildir.
   Dışarıdan JSON beklemez, garanti çalışır.
*/

// --- AYARLAR ---
const BASE_URL = "/rgztec/";
const IMG_PATH = "assets/images/"; // Resimlerin bulunduğu ana klasör

// --- TAM VERİ SETİ (SENİN JSON VERİNİN JS HALİ) ---
const STORES_DATA = [
  {
    slug: "game-makers",
    title: "Game Makers",
    tagline: "Unity & Unreal templates, UI kits and game-ready assets.",
    banner: "game-makers.webp",
    isFeatured: false,
    sections: [
      { name: "Prototypes", slug: "prototypes" },
      { name: "UI & HUD", slug: "ui-hud" },
      { name: "Unity 2D", slug: "unity-2d" },
      { name: "Unity 3D", slug: "unity-3d" },
      { name: "Unreal", slug: "unreal" },
      { name: "VFX & SFX", slug: "vfx-sfx" }
    ]
  },
  {
    slug: "ai-tools-hub",
    title: "AI Tools Hub",
    tagline: "Agents, automations and AI workflows.",
    banner: "ai-tools-hub.webp",
    isFeatured: false,
    sections: [
      { name: "Agents", slug: "agents" },
      { name: "Analytics", slug: "analytics" },
      { name: "Automations", slug: "automations" },
      { name: "Generators", slug: "generators" },
      { name: "Integrations", slug: "integrations" },
      { name: "Prompts", slug: "prompts" },
      { name: "Utilities", slug: "utilities" },
      { name: "Workflows", slug: "workflows" }
    ]
  },
  {
    slug: "dev-studio-one",
    title: "Dev Studio One",
    tagline: "Starters, dashboards and design systems.",
    banner: "dev-studio-one.webp",
    isFeatured: false,
    sections: [
      { name: "API Boilerplates", slug: "api-boilerplates" },
      { name: "Auth Stacks", slug: "auth-stacks" },
      { name: "Dashboard Kits", slug: "dashboard-kits" },
      { name: "Design Systems", slug: "design-systems" },
      { name: "HTML Starters", slug: "html-starters" }
    ]
  },
  {
    slug: "email-forge",
    title: "Email Forge",
    tagline: "High-converting email templates.",
    banner: "email-forge.webp",
    isFeatured: false,
    sections: [
      { name: "Drip Flows", slug: "drip-flows" },
      { name: "Marketing Campaigns", slug: "marketing-campaigns" },
      { name: "Newsletters", slug: "newsletters" },
      { name: "Notifications", slug: "notifications" },
      { name: "Onboarding", slug: "onboarding" },
      { name: "Receipts & Invoices", slug: "receipts-invoices" },
      { name: "Transactional", slug: "transactional" }
    ]
  },
  {
    slug: "hardware",
    title: "Hardware Lab",
    tagline: "AI accelerators, dev boards, and edge devices.",
    banner: "hardware.webp",
    isFeatured: true, // Bunu öne çıkan yapmak için true bıraktım
    sections: [
      { name: "AI Accelerators", slug: "ai-accelerators" },
      { name: "Dev Boards", slug: "dev-boards" },
      { name: "Edge Devices", slug: "edge-devices" },
      { name: "IoT Devices", slug: "iot-devices" },
      { name: "Medical & Bio-Sensing", slug: "medical-bio-sensing" },
      { name: "Sensors", slug: "sensors" },
      { name: "Smart Controllers", slug: "smart-controllers" }
    ]
  },
  {
    slug: "html-templates",
    title: "HTML Templates",
    tagline: "Landing pages, dashboards and section packs.",
    banner: "html-templates.webp",
    isFeatured: false,
    sections: [
      { name: "Components", slug: "components" },
      { name: "Dashboards", slug: "dashboards" },
      { name: "Email Layouts", slug: "email-layouts" },
      { name: "Landing Pages", slug: "landing-pages" },
      { name: "Marketing Pages", slug: "marketing-pages" },
      { name: "Portfolio", slug: "portfolio" },
      { name: "Sections", slug: "sections" }
    ]
  },
  {
    slug: "icon-smith",
    title: "Icon Smith",
    tagline: "Icon systems for apps, dashboards and brand libraries.",
    banner: "icon-smith.webp",
    isFeatured: false,
    sections: [
      { name: "3D Icons", slug: "3d-icons" },
      { name: "Brand Icons", slug: "brand-icons" },
      { name: "Duotone Icons", slug: "duotone-icons" },
      { name: "Filled Icons", slug: "filled-icons" },
      { name: "Flags Icons", slug: "flags-icons" },
      { name: "Outline Icons", slug: "outline-icons" },
      { name: "Solid Icons", slug: "solid-icons" },
      { name: "System Icons", slug: "system-icons" }
    ]
  },
  {
    slug: "reactorium",
    title: "Reactorium",
    tagline: "React UI kits, charts and navigation patterns.",
    banner: "reactorium.webp",
    isFeatured: false,
    sections: [
      { name: "Charts", slug: "charts" },
      { name: "Forms", slug: "forms" },
      { name: "Hooks", slug: "hooks" },
      { name: "Layouts", slug: "layouts" },
      { name: "Navigation", slug: "navigation" },
      { name: "Tables", slug: "tables" },
      { name: "UI Kit", slug: "ui-kit" }
    ]
  },
  {
    slug: "tiny-js-lab",
    title: "Tiny JS Lab",
    tagline: "Vanilla JS utilities, widgets and micro-patterns.",
    banner: "tiny-js-lab.webp",
    isFeatured: false,
    sections: [
      { name: "Animations", slug: "animations" },
      { name: "Widgets", slug: "widgets" },
      { name: "Validation", slug: "validation" },
      { name: "State Management", slug: "state-management" },
      { name: "Storage", slug: "storage" },
      { name: "Data Fetching", slug: "data-fetching" },
      { name: "DOM Utils", slug: "dom-utils" }
    ]
  },
  {
    slug: "unity-hub",
    title: "Unity Hub",
    tagline: "Unity camera, character, and multiplayer templates.",
    banner: "unity-hub.webp",
    isFeatured: false,
    sections: [
      { name: "Camera Systems", slug: "camera-systems" },
      { name: "Character Controllers", slug: "character-controllers" },
      { name: "Environment Kits", slug: "environment-kits" },
      { name: "Multiplayer", slug: "multiplayer" },
      { name: "Shaders & Materials", slug: "shaders-materials" },
      { name: "Tools & Editors", slug: "tools-editors" }
    ]
  },
  {
    slug: "wp-plugins",
    title: "WP Plugins",
    tagline: "High-quality WordPress plugins.",
    banner: "wp-plugins.webp",
    isFeatured: false,
    sections: [
      { name: "Blocks Editor", slug: "blocks-editor" },
      { name: "E-commerce", slug: "ecommerce" },
      { name: "Forms", slug: "forms" },
      { name: "Membership", slug: "membership" },
      { name: "Performance", slug: "performance" },
      { name: "Security", slug: "security" },
      { name: "SEO", slug: "seo" }
    ]
  }
];

// --- UYGULAMA BAŞLATICI ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Kategoriler Menüsünü (Dropdown) Başlat
  initCategoriesMenu(STORES_DATA);
  
  // 2. Ana Sayfa Galerisini Oluştur
  renderGallery(STORES_DATA);
  
  // 3. Üst Menü (Sub-Nav) Oluştur
  renderSubNav(STORES_DATA);
});


// --- 1. KATEGORİ MENÜSÜ FONKSİYONLARI ---
function initCategoriesMenu(data) {
  const btn = document.getElementById('btn-categories');
  const panel = document.getElementById('categories-panel');
  const listContainer = document.getElementById('categories-list-container'); // HTML'deki ID'ye dikkat
  
  // Eğer panel yoksa, belki farklı bir HTML yapısı vardır, dinamik oluşturalım:
  if (!panel) return;

  // Panelin iç yapısını sıfırla ve yeniden kur (Split View için)
  // Sol taraf: Liste, Sağ taraf: Detay (Basit versiyonda sadece liste olabilir, biz gelişmiş yapıyoruz)
  const panelContent = panel.querySelector('.categories-panel');
  if(panelContent) {
     // Modern "Mega Menu" yapısı için CSS class'ı ekleyelim
     panelContent.classList.add('categories-panel-split');
     panelContent.innerHTML = `
        <div class="cat-menu-sidebar" id="cat-menu-list"></div>
        <div class="cat-menu-preview" id="cat-menu-preview"></div>
     `;
  }

  const listEl = document.getElementById('cat-menu-list');
  const previewEl = document.getElementById('cat-menu-preview');

  if (!listEl || !previewEl) {
     // Eğer HTML/CSS split yapıya uygun değilse, fallback olarak eski listeyi doldur
     if(listContainer) {
        listContainer.innerHTML = data.map(store => `
            <a href="store/${store.slug}/" class="cat-link">
                ${store.title} <span class="cat-arrow">›</span>
            </a>
        `).join('');
     }
     return;
  }

  // --- SOL LİSTEYİ DOLDUR ---
  listEl.innerHTML = data.map((store, index) => `
    <div class="cat-menu-item ${index === 0 ? 'active' : ''}" data-slug="${store.slug}">
      <span>${store.title}</span>
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
    </div>
  `).join('');

  // --- İLK MAĞAZAYI GÖSTER ---
  renderPreview(data[0], previewEl);

  // --- HOVER OLAYLARI ---
  const menuItems = listEl.querySelectorAll('.cat-menu-item');
  menuItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      // Aktif sınıfını güncelle
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Veriyi bul ve göster
      const slug = item.getAttribute('data-slug');
      const store = data.find(s => s.slug === slug);
      renderPreview(store, previewEl);
    });
  });

  // --- AÇMA / KAPAMA (TOGGLE) ---
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('active');
    btn.classList.toggle('active');
  });

  // Dışarı tıklayınca kapat
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !btn.contains(e.target)) {
      panel.classList.remove('active');
      btn.classList.remove('active');
    }
  });
}

function renderPreview(store, container) {
  if (!store) return;
  
  // Alt kategorileri link olarak hazırla
  const sectionLinks = store.sections.map(section => `
    <a href="store/${store.slug}/#${section.slug}" class="preview-section-link">
      ${section.name}
    </a>
  `).join('');

  container.innerHTML = `
    <div class="preview-header">
      <div class="preview-title">${store.title}</div>
      <div class="preview-desc">${store.tagline}</div>
    </div>
    <div class="preview-grid">
       ${sectionLinks}
    </div>
    <div class="preview-footer">
       <a href="store/${store.slug}/" class="btn-view-all">Browse All ${store.title} &rarr;</a>
    </div>
  `;
}


// --- 2. GALERİ (HOME GRID) FONKSİYONLARI ---
function renderGallery(data) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  const html = data.map(store => {
    const storeUrl = `store/${store.slug}/`;
    // Resim yolu: assets/images/game-makers.webp
    const imgUrl = `${IMG_PATH}${store.banner}`; 

    // Featured (Öne Çıkan) Kart Tasarımı
    if (store.isFeatured) {
      return `
        <article class="store-card featured">
          <a href="${storeUrl}" class="card-image-wrap">
            <img src="${imgUrl}" alt="${store.title}" loading="lazy" onerror="this.src='assets/images/placeholder.png'">
            <span class="badge-featured">Featured Store</span>
          </a>
          <div class="card-info">
            <h3><a href="${storeUrl}">${store.title}</a></h3>
            <p>${store.tagline}</p>
            <div class="card-meta">
               <span>${store.sections.length} Categories</span>
               <a href="${storeUrl}" class="link-arrow">Visit &rarr;</a>
            </div>
          </div>
        </article>
      `;
    }

    // Standart Kart Tasarımı
    return `
      <article class="store-card">
        <a href="${storeUrl}" class="card-image-wrap">
          <img src="${imgUrl}" alt="${store.title}" loading="lazy" onerror="this.style.display='none'">
        </a>
        <div class="card-info">
          <h3><a href="${storeUrl}">${store.title}</a></h3>
          <p>${store.tagline}</p>
          <a href="${storeUrl}" class="link-arrow">Browse Store</a>
        </div>
      </article>
    `;
  }).join('');

  gallery.innerHTML = html;
}


// --- 3. SUB-NAV (ÜST YATAY MENÜ) ---
function renderSubNav(data) {
    const navList = document.getElementById('sub-nav-list');
    if(!navList) return;

    // Sadece popüler olanları veya hepsini yan yana dizebiliriz
    navList.innerHTML = data.map(store => `
        <a href="store/${store.slug}/" class="sub-nav-link">${store.title}</a>
    `).join('');
}

// --- CSS YARDIMCISI (JS İLE STİL ENJEKTE EDİYORUZ) ---
// Eğer CSS dosyan yoksa veya eksikse, menünün düzgün görünmesi için bu stilleri ekler.
(function injectStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        /* Mega Menu Stilleri */
        .categories-panel-split { display: flex; min-height: 300px; }
        .cat-menu-sidebar { width: 240px; border-right: 1px solid #eee; background: #fafafa; padding: 10px 0; }
        .cat-menu-preview { flex: 1; padding: 24px; }
        
        .cat-menu-item { 
            padding: 10px 20px; display: flex; justify-content: space-between; 
            align-items: center; cursor: pointer; font-size: 14px; color: #444; font-weight: 500;
        }
        .cat-menu-item:hover, .cat-menu-item.active { background: #fff; color: #ff6b00; font-weight: 600; }
        
        .preview-title { font-size: 18px; font-weight: 700; color: #111; margin-bottom: 4px; }
        .preview-desc { font-size: 13px; color: #666; margin-bottom: 20px; }
        .preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .preview-section-link { 
            font-size: 13px; color: #555; text-decoration: none; padding: 6px 0; 
            border-bottom: 1px solid #f0f0f0; transition: color 0.2s;
        }
        .preview-section-link:hover { color: #ff6b00; padding-left: 4px; }
        .btn-view-all { 
            display: inline-block; padding: 8px 16px; background: #111; color: #fff; 
            text-decoration: none; border-radius: 6px; font-size: 13px; 
        }
        .btn-view-all:hover { background: #333; }

        /* Kart Stilleri */
        .store-card { background: #fff; border: 1px solid #eee; border-radius: 12px; overflow: hidden; transition: transform 0.2s; }
        .store-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .store-card.featured { grid-column: span 2; display: flex; } /* Featured 2 birim genişlik */
        .card-image-wrap { display: block; height: 160px; overflow: hidden; position: relative; background: #f4f4f5; }
        .store-card.featured .card-image-wrap { width: 50%; height: auto; }
        .store-card.featured .card-info { width: 50%; display: flex; flex-direction: column; justify-content: center; }
        
        .card-image-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .card-info { padding: 16px; }
        .card-info h3 { margin: 0 0 8px 0; font-size: 16px; }
        .card-info h3 a { text-decoration: none; color: #111; }
        .card-info p { font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;}
        .link-arrow { font-size: 13px; font-weight: 600; color: #ff6b00; text-decoration: none; }
        
        .badge-featured { position: absolute; top: 10px; left: 10px; background: #000; color: #fff; padding: 4px 8px; font-size: 10px; border-radius: 4px; font-weight: bold; text-transform: uppercase; }

        @media (max-width: 768px) {
            .store-card.featured { grid-column: span 1; display: block; }
            .store-card.featured .card-image-wrap { width: 100%; height: 180px; }
            .store-card.featured .card-info { width: 100%; }
            .categories-panel-split { flex-direction: column; }
            .cat-menu-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #eee; }
        }
    `;
    document.head.appendChild(style);
})();
