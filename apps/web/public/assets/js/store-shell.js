/**
 * RGZTEC Marketplace - Store Shell Engine
 * @version 18.3 (SAFE FIX) – Kart kırılması düzeltildi
 */
(function () {
  "use strict";

  const DATA_URL = "/rgztec/data/store.data.json";
  const IMAGE_BASE_PATH = "/rgztec/assets/images/store/";

  document.addEventListener("DOMContentLoaded", () => {
    const storeRoot = document.getElementById("store-root");
    const storeBody = document.querySelector("body.store-body");

    if (!storeBody || !storeRoot) {
      console.error("Store Shell: '.store-body' veya '#store-root' yok.");
      return;
    }

    const path = storeBody.dataset.path || null;
    if (!path) {
      renderError(new Error("No data-path found"), storeRoot);
      return;
    }

    initStore(path, storeRoot);
  });

  // -----------------------------------------------------
  // INIT (v18.3 – FIX: root level bilgisi aşağıya iletiliyor)
  // -----------------------------------------------------
  async function initStore(path, targetElement) {
    try {
      const allStoresData = await fetchJSON(DATA_URL);
      if (!allStoresData) throw new Error("store.data.json boş.");

      const {
        currentData,
        parentData,
        rootSlug,
        currentSlug,
      } = findDataByPath(allStoresData, path);

      if (!currentData) throw new Error(`Path not found: ${path}`);

      let storeHtml = "";
      storeHtml += renderHeader();
      storeHtml += renderStoreNav(allStoresData, rootSlug);

      // ---- NAV ----
      let sectionsForNav = parentData ? parentData.sections : currentData.sections;
      let isRootLevelNav = !parentData;
      const activeSlugForNav = parentData ? currentSlug : null;

      storeHtml += renderSectionNav(sectionsForNav, activeSlugForNav, isRootLevelNav);

      // ---- FIX BİLGİSİ: Bu sayfa root mu? ----
      const isRootLevelPage = !parentData;

      // ---- HERO ----
      storeHtml += renderHero(currentData);

      // ---- ALT DÜKKANLAR (Kart kırılması burada oluyordu → FIX uygulandı) ----
      if (currentData.sections?.length > 0) {
        storeHtml += renderShopSection(currentData.sections, isRootLevelPage);
      }

      // ---- ÜRÜNLER ----
      if (currentData.products?.length > 0) {
        storeHtml += renderProductSection(currentData.products);
      }

      if ((!currentData.sections || currentData.sections.length === 0) &&
          (!currentData.products || currentData.products.length === 0)) {
        storeHtml += renderEmptyShop();
      }

      targetElement.innerHTML = storeHtml;
      wireInteractions(targetElement);

    } catch (error) {
      console.error("Store Shell Error:", error);
      renderError(error, targetElement);
    }
  }

  // -----------------------------------------------------
  // FIND DATA
  // -----------------------------------------------------
  function findDataByPath(allStoresData, path) {
    const segments = path.split("/");
    let currentData = allStoresData;
    let parentData = null;

    let rootSlug = segments[0];
    let currentSlug = segments[segments.length - 1];

    if (!allStoresData[rootSlug]) return { currentData: null };

    currentData = allStoresData[rootSlug];

    for (let i = 1; i < segments.length; i++) {
      parentData = currentData;
      const nextData = (currentData.sections || []).find(
        (s) => s.slug === segments[i]
      );
      if (!nextData) return { currentData: null };
      currentData = nextData;
    }

    if (segments.length === 1) parentData = null;

    return { currentData, parentData, rootSlug, currentSlug };
  }

  // -----------------------------------------------------
  // HEADER / NAV / HERO (DEĞİŞMEDİ)
  // -----------------------------------------------------

  function renderHeader() {
    return `
      <header class="store-header">
        <div class="store-header-inner">
          <div class="store-header-left">
            <a href="/rgztec/" class="store-header-logo">RGZTEC</a>
          </div>
          <div class="store-header-center">
            <form class="store-header-search">
              <input type="search" placeholder="Search for anything"/>
              <button type="submit">🔍</button>
            </form>
          </div>
        </div>
      </header>
    `;
  }

  function renderStoreNav(allStoresData, currentRootSlug) {
    const items = Object.keys(allStoresData)
      .map((slug) => {
        const s = allStoresData[slug];
        const active = slug === currentRootSlug ? "active" : "";
        return `<li><a class="${active}" href="/rgztec/store/${slug}/">${s.title}</a></li>`;
      })
      .join("");

    return `
      <nav class="store-main-nav">
        <ul>${items}</ul>
      </nav>
    `;
  }

  function renderSectionNav(sections, currentSlug, isRootLevel) {
    if (!sections?.length) return "";

    const items = sections
      .map((sec) => {
        const active = sec.slug === currentSlug ? "active" : "";
        const href = isRootLevel ? `${sec.slug}/` : `../${sec.slug}/`;
        return `<li><a class="${active}" href="${href}">${sec.name}</a></li>`;
      })
      .join("");

    return `
      <nav class="store-section-nav">
        <ul>${items}</ul>
      </nav>
    `;
  }

  function renderHero(data) {
    return `
      <section class="store-hero">
        <div class="store-hero-inner">
          <h1>${data.title}</h1>
          <p>${data.tagline || ""}</p>
        </div>
      </section>
    `;
  }

  // -----------------------------------------------------
  // SHOP SECTION (KART KIRILMASI DÜZELTİLDİ – v18.3)
  // -----------------------------------------------------
  function renderShopSection(sections, isRootLevelPage) {
    const cards = sections
      .map((sec) => renderShopCard(sec, isRootLevelPage))
      .join("");

    return `
      <main class="store-shops">
        <div class="shop-grid">${cards}</div>
      </main>
    `;
  }

  // -----------------------------------------------------
  // SHOP CARD (ANA FIX)
  // -----------------------------------------------------
  function renderShopCard(section, isRootLevelPage) {
    const name = section.name;
    const tagline = section.tagline || "";
    const slug = section.slug;

    // 🔥🔥🔥 **ASIL FIX BURADA** 🔥🔥🔥
    const href = isRootLevelPage ? `${slug}/` : `../${slug}/`;

    const imageUrl = section.image
      ? `${IMAGE_BASE_PATH}${section.image}`
      : "";

    return `
      <a href="${href}" class="shop-card">
        <div class="shop-card-media">
          ${
            imageUrl
              ? `<img src="${imageUrl}" alt="${name}" loading="lazy">`
              : `<div class="product-media-placeholder"></div>`
          }
        </div>
        <div class="shop-card-body">
          <h3>${name}</h3>
          <p>${tagline}</p>
        </div>
      </a>
    `;
  }

  // -----------------------------------------------------
  // PRODUCTS
  // -----------------------------------------------------
  function renderProductSection(products) {
    const cards = products.map((p) => renderProductCard(p)).join("");

    return `
      <main class="store-products">
        <div class="shop-grid">${cards}</div>
      </main>
    `;
  }

  function renderProductCard(p) {
    const imageUrl = p.image ? `${IMAGE_BASE_PATH}${p.image}` : "";
    return `
      <a href="${p.url}" class="shop-card" target="_blank">
        <div class="shop-card-media">
          ${
            imageUrl
              ? `<img src="${imageUrl}" loading="lazy">`
              : `<div class="product-media-placeholder"></div>`
          }
        </div>
        <div class="shop-card-body">
          <h3>${p.title}</h3>
          <p>${p.tagline}</p>
        </div>
      </a>
    `;
  }

  function renderEmptyShop() {
    return `
      <main class="store-products">
        <div class="products-grid-empty">
          <h3>Coming Soon</h3>
        </div>
      </main>
    `;
  }

  // -----------------------------------------------------
  // HELPERS
  // -----------------------------------------------------
  function wireInteractions(root) {}

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed: ${url}`);
    return res.json();
  }
})();
