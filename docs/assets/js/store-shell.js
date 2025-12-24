/**
 * RGZTEC Marketplace - Store Shell Engine
 *
 * FINAL v18.2.5 (GLOBAL ROOT NAV + ABSOLUTE LINKS + CATEGORIES TOGGLE FIX)
 * - Navigation always built from root store (rootSlug)
 * - Section nav links always absolute: /rgztec/store/{rootSlug}/{sectionSlug}/
 * - Active highlight correct only when we are inside a section (depth >= 2)
 * - Categories button toggles section nav (no missing CSS)
 * - No ICON_GIFT / ICON_CART dependencies
 */
(function () {
  "use strict";

  const DATA_URL = "data/store.data.json?v=1825";
  const IMAGE_BASE_PATH = "/rgztec/assets/images/store/";

  document.addEventListener("DOMContentLoaded", () => {
    const storeRoot = document.getElementById("store-root");
    const storeBody = document.querySelector("body.store-body");

    if (!storeBody || !storeRoot) {
      console.error("Store Shell Engine: '.store-body' veya '#store-root' bulunamadı.");
      return;
    }

    let path = normalizePath(storeBody.dataset.path || "");
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

      const { currentData, rootSlug, currentSlug, depth } = findDataByPath(allStoresData, path);
      if (!currentData || !rootSlug) throw new Error(`Path not found in store.data.json: "${path}"`);

      // ✅ NAV: always from root store
      const rootStoreData = allStoresData[rootSlug] || {};
      const rootSections = Array.isArray(rootStoreData.sections) ? rootStoreData.sections : [];

      // ✅ Active highlight:
      // Root page (depth===1): no active in section nav
      // Inside category (depth>=2): active is currentSlug
      const activeSectionSlug = depth >= 2 ? currentSlug : null;

      let html = "";
      html += renderHeader();
      html += renderStoreNav(allStoresData, rootSlug);
      html += renderSectionNav(rootSections, activeSectionSlug, rootSlug); // absolute always
      html += renderHero(currentData);

      if (currentData.sections && currentData.sections.length > 0) {
        html += renderShopSection(currentData.sections, rootSlug);
      }
      if (currentData.products && currentData.products.length > 0) {
        html += renderProductSection(currentData.products);
      }
      if ((!currentData.sections || currentData.sections.length === 0) &&
          (!currentData.products || currentData.products.length === 0)) {
        html += renderEmptyShop();
      }

      // ✅ inject + interactions
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
    const depth = segments.length;

    if (!rootSlug || !allStoresData[rootSlug]) return { currentData: null };

    let currentData = allStoresData[rootSlug];

    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      const sections = currentData.sections || [];
      const next = sections.find((s) => s && s.slug === seg);
      if (next) currentData = next;
      else return { currentData: null };
    }

    return { currentData, rootSlug, currentSlug, depth };
  }

  function renderHeader() {
    const ICON_CATEGORIES = `
      <svg class="store-header-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>`;
    const ICON_SEARCH = `
      <svg class="store-header-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>`;

    return `
      <header class="store-header">
        <div class="store-header-inner">
          <div class="store-header-left">
            <a href="/rgztec/" class="store-header-logo">RGZTEC</a>

            <!-- ✅ IMPORTANT: id=btn-categories -->
            <button
              class="store-header-categories-btn"
              id="btn-categories"
              type="button"
              aria-expanded="true"
              aria-controls="store-section-nav">
              ${ICON_CATEGORIES} <span>Categories</span>
            </button>
          </div>

          <div class="store-header-center">
            <form class="store-header-search" role="search">
              <input type="search" placeholder="Search for anything" aria-label="Search" />
              <button type="submit" aria-label="Search">${ICON_SEARCH}</button>
            </form>
          </div>

          <div class="store-header-right">
            <div class="store-header-secondary">
              <a href="#" class="store-header-secondary-link">Dashboard</a>
              <a href="#" class="store-header-secondary-link">Sign In</a>
            </div>
            <a href="#" class="store-header-cta"><span>Open Store</span></a>
          </div>
        </div>
      </header>
    `;
  }

  function renderStoreNav(allStoresData, currentRootSlug) {
    const storeLinks = Object.keys(allStoresData)
      .map((slug) => {
        const store = allStoresData[slug];
        if (!store || !store.title) return "";
        const isActive = slug === currentRootSlug;
        return `
          <li class="store-main-nav__item">
            <a href="/rgztec/store/${escapeHtml(slug)}/"
               class="store-main-nav__link ${isActive ? "active" : ""}">
              ${escapeHtml(store.title)}
            </a>
          </li>`;
      })
      .join("");

    return `
      <nav class="store-main-nav" aria-label="RGZTEC stores">
        <ul class="store-main-nav__list">${storeLinks}</ul>
      </nav>`;
  }

  // ✅ Always absolute paths
  function renderSectionNav(sections, activeSlug, rootSlug) {
    if (!Array.isArray(sections) || sections.length === 0) return "";

    const navItems = sections
      .map((section) => {
        if (!section) return "";
        const slug = escapeHtml(section.slug || "");
        const name = escapeHtml(section.name || "Unnamed Section");
        const isActive = !!activeSlug && slug === activeSlug;

        const href = isActive
          ? "#"
          : `/rgztec/store/${escapeHtml(rootSlug)}/${slug}/`;

        return `
          <li class="store-section-nav__item">
            <a href="${href}" class="store-section-nav__link ${isActive ? "active" : ""}">
              ${name}
            </a>
          </li>`;
      })
      .join("");

    return `
      <nav id="store-section-nav" class="store-section-nav" aria-label="Store sections">
        <ul class="store-section-nav__list">${navItems}</ul>
      </nav>`;
  }

  function renderHero(data) {
    const title = escapeHtml(data.title || data.name || "Welcome");
    const tagline = escapeHtml(data.tagline || "");
    const badge = escapeHtml(data.badge || "Official");
    const bannerUrl = data.banner ? `${IMAGE_BASE_PATH}${escapeHtml(data.banner)}` : "";

    return `
      <section class="store-hero">
        <div class="store-hero-inner">
          <div class="store-hero-left">
            <span class="store-badge">${badge}</span>
            <h1>${title}</h1>
            ${tagline ? `<p class="store-hero-tagline">${tagline}</p>` : ""}
          </div>
          <div class="store-hero-right">
            ${bannerUrl ? `<img src="${bannerUrl}" class="store-hero-img" alt="${title}" loading="lazy">` : ""}
          </div>
        </div>
      </section>`;
  }

  function renderShopSection(sections, rootSlug) {
    const shopCards = sections
      .map((s) => {
        if (!s) return "";
        const slug = escapeHtml(s.slug || "");
        const href = `/rgztec/store/${escapeHtml(rootSlug)}/${slug}/`;
        const imageUrl = s.image ? `${IMAGE_BASE_PATH}${escapeHtml(s.image)}` : "";
        return `
          <a href="${href}" class="shop-card">
            <div class="shop-card-media">
              ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(s.name || "")}" loading="lazy">`
                         : `<div class="product-media-placeholder"></div>`}
            </div>
            <div class="shop-card-body">
              <h3 class="shop-card-title">${escapeHtml(s.name || "Untitled Shop")}</h3>
              <p class="shop-card-tagline">${escapeHtml(s.tagline || "")}</p>
            </div>
          </a>`;
      })
      .join("");

    return `
      <main class="store-shops">
        <div class="store-shops-header"><h2>Explore Shops</h2></div>
        <div class="shop-grid">${shopCards}</div>
      </main>`;
  }

  function renderProductSection(products) {
    const cards = products
      .map((p) => {
        if (!p) return "";
        const url = p.url ? escapeHtml(p.url) : "#";
        const title = escapeHtml(p.title || "Untitled Product");
        const tagline = escapeHtml(p.tagline || "");
        const imageUrl = p.image ? `${IMAGE_BASE_PATH}${escapeHtml(p.image)}` : "";
        return `
          <a href="${url}" class="shop-card" target="_blank" rel="noopener noreferrer">
            <div class="shop-card-media">
              ${imageUrl ? `<img src="${imageUrl}" alt="${title}" loading="lazy">`
                         : `<div class="product-media-placeholder"></div>`}
            </div>
            <div class="shop-card-body">
              <h3 class="shop-card-title">${title}</h3>
              <p class="shop-card-tagline">${tagline}</p>
            </div>
          </a>`;
      })
      .join("");

    return `
      <main class="store-products">
        <div class="store-products-header"><h2>Explore Products</h2></div>
        <div class="shop-grid">${cards}</div>
      </main>`;
  }

  function renderEmptyShop() {
    return `
      <main class="store-products">
        <div class="products-grid-empty">
          <h3>Coming Soon</h3>
          <p>New sections and products are being added to this shop.</p>
        </div>
      </main>`;
  }

  function wireInteractions(root) {
    // Search (optional)
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

    // ✅ Categories toggle
    const btn = root.querySelector("#btn-categories");
    const nav = root.querySelector("#store-section-nav");

    if (btn && nav) {
      // Mobile default closed
      const mq = window.matchMedia("(max-width: 1024px)");
      if (mq.matches) {
        nav.classList.add("is-collapsed");
        btn.setAttribute("aria-expanded", "false");
      }

      btn.addEventListener("click", () => {
        const collapsed = nav.classList.toggle("is-collapsed");
        btn.setAttribute("aria-expanded", String(!collapsed));
      });
    }
  }

  function renderError(error, targetElement) {
    targetElement.innerHTML = `
      <div style="padding:40px; text-align:center;">
        <h1 style="font-size:1.5rem; font-weight:800;">RGZTEC</h1>
        <h2 style="font-size:2rem; margin:12px 0;">An Error Occurred</h2>
        <p style="color:#555;">We're sorry, but this store could not be loaded.</p>
        <code style="display:block; background:#f5f5f5; color:#d73a49; padding:10px; margin-top:20px; border-radius:6px;">
          ${escapeHtml(error.message)}
        </code>
      </div>`;
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      if (res.status === 404) throw new Error(`File not found: ${url}`);
      throw new Error(`HTTP error fetching ${url}: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  }

  function escapeHtml(unsafe) {
    return String(unsafe || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m]));
  }
})();

