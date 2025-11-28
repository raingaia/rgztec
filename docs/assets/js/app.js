/* RGZTEC — app.js
   Amaç:
   - Sayfada header/kategori elemanlarının ÇİFT görünmesini önlemek,
   - varsa fazlalıkları temizlemek ve aktif kategoriyi güvenceye almak.
   - GitHub Pages alt yolunda /assets/... patikalarını düzeltmek.
   - STORE SAYFALARI (store index + listing) için data tabanlı grid oluşturmak.
   Bu dosya HEADER OLUŞTURMAZ; sadece düzenler ve store sayfalarını doldurur. */

(function () {
  // Küçük yardımcılar
  const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const once = (fn) => {
    try {
      fn();
    } catch (e) {
      console.warn("[app.js]", e);
    }
  };

  // ============================================================
  // 1) Fazla header/kategori/çizgi elemanlarını temizle
  // ============================================================
  once(() => {
    const headers = $all("header.topbar");
    if (headers.length > 1) {
      headers.slice(1).forEach((h) => h.remove());
      // console.info('[app] duplicate headers removed:', headers.length - 1);
    }

    const navs = $all("nav.categories");
    if (navs.length > 1) {
      navs.slice(1).forEach((n) => n.remove());
      // console.info('[app] duplicate category bars removed:', navs.length - 1);
    }

    const dividers = $all("hr.divider");
    if (dividers.length > 1) {
      dividers.slice(1).forEach((d) => d.remove());
      // console.info('[app] duplicate dividers removed:', dividers.length - 1);
    }
  });

  // ============================================================
  // 2) Aktif kategori işaretleme (layout.js çalışmadıysa devreye girer)
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
  // 3) Eski mağaza grid fallback’i (#productsGrid için)
  //    (Yeni store mimarisiyle çakışmaz, sadece eski sayfalarda çalışır)
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
  //    fetch override + global assetUrl helper.
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
  // 6) STORE MANTIĞI (store-shell.js buraya entegre edildi)
  //    - store/index.html  → 11 mağaza listesi
  //    - store/listing.html → tek dükkân (shop) listing
  // ===================================================================

  // Küçük helper: asset yolu çözmek (varsa assetUrl kullan)
  function resolveAsset(path) {
    if (!path) return "";
    if (typeof window !== "undefined" && typeof window.assetUrl === "function") {
      try {
        return window.assetUrl(path);
      } catch (e) {
        console.warn("[app.js] assetUrl warn:", e);
      }
    }
    return path;
  }

  // DOM hazır olduğunda hangi sayfada olduğumuzu algıla
  once(() => {
    const body = document.body;
    const pageType = body.dataset.page || ""; // home / store-index / store-listing vs.

    // Store index → 11 mağaza grid
    if (pageType === "store-index" || document.getElementById("store-root")) {
      initStoreIndex().catch((err) =>
        console.error("Store index init error:", err)
      );
    }

    // Listing → tek dükkân (shop) sayfası
    if (pageType === "store-listing" || document.getElementById("listing-root")) {
      initStoreListing().catch((err) =>
        console.error("Store listing init error:", err)
      );
    }

    // Diğer sayfalar için burada ek init fonksiyonları tanımlanabilir (gerekirse)
  });

  // ---------------------------
  // 6.a) STORE INDEX (11 mağaza)
  // ---------------------------
  async function initStoreIndex() {
    const root = document.getElementById("store-root");
    if (!root) return; // Bu sayfa değilse çık

    const stores = await fetchJSON("assets/data/stores.json");

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
    const slug = escapeHTML(store.slug || "");
    const name = escapeHTML(store.name || "Untitled Store");
    const tagline = escapeHTML(store.tagline || "");
    const category = escapeHTML(store.category || "");
    const badge = escapeHTML(store.badge || "");
    const image = store.image ? resolveAsset(store.image) : "";

    // Şimdilik mağazaya tıklayınca, store/listing.html?store=slug
    // Sonraki adımda shop parametresini de ekleriz (ilk dükkâna gitmesi için).
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
  async function initStoreListing() {
    const root = document.getElementById("listing-root");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const storeSlug = params.get("store");
    const shopSlug = params.get("shop") || ""; // şu an opsiyonel

    if (!storeSlug) {
      root.innerHTML = `
        <div class="info-box error">
          <p>No store selected. Use <code>?store=hardware</code> gibi.</p>
        </div>`;
      return;
    }

    const [stores, shops, products] = await Promise.all([
      fetchJSON("assets/data/stores.json"),
      fetchJSON("assets/data/shops.json"),
      // ürün dosyası yoksa / boşsa kırılmasın
      fetchJSON("assets/data/products.json").catch(() => []),
    ]);

    const store = (stores || []).find((s) => s.slug === storeSlug);
    if (!store) {
      root.innerHTML = `
        <div class="info-box error">
          <p>Store <strong>${escapeHTML(storeSlug)}</strong> not found.</p>
        </div>`;
      return;
    }

    let shop = null;
    if (shopSlug) {
      shop = (shops || []).find(
        (x) => x.store === storeSlug && x.slug === shopSlug
      );
    }

    // HERO alanlarını doldur
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
      const heroImgPath =
        (shop && shop.image) || store.heroImage || store.image || "";
      if (heroImgPath) {
        const url = resolveAsset(heroImgPath);
        listingHeroMedia.innerHTML = `<img src="${url}" alt="${escapeHTML(
          titleText
        )}">`;
      }
    }

    // Ürünleri filtrele (şu an ürün olmasa bile sayfa açılacak)
    const allProducts = Array.isArray(products) ? products : [];
    const visible = allProducts.filter((p) => {
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

  function renderProductCard(p) {
    const title = escapeHTML(p.name || "Untitled product");
    const subtitle = escapeHTML(p.subtitle || "");
    const imagePath = p.image ? resolveAsset(p.image) : "";
    const price =
      p.price !== undefined && p.price !== null ? String(p.price) : null;
    const unit = escapeHTML(p.priceUnit || "USD");
    const vendor = escapeHTML(p.vendor || "");
    const tags = Array.isArray(p.tags) ? p.tags.map(escapeHTML) : [];

    return `
      <article class="product-card">
        <div class="product-card-thumb">
          ${
            imagePath
              ? `<img src="${imagePath}" alt="${title}">`
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

  function escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
