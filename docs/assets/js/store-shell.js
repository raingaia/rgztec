// docs/assets/js/store-shell.js
// RGZTEC STORE • tüm mağazalar & alt mağazalar için ortak shell
// core klasörü yok; tüm JSON'lar "data/" altından okunur,
// görseller JSON içinde gelen path'leri (assets/images/...) olduğu gibi kullanır.

(async function () {
  const body = document.body;
  const root = document.getElementById("store-root");

  if (!root) {
    console.error("#store-root element not found.");
    return;
  }

  // JSON'lar için temel yol (ör: "data/")
  // İstersen <body data-data-path="data/"> ile override edebilirsin.
  const DATA_BASE =
    (body.dataset.dataPath || "data")
      .replace(/\/+$/, "") + "/";

  const storeSlug = body.dataset.store || "";    // örn: "hardware"
  const subSlug   = body.dataset.substore || ""; // örn: "ai-tools-hub"

  // ---- helpers ----

  async function fetchJSON(path, { optional = false } = {}) {
    const url = DATA_BASE + path.replace(/^\/+/, "");
    try {
      const res = await fetch(url + "?v=" + Date.now());
      if (!res.ok) {
        if (optional) return null;
        throw new Error("Fetch failed: " + url);
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
    // 1) Tüm store meta datası (data/stores.json)
    const stores = await fetchJSON("stores.json");
    if (!Array.isArray(stores)) {
      throw new Error("stores.json did not return an array");
    }

    // storeSlug YOKSA: STORE HUB (ör: docs/store/index.html)
    if (!storeSlug) {
      const allSubstores = await fetchJSON("substores.json", {
        optional: true
      });

      const substoresByParent = {};
      if (Array.isArray(allSubstores)) {
        for (const ss of allSubstores) {
          if (!ss.parent) continue;
          if (!substoresByParent[ss.parent]) {
            substoresByParent[ss.parent] = [];
          }
          substoresByParent[ss.parent].push(ss);
        }
      }

      renderStoreHub({ stores, substoresByParent });
      return;
    }

    // ---- BURADAN SONRA: TEKİL STORE / ALT STORE ----

    // 2) aktif store meta
    const storeMeta = stores.find((s) => s.slug === storeSlug) || null;
    if (!storeMeta) {
      throw new Error("Store not found: " + storeSlug);
    }

    // 3) tüm substores (data/substores.json)
    const allSubstores = await fetchJSON("substores.json", {
      optional: true
    });

    const substores = Array.isArray(allSubstores)
      ? allSubstores.filter((s) => s.parent === storeSlug)
      : [];

    // 4) aktif substore (varsa)
    let subMeta = null;
    if (subSlug) {
      subMeta = substores.find((s) => s.slug === subSlug) || null;
      if (!subMeta) {
        console.warn("Substore not found:", storeSlug, subSlug);
      }
    }

    // 5) ürünler
    // Senin data yapına göre: products-hardware.json, products-ai-tools-hub.json vb.
    let products = [];
    if (subSlug) {
      const subProducts = await fetchJSON(
        `products-${subSlug}.json`,
        { optional: true }
      );
      products = Array.isArray(subProducts) ? subProducts : [];
    } else {
      const storeProducts = await fetchJSON(
        `products-${storeSlug}.json`,
        { optional: true }
      );
      products = Array.isArray(storeProducts) ? storeProducts : [];
    }

    // 6) layout render
    renderStoreLayout({ storeMeta, substores, subMeta, products });

    // 7) extension hook – mağaza bazlı ekstra JS için açık kapı
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

  // ---- render: STORE HUB (tüm mağazalar) ----

  function renderStoreHub({ stores, substoresByParent }) {
    document.title = "RGZTEC • Stores";

    let html = `
      <section class="store-hero">
        <div class="hero-inner">
          <div class="hero-text">
            <span class="badge">RGZTEC</span>
            <h1>Explore all RGZTEC Stores</h1>
            <p>Premium templates, tools, and hardware – organized into specialized stores for creators, developers, and makers.</p>
          </div>
        </div>
      </section>
    `;

    html += `
      <section class="store-substores">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem;">
          <h2 style="font-size:0.95rem;margin:0;letter-spacing:-.02em;">All stores</h2>
          <span style="font-size:.75rem;color:#9ca3af;">${stores.length} stores</span>
        </div>
        <div class="substores-grid">
          ${stores.map((store) => renderMainStoreCard(store, substoresByParent)).join("")}
        </div>
      </section>
    `;

    root.innerHTML = html;
  }

  function renderMainStoreCard(store, substoresByParent) {
    // HUB → /store/index.html içindeysek, "hardware/" gibi relative link yeterli
    const href = `${store.slug}/`;
    const title = store.title || "";
    const description = store.description || "";
    const banner = store.banner || "";
    const categories = substoresByParent?.[store.slug] || [];
    const catCount = categories.length;

    return `
      <a class="substore-card" href="${href}">
        <div class="substore-banner">
          ${
            banner
              ? `<img src="${encodeURI(banner)}" alt="${escapeAttr(title + ' banner')}">`
              : ""
          }
        </div>
        <div class="substore-body">
          <h3>${escapeHTML(title)}</h3>
          <p>${description ? escapeHTML(description) : ""}</p>
          ${
            catCount
              ? `<span class="substore-pill">${catCount} categories</span>`
              : ""
          }
        </div>
      </a>
    `;
  }

  // ---- render: TEKİL STORE LAYOUT ----

  function renderStoreLayout({ storeMeta, substores, subMeta, products }) {
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
            <span class="badge">${(storeMeta.slug || "STORE").toUpperCase()}</span>
            <h1>${escapeHTML(title)}</h1>
            <p>${description ? escapeHTML(description) : ""}</p>
          </div>
          <div class="hero-banner">
            ${
              banner
                ? `<img src="${encodeURI(banner)}" alt="${escapeAttr(title + " banner")}">`
                : ""
            }
          </div>
        </div>
      </section>
    `;

    // SUBSTORE GRID – sadece ana store view'da (subMeta yokken)
    if (!subMeta && substores && substores.length) {
      html += `
        <section class="store-substores">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem;">
            <h2 style="font-size:0.95rem;margin:0;letter-spacing:-.02em;">Shop categories</h2>
            <span style="font-size:.75rem;color:#9ca3af;">${substores.length} categories</span>
          </div>
          <div class="substores-grid">
            ${substores.map((ss) => renderSubstoreCard(ss)).join("")}
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

  function renderSubstoreCard(ss) {
    // /store/hardware/index.html içindeyiz → "ai-tools-hub/" gibi relative link
    const href = `${ss.slug}/`;
    const title = ss.title || "";
    const description = ss.description || "";
    const banner = ss.banner || "";

    return `
      <a class="substore-card" href="${href}">
        <div class="substore-banner">
          ${
            banner
              ? `<img src="${encodeURI(banner)}" alt="${escapeAttr(title)}">`
              : ""
          }
        </div>
        <div class="substore-body">
          <h3>${escapeHTML(title)}</h3>
          <p>${description ? escapeHTML(description) : ""}</p>
        </div>
      </a>
    `;
  }

  function renderProductCard(p) {
    const title = p.title || "";
    const subtitle = p.subtitle || "";
    const price = p.price || "";
    const tag = p.tag || "";
    const image = p.image || ""; // örn: "assets/images/store/hardware/board-1.webp"

    return `
      <article class="product-card">
        <div class="product-media">
          ${
            image
              ? `<img src="${encodeURI(image)}" alt="${escapeAttr(title)}">`
              : ""
          }
        </div>
        <div class="product-body">
          <h2>${escapeHTML(title)}</h2>
          <p>${escapeHTML(subtitle)}</p>
          <div class="product-meta">
            <span class="price">${escapeHTML(price)}</span>
            ${tag ? `<span class="tag">${escapeHTML(tag)}</span>` : ""}
          </div>
        </div>
      </article>
    `;
  }
})();
