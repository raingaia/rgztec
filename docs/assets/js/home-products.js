(function () {
  "use strict";

  // -----------------------------
  // 1) BASE & PATH CONFIG (AUTO)
  // -----------------------------
  const resolveBase = () => {
    // 1) meta override varsa onu kullan
    const meta = document.querySelector('meta[name="rgz-base"]');
    if (meta && meta.content != null) return String(meta.content).trim().replace(/\/+$/, "");

    // 2) otomatik yakalama: /rgztec/ altında mı?
    const p = location.pathname || "/";
    // örn: https://domain.com/rgztec/index.html  => base "/rgztec"
    const m = p.match(/^\/([^/]+)(\/|$)/);
    const top = m ? `/${m[1]}` : "";
    // İstersen burada whitelist yap: sadece "/rgztec" ise base al
    if (top === "/rgztec") return "/rgztec";

    return "";
  };

  const BASE = resolveBase();
  const withBase = (p) => (BASE ? `${BASE}${p}` : p);
  const enc = (s) => encodeURIComponent(String(s ?? ""));

  // URL Helpers
  const STORE_URL = (slug) => withBase(`/store/${enc(slug)}/`);
  const STORE_SECTION_URL = (storeSlug, sectionSlug) =>
    withBase(`/store/${enc(storeSlug)}/${enc(sectionSlug)}/`);

  const ASSET_URL = (p) => withBase(`/assets/${String(p ?? "").replace(/^\/+/, "")}`);
  const STORE_IMAGE_BASE = ASSET_URL("images/store/");
  const PLACEHOLDER_IMG = ASSET_URL("images/placeholder.png");

  // API
  const CATALOG_URL = withBase("/api/catalog.json");

  // -----------------------------
  // 2) BOOT
  // -----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    boot().catch((err) => console.error("RGZTEC boot error:", err));
  });

  async function boot() {
    const stores = await loadCatalogStores(CATALOG_URL);

    if (stores.length > 0) {
      renderGallery(stores);
      renderSubNav(stores);
      initMegaMenu(stores);
    } else {
      console.warn("RGZTEC: stores boş geldi.");
    }

    initSearchEngine();
    console.log(`RGZTEC: ${stores.length} mağaza yüklendi. BASE="${BASE}"`);
  }

  // -----------------------------
  // 3) DATA LOAD (SAFE)
  // -----------------------------
  async function loadCatalogStores(url) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000); // 12s timeout

    try {
      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: ctrl.signal,
        headers: { "Accept": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`catalog fetch failed: ${res.status} ${res.statusText}`);
      }

      const result = await res.json().catch(() => ({}));
      const stores = Array.isArray(result?.stores)
        ? result.stores
        : Array.isArray(result?.data?.stores)
          ? result.data.stores
          : [];

      // normalize / temizle
      return stores
        .filter(Boolean)
        .map((s) => ({
          slug: String(s.slug ?? "").trim(),
          title: String(s.title ?? s.name ?? "Untitled Store").trim(),
          tagline: String(s.tagline ?? s.description ?? "").trim(),
          isFeatured: Boolean(s.isFeatured),
          sections: Array.isArray(s.sections) ? s.sections : [],
        }))
        .filter((s) => s.slug); // slug olmayanı at
    } finally {
      clearTimeout(t);
    }
  }

  // -----------------------------
  // 4) UI RENDER
  // -----------------------------
  function renderGallery(data) {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    // Daha stabil ve hızlı: fragment ile bas
    const frag = document.createDocumentFragment();

    data.forEach((store) => {
      const article = document.createElement("article");
      article.className = `card ${store.isFeatured ? "card--featured" : ""}`.trim();

      const aMedia = document.createElement("a");
      aMedia.className = "card-media";
      aMedia.href = STORE_URL(store.slug);

      const img = document.createElement("img");
      img.src = `${STORE_IMAGE_BASE}${store.slug}.webp`;
      img.alt = store.title || "Store";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => {
        img.src = PLACEHOLDER_IMG;
      });

      aMedia.appendChild(img);

      const content = document.createElement("div");
      content.className = "card-content";

      const h3 = document.createElement("h3");
      h3.className = "card-title";
      h3.textContent = store.title || "Untitled Store";

      const p = document.createElement("p");
      p.className = "card-desc";
      p.textContent = store.tagline || "Explore curated products, tools, and resources.";

      const aLink = document.createElement("a");
      aLink.className = "card-link";
      aLink.href = STORE_URL(store.slug);
      aLink.textContent = "Visit Store →";

      content.appendChild(h3);
      content.appendChild(p);
      content.appendChild(aLink);

      article.appendChild(aMedia);
      article.appendChild(content);

      frag.appendChild(article);
    });

    gallery.innerHTML = "";
    gallery.appendChild(frag);
  }

  function renderSubNav(data) {
    const list = document.getElementById("sub-nav-list");
    if (!list) return;

    list.innerHTML = data
      .map(
        (s) =>
          `<div class="sub-nav-item">
             <a href="${STORE_URL(s.slug)}">${escapeHtml(s.title)}</a>
           </div>`
      )
      .join("");
  }

  // -----------------------------
  // 5) MEGA MENU (FIX + CLOSE)
  // -----------------------------
  function initMegaMenu(data) {
    const listEl = document.getElementById("categories-list");
    const detailEl = document.getElementById("categories-detail");
    const btn = document.getElementById("btn-categories");
    const header = document.querySelector(".app-header");
    if (!listEl || !detailEl || !btn || !header) return;

    listEl.innerHTML = data
      .map(
        (s, i) => `
        <button class="cat-item ${i === 0 ? "cat-item--active" : ""}" type="button" data-slug="${escapeAttr(s.slug)}">
          <span>${escapeHtml(s.title)}</span>
        </button>`
      )
      .join("");

    renderDetail(data[0], detailEl);

    const setActive = (slug) => {
      listEl.querySelectorAll(".cat-item").forEach((b) => b.classList.remove("cat-item--active"));
      const btnEl = listEl.querySelector(`.cat-item[data-slug="${cssEscape(slug)}"]`);
      if (btnEl) btnEl.classList.add("cat-item--active");
      const store = data.find((x) => x.slug === slug);
      if (store) renderDetail(store, detailEl);
    };

    // Hover + click destekle (mobilde hover yok)
    listEl.querySelectorAll(".cat-item").forEach((item) => {
      item.addEventListener("mouseenter", () => setActive(item.dataset.slug));
      item.addEventListener("click", () => setActive(item.dataset.slug));
    });

    // Toggle
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      header.classList.toggle("has-cat-open");
      btn.setAttribute("aria-expanded", header.classList.contains("has-cat-open") ? "true" : "false");
    });

    // Dışarı tıkla kapan
    document.addEventListener("click", (e) => {
      if (!header.classList.contains("has-cat-open")) return;
      const isInside = header.contains(e.target);
      if (!isInside) header.classList.remove("has-cat-open");
      btn.setAttribute("aria-expanded", "false");
    });

    // ESC ile kapan
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && header.classList.contains("has-cat-open")) {
        header.classList.remove("has-cat-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  function renderDetail(store, container) {
    if (!store || !container) return;

    const title = store.title || "Untitled Store";
    const subtitle = store.tagline || "Browse all sections and featured items.";

    const links = (store.sections || [])
      .slice(0, 10) // aşırı şişmesin
      .map((sec) => {
        const name = String(sec?.name ?? sec?.title ?? "").trim();
        if (!name) return "";
        // sectionSlug varsa onu kullan; yoksa isimden üret
        const sectionSlug = String(sec?.slug ?? "").trim() || slugify(name);
        return `<a href="${STORE_SECTION_URL(store.slug, sectionSlug)}">${escapeHtml(name)}</a>`;
      })
      .filter(Boolean)
      .join("");

    container.innerHTML = `
      <div class="cat-detail-title">${escapeHtml(title)}</div>
      <div class="cat-detail-subtitle">${escapeHtml(subtitle)}</div>
      <div class="cat-detail-links">
        ${links || ""}
        <a href="${STORE_URL(store.slug)}">View All</a>
      </div>`;
  }

  // -----------------------------
  // 6) SEARCH
  // -----------------------------
  function initSearchEngine() {
    const input = document.querySelector(".search-input");
    const btn = document.querySelector(".search-btn");
    if (!input || !btn) return;

    const run = () => {
      const q = input.value.trim();
      if (!q) return;
      window.location.href = withBase(`/search.html?q=${enc(q)}`);
    };

    btn.addEventListener("click", run);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") run();
    });
  }

  // -----------------------------
  // 7) HELPERS
  // -----------------------------
  function escapeHtml(str) {
    const p = document.createElement("p");
    p.textContent = String(str ?? "");
    return p.innerHTML;
  }

  function escapeAttr(str) {
    return String(str ?? "").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function cssEscape(str) {
    // basit css selector escape
    return String(str ?? "").replace(/["\\]/g, "\\$&");
  }

  function slugify(s) {
    return String(s ?? "")
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
})();

