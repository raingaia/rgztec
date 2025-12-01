/**
 * RGZTEC Marketplace - Store Shell Engine
 *
 * 3 katmanlı RGZTEC mağaza yapısı:
 * 1) Ana Header (logo + arama + hesap)
 * 2) Ana Mağaza Navigasyonu (Game Makers, Hardware Lab, ...)
 * 3) Aktif Mağazanın Dükkan Navigasyonu (AI Accelerators, Dev Boards, ...)
 */
(function () {
  "use strict";

  // ---- Sabitler ----

  const DATA_URL = "/rgztec/data/store.data.json";
  const IMAGE_BASE_PATH = "/rgztec/assets/images/store/";

  // ---- Başlatma ----

  document.addEventListener("DOMContentLoaded", () => {
    const storeRoot = document.getElementById("store-root");
    const storeBody = document.querySelector("body.store-body");

    if (!storeBody || !storeRoot) {
      console.error(
        "Store Shell Engine: '.store-body' veya '#store-root' bulunamadı."
      );
      return;
    }

    const storeSlug = storeBody.dataset.store;          // örn: "hardware"
    const sectionSlug = storeBody.dataset.section || null; // örn: "ai-accelerators"

    if (!storeSlug) {
      renderError(
        new Error("No 'data-store' attribute found on the body tag."),
        storeRoot
      );
      return;
    }

    initStore(storeSlug, sectionSlug, storeRoot);
  });

  // ---- Ana Asenkron Fonksiyon ----

  async function initStore(storeSlug, sectionSlug, targetElement) {
    let storeData;
    let allStoresData;

    try {
      allStoresData = await fetchJSON(DATA_URL);
      if (!allStoresData) {
        throw new Error("Mağaza veri dosyası (store.data.json) boş veya eksik.");
      }

      storeData = allStoresData[storeSlug];

      // Ortak fallback mağaza (slug JSON’da yoksa)
      if (!storeData) {
        console.warn(
          `Store Shell Engine: "${escapeHtml(
            storeSlug
          )}" slug'ı için veri bulunamadı. Ortak mağaza yapısı kullanılıyor.`
        );
        storeData = {
          title: `${storeSlug} Store`,
          tagline: "This store will be available soon.",
          description:
            "Products and categories are being prepared. Please check back later.",
          badge: "Coming Soon",
          banner: null,
          products: [],
          sections: []
        };
      }

      // ---- HTML Sıralaması ----
      let storeHtml = "";

      // 1) Ana header
      storeHtml += renderHeader();

      // 2) Mağaza navigasyonu (tüm RGZTEC mağazaları)
      storeHtml += renderStoreNav(allStoresData, storeSlug);

      // 3) Dükkan navigasyonu (aktif mağaza içi alt kategoriler)
      storeHtml += renderSectionNav(storeData.sections || [], sectionSlug);

      // 4) Hero (mağaza başlığı + banner)
      storeHtml += renderHero(storeData);

      // 5) İçerik: Ana mağaza mı / alt dükkan mı?
      if (sectionSlug) {
        // Alt dükkan sayfası: /rgztec/store/hardware/ai-accelerators/
        const sectionInfo = (storeData.sections || []).find(
          (s) => s.slug === sectionSlug
        );
        const filteredProducts = (storeData.products || []).filter(
          (p) => p.section === sectionSlug
        );
        storeHtml += renderProductSection(filteredProducts, sectionInfo);
      } else {
        // Ana mağaza sayfası: /rgztec/store/hardware/
        storeHtml += renderShopSection(storeData.sections || []);
      }

      // DOM'a bas
      targetElement.innerHTML = storeHtml;

      // Header içindeki form vb. etkileşimleri bağla
      wireInteractions(targetElement);
    } catch (error) {
      console.error(
        `Store Shell Engine: Mağaza yüklenemedi "${escapeHtml(storeSlug)}".`,
        error
      );
      renderError(error, targetElement);
    }
  }

  // ---- HTML Render Fonksiyonları ----

  // 1) Ana Header (Etsy tarzı – Dashboard / Editor, Sign In, Support, Gift, Cart, Open Store)
  function renderHeader() {
    const categoriesIcon = "☰";
    const searchIcon = "🔍";
    const giftIcon = "🎁";
    const cartIcon = "🛒";

    return `
      <header class="store-header">
        <div class="store-header-inner">

          <!-- Sol: Logo + Categories -->
          <div class="store-header-left">
            <a href="/rgztec/" class="store-header-logo">RGZTEC</a>
            <button class="store-header-categories-btn" type="button">
              ${categoriesIcon}
              <span>Categories</span>
            </button>
          </div>

          <!-- Orta: Arama çubuğu -->
          <div class="store-header-center">
            <form class="store-header-search" role="search">
              <input
                type="search"
                placeholder="Search for anything"
                aria-label="Search RGZTEC marketplace"
              />
              <button type="submit" aria-label="Search">
                ${searchIcon}
              </button>
            </form>
          </div>

          <!-- Sağ: Üst linkler + ikonlar + Open Store -->
          <div class="store-header-right">
            <div class="store-header-secondary">
              <a href="#" class="store-header-secondary-link">Dashboard / Editor</a>
              <a href="#" class="store-header-secondary-link">Sign In</a>
              <a href="#" class="store-header-secondary-link">Support</a>
            </div>

            <div class="store-header-actions">
              <button class="store-header-icon-pill" type="button" aria-label="Gift cards">
                ${giftIcon}
              </button>
              <button class="store-header-icon-pill" type="button" aria-label="Cart">
                ${cartIcon}
              </button>
              <a href="#" class="store-header-cta">
                <span>Open Store</span>
              </a>
            </div>
          </div>

        </div>
      </header>
    `;
  }

  // 2) Ana Mağaza Navigasyonu
  function renderStoreNav(allStoresData, currentStoreSlug) {
    const storeLinks = Object.keys(allStoresData)
      .map((slug) => {
        const store = allStoresData[slug];
        if (!store || !store.title) return "";

        const name = escapeHtml(store.title);
        const href = `/rgztec/store/${slug}/`;
        const isActive = slug === currentStoreSlug;
        const linkClass = isActive
          ? "store-main-nav__link active"
          : "store-main-nav__link";

        return `
          <li class="store-main-nav__item">
            <a href="${href}" class="${linkClass}">${name}</a>
          </li>
        `;
      })
      .join("");

    return `
      <nav class="store-main-nav" aria-label="RGZTEC stores">
        <ul class="store-main-nav__list">
          ${storeLinks}
        </ul>
      </nav>
    `;
  }

  // 3) Dükkan Navigasyonu (alt kategoriler)
  function renderSectionNav(sections, currentSectionSlug) {
    if (!Array.isArray(sections) || sections.length === 0) {
      return "";
    }

    const navItems = sections
      .map((section) => {
        if (!section) return "";
        const rawSlug = section.slug || "";
        const slug = escapeHtml(rawSlug);
        const name = escapeHtml(section.name || "Unnamed Section");

        const isActive = slug === currentSectionSlug;
        const linkClass = isActive
          ? "store-section-nav__link active"
          : "store-section-nav__link";

        // Ana sayfadayken: "ai-accelerators/"
        // Alt dükkandayken: "../dev-boards/"
        const href = isActive
          ? "#"
          : currentSectionSlug
          ? `../${slug}/`
          : `${slug}/`;

        return `
          <li class="store-section-nav__item">
            <a href="${href}" class="${linkClass}">${name}</a>
          </li>
        `;
      })
      .join("");

    return `
      <nav class="store-section-nav" aria-label="Store sections">
        <ul class="store-section-nav__list">
          ${navItems}
        </ul>
      </nav>
    `;
  }

  // 4) Hero
  function renderHero(data) {
    const title = escapeHtml(data.title || "Welcome");
    const tagline = escapeHtml(data.tagline || "");
    const badge = escapeHtml(data.badge || "Official Store");
    const description = escapeHtml(data.description || "");
    const bannerUrl = data.banner
      ? `${IMAGE_BASE_PATH}${escapeHtml(data.banner)}`
      : "";

    return `
      <section class="store-hero">
        <div class="store-hero-inner">
          <div class="store-hero-left">
            <span class="store-badge">${badge}</span>
            <h1>${title}</h1>
            ${tagline ? `<p class="store-hero-tagline">${tagline}</p>` : ""}
            ${
              description
                ? `<p class="store-hero-description">${description}</p>`
                : ""
            }
          </div>
          <div class="store-hero-right">
            ${
              bannerUrl
                ? `<img src="${bannerUrl}" alt="${title}" class="store-hero-img" loading="lazy">`
                : ""
            }
          </div>
        </div>
      </section>
    `;
  }

  // 5A) Ana Mağaza – dükkan listesi
  function renderShopSection(sections) {
    return `
      <main class="store-shops">
        <div class="store-shops-header">
          <h2>Explore Our Shops</h2>
        </div>
        ${renderShopGrid(sections)}
      </main>
    `;
  }

  // 5B) Dükkan kart grid’i
  function renderShopGrid(sections) {
    if (!Array.isArray(sections) || sections.length === 0) {
      return `
        <div class="products-grid-empty">
          <h3>Shops Coming Soon</h3>
          <p>Categories for this store are being set up.</p>
        </div>
      `;
    }

    const shopCards = sections.map((section) => renderShopCard(section)).join("");
    return `<div class="shop-grid">${shopCards}</div>`;
  }

  // 5C) Tek bir dükkan kartı
  function renderShopCard(section) {
    if (!section) return "";

    const name = escapeHtml(section.name || "Untitled Shop");
    const tagline = escapeHtml(section.tagline || "");
    const slug = escapeHtml(section.slug || "");
    const imageUrl = section.image
      ? `${IMAGE_BASE_PATH}${escapeHtml(section.image)}`
      : "";

    const href = `${slug}/`;
    const imageElement = imageUrl
      ? `<img src="${imageUrl}" alt="${name}" loading="lazy">`
      : `<div class="product-media-placeholder"></div>`;

    return `
      <a href="${href}" class="shop-card">
        <div class="shop-card-media">${imageElement}</div>
        <div class="shop-card-body">
          <h3 class="shop-card-title">${name}</h3>
          <p class="shop-card-tagline">${tagline}</p>
        </div>
      </a>
    `;
  }

  // 6A) Dükkan sayfası – ürünler
  function renderProductSection(products, sectionInfo) {
    const title = sectionInfo ? escapeHtml(sectionInfo.name) : "Products";
    return `
      <main class="store-products">
        <div class="store-products-header">
          <h2>${title}</h2>
        </div>
        ${renderProductGrid(products, sectionInfo ? sectionInfo.slug : null)}
      </main>
    `;
  }

  // 6B) Ürün grid’i
  function renderProductGrid(products, sectionSlug) {
    if (!Array.isArray(products) || products.length === 0) {
      const emptyTitle = sectionSlug
        ? "No Products in This Shop Yet"
        : "Products Coming Soon";
      const emptyMessage = sectionSlug
        ? "Sellers will add products to this shop soon. Please check back later!"
        : "This store is currently setting up. Please check back later!";

      return `
        <div class="products-grid-empty">
          <h3>${emptyTitle}</h3>
          <p>${emptyMessage}</p>
        </div>
      `;
    }

    const productCards = products.map((p) => renderProductCard(p)).join("");
    return `<div class="products-grid">${productCards}</div>`;
  }

  // 6C) Tek ürün kartı
  function renderProductCard(product) {
    if (!product) return "";

    const title = escapeHtml(product.title || "Untitled Product");
    const tagline = escapeHtml(product.tagline || "");
    const imageUrl = product.image
      ? `${IMAGE_BASE_PATH}${escapeHtml(product.image)}`
      : "";
    const hasPrice =
      product.price !== null &&
      product.price !== undefined &&
      String(product.price).trim() !== "";
    const priceText = hasPrice
      ? formatPrice(product.price)
      : "Contact for Price";

    const imageElement = imageUrl
      ? `<img src="${imageUrl}" alt="${title}" loading="lazy">`
      : `<div class="product-media-placeholder"></div>`;

    return `
      <a href="#" class="product-card">
        <div class="product-media">${imageElement}</div>
        <div class="product-body">
          <h3 class="product-title">${title}</h3>
          <p class="product-tagline">${tagline}</p>
          <div class="product-price">${priceText}</div>
        </div>
      </a>
    `;
  }

  // ---- Etkileşimleri bağla (search submit vb.) ----
  function wireInteractions(root) {
    const searchForm = root.querySelector(".store-header-search");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault(); // sayfa yenilemesin
        const input = searchForm.querySelector("input[type='search']");
        const q = input ? input.value.trim() : "";
        if (!q) return;
        console.log("[RGZTEC] Search:", q);
      });
    }
  }

  // ---- Hata Çıktısı ----

  function renderError(error, targetElement) {
    targetElement.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h1 style="font-size: 1.5rem; font-weight: 700;">RGZTEC</h1>
        <h2 style="font-size: 2rem; margin: 10px 0;">An Error Occurred</h2>
        <p style="font-size: 1.1rem; color: #555;">
          We're sorry, but this store could not be loaded.
        </p>
        <code style="
          display: block;
          background: #f5f5f5;
          color: #d73a49;
          padding: 10px;
          margin-top: 20px;
          border-radius: 6px;
        ">
          ${escapeHtml(error.message)}
        </code>
      </div>
    `;
  }

  // ---- Yardımcılar ----

  async function fetchJSON(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(
        `HTTP error fetching ${url}: ${response.status} ${response.statusText}`
      );
    }
    if (response.status === 204) return null;

    try {
      return await response.json();
    } catch (jsonError) {
      throw new Error(
        `Failed to parse JSON from ${url}: ${jsonError.message}`
      );
    }
  }

  function escapeHtml(unsafe) {
    const str = String(unsafe || "");
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;`)


