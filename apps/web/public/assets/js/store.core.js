// store/assets/js/store.core.js
// RGZTEC STORE • core – tüm mağazalar bu dosyayı kullanır

(function (window, document, utils) {
  "use strict";

  if (!utils) {
    console.error("[store.core] StoreUtils bulunamadı. store.utils.js yüklü mü?");
    return;
  }

  const { qs, fetchJSON, showStoreMessage } = utils;

  (async function initStore() {
    const body = document.body;
    if (!body.classList.contains("store-body")) return;

    const storeSlug = body.dataset.store;        // "game-makers"
    const subSlug = body.dataset.substore || ""; // şimdilik boş

    if (!storeSlug) {
      console.error("[store.core] data-store tanımlı değil.");
      showStoreMessage("Store is not configured.", "error");
      return;
    }

    const headerRoot      = qs("#store-header-root");
    const heroBannerRoot  = qs("#store-hero-banner");
    const heroTextRoot    = qs("#store-hero-text");
    const filtersRoot     = qs("#store-filters-root");
    const productsRoot    = qs("#store-root");

    if (!productsRoot) {
      console.error("[store.core] #store-root bulunamadı.");
      return;
    }

    // İlk açılışta skeleton kartlar
    renderSkeletonCards(productsRoot, 6);

    try {
      // 1) STORE CONFIG → data/stores.json içinden slug'a göre çekiyoruz
     // 1) STORE CONFIG – sadece store engine için: /data/store-registry.json
let storeConfig = null;
try {
  const registry = await fetchJSON("data/store-registry.json", { optional: true });
  if (Array.isArray(registry)) {
    storeConfig = registry.find((s) => s.slug === storeSlug) || null;
  }
} catch (e) {
  console.warn("[store.core] data/store-registry.json okunamadı:", e);
}

// Fallback – registry’de kayıt yoksa bile sayfa patlamasın
if (!storeConfig) {
  storeConfig = {
    slug: storeSlug,
    name: storeSlug,
    subtitle: "",
    accent: "#f97316"
  };
}


      // Fallback (her ihtimale karşı)
      if (!storeConfig) {
        storeConfig = {
          slug: storeSlug,
          title: "Game Makers",
          subtitle: "Templates, UI kits and tools for your next hit game.",
          heroImage: "store/assets/images/store/game-makers.webp"
        };
      }

      // 2) PRODUCTS → data/products-game-makers.json
      const productsPath = subSlug
        ? `data/products-${storeSlug}-${subSlug}.json`
        : `data/products-${storeSlug}.json`;

      const products = await fetchJSON(productsPath);

      // 3) BANNERS → şimdilik opsiyonel: data/ubstores.json içinden hero'ya uygun kayıtlar
      let banners = null;
      try {
        banners = await fetchJSON("data/ubstores.json", { optional: true });
      } catch (e) {
        console.warn("[store.core] ubstores.json yok veya okunamadı (opsiyonel).");
      }

      // HEADER
      if (typeof window.initStoreHeader === "function") {
        window.initStoreHeader(storeConfig, headerRoot);
      }

      // HERO TEXT
      if (heroTextRoot) {
        heroTextRoot.innerHTML = `
          <h1 class="store-title">${storeConfig.title || ""}</h1>
          <p class="store-subtitle">${storeConfig.subtitle || ""}</p>
          <div class="store-hero-meta">
            <span><strong>${products.length}</strong> product(s)</span>
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
