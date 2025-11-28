/* RGZTEC — app.js
   Orijinal amaç:
   - Sayfada header/kategori elemanlarının ÇİFT görünmesini önlemek,
   - varsa fazlalıkları temizlemek ve aktif kategoriyi güvenceye almak.
   - /assets/... yollarını GitHub Pages proje alt yolu için düzeltmek.

   Ek olarak (STORE ENTEGRASYONU):
   - 11 mağaza sayfasında (store index) kartları data'dan doldurmak,
   - Dükkân (listing) sayfalarında doğru hero + ürün gridini göstermek.

   NOT: Bu dosya HEADER OLUŞTURMAZ, sadece:
   - Mevcut header/kategoriyi düzenler (home + docs + store),
   - Mağaza sayfalarında (#store-root / #listing-root varsa) data'dan kart basar.
*/

(function () {
  // -----------------------------
  // Küçük yardımcılar (mevcut)
  // -----------------------------
  const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const once = (fn) => {
    try {
      fn();
    } catch (e) {
      console.warn("[app.js]", e);
    }
  };

  // ============================================================
  // 1) Fazla header/kategori/çizgi elemanlarını temizle  (MEVCUT)
  // ============================================================
  once(() => {
    const headers = $all("header.topbar");
    if (headers.length > 1) {
      headers.slice(1).forEach((h) => h.remove());
    }

    const navs = $all("nav.categories");
    if (navs.length > 1) {
      navs.slice(1).forEach((n) => n.remove());
    }

    const dividers = $all("hr.divider");
    if (dividers.length > 1) {
      dividers.slice(1).forEach((d) => d.remove());
    }
  });

  // ============================================================
  // 2) Aktif kategori işaretleme (layout.js çalışmadıysa devreye girer)
  //    (MEVCUT – home + mağaza URL’lerinde de çalışır)
  // ============================================================
  once(() => {
    // Zaten işaretlenmişse dokunma
    if (document.querySelector(".categories a.active")) return;

    const path = location.pathname.toLowerCase();
    const map = [
      { key: "web", match: ["/dev-studio-one", "/web-templates"] },
      { key: "ecom", match: ["/ecommerce", "/e-commerce", "/marketplace"] },
      {
        key: "widgets",
        match: [
          "/widgets",
          "/icon-smith",
          "/ai-tools-hub",
          "/wp-plugins",
          "/tiny-js-lab",
        ],
      },
      {
        key: "software",
        match: ["/reactorium", "/game-makers", "/unity-hub", "/software"],
      },
      { key: "niche", match: ["/email-forge", "/niche"] },
    ];
    const activeKey = (map.find((m) =>
      m.match.some((seg) => path.includes(seg))
    ) || {}).key;
    if (activeKey) {
      const el = document.querySelector(
        `.categories a[data-key="${activeKey}"]`
      );
      if (el) el.classList.add("active");
    }
  });

  // ============================================================
  // 3) Eski grid için fallback (#productsGrid)
  // ============================================================
  once(() => {
    const grid = document.getElementById("productsGrid");
    if (grid && !grid.children.length && !grid._filled) {
      grid.innerHTML = `<div style="grid-column:1/-1;color:#6B7280">No products yet.</div>`;
      grid._filled = true;
    }
  });

  // ============================================================
  // 4) Güvenlik: Başka bir script header enjekte etmeye kalkarsa engelle
  // ============================================================
  if (document.querySelector("header.topbar")) {
    window.__HEADER_READY__ = true;
  }

  // ============================================================
  // 5) YOL DÜZELTME (GitHub Pages proje alt yolu için)
  //    /assets/... patikalarını assets/... olarak normalize eder.
  //    fetch override + global assetUrl helper. (MEVCUT)
  // ============================================================
  once(() => {
    const ABS_ASSET = /^\/assets\//;

    // Genel yardımcı: herhangi bir asset yolunu tam URL’ye çevirir
    window.assetUrl = function (p) {
      const baseHref =
        document.querySelector("base")?.getAttribute("href") || location.href;
      const clean = (typeof p === "string" ? p : String(p)).replace(
        ABS_ASSET,
        "assets/"
      );
      return new URL(clean, baseHref).toString();
    };

    // fetch override: input '/assets/...' ise 'assets/...' yap
    const _fetch = window.fetch;
    window.fetch = function (input, init) {
      try {
        if (typeof input === "string" && ABS_ASSET.test(input)) {
          input = input.replace(ABS_ASSET, "assets/");
        } else if (input instanceof Request && ABS_ASSET.test(input.url)) {
          input = new Request(
            input.url.replace(ABS_ASSET, "assets/"),
            input
          );
        }
      } catch (e) {
        console.warn("[app.js] fetch normalize warn:", e);
      }
      return _fetch(input, init);
    };
  });

  // ===================================================================
  // 6) STORE ENTEGRASYONU (YENİ KISIM)
  //    Ama SADECE mağaza sayfalarında çalışır:
  //    - store index:   #store-root
  //    - shop listing:  #listing-root
  //
  //    Data dosyaları (EKRAN GÖRÜNTÜNDEKİ YAPIYA GÖRE):
  //    - /rgztec/docs/data/stores.json    → 11 mağaza
  //    - /rgztec/docs/data/ubstores.json  → dükkanlar (500 satır)
  //    - /rgztec/docs/data/products.json  → ürünler (şimdilik boş olabilir)
  //
  //    BASE her yerde /rgztec/ olduğu için, fetch ile "docs/data/..." dememiz yeterli.
  // ===================================================================

  const DATA_BASE = "docs/data/"; // base="/rgztec/" ile birleşince: /rgztec/docs/data/...

  // DOM hazır olunca hangi store bloğunun çalışacağını belirle
  once(() => {
    const storeRoot = document.getElementById("store-root");
    const listingRoot = document.getElementById("listing-root");

    if (storeRoot) {
      initStoreIndex(storeRoot).catch((e) =>
        console.error("[app.js] store index error:", e)
      );
    }
    if (listingRoot) {
      initStoreListing(listingRoot).catch((e) =>
        console.error("[app.js] store listing error:", e)
      );
    }
  });

  // ---------------------------
  // 6.a) STORE INDEX (11 mağaza)
  // ---------------------------
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

    // Mağazaya tıklayınca: store/listing.html?store=slug
    // (İstersen ileride ?shop=... da ekleriz.)
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

  // ---------------------------------------
  // 6.b) STORE LISTING (tek dükkân / shop)
  // ---------------------------------------
  async function initStoreListing(root) {
    const params = new URLSearchParams(location.search);
    const storeSlug = params.get("store");
    const shopSlug = params.get("shop") || ""; // opsiyonel – dükkân parametresi

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

    // Ürünleri filtrele (ürün yoksa da sayfa açılacak)
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

  // ---------------------------
  // Ortak helper fonksiyonlar
  // ---------------------------
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
      .replace(/>/g, "&gt;");
  }
})();



