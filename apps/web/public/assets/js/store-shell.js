// ===============================
// RGZTEC STORE SHELL (tek dosya)
// ===============================

// 1) KÖK PATH
// GitHub Pages altında /rgztec altında çalışıyorsun:
const ROOT_PREFIX = "/rgztec";

// Eğer ileride lokalde kökten çalıştırırsan, şunu yaparsın:
// const ROOT_PREFIX = "";

// 2) TÜM YOLLAR BURADAN TÜRETİLİYOR
const STORE_DATA_URL    = ROOT_PREFIX + "/assets/data/store.data.json";
const STORE_BANNER_BASE = ROOT_PREFIX + "/assets/images/store/";

// Kontrol için log:
console.log("STORE_DATA_URL    =", STORE_DATA_URL);
console.log("STORE_BANNER_BASE =", STORE_BANNER_BASE);

(async function () {
  const body = document.body;
  const root = document.getElementById("store-root");

  if (!root) {
    console.error("#store-root bulunamadı.");
    return;
  }

  // HTML: <body class="store-body" data-store="hardware" data-substore="ai-accelerators">
  const storeSlug = body.dataset.store || "";
  const subSlug   = body.dataset.substore || "";

  if (!storeSlug) {
    root.innerHTML = `
      <p style="padding:1.5rem;color:#b91c1c;">
        <code>data-store</code> attribute'u tanımlı değil.
      </p>
    `;
    return;
  }

  try {
    // 3) JSON'U ÇEK
    const res = await fetch(STORE_DATA_URL + "?v=" + Date.now());
    if (!res.ok) {
      throw new Error("JSON bulunamadı: " + STORE_DATA_URL + " (status " + res.status + ")");
    }

    const data = await res.json();
    console.log("store.data.json yüklendi:", data);

    // 4) İLGİLİ STORE'U BUL
    const storeConfig = data[storeSlug];
    if (!storeConfig) {
      root.innerHTML = `
        <div style="padding:2rem;">
          <h2 style="margin:0 0 0.5rem;font-size:1.2rem;">Store bulunamadı</h2>
          <p style="margin:0;color:#6b7280;">
            <code>store.data.json</code> içinde <code>${storeSlug}</code> anahtarı yok.
          </p>
        </div>
      `;
      return;
    }

    // Substore varsa, içeriden çek (JSON yapına göre)
    let subConfig = null;
    if (subSlug && storeConfig.substores && storeConfig.substores[subSlug]) {
      subConfig = storeConfig.substores[subSlug];
    }

    const headerTitle   = subConfig?.title    || storeConfig.title   || "Store";
    const headerTagline = subConfig?.tagline  || storeConfig.tagline || "";
    const bannerImage   = subConfig?.banner   || storeConfig.banner  || "";
    const products      = (subConfig?.products || storeConfig.products || []).slice();

    // 5) HERO BÖLÜMÜ
    let bannerHtml = "";
    if (bannerImage) {
      const bannerSrc = STORE_BANNER_BASE + bannerImage;
      bannerHtml = `
        <div class="store-hero">
          <div class="store-hero-left">
            <h1 class="store-hero-title">${headerTitle}</h1>
            <p class="store-hero-tagline">${headerTagline || ""}</p>
          </div>
          <div class="store-hero-right">
            <img src="${bannerSrc}" alt="${headerTitle} banner" class="store-hero-img"/>
          </div>
        </div>
      `;
    } else {
      bannerHtml = `
        <div class="store-hero store-hero--simple">
          <h1 class="store-hero-title">${headerTitle}</h1>
          <p class="store-hero-tagline">${headerTagline || ""}</p>
        </div>
      `;
    }

    // 6) ÜRÜN KARTLARI
    let productsHtml = "";
    if (products.length) {
      productsHtml = `
        <div class="store-products">
          <div class="products-grid">
            ${products.map(p => {
              const img = p.image ? (STORE_BANNER_BASE + p.image) : "";
              return `
                <article class="product-card">
                  ${img ? `
                    <div class="product-media">
                      <img src="${img}" alt="${p.title || ""}"/>
                    </div>
                  ` : ""}
                  <div class="product-body">
                    <h3 class="product-title">${p.title || "Untitled"}</h3>
                    ${p.tagline ? `<p class="product-tagline">${p.tagline}</p>` : ""}
                    ${p.price   ? `<p class="product-price">${p.price}</p>`   : ""}
                  </div>
                </article>
              `;
            }).join("")}
          </div>
        </div>
      `;
    } else {
      productsHtml = `
        <div style="padding:2rem 0;color:#6b7280;">
          Şu anda bu store için ürün eklenmemiş.
        </div>
      `;
    }

    // 7) SAYFAYI BAS
    root.innerHTML = `
      <div class="store-page">
        ${bannerHtml}
        ${productsHtml}
      </div>
    `;

  } catch (err) {
    console.error("Store yüklenirken hata:", err);
    root.innerHTML = `
      <div style="padding:2rem;border-radius:1rem;background:#fee2e2;color:#b91c1c;">
        <strong>Bir hata oluştu.</strong><br/>
        JSON yolu veya içeriği yanlış olabilir.<br/>
        Detay için console'a bak:
        <pre style="margin-top:0.75rem;font-size:0.8rem;white-space:pre-wrap;">${String(err)}</pre>
      </div>
    `;
  }
})();









