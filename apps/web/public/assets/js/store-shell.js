/**
 * RGZTEC Marketplace - Store Shell Engine
 *
 * @version 15.0.0 (NİHAİ - Hero Logic + Product Links)
 * 3 katmanlı RGZTEC mağaza yapısı:
 * 1) Ana Header (logo + arama + hesap) - SVG İkonlar
 * 2) Ana Mağaza Navigasyonu (Game Makers, Hardware Lab, ...)
 * 3) Aktif Mağaza Dükkan Navigasyonu (AI Accelerators, Dev Boards, ...)
 *
 * DÜZELTME (v14.2): Hero bölümü artık sadece ana mağaza
 * sayfasında gösteriliyor (dükkan sayfalarında değil).
 *
 * DÜZELTME (v15.0): Ürün kartları artık JSON'daki "url"
 * alanına bağlanıyor ve ayrı sayfa açıyor.
 */
(function () {
  "use strict";

  // ---- Sabitler ----
  const DATA_URL = "/rgztec/data/store.data.json"; 
  const PRODUCT_DATA_PATH = "/rgztec/data/products/"; 
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

    const storeSlug = storeBody.dataset.store;
    const sectionSlug = storeBody.dataset.section || null;

    if (!storeSlug) {
      renderError(
        new Error("No 'data-store' attribute found on the body tag."),
        storeRoot
      );
      return;
    }
    initStore(storeSlug, sectionSlug, storeRoot);
  });

  // ---- Ana Asenkron Fonksiyon ----
  async function initStore(storeSlug, sectionSlug, targetElement) {
    let storeData;
    let allStoresData;
    let productData = [];

    try {
      // 1. ADIM: Ana mağaza yapısını çek
      allStoresData = await fetchJSON(DATA_URL);
      if (!allStoresData) {
        throw new Error("Mağaza veri dosyası (store.data.json) boş veya eksik.");
      }
      storeData = allStoresData[storeSlug];

      // Fallback mağaza
      if (!storeData) {
        console.warn(
          `Store Shell Engine: "${escapeHtml(
            storeSlug
          )}" için veri bulunamadı. Fallback kullanılıyor.`
        );
        storeData = {
          title: `${storeSlug} Store`,
          tagline: "This store will be available soon.",
          badge: "Coming Soon", banner: null, products: [], sections: []
        };
      }
      
      // 2. ADIM: Sadece bu mağazaya ait ürünleri (dükkan datalarını) çek
      storeData.products = [];
      try {
        const productDataUrl = `${PRODUCT_DATA_PATH}${storeSlug}.json`; 
        productData = await fetchJSON(productDataUrl);
        if (productData && Array.isArray(productData)) {
            storeData.products = productData;
        } else {
            console.warn(`Ürün verisi bulunamadı veya formatı yanlış: ${productDataUrl}`);
        }
      } catch (productError) {
        if (productError.message.includes("File not found")) {
            console.warn(`Bu mağaza için ürün dosyası bulunamadı: ${productError.message}`);
        } else {
            console.error("Ürün dosyası çekilirken hata oluştu:", productError);
        }
        storeData.products = [];
      }

      // ---- HTML Sıralaması (DÜZELTME v14.2 - Hero Mantığı) ----
      let storeHtml = "";
      storeHtml += renderHeader();
      storeHtml += renderStoreNav(allStoresData, storeSlug);
      storeHtml += renderSectionNav(storeData.sections || [], sectionSlug);

      // 5) İçerik: Ana mağaza mı / alt dükkan mı?
      if (sectionSlug) {
        // Alt dükkan sayfası (Hero GÖSTERMEZ)
        const sectionInfo = (storeData.sections || []).find(
          (s) => s.slug === sectionSlug
        );
        const filteredProducts = (storeData.products || []).filter(
          (p) => p.section === sectionSlug
        );
        storeHtml += renderProductSection(filteredProducts, sectionInfo);
      } else {
        // Ana mağaza sayfası (Hero GÖSTERİR)
        storeHtml += renderHero(storeData); // <-- Hero buraya taşındı
        storeHtml += renderShopSection(storeData.sections || []);
      }
      // ---- Düzeltme Bitti ----

      targetElement.innerHTML = storeHtml;
      wireInteractions(targetElement);
    } catch (error) {
      console.error(
        `Store Shell Engine: Mağaza yüklenemedi "${escapeHtml(storeSlug)}".`,
        error
      );
      renderError(error, targetElement);
    }
  }

  // ---- HTML Render Fonksiyonları ----

  // 1) Ana Header (SVG İkonlar)
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

  // 2) Ana Mağaza Navigasyonu
  function renderStoreNav(allStoresData, currentStoreSlug) {
    const storeLinks = Object.keys(allStoresData)
      .map((slug) => {
        const store = allStoresData[slug];
        if (!store || !store.title) return "";
        const name = escapeHtml(store.title);
        const href = `/rgztec/store/${slug}/`;
        const isActive = slug === currentStoreSlug;
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

  // 3) Dükkan Navigasyonu
  function renderSectionNav(sections, currentSectionSlug) {
    if (!Array.isArray(sections) || sections.length === 0) return "";
    const navItems = sections
      .map((section) => {
        if (!section) return "";
        const slug = escapeHtml(section.slug || "");
        const name = escapeHtml(section.name || "Unnamed Section");
        const isActive = slug === currentSectionSlug;
        const linkClass = isActive
          ? "store-section-nav__link active"
          : "store-section-nav__link";
        const href = isActive
          ? "#"
          : currentSectionSlug
          ? `../${slug}/`
          : `${slug}/`;
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

  // 4) Hero
  function renderHero(data) {
    const title = escapeHtml(data.title || "Welcome");
    const tagline = escapeHtml(data.tagline || "");
    const badge = escapeHtml(data.badge || "Official Store");
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

  // 5A) Ana Mağaza – dükkan listesi
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

  // 5B) Dükkan kart grid’i
  function renderShopGrid(sections) {
    if (!Array.isArray(sections) || sections.length === 0) {
      return `
        <div class="products-grid-empty">
          <h3>Shops Coming Soon</h3>
          <p>Categories for this store are being set up.</p>
        </div>
      `;
    }
    const shopCards = sections.map((section) => renderShopCard(section)).join("");
    return `<div class="shop-grid">${shopCards}</div>`;
  }

  // 5C) Tek bir dükkan kartı
  function renderShopCard(section) {
    if (!section) return "";
    const name = escapeHtml(section.name || "Untitled Shop");
    const tagline = escapeHtml(section.tagline || "");
    const slug = escapeHtml(section.slug || "");
    const imageUrl = section.image ? `${IMAGE_BASE_PATH}${escapeHtml(section.image)}` : "";
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

  // 6A) Dükkan sayfası – ürünler
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

  // 6B) Ürün grid’i
  function renderProductGrid(products, sectionSlug) {
    if (!Array.isArray(products) || products.length === 0) {
      const emptyTitle = sectionSlug ? "No Products in This Shop Yet" : "Products Coming Soon";
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
    const productCards = products.map((p) => renderProductCard(p)).join("");
    return `<div class="products-grid">${productCards}</div>`;
  }

  // 6C) Tek ürün kartı (DÜZELTME v15.0 - Ayrı Sayfa Linki)
  function renderProductCard(product) {
    if (!product) return "";

    const title = escapeHtml(product.title || "Untitled Product");
    const tagline = escapeHtml(product.tagline || "");
    const imageUrl = product.image ? `${IMAGE_BASE_PATH}${escapeHtml(product.image)}` : "";
    
    // YENİ: Fiyat formatlaması
    const hasPrice = product.price !== null && product.price !== undefined && String(product.price).trim() !== "";
    const priceText = hasPrice ? formatPrice(product.price) : "Contact for Price";
    
    // YENİ: URL ve Target (target="_blank")
    const url = product.url ? escapeHtml(product.url) : "#"; // Varsayılan '#'
    const isExternal = url.startsWith("http://") || url.startsWith("https://");
    const target = isExternal ? 'target="_blank" rel="noopener noreferrer"' : "";

    const imageElement = imageUrl
      ? `<img src="${imageUrl}" alt="${title}" loading="lazy">`
      : `<div class="product-media-placeholder"></div>`;

    return `
      <a href="${url}" class="product-card" ${target}>
        <div class="product-media">${imageElement}</div>
        <div class="product-body">
          <h3 class="product-title">${title}</h3>
          <p class="product-tagline">${tagline}</p>
          <div class="product-price">${priceText}</div>
        </div>
      </a>
    `;
  }
  // ---- Düzeltme Bitti ----

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

  // ---- Yardımcılar ----
  async function fetchJSON(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
       if (response.status === 404) {
        throw new Error(`File not found: ${url}`);
      }
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

  function formatPrice(price) {
    const num = parseFloat(price);
    if (isNaN(num)) return escapeHtml(price);
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(num);
    } catch (e) {
      return "$" + num.toFixed(2);
    }
  }
})();
