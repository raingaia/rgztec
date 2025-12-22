/**
 * RGZTEC Marketplace - Store Shell Engine
 *
 * FINAL v18.2.4 (GLOBAL ROOT NAV & ABSOLUTE PATH FIX)
 * * ÇÖZÜM: Hangi derinlikte olursa olsun navigasyonu her zaman 
 * ana mağaza (rootSlug) üzerinden kurar.
 */
(function () {
  "use strict";

  const DATA_URL = "/rgztec/data/store.data.json?v=1824";
  const IMAGE_BASE_PATH = "/rgztec/assets/images/store/";

  document.addEventListener("DOMContentLoaded", () => {
    const storeRoot = document.getElementById("store-root");
    const storeBody = document.querySelector("body.store-body");

    if (!storeBody || !storeRoot) {
      console.error("Store Shell Engine: '.store-body' veya '#store-root' bulunamadı.");
      return;
    }

    let path = storeBody.dataset.path || "";
    path = normalizePath(path);

    if (!path) {
      renderError(new Error("No 'data-path' attribute found on the body tag."), storeRoot);
      return;
    }

    initStore(path, storeRoot);
  });

  async function initStore(path, targetElement) {
    try {
      const allStoresData = await fetchJSON(DATA_URL);
      if (!allStoresData) throw new Error("store.data.json boş veya eksik.");

      const { currentData, rootSlug, currentSlug } = findDataByPath(allStoresData, path);
      
      if (!currentData || !rootSlug) {
        throw new Error(`Path not found in store.data.json: "${path}"`);
      }

      // --- KRİTİK DÜZELTME BAŞLANGICI ---
      // Navigasyon verisini her zaman en üst seviye mağazadan alıyoruz.
      const rootStoreData = allStoresData[rootSlug];
      const sectionsForNav = rootStoreData ? rootStoreData.sections : [];
      
      // Linklerin ../ yerine tam yol (/rgztec/store/...) basılması için true zorluyoruz.
      const forceAbsoluteNav = true; 
      // --- KRİTİK DÜZELTME BITIŞI ---

      let html = "";
      html += renderHeader();
      html += renderStoreNav(allStoresData, rootSlug);
      
      // Kategori menüsünü bas (Her zaman dolu ve doğru linklerle gelir)
      html += renderSectionNav(sectionsForNav, currentSlug, forceAbsoluteNav, rootSlug);

      html += renderHero(currentData);

      // Alt kategoriler varsa (Explore Shops)
      if (currentData.sections && currentData.sections.length > 0) {
        html += renderShopSection(currentData.sections, rootSlug, path);
      }

      // Ürünler varsa
      if (currentData.products && currentData.products.length > 0) {
        html += renderProductSection(currentData.products);
      }

      // İkisi de yoksa
      if ((!currentData.sections || currentData.sections.length === 0) &&
          (!currentData.products || currentData.products.length === 0)) {
        html += renderEmptyShop();
      }

      targetElement.innerHTML = html;
      wireInteractions(targetElement);
    } catch (err) {
      console.error("Store Shell Engine error:", err);
      renderError(err, targetElement);
    }
  }

  function normalizePath(p) {
    let s = String(p || "");
    s = s.replace(/#.*$/, "").trim();
    s = s.replace(/^\/+/, "").replace(/\/+$/, "");
    return s;
  }

  function findDataByPath(allStoresData, path) {
    const segments = normalizePath(path).split("/").filter(Boolean);
    const rootSlug = segments[0] || null;
    const currentSlug = segments[segments.length - 1] || null;

    if (!rootSlug || !allStoresData[rootSlug]) return { currentData: null };

    let currentData = allStoresData[rootSlug];

    // Derinlik varsa dallar arasında ilerle
    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      const sections = currentData.sections || [];
      const next = sections.find((s) => s && s.slug === seg);
      if (next) currentData = next;
      else return { currentData: null };
    }

    return { currentData, rootSlug, currentSlug };
  }

  function renderHeader() {
    const ICON_CATEGORIES = `<svg class="store-header-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>`;
    const ICON_SEARCH = `<svg class="store-header-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>`;

    return `
      <header class="store-header">
        <div class="store-header-inner">
          <div class="store-header-left">
            <a href="/rgztec/" class="store-header-logo">RGZTEC</a>
            <button class="store-header-categories-btn" type="button" aria-expanded="true" aria-controls="store-section-nav">
              ${ICON_CATEGORIES} <span>Categories</span>
            </button>
          </div>
          <div class="store-header-center">
            <form class="store-header-search" role="search">
              <input type="search" placeholder="Search for anything" />
              <button type="submit">${ICON_SEARCH}</button>
            </form>
          </div>
          <div class="store-header-right">
             <div class="store-header-secondary"><a href="#">Dashboard</a><a href="#">Sign In</a></div>
             <a href="#" class="store-header-cta"><span>Open Store</span></a>
          </div>
        </div>
      </header>`;
  }

  function renderStoreNav(allStoresData, currentRootSlug) {
    const storeLinks = Object.keys(allStoresData).map((slug) => {
      const store = allStoresData[slug];
      if (!store || !store.title) return "";
      const isActive = slug === currentRootSlug;
      return `
        <li class="store-main-nav__item">
          <a href="/rgztec/store/${slug}/" class="store-main-nav__link ${isActive ? 'active' : ''}">${escapeHtml(store.title)}</a>
        </li>`;
    }).join("");
    return `<nav class="store-main-nav"><ul class="store-main-nav__list">${storeLinks}</ul></nav>`;
  }

  function renderSectionNav(sections, currentSlug, isRootLevel, rootSlug) {
    if (!Array.isArray(sections) || sections.length === 0) return "";
    const navItems = sections.map((section) => {
      if (!section) return "";
      const slug = escapeHtml(section.slug || "");
      const isActive = slug === currentSlug;
      
      // Dinamik Link Oluşturma: Her zaman /rgztec/store/MAĞAZA/KATEGORİ/ formatında
      const href = isActive ? "#" : `/rgztec/store/${escapeHtml(rootSlug)}/${slug}/`;

      return `
        <li class="store-section-nav__item">
          <a href="${href}" class="store-section-nav__link ${isActive ? 'active' : ''}">${escapeHtml(section.name)}</a>
        </li>`;
    }).join("");
    return `<nav id="store-section-nav" class="store-section-nav"><ul class="store-section-nav__list">${navItems}</ul></nav>`;
  }

  function renderHero(data) {
    const bannerUrl = data.banner ? `${IMAGE_BASE_PATH}${escapeHtml(data.banner)}` : "";
    return `
      <section class="store-hero">
        <div class="store-hero-inner">
          <div class="store-hero-left">
            <span class="store-badge">${escapeHtml(data.badge || "Official")}</span>
            <h1>${escapeHtml(data.title || data.name)}</h1>
            <p class="store-hero-tagline">${escapeHtml(data.tagline || "")}</p>
          </div>
          <div class="store-hero-right">
            ${bannerUrl ? `<img src="${bannerUrl}" class="store-hero-img">` : ""}
          </div>
        </div>
      </section>`;
  }

  function renderShopSection(sections, rootSlug, currentPath) {
    const shopCards = sections.map((s) => {
      const href = `/rgztec/store/${rootSlug}/${s.slug}/`;
      const imageUrl = s.image ? `${IMAGE_BASE_PATH}${escapeHtml(s.image)}` : "";
      return `
        <a href="${href}" class="shop-card">
          <div class="shop-card-media">${imageUrl ? `<img src="${imageUrl}">` : `<div class="product-media-placeholder"></div>`}</div>
          <div class="shop-card-body">
            <h3 class="shop-card-title">${escapeHtml(s.name)}</h3>
            <p class="shop-card-tagline">${escapeHtml(s.tagline)}</p>
          </div>
        </a>`;
    }).join("");
    return `<main class="store-shops"><div class="store-shops-header"><h2>Explore</h2></div><div class="shop-grid">${shopCards}</div></main>`;
  }

  function renderProductSection(products) {
    const cards = products.map((p) => `
      <a href="${p.url || '#'}" class="shop-card" target="_blank">
        <div class="shop-card-media"><img src="${IMAGE_BASE_PATH}${escapeHtml(p.image)}"></div>
        <div class="shop-card-body">
          <h3 class="shop-card-title">${escapeHtml(p.title)}</h3>
          <p class="shop-card-tagline">${escapeHtml(p.tagline)}</p>
        </div>
      </a>`).join("");
    return `<main class="store-products"><div class="store-products-header"><h2>Products</h2></div><div class="shop-grid">${cards}</div></main>`;
  }

  function renderEmptyShop() {
    return `<main class="store-products"><div class="products-grid-empty"><h3>Coming Soon</h3></div></main>`;
  }

  function wireInteractions(root) {
    const catBtn = root.querySelector(".store-header-categories-btn");
    const sectionNav = root.querySelector("#store-section-nav");
    if (catBtn && sectionNav) {
      catBtn.addEventListener("click", () => {
        const isHidden = sectionNav.classList.toggle("is-collapsed");
        catBtn.setAttribute("aria-expanded", String(!isHidden));
      });
    }
  }

  function renderError(error, targetElement) {
    targetElement.innerHTML = `<div style="padding:50px; text-align:center;"><h2>RGZTEC</h2><p>${escapeHtml(error.message)}</p></div>`;
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("JSON yüklenemedi.");
    return await res.json();
  }

  function escapeHtml(unsafe) {
    return String(unsafe || "").replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  }

})();
