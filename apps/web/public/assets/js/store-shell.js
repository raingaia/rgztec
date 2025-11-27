// /rgztec/assets/js/store-shell.js
// RGZTEC STORE SHELL – tüm store & substore sayfaları buradan yönetilir.
//
// ÇALIŞMA MANTIĞI
// - body[data-store]  : "game-makers", "icon-smith" vb. (store slug)
// - body[data-substore]: "unity-2d", "email-flows" vb. (opsiyonel)
// - body[data-data-path]  : JSON kökü (default: /rgztec/data)
// - body[data-image-base] : görsel kökü (default: /rgztec/assets/images/store)
//
// JSON dosyaları (örnek):
// - /rgztec/data/stores.json
// - /rgztec/data/substores-game-makers.json  veya substores.json + parent=game-makers
// - /rgztec/data/products-game-makers-unity-2d.json
// - /rgztec/data/products-game-makers.json (store-level ürün varsa)

(async function () {
  'use strict';

  const body = document.body;
  const root = document.getElementById('store-root');

  if (!root) {
    console.error('#store-root element not found.');
    return;
  }

  const storeSlug = body.dataset.store || '';      // örn: "game-makers"
  const subSlug   = body.dataset.substore || '';   // örn: "unity-2d"

  const DATA_BASE = (body.dataset.dataPath || '/rgztec/data').replace(/\/+$/, '') + '/';
  const IMAGE_BASE = (body.dataset.imageBase || '/rgztec/assets/images/store').replace(/\/+$/, '') + '/';

  // ---------- Helpers ----------

  async function fetchJSON(path, { optional = false } = {}) {
    const url = DATA_BASE + path.replace(/^\/+/, '');
    try {
      const res = await fetch(url + '?v=' + Date.now());
      if (!res.ok) {
        if (optional) return null;
        throw new Error('Fetch failed: ' + url);
      }
      return await res.json();
    } catch (err) {
      if (optional) return null;
      throw err;
    }
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttr(str) {
    return String(str)
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  function slugToTitle(slug) {
    return String(slug || '')
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function buildImageUrl(relativePath) {
    if (!relativePath) return '';
    if (/^https?:\/\//.test(relativePath) || relativePath.startsWith('/')) {
      // Tam URL veya kökten başlayan path ise olduğu gibi kullan
      return relativePath;
    }
    return IMAGE_BASE + relativePath.replace(/^\/+/, '');
  }

  // ---------- Main flow ----------

  try {
    // 1) Tüm mağazalar metası
    const stores = await fetchJSON('stores.json');
    if (!Array.isArray(stores)) {
      throw new Error('stores.json did not return an array');
    }

    // A) Root /store/ hub sayfası
    if (!storeSlug) {
      renderStoreHub({ stores });
      return;
    }

    // B) Tekil store (örn. Game Makers) /store/game-makers/
    const storeMeta = stores.find(s => s.slug === storeSlug) || null;
    if (!storeMeta) {
      throw new Error('Store not found: ' + storeSlug);
    }

    // 2) Substores (sections)
    let substores = [];

    const perStoreSubstores = await fetchJSON(
      `substores-${storeSlug}.json`,
      { optional: true }
    );

    if (Array.isArray(perStoreSubstores)) {
      substores = perStoreSubstores;
    } else {
      const allSubstores = await fetchJSON('substores.json', { optional: true });
      if (Array.isArray(allSubstores)) {
        substores = allSubstores.filter(s => s.parent === storeSlug);
      }
    }

    // 3) Aktif substore (örn. unity-2d)
    let subMeta = null;
    if (subSlug) {
      subMeta = substores.find(s => s.slug === subSlug) || null;
      if (!subMeta) {
        console.warn('Substore not found:', storeSlug, subSlug);
      }
    }

    // 4) Ürünler
    let products = [];

    if (subSlug) {
      // a) products-{storeSlug}-{subSlug}.json
      let subProducts = await fetchJSON(
        `products-${storeSlug}-${subSlug}.json`,
        { optional: true }
      );

      // b) products-{subSlug}.json (fallback)
      if (!Array.isArray(subProducts)) {
        subProducts = await fetchJSON(
          `products-${subSlug}.json`,
          { optional: true }
        );
      }

      products = Array.isArray(subProducts) ? subProducts : [];
    } else {
      // Store ana görünümü → products-{storeSlug}.json
      const storeProducts = await fetchJSON(
        `products-${storeSlug}.json`,
        { optional: true }
      );
      products = Array.isArray(storeProducts) ? storeProducts : [];
    }

    // 5) Render
    renderStoreLayout({ storeMeta, substores, subMeta, products });

    // 6) İsteğe bağlı extension hook
    if (
      window.RGZTEC_STORE_EXT &&
      typeof window.RGZTEC_STORE_EXT.init === 'function'
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

  // ---------- RENDER FONKSİYONLARI ----------

  // /store/ hub sayfası
  function renderStoreHub({ stores }) {
    document.title = 'RGZTEC • Stores';

    let html = `
      <section class="store-hero">
        <div class="hero-inner">
          <div class="hero-text">
            <span class="badge">RGZTEC</span>
            <h1>Explore all RGZTEC Stores</h1>
            <p>11+ curated stores across code, AI, design and hardware. Built for serious creators.</p>
          </div>
        </div>
      </section>
    `;

    html += `
      <section class="store-substores">
        <div class="store-section-header">
          <h2>All stores</h2>
          <span>${stores.length} stores</span>
        </div>
        <div class="substores-grid">
          ${stores.map(renderMainStoreCard).join('')}
        </div>
      </section>
    `;

    root.innerHTML = html;
  }

  function renderMainStoreCard(store) {
    const href = `${store.slug}/`; // base href /rgztec/store/ ise → /rgztec/store/{slug}/
    const title =
      store.name || store.title || slugToTitle(store.slug);
    const description =
      store.tagline ||
      store.seoDescription ||
      store.description ||
      '';
    const bannerPath = store.banner || '';
    const bannerUrl = bannerPath ? buildImageUrl(bannerPath) : '';

    return `
      <a class="substore-card" href="${href}">
        <div class="substore-banner">
          ${
            bannerUrl
              ? `<img src="${encodeURI(bannerUrl)}" alt="${escapeAttr(title + ' banner')}">`
              : ''
          }
        </div>
        <div class="substore-body">
          <h3>${escapeHTML(title)}</h3>
          <p>${description ? escapeHTML(description) : ''}</p>
        </div>
      </a>
    `;
  }

  // Tekil store / substore sayfası (Game Makers, Unity 2D vs.)
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
      '';

    const bannerPath =
      (subMeta && subMeta.banner) ||
      storeMeta.banner ||
      null;

    const bannerUrl = bannerPath ? buildImageUrl(bannerPath) : '';

    document.title = `RGZTEC • ${title}`;

    // === HERO ===
    let html = `
      <section class="store-hero">
        <div class="hero-inner">
          <div class="hero-text">
            <span class="badge">${(storeMeta.slug || 'STORE').toUpperCase()}</span>
            <h1>${escapeHTML(title)}</h1>
            <p>${description ? escapeHTML(description) : ''}</p>
            <div class="hero-tags">
              <span>Global marketplace</span>
              <span>Secure payments</span>
              <span>Instant delivery</span>
            </div>
          </div>
          <div class="hero-banner">
            ${
              bannerUrl
                ? `<img src="${encodeURI(bannerUrl)}" alt="${escapeAttr(title + ' banner')}">`
                : `<div class="hero-banner-placeholder">
                     <div class="hero-badge-line">${escapeHTML(storeMeta.name || 'Game Makers')}</div>
                     <div class="hero-banner-title">Unity &amp; Unreal kits</div>
                     <div class="hero-banner-subtitle">Game-ready assets for modern engines</div>
                   </div>`
            }
          </div>
        </div>
      </section>
    `;

    // === ARAMA ÇUBUĞU (şimdilik pasif) ===
    html += `
      <section class="store-search">
        <div class="store-search-row">
          <input
            class="store-search-input"
            type="search"
            placeholder="Search inside ${escapeAttr(title)} (coming soon)"
            disabled
          />
          <button class="store-search-button" type="button" disabled>Search</button>
        </div>
      </section>
    `;

    // === STORE ANA VIEW → SECTIONS GRID ===
    if (!subMeta) {
      if (substores && substores.length) {
        html += `
          <section class="store-substores">
            <div class="store-section-header">
              <h2>Sections</h2>
              <span>${substores.length} sections</span>
            </div>
            <div class="substores-grid">
              ${substores.map(renderSubstoreCard).join('')}
            </div>
          </section>
        `;
      } else {
        html += `
          <section class="store-substores">
            <p class="store-empty-soft">Sections coming soon.</p>
          </section>
        `;
      }
    }

    // === PRODUCT GRID ===
    let showProducts = false;

    if (subMeta && products && products.length) {
      // Substore detail ve ürün var
      showProducts = true;
    } else if (!subMeta && products && products.length && !(substores && substores.length)) {
      // Substore yoksa, store-level ürünleri göster
      showProducts = true;
    }

    if (showProducts) {
      html += `
        <section class="store-products">
          <div class="products-grid">
            ${products.map(renderProductCard).join('')}
          </div>
        </section>
      `;
    } else if (subMeta) {
      // Sadece substore detail'de, ürün yoksa mesaj göster
      html += `
        <section class="store-products">
          <p class="store-empty">No products listed in this section yet.</p>
        </section>
      `;
    }

    root.innerHTML = html;
  }

  function renderSubstoreCard(ss) {
    // /store/{storeSlug}/{slug}/ – base href zaten /rgztec/store/{storeSlug}/ ise:
    const href = `${ss.slug}/`;
    const title = ss.title || slugToTitle(ss.slug);
    const description = ss.description || '';
    const bannerPath = ss.banner || '';
    const bannerUrl = bannerPath ? buildImageUrl(bannerPath) : '';

    return `
      <a class="substore-card" href="${href}">
        <div class="substore-banner">
          ${
            bannerUrl
              ? `<img src="${encodeURI(bannerUrl)}" alt="${escapeAttr(title)}">`
              : ''
          }
        </div>
        <div class="substore-body">
          <h3>${escapeHTML(title)}</h3>
          <p>${description ? escapeHTML(description) : ''}</p>
        </div>
      </a>
    `;
  }

  function renderProductCard(p) {
    const title = p.title || '';
    const subtitle = p.subtitle || '';
    const price = p.price || '';
    const tag = p.tag || '';
    const imagePath = p.image || '';
    const imageUrl = imagePath ? buildImageUrl(imagePath) : '';

    return `
      <article class="product-card">
        <div class="product-media">
          ${
            imageUrl
              ? `<img src="${encodeURI(imageUrl)}" alt="${escapeAttr(title)}">`
              : ''
          }
        </div>
        <div class="product-body">
          <h2>${escapeHTML(title)}</h2>
          <p>${escapeHTML(subtitle)}</p>
          <div class="product-meta">
            <span class="price">${escapeHTML(price)}</span>
            ${tag ? `<span class="tag">${escapeHTML(tag)}</span>` : ''}
          </div>
        </div>
      </article>
    `;
  }
})();




