/**
 * RGZTEC Marketplace - Store Shell Engine
 *
 * @version 18.2.0 (NİHAİ - İç İçe Mimari + Düzeltilmiş Nav Mantığı)
 *
 * NİHAİ VİZYON (v18.2):
 * 1. Tek "Beyin": Tüm veri (11 mağaza, 75 dükkan, tüm ürünler) TEK BİR
 * /data/store.data.json (v18.2) dosyasından yönetilir.
 * 2. "Anahtar" (Key): Hangi sayfanın yükleneceği, <body>'deki
 * 'data-path' (örn: "tiny-js-lab/animations") ile belirlenir.
 * 3. "İç İçe" (Recursive) Mantık: Her katman kendi banner'ına ve
 * "Etsy tarzı" kartlarına sahip olabilir.
 * 4. "Fiyatsız" Tasarım: Sistemde "fiyatlı" küçük kartlar yoktur.
 *
 * DÜZELTME (v18.2): Section Nav (dükkan menüsü) artık Katman 1'de (Mağaza)
 * "çocukları" (alta link), Katman 2+'de (Dükkan) "kardeşleri" (yana link)
 * gösterecek şekilde düzeltildi.
 */
(function () {
  "use strict";

  // ---- Sabitler (v18.2) ----
  const DATA_URL = "/rgztec/data/store.data.json"; // TEK BEYİN
  const IMAGE_BASE_PATH = "/rgztec/assets/images/store/";

  // ---- Başlatma ----
  document.addEventListener("DOMContentLoaded", () => {
    const storeRoot = document.getElementById("store-root");
    const storeBody = document.querySelector("body.store-body");

    if (!storeBody || !storeRoot) {
      console.error(
        "Store Shell Engine: '.store-body' veya '#store-root' bulunamadı."
      );
      return;
    }

    const path = storeBody.dataset.path || null;
    if (!path) {
      renderError(
        new Error("No 'data-path' attribute found on the body tag."),
        storeRoot
      );
      return;
    }

    initStore(path, storeRoot);
  });

  // ---- Ana Asenkron Fonksiyon (GÜNCELLENDİ v18.2) ----
  async function initStore(path, targetElement) {
    try {
      // 1. ADIM: "BEYİN" dosyasını (v18.2) çek
      const allStoresData = await fetchJSON(DATA_URL);
      if (!allStoresData) {
        throw new Error("Mağaza veri dosyası (store.data.json) boş veya eksik.");
      }

      // 2. ADIM: 'data-path'i kullanarak doğru veriyi bul
      const {
        currentData,
        parentData,
        rootData,
        rootSlug,
        currentSlug,
      } = findDataByPath(allStoresData, path);

      if (!currentData) {
        throw new Error(`Path not found in store.data.json: "${path}"`);
      }
      
      // ---- HTML Sıralaması (NİHAİ v18.2) ----
      let storeHtml = "";
      
      // 1. Header
      storeHtml += renderHeader();
      
      // 2. Ana Mağaza Nav'ı (Root'ları listeler: Game Makers, AI Tools...)
      storeHtml += renderStoreNav(allStoresData, rootSlug);
      
      // 3. Dükkan Nav'ı (DÜZELTME v18.2: Hangi dükkanları göstereceğini belirle)
      let sectionsForNav = null;
      let isRootLevelNav = false; // Nav'ın KÖK'te mi (Katman 1) olduğunu belirle

      if (parentData) {
          // Katman 2+ (Dükkan/Alt-Dükkan): "Kardeşleri" göster
          sectionsForNav = parentData.sections;
          isRootLevelNav = false;
      } else {
          // Katman 1 (Mağaza): "Çocukları" göster
          sectionsForNav = currentData.sections;
          isRootLevelNav = true;
      }
      
      // Katman 1'deysek, (örn: tiny-js-lab), aktif 'kardeş' yoktur.
      // Katman 2+'deysek, (örn: animations), aktif 'kardeş' currentSlug'dır.
      const activeSlugForNav = parentData ? currentSlug : null;
      
      storeHtml += renderSectionNav(sectionsForNav, activeSlugForNav, isRootLevelNav);
      // ---- Düzeltme Bitti ----

      // 4. BANNER (Her katmanın kendi banner'ı)
      storeHtml += renderHero(currentData);
      
      // 5. KARTLAR (İç İçe Mantık)
      // Önce Alt Dükkanları ('sections') listele
      if (currentData.sections && currentData.sections.length > 0) {
        storeHtml += renderShopSection(currentData.sections);
      }
      // Sonra Ürünleri ('products') listele
      if (currentData.products && currentData.products.length > 0) {
        storeHtml += renderProductSection(currentData.products);
      }
      
      // Hiç alt dükkan veya ürün yoksa
      if ((!currentData.sections || currentData.sections.length === 0) &&
          (!currentData.products || currentData.products.length === 0)) {
        storeHtml += renderEmptyShop();
      }

      targetElement.innerHTML = storeHtml;
      wireInteractions(targetElement);

    } catch (error) {
      console.error(
        `Store Shell Engine: Mağaza yüklenemedi "${escapeHtml(path)}".`,
        error
      );
      renderError(error, targetElement);
    }
  }

  // ---- Veri Bulma Fonksiyonu (v18.2 - Değişiklik Yok) ----
  function findDataByPath(allStoresData, path) {
    const segments = path.split("/");
    
    let currentData = allStoresData;
    let parentData = null;
    let rootData = null;
    let rootSlug = segments[0] || null;
    let currentSlug = segments[segments.length - 1] || null;

    if (!rootSlug || !allStoresData[rootSlug]) {
      return { currentData: null };
    }

    rootData = allStoresData[rootSlug];
    currentData = rootData;

    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      parentData = currentData;
      const sections = currentData.sections || [];
      const nextData = sections.find(s => s.slug === segment);
      if (nextData) {
        currentData = nextData;
      } else {
        return { currentData: null };
      }
    }
    
    if (segments.length === 1) {
        parentData = null; 
    }

    return {
      currentData, parentData, rootData, rootSlug, currentSlug
    };
  }

  // ---- HTML Render Fonksiyonları (v18.2) ----

  // 1) Ana Header (SVG İkonlar) - Tam Kod
  function renderHeader() {
    const ICON_CATEGORIES = `
      <svg class="store-header-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>`;
    const ICON_SEARCH = `
      <svg class="store-header-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>`;
    const ICON_GIFT = `
      <svg class="store-header-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A3.375 3.375 0 0 0 12 1.5h-1.5a3.375 3.375 0 0 0-3.375 3.375H12Zm0 0V11.25m0-6.375H13.5A3.375 3.375 0 0 1 13.5 1.5H12v3.375Z" />
      </svg>`;
    const ICON_CART = `
      <svg class="store-header-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>`;

    return `
      <header class="store-header">
        <div class="store-header-inner">
          <div class="store-header-left">
            <a href="/rgztec/" class="store-header-logo">RGZTEC</a>
            <button class="store-header-categories-btn" type="button">
              ${ICON_CATEGORIES}
              <span>Categories</span>
            </button>
          </div>
          <div class="store-header-center">
            <form class="store-header-search" role="search">
              <input
                type="search"
                placeholder="Search for anything"
                aria-label="Search RGZTEC marketplace"
              />
              <button type="submit" aria-label="Search">
                ${ICON_SEARCH}
              </button>
            </form>
          </div>
          <div class="store-header-right">
            <div class="store-header-secondary">
              <a href="#" class="store-header-secondary-link">Dashboard / Editor</a>
              <a href="#" class="store-header-secondary-link">Sign In</a>
              <a href="#" class="store-header-secondary-link">Support</a>
            </div>
            <div class="store-header-actions">
              <button class="store-header-icon-pill" type="button" aria-label="Gift cards">
                ${ICON_GIFT}
              </button>
              <button class="store-header-icon-pill" type="button" aria-label="Cart">
                ${ICON_CART}
              </button>
              <a href="#" class="store-header-cta">
                <span>Open Store</span>
              </a>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  // 2) Ana Mağaza Nav'ı
  function renderStoreNav(allStoresData, currentRootSlug) {
    const storeLinks = Object.keys(allStoresData)
      .map((slug) => {
        const store = allStoresData[slug];
        if (!store || !store.title) return "";
        const name = escapeHtml(store.title);
        const href = `/rgztec/store/${slug}/`;
        const isActive = slug === currentRootSlug;
        const linkClass = isActive
          ? "store-main-nav__link active"
          : "store-main-nav__link";
        return `
          <li class="store-main-nav__item">
            <a href="${href}" class="${linkClass}">${name}</a>
          </li>
        `;
      })
      .join("");
    return `
      <nav class="store-main-nav" aria-label="RGZTEC stores">
        <ul class="store-main-nav__list">
          ${storeLinks}
        </ul>
      </nav>
    `;
  }

  // 3) Dükkan Nav'ı (GÜNCELLENDİ v18.2 - Link mantığı düzeltildi)
  function renderSectionNav(sections, currentSlug, isRootLevel = false) {
    if (!Array.isArray(sections) || sections.length === 0) return "";
    
    const navItems = sections
      .map((section) => {
        if (!section) return "";
        const slug = escapeHtml(section.slug || "");
        const name = escapeHtml(section.name || "Unnamed Section");
        const isActive = slug === currentSlug;
        const linkClass = isActive
          ? "store-section-nav__link active"
          : "store-section-nav__link";
        
        // YENİ LİNK MANTIĞI (v18.2)
        // Kök düzeydeysek (Mağaza), linkler alt klasöre gider (örn: "animations/")
        // Alt düzeydeysek (Dükkan), linkler kardeş klasöre gider (örn: "../widgets/")
        const href = isActive
          ? "#"
          : isRootLevel
          ? `${slug}/`   // Kök -> Alt klasör (Katman 1)
          : `../${slug}/`; // Kardeş -> Kardeş (Katman 2+)

        return `
          <li class="store-section-nav__item">
            <a href="${href}" class="${linkClass}">${name}</a>
          </li>
        `;
      })
      .join("");
    return `
      <nav class="store-section-nav" aria-label="Store sections">
        <ul class="store-section-nav__list">
          ${navItems}
        </ul>
      </nav>
    `;
  }

  // 4) BANNER
  function renderHero(data) {
    const title = escapeHtml(data.title || data.name || "Welcome");
    const tagline = escapeHtml(data.tagline || "");
    const badge = escapeHtml(data.badge || "Official");
    const description = escapeHtml(data.description || "");
    const bannerUrl = data.banner
      ? `${IMAGE_BASE_PATH}${escapeHtml(data.banner)}`
      : "";
    return `
      <section class="store-hero">
        <div class="store-hero-inner">
          <div class="store-hero-left">
            <span class="store-badge">${badge}</span>
            <h1>${title}</h1>
            ${tagline ? `<p class="store-hero-tagline">${tagline}</p>` : ""}
            ${description ? `<p class="store-hero-description">${description}</p>` : ""}
          </div>
          <div class="store-hero-right">
            ${bannerUrl ? `<img src="${bannerUrl}" alt="${title}" class="store-hero-img" loading="lazy">` : ""}
          </div>
        </div>
      </section>
    `;
  }

  // 5A) 'Etsy Tarzı' ALT-DÜKKAN Listesi
  function renderShopSection(sections) {
    const shopCards = sections.map((section) => renderShopCard(section)).join("");
    return `
      <main class="store-shops">
        <div class="store-shops-header">
          <h2>Explore Shops</h2>
        </div>
        <div class="shop-grid">${shopCards}</div>
      </main>
    `;
  }

  // 5B) Tek ALT-DÜKKAN Kartı ('Etsy Tarzı')
  function renderShopCard(section) {
    if (!section) return "";
    const name = escapeHtml(section.name || "Untitled Shop");
    const tagline = escapeHtml(section.tagline || "");
    const slug = escapeHtml(section.slug || "");
    const imageUrl = section.image 
      ? `${IMAGE_BASE_PATH}${escapeHtml(section.image)}`
      : ""; 
    
    // Link bir alt katmana gider (örn: "animations/")
    const href = `${slug}/`; 
    
    const imageElement = imageUrl
      ? `<img src="${imageUrl}" alt="${name}" loading="lazy">`
      : `<div class="product-media-placeholder"></div>`;
    
    return `
      <a href="${href}" class="shop-card">
        <div class="shop-card-media">${imageElement}</div>
        <div class="shop-card-body">
          <h3 class="shop-card-title">${name}</h3>
          <p class="shop-card-tagline">${tagline}</p>
        </div>
      </a>
    `;
  }

  // 6A) 'Etsy Tarzı' ÜRÜN Listesi
  function renderProductSection(products) {
    const productCards = products.map((p) => renderProductCard(p)).join("");
    return `
      <main class="store-products">
        <div class="store-products-header">
          <h2>Explore Products</h2>
        </div>
        <div class="shop-grid">${productCards}</div>
      </main>
    `;
  }

  // 6B) Tek ÜRÜN Kartı ('Etsy Tarzı', FİYATSIZ)
  function renderProductCard(product) {
    if (!product) return "";
    const title = escapeHtml(product.title || "Untitled Product");
    const tagline = escapeHtml(product.tagline || "");
    const imageUrl = product.image
      ? `${IMAGE_BASE_PATH}${escapeHtml(product.image)}`
      : "";
    
    // Link ayrı sayfaya (Gumroad vb.) gider
    const url = product.url ? escapeHtml(product.url) : "#";
    const target = 'target="_blank" rel="noopener noreferrer"';

    const imageElement = imageUrl
      ? `<img src="${imageUrl}" alt="${title}" loading="lazy">`
      : `<div class="product-media-placeholder"></div>`;

    // "Fiyat olayı" bu fonksiyonla çözüldü.
    return `
      <a href="${url}" class="shop-card" ${target}>
        <div class="shop-card-media">${imageElement}</div>
        <div class="shop-card-body">
          <h3 class="shop-card-title">${title}</h3>
          <p class="shop-card-tagline">${tagline}</p>
        </div>
      </a>
    `;
  }
  
  // 7) Boş Dükkan
  function renderEmptyShop() {
    return `
      <main class="store-products">
        <div class="products-grid-empty">
          <h3>Coming Soon</h3>
          <p>New sections and products are being added to this shop.</p>
        </div>
      </main>
    `;
  }

  // ---- Etkileşimleri bağla ----
  function wireInteractions(root) {
    const searchForm = root.querySelector(".store-header-search");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = searchForm.querySelector("input[type='search']");
        const q = input ? input.value.trim() : "";
        if (!q) return;
        console.log("[RGZTEC] Search:", q);
      });
    }
  }

  // ---- Hata Çıktısı ----
  function renderError(error, targetElement) {
    targetElement.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h1 style="font-size: 1.5rem; font-weight: 700;">RGZTEC</h1>
        <h2 style="font-size: 2rem; margin: 10px 0;">An Error Occurred</h2>
        <p style="font-size: 1.1rem; color: #555;">
          We're sorry, but this store could not be loaded.
        </p>
        <code style="display: block; background: #f5f5f5; color: #d73a49; padding: 10px; margin-top: 20px; border-radius: 6px;">
          ${escapeHtml(error.message)}
        </code>
      </div>
    `;
  }

  // ---- Yardımcılar (v18.2) ----
  async function fetchJSON(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
       if (response.status === 404) throw new Error(`File not found: ${url}`);
      throw new Error(
        `HTTP error fetching ${url}: ${response.status} ${response.statusText}`
      );
    }
    if (response.status === 204) return null;
    try {
      return await response.json();
    } catch (jsonError) {
      throw new Error(
        `Failed to parse JSON from ${url}: ${jsonError.message}`
      );
    }
  }

  function escapeHtml(unsafe) {
    const str = String(unsafe || "");
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
