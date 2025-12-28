/**
 * RGZTEC Marketplace - Store Shell Engine
 * FINAL (BASE-AUTO + ROOT/GHPAGES + NO HARDCODED /rgztec)
 * + DYNAMIC APPS MODE (search/admin)
 * + GLOBAL SEARCH MODULE (recursive deep scan)
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
    return p.includes("/rgztec/") ? "/rgztec" : "";
  }

  const BASE = resolveBase(); // "" or "/rgztec"
  const withBase = (p) => (BASE ? `${BASE}${p}` : p);

  // IMPORTANT: data file + image base
  const DATA_URL = withBase("/data/store.data.json?v=final");
  const IMAGE_BASE_PATH = withBase("/assets/images/store/");

  // ---------- BOOT ----------
  document.addEventListener("DOMContentLoaded", () => {
    const storeRoot = document.getElementById("store-root");
    const storeBody = document.querySelector("body.store-body");

    if (!storeBody || !storeRoot) return;

    // ✅ A) DYNAMIC APPS MODE (from /apps/index.html)
    if (window.APPS_MODE) {
      initDynamicModule(window.APPS_MODE, window.APPS_PARAMS || [], storeRoot);
      return;
    }

    // ✅ B) STATIC STORE MODE (87 stores)
    const rawPath = (storeBody.dataset.path || window.RGZ_STORE_SLUG || "").trim();

    if (!rawPath) {
      renderError(storeRoot, `Missing data-path. Add: <body class="store-body" data-path="hardware">`);
      return;
    }

    initStore(rawPath, storeRoot);
  });

  // ---------- DYNAMIC MODULES ----------
  function initDynamicModule(mode, params, target) {
    // Always show header first (same premium header)
    if (mode === "search") {
      renderSearchModule(target, params);
      return;
    }

    if (mode === "admin") {
      target.innerHTML =
        renderHeader() +
        `
        <main class="admin-panel" style="padding:60px 20px; max-width:1100px; margin:0 auto;">
          <div style="border:1px solid #333; background:#0a0a0a; padding:40px; border-radius:24px;">
            <h1 style="font-size:32px; margin-bottom:10px; color:#fff;">Control Center</h1>
            <p style="color:#888; margin-bottom:30px;">Managing static stores and global dynamic routes.</p>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:20px;">
              <div style="background:#111; padding:20px; border-radius:12px; border:1px solid #222;">
                <span style="color:#00ffa3; font-weight:800;">STATUS: ONLINE</span><br><small style="color:#777;">Static Edge Network</small>
              </div>
              <div style="background:#111; padding:20px; border-radius:12px; border:1px solid #222;">
                <span style="color:#00ffa3; font-weight:800;">MODE: DYNAMIC</span><br><small style="color:#777;">Apps Router</small>
              </div>
            </div>
          </div>
        </main>`;
      // header interactions (search, categories)
      wireInteractions(target);
      return;
    }

    // default fallback
    target.innerHTML =
      renderHeader() +
      `<main style="padding:80px 20px; max-width:1100px; margin:0 auto;">
        <h1 style="color:#fff;">RGZTEC Engine</h1>
        <p style="color:#888;">Unknown module: <b>${esc(mode)}</b></p>
      </main>`;
    wireInteractions(target);
  }

  // ---------- STATIC STORE INIT ----------
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
              <input id="rgz-search-input" type="search" name="q" placeholder="Search for anything" aria-label="Search" />
              <button type="submit" aria-label="Search">${ICON_SEARCH}</button>
            </form>
          </div>
          <div class="store-header-right">
            <div class="store-header-secondary">
              <a href="${withBase("/apps/admin")}" class="store-header-secondary-link">Dashboard</a>
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

  // ---------- GLOBAL SEARCH MODULE (INTEGRATED) ----------
  function renderSearchModule(target, params) {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q") || "";

    target.innerHTML =
      renderHeader() +
      `
      <main class="search-container" style="padding:40px 20px; max-width:1200px; margin:0 auto;">
        <div class="search-header" style="margin-bottom:30px; text-align:center;">
          <h1 style="font-size:2.2rem; margin-bottom:10px; color:#fff;">Global Search</h1>
          <p style="color:#888;">Searching across 87 premium stores...</p>
          <div style="margin-top:18px; max-width:760px; margin-left:auto; margin-right:auto;">
            <input type="text" id="main-search-input" value="${esc(query)}"
              placeholder="Type to search products..."
              style="width:100%; padding:14px 22px; border-radius:999px; border:1px solid #333; background:#111; color:#fff; font-size:1.05rem;">
          </div>
        </div>

        <div id="search-results-grid" class="shop-grid">
          <div style="color:#666; grid-column:1/-1; text-align:center; padding:20px;">
            Type at least 2 characters to search…
          </div>
        </div>
      </main>
    `;

    // header interactions for search page too
    wireInteractions(target);

    const input = document.getElementById("main-search-input");
    const grid = document.getElementById("search-results-grid");

    if (input) {
      input.addEventListener("input", (e) => {
        performSearch(String(e.target.value || ""), grid);
      });
      // initial run
      if (query) performSearch(query, grid);
      // focus
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }

  async function performSearch(query, gridTarget) {
    if (!gridTarget) return;

    const qraw = String(query || "").trim();
    if (qraw.length < 2) {
      gridTarget.innerHTML = `<p style="color:#666; grid-column:1/-1; text-align:center;">Type at least 2 characters to search...</p>`;
      return;
    }

    gridTarget.innerHTML = `<p style="color:#666; grid-column:1/-1; text-align:center;">Searching...</p>`;

    const allData = await fetchJSON(DATA_URL);
    const results = [];
    const q = qraw.toLowerCase();

    Object.keys(allData || {}).forEach((storeSlug) => {
      const store = allData[storeSlug];
      if (!store) return;
      searchInData(store, storeSlug, q, results);
    });

    if (results.length === 0) {
      gridTarget.innerHTML = `<p style="color:#666; grid-column:1/-1; text-align:center;">No results found for "${esc(qraw)}"</p>`;
      return;
    }

    // Basic sort: exact title match > partial
    results.sort((a, b) => {
      const at = (a.title || "").toLowerCase();
      const bt = (b.title || "").toLowerCase();
      const ae = at === q ? 0 : at.startsWith(q) ? 1 : 2;
      const be = bt === q ? 0 : bt.startsWith(q) ? 1 : 2;
      return ae - be;
    });

    gridTarget.innerHTML = results.map((item) => {
      const href = item.url || "#";
      const badge = esc(item.storeName || "");
      const title = esc(item.title || "");
      const tagline = esc(item.tagline || "");

      // item.image: allow either "hardware/banner.webp" or already full path.
      const img = item.image ? String(item.image) : "";
      const imgSrc = img
        ? (img.startsWith("http") ? img : `${IMAGE_BASE_PATH}${img.replace(/^\/+/, "")}`)
        : "";

      return `
        <a href="${href}" class="shop-card" ${item.isExternal ? 'target="_blank" rel="noopener noreferrer"' : ""}>
          <div class="shop-card-media" style="position:relative;">
            ${imgSrc ? `<img src="${imgSrc}" loading="lazy" alt="${title}">` : `<div class="product-media-placeholder"></div>`}
            <div style="position:absolute; top:10px; right:10px; background:rgba(0,255,163,0.12); color:#00ffa3; padding:4px 8px; border-radius:6px; font-size:10px; border:1px solid rgba(0,255,163,0.2);">
              ${badge.toUpperCase()}
            </div>
          </div>
          <div class="shop-card-body">
            <h3 class="shop-card-title">${title}</h3>
            ${tagline ? `<p class="shop-card-tagline">${tagline}</p>` : ""}
          </div>
        </a>
      `;
    }).join("");
  }

  function searchInData(obj, storeSlug, q, results) {
    // 1) products
    if (obj.products && Array.isArray(obj.products)) {
      obj.products.forEach((p) => {
        if (!p || !p.title) return;
        const title = String(p.title || "");
        const tagline = String(p.tagline || "");
        if (title.toLowerCase().includes(q) || tagline.toLowerCase().includes(q)) {
          results.push({
            title,
            tagline,
            image: p.image || "",
            url: p.url || "#",
            isExternal: true,
            storeName: storeSlug
          });
        }
      });
    }

    // 2) sections (recursive)
    if (obj.sections && Array.isArray(obj.sections)) {
      obj.sections.forEach((s) => {
        if (!s) return;
        const name = String(s.name || "");
        const tagline = String(s.tagline || "Category");
        if (name.toLowerCase().includes(q)) {
          results.push({
            title: name,
            tagline,
            image: s.image || "",
            url: withBase(`/store/${storeSlug}/${s.slug || ""}/`),
            isExternal: false,
            storeName: storeSlug
          });
        }
        // recursive
        searchInData(s, storeSlug, q, results);
      });
    }
  }

  // ---------- INTERACTIONS ----------
  function wireInteractions(root) {
    // Header Search -> routes to /apps/search?q=
    const searchForm = root.querySelector(".store-header-search");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = searchForm.querySelector('input[name="q"], input[type="search"]');
        const q = input ? String(input.value || "").trim() : "";
        // go to apps search page (vercel rewrite loads apps/index.html)
        const url = withBase(`/apps/search?q=${encodeURIComponent(q)}`);
        window.location.href = url;
      });
    }

    // Categories collapse on mobile
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





