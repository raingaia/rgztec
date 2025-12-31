/**
 * RGZTEC Marketplace - Store Shell Engine
 * HYBRID MASTER (Static Stores + Dynamic Apps)
 *
 * Static stores:
 *   <body class="store-body" data-path="ai-tools-hub">
 * Dynamic apps:
 *   window.APPS_MODE / window.APPS_PARAMS
 *
 * Data:
 *   window.RGZ_DATA_URL  (preferred)
 *   or <meta name="rgz-data" content="/data/store.data.json">
 *   fallback: /data/store.data.json
 */
(() => {
  "use strict";
  
  console.log("STORE-SHELL BOOT OK", location.pathname);

  // ============================================================
  // 1) BASE RESOLUTION (Amplify root => "")
  // ============================================================
  function resolveBase() {
    // Amplify root deploy => no /rgztec prefix
    return "";
  }

  const BASE = resolveBase();
  const withBase = (p) => (BASE ? `${BASE}${p}` : p);
  const enc = (s) => encodeURIComponent(String(s ?? ""));
  const safeSlug = (s) => String(s || "").trim().replace(/^\/+|\/+$/g, "");
  const IMAGE_BASE_FALLBACK = withBase("/assets/images/store/");

  function addCacheBuster(url) {
    const u = String(url || "").trim();
    if (!u) return u;
    // already has v=
    if (/[?&]v=/.test(u)) return u;
    return u + (u.includes("?") ? "&" : "?") + "v=" + Date.now();
  }

  function resolveDataUrlBase() {
    // 1) window override (senin enjekte ettiğin)
    if (typeof window.RGZ_DATA_URL === "string" && window.RGZ_DATA_URL.trim()) {
      const u = window.RGZ_DATA_URL.trim();
      // already absolute or relative
      if (/^https?:\/\//i.test(u)) return u;
      return withBase(u.startsWith("/") ? u : `/${u}`);
    }

    // 2) meta override
    const meta = document.querySelector('meta[name="rgz-data"]');
    if (meta && meta.content != null && String(meta.content).trim()) {
      const u = String(meta.content).trim();
      if (/^https?:\/\//i.test(u)) return u;
      return withBase(u.startsWith("/") ? u : `/${u}`);
    }

    // 3) fallback (senin dosyan)
    return withBase("/data/store.data.json");
  }

  const DATA_URL = addCacheBuster(resolveDataUrlBase());
  const IMAGE_BASE_PATH =
    (typeof window.RGZ_IMAGE_BASE === "string" && window.RGZ_IMAGE_BASE.trim())
      ? withBase(window.RGZ_IMAGE_BASE.trim())
      : IMAGE_BASE_FALLBACK;

  // expose minimal helpers
  window.StoreShell = window.StoreShell || {};
  window.StoreShell.base = BASE;
  window.StoreShell.withBase = withBase;
  window.StoreShell.dataUrl = DATA_URL;
  window.StoreShell.imageBase = IMAGE_BASE_PATH;

  // ============================================================
  // 2) BOOT
  // ============================================================
  function bootStoreShell() {
  const storeRoot = document.getElementById("store-root");
  const storeBody = document.querySelector("body.store-body");

  if (!storeBody || !storeRoot) return;

  // Dynamic apps
  if (window.APPS_MODE) {
    initDynamicModule(String(window.APPS_MODE || "").trim(), window.APPS_PARAMS || [], storeRoot);
    return;
  }

  // Static store
  const rawPath = (storeBody.dataset.path || window.RGZ_STORE_SLUG || "").trim();
  if (!rawPath) {
    renderError(storeRoot, `Missing data-path. Add: <body class="store-body" data-path="ai-tools-hub">`);
    return;
  }

  initStore(rawPath, storeRoot);
}

// ✅ DOMContentLoaded kaçmış olsa bile çalış
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootStoreShell);
} else {
  bootStoreShell();
}


  // ============================================================
  // 3) DYNAMIC MODULES (/apps/*)
  // ============================================================
  async function initDynamicModule(mode, params, target) {
    const m = (mode || "dashboard").toLowerCase();

    if (m === "search") {
      renderSearchModule(target);
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

    target.innerHTML =
      renderHeader() +
      `<main style="padding:80px 20px; text-align:center;">
        <h1 style="color:#fff; margin:0 0 8px;">Module: ${esc(m)}</h1>
        <p style="color:#888; margin:0;">Coming Soon</p>
      </main>`;
    wireInteractions(target);
  }

  function renderSignInModule() {
    return `
      <main style="padding:60px 20px; max-width:900px; margin:0 auto;">
        <div style="background:#0a0a0a; border:1px solid #222; padding:28px; border-radius:18px;">
          <h1 style="color:#fff; margin:0 0 10px;">Sign In</h1>
          <p style="color:#777; margin:0 0 22px;">Account system is being integrated.</p>
        </div>
      </main>`;
  }

  function renderOpenStoreModule() {
    return `
      <main style="padding:60px 20px; max-width:1000px; margin:0 auto;">
        <div style="background:#0a0a0a; border:1px solid #222; padding:28px; border-radius:18px;">
          <h1 style="color:#fff; margin:0 0 10px;">Open a Store</h1>
          <p style="color:#777; margin:0;">Apply to launch your store on RGZTEC Marketplace.</p>
        </div>
      </main>`;
  }

  async function renderAdminDashboard(target) {
    target.innerHTML = renderHeader() + `<div style="padding:40px; color:#fff; text-align:center;">Loading System Data...</div>`;
    try {
      const data = await fetchJSON(DATA_URL);
      const stores = Object.keys(data || {});
      target.innerHTML = renderHeader() + `
        <main style="padding:40px 20px; max-width:1200px; margin:0 auto; color:#fff;">
          <h1 style="margin:0 0 10px;">Command Center</h1>
          <p style="color:#888;margin:0 0 18px;">Stores: <b>${stores.length}</b></p>
        </main>`;
      wireInteractions(target);
    } catch (e) {
      renderError(target, "Admin Data Load Failed: " + (e && e.message ? e.message : String(e)));
    }
  }

  function renderSearchModule(target) {
    target.innerHTML = renderHeader() + `
      <main style="padding:40px 20px; max-width:1200px; margin:0 auto; color:#fff;">
        <h1 style="margin:0 0 10px;">Global Search</h1>
        <p style="color:#888;margin:0;">Search module is active.</p>
      </main>`;
    wireInteractions(target);
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
    s = s.replace(/[?#].*$/, "").trim();
    s = s.replace(/^\/+/, "").replace(/\/+$/, "");
    return s;
  }

  // ============================================================
  // 5) RENDER
  // ============================================================
  function renderHeader() {
    return `
      <header class="store-header">
        <div class="store-header-inner">
          <div class="store-header-left">
            <a href="${withBase("/")}" class="store-header-logo">RGZTEC</a>
          </div>
          <div class="store-header-center">
            <form class="store-header-search" role="search">
              <input type="search" name="q" placeholder="Search across stores..." aria-label="Search" />
              <button type="submit" aria-label="Search">Search</button>
            </form>
          </div>
          <div class="store-header-right">
            <a href="${withBase("/apps/admin")}" class="store-header-secondary-link">Dashboard</a>
            <a href="${withBase("/apps/signin")}" class="store-header-secondary-link">Sign In</a>
            <a href="${withBase("/apps/open-store")}" class="store-header-cta"><span>Open Store</span></a>
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

    return `<nav class="store-main-nav" aria-label="RGZTEC stores"><ul class="store-main-nav__list">${storeLinks}</ul></nav>`;
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
        return `<li class="store-section-nav__item"><a href="${href}" class="store-section-nav__link ${isActive ? "active" : ""}">${name}</a></li>`;
      })
      .join("");

    return `<nav id="store-section-nav" class="store-section-nav" aria-label="Store sections"><ul class="store-section-nav__list">${navItems}</ul></nav>`;
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
              ${imageUrl ? `<img src="${escAttr(imageUrl)}" alt="${escAttr(s.name || s.title || "")}" loading="lazy">` : `<div class="product-media-placeholder"></div>`}
            </div>
            <div class="shop-card-body">
              <h3 class="shop-card-title">${esc(s.name || s.title || "Untitled Shop")}</h3>
              <p class="shop-card-tagline">${esc(s.tagline || "")}</p>
            </div>
          </a>`;
      })
      .join("");

    return `<main class="store-shops"><div class="store-shops-header"><h2>Explore Shops</h2></div><div class="shop-grid">${cards}</div></main>`;
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

    return `<main class="store-products"><div class="store-products-header"><h2>Explore Products</h2></div><div class="shop-grid">${cards}</div></main>`;
  }

  function renderEmptyShop() {
    return `<main class="store-products"><div class="products-grid-empty"><h3>Coming Soon</h3><p>New sections and products are being added to this shop.</p></div></main>`;
  }

  function resolveImage(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("/")) return withBase(s);
    return IMAGE_BASE_PATH + s.replace(/^\/+/, "");
  }

  // ============================================================
  // 6) INTERACTIONS
  // ============================================================
  function wireInteractions(root) {
    const form = root.querySelector(".store-header-search");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const inp = form.querySelector('input[name="q"]') || form.querySelector("input");
        const q = inp ? String(inp.value || "").trim() : "";
        if (q) window.location.href = withBase(`/apps/search?q=${enc(q)}`);
      });
    }
  }

  // ============================================================
  // 7) UTILS
  // ============================================================
  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText} (${url})`);
    return await res.json();
  }

  function renderError(target, msg) {
    if (!target) return;
    target.innerHTML = `
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
})();

