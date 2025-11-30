(function (window, document, utils) {
  "use strict";

  if (!utils) {
    console.error("[store.core] StoreUtils bulunamadı.");
    return;
  }

  const { qs, fetchJSON, showStoreMessage } = utils;

  (async function initStore() {
    const body = document.body;
    if (!body.classList.contains("store-body")) return;

    const storeSlug = body.dataset.store;        // ör: game-makers
    const subSlug   = body.dataset.substore || ""; 

    if (!storeSlug) {
      console.error("[store.core] data-store eksik.");
      return;
    }

    const headerRoot      = qs("#store-header-root");
    const heroBannerRoot  = qs("#store-hero-banner");
    const heroTextRoot    = qs("#store-hero-text");
    const filtersRoot     = qs("#store-filters-root");
    const productsRoot    = qs("#store-root");

    // İLK YÜKLEME: Skeleton kartlar
    renderSkeletonCards(productsRoot, 6);

    try {
      // ============================
      // 1) STORE CONFIG
      // ============================
      const storeConfigPath = `data/stores.json`;
      let storeConfig = null;

      try {
        const storesAll = await fetchJSON(storeConfigPath);
        if (Array.isArray(storesAll)) {
          storeConfig = storesAll.find((s) => s.slug === storeSlug) || null;
        }
      } catch (e) {
        console.warn("[store.core] stores.json okunamadı.");
      }

      if (!storeConfig) {
        storeConfig = {
          slug: storeSlug,
          title: "Store",
          subtitle: "",
          heroImage: "" // fallback
        };
      }

      // ============================
      // 2) PRODUCTS
      // ============================
      const productsPath = subSlug
        ? `data/products-${storeSlug}-${subSlug}.json`
        : `data/products-${storeSlug}.json`;

      const products = await fetchJSON(productsPath);

      // ============================
      // 3) BANNERS (opsiyonel)
      // ============================
      const bannersPath = `data/ubstores.json`;
      let banners = null;

      try {
        banners = await fetchJSON(bannersPath);
      } catch (e) {
        console.warn("[store.core] ubstores.json okunamadı (opsiyonel).");
      }

      // HEADER
      if (window.initStoreHeader) {
        window.initStoreHeader(storeConfig, headerRoot);
      }

      // HERO TEXT
      if (heroTextRoot) {
        heroTextRoot.innerHTML = `
          <h1 class="store-title">${storeConfig.title}</h1>
          <p class="store-subtitle">${storeConfig.subtitle}</p>
          <div class="store-hero-meta">
            <span><strong>${products.length}</strong> product(s)</span>
          </div>
        `;
      }

      // HERO BANNER
      if (window.renderStoreHeroBanner) {
        window.renderStoreHeroBanner(storeConfig, banners, heroBannerRoot);
      }

      // PRODUCTS RENDER
      if (window.renderStoreProducts) {
        window.renderStoreProducts(products, productsRoot);
      }

      // FILTERS
      if (window.initStoreFilters) {
        window.initStoreFilters(products, filtersRoot, productsRoot);
      }

      // SEARCH
      if (window.initStoreSearch) {
        window.initStoreSearch(products, productsRoot);
      }
    }

    catch (err) {
      console.error("[store.core] Hata:", err);
      productsRoot.innerHTML = "";
      showStoreMessage("Error loading store.", "error");
    }

  })();

  // ========================
  // Skeleton kartlar
  // ========================
  function renderSkeletonCards(root, count) {
    if (!root) return;
    let out = "";
    for (let i = 0; i < count; i++) {
      out += `<article class="product-card is-skeleton"></article>`;
    }
    root.innerHTML = out;
  }

})(window, document, window.StoreUtils);
