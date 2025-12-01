// =========================================
// RGZTEC STORE • store-shell.js (AUTO PATH)
// =========================================

// Mevcut URL'den base path'i çıkar (örn: "/rgztec")
const fullPath = window.location.pathname;
const storeIndex = fullPath.indexOf("/store/");
const BASE_PATH = storeIndex !== -1 ? fullPath.slice(0, storeIndex) : "";

// Örn: "/rgztec/data/store.data.json"
const STORE_DATA_URL = BASE_PATH + "/data/store.data.json";
// Örn: "/rgztec/asset/images/store/"
const STORE_BANNER_BASE = BASE_PATH + "/asset/images/store/";
// =========================================
// RGZTEC STORE • store-shell.js (FINAL)
// Tek JS: Data → Header → Hero → Grid
// =========================================

const STORE_DATA_URL = "/rgztec/data/store.data.json";
const STORE_BANNER_BASE = "/rgztec/asset/images/store/";

// IIFE
(async function () {
  const root = document.getElementById("store-root");
  const headerMount = document.getElementById("store-header");
  const storeSlug = document.body.dataset.store;

  if (!root || !headerMount || !storeSlug) {
    console.error("Store shell: root/header/storeSlug eksik.");
    return;
  }

  // -------------------------------
  // 1) DATA LOAD
  // -------------------------------
  async function fetchStoreData() {
    const res = await fetch(STORE_DATA_URL + "?v=" + Date.now());
    if (!res.ok) {
      throw new Error("Store data fetch failed: " + res.status);
    }
    return await res.json();
  }

  let data;
  try {
    data = await fetchStoreData();
  } catch (err) {
    console.error(err);
    root.innerHTML = `
      <div class="store-error">
        <h2>Data Error</h2>
        <p>Store configuration could not be loaded.</p>
      </div>
    `;
    return;
  }

  const storeConfig = data[storeSlug];
  if (!storeConfig) {
    root.innerHTML = `
      <div class="store-error">
        <h2>Store Not Found</h2>
        <p>No configuration found for store slug: <b>${storeSlug}</b></p>
      </div>
    `;
    return;
  }

  // -------------------------------
  // 2) ACTIVE SECTION (overview / substore)
  // -------------------------------
  const pathParts = window.location.pathname.replace(/\/+$/, "").split("/");
  const last = pathParts[pathParts.length - 1];
  let activeSection = "overview";

  if (last && last !== storeSlug) {
    activeSection = last; // örn: unity-3d
  }

  // Tema class'ı
  document.body.classList.add("store-" + storeSlug);

  // -------------------------------
  // 3) HEADER (ETSY TARZI)
  // -------------------------------
  function buildHeader() {
    const header = document.createElement("header");
    header.className = "store-header";

    const inner = document.createElement("div");
    inner.className = "store-header-inner";

    // Brand
    const brand = document.createElement("a");
    brand.className = "store-brand";
    brand.href = "/rgztec/";

    const dot = document.createElement("div");
    dot.className = "store-brand-dot";

    const textBlock = document.createElement("div");
    textBlock.className = "store-brand-text-block";

    const title = document.createElement("div");
    title.className = "store-brand-title";
    title.textContent = "RGZTEC";

    const sub = document.createElement("div");
    sub.className = "store-brand-sub";
    sub.textContent = storeConfig.title;

    textBlock.appendChild(title);
    textBlock.appendChild(sub);
    brand.appendChild(dot);
    brand.appendChild(textBlock);

    // Search
    const searchWrap = document.createElement("div");
    searchWrap.className = "store-search";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.className = "store-search-input";
    searchInput.placeholder = "Search products…";

    searchWrap.appendChild(searchInput);

    // Nav
    const nav = document.createElement("nav");
    nav.className = "store-nav";

    // Overview link
    const overviewLink = document.createElement("a");
    overviewLink.href = `/rgztec/store/${storeSlug}/`;
    overviewLink.className =
      "store-nav-link" + (activeSection === "overview" ? " store-nav-link-active" : "");
    overviewLink.textContent = "Overview";
    nav.appendChild(overviewLink);

    // Sections
    if (Array.isArray(storeConfig.sections)) {
      storeConfig.sections.forEach((s) => {
        const a = document.createElement("a");
        a.href = `/rgztec/store/${storeSlug}/${s.slug}/`;
        a.className =
          "store-nav-link" + (activeSection === s.slug ? " store-nav-link-active" : "");
        a.textContent = s.name;
        nav.appendChild(a);
      });
    }

    inner.appendChild(brand);
    inner.appendChild(searchWrap);
    inner.appendChild(nav);
    header.appendChild(inner);

    return header;
  }

  // -------------------------------
  // 4) HERO + BANNER
  // -------------------------------
  function buildHero() {
    const hero = document.createElement("section");
    hero.className = "store-hero";

    // Left / text
    const left = document.createElement("div");
    left.className = "store-hero-text";

    const eyebrow = document.createElement("div");
    eyebrow.className = "store-hero-eyebrow";
    eyebrow.textContent = "Store • " + storeConfig.title;

    const h1 = document.createElement("h1");
    h1.className = "store-hero-title";

    if (activeSection === "overview") {
      h1.textContent = storeConfig.title + " templates & UI kits.";
    } else {
      const sec = (storeConfig.sections || []).find((s) => s.slug === activeSection);
      h1.textContent = sec ? sec.name : storeConfig.title;
    }

    const p = document.createElement("p");
    p.className = "store-hero-sub";
    p.textContent = storeConfig.tagline;

    left.appendChild(eyebrow);
    left.appendChild(h1);
    left.appendChild(p);

    // Right / banner
    const right = document.createElement("div");
    right.className = "store-hero-banner";

    const art = document.createElement("div");
    art.className = "store-hero-banner-art";

    const img = document.createElement("img");
    img.alt = storeConfig.title + " banner";
    // Banner dosyası: /rgztec/asset/images/store/{banner}
    img.src = STORE_BANNER_BASE + storeConfig.banner;

    const glass = document.createElement("div");
    glass.className = "store-hero-banner-glass";

    art.appendChild(img);
    art.appendChild(glass);
    right.appendChild(art);

    hero.appendChild(left);
    hero.appendChild(right);

    return hero;
  }

  // -------------------------------
  // 5) PRODUCTS GRID (şimdilik placeholder)
  // -------------------------------
  function buildProducts() {
    const wrap = document.createElement("section");
    wrap.className = "store-products";

    const header = document.createElement("div");
    header.className = "store-products-header";

    const h2 = document.createElement("h2");
    if (activeSection === "overview") {
      h2.textContent = "Featured Products";
    } else {
      const sec = (storeConfig.sections || []).find((s) => s.slug === activeSection);
      h2.textContent = sec ? sec.name : "Products";
    }

    const sub = document.createElement("p");
    sub.textContent = "Product grid will be connected soon.";

    header.appendChild(h2);
    header.appendChild(sub);

    const grid = document.createElement("div");
    grid.className = "products-grid";

    // 8 tane placeholder kart (sonra gerçek data'ya bağlanacak)
    for (let i = 0; i < 8; i++) {
      const card = document.createElement("div");
      card.className = "product-card";
      card.textContent = "Product card placeholder";
      grid.appendChild(card);
    }

    wrap.appendChild(header);
    wrap.appendChild(grid);

    return wrap;
  }

  // -------------------------------
  // 6) RENDER
  // -------------------------------
  headerMount.appendChild(buildHeader());
  root.appendChild(buildHero());
  root.appendChild(buildProducts());

})();





