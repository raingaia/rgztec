// /rgztec/assets/js/store-shell.js
// RGZTEC STORE SHELL – 11 store + 79 section
// DATA:   /rgztec/data/*.json  (body[data-data-path] ile override edilebilir)
// IMAGES: /rgztec/assets/images/store/... (body[data-image-base] ile override edilebilir)

(function () {
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
    (body.dataset.imageBase || "/rgztec/assets/images/store")
      .replace(/\/+$/, "") + "/";

  // ---------- helpers ----------

  async function fetchJSON(path, optional) {
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

  // ---------- main ----------

  async function main() {
    try {
      // 1) tüm mağazalar
      const stores = await fetchJSON("stores.json", false);
      if (!Array.isArray(stores)) {
        throw new Error("stores.json did not return an array");
      }

      // 2) aktif store meta
      const storeMeta = stores.find((s) => s.slug === storeSlug);
      if (!storeMeta) {
        throw new Error("Store not found: " + storeSlug);
      }

      // 3) mağaza seviyesinde kategori + ürünler
      let substores = [];
      const storeLevel = await fetchJSON(`products-${storeSlug}.json`, true);

      // products-game-makers.json içindeki categories[] → sections grid
      if (storeLevel && Array.isArray(storeLevel.categories)) {
        substores = storeLevel.categories.map((c) => ({
          parent: storeSlug,
          slug: c.slug,
          title: c.name || c.title || slugToTitle(c.slug),
          description: c.description || "",
          banner: c.banner || `${storeSlug}/${c.slug}/banner.webp`
        }));
      }

      // 4) aktif section (substore)
      let subMeta = null;
      if (subSlug) {
        subMeta = substores.find((s) => s.slug === subSlug) || null;
      }

      // 5) ürünler
      let products = [];

      if (subSlug) {
        // Önce: products-{store}-{section}.json
        let subProducts = await fetchJSON(
          `products-${storeSlug}-${subSlug}.json`,
          true
        );
        // yoksa: products-{section}.json
        if (!Array.isArray(subProducts)) {
          subProducts = await fetchJSON(`products-${subSlug}.json`, true);
        }
        products = Array.isArray(subProducts) ? subProducts : [];
      } else if (storeLevel && Array.isArray(storeLevel.products)) {
        // store ana view → aynı JSON içindeki products[]
        products = storeLevel.products;
      }

      // 6) render
      renderStoreLayout({ storeMeta, substores, subMeta, products });
    } catch (err) {
      console.error(err);
      root.innerHTML =
        '<p class="store-error">Store could not be loaded. Please try again later.</p>';
    }
  }

  // ---------- render ----------

  function renderStoreLayout({ storeMeta, substores, subMeta, products }) {
    const title =
      (subMeta && subMeta.title) ||
      storeMeta.name ||
      storeMeta.title ||
      slugToTitle(storeMeta.slug);

    const description =
      (subMeta && subMeta.description) ||
      storeMeta.tagline ||
      storeMeta.seoDescription ||
      storeMeta.description ||
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
                ? `<img src="${encodeURI(bannerUrl)}" alt="${escapeAttr(title + ' banner')}">`
                : ""
            }
          </div>
        </div>
      </section>
    `;

    // Section grid – sadece mağaza ana sayfasında
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

    // Products (şimdilik boşsa hiç göstermiyoruz)
    if (products && products.length) {
      html += `
        <section class="store-products">
          <div class="products-grid">
            ${products.map(renderProductCard).join("")}
          </div>
        </section>
      `;
    }

    root.innerHTML = html;
  }

  function renderSubstoreCard(ss) {
    // /rgztec/store/game-makers/unity-2d/
    const href = `${ss.slug}/`;
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

  // başlat
  main();
})();



