/* RGZTEC HOME – FINAL (Header Stores + Gallery Cards + Categories + Search)
   - Stores data: PUBLIC.stores => /data/store.data.json
   - Header sub-nav: fills #sub-nav-list
   - Gallery: fills #gallery with YOUR Etsy CSS classes (.card, .card-media, ...)
   - Categories: API.categories => /api/categories
   - Search: API.search => /api/search?q=
*/

(() => {
  "use strict";

  // ---- 0) Bridge guard ----
  const B = window.RGZ || window.rgz || {
  env: "docs",
  PUBLIC: { stores: "/data/store.data.json" },
  URLS: {
    STORE: (slug) => `/store/${encodeURIComponent(slug)}/`,
    ASSET: (p) => p
  },
  withBase: (p) => p
};
window.RGZ = window.RGZ || B;


  const $ = (sel, root = document) => root.querySelector(sel);

  // ---- 1) Helpers ----
  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
  }

  function safeText(v, fallback = "") {
    return v == null ? fallback : String(v);
  }

  function isObject(v) {
    return v && typeof v === "object" && !Array.isArray(v);
  }

  function normalizeURL(u) {
    if (!u) return "";
    const s = String(u).trim();
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("/") && typeof B.withBase === "function") return B.withBase(s);
    return s;
  }

     // ---- IMAGE RESOLVER (Store-Shell ile birebir) ----
  function resolveImage(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("/")) return s;
    return "/assets/images/store/" + s.replace(/^\/+/, "");
  }
 
  // ---- 2) Store Data (single load shared) ----
  let storeDataPromise = null;

  function getStoreDataURL() {
    const raw = (B.PUBLIC && B.PUBLIC.stores) ? B.PUBLIC.stores : "/data/store.data.json";
    return normalizeURL(raw) || (typeof B.withBase === "function" ? B.withBase("/data/store.data.json") : "/data/store.data.json");
  }

 function normalizeStoresToEntries(data) {
  if (!data || typeof data !== "object") return [];

  // store.data.json formatı:
  // { "game-makers": { ... }, "ai-tools": { ... } }
  return Object.entries(data);
}

  async function loadStoresOnce() {
    if (storeDataPromise) return storeDataPromise;

    const url = getStoreDataURL();
    console.log("[HOME] storeDataURL =", url);

    storeDataPromise = (async () => {
      const data = await fetchJSON(url);
      const entries = normalizeStoresToEntries(data);
      return { url, data, entries };
    })();

    return storeDataPromise;
  }

  // ---- 3) HEADER STORES (Sub-nav) ----
  async function renderHeaderStores() {
    const subNav = $("#sub-nav-list");
    if (!subNav) return;

    subNav.innerHTML = `<span style="opacity:.7;font-weight:800;">Loading…</span>`;

    try {
      const { entries } = await loadStoresOnce();

      if (!entries.length) {
        subNav.innerHTML = `<span style="opacity:.7;font-weight:800;">No stores.</span>`;
        return;
      }

      // Sort by title for clean corporate nav
      const sorted = entries.slice().sort((a, b) => {
        const at = safeText(a[1]?.title, a[0]).toLowerCase();
        const bt = safeText(b[1]?.title, b[0]).toLowerCase();
        return at.localeCompare(bt);
      });

      subNav.innerHTML = "";
      const frag = document.createDocumentFragment();

      for (const [slug, store] of sorted) {
        const a = document.createElement("a");
        a.className = "sub-nav-item"; // ✅ CSS patch targets this directly
        a.href = (B.URLS?.STORE ? B.URLS.STORE(slug) : `./store/${encodeURIComponent(slug)}/`);
        a.textContent = safeText(store?.title, slug);

        frag.appendChild(a);
      }

      subNav.appendChild(frag);
    } catch (e) {
      console.error("[HOME] Header stores error:", e);
      subNav.innerHTML = `<span style="opacity:.75;font-weight:800;">Stores failed to load.</span>`;
    }
  }

  // ---- 4) GALLERY (Explore Stores) ----
  async function renderGallery() {
    const grid = $("#gallery");
    if (!grid) return;

    grid.innerHTML = `<div style="padding:16px;color:#6b7280;font-weight:800;">Loading stores…</div>`;

    try {
      const { entries } = await loadStoresOnce();

      if (!entries.length) {
        grid.innerHTML = `<div style="padding:16px;color:#6b7280;font-weight:800;">No stores found.</div>`;
        return;
      }

      grid.innerHTML = "";

      for (const [slug, store] of entries) {
        const title = safeText(store?.title, slug);
        const tagline = safeText(store?.tagline, "");
        const banner = safeText(store?.banner, "");

        const href = (B.URLS?.STORE ? B.URLS.STORE(slug) : `./store/${encodeURIComponent(slug)}/`);

        const bannerSrc = banner
          ? (B.URLS?.ASSET ? B.URLS.ASSET(`/images/store/${banner}`) : `assets/images/store/${banner}`)
          : "assets/images/banners/global-marketplace-banner.webp";

        const isHardware = (store && store.kind === "hardware") || /hardware/i.test(slug) || /hardware/i.test(title);

        // ✅ Uses YOUR Etsy card CSS (.card, .card-media, .card-content...)
        const card = document.createElement("a");
        card.href = href;
        card.className = "card" + (isHardware ? " card--hardware" : "");

        card.innerHTML = `
          <div class="card-media">
            <img src="${bannerSrc}" alt="${title}" loading="lazy">
          </div>

          <div class="card-content">
            <div class="card-badge">${isHardware ? "HARDWARE STORE" : "OFFICIAL STORE"}</div>
            <div class="card-title">${title}</div>
            <div class="card-desc">
              ${tagline || (isHardware
                ? "AI accelerators, dev boards, embedded kits and edge devices."
                : "Premium templates, UI kits, components and tools.")}
            </div>
            <div class="card-link">Explore store</div>
          </div>
        `;

        grid.appendChild(card);
      }
    } catch (e) {
      console.error("[HOME] Gallery error:", e);
      grid.innerHTML = `
        <div style="padding:16px;border:1px solid rgba(0,0,0,.08);border-radius:12px;background:#fff;">
          <b>Stores failed to load.</b><br>
          <span style="color:#6b7280;font-weight:700;">Check Console/Network: storeDataURL + HTTP status.</span>
        </div>`;
    }
  }

  // ---- 5) CATEGORIES PANEL (API live) ----
  async function renderCategoriesPanel() {
    const list = $("#categories-list");
    const detail = $("#categories-detail");
    if (!list || !detail) return;

    const catURL = B.API?.categories;
    if (!catURL) {
      console.error("[HOME] API.categories not defined in bridge");
      list.innerHTML = `<div style="padding:12px;color:#6b7280;font-weight:800;">Categories API missing.</div>`;
      return;
    }

    let cats;
    try {
      cats = await fetchJSON(catURL);
    } catch (e) {
      console.error("[HOME] Categories fetch error:", e);
      list.innerHTML = `<div style="padding:12px;color:#6b7280;font-weight:800;">Categories failed to load.</div>`;
      detail.innerHTML = "";
      return;
    }

    const categories = (cats && Array.isArray(cats.categories)) ? cats.categories : [];
    if (!categories.length) {
      list.innerHTML = `<div style="padding:12px;color:#6b7280;font-weight:800;">No categories.</div>`;
      detail.innerHTML = "";
      return;
    }

    function setActive(idx) {
      const cat = categories[idx];
      if (!cat) return;

      [...list.querySelectorAll(".cat-item")].forEach((b, i) => {
        b.classList.toggle("cat-item--active", i === idx);
      });

      detail.innerHTML = "";

      const eyebrow = document.createElement("div");
      eyebrow.className = "cat-detail-eyebrow";
      eyebrow.textContent = "CATEGORY";

      const title = document.createElement("div");
      title.className = "cat-detail-title";
      title.textContent = safeText(cat.title, cat.slug);

      const subtitle = document.createElement("div");
      subtitle.className = "cat-detail-subtitle";
      subtitle.textContent = safeText(cat.tagline, "");

      const links = document.createElement("div");
      links.className = "cat-detail-links";

      const items = Array.isArray(cat.items) ? cat.items : [];
      for (const storeSlug of items) {
        const a = document.createElement("a");
        a.href = (B.URLS?.STORE ? B.URLS.STORE(storeSlug) : `./store/${encodeURIComponent(storeSlug)}/`);
        a.textContent = storeSlug;
        links.appendChild(a);
      }

      detail.appendChild(eyebrow);
      detail.appendChild(title);
      detail.appendChild(subtitle);
      detail.appendChild(links);
    }

    list.innerHTML = "";
    categories.forEach((cat, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cat-item";
      btn.innerHTML = `<span>${safeText(cat.title, cat.slug)}</span><span style="opacity:.35;">›</span>`;
      btn.addEventListener("mouseenter", () => setActive(idx));
      btn.addEventListener("click", () => setActive(idx));
      list.appendChild(btn);
    });

    setActive(0);
  }

  // ---- 6) SEARCH (API live) ----
  function mountSearchUI() {
    const input = $(".search-input");
    const btn = $(".search-btn");
    if (!input || !btn) return;

    const wrap = input.parentElement;
    wrap.style.position = "relative";

    const dd = document.createElement("div");
    dd.style.position = "absolute";
    dd.style.top = "54px";
    dd.style.left = "0";
    dd.style.right = "0";
    dd.style.zIndex = "9999";
    dd.style.background = "#fff";
    dd.style.border = "1px solid rgba(0,0,0,0.08)";
    dd.style.borderRadius = "14px";
    dd.style.boxShadow = "0 18px 40px rgba(0,0,0,0.12)";
    dd.style.overflow = "hidden";
    dd.style.display = "none";
    wrap.appendChild(dd);

    const open = () => (dd.style.display = "block");
    const close = () => (dd.style.display = "none");

    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) close();
    });

    let lastQ = "";
    let t = null;

    async function runSearch(q) {
      q = (q || "").trim();
      if (q.length < 2) {
        dd.innerHTML = "";
        close();
        return;
      }

      if (!B.API?.search) {
        console.error("[HOME] API.search not defined in bridge");
        dd.innerHTML = `<div style="padding:12px;color:#6b7280;font-weight:800;">Search API missing.</div>`;
        open();
        return;
      }

      lastQ = q;
      const url = `${B.API.search}?q=${encodeURIComponent(q)}`;

      let data;
      try {
        data = await fetchJSON(url);
      } catch (err) {
        console.error("[HOME] Search error:", err);
        dd.innerHTML = `<div style="padding:12px;color:#6b7280;font-weight:800;">Search error.</div>`;
        open();
        return;
      }

      const results = Array.isArray(data.results) ? data.results : [];
      if (!results.length) {
        dd.innerHTML = `<div style="padding:12px;color:#6b7280;font-weight:800;">No results.</div>`;
        open();
        return;
      }

      dd.innerHTML = "";
      results.slice(0, 10).forEach((r, idx) => {
        const a = document.createElement("a");
        a.href =
          (r.sectionSlug && B.URLS?.STORE_SECTION)
            ? B.URLS.STORE_SECTION(r.storeSlug, r.sectionSlug)
            : (B.URLS?.STORE ? B.URLS.STORE(r.storeSlug) : `./store/${encodeURIComponent(r.storeSlug)}/`);

        a.style.display = "block";
        a.style.padding = "12px 14px";
        a.style.textDecoration = "none";
        a.style.color = "#111827";
        a.style.fontWeight = "900";
        a.style.borderTop = idx === 0 ? "none" : "1px solid rgba(0,0,0,0.06)";

        const t1 = document.createElement("div");
        t1.textContent = safeText(r.title, "Result");

        const sub = document.createElement("div");
        sub.style.marginTop = "4px";
        sub.style.fontSize = "12px";
        sub.style.fontWeight = "800";
        sub.style.color = "#6b7280";
        sub.textContent = safeText(r.storeSlug, "") + (r.sectionSlug ? ` / ${r.sectionSlug}` : "");

        a.appendChild(t1);
        a.appendChild(sub);

        dd.appendChild(a);
      });

      open();
    }

    function schedule() {
      const q = input.value;
      if (q === lastQ) return;
      clearTimeout(t);
      t = setTimeout(() => runSearch(q), 180);
    }

    input.addEventListener("input", schedule);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        runSearch(input.value);
      }
      if (e.key === "Escape") close();
    });

    btn.addEventListener("click", () => runSearch(input.value));
  }

  // ---- 7) Boot ----
  async function boot() {
    await renderHeaderStores();
    await renderGallery();
    await renderCategoriesPanel();
    mountSearchUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
