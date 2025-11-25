// apps/web/public/store/core/assets/js/store-shell.js

(async function () {
  const body = document.body;
  const root = document.getElementById("store-root");

  // HTML'de set ettiğimiz attributelar:
  // <body data-store="hardware" data-substore="ai-accelerators">
  const storeSlug = body.dataset.store;        // örn: "hardware"
  const subSlug = body.dataset.substore || ""; // örn: "ai-accelerators" veya ""

  if (!storeSlug) {
    root.innerHTML = "<p class='store-error'>Store is not configured.</p>";
    return;
  }

  async function fetchJSON(path) {
    // Cache sorunu yaşamamak için hafif bir cache-buster ekliyoruz
    const res = await fetch(path + "?v=" + Date.now());
    if (!res.ok) throw new Error("Fetch failed: " + path);
    return res.json();
  }

  try {
    // 1) Ana mağaza meta datası
    const stores = await fetchJSON("core/data/stores.json");
    const storeMeta = stores.find(s => s.slug === storeSlug);

    if (!storeMeta) {
      throw new Error("Store not found: " + storeSlug);
    }

    // 2) Alt mağaza meta datası (varsa)
    let subMeta = null;
    if (subSlug) {
      const substores = await fetchJSON("core/data/substores.json");
      subMeta = substores.find(
        s => s.store === storeSlug && s.slug === subSlug
      );
      if (!subMeta) {
        throw new Error("Substore not found: " + storeSlug + "/" + subSlug);
      }
    }

    // 3) Ürün datası
    // - Sadece ana mağaza:  core/data/products-hardware.json
    // - Alt mağaza varsa:  core/data/products-hardware-ai-accelerators.json
    let products = [];
    if (subSlug) {
      products = await fetchJSON(
        `core/data/products-${storeSlug}-${subSlug}.json`
      );
    } else {
      products = await fetchJSON(`core/data/products-${storeSlug}.json`);
    }

    // 4) Layout çizimi
    renderLayout({ storeMeta, subMeta, products });

    // 5) Geliştirmelere açık HOOK (mağaza bazlı ekstra JS için)
    // İstersen her mağazanın index.html'ine ayrı bir JS daha dahil eder,
    // orada window.RGZTEC_STORE_EXT.init(context) ile ek özellik yazarsın.
    if (
      window.RGZTEC_STORE_EXT &&
      typeof window.RGZTEC_STORE_EXT.init === "function"
    ) {
      window.RGZTEC_STORE_EXT.init({
        store: storeMeta,
        substore: subMeta,
        products,
        root
      });
    }
  } catch (err) {
    console.error(err);
    root.innerHTML =
      "<p class='store-error'>Store could not be loaded. Please try again later.</p>";
  }

  function renderLayout({ storeMeta, subMeta, products }) {
    const title = subMeta ? subMeta.title : storeMeta.title;
    const description = subMeta ? subMeta.description : storeMeta.description;
    const banner = subMeta ? subMeta.banner : storeMeta.banner;

    document.title = `RGZTEC • ${title}`;

    root.innerHTML = `
      <section class="store-hero">
        <div class="hero-inner">
          <div class="hero-text">
            <span class="badge">${storeSlug.toUpperCase()}</span>
            <h1>${title}</h1>
            <p>${description || ""}</p>
          </div>
          <div class="hero-banner">
            <img src="${banner}" alt="${title} banner"/>
          </div>
        </div>
      </section>

      <section class="store-products">
        ${
          products && products.length
            ? `
          <div class="products-grid">
            ${products
              .map(
                (p) => `
              <article class="product-card">
                <div class="product-media">
                  <img src="${p.image}" alt="${p.title}">
                </div>
                <div class="product-body">
                  <h2>${p.title}</h2>
                  <p>${p.subtitle || ""}</p>
                  <div class="product-meta">
                    <span class="price">${p.price || ""}</span>
                    ${
                      p.tag
                        ? `<span class="tag">${p.tag}</span>`
                        : ""
                    }
                  </div>
                </div>
              </article>
            `
              )
              .join("")}
          </div>
        `
            : `<p class="store-error">No products found in this store yet.</p>`
        }
      </section>
    `;
  }
})();
