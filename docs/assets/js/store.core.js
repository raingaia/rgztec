// store/core/assets/js/store.core.js
// Tüm akışı yöneten çekirdek – diğer modülleri burada çağırıyoruz

(function (window, document, utils) {
  "use strict";

  if (!utils) {
    console.error("[store.core] StoreUtils bulunamadı. store.utils.js yüklü mü?");
    return;
  }

  const { qs, fetchJSON, showStoreMessage } = utils;

  (async function initStore() {
    const body = document.body;
    if (!body.classList.contains("store-body")) {
      console.warn("[store.core] body.store-body yok, çıkılıyor.");
      return;
    }

    const storeSlug = body.dataset.store;
    const subSlug = body.dataset.substore || "";

    if (!storeSlug) {
      console.error("[store.core] data-store tanımlı değil.");
      showStoreMessage("Store is not configured.", "error");
      return;
    }

    const headerRoot = qs("#store-header-root");
    const heroBannerRoot = qs("#store-hero-banner");
    const heroTextRoot = qs("#store-hero-text");
    const filtersRoot = qs("#store-filters-root");
    const productsRoot = qs("#store-root");

    if (!productsRoot) {
      console.error("[store.core] #store-root bulunamadı.");
      return;
    }

    // İlk aşamada skeleton kartlar göster
    renderSkeletonCards(productsRoot, 6);

    try {
      // 1) Store config (title, subtitle, hero görsel)
      const storeConfigPath = `store/core/data/stores/${storeSlug}.json`;
      const storeConfig = await fetchJSON(storeConfigPath);

      // 2) Ürünler
      const productsPath = subSlug
        ? `store/core/data/products/${storeSlug}-${subSlug}.json`
        : `store/core/data/products/${storeSlug}.json`;
      const products = await fetchJSON(productsPath);

      // 3) Bannerlar (opsiyonel)
      const bannersPath = subSlug
        ? `store/core/data/banners/${storeSlug}-${subSlug}.json`
        : `store/core/data/banners/${storeSlug}.json`;
      const banners = await fetchJSON(bannersPath, { optional: true });

      // HEADER
      if (typeof window.initStoreHeader === "function") {
        window.initStoreHeader(storeConfig, headerRoot);
      }

      // HERO TEXT
      if (heroTextRoot && storeConfig) {
        heroTextRoot.innerHTML = `
          <h1 class="store-title">${storeConfig.title || ""}</h1>
          <p class="store-subtitle">${storeConfig.subtitle || ""}</p>
          <div class="store-hero-meta">
            <span><strong>${products.length}</strong> product(s)</span>
            ${subSlug ? `<span>Substore: ${subSlug}</span>` : ""}
          </div>
        `;
      }

      // HERO BANNER
      if (typeof window.renderStoreHeroBanner === "function") {
        window.renderStoreHeroBanner(storeConfig, banners, heroBannerRoot);
      }

      // ÜRÜNLER
      if (typeof window.renderStoreProducts === "function") {
        window.renderStoreProducts(products, productsRoot);
      } else {
        productsRoot.innerHTML = "";
        showStoreMessage("Product renderer not found.", "error");
      }

      // FİLTRELER
      if (typeof window.initStoreFilters === "function") {
        window.initStoreFilters(products, filtersRoot, productsRoot);
      }

      // ARAMA
      if (typeof window.initStoreSearch === "function") {
        window.initStoreSearch(products, productsRoot);
      }
    } catch (err) {
      console.error("[store.core] Store yüklenirken hata:", err);
      productsRoot.innerHTML = "";
      showStoreMessage(
        "We couldn’t load this store right now. Please try again later.",
        "error"
      );
    }
  })();

  // Basit skeleton kartlar
  function renderSkeletonCards(root, count) {
    if (!root) return;
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(`<article class="product-card is-skeleton"></article>`);
    }
    root.innerHTML = items.join("");
  }
})(window, document, window.StoreUtils);
