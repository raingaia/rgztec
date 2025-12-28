/**
 * RGZTEC Marketplace - Store Shell Engine
 * FINAL (BASE-AUTO + ROOT/GHPAGES + NO HARDCODED /rgztec)
 */
(() => {
  "use strict";

  // ---------- BASE RESOLUTION ----------
  function resolveBase() {
    const meta = document.querySelector('meta[name="rgz-base"]');
    if (meta && meta.content != null) {
      return String(meta.content).trim().replace(/\/+$/, "");
    }
    const p = location.pathname || "/";
    // if hosted under /rgztec on GitHub Pages
    return p.includes("/rgztec/") ? "/rgztec" : "";
  }
  const BASE = resolveBase(); // "" or "/rgztec"
  const withBase = (p) => (BASE ? `${BASE}${p}` : p); // p starts with "/"

  const DATA_URL = withBase("/data/store.data.json?v=final");
  const IMAGE_BASE_PATH = withBase("/assets/images/store/");

  // ---------- BOOT ----------
  document.addEventListener("DOMContentLoaded", () => {
    const storeRoot = document.getElementById("store-root");
    const storeBody = document.querySelector("body.store-body");

    if (!storeBody || !storeRoot) return;

    const rawPath =
      (storeBody.dataset.path || window.RGZ_STORE_SLUG || "").trim();

    if (!rawPath) {
      renderError(storeRoot, `Missing data-path. Add: <body class="store-body" data-path="hardware">`);
      return;
    }

    initStore(rawPath, storeRoot);
  });

  // ---------- INIT ----------
  async function initStore(path, target) {
    try {
      target.innerHTML = `<div style="padding:18px;font-family:Inter,system-ui,Arial;">Loading store...</div>`;

      const allStoresData = await fetchJSON(DATA_URL);
      if (!allStoresData) throw new Error("store.data.json is empty.");

      const { currentData, rootSlug, currentSlug, depth } = findDataByPath(allStoresData, path);
      if (!currentData || !rootSlug) throw new Error(`Path not found: "${path}"`);

      const rootStoreData = allStoresData[rootSlug] || {};
      const rootSections = Array.isArray(rootStoreData.sections) ? rootStoreData.sections : [];
      const activeSectionSlug = depth >= 2 ? currentSlug : null;

      let html = "";
      html += renderHeader();
      html += renderStoreNav(allStoresData, rootSlug);
      html += renderSectionNav(rootSections, activeSectionSlug, rootSlug);
      html += renderHero(currentData);

      if (Array.isArray(currentData.sections) && currentData.sections.length > 0) {
        html += renderShopSection(currentData.sections, rootSlug);
      } else if (Array.isArray(currentData.products) && currentData.products.length > 0) {
        html += renderProductSection(currentData.products);
      } else {
        html += renderEmptyShop();
      }

      target.innerHTML = html;
      wireInteractions(target);
    } catch (e) {
      console.error(e);
      renderError(target, e.message || String(e));
    }
  }

  // ---------- PATH ----------
  function normalizePath(p) {
    let s = String(p || "");
    s = s.replace(/#.*$/, "").trim();
    s = s.replace(/^\/+/, "").replace(/\/+$/, "");
    return s;
  }

  function findDataByPath(all, path) {
    const segments = normalizePath(path).split("/").filter(Boolean);
    const rootSlug = segments[0] || null;
    const currentSlug = segments[segments.length - 1] || null;
    const depth = segments.length;

    if (!rootSlug || !all[rootSlug]) return { currentData: null };

    let currentData = all[rootSlug];
    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      const sections = Array.isArray(currentData.sections) ? currentData.sections : [];
      const next = sections.find((s) => s && s.slug === seg);
      if (next) currentData = next;
      else return { currentData: null };
    }

    return { currentData, rootSlug, currentSlug, depth };
  }

  // ---------- RENDER ----------
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
            <a href="${withBase("/")}" class="store-header-logo">RGZTEC</a>
            <button class="store-header-categories-btn" id="btn-categories" type="button"
              aria-expanded="true" aria-controls="store-section-nav">
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

  function renderStoreNav(all, currentRootSlug) {
    const storeLinks = Object.keys(all).map((slug) => {
      const store = all[slug];
      if (!store || !store.title) return "";
      const isActive = slug === currentRootSlug;
      return `
        <li class="store-main-nav__item">
          <a href="${withBase(`/store/${esc(slug)}/`)}" class="store-main-nav__link ${isActive ? "active" : ""}">
            ${esc(store.title)}
          </a>
        </li>`;
    }).join("");

    return `
      <nav class="store-main-nav" aria-label="RGZTEC stores">
        <ul class="store-main-nav__list">${storeLinks}</ul>
      </nav>`;
  }

  function renderSectionNav(sections, activeSlug, rootSlug) {
    if (!Array.isArray(sections) || sections.length === 0) return "";
    const navItems = sections.map((section) => {
      if (!section) return "";
      const slug = esc(section.slug || "");
      const name = esc(section.name || "Unnamed Section");
      const isActive = !!activeSlug && slug === activeSlug;
      const href = isActive ? "#" : withBase(`/store/${esc(rootSlug)}/${slug}/`);
      return `
        <li class="store-section-nav__item">
          <a href="${href}" class="store-section-nav__link ${isActive ? "active" : ""}">
            ${name}
          </a>
        </li>`;
    }).join("");

    return `
      <nav id="store-section-nav" class="store-section-nav" aria-label="Store sections">
        <ul class="store-section-nav__list">${navItems}</ul>
      </nav>`;
  }

  function renderHero(data) {
    const title = esc(data.title || data.name || "Welcome");
    const tagline = esc(data.tagline || "");
    const badge = esc(data.badge || "Official");
    const bannerUrl = data.banner ? `${IMAGE_BASE_PATH}${esc(data.banner)}` : "";

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
    const cards = sections.map((s) => {
      if (!s) return "";
      const slug = esc(s.slug || "");
      const href = withBase(`/store/${esc(rootSlug)}/${slug}/`);
      const imageUrl = s.image ? `${IMAGE_BASE_PATH}${esc(s.image)}` : "";
      return `
        <a href="${href}" class="shop-card">
          <div class="shop-card-media">
            ${imageUrl ? `<img src="${imageUrl}" alt="${esc(s.name || "")}" loading="lazy">` : `<div class="product-media-placeholder"></div>`}
          </div>
          <div class="shop-card-body">
            <h3 class="shop-card-title">${esc(s.name || "Untitled Shop")}</h3>
            <p class="shop-card-tagline">${esc(s.tagline || "")}</p>
          </div>
        </a>`;
    }).join("");

    return `
      <main class="store-shops">
        <div class="store-shops-header"><h2>Explore Shops</h2></div>
        <div class="shop-grid">${cards}</div>
      </main>`;
  }

  function renderProductSection(products) {
    const cards = products.map((p) => {
      if (!p) return "";
      const url = p.url ? esc(p.url) : "#";
      const title = esc(p.title || "Untitled Product");
      const tagline = esc(p.tagline || "");
      const imageUrl = p.image ? `${IMAGE_BASE_PATH}${esc(p.image)}` : "";
      return `
        <a href="${url}" class="shop-card" target="_blank" rel="noopener noreferrer">
          <div class="shop-card-media">
            ${imageUrl ? `<img src="${imageUrl}" alt="${title}" loading="lazy">` : `<div class="product-media-placeholder"></div>`}
          </div>
          <div class="shop-card-body">
            <h3 class="shop-card-title">${title}</h3>
            <p class="shop-card-tagline">${tagline}</p>
          </div>
        </a>`;
    }).join("");

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

  // ---------- INTERACTIONS ----------
  function wireInteractions(root) {
    const searchForm = root.querySelector(".store-header-search");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
      });
    }

    const btn = root.querySelector("#btn-categories");
    const nav = root.querySelector("#store-section-nav");
    if (btn && nav) {
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

  // ---------- ERROR ----------
  function renderError(target, msg) {
    target.innerHTML = `
      <div style="padding:22px;max-width:900px;margin:20px auto;font-family:Inter,system-ui,Arial;">
        <h2 style="margin:0 0 10px;">RGZTEC • Load Error</h2>
        <div style="padding:14px;border:1px solid #eee;border-radius:12px;background:#fff;">
          <div style="margin-bottom:10px;color:#111;">${esc(msg)}</div>
          <div style="color:#666;font-size:13px;">
            <div><b>DATA_URL</b>: <code>${esc(DATA_URL)}</code></div>
            <div><b>BASE</b>: <code>${esc(BASE)}</code></div>
          </div>
        </div>
      </div>`;
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText} (${url})`);
    }
    return await res.json();
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m]));
  }
})();




