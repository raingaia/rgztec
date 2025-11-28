// /rgztec/assets/js/store-shell.js
// RGZTEC STORE SHELL – tüm mağaza index & listing sayfaları için ortak JS

(function () {
  const DATA_BASE = "/rgztec/data";
  const IMG_BASE  = "/rgztec/assets/images/store";

  const body = document.body;

  function getQueryParam(key) {
    return new URLSearchParams(window.location.search).get(key) || "";
  }

  function getStoreSlug() {
    // 1) body data-store, 2) URL ?store=
    return body.dataset.store || getQueryParam("store") || "";
  }

  function getSubstoreSlug() {
    // 1) body data-substore, 2) URL ?shop=
    return body.dataset.substore || getQueryParam("shop") || "";
  }

  async function fetchJSON(fileName, optional = false) {
    const url = `${DATA_BASE}/${fileName}?v=${Date.now()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (optional) return null;
        throw new Error("Fetch failed " + res.status + " for " + url);
      }
      return await res.json();
    } catch (err) {
      console.error("[store-shell] JSON error:", fileName, err);
      return optional ? null : null;
    }
  }

  /* ==========================================================
     STORE INDEX (örnek: /rgztec/store/game-makers/)
     — .substores-grid içini JSON'dan doldurur
     ========================================================== */
  async function initStoreIndex() {
    const storeSlug = getStoreSlug();
    if (!storeSlug) return;

    const grid = document.querySelector(".substores-grid");
    if (!grid) return;

    const allSubstores = await fetchJSON("substores.json");
    if (!allSubstores || !Array.isArray(allSubstores)) return;

    const rows = allSubstores.filter((s) => s.parent === storeSlug);
    if (!rows.length) return;

    // Eski statik kartları temizle
    grid.innerHTML = "";

    rows.forEach((sub) => {
      const imgPath = sub.banner
        ? `${IMG_BASE}/${sub.banner}`
        : `${IMG_BASE}/placeholder.webp`;

      const href = `/rgztec/store/listing.html?store=${encodeURIComponent(
        storeSlug
      )}&shop=${encodeURIComponent(sub.slug)}`;

      const cardHtml = `
        <a href="${href}" class="substore-card">
          <div class="substore-banner">
            <img src="${imgPath}" alt="${sub.title}">
          </div>
          <div class="substore-body">
            <h3>${sub.title}</h3>
            <p>${sub.description || ""}</p>
          </div>
        </a>
      `;

      grid.insertAdjacentHTML("beforeend", cardHtml);
    });
  }

  /* ==========================================================
     LISTING SAYFASI (örnek: /rgztec/store/listing.html?store=game-makers&shop=unity-2d)
     — products-*.json'dan ürün kartlarını doldurmak için iskelet
     ========================================================== */
  async function initListingPage() {
    const storeSlug = getStoreSlug();
    if (!storeSlug) return;

    const shopSlug = getSubstoreSlug(); // unity-2d, unity-3d, vb.
    const productsContainer = document.querySelector(".products-grid");
    if (!productsContainer) return;

    // hangi JSON?
    const fileName = shopSlug
      ? `products-${storeSlug}-${shopSlug}.json`
      : `products-${storeSlug}.json`;

    const products = await fetchJSON(fileName, true);
    if (!products || !Array.isArray(products) || !products.length) {
      productsContainer.innerHTML =
        '<p class="products-empty">Products will be added soon.</p>';
      return;
    }

    productsContainer.innerHTML = "";

    products.forEach((p) => {
      const img = p.image
        ? `${IMG_BASE}/${p.image}`
        : `${IMG_BASE}/product-placeholder.webp`;

      const cardHtml = `
        <article class="product-card">
          <div class="product-thumb">
            <img src="${img}" alt="${p.title}">
          </div>
          <div class="product-body">
            <h3 class="product-title">${p.title}</h3>
            <p class="product-desc">${p.description || ""}</p>
            <div class="product-meta">
              ${
                p.price
                  ? `<span class="product-price">${p.price}</span>`
                  : ""
              }
              ${
                p.tagline
                  ? `<span class="product-tagline">${p.tagline}</span>`
                  : ""
              }
            </div>
          </div>
        </article>
      `;

      productsContainer.insertAdjacentHTML("beforeend", cardHtml);
    });
  }

  /* ==========================================================
     SEARCH – store index'teki arama çubuğu listing.html'e yönlendirsin
     (input üzerinde disabled kaldırınca çalışır)
     ========================================================== */
  function initStoreSearch() {
    const input = document.querySelector(".store-search-input");
    const button = document.querySelector(".store-search-button");
    const storeSlug = getStoreSlug();
    if (!input || !button || !storeSlug) return;

    if (input.disabled) return; // şimdilik "coming soon" ise dokunma

    const goSearch = () => {
      const q = input.value.trim();
      if (!q) return;
      const url =
        `/rgztec/store/listing.html?store=${encodeURIComponent(
          storeSlug
        )}&q=${encodeURIComponent(q)}`;
      window.location.href = url;
    };

    button.addEventListener("click", goSearch);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        goSearch();
      }
    });
  }

  /* ==========================================================
     ENTRYPOINT
     ========================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    const isListing = body.dataset.page === "store-listing";

    if (isListing) {
      initListingPage().catch(console.error);
    } else {
      initStoreIndex().catch(console.error);
      initStoreSearch();
    }
  });
})();






