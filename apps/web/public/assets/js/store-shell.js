// /rgztec/assets/js/store-shell.js
// RGZTEC STORE SHELL – 11 store + 79 section
// - DATA:   /rgztec/data/*.json (veya body[data-data-path])
// - IMAGES: /rgztec/assets/images/store/... (veya body[data-image-base])

(async function () {
  const body = document.body;
  const root = document.getElementById("store-root");

  if (!root) {
    console.error("#store-root element not found.");
    return;
  }

  const storeSlug = body.dataset.store || "";    // örn: "game-makers"
  const subSlug = body.dataset.substore || "";   // örn: "unity-2d"

  const DATA_BASE =
    (body.dataset.dataPath || "/rgztec/data").replace(/\/+$/, "") + "/";
  const IMAGE_BASE =
    (body.dataset.imageBase || "/rgztec/assets/images/store").replace(/\/+$/, "") + "/";

  // ---------- helpers ----------

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

  function buildImageUrl(relativePath) {
    if (!relativePath) return "";
    if (/^https?:\/\//.test(relativePath) || relativePath.startsWith("/")) {
      return relativePath; // tam URL ise dokunma
    }
    return IMAGE_BASE + relativePath.replace(/^\/+/, "");
  }

  function slugToTitle(slug) {
    return String(slug || "")
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  // ---------- main flow ----------

  try {
    // 1) Tüm mağazalar
    const stores = await fetchJSON("stores.json");
    if (!Array.isArray(stores)) {
      throw new Error("stores.json did not return an array");
    }

    // A) Root /store/ sayfası → tüm mağaza hub’ı
    if (!storeSlug) {
      renderStoreHub({ stores });
      return;
    }

    // B) Tekil mağaza / dükkân sayfaları

    // 2) aktif store meta
    const storeMeta = stores.find((s) => s.slug === storeSlug) || null;
    if (!storeMeta) {
      throw new Error("Store not found: " + storeSlug);
    }

    // 3) substores (her mağaza için ayrı json varsa onu oku)
    let substores = [];

    const perStoreSubstores = await fetchJSON(
      `substores-${storeSlug}.json`,
      { optional: true }
    );

    if (Array.isArray(perStoreSubstores)) {
      substores = perStoreSubstores;
    } else {
      const allSubstores = await fetchJSON("substores.json", {
        optional: true
      });
      if (Array.isArray(allSubstores)) {
        substores = allSubstores.filter((s) => s.parent === storeSlug);
      }
    }

    // 4) aktif substore meta
    let subMeta = null;
    if (subSlug) {
      subMeta = substores.find((s) => s.slug === subSlug) || null;
      if (!subMeta) {
        console.warn("Substore not found:", storeSlug, subSlug);
      }
    }

    // 5) ürünler
    let products = [];
    if (subSlug) {
      // Önce: products-{storeSlug}-{subSlug}.json
      let subProducts = await fetchJSON(
        `products-${storeSlug}-${subSlug}.json`,
        { optional: true }
      );

      // Olmazsa: products-{subSlug}.json
      if (!Array.isArray(subProducts)) {
        subProducts = await fetchJSON(`products-${subSlug}.json`, {
          optional: true
        });
      }

      products = Array.isArray(subProducts) ? subProducts : [];
    } else {
      // Store ana view → products-{storeSlug}.json
      const storeProducts = await fetchJSON(
        `products-${storeSlug}.json`,
        { optional: true }
      );
      products = Array.isArray(storeProducts) ? storeProducts : [];
    }

    // 6) render
    renderStoreLayout({ storeMeta, substores, subMeta, products });

    // 7) extension hook (varsa)
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

  // ---------- render: root /store/ hub ----------

  function renderStoreHub({ stores }) {
    document.title = "RGZTEC • Stores";

    let html = `
      <section class="store-hero">
        <div class="hero-inner">
          <div class="hero-text">
            <span class="badge">RGZTEC</span>
            <h1>Explore all RGZTEC Stores</h1>
            <p>11 curated stores and 79 sections, built for developers, makers and creators.</p>
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
          ${stores.map(renderMainStoreCard).join("")}
        </div>
      </section>
    `;

    root.innerHTML = html;
  }

  function renderMainStoreCard(store) {
    const href = `${store.slug}/`;
    const title =
      store.name || store.title || slugToTitle(store.slug);
    const description =
      store.tagline ||
      store.seoDescription ||
      store.description ||
      "";
    const bannerPath = store.banner || "";
    const bannerUrl = bannerPath ? buildImageUrl(bannerPath) : "";

    return `
      <a class="substore-card" href="${href}">
        <div class="substore-banner">
          ${
            bannerUrl
              ? `<img src="${encodeURI(bannerUrl)}" alt="${escapeAttr(title + ' banner')}">`
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

  // ---------- render: tekil store / substore ----------

  function renderStoreLayout({ storeMeta, substores, subMeta, products }) {
    const title =
      (subMeta && subMeta.title) ||
      storeMeta.name ||            // stores.json'daki name
      storeMeta.title ||           // varsa eski title
      slugToTitle(storeMeta.slug); // son çare slug

    const description =
      (subMeta && subMeta.description) ||
      storeMeta.tagline ||         // tagline'ı kullan
      storeMeta.seoDescription ||  // yoksa SEO açıklaması
      storeMeta.description ||     // varsa eski description
      "";

    const bannerPath =
      (subMeta && subMeta.banner) ||
      storeMeta.banner ||
      null;

    const bannerUrl = bannerPath ? buildImageUrl(bannerPath) : "";

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
              bannerUrl
                ? `<img src="${encodeURI(bannerUrl)}" alt="${escapeAttr(title + " banner")}">`
                : ""
            }
          </div>
        </div>
      </section>
    `;

    // Substore grid – sadece mağaza ana view'da
    if (!subMeta && substores && substores.length) {
      html += `
        <section class="store-substores">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem;">
            <h2 style="font-size:0.95rem;margin:0;letter-spacing:-.02em;">Sections</h2>
            <span style="font-size:.75rem;color:#9ca3af;">${substores.length} sections</span>
          </div>
          <div class="substores-grid">
            ${substores.map(renderSubstoreCard).join("")}
          </div>
        </section>
      `;
    }

    // Products
    html += `
      <section class="store-products">
        ${
          products && products.length
            ? `
          <div class="products-grid">
            ${products.map(renderProductCard).join("")}
          </div>
        `
            : `<p class="store-empty">No products found in this view yet.</p>`
        }
      </section>
    `;

    root.innerHTML = html;
  }

  function renderSubstoreCard(ss) {
    const href = `${ss.slug}/`; // /store/{storeSlug}/{slug}/
    const title = ss.title || slugToTitle(ss.slug);
    const description = ss.description || "";
    const bannerPath = ss.banner || "";
    const bannerUrl = bannerPath ? buildImageUrl(bannerPath) : "";

    return `
      <a class="substore-card" href="${href}">
        <div class="substore-banner">
          ${
            bannerUrl
              ? `<img src="${encodeURI(bannerUrl)}" alt="${escapeAttr(title)}">`
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
    const imagePath = p.image || "";
    const imageUrl = imagePath ? buildImageUrl(imagePath) : "";

    return `
      <article class="product-card">
        <div class="product-media">
          ${
            imageUrl
              ? `<img src="${encodeURI(imageUrl)}" alt="${escapeAttr(title)}">`
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


