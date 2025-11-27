// /rgztec/assets/js/store-shell.js
// RGZTEC STORE SHELL – 11 store + 79+ section
// DATA:   /rgztec/data/*.json  (body[data-data-path] ile override edilebilir)
// IMAGES: /rgztec/assets/images/store/... (body[data-image-base] ile override edilebilir)

(function () {
  const body = document.body;
  const root = document.getElementById("store-root");

  if (!root) {
    console.error("#store-root element not found.");
    return;
  }

  // store & substore slug'ları
  const storeSlug = body.dataset.store || "";
  const subSlug = body.dataset.substore || "";

  // body’ye class ekleyelim ki her sayfada yazmak zorunda kalmayalım
  body.classList.add("store-body");

  // veri ve görüntü kök yolları
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
      return relativePath;
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

      // root /store/ sayfası ileride istersek buradan renderStoreHub() çağırabiliriz
      if (!storeSlug) {
        renderStoreHub(stores);
        return;
      }

      // 2) aktif mağaza meta
      const storeMeta = stores.find((s) => s.slug === storeSlug);
      if (!storeMeta) {
        throw new Error("Store not found: " + storeSlug);
      }

      // 3) mağaza seviyesinde sections + toplu ürünler
      let substores = [];
      let products = [];

      const storeLevel = await fetchJSON(`products-${storeSlug}.json`, true);

      // products-html-templates.json gibi:
      // {
      //   "categories": [...],
      //   "products": [...]
      // }
      if (storeLevel && Array.isArray(storeLevel.categories)) {
        substores = storeLevel.categories.map((c) => ({
          parent: storeSlug,
          slug: c.slug,
          title: c.name || c.title || slugToTitle(c.slug),
          description: c.description || "",
          banner: c.banner || `${storeSlug}/${c.slug}/banner.webp`
        }));
      }

      // mağaza ana view için products[] varsa okuyalım
      if (!subSlug && storeLevel && Array.isArray(storeLevel.products)) {
        products = storeLevel.products;
      }

      // 4) aktif section
      let subMeta = null;
      if (subSlug) {
        subMeta = substores.find((s) => s.slug === subSlug) || null;
      }

      // 5) section ürünleri
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

        if (Array.isArray(subProducts)) {
          products = subProducts;
        }
      }

      // 6) render
      renderStoreLayout({ storeMeta, substores, subMeta, products });

      // 7) extension hook (ileride mağaza bazlı ekstra JS için)
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
        '<p class="store-error">Store could not be loaded. Please try again later.</p>';
    }
  }

  // ---------- render: mağaza / section ----------
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

  // ---------- HERO (ana sayfa kalitesinde geniş blok) ----------
  let html = `
    <section class="store-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <span class="badge">${(storeMeta.slug || "STORE").toUpperCase()}</span>
          <h1>${escapeHTML(title)}</h1>
          <p>${description ? escapeHTML(description) : ""}</p>
          <div class="hero-meta-row">
            <span class="hero-chip">Global marketplace</span>
            <span class="hero-chip">Secure payments</span>
            <span class="hero-chip">Instant delivery</span>
          </div>
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

  // ---------- MAĞAZA ANA SAYFA: SADECE SECTIONS GRID ----------
  if (!subMeta && substores && substores.length) {
    html += `
      <section class="store-substores">
        <div class="store-substores-header">
          <h2>Sections</h2>
          <span class="store-substores-count">${substores.length} sections</span>
        </div>
        <div class="substores-grid">
          ${substores.map(renderSubstoreCard).join("")}
        </div>
      </section>
    `;
  }

  // ---------- DÜKKÂN SAYFASI: PRODUCT GRID ----------
  if (subMeta && products && products.length) {
    html += `
      <section class="store-products">
        <div class="store-products-header">
          <h2>Featured products</h2>
          <span class="store-products-count">${products.length} items</span>
        </div>
        <div class="products-grid">
          ${products.map(renderProductCard).join("")}
        </div>
      </section>
    `;
  } else if (subMeta && (!products || !products.length)) {
    // SADECE DÜKKÂNDA “No products…”
    html += `
      <section class="store-products">
        <p class="store-empty">No products found in this section yet.</p>
      </section>
    `;
  }

  // Ana mağazada (subMeta yokken) product bloğu hiç eklenmiyor
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

  // ---------- optional: /store/ root hub (istersen sonra kullanırız) ----------

  function renderStoreHub(stores) {
    document.title = "RGZTEC • Stores";

    let html = `
      <section class="store-hero">
        <div class="hero-inner">
          <div class="hero-text">
            <span class="badge">RGZTEC</span>
            <h1>Explore all RGZTEC stores</h1>
            <p>11 curated stores and dozens of sections, built for developers, makers and creators.</p>
          </div>
        </div>
      </section>
      <section class="store-substores">
        <div class="store-substores-header">
          <h2>All stores</h2>
          <span class="store-substores-count">${stores.length} stores</span>
        </div>
        <div class="substores-grid">
          ${stores.map((s) => {
            const title = s.name || s.title || slugToTitle(s.slug);
            const description =
              s.tagline || s.seoDescription || s.description || "";
            const bannerUrl = s.banner ? buildImageUrl(s.banner) : "";
            return `
              <a class="substore-card" href="${s.slug}/">
                <div class="substore-banner">
                  ${
                    bannerUrl
                      ? `<img src="${encodeURI(bannerUrl)}" alt="${escapeAttr(title)}">`
                      : ""
                  }
                </div>
                <div class="substore-body">
                  <h3>${escapeHTML(title)}</h3>
                  <p>${escapeHTML(description)}</p>
                </div>
              </a>
            `;
          }).join("")}
        </div>
      </section>
    `;

    root.innerHTML = html;
  }

  // başlat
  main();
})();



