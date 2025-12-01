/**
 * RGZTEC Marketplace - Store Shell Engine
 *
 * @version 2.0.0 (CSS UYUMLU VERSİYON)
 * Bu versiyon, harici bir 'store-core.css' dosyasıyla çalışmak üzere
 * tasarlanmıştır. HTML class adları bu CSS ile eşleşir ve
 * dahili stil enjeksiyonu kaldırılmıştır.
 */
(function() {
  "use strict";

  // --- Constants ---

  const DATA_URL = "/rgztec/data/store.data.json";
  const IMAGE_BASE_PATH = "/rgztec/assets/images/store/";
  
  // PARA BİRİMİ (İsteğe bağlı, JS'den kaldırıldı, CSS ile halledilebilir)
  // const CURRENCY_OPTIONS = {
  //   style: "currency",
  //   currency: "USD",
  // };

  // --- Main Initialization ---

  document.addEventListener("DOMContentLoaded", () => {
    // HTML'deki store-root hedefini seçiyoruz
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

    // CSS enjeksiyonu kaldırıldı. Harici CSS'e güveniyoruz.
    // injectStyles(); 

    // Mağazayı oluştur
    initStore(storeSlug, storeRoot);
  });

  /**
   * Main asynchronous function
   */
  async function initStore(storeSlug, targetElement) {
    try {
      const allStoresData = await fetchJSON(DATA_URL);

      if (!allStoresData) {
        throw new Error("Mağaza veri dosyası (store.data.json) boş veya eksik.");
      }

      const storeData = allStoresData[storeSlug];

      if (!storeData) {
        throw new Error(`"${escapeHtml(storeSlug)}" slug'ına sahip mağaza verisi bulunamadı.`);
      }

      // Tüm bileşenleri oluştur ve targetElement'in içine yerleştir
      let storeHtml = "";
      storeHtml += renderHeader(storeData);
      storeHtml += renderHero(storeData);
      storeHtml += renderMainContent(storeData);

      targetElement.innerHTML = storeHtml;

    } catch (error) {
      console.error(`Store Shell Engine: Mağaza yüklenemedi "${escapeHtml(storeSlug)}".`, error);
      renderError(error, targetElement);
    }
  }

  // --- HTML Rendering Functions (CSS ile Uyumlu) ---

  function renderHeader(data) {
    // Harici CSS (.store-core.css) dosyamızdaki class adları kullanılıyor
    const storeTitle = escapeHtml(data.title || "RGZTEC Store");

    return `
      <header class="store-header">
        <div class="store-header-inner">
          <a href="/rgztec/" class="store-header-logo">RGZTEC</a>
          <span class="store-header-title">${storeTitle}</span>
          <nav class="store-header-nav">
            </nav>
        </div>
      </header>
    `;
  }

  function renderHero(data) {
    // Harici CSS (.store-core.css) dosyamızdaki class adları kullanılıyor
    const title = escapeHtml(data.title || "Welcome");
    const tagline = escapeHtml(data.tagline || "");
    const badge = escapeHtml(data.badge || "Official Store");
    const bannerUrl = data.banner ? `${IMAGE_BASE_PATH}${escapeHtml(data.banner)}` : "";

    return `
      <section class="store-hero">
        <div class="store-hero-inner">
          <div class="store-hero-left">
            <span class="store-badge">${badge}</span>
            <h1>${title}</h1>
            <p>${tagline}</p>
          </div>
          <div class="store-hero-right">
            ${bannerUrl ? `<img src="${bannerUrl}" alt="${title}" class="store-hero-img">` : ''}
          </div>
        </div>
      </section>
    `;
  }

  function renderMainContent(data) {
    // Harici CSS (.store-core.css) dosyamızdaki class adları kullanılıyor
    return `
      <main class="store-products">
        <div class="store-products-header">
          <h2>Products</h2>
        </div>
        ${renderProductGrid(data.products || [])}
      </main>
    `;
  }

  function renderProductGrid(products) {
    if (!Array.isArray(products) || products.length === 0) {
      // Harici CSS (.store-core.css) dosyamızdaki class adı kullanılıyor
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

    // Harici CSS (.store-core.css) dosyamızdaki class adı kullanılıyor
    return `
      <div class="products-grid">
        ${productCards}
      </div>
    `;
  }

  function renderProductCard(product) {
    if (!product) return ""; 

    // Harici CSS (.store-core.css) dosyamızdaki class adları kullanılıyor
    const title = escapeHtml(product.title || "Untitled Product");
    const tagline = escapeHtml(product.tagline || "");
    const price = formatPrice(product.price); // formatPrice'ı basit tutuyoruz
    const imageUrl = product.image ? `${IMAGE_BASE_PATH}${escapeHtml(product.image)}` : "";

    const imageElement = imageUrl
      ? `<img src="${imageUrl}" alt="${title}" loading="lazy">`
      : `<div class="product-media-placeholder"></div>`; // Basit bir placeholder

    return `
      <a href="#" class="product-card">
        <div class="product-media">
          ${imageElement}
        </div>
        <div class="product-body">
          <h3 class="product-title">${title}</h3>
          <p class="product-tagline">${tagline}</p>
          <div class="product-price">${price}</div>
        </div>
      </a>
    `;
  }

  function renderError(error, targetElement) {
    // Hata stili için CSS'e güveniyoruz (veya basit inline stil)
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
    const response = await fetch(url, {
      cache: "no-store" // Önbelleği önlemek için 'no-store' kullanmak daha güvenli
    });

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
    // Fiyatı formatlamayı basitleştiriyoruz, CSS halledebilir
    // veya Intl.NumberFormat kullanmaya devam edebilirsiniz.
    const num = parseFloat(price);
    if (isNaN(num)) {
      return escapeHtml(price || "");
    }
    // Örnek basit formatlama:
    return "$" + num.toFixed(2);
  }

  // injectStyles() fonksiyonu buradan kaldırıldı.

})();





