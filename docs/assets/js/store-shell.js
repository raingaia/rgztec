/**
 * RGZTEC Marketplace - Store Shell Engine
 *
 * FINAL v19.2.0 (BASE-AWARE + DOCS/ROOT SAFE + NO /rgztec HARDCODE)
 * - Works on root "/" OR subpath "/rgztec" (auto-base)
 * - All internal links generated with withBase()
 * - Data-path MUST match store.data.json root key (rootSlug)
 * - Section paths: {rootSlug}/{sectionSlug}... recursive
 * - No white screen: renders a visible error box on failure
 */

(() => {
  // ---------------------------
  // 0) Base Resolver
  // ---------------------------
  function resolveBase() {
    // 1) If html exposes base (recommended)
    if (typeof window !== "undefined" && typeof window.RGZ_BASE === "string") {
      return String(window.RGZ_BASE).trim().replace(/\/+$/, "");
    }

    // 2) meta override
    const meta = document.querySelector('meta[name="rgz-base"]');
    if (meta && meta.content != null) return String(meta.content).trim().replace(/\/+$/, "");

    // 3) auto detect from url
    const p = location.pathname || "/";
    return p.includes("/rgztec/") ? "/rgztec" : "";
  }

  const BASE = resolveBase(); // "" or "/rgztec"
  const withBase = (p) => {
    // p must start with "/"
    if (!p) return BASE || "";
    const path = p.startsWith("/") ? p : `/${p}`;
    return BASE ? `${BASE}${path}` : path;
  };

  // expose for other scripts if needed
  window.RGZ_BASE = BASE;
  window.RGZ_WITH_BASE = withBase;

  // ---------------------------
  // 1) Config
  // ---------------------------
  // You can change version query anytime to bust cache
  const DATA_URL = withBase("/data/store.data.json?v=1920");
  const IMAGE_BASE_PATH = withBase("/assets/images/store/");

  const DEBUG = false;
  const log = (...a) => DEBUG && console.log("[RGZTEC]", ...a);

  // ---------------------------
  // 2) Boot
  // ---------------------------
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

  // ---------------------------
  // 3) Main
  // ---------------------------
  async function initStore(path, targetElement) {
    try {
      const allStoresData = await fetchJSON(DATA_URL);
      if (!allStoresData || typeof allStoresData !== "object") {
        throw new Error("store.data.json boş/eksik veya format hatalı.");
      }

      const found = findDataByPath(allStoresData, path);
      const { currentData, rootSlug, currentSlug, depth } = found;

      // Helpful debug line
      log("PATH:", path, "rootSlug:", rootSlug, "exists:", !!(rootSlug && allStoresData[rootSlug]));

      if (!currentData || !rootSlug) {
        throw new Error(`Path not found in store.data.json: "${path}" (rootSlug="${rootSlug || "?"}")`);
      }

      // ✅ NAV ALWAYS FROM ROOT STORE
      const rootStoreData = allStoresData[rootSlug] || {};
      const rootSections = Array.isArray(rootStoreData.sections) ? rootStoreData.sections : [];

      // ✅ Active highlight only when depth >= 2
      const activeSectionSlug = depth >= 2 ? currentSlug : null;

      // Build HTML
      let html = "";
      html += renderHeader();
      html += renderStoreNav(allStoresData, rootSlug);
      html += renderSectionNav(rootSections, activeSectionSlug, rootSlug); // base-aware
      html += renderHero(currentData);

      if (currentData.sections && currentData.sections.length > 0) {
        html += renderShopSection(currentData.sections, rootSlug, path);
      }
      if (currentData.products && currentData.products.length > 0) {
        html += renderProductSection(currentData.products);
      }

      if (
        (!currentData.sections || currentData.sections.length === 0) &&
        (!currentData.products || currentData.products.length === 0)
      ) {
        html += renderEmptyShop();
      }

      // Inject + interactions
      targetElement.innerHTML = html;
      wireInteractions(targetElement);

    } catch (err) {
      console.error("Store Shell Engine error:", err);
      renderError(err, targetElement);
    }
  }

  // ---------------------------
  // 4) Path + Finder (YOUR JSON MODEL)
  // ---------------------------
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
      const sections = Array.isArray(currentData.sections) ? currentData.sections : [];
      const next = sections.find((s) => s && s.slug === seg);
      if (next) currentData = next;
      else return { currentData: null };
    }

    return { currentData, rootSlug, currentSlug, depth };
  }

  // ---------------------------
  // 5) Render
  // ---------------------------
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
            <!-- ✅ BASE-AWARE HOME -->
            <a href="${withBase("/")}" class="store-header-logo">RGZTEC</a>

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
            <!-- ✅ BASE-AWARE STORE LINK -->
            <a href="${withBase(`/store/${escapeHtml(slug)}/`)}"
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

  // ✅ Always base-aware
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
          : withBase(`/store/${escapeHtml(rootSlug)}/${slug}/`);

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

  // Shows child sections as cards (base-aware)
  function renderShopSection(sections, rootSlug, fullPath) {
    // fullPath could be: "root" or "root/child"
    // for child cards we want: /store/{rootSlug}/{childSlug}/ (only direct child of currentData)
    const shopCards = sections
      .map((s) => {
        if (!s) return "";
        const slug = escapeHtml(s.slug || "");
        const href = withBase(`/store/${escapeHtml(rootSlug)}/${slug}/`);
        const imageUrl = s.image ? `${IMAGE_BASE_PATH}${escapeHtml(s.image)}` : "";

        return `
          <a href="${href}" class="shop-card">
            <div class="shop-card-media">
              ${imageUrl
                ? `<img src="${imageUrl}" alt="${escapeHtml(s.name || "")}" loading="lazy">`
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
              ${imageUrl
                ? `<img src="${imageUrl}" alt="${title}" loading="lazy">`
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

  // ---------------------------
  // 6) Interactions
  // ---------------------------
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

    // Categories toggle (responsive)
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

  // ---------------------------
  // 7) Errors + Fetch
  // ---------------------------
  function renderError(error, targetElement) {
    const msg = escapeHtml(error?.message || String(error));
    targetElement.innerHTML = `
      <div style="max-width:920px;margin:28px auto;padding:18px;border:1px solid rgba(0,0,0,0.08);border-radius:14px;background:#fff;">
        <div style="font-weight:900;font-size:18px;margin-bottom:6px;">RGZTEC</div>
        <div style="font-weight:900;font-size:22px;margin-bottom:10px;">Store Load Error</div>
        <div style="color:#444;line-height:1.6;margin-bottom:14px;">
          Something prevented this store from loading.
        </div>
        <div style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
                    font-size:12px;background:#fafafa;border:1px solid rgba(0,0,0,0.08);padding:12px;border-radius:12px;overflow:auto;">
          ${msg}
        </div>
        <div style="margin-top:12px;color:#666;font-size:12px;">
          BASE: <b>${escapeHtml(BASE || "(root)")}</b> • DATA: <b>${escapeHtml(DATA_URL)}</b>
        </div>
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



