// store/core/assets/js/store-shell.js
// RGZTEC STORE • sadece mağaza ve dükkân sayfalarını yönetir.
// docs/app.js'e dokunmaz, onunla çakışmaz.

(function () {
  const DATA_BASE = "docs/data/"; // /rgztec/ kökünden bakınca doğru path

  document.addEventListener("DOMContentLoaded", () => {
    const rootStores = document.getElementById("store-root");
    const rootListing = document.getElementById("listing-root");

    if (rootStores) {
      initStoreIndex(rootStores).catch((e) =>
        console.error("[store-shell] index error:", e)
      );
    }
    if (rootListing) {
      initStoreListing(rootListing).catch((e) =>
        console.error("[store-shell] listing error:", e)
      );
    }
  });

  // =============== STORE INDEX ===============
  async function initStoreIndex(root) {
    const stores = await fetchJSON(DATA_BASE + "stores.json");

    if (!stores || !stores.length) {
      root.innerHTML = `
        <div class="info-box">
          <p>No stores configured yet.</p>
        </div>`;
      return;
    }

    root.innerHTML = stores.map(renderStoreCard).join("");
  }

  function renderStoreCard(store) {
    const slug = esc(store.slug || "");
    const name = esc(store.name || "Untitled Store");
    const tagline = esc(store.tagline || "");
    const category = esc(store.category || "");
    const badge = esc(store.badge || "");
    const image = store.image ? esc(store.image) : "";

    const href = `store/listing.html?store=${slug}`;

    return `
      <article class="product-card store-card">
        <a href="${href}" class="product-card-link">
          <div class="product-card-thumb store-card-thumb">
            ${
              image
                ? `<img src="${image}" alt="${name}">`
                : `<span class="product-card-thumb-placeholder">${category || "Store"}</span>`
            }
          </div>
          <div class="product-card-body store-card-body">
            <h3 class="product-card-title store-card-title">${name}</h3>
            ${
              tagline
                ? `<p class="product-card-subtitle store-card-subtitle">${tagline}</p>`
                : ""
            }
            <div class="product-card-footer store-card-footer">
              ${
                category
                  ? `<span class="product-card-tag">${category}</span>`
                  : ""
              }
              ${
                badge
                  ? `<span class="product-card-badge">${badge}</span>`
                  : ""
              }
            </div>
          </div>
        </a>
      </article>
    `;
  }

  // =============== STORE LISTING (SHOP) ===============
  async function initStoreListing(root) {
    const params = new URLSearchParams(location.search);
    const storeSlug = params.get("store");
    const shopSlug = params.get("shop"); // boş da olabilir

    if (!storeSlug) {
      root.innerHTML = `
        <div class="info-box error">
          <p>No store selected. Use <code>?store=hardware</code> gibi.</p>
        </div>`;
      return;
    }

    const [stores, ubstores, productsRaw] = await Promise.all([
      fetchJSON(DATA_BASE + "stores.json"),
      fetchJSON(DATA_BASE + "ubstores.json"),
      fetchJSON(DATA_BASE + "products.json").catch(() => []),
    ]);

    const store = (stores || []).find((s) => s.slug === storeSlug);
    if (!store) {
      root.innerHTML = `
        <div class="info-box error">
          <p>Store <strong>${esc(storeSlug)}</strong> not found.</p>
        </div>`;
      return;
    }

    let shop = null;
    if (shopSlug) {
      shop = (ubstores || []).find(
        (x) => x.store === storeSlug && x.slug === shopSlug
      );
    }

    // HERO alanını doldur
    fillListingHero(store, shop);

    // Ürünleri filtrele
    const products = Array.isArray(productsRaw) ? productsRaw : [];
    const visible = products.filter((p) => {
      if (p.store !== storeSlug) return false;
      if (shopSlug && p.shop !== shopSlug) return false;
      return true;
    });

    if (!visible.length) {
      root.innerHTML = `
        <div class="info-box">
          <p>No products added for this category yet.</p>
        </div>`;
      return;
    }

    root.innerHTML = visible.map(renderProductCard).join("");
  }

  function fillListingHero(store, shop) {
    const listingTitle = document.getElementById("listing-title");
    const listingTagline = document.getElementById("listing-tagline");
    const listingHeroMedia = document.getElementById("listing-hero-media");
    const listingSectionTitle = document.getElementById("listing-section-title");
    const listingSectionSubtitle = document.getElementById(
      "listing-section-subtitle"
    );

    const titleText = shop
      ? `${store.name || store.slug} • ${shop.name}`
      : store.name || store.slug;

    const taglineText =
      (shop && shop.tagline) ||
      store.tagline ||
      "Curated products from RGZTEC creators.";

    if (listingTitle) listingTitle.textContent = titleText;
    if (listingTagline) listingTagline.textContent = taglineText;

    if (listingSectionTitle) {
      listingSectionTitle.textContent =
        (shop && shop.sectionTitle) || "Featured products";
    }

    if (listingSectionSubtitle) {
      listingSectionSubtitle.textContent =
        (shop && shop.sectionSubtitle) ||
        "Browse products ready to plug into your stack.";
    }

    if (listingHeroMedia) {
      const heroImg =
        (shop && shop.image) || store.heroImage || store.image || "";
      if (heroImg) {
        listingHeroMedia.innerHTML = `<img src="${esc(
          heroImg
        )}" alt="${esc(titleText)}">`;
      }
    }
  }

  function renderProductCard(p) {
    const title = esc(p.name || "Untitled product");
    const subtitle = esc(p.subtitle || "");
    const image = p.image ? esc(p.image) : "";
    const price =
      p.price !== undefined && p.price !== null ? String(p.price) : null;
    const unit = esc(p.priceUnit || "USD");
    const vendor = esc(p.vendor || "");
    const tags = Array.isArray(p.tags) ? p.tags.map(esc) : [];

    return `
      <article class="product-card">
        <div class="product-card-thumb">
          ${
            image
              ? `<img src="${image}" alt="${title}">`
              : `<span class="product-card-thumb-placeholder">Preview</span>`
          }
        </div>
        <div class="product-card-body">
          <h3 class="product-card-title">${title}</h3>
          ${
            subtitle
              ? `<p class="product-card-subtitle">${subtitle}</p>`
              : ""
          }
          <div class="product-card-footer">
            <div class="product-card-price-block">
              ${
                price
                  ? `<span class="product-card-price">${price}</span><span class="product-card-price-unit">${unit}</span>`
                  : `<span class="product-card-price-muted">Pricing on request</span>`
              }
            </div>
            <div class="product-card-meta">
              ${
                vendor
                  ? `<span class="product-card-tag">${vendor}</span>`
                  : ""
              }
              ${
                tags.length
                  ? tags
                      .map(
                        (t) =>
                          `<span class="product-card-tag product-card-tag-soft">${t}</span>`
                      )
                      .join("")
                  : ""
              }
            </div>
          </div>
        </div>
      </article>
    `;
  }

  // =============== HELPERS ===============
  async function fetchJSON(path) {
    const res = await fetch(path + "?v=" + Date.now());
    if (!res.ok) {
      throw new Error("Fetch failed: " + path + " (" + res.status + ")");
    }
    return await res.json();
  }

  function esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();





