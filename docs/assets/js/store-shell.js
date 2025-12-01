/**
 * RGZTEC Marketplace - Store Shell Engine
 *
 * @version 6.0.0 (Sections Navigation)
 * Bu versiyon, 'store.data.json' içindeki 'sections' dizisini okur
 * ve Hero bölümünün altına bir alt kategori navigasyon menüsü ekler.
 *
 * * Header (v3) aktiftir.
 * * "Ortak Kart" ve "Eksik Fiyat" korumalarını içerir.
 * * Hero "description" (v5) alanı aktiftir.
 */
(function() {
  "use strict";

  // --- Constants ---

  const DATA_URL = "/rgztec/data/store.data.json";
  const IMAGE_BASE_PATH = "/rgztec/assets/images/store/";

  // --- Main Initialization ---

  document.addEventListener("DOMContentLoaded", () => {
    const storeRoot = document.getElementById("store-root");
    const storeBody = document.querySelector("body.store-body");

    if (!storeBody || !storeRoot) {
      console.error("Store Shell Engine: Fatal error. '.store-body' veya '#store-root' bulunamadı.");
      return;
    }

    const storeSlug = storeBody.dataset.store;

    if (!storeSlug || storeSlug.trim() === "") {
      renderError(new Error("No 'data-store' attribute found on the body tag."), storeRoot);
      return;
    }

    initStore(storeSlug, storeRoot);
  });

  /**
   * Main asynchronous function
   */
  async function initStore(storeSlug, targetElement) {
    let storeData; 

    try {
      const allStoresData = await fetchJSON(DATA_URL);

      if (!allStoresData) {
        throw new Error("Mağaza veri dosyası (store.data.json) boş veya eksik.");
      }

      storeData = allStoresData[storeSlug];

      // "Ortak Kart" (Generic Store) Koruması
      if (!storeData) {
        console.warn(`Store Shell Engine: "${escapeHtml(storeSlug)}" slug'ı için veri bulunamadı. Ortak bir mağaza (common card) oluşturuluyor.`);
        
        storeData = {
          title: `${escapeHtml(storeSlug)} Mağazası`,
          tagline: "Bu mağaza yakında sizlerle.",
          description: "İçerik yakında yüklenecek. Lütfen daha sonra tekrar kontrol edin.",
          badge: "Yeni Mağaza",
          banner: null, 
          products: [],
          sections: [] // Ortak kartın 'sections' dizisi boş olmalı
        };
      }

      // Render all components
      let storeHtml = "";
      
      storeHtml += renderHeader(storeData); 
      storeHtml += renderHero(storeData);   
      storeHtml += renderMainContent(storeData); // Bu fonksiyon artık sections'ları da render edecek

      targetElement.innerHTML = storeHtml;

    } catch (error) {
      console.error(`Store Shell Engine: Mağaza yüklenemedi "${escapeHtml(storeSlug)}".`, error);
      renderError(error, targetElement);
    }
  }

  // --- HTML Rendering Functions (CSS ile Uyumlu) ---

  // Header (Aktif)
  function renderHeader(data) {
    const storeTitle = escapeHtml(data.title || "RGZTEC Store");

    return `
      <header class="store-header">
        <div class="store-header-inner">
          <a href="/rgztec/" class="store-header-logo">RGZTEC</a>
          <span class="store-header-title">${storeTitle}</span>
          <nav class="store-header-nav"></nav>
        </div>
      </header>
    `;
  }

  // Hero (Açıklama alanı dahil)
  function renderHero(data) {
    const title = escapeHtml(data.title || "Welcome");
    const tagline = escapeHtml(data.tagline || "");
    const badge = escapeHtml(data.badge || "Official Store");
    const description = escapeHtml(data.description || ""); 
    const bannerUrl = data.banner ? `${IMAGE_BASE_PATH}${escapeHtml(data.banner)}` : "";

    return `
      <section class="store-hero">
        <div class="store-hero-inner">
          <div class="store-hero-left">
            <span class="store-badge">${badge}</span>
            <h1>${title}</h1>
            
            ${tagline ? `<p class="store-hero-tagline">${tagline}</p>` : ''}
            ${description ? `<p class="store-hero-description">${description}</p>` : ''}

          </div>
          <div class="store-hero-right">
            ${bannerUrl ? `<img src="${bannerUrl}" alt="${title}" class="store-hero-img">` : ''}
          </div>
        </div>
      </section>
    `;
  }

  // Main Content (GÜNCELLENDİ)
  function renderMainContent(data) {
    // Bu fonksiyon artık hem 'sections' menüsünü hem de 'products' grid'ini çağırıyor
    return `
      <main class="store-products">
        
        ${renderSectionsNav(data.sections || [])}

        <div class="store-products-header">
          <h2>Products</h2>
        </div>
        ${renderProductGrid(data.products || [])}
      </main>
    `;
  }

  // *** YENİ FONKSİYON ***
  /**
   * Mağaza alt kategorilerini (dükkanlarını) premium bir navigasyon menüsü olarak render eder.
   * @param {Array<object>} sections - Mağazanın sections dizisi
   * @returns {string} HTML string for the sections navigation bar.
   */
  function renderSectionsNav(sections) {
    // Eğer 'sections' yoksa veya boşsa, hiçbir şey gösterme
    if (!Array.isArray(sections) || sections.length === 0) {
      return ''; 
    }

    // Her bir 'section' objesini bir link ('li') elemanına dönüştür
    const navItems = sections
      .map(section => {
        const slug = escapeHtml(section.slug || '#');
        const name = escapeHtml(section.name || 'Unnamed Section');
        
        // Slug'ı bir sayfa içi çapa (#) olarak kullanıyoruz.
        // İleride burayı '/hardware/sensors' gibi tam bir linke dönüştürebilirsiniz.
        return `
          <li class="store-sections-nav__item">
            <a href="#${slug}" class="store-sections-nav__link">${name}</a>
          </li>
        `;
      })
      .join("");

    // Linkleri bir navigasyon çubuğu içine sar
    return `
      <nav class="store-sections-nav">
        <ul class="store-sections-nav__list">
          ${navItems}
        </ul>
      </nav>
    `;
  }
  // *** YENİ FONKSİYON BİTTİ ***


  // Product Grid (Değişiklik yok)
  function renderProductGrid(products) {
    if (!Array.isArray(products) || products.length === 0) {
      return `
        <div class="products-grid-empty">
          <h3>Products Coming Soon</h3>
          <p>This store is currently setting up. Please check back later!</p>
        </div>
      `;
    }

    const productCards = products
      .map(product => renderProductCard(product))
      .join("");

    return `
      <div class="products-grid">
        ${productCards}
      </div>
    `;
  }

  // Product Card (Değişiklik yok, Fiyat Koruması aktif)
  function renderProductCard(product) {
    if (!product) return ""; 

    const title = escapeHtml(product.title || "Untitled Product");
    const tagline = escapeHtml(product.tagline || "");
    const imageUrl = product.image ? `${IMAGE_BASE_PATH}${escapeHtml(product.image)}` : "";

    const hasPrice = product.price !== null && product.price !== undefined && String(product.price).trim() !== "";
    const priceText = hasPrice ? formatPrice(product.price) : "Fiyat Sorunuz"; 

    const imageElement = imageUrl
      ? `<img src="${imageUrl}" alt="${title}" loading="lazy">`
      : `<div class="product-media-placeholder"></div>`; 

    return `
      <a href="#" class="product-card">
        <div class="product-media">
          ${imageElement}
        </div>
        <div class="product-body">
          <h3 class="product-title">${title}</h3>
          <p class="product-tagline">${tagline}</p>
          <div class="product-price">${priceText}</div>
        </div>
      </a>
    `;
  }

  // Error (Değişiklik yok)
  function renderError(error, targetElement) {
    targetElement.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h1 style="font-size: 1.5rem; font-weight: 700;">RGZTEC</h1>
        <h2 style="font-size: 2rem; margin: 10px 0;">An Error Occurred</h2>
        <p style="font-size: 1.1rem; color: #555;">We're sorry, but this store could not be loaded.</p>
        <code style="display: block; background: #f5f5f5; color: #d73a49; padding: 10px; margin-top: 20px; border-radius: 6px;">
          ${escapeHtml(error.message)}
        </code>
      </div>
    `;
  }

  // --- Helper Functions ---

  async function fetchJSON(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP error fetching ${url}: ${response.status} ${response.statusText}`);
    }
    if (response.status === 204) return null;
    try {
      return await response.json();
    } catch (jsonError) {
      throw new Error(`Failed to parse JSON from ${url}: ${jsonError.message}`);
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

  function formatPrice(price) {
    const num = parseFloat(price);
    if (isNaN(num)) {
      return escapeHtml(price); 
    }
    return "$" + num.toFixed(2);
  }

})();




