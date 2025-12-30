/**
 * RGZTEC Marketplace - Store Shell Engine
 * HYBRID MASTER FINAL (Static Stores + Dynamic Apps)
 *
 * - Static stores via <body class="store-body" data-path="hardware/ai-accelerators">
 * - Dynamic apps via /apps/* (admin, search, signin, open-store)
 * - Global search (recursive scan)
 * - Admin Command Center (recursive inventory count)
 * - BASE auto (no hardcoded /rgztec)
 *
 * IMPORTANT:
 * - Keep ONLY this file as: /assets/js/store-shell.js
 * - apps/index.html should set: window.APPS_MODE + window.APPS_PARAMS
 * - Your pages must have: <div id="store-root"></div> and <body class="store-body" ...>
 */
(() => {
  "use strict";

  // ============================================================
  // 1) BASE RESOLUTION
  // ============================================================
  function resolveBase() {
    // AWS Amplify'da site ana dizinden çalıştığı için burayı boş bırakıyoruz.
    // Bu sayede tüm assets ve store linkleri doğru yolu bulacak.
    return ""; 
  }

  const BASE = resolveBase(); // "" or "/rgztec"
  const withBase = (p) => (BASE ? `${BASE}${p}` : p);
  const enc = (s) => encodeURIComponent(String(s || ""));
  const safeSlug = (s) => String(s || "").trim().replace(/^\/+|\/+$/g, "");

  // Data + assets
  const DATA_URL = withBase("/data/store.data.json?v=" + Date.now());
  const IMAGE_BASE_PATH = withBase("/assets/images/store/");

  // ============================================================
  // 2) BOOT
  // ============================================================
  document.addEventListener("DOMContentLoaded", () => {
    const storeRoot = document.getElementById("store-root");
    const storeBody = document.querySelector("body.store-body");

    if (!storeBody || !storeRoot) return;

    // Dynamic apps layer (/apps/*)
    if (window.APPS_MODE) {
      initDynamicModule(String(window.APPS_MODE || "").trim(), window.APPS_PARAMS || [], storeRoot);
      return;
    }

    // Static store layer (87+ stores)
    const rawPath = (storeBody.dataset.path || window.RGZ_STORE_SLUG || "").trim();
    if (!rawPath) {
      renderError(storeRoot, `Missing data-path. Add: <body class="store-body" data-path="hardware">`);
      return;
    }

    initStore(rawPath, storeRoot);
  });

  // ============================================================
  // 3) DYNAMIC MODULES (/apps/*)
  // ============================================================
  async function initDynamicModule(mode, params, target) {
    const m = (mode || "dashboard").toLowerCase();

    if (m === "search") {
      renderSearchModule(target, params);
      return;
    }

    if (m === "admin") {
      renderAdminDashboard(target);
      return;
    }

    if (m === "signin") {
      target.innerHTML = renderHeader() + renderSignInModule();
      wireInteractions(target);
      return;
    }

    if (m === "open-store") {
      target.innerHTML = renderHeader() + renderOpenStoreModule();
      wireInteractions(target);
      return;
    }

    // Default fallback
    target.innerHTML =
      renderHeader() +
      `<main style="padding:80px 20px; text-align:center;">
        <h1 style="color:#fff; margin:0 0 8px;">Module: ${esc(m)}</h1>
        <p style="color:#888; margin:0;">Coming Soon</p>
      </main>`;
    wireInteractions(target);
  }

  // ---------- Dynamic: Sign In ----------
  function renderSignInModule() {
    return `
      <main style="padding:60px 20px; max-width:900px; margin:0 auto;">
        <div style="background:#0a0a0a; border:1px solid #222; padding:28px; border-radius:18px;">
          <h1 style="color:#fff; margin:0 0 10px;">Sign In</h1>
          <p style="color:#777; margin:0 0 22px;">Account system is being integrated.</p>
          <div style="display:grid; gap:12px;">
            <input placeholder="Email"
              style="padding:14px 16px; border-radius:12px; border:1px solid #333; background:#111; color:#fff; outline:none;">
            <input placeholder="Password" type="password"
              style="padding:14px 16px; border-radius:12px; border:1px solid #333; background:#111; color:#fff; outline:none;">
            <button type="button"
              style="padding:14px 16px; border-radius:12px; border:1px solid #00ffa3; background:#00ffa3; color:#000; font-weight:800; cursor:pointer;">
              Continue
            </button>
          </div>
        </div>
      </main>`;
  }

  // ---------- Dynamic: Open Store ----------
  function renderOpenStoreModule() {
    return `
      <main style="padding:60px 20px; max-width:1000px; margin:0 auto;">
        <div style="background:#0a0a0a; border:1px solid #222; padding:28px; border-radius:18px;">
          <h1 style="color:#fff; margin:0 0 10px;">Open a Store</h1>
          <p style="color:#777; margin:0 0 22px;">Apply to launch your store on RGZTEC Marketplace.</p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <input placeholder="Brand / Store Name"
              style="padding:14px 16px; border-radius:12px; border:1px solid #333; background:#111; color:#fff; outline:none;">
            <input placeholder="Email"
              style="padding:14px 16px; border-radius:12px; border:1px solid #333; background:#111; color:#fff; outline:none;">
            <input placeholder="Category (e.g., Hardware, Templates)"
              style="padding:14px 16px; border-radius:12px; border:1px solid #333; background:#111; color:#fff; outline:none;">
            <input placeholder="Website / Portfolio"
              style="padding:14px 16px; border-radius:12px; border:1px solid #333; background:#111; color:#fff; outline:none;">
          </div>

          <div style="margin-top:12px;">
            <textarea placeholder="Tell us what you'll sell…"
              style="width:100%; min-height:120px; padding:14px 16px; border-radius:12px; border:1px solid #333; background:#111; color:#fff; outline:none;"></textarea>
          </div>

          <div style="margin-top:12px; display:flex; gap:10px; justify-content:flex-end;">
            <a href="${withBase("/")}"
              style="padding:12px 14px; border-radius:12px; border:1px solid #333; background:#111; color:#aaa; text-decoration:none;">
              Back
            </a>
            <button type="button"
              style="padding:12px 14px; border-radius:12px; border:1px solid #00ffa3; background:#00ffa3; color:#000; font-weight:800; cursor:pointer;">
              Submit
            </button>
          </div>
        </div>
      </main>`;
  }

  // ---------- Dynamic: Admin ----------
  async function renderAdminDashboard(target) {
    target.innerHTML =
      renderHeader() +
      `<div style="padding:40px; color:#fff; text-align:center;">Loading System Data...</div>`;

    try {
      const data = await fetchJSON(DATA_URL);
      const stores = Object.keys(data || {});
      let totalItems = 0;

      stores.forEach((k) => {
        totalItems += countTree(data[k]);
      });

      target.innerHTML =
        renderHeader() +
        `
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
                <div style="font-size:28px; color:#00ffa3; font-weight:800;">Hybrid FINAL</div>
              </div>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            <h3 style="color:#fff; margin:0 0 10px;">Store Inventory</h3>
            ${stores.map((key) => {
              const title = esc((data[key] && (data[key].title || data[key].name)) || key);
              const route = withBase(`/store/${enc(key)}/`);
              const editRoute = withBase(`/apps/editor?store=${enc(key)}`); // placeholder
              return `
                <div style="background:#0a0a0a; border:1px solid #1a1a1a; padding:16px 24px; border-radius:14px; display:flex; justify-content:space-between; align-items:center; gap:14px;">
                  <div>
                    <div style="color:#fff; font-weight:600;">${title}</div>
                    <div style="color:#444; font-size:12px; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">/store/${esc(key)}/</div>
                  </div>
                  <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
                    <a href="${editRoute}"
                      style="background:#1a1a1a; color:#bbb; border:1px solid #333; padding:8px 16px; border-radius:8px; font-size:12px; font-weight:700; text-decoration:none;">
                      EDIT
                    </a>
                    <a href="${route}" target="_blank" rel="noopener"
                      style="background:#00ffa3; color:#000; padding:8px 16px; border-radius:8px; font-size:12px; font-weight:900; text-decoration:none;">
                      LIVE
                    </a>
                  </div>
                </div>`;
            }).join("")}
          </div>
        </main>
      `;

      wireInteractions(target);
    } catch (e) {
      renderError(target, "Admin Data Load Failed: " + (e && e.message ? e.message : String(e)));
    }
  }

  function countTree(node) {
    let c = 0;
    if (!node) return 0;
    if (Array.isArray(node.products)) c += node.products.length;
    if (Array.isArray(node.sections)) {
      c += node.sections.length;
      node.sections.forEach((s) => (c += countTree(s)));
    }
    return c;
  }

  // ---------- Dynamic: Search ----------
  function renderSearchModule(target) {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q") || "";

    target.innerHTML =
      renderHeader() +
      `
      <main class="search-container" style="padding:40px 20px; max-width:1200px; margin:0 auto;">
        <div class="search-header" style="margin-bottom:30px; text-align:center;">
          <h1 style="font-size:2.2rem; margin:0 0 10px; color:#fff;">Global Search</h1>
          <p style="color:#888; margin:0;">Deep scanning stores and sub-stores...</p>
          <div style="margin-top:18px; max-width:760px; margin-left:auto; margin-right:auto;">
            <input
              type="text"
              id="main-search-input"
              value="${esc(query)}"
              placeholder="Search products, tools or shops..."
              style="width:100%; padding:16px 24px; border-radius:999px; border:1px solid #333; background:#111; color:#fff; font-size:1.1rem; outline:none;"
            />
          </div>
        </div>

        <div id="search-results-grid" class="shop-grid"></div>
      </main>
    `;

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
    if (!gridTarget) return;

    if (qraw.length < 2) {
      gridTarget.innerHTML = `<p style="color:#444; grid-column:1/-1; text-align:center; padding:40px;">Enter at least 2 characters to scan...</p>`;
      return;
    }

    let allData;
    try {
      allData = await fetchJSON(DATA_URL);
    } catch (e) {
      gridTarget.innerHTML = `<p style="color:#666; grid-column:1/-1; text-align:center; padding:40px;">Search failed to load database.</p>`;
      return;
    }

    const results = [];
    Object.keys(allData || {}).forEach((slug) => searchInData(allData[slug], slug, qraw, results));

    if (results.length === 0) {
      gridTarget.innerHTML = `<p style="color:#666; grid-column:1/-1; text-align:center; padding:40px;">No matches found for "${esc(qraw)}"</p>`;
      return;
    }

    gridTarget.innerHTML = results
      .slice(0, 200)
      .map((item) => {
        const img = resolveImage(item.image || "");
        return `
          <a href="${escAttr(item.url || "#")}" class="shop-card" ${item.isExternal ? 'target="_blank" rel="noopener"' : ""}>
            <div class="shop-card-media" style="position:relative;">
              ${img
                ? `<img src="${escAttr(img)}" loading="lazy" alt="${escAttr(item.title || "")}">`
                : `<div class="product-media-placeholder"></div>`
              }
              <div style="position:absolute; top:12px; right:12px; background:#00ffa3; color:#000; padding:3px 8px; border-radius:6px; font-size:10px; font-weight:bold; letter-spacing:0.5px;">
                ${esc(String(item.storeName || "").toUpperCase())}
              </div>
            </div>
            <div class="shop-card-body">
              <h3 class="shop-card-title">${esc(item.title)}</h3>
              <p class="shop-card-tagline">${esc(item.tagline || "")}</p>
            </div>
          </a>`;
      })
      .join("");
  }

  function searchInData(obj, storeSlug, q, results) {
    if (!obj) return;

    // Products
    if (Array.isArray(obj.products)) {
      obj.products.forEach((p) => {
        const title = String(p && p.title ? p.title : "");
        const tagline = String(p && p.tagline ? p.tagline : "");
        const t = title.toLowerCase();
        const g = tagline.toLowerCase();

        if (t.includes(q) || g.includes(q)) {
          results.push({
            title: title || "Product",
            tagline: tagline || "",
            image: p && p.image ? p.image : "",
            url: (p && p.url) || "#",
            isExternal: true,
            storeName: storeSlug
          });
        }
      });
    }

    // Sections (recursive)
    if (Array.isArray(obj.sections)) {
      obj.sections.forEach((s) => {
        const nm = String((s && (s.name || s.title)) || "").toLowerCase();
        const slug = String((s && s.slug) || "").trim();

        if (nm && nm.includes(q)) {
          results.push({
            title: (s && (s.name || s.title)) || slug || "Section",
            tagline: (s && s.tagline) || "Shop Section",
            image: (s && s.image) || "",
            url: slug ? withBase(`/store/${enc(storeSlug)}/${enc(slug)}/`) : withBase(`/store/${enc(storeSlug)}/`),
            isExternal: false,
            storeName: storeSlug
          });
        }

        searchInData(s, storeSlug, q, results);
      });
    }
  }

  // ============================================================
  // 4) STATIC STORE INIT
  // ============================================================
  async function initStore(path, target) {
    try {
      target.innerHTML = `<div style="padding:18px; color:#666; font-family:Inter,system-ui,Arial;">Loading store...</div>`;

      const allStoresData = await fetchJSON(DATA_URL);
      const found = findDataByPath(allStoresData, path);

      const currentData = found.currentData;
      const rootSlug = found.rootSlug;
      const currentSlug = found.currentSlug;
      const depth = found.depth;

      if (!currentData || !rootSlug) throw new Error(`Path not found: "${path}"`);

      const rootStoreData = allStoresData[rootSlug] || {};
      const rootSections = Array.isArray(rootStoreData.sections) ? rootStoreData.sections : [];
      const activeSectionSlug = depth >= 2 ? currentSlug : null;

      const html =
        renderHeader() +
        renderStoreNav(allStoresData, rootSlug) +
        renderSectionNav(rootSections, activeSectionSlug, rootSlug) +
        renderHero(currentData) +
        (Array.isArray(currentData.sections) && currentData.sections.length > 0
          ? renderShopSection(currentData.sections, rootSlug)
          : Array.isArray(currentData.products) && currentData.products.length > 0
          ? renderProductSection(currentData.products)
          : renderEmptyShop());

      target.innerHTML = html;
      wireInteractions(target);
    } catch (e) {
      renderError(target, e && e.message ? e.message : String(e));
    }
  }

  function findDataByPath(all, path) {
    const segments = normalizePath(path).split("/").filter(Boolean);
    const rootSlug = segments[0] || null;
    const currentSlug = segments[segments.length - 1] || null;
    const depth = segments.length;

    if (!rootSlug || !all || !all[rootSlug]) return { currentData: null };

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

  function normalizePath(p) {
    let s = String(p || "");
    s = s.replace(/[?#].*$/, "").trim(); // ✅ remove ?query and #hash
    s = s.replace(/^\/+/, "").replace(/\/+$/, "");
    return s;
  }

  // ============================================================
  // 5) RENDER
  // ============================================================
  function renderHeader() {
    const isApps = (location.pathname || "").includes("/apps/");
    const active = (slug) => (isApps && String(window.APPS_MODE || "").toLowerCase() === slug ? "active" : "");

    return `
      <header class="store-header">
        <div class="store-header-inner">
          <div class="store-header-left">
            <a href="${withBase("/")}" class="store-header-logo">RGZTEC</a>

            <button class="store-header-categories-btn" id="btn-categories" type="button"
              aria-expanded="true" aria-controls="store-section-nav">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="store-header-icon">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <span>Categories</span>
            </button>
          </div>

          <div class="store-header-center">
            <form class="store-header-search" role="search">
              <input type="search" name="q" placeholder="Search across stores..." aria-label="Search" />
              <button type="submit" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  stroke-width="1.5" stroke="currentColor" class="store-header-icon">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </form>
          </div>

          <div class="store-header-right">
            <div class="store-header-secondary">
              <a href="${withBase("/apps/admin")}" class="store-header-secondary-link ${active("admin")}">Dashboard</a>
              <a href="${withBase("/apps/signin")}" class="store-header-secondary-link ${active("signin")}">Sign In</a>
            </div>

            <a href="${withBase("/apps/open-store")}" class="store-header-cta ${active("open-store")}">
              <span>Open Store</span>
            </a>
          </div>
        </div>
      </header>`;
  }

  function renderStoreNav(all, currentRootSlug) {
    const storeLinks = Object.keys(all || {})
      .map((slug) => {
        const store = all[slug];
        if (!store || (!store.title && !store.name)) return "";
        const isActive = slug === currentRootSlug;
        return `
          <li class="store-main-nav__item">
            <a href="${withBase(`/store/${enc(slug)}/`)}" class="store-main-nav__link ${isActive ? "active" : ""}">
              ${esc(store.title || store.name || slug)}
            </a>
          </li>`;
      })
      .join("");

    return `
      <nav class="store-main-nav" aria-label="RGZTEC stores">
        <ul class="store-main-nav__list">${storeLinks}</ul>
      </nav>`;
  }

  function renderSectionNav(sections, activeSlug, rootSlug) {
    if (!Array.isArray(sections) || sections.length === 0) return "";
    const navItems = sections
      .map((section) => {
        if (!section) return "";
        const slug = safeSlug(section.slug || "");
        const name = esc(section.name || section.title || "Unnamed Section");
        const isActive = !!activeSlug && slug === activeSlug;
        const href = isActive ? "#" : withBase(`/store/${enc(rootSlug)}/${enc(slug)}/`);
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
    const title = esc(data.title || data.name || "Welcome");
    const tagline = esc(data.tagline || "");
    const badge = esc(data.badge || "Official");
    const bannerUrl = resolveImage(data.banner || "");

    return `
      <section class="store-hero">
        <div class="store-hero-inner">
          <div class="store-hero-left">
            <span class="store-badge">${badge}</span>
            <h1>${title}</h1>
            ${tagline ? `<p class="store-hero-tagline">${tagline}</p>` : ""}
          </div>
          <div class="store-hero-right">
            ${bannerUrl ? `<img src="${escAttr(bannerUrl)}" class="store-hero-img" alt="${escAttr(title)}" loading="lazy">` : ""}
          </div>
        </div>
      </section>`;
  }

  function renderShopSection(sections, rootSlug) {
    const cards = sections
      .map((s) => {
        if (!s) return "";
        const slug = safeSlug(s.slug || "");
        const href = withBase(`/store/${enc(rootSlug)}/${enc(slug)}/`);
        const imageUrl = resolveImage(s.image || "");
        return `
          <a href="${href}" class="shop-card">
            <div class="shop-card-media">
              ${
                imageUrl
                  ? `<img src="${escAttr(imageUrl)}" alt="${escAttr(s.name || s.title || "")}" loading="lazy">`
                  : `<div class="product-media-placeholder"></div>`
              }
            </div>
            <div class="shop-card-body">
              <h3 class="shop-card-title">${esc(s.name || s.title || "Untitled Shop")}</h3>
              <p class="shop-card-tagline">${esc(s.tagline || "")}</p>
            </div>
          </a>`;
      })
      .join("");

    return `
      <main class="store-shops">
        <div class="store-shops-header"><h2>Explore Shops</h2></div>
        <div class="shop-grid">${cards}</div>
      </main>`;
  }

  function renderProductSection(products) {
    const cards = products
      .map((p) => {
        if (!p) return "";
        const url = p.url ? escAttr(p.url) : "#";
        const title = esc(p.title || "Untitled Product");
        const tagline = esc(p.tagline || "");
        const imageUrl = resolveImage(p.image || "");
        return `
          <a href="${url}" class="shop-card" target="_blank" rel="noopener noreferrer">
            <div class="shop-card-media">
              ${imageUrl ? `<img src="${escAttr(imageUrl)}" alt="${escAttr(title)}" loading="lazy">` : `<div class="product-media-placeholder"></div>`}
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

  // Resolve image to absolute or base-relative
  function resolveImage(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("/")) return withBase(s); // "/assets/..." or "/images/..."
    return IMAGE_BASE_PATH + s.replace(/^\/+/, "");
  }

  // ============================================================
  // 6) INTERACTIONS
  // ============================================================
  function wireInteractions(root) {
    // Header search => /apps/search?q=
    const form = root.querySelector(".store-header-search");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const inp = form.querySelector('input[name="q"]') || form.querySelector("input");
        const q = inp ? String(inp.value || "").trim() : "";
        if (q) window.location.href = withBase(`/apps/search?q=${enc(q)}`);
      });
    }

    // Categories collapse (mobile)
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

  // ============================================================
  // 7) CORE UTILS
  // ============================================================
  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText} (${url})`);
    }
    return await res.json();
  }

  function renderError(targetOrEl, msg) {
    const el = typeof targetOrEl === "string" ? document.querySelector(targetOrEl) : targetOrEl;
    if (!el) return;
    el.innerHTML = `
      <div style="padding:22px;max-width:900px;margin:20px auto;font-family:Inter,system-ui,Arial;">
        <h2 style="margin:0 0 10px; color:#111;">RGZTEC • Load Error</h2>
        <div style="padding:14px;border:1px solid #eee;border-radius:12px;background:#fff;">
          <div style="margin-bottom:10px;color:#111;">${esc(msg)}</div>
          <div style="color:#666;font-size:13px;">
            <div><b>DATA_URL</b>: <code>${esc(DATA_URL)}</code></div>
            <div><b>BASE</b>: <code>${esc(BASE)}</code></div>
          </div>
        </div>
      </div>`;
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

  function escAttr(s) {
    return esc(String(s || "")).replace(/`/g, "&#096;");
  }
  // expose minimal helpers for other pages (seller/admin/etc.)
window.StoreShell = window.StoreShell || {};
window.StoreShell.base = BASE;
window.StoreShell.withBase = withBase;
// ---- DİNAMİK VERİ ENJEKSİYONU (YAPIYI BOZMADAN) ----
  async function syncWithLiveApi() {
    try {
      // Senin handler fonksiyonuna istek atıyoruz
      const response = await fetch(withBase('/api/catalog')); 
      const result = await response.json();

      if (result.ok && result.data && Array.isArray(result.data.stores)) {
        const liveData = result.data.stores;

        // Mevcut fonksiyonlarını yeni veriyle tekrar tetikle
        renderGallery(liveData);
        renderSubNav(liveData);
        initMegaMenu(liveData);
        
        console.log("RGZTEC LIVE • Mağazalar API'den güncellendi.");
      }
    } catch (err) {
      console.warn("API Bağlantısı kurulamadı, statik verilerle devam ediliyor.");
    }
  }

  // Sayfa yüklendiğinde canlı veriyi çekmeyi dene
  document.addEventListener("DOMContentLoaded", syncWithLiveApi);

  // SEARCH TETİKLEYİCİ (Arama butonunu canlandırır)
  const searchBtn = document.querySelector('.search-btn');
  const searchInput = document.querySelector('.search-input');
  if (searchBtn && searchInput) {
    const runSearch = () => {
      const q = searchInput.value.trim();
      if(q) window.location.href = withBase(`/search.html?q=${enc(q)}`);
    };
    searchBtn.addEventListener('click', runSearch);
    searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') runSearch(); });
  }
  // ---- SEARCH ENGINE (YAPIYI BOZMADAN EKLE) ----
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-btn');

  if (searchInput && searchBtn) {
    const handleSearch = () => {
      const query = searchInput.value.trim();
      if (query.length > 0) {
        // Kullanıcıyı arama sonuçları sayfasına, base path'i koruyarak gönderir
        // apps/core/search-logic.js bu URL parametresini yakalayıp sonuçları getirecek
        window.location.href = withBase(`/search.html?q=${enc(query)}`);
      }
    };

    // Büyüteç butonuna tıklandığında ara
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSearch();
    });

    // Enter tuşuna basıldığında ara
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    });
  }
})();

