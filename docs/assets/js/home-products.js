(function () {
  "use strict";

  // ===============================
  // RGZTEC HOME PRODUCTS (AWS Amplify Safe)
  // - Reads from /data/store.data.json (static)
  // - Survives SPA rewrites (detects HTML)
  // - Extracts stores from different schemas
  // ===============================

  // 1) BASE (GH Pages + Amplify compatible)
  function resolveBase() {
    const meta = document.querySelector('meta[name="rgz-base"]');
    if (meta?.content) return String(meta.content).trim().replace(/\/+$/, "");

    const p = location.pathname || "/";
    // GitHub Pages alt path (opsiyonel)
    return p.includes("/rgztec/") ? "/rgztec" : "";
  }

  const BASE = resolveBase();
  const withBase = (p) => (BASE ? `${BASE}${p}` : p);

  const enc = (s) => encodeURIComponent(String(s ?? ""));
  const STORE_URL = (slug) => withBase(`/store/${enc(slug)}/`);
  const STORE_SECTION_URL = (storeSlug, sectionSlug) =>
    withBase(`/store/${enc(storeSlug)}/${enc(sectionSlug)}/`);

  const ASSET_URL = (p) => withBase(`/assets/${String(p ?? "").replace(/^\/+/, "")}`);
  const STORE_IMAGE_BASE = ASSET_URL("images/store/");
  const PLACEHOLDER_IMG = ASSET_URL("images/placeholder.png");

  // ✅ Amplify’de önerilen: static data
  const DATA_URL = withBase("/data/store.data.json");

  // 2) BOOT
  document.addEventListener("DOMContentLoaded", () => {
    boot().catch((err) => console.error("RGZTEC Home boot error:", err));
  });

  async function boot() {
    const result = await fetchJsonSafe(DATA_URL);
    const stores = extractStores(result);

    if (!stores.length) {
      // minimum teşhis mesajı
      console.warn("RGZTEC: stores boş. (Data path veya schema kontrol)");
      showEmptyState();
      initSearchEngine(); // arama yine çalışsın
      return;
    }

    renderGallery(stores);
    renderSubNav(stores);
    initMegaMenu(stores);
    initSearchEngine();

    console.log(`RGZTEC: ${stores.length} stores loaded. BASE="${BASE}" DATA="${DATA_URL}"`);
  }

  // 3) FETCH (Amplify rewrite-safe)
  async function fetchJsonSafe(url) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);

    try {
      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: ctrl.signal,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
      }

      const ct = (res.headers.get("content-type") || "").toLowerCase();
      const text = await res.text();

      // 🔥 Amplify SPA rewrite data'yı yutarsa HTML döner. Burada yakalıyoruz.
      const looksLikeHtml = /<html|<!doctype/i.test(text);
      if (looksLikeHtml) {
        throw new Error(
          `Data route got HTML (SPA rewrite). Fix Amplify rewrites to bypass /data/*. URL=${url}`
        );
      }

      // JSON parse
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(`JSON parse failed. First 120 chars: ${text.slice(0, 120)}`);
      }
    } finally {
      clearTimeout(t);
    }
  }

  // 4) STORE EXTRACT (senin "tek beyin" şema toleranslı)
  function extractStores(result) {
    if (!result || typeof result !== "object") return [];

    // 1) klasik: { stores: [] }
    if (Array.isArray(result.stores)) return normalizeStores(result.stores);
    if (Array.isArray(result.data?.stores)) return normalizeStores(result.data.stores);

    // 2) muhtemel RGZTEC şemaları
    const arrCandidates = [
      result.root?.stores,
      result.catalog?.stores,
      result.market?.stores,
      result.tree?.stores,
      result.nav?.stores,
      result.storesIndex,
    ].filter(Boolean);

    for (const c of arrCandidates) {
      if (Array.isArray(c)) return normalizeStores(c);
    }

    // 3) map: { "slug": {...}, ... }
    const mapCandidates = [
      result.root?.storesMap,
      result.catalog?.storesMap,
      result.storesMap,
      result.stores, // bazen object map oluyor
    ].filter(Boolean);

    for (const m of mapCandidates) {
      if (m && typeof m === "object" && !Array.isArray(m)) {
        return normalizeStores(Object.values(m));
      }
    }

    // 4) Son çare: "stores" string key’li objeler içinde tarama
    // (çok düşük ihtimal, ama kurtarıcı)
    for (const k of Object.keys(result)) {
      const v = result[k];
      if (v && typeof v === "object") {
        if (Array.isArray(v?.stores)) return normalizeStores(v.stores);
        if (v?.storesMap && typeof v.storesMap === "object") return normalizeStores(Object.values(v.storesMap));
      }
    }

    return [];
  }

  function normalizeStores(arr) {
    return (arr || [])
      .filter(Boolean)
      .map((s) => ({
        slug: String(s.slug ?? s.id ?? "").trim(),
        title: String(s.title ?? s.name ?? "Untitled Store").trim(),
        tagline: String(s.tagline ?? s.description ?? "").trim(),
        isFeatured: Boolean(s.isFeatured ?? s.featured),
        sections: Array.isArray(s.sections) ? s.sections : [],
      }))
      .filter((s) => s.slug);
  }

  // 5) UI RENDER
  function renderGallery(data) {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;

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
      img.addEventListener("error", () => (img.src = PLACEHOLDER_IMG));

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
      .slice(0, 30) // subnav çok şişmesin
      .map(
        (s) =>
          `<div class="sub-nav-item"><a href="${STORE_URL(s.slug)}">${escapeHtml(s.title)}</a></div>`
      )
      .join("");
  }

  function initMegaMenu(data) {
    const listEl = document.getElementById("categories-list");
    const detailEl = document.getElementById("categories-detail");
    const btn = document.getElementById("btn-categories");
    const header = document.querySelector(".app-header");
    if (!listEl || !detailEl || !btn || !header) return;

    listEl.innerHTML = data
      .map(
        (s, i) => `
      <button class="cat-item ${i === 0 ? "cat-item--active" : ""}" type="button" data-slug="${escapeAttr(
          s.slug
        )}">
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

    listEl.querySelectorAll(".cat-item").forEach((item) => {
      item.addEventListener("mouseenter", () => setActive(item.dataset.slug));
      item.addEventListener("click", () => setActive(item.dataset.slug));
    });

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      header.classList.toggle("has-cat-open");
    });

    // outside click close
    document.addEventListener("click", (e) => {
      if (!header.classList.contains("has-cat-open")) return;
      if (!header.contains(e.target)) header.classList.remove("has-cat-open");
    });

    // esc close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") header.classList.remove("has-cat-open");
    });
  }

  function renderDetail(store, container) {
    if (!store || !container) return;

    const title = store.title || "Untitled Store";
    const subtitle = store.tagline || "Browse all sections and featured items.";

    const links = (store.sections || [])
      .slice(0, 10)
      .map((sec) => {
        const name = String(sec?.name ?? sec?.title ?? "").trim();
        if (!name) return "";
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

  // 6) SEARCH
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

  // 7) EMPTY STATE (opsiyonel)
  function showEmptyState() {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;
    gallery.innerHTML = `
      <div style="padding:32px; border:1px solid #eee; border-radius:16px; background:#fff;">
        <div style="font-weight:700; font-size:18px; margin-bottom:6px;">Stores are not loading</div>
        <div style="opacity:.75; line-height:1.5;">
          Check <code>/data/store.data.json</code> is reachable and Amplify rewrites bypass <code>/data/*</code>.
        </div>
      </div>
    `;
  }

  // 8) HELPERS
  function escapeHtml(str) {
    const p = document.createElement("p");
    p.textContent = String(str ?? "");
    return p.innerHTML;
  }

  function escapeAttr(str) {
    return String(str ?? "").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function cssEscape(str) {
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


