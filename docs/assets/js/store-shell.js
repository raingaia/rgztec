// /rgztec/assets/js/store-shell.js
// RGZTEC STORE CORE SHELL – Store ana sayfaları (Game Makers vs.)

(async function () {
  const body = document.body;
  const root = document.getElementById("store-root");

  if (!root) {
    console.error("#store-root element not found.");
    return;
  }

  const pageType  = body.dataset.page || "store";  // şimdilik sadece store
  const storeSlug = body.dataset.store || "";
  const subSlug   = body.dataset.substore || "";

  const DATA_BASE = (body.dataset.dataPath || "/rgztec/data").replace(/\/+$/, "") + "/";
  const IMAGE_BASE = (body.dataset.imageBase || "/rgztec/assets/images/store").replace(/\/+$/, "") + "/";

  // --------- HELPERS ---------

  async function fetchJSON(path, { optional = false } = {}) {
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
      console.error(err);
      if (!optional) throw err;
      return null;
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

  function slugToTitle(slug) {
    return String(slug || "")
      .split("-")
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function buildImageUrl(relativePath) {
    if (!relativePath) return "";
    if (/^https?:\/\//.test(relativePath) || relativePath.startsWith("/")) {
      return relativePath;
    }
    return IMAGE_BASE + relativePath.replace(/^\/+/, "");
  }

  // --------- MAIN FLOW ---------

  try {
    if (!storeSlug) {
      throw new Error("data-store attribute is missing on <body>.");
    }

    // 1) tüm mağazalar
    const stores = await fetchJSON("stores.json");
    if (!Array.isArray(stores)) {
      throw new Error("stores.json did not return an array");
    }

    // 2) aktif store meta
    const storeMeta = stores.find(s => s.slug === storeSlug) || {
      slug: storeSlug,
      name: slugToTitle(storeSlug),
      tagline: "",
    };

    // 3) substores (sections)
    let substores = [];
    const perStoreSub = await fetchJSON(`substores-${storeSlug}.json`, { optional: true });
    if (Array.isArray(perStoreSub)) {
      substores = perStoreSub;
    } else {
      const allSub = await fetchJSON("substores.json", { optional: true });
      if (Array.isArray(allSub)) {
        substores = allSub.filter(s => s.parent === storeSlug);
      }
    }

    // Şimdilik sadece store ana sayfasını çiziyoruz
    renderStoreHome({ storeMeta, substores });

  } catch (err) {
    console.error(err);
    root.innerHTML =
      `<p class="store-error">Store could not be loaded. Please try again later.</p>`;
  }

  // --------- RENDER FUNCTIONS ---------

  function renderStoreHome({ storeMeta, substores }) {
    const title =
      storeMeta.name ||
      storeMeta.title ||
      slugToTitle(storeMeta.slug);

    const description =
      storeMeta.tagline ||
      storeMeta.seoDescription ||
      storeMeta.description ||
      "";

    const bannerPath = storeMeta.banner || "";
    const bannerUrl = bannerPath ? buildImageUrl(bannerPath) : "";

    document.title = `RGZTEC • ${title}`;

    let html = "";

    // HERO
    html += `
      <section class="store-hero">
        <div class="hero-inner">
          <div class="hero-left">
            <div class="badge">${(storeMeta.slug || "STORE").toUpperCase()}</div>
            <h1>${escapeHTML(title)}</h1>
            <p>${description ? escapeHTML(description) : ""}</p>
            <div class="store-meta-chips">
              <span class="store-chip">Global marketplace</span>
              <span class="store-chip">Secure payments</span>
              <span class="store-chip">Instant delivery</span>
            </div>
          </div>
          <div class="hero-right">
            ${bannerUrl
              ? `<img class="hero-banner-img"
                       src="${encodeURI(bannerUrl)}"
                       alt="${escapeAttr(title + ' banner')}">`
              : `<div class="hero-right-fallback">GAME MAKERS</div>`}
          </div>
        </div>
      </section>
    `;

    // TOOLBAR (search UI – şimdilik sadece görünüm)
    html += `
      <section class="store-toolbar">
        <div class="store-search">
          <input type="text"
                 placeholder="Search inside ${escapeAttr(title)} (coming soon)"
                 disabled>
          <button type="button" disabled>Search</button>
        </div>
        <div class="store-toolbar-meta">
          ${substores.length ? `${substores.length} sections` : "Sections coming soon"}
        </div>
      </section>
    `;

    // SECTIONS GRID
    if (substores && substores.length) {
      html += `
        <section class="store-substores">
          <div class="store-substores-header">
            <h2>Sections</h2>
            <span>${substores.length} sections</span>
          </div>
          <div class="substores-grid">
            ${substores.map(renderSubstoreCard).join("")}
          </div>
        </section>
      `;
    }

    // Şimdilik ürün yok → boş mesaj (ileri aşamada dolduracağız)
    html += `
      <section class="store-products">
        <p class="store-empty">No products listed on this store view yet. Sections will contain products.</p>
      </section>
    `;

    root.innerHTML = html;
  }

  function renderSubstoreCard(ss) {
    const href = `${ss.slug}/`; // /store/{storeSlug}/{subSlug}/
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
              : `<span style="font-size:.78rem;color:rgba(148,163,184,.8);letter-spacing:.12em;text-transform:uppercase;">${escapeHTML(title)}</span>`
          }
        </div>
        <div class="substore-body">
          <h3>${escapeHTML(title)}</h3>
          <p>${description ? escapeHTML(description) : ""}</p>
        </div>
      </a>
    `;
  }

})();




