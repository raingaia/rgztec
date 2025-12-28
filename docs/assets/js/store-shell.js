/**
 * RGZTEC Marketplace - Store Shell Engine
 * HYBRID MASTER (Static 87 Stores + Dynamic Apps)
 * Features: Global Search + Admin Command Center + Recursive Scan
 */
(() => {
  "use strict";

  // ---------- BASE RESOLUTION ----------
  function resolveBase() {
    const meta = document.querySelector('meta[name="rgz-base"]');
    if (meta && meta.content != null) return String(meta.content).trim().replace(/\/+$/, "");
    const p = location.pathname || "/";
    return p.includes("/rgztec/") ? "/rgztec" : "";
  }

  const BASE = resolveBase();
  const withBase = (p) => (BASE ? `${BASE}${p}` : p);
  const DATA_URL = withBase("/data/store.data.json?v=" + Date.now());
  const IMAGE_BASE_PATH = withBase("/assets/images/store/");

  // ---------- BOOT ----------
  document.addEventListener("DOMContentLoaded", () => {
    const storeRoot = document.getElementById("store-root");
    const storeBody = document.querySelector("body.store-body");

    if (!storeBody || !storeRoot) return;

    if (window.APPS_MODE) {
      initDynamicModule(window.APPS_MODE, window.APPS_PARAMS || [], storeRoot);
      return;
    }

    const rawPath = (storeBody.dataset.path || window.RGZ_STORE_SLUG || "").trim();
    if (!rawPath) {
      renderError(storeRoot, `Missing data-path. Add: <body class="store-body" data-path="hardware">`);
      return;
    }

    initStore(rawPath, storeRoot);
  });

  // ---------- DYNAMIC MODULES ----------
  async function initDynamicModule(mode, params, target) {
    if (mode === "search") {
      renderSearchModule(target, params);
      return;
    }

    if (mode === "admin") {
      renderAdminDashboard(target);
      return;
    }

    // Default Fallback
    target.innerHTML = renderHeader() + `<main style="padding:80px 20px; text-align:center;"><h1 style="color:#fff;">Module: ${esc(mode)}</h1><p style="color:#888;">Coming Soon</p></main>`;
    wireInteractions(target);
  }

  // ---------- PREMIUM ADMIN DASHBOARD ----------
  async function renderAdminDashboard(target) {
    target.innerHTML = renderHeader() + `<div style="padding:40px; color:#fff; text-align:center;">Loading System Data...</div>`;
    
    try {
      const data = await fetchJSON(DATA_URL);
      const stores = Object.keys(data);
      let totalItems = 0;
      
      stores.forEach(k => {
        if(data[k].products) totalItems += data[k].products.length;
        if(data[k].sections) totalItems += data[k].sections.length;
      });

      target.innerHTML = renderHeader() + `
        <main class="admin-panel" style="padding:40px 20px; max-width:1200px; margin:0 auto; font-family:Inter, sans-serif;">
          <div style="background:linear-gradient(145deg, #0f0f0f, #050505); border:1px solid #333; padding:40px; border-radius:30px; margin-bottom:40px;">
            <h1 style="font-size:32px; color:#fff; margin:0;">Command Center</h1>
            <p style="color:#666; margin:8px 0 30px;">Global Infrastructure Management</p>
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:20px;">
              <div style="background:#111; padding:20px; border-radius:16px; border:1px solid #222;">
                <small style="color:#555; text-transform:uppercase; letter-spacing:1px;">Active Stores</small>
                <div style="font-size:28px; color:#00ffa3; font-weight:800;">${stores.length}</div>
              </div>
              <div style="background:#111; padding:20px; border-radius:16px; border:1px solid #222;">
                <small style="color:#555; text-transform:uppercase; letter-spacing:1px;">Total Entries</small>
                <div style="font-size:28px; color:#00ffa3; font-weight:800;">${totalItems}</div>
              </div>
              <div style="background:#111; padding:20px; border-radius:16px; border:1px solid #222;">
                <small style="color:#555; text-transform:uppercase; letter-spacing:1px;">Engine Status</small>
                <div style="font-size:28px; color:#00ffa3; font-weight:800;">v2.5 Hybrid</div>
              </div>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            <h3 style="color:#fff; margin-bottom:10px;">Store Inventory (87 Units)</h3>
            ${stores.map(key => `
              <div style="background:#0a0a0a; border:1px solid #1a1a1a; padding:16px 24px; border-radius:14px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="color:#fff; font-weight:600;">${esc(data[key].title || key)}</div>
                  <div style="color:#444; font-size:12px; font-family:monospace;">/store/${key}/</div>
                </div>
                <div style="display:flex; gap:10px;">
                   <button onclick="alert('JSON Editor coming in next update!')" style="background:#1a1a1a; color:#888; border:1px solid #333; padding:8px 16px; border-radius:8px; cursor:pointer; font-size:12px;">EDIT</button>
                   <a href="${withBase('/store/' + key + '/')}" target="_blank" style="background:#00ffa3; color:#000; padding:8px 16px; border-radius:8px; font-size:12px; font-weight:bold; text-decoration:none;">LIVE</a>
                </div>
              </div>
            `).join('')}
          </div>
        </main>`;
        wireInteractions(target);
    } catch (e) {
      renderError(target, "Admin Data Load Failed: " + e.message);
    }
  }

  // ---------- GLOBAL SEARCH MODULE ----------
  function renderSearchModule(target, params) {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q") || "";

    target.innerHTML = renderHeader() + `
      <main class="search-container" style="padding:40px 20px; max-width:1200px; margin:0 auto;">
        <div class="search-header" style="margin-bottom:30px; text-align:center;">
          <h1 style="font-size:2.2rem; margin-bottom:10px; color:#fff;">Global Search</h1>
          <p style="color:#888;">Deep scanning 87 premium store units...</p>
          <div style="margin-top:18px; max-width:760px; margin-left:auto; margin-right:auto;">
            <input type="text" id="main-search-input" value="${esc(query)}"
              placeholder="Search products, tools or shops..."
              style="width:100%; padding:16px 24px; border-radius:999px; border:1px solid #333; background:#111; color:#fff; font-size:1.1rem; outline:none; transition:border-color 0.2s;">
          </div>
        </div>
        <div id="search-results-grid" class="shop-grid"></div>
      </main>`;

    wireInteractions(target);
    const input = document.getElementById("main-search-input");
    const grid = document.getElementById("search-results-grid");

    if (input) {
      input.addEventListener("input", (e) => performSearch(e.target.value, grid));
      if (query) performSearch(query, grid);
      input.focus();
    }
  }

  async function performSearch(query, gridTarget) {
    const qraw = String(query || "").trim().toLowerCase();
    if (qraw.length < 2) {
      gridTarget.innerHTML = `<p style="color:#444; grid-column:1/-1; text-align:center; padding:40px;">Enter at least 2 characters to scan the database...</p>`;
      return;
    }

    const allData = await fetchJSON(DATA_URL);
    const results = [];
    Object.keys(allData).forEach(slug => searchInData(allData[slug], slug, qraw, results));

    if (results.length === 0) {
      gridTarget.innerHTML = `<p style="color:#666; grid-column:1/-1; text-align:center; padding:40px;">No matches found for "${esc(qraw)}"</p>`;
      return;
    }

    gridTarget.innerHTML = results.map(item => `
        <a href="${item.url}" class="shop-card" ${item.isExternal ? 'target="_blank" rel="noopener"' : ''}>
          <div class="shop-card-media" style="position:relative;">
            ${item.image ? `<img src="${item.image.startsWith('http') ? item.image : IMAGE_BASE_PATH + item.image}" loading="lazy">` : `<div class="product-media-placeholder"></div>`}
            <div style="position:absolute; top:12px; right:12px; background:#00ffa3; color:#000; padding:3px 8px; border-radius:6px; font-size:10px; font-weight:bold; letter-spacing:0.5px;">${item.storeName.toUpperCase()}</div>
          </div>
          <div class="shop-card-body">
            <h3 class="shop-card-title">${esc(item.title)}</h3>
            <p class="shop-card-tagline">${esc(item.tagline)}</p>
          </div>
        </a>`).join("");
  }

  function searchInData(obj, storeSlug, q, results) {
    if (obj.products) {
      obj.products.forEach(p => {
        if (p.title.toLowerCase().includes(q) || (p.tagline && p.tagline.toLowerCase().includes(q))) {
          results.push({ title: p.title, tagline: p.tagline, image: p.image, url: p.url, isExternal: true, storeName: storeSlug });
        }
      });
    }
    if (obj.sections) {
      obj.sections.forEach(s => {
        if (s.name.toLowerCase().includes(q)) {
          results.push({ title: s.name, tagline: s.tagline || "Shop Section", image: s.image, url: withBase(`/store/${storeSlug}/${s.slug}/`), isExternal: false, storeName: storeSlug });
        }
        searchInData(s, storeSlug, q, results);
      });
    }
  }

  // ---------- STATIC STORE INIT ----------
  async function initStore(path, target) {
    try {
      target.innerHTML = `<div style="padding:18px; color:#666;">Synchronizing...</div>`;
      const allStoresData = await fetchJSON(DATA_URL);
      const { currentData, rootSlug, currentSlug, depth } = findDataByPath(allStoresData, path);
      if (!currentData || !rootSlug) throw new Error(`Path not found: "${path}"`);

      const rootStoreData = allStoresData[rootSlug] || {};
      const rootSections = Array.isArray(rootStoreData.sections) ? rootStoreData.sections : [];
      const activeSectionSlug = depth >= 2 ? currentSlug : null;

      target.innerHTML = renderHeader() + 
        renderStoreNav(allStoresData, rootSlug) + 
        renderSectionNav(rootSections, activeSectionSlug, rootSlug) + 
        renderHero(currentData) + 
        (Array.isArray(currentData.sections) && currentData.sections.length > 0 ? renderShopSection(currentData.sections, rootSlug) : 
        Array.isArray(currentData.products) && currentData.products.length > 0 ? renderProductSection(currentData.products) : renderEmptyShop());

      wireInteractions(target);
    } catch (e) {
      renderError(target, e.message);
    }
  }

  // ---------- HELPERS & RENDERS (Core) ----------
  function findDataByPath(all, path) {
    const segments = path.replace(/^\/+/, "").replace(/\/+$/, "").split("/").filter(Boolean);
    const rootSlug = segments[0] || null;
    if (!rootSlug || !all[rootSlug]) return { currentData: null };
    let currentData = all[rootSlug];
    for (let i = 1; i < segments.length; i++) {
      const next = (currentData.sections || []).find(s => s.slug === segments[i]);
      if (next) currentData = next; else return { currentData: null };
    }
    return { currentData, rootSlug, currentSlug: segments[segments.length-1], depth: segments.length };
  }

  function renderHeader() {
    return `
      <header class="store-header">
        <div class="store-header-inner">
          <div class="store-header-left">
            <a href="${withBase("/")}" class="store-header-logo">RGZTEC</a>
            <button class="store-header-categories-btn" id="btn-categories">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="store-header-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              <span>Categories</span>
            </button>
          </div>
          <div class="store-header-center">
            <form class="store-header-search">
              <input type="search" name="q" placeholder="Global search..." />
              <button type="submit"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="store-header-icon"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg></button>
            </form>
          </div>
          <div class="store-header-right">
            <a href="${withBase("/apps/admin")}" class="store-header-secondary-link">Dashboard</a>
            <a href="#" class="store-header-cta"><span>Open Store</span></a>
          </div>
        </div>
      </header>`;
  }

  function renderStoreNav(all, currentRootSlug) {
    const links = Object.keys(all).map(slug => `<li class="store-main-nav__item"><a href="${withBase(`/store/${slug}/`)}" class="store-main-nav__link ${slug === currentRootSlug ? "active" : ""}">${esc(all[slug].title)}</a></li>`).join("");
    return `<nav class="store-main-nav"><ul class="store-main-nav__list">${links}</ul></nav>`;
  }

  function renderSectionNav(sections, active, root) {
    if (!sections.length) return "";
    const items = sections.map(s => `<li class="store-section-nav__item"><a href="${withBase(`/store/${root}/${s.slug}/`)}" class="store-section-nav__link ${s.slug === active ? "active" : ""}">${esc(s.name)}</a></li>`).join("");
    return `<nav id="store-section-nav" class="store-section-nav"><ul class="store-section-nav__list">${items}</ul></nav>`;
  }

  function renderHero(data) {
    const banner = data.banner ? `${IMAGE_BASE_PATH}${esc(data.banner)}` : "";
    return `<section class="store-hero"><div class="store-hero-inner"><div class="store-hero-left"><span class="store-badge">${esc(data.badge || "Official")}</span><h1>${esc(data.title || data.name)}</h1><p class="store-hero-tagline">${esc(data.tagline || "")}</p></div><div class="store-hero-right">${banner ? `<img src="${banner}" class="store-hero-img">` : ""}</div></div></section>`;
  }

  function renderShopSection(sections, root) {
    const cards = sections.map(s => `<a href="${withBase(`/store/${root}/${s.slug}/`)}" class="shop-card"><div class="shop-card-media">${s.image ? `<img src="${IMAGE_BASE_PATH}${s.image}" loading="lazy">` : `<div class="product-media-placeholder"></div>`}</div><div class="shop-card-body"><h3 class="shop-card-title">${esc(s.name)}</h3><p class="shop-card-tagline">${esc(s.tagline || "")}</p></div></a>`).join("");
    return `<main class="store-shops"><div class="store-shops-header"><h2>Explore Shops</h2></div><div class="shop-grid">${cards}</div></main>`;
  }

  function renderProductSection(products) {
    const cards = products.map(p => `<a href="${p.url || "#"}" class="shop-card" target="_blank"><div class="shop-card-media">${p.image ? `<img src="${IMAGE_BASE_PATH}${p.image}" loading="lazy">` : `<div class="product-media-placeholder"></div>`}</div><div class="shop-card-body"><h3 class="shop-card-title">${esc(p.title)}</h3><p class="shop-card-tagline">${esc(p.tagline || "")}</p></div></a>`).join("");
    return `<main class="store-products"><div class="store-products-header"><h2>Explore Products</h2></div><div class="shop-grid">${cards}</div></main>`;
  }

  function renderEmptyShop() { return `<main class="store-products"><div class="products-grid-empty"><h3>Coming Soon</h3><p>New sections and products are being added.</p></div></main>`; }

  function wireInteractions(root) {
    const form = root.querySelector(".store-header-search");
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = form.querySelector('input').value.trim();
      if (q) window.location.href = withBase(`/apps/search?q=${encodeURIComponent(q)}`);
    });
    const btn = root.querySelector("#btn-categories");
    const nav = root.querySelector("#store-section-nav");
    if (btn && nav) btn.addEventListener("click", () => nav.classList.toggle("is-collapsed"));
  }

  function renderError(target, msg) {
    target.innerHTML = `<div style="padding:40px; color:white;"><h2>Engine Error</h2><p>${esc(msg)}</p></div>`;
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  function esc(s) { return String(s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])); }

})();
