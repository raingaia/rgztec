/*!
 * RGZTEC Marketplace - Store Shell Engine (FINAL)
 * - Works on root "/" and subpath "/rgztec"
 * - No "core" folder required
 * - Uses window.RGZ_WITH_BASE if provided (from index.html), otherwise auto-detects
 */
(function () {
  "use strict";

  // -----------------------------
  // BASE / PATH RESOLVER
  // -----------------------------
  function resolveBase() {
    // Prefer index.html injected base helpers
    if (typeof window.RGZ_BASE === "string") return String(window.RGZ_BASE || "").replace(/\/+$/g, "");
    const meta = document.querySelector('meta[name="rgz-base"]');
    if (meta && meta.content != null) return String(meta.content).trim().replace(/\/+$/g, "");
    const p = location.pathname || "/";
    return p.includes("/rgztec/") ? "/rgztec" : "";
  }

  const BASE = resolveBase();
  const withBase =
    typeof window.RGZ_WITH_BASE === "function"
      ? window.RGZ_WITH_BASE
      : (p) => (BASE ? `${BASE}${p}` : p);

  // Assets & Data
  const DATA_URL = withBase("/data/store.data.json?v=final1");
  const IMAGE_BASE = withBase("/assets/images/store/");

  // -----------------------------
  // BOOT
  // -----------------------------
  function boot() {
    const storeRoot = document.getElementById("store-root");
    const storeBody = document.querySelector("body.store-body");

    if (!storeRoot || !storeBody) return;

    const rawPath = (storeBody.dataset.path || "").trim();
    const path = normalizePath(rawPath);

    if (!path) {
      renderError(storeRoot, "Missing data-path on body. Example: data-path=\"ai-tools-hub\"");
      return;
    }

    initStore(path, storeRoot).catch((err) => {
      console.error("[RGZTEC] Store Shell init error:", err);
      renderError(storeRoot, err && err.message ? err.message : "Unknown error");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // -----------------------------
  // INIT
  // -----------------------------
  async function initStore(path, target) {
    const allData = await fetchJSON(DATA_URL);

    const found = findDataByPath(allData, path);
    if (!found || !found.currentData || !found.rootSlug) {
      throw new Error(`Path not found in store.data.json: "${path}"`);
    }

    const { currentData, rootSlug, currentSlug, depth } = found;

    // Root store sections for section nav
    const rootStore = allData[rootSlug] || {};
    const rootSections = Array.isArray(rootStore.sections) ? rootStore.sections : [];

    // Active highlight only when inside section (depth >= 2)
    const activeSectionSlug = depth >= 2 ? currentSlug : null;

    // Render
    let html = "";
    html += renderHeader();
    html += renderStoreNav(allData, rootSlug);
    html += renderSectionNav(rootSections, activeSectionSlug, rootSlug);
    html += renderHero(currentData);

    if (Array.isArray(currentData.sections) && currentData.sections.length) {
      html += renderShopSection(currentData.sections, rootSlug);
    } else if (Array.isArray(currentData.products) && currentData.products.length) {
      html += renderProductSection(currentData.products);
    } else {
      html += renderEmpty();
    }

    target.innerHTML = html;
    wireInteractions(target);
  }

  // -----------------------------
  // HELPERS
  // -----------------------------
  function normalizePath(p) {
    let s = String(p || "");
    s = s.replace(/#.*$/, "").trim();
    s = s.replace(/^\/+/, "").replace(/\/+$/, "");
    return s;
  }

  function findDataByPath(all, path) {
    const seg = normalizePath(path).split("/").filter(Boolean);
    const rootSlug = seg[0] || null;
    const currentSlug = seg[seg.length - 1] || null;
    const depth = seg.length;

    if (!rootSlug || !all || !all[rootSlug]) return null;

    let currentData = all[rootSlug];

    for (let i = 1; i < seg.length; i++) {
      const slug = seg[i];
      const sections = Array.isArray(currentData.sections) ? currentData.sections : [];
      const next = sections.find((x) => x && x.slug === slug);
      if (!next) return null;
      currentData = next;
    }

    return { currentData, rootSlug, currentSlug, depth };
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to fetch JSON (${res.status}): ${url}`);
    }
    return await res.json();
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m]));
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  function renderHeader() {
    // IMPORTANT: logo uses base-aware root link
    const homeHref = withBase("/");

    return `
      <header class="store-header">
        <div class="store-header-inner">
          <div class="store-header-left">
            <a href="${homeHref}" class="store-header-logo">RGZTEC</a>

            <button class="store-header-categories-btn" id="btn-categories" type="button"
              aria-expanded="true" aria-controls="store-section-nav">
              <span>☰</span> <span>Categories</span>
            </button>
          </div>

          <div class="store-header-center">
            <form class="store-header-search" role="search">
              <input type="search" placeholder="Search for anything" aria-label="Search" />
              <button type="submit" aria-label="Search">⌕</button>
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

  function renderStoreNav(allStores, currentRootSlug) {
    const items = Object.keys(allStores || {}).map((slug) => {
      const s = allStores[slug];
      if (!s || !s.title) return "";
      const active = slug === currentRootSlug ? "active" : "";
      const href = withBase(`/store/${esc(slug)}/`);
      return `
        <li class="store-main-nav__item">
          <a class="store-main-nav__link ${active}" href="${href}">
            ${esc(s.title)}
          </a>
        </li>
      `;
    }).join("");

    return `
      <nav class="store-main-nav" aria-label="RGZTEC stores">
        <ul class="store-main-nav__list">${items}</ul>
      </nav>
    `;
  }

  function renderSectionNav(sections, activeSlug, rootSlug) {
    if (!Array.isArray(sections) || !sections.length) return "";

    const items = sections.map((sec) => {
      if (!sec) return "";
      const slug = esc(sec.slug || "");
      const name = esc(sec.name || "Unnamed Section");
      const isActive = !!activeSlug && slug === activeSlug;
      const href = isActive ? "#" : withBase(`/store/${esc(rootSlug)}/${slug}/`);
      return `
        <li class="store-section-nav__item">
          <a class="store-section-nav__link ${isActive ? "active" : ""}" href="${href}">
            ${name}
          </a>
        </li>
      `;
    }).join("");

    return `
      <nav id="store-section-nav" class="store-section-nav" aria-label="Store sections">
        <ul class="store-section-nav__list">${items}</ul>
      </nav>
    `;
  }

  function renderHero(data) {
    const title = esc(data.title || data.name || "Welcome");
    const tagline = esc(data.tagline || "");
    const badge = esc(data.badge || "Official");
    const bannerUrl = data.banner ? `${IMAGE_BASE}${esc(data.banner)}` : "";

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
      </section>
    `;
  }

  function renderShopSection(sections, rootSlug) {
    const cards = sections.map((s) => {
      if (!s) return "";
      const slug = esc(s.slug || "");
      const href = withBase(`/store/${esc(rootSlug)}/${slug}/`);
      const img = s.image ? `${IMAGE_BASE}${esc(s.image)}` : "";
      return `
        <a href="${href}" class="shop-card">
          <div class="shop-card-media">
            ${img ? `<img src="${img}" alt="${esc(s.name || "")}" loading="lazy">` : `<div class="product-media-placeholder"></div>`}
          </div>
          <div class="shop-card-body">
            <h3 class="shop-card-title">${esc(s.name || "Untitled Shop")}</h3>
            <p class="shop-card-tagline">${esc(s.tagline || "")}</p>
          </div>
        </a>
      `;
    }).join("");

    return `
      <main class="store-shops">
        <div class="store-shops-header"><h2>Explore Shops</h2></div>
        <div class="shop-grid">${cards}</div>
      </main>
    `;
  }

  function renderProductSection(products) {
    const cards = products.map((p) => {
      if (!p) return "";
      const url = p.url ? esc(p.url) : "#";
      const title = esc(p.title || "Untitled Product");
      const tagline = esc(p.tagline || "");
      const img = p.image ? `${IMAGE_BASE}${esc(p.image)}` : "";
      return `
        <a href="${url}" class="shop-card" target="_blank" rel="noopener noreferrer">
          <div class="shop-card-media">
            ${img ? `<img src="${img}" alt="${title}" loading="lazy">` : `<div class="product-media-placeholder"></div>`}
          </div>
          <div class="shop-card-body">
            <h3 class="shop-card-title">${title}</h3>
            <p class="shop-card-tagline">${tagline}</p>
          </div>
        </a>
      `;
    }).join("");

    return `
      <main class="store-products">
        <div class="store-products-header"><h2>Explore Products</h2></div>
        <div class="shop-grid">${cards}</div>
      </main>
    `;
  }

  function renderEmpty() {
    return `
      <main class="store-products">
        <div class="products-grid-empty">
          <h3>Coming Soon</h3>
          <p>New sections and products are being added to this shop.</p>
        </div>
      </main>
    `;
  }

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
      </div>
    `;
  }

  function wireInteractions(root) {
    // Search
    const form = root.querySelector(".store-header-search");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector("input[type='search']");
        const q = input ? input.value.trim() : "";
        if (!q) return;
        console.log("[RGZTEC] Search:", q);
      });
    }

    // Categories toggle
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
})();



