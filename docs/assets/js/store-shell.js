// =========================================
// RGZTEC STORE SHELL (TEK JS, FINAL)
// Header + Hero + Nav + Grid
// =========================================

(async function () {
  const root = document.getElementById("store-root");
  const headerMount = document.getElementById("store-header");
  const storeSlug = document.body.dataset.store;

  if (!root || !storeSlug) {
    console.error("Store root or storeSlug missing.");
    return;
  }

  // -------------------------------
  // 1) DATA LOAD
  // -------------------------------
  async function fetchData() {
    const res = await fetch("/rgztec/assets/data/store.data.json?v=" + Date.now());
    if (!res.ok) throw new Error("DATA FAILED");
    return await res.json();
  }

  let data;
  try {
    data = await fetchData();
  } catch (err) {
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

  // Aktif section'ı URL'e göre belirleme
  const pathParts = window.location.pathname
    .replace(/\/+$/, "")
    .split("/");

  let activeSection = "overview"; 
  const lastPart = pathParts[pathParts.length - 1];

  if (lastPart && lastPart !== storeSlug) {
    // substore folder is active
    activeSection = lastPart;
  }

  // Body class → tema tanımları için
  document.body.classList.add("store-" + storeSlug);

  // -------------------------------
  // 2) HEADER (ETSY TARZI)
  // -------------------------------
  function buildHeader(storeConfig, activeSection) {
    const header = document.createElement("header");
    header.className = "store-header";

    const inner = document.createElement("div");
    inner.className = "store-header-inner";

    // ---- Brand ----
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

    // ---- Search ----
    const search = document.createElement("div");
    search.className = "store-search";

    const input = document.createElement("input");
    input.className = "store-search-input";
    input.type = "text";
    input.placeholder = "Search products…";

    search.appendChild(input);

    // ---- Nav (dükkanlar) ----
    const nav = document.createElement("nav");
    nav.className = "store-nav";

    // Overview link
    const overviewLink = document.createElement("a");
    overviewLink.className =
      "store-nav-link" + (activeSection === "overview" ? " store-nav-link-active" : "");
    overviewLink.href = `/rgztec/store/${storeSlug}/`;
    overviewLink.textContent = "Overview";
    nav.appendChild(overviewLink);

    // Subsections from data
    if (Array.isArray(storeConfig.sections)) {
      storeConfig.sections.forEach((s) => {
        const a = document.createElement("a");
        a.className =
          "store-nav-link" + (activeSection === s.slug ? " store-nav-link-active" : "");
        a.href = `/rgztec/store/${storeSlug}/${s.slug}/`;
        a.textContent = s.name;
        nav.appendChild(a);
      });
    }

    // Append header items
    inner.appendChild(brand);
    inner.appendChild(search);
    inner.appendChild(nav);
    header.appendChild(inner);

    return header;
  }

  // -------------------------------
  // 3) HERO (ANA SAYFA TARZI BANNER)
  // -------------------------------
  function buildHero(storeConfig, activeSection) {
    const hero = document.createElement("section");
    hero.className = "store-hero";

    // ---- Left text ----
    const left = document.createElement("div");
    left.className = "store-hero-text";

    const eyebrow = document.createElement("div");
    eyebrow.className = "store-hero-eyebrow";
    eyebrow.textContent = "Store • " + storeConfig.title;

    const h1 = document.createElement("h1");
    h1.className = "store-hero-title";
    h1.textContent =
      activeSection === "overview"
        ? storeConfig.title + " templates & UI kits."
        : (storeConfig.sections.find((s) => s.slug === activeSection)?.name ||
           storeConfig.title);

    const p = document.createElement("p");
    p.className = "store-hero-sub";
    p.textContent = storeConfig.tagline;

    left.appendChild(eyebrow);
    left.appendChild(h1);
    left.appendChild(p);

    // ---- Right banner ----
    const right = document.createElement("div");
    right.className = "store-hero-banner";

    const art = document.createElement("div");
    art.className = "store-hero-banner-art";

    const img = document.createElement("img");
    img.src = "/rgztec/assets/img/" + storeConfig.banner; 
    img.alt = storeConfig.title + " banner";

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
  // 4) PRODUCTS GRID (Şimdilik placeholder)
  // -------------------------------
  function buildProducts(storeConfig, activeSection) {
    const wrap = document.createElement("section");
    wrap.className = "store-products";

    const header = document.createElement("div");
    header.className = "store-products-header";

    const h2 = document.createElement("h2");
    h2.textContent =
      activeSection === "overview"
        ? "Featured Products"
        : (storeConfig.sections.find((s) => s.slug === activeSection)?.name ||
           "Products");

    const sub = document.createElement("p");
    sub.textContent = "Product grid will be connected soon.";

    header.appendChild(h2);
    header.appendChild(sub);

    const grid = document.createElement("div");
    grid.className = "products-grid";

    // Placeholder 8 ürün kartı
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
  // 5) DOM’A BAS
  // -------------------------------
  headerMount.appendChild(buildHeader(storeConfig, activeSection));
  root.appendChild(buildHero(storeConfig, activeSection));
  root.appendChild(buildProducts(storeConfig, activeSection));

})();





