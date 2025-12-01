/**
 * RGZTEC Marketplace - Store Shell Engine
 *
 * @version 10.0.0 (FINAL - Etsy Header + Etsy Shop Cards)
 * Bu versiyon, 'renderHeader' fonksiyonunu ve 'Shop/Product'
 * mantığını birleştirir.
 */
(function() {
  "use strict";

  // --- Constants ---

  const DATA_URL = "/rgztec/data/store.data.json";
  const IMAGE_BASE_PATH = "/rgztec/assets/images/store/"; // Resimlerin ana klasörü

  // --- Main Initialization ---

  document.addEventListener("DOMContentLoaded", () => {
    const storeRoot = document.getElementById("store-root");
    const storeBody = document.querySelector("body.store-body");

    if (!storeBody || !storeRoot) {
      console.error("Store Shell Engine: Fatal error. '.store-body' veya '#store-root' bulunamadı.");
      return;
    }

    const storeSlug = storeBody.dataset.store; // örn: "hardware"
    const sectionSlug = storeBody.dataset.section; // örn: "medical-kits" VEYA null

    if (!storeSlug) {
      renderError(new Error("No 'data-store' attribute found on the body tag."), storeRoot);
      return;
    }

    initStore(storeSlug, sectionSlug, storeRoot);
  });

  /**
   * Main asynchronous function
   */
  async function initStore(storeSlug, sectionSlug, targetElement) {
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
          badge: "Yeni Mağaza", banner: null, products: [], sections: [] 
        };
      }

      // --- ANA SAYFA / DÜKKAN SAYFASI MANTIĞI ---
      
      let storeHtml = "";
      
      storeHtml += renderHeader(storeData); // 1. Etsy Header
      storeHtml += renderHero(storeData);   // 2. Ana Hero

      if (sectionSlug) {
        // --- DÜKKAN SAYFASINDAYIZ (örn: /medical-kits/) ---
        const sectionInfo = (storeData.sections || []).find(s => s.slug === sectionSlug);
        const filteredProducts = (storeData.products || []).filter(p => p.section === sectionSlug);
        storeHtml += renderProductSection(filteredProducts, sectionInfo);

      } else {
        // --- ANA MAĞAZA SAYFASINDAYIZ (örn: /hardware/) ---
        storeHtml += renderShopSection(storeData.sections || []);
      }
      // --- Mantık Bitişi ---

      targetElement.innerHTML = storeHtml;

    } catch (error) {
      console.error(`Store Shell Engine: Mağaza yüklenemedi "${escapeHtml(storeSlug)}".`, error);
      renderError(error, targetElement);
    }
  }

  // --- HTML Rendering Functions ---

  // 1. Header (GÜNCELLENDİ v10 - Etsy Tarzı)
  function renderHeader(data) {
    // Basit ikonlar (emoji veya SVG kullanabilirsiniz, şimdilik metin)
    const categoriesIcon = "☰"; // Hamburger icon
    const searchIcon = "🔍"; // Search icon
    const cartIcon = "🛒"; // Cart icon

    return `
      <header class="store-header">
        <div class="store-header-inner">
          
          <div class="store-header-left">
            <a href="/rgztec/" class="store-header-logo">RGZTEC</a>
            <button class="store-header-categories-btn">
              ${categoriesIcon}
              <span>Categories</span>
            </button>
          </div>

          <div class="store-header-search">
            <input type="search" placeholder="Search for anything" />
            <button type="submit" aria-label="Search">
              ${searchIcon}
            </button>
          </div>

          <div class="store-header-actions">
            <a href="#" class="store-header-link">Sign In</a>
            <a href="#" class="store-header-icon-btn" aria-label="Cart">
              ${cartIcon}
            </a>
          </div>

        </div>
      </header>
    `;
  }
  
  // 2. Hero (Değişiklik yok)
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

  // 3A. DÜKKAN BÖLÜMÜ (Ana Mağaza Sayfası için)
  function renderShopSection(sections) {
    return `
      <main class="store-shops">
        <div class="store-shops-header">
          <h2>Explore Our Shops</h2>
        </div>
        ${renderShopGrid(sections)}
      </main>
    `;
  }

  // 3B. DÜKKAN KARTLARI (Etsy Tarzı)
  function renderShopGrid(sections) {
    if (!Array.isArray(sections) || sections.length === 0) {
      return `
        <div class="products-grid-empty">
          <h3>Shops Coming Soon</h3>
          <p>Categories for this store are being set up.</p>
        </div>
      `;
    }

    const shopCards = sections
      .map(section => renderShopCard(section))
      .join("");

    return `
      <div class="shop-grid">
        ${shopCards}
      </div>
    `;
  }

  // 3C. TEK BİR DÜKKAN KARTI
  function renderShopCard(section) {
    if (!section) return ""; 

    const name = escapeHtml(section.name || "Untitled Shop");
    const tagline = escapeHtml(section.tagline || "");
    const imageUrl = section.image ? `${IMAGE_BASE_PATH}${escapeHtml(section.image)}` : "";
    const linkHref = `${escapeHtml(section.slug)}/`; // örn: "medical-kits/"

    const imageElement = imageUrl
      ? `<img src="${imageUrl}" alt="${name}" loading="lazy">`
      : `<div class="product-media-placeholder"></div>`; 

    return `
      <a href="${linkHref}" class="shop-card">
        <div class="shop-card-media">
          ${imageElement}
        </div>
        <div class="shop-card-body">
          <h3 class="shop-card-title">${name}</h3>
          <p class="shop-card-tagline">${tagline}</p>
        </div>
      </a>
    `;
  }


  // 4A. ÜRÜN BÖLÜMÜ (Dükkan Sayfası için)
  function renderProductSection(products, sectionInfo) {
    const title = sectionInfo ? escapeHtml(sectionInfo.name) : "Products";
    return `
      <main class="store-products">
        <div class="store-products-header">
          <h2>${title}</h2>
        </div>
        ${renderProductGrid(products, sectionInfo ? sectionInfo.slug : null)}
      </main>
    `;
  }

  // 4B. ÜRÜN KARTLARI
  function renderProductGrid(products, sectionSlug) {
    if (!Array.isArray(products) || products.length === 0) {
      const emptyTitle = sectionSlug 
        ? "No Products in This Shop Yet" 
        : "Products Coming Soon";
      const emptyMessage = sectionSlug
        ? "Sellers will add products to this shop soon. Please check back later!"
        : "This store is currently setting up. Please check back later!";

      return `
        <div class="products-grid-empty">
          <h3>${emptyTitle}</h3>
          <p>${emptyMessage}</p>
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

  // 4C. TEK BİR ÜRÜN KARTI
  function renderProductCard(product) {
    if (!product) return ""; 
    const title = escapeHtml(product.title || "Untitled Product");
    const tagline = escapeHtml(product.tagline || "");
    const imageUrl = product.image ? `${IMAGE_BASE_PATH}${escapeHtml(product.image)}` : "";
    const hasPrice = product.price !== null && product.price !== undefined && String(product.price).trim() !== "";
    const priceText = hasPrice ? formatPrice(product.price) : "Contact for Price"; 

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

  // Hata Fonksiyonu
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

  // --- Helper Functions --- (No changes)

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
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
    } catch (e) {
      return "$" + num.toFixed(2);
    }
  }

})();




