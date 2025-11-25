// apps/web/public/store/core/assets/js/store-shell.js
// RGZTEC STORE • core shell – all stores & substores use this file

(async function () {
  const body = document.body;
  const root = document.getElementById("store-root");

  const storeSlug = body.dataset.store;        // e.g. "hardware"
  const subSlug = body.dataset.substore || ""; // e.g. "ai-accelerators" or ""

  if (!root) {
    console.error("#store-root element not found.");
    return;
  }

  if (!storeSlug) {
    root.innerHTML = `<p class="store-error">Store is not configured.</p>`;
    return;
  }

  // ---- helpers ----

  async function fetchJSON(path, { optional = false } = {}) {
    try {
      const res = await fetch(path + "?v=" + Date.now());
      if (!res.ok) {
        if (optional) return null;
        throw new Error("Fetch failed: " + path);
      }
      return await res.json();
    } catch (err) {
      if (optional) return null;
      throw err;
    }
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(str) {
    return String(str)
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  // ---- main flow ----

  try {
    // 1) main store meta
    const stores = await fetchJSON("core/data/stores.json");
    const storeMeta = Array.isArray(stores)
      ? stores.find((s) => s.slug === storeSlug)
      : null;

    if (!storeMeta) {
      throw new Error("Store not found: " + storeSlug);
    }

    // 2) all substores, filtered by parent
    const allSubstores = await fetchJSON("core/data/substores.json", {
      optional: true
    });

    const substores = Array.isArray(allSubstores)
      ? allSubstores.filter((s) => s.parent === storeSlug)
      : [];

    // 3) active substore (if any)
    let subMeta = null;
    if (subSlug) {
      subMeta = substores.find((s) => s.slug === subSlug) || null;
      if (!subMeta) {
        console.warn("Substore not found:", storeSlug, subSlug);
      }
    }

    // 4) products
    let products = [];
    if (subSlug) {
      // e.g. core/data/products-hardware-ai-accelerators.json
      const subProducts = await fetchJSON(
        `core/data/products-${storeSlug}-${subSlug}.json`,
        { optional: true }
      );
      products = Array.isArray(subProducts) ? subProducts : [];
    } else {
      // e.g. core/data/products-hardware.json
      const storeProducts = await fetchJSON(
        `core/data/products-${storeSlug}.json`,
        { optional: true }
      );
      products = Array.isArray(storeProducts) ? storeProducts : [];
    }

    // 5) render full layout
    renderLayout({ storeMeta, substores, subMeta, products });

    // 6) extension hook – mağaza bazlı ekstra JS için açık kapı
    if (
      window.RGZTEC_STORE_EXT &&
      typeof window.RGZTEC_STORE_EXT.init === "function"
    ) {
      window.RGZTEC_STORE_EXT.init({
        store: storeMeta,
        substore: subMeta,
        substores,
        products,
        root
      });
    }
  } catch (err) {
    console.error(err);
    root.innerHTML =
      `<p class="store-error">Store could not be loaded. Please try again later.</p>`;
  }

  // ---- render functions ----

  function renderLayout({ storeMeta, substores, subMeta, products }) {
    const title = subMeta ? subMeta.title : storeMeta.title;
    const description = subMeta
      ? subMeta.description
      : storeMeta.description;
    const banner = subMeta ? subMeta.banner : storeMeta.banner;

    document.title = `RGZTEC • ${title}`;

    // HERO
    let html = `
      <section class="store-hero">
        <div class="hero-inner">
          <div class="hero-text">
            <span class="badge">${storeSlug.toUpperCase()}</span>
            <h1>${escapeHTML(title)}</h1>
            <p>${description ? escapeHTML(description) : ""}</p>
          </div>
          <div class="hero-banner">
            <img src="${encodeURI(banner)}" alt="${escapeAttr(title + " banner")}">
          </div>
        </div>
      </section>
    `;

    // SUBSTORE GRID – only on main store (no active substore)
    if (!subMeta && substores && substores.length) {
      html += `
        <section class="store-substores">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem;">
            <h2 style="font-size:0.95rem;margin:0;letter-spacing:-.02em;">Shop categories</h2>
            <span style="font-size:.75rem;color:#9ca3af;">${substores.length} categories</span>
          </div>
          <div class="substores-grid">
            ${substores
              .map((ss) => renderSubstoreCard(storeMeta, ss))
              .join("")}
          </div>
        </section>
      `;
    }

    // PRODUCTS
    html += `
      <section class="store-products">
        ${
          products && products.length
            ? `
          <div class="products-grid">
            ${products.map((p) => renderProductCard(p)).join("")}
          </div>
        `
            : `<p class="store-empty">No products found in this view yet.</p>`
        }
      </section>
    `;

    root.innerHTML = html;
  }

  function renderSubstoreCard(storeMeta, ss) {
    const href = `${storeMeta.slug}/${ss.slug}/`;
    return `
      <a class="substore-card" href="${href}">
        <div class="substore-banner">
          <img src="${encodeURI(ss.banner)}" alt="${escapeAttr(ss.title)}">
        </div>
        <div class="substore-body">
          <h3>${escapeHTML(ss.title)}</h3>
          <p>${ss.description ? escapeHTML(ss.description) : ""}</p>
        </div>
      </a>
    `;
  }

  function renderProductCard(p) {
    const title = p.title || "";
    const subtitle = p.subtitle || "";
    const price = p.price || "";
    const tag = p.tag || "";
    const image = p.image || "";

    return `
      <article class="product-card">
        <div class="product-media">
          <img src="${encodeURI(image)}" alt="${escapeAttr(title)}">
        </div>
        <div class="product-body">
          <h2>${escapeHTML(title)}</h2>
          <p>${escapeHTML(subtitle)}</p>
          <div class="product-meta">
            <span class="price">${escapeHTML(price)}</span>
            ${
              tag
                ? `<span class="tag">${escapeHTML(tag)}</span>`
                : ""
            }
          </div>
        </div>
      </article>
    `;
  }
})();

