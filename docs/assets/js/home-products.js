/* RGZTEC HOME – products + categories + search (bridge-connected)
   - Gallery: PUBLIC.stores (snapshot) => /data/store.data.json
   - Categories: API.categories (live) => /api/categories
   - Search: API.search (live) => /api/search?q=
*/

(() => {
  "use strict";

  // ---- 0) Bridge guard ----
  const B = window.RGZ || window.rgz || null;
  if (!B) {
    console.error("[HOME] rgz.bridge missing. Add: <script src='assets/js/rgz.bridge.js'> before home-products.js");
    return;
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, attrs = {}) => Object.assign(document.createElement(tag), attrs);

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

  // Normalize with base: supports PUBLIC.stores being "/data/..." while site is under "/rgztec/"
  function normalizeURL(u) {
    if (!u) return "";
    const s = String(u).trim();

    // absolute URL (http/https) - keep
    if (/^https?:\/\//i.test(s)) return s;

    // If bridge provides withBase(), use it for root-absolute paths
    // "/data/x.json" -> "/rgztec/data/x.json" when deployed under /rgztec
    if (s.startsWith("/") && typeof B.withBase === "function") return B.withBase(s);

    // "./data/x.json" or "data/x.json" keep as is
    return s;
  }

  // ---- 2) GALLERY (Explore Stores) ----
  async function renderGallery() {
    const grid = $("#gallery");
    if (!grid) return;

    grid.innerHTML = `<div style="padding:16px;color:#6b7280;font-weight:800;">Loading stores…</div>`;

    try {
      const raw = (B.PUBLIC && B.PUBLIC.stores) ? B.PUBLIC.stores : "/data/store.data.json";
      const storeDataURL = normalizeURL(raw) || (typeof B.withBase === "function" ? B.withBase("/data/store.data.json") : "/data/store.data.json");

      console.log("[HOME] storeDataURL =", storeDataURL);

      const data = await fetchJSON(storeDataURL);

      // ✅ Accept multiple JSON shapes:
      // 1) { "hardware": {...}, "ai-tools-hub": {...} }   (map)
      // 2) { stores: { ... } }                           (map in stores)
      // 3) { stores: [ ... ] }                           (array)
      // 4) [ ... ]                                       (array)
      let entries = [];

      if (Array.isArray(data)) {
        // array of stores
        entries = data
          .map((s, i) => [safeText(s.slug, `store-${i}`), s])
          .filter(([slug]) => !!slug);
      } else if (isObject(data) && isObject(data.stores)) {
        entries = Object.entries(data.stores);
      } else if (isObject(data) && Array.isArray(data.stores)) {
        entries = data.stores
          .map((s, i) => [safeText(s.slug, `store-${i}`), s])
          .filter(([slug]) => !!slug);
      } else if (isObject(data)) {
        entries = Object.entries(data);
      }

      if (!entries.length) {
        grid.innerHTML = `<div style="padding:16px;color:#6b7280;font-weight:800;">No stores found in data.</div>`;
        console.log("[HOME] store.data.json sample =", data);
        return;
      }

      grid.innerHTML = "";

      for (const [slug, store] of entries) {
        const title = safeText(store?.title, slug);
        const tagline = safeText(store?.tagline, "");
        const banner = safeText(store?.banner, "");

        const card = el("a");
        card.href = (B.URLS?.STORE ? B.URLS.STORE(slug) : `./store/${encodeURIComponent(slug)}/`);
        card.style.textDecoration = "none";
        card.style.color = "inherit";

        const wrap = el("div");
        wrap.className = "rgz-store-card";
        wrap.style.border = "1px solid rgba(0,0,0,0.08)";
        wrap.style.borderRadius = "16px";
        wrap.style.overflow = "hidden";
        wrap.style.background = "#fff";
        wrap.style.boxShadow = "0 10px 26px rgba(0,0,0,0.06)";

        const imgWrap = el("div");
        imgWrap.style.height = "140px";
        imgWrap.style.background = "#f3f4f6";
        imgWrap.style.display = "flex";
        imgWrap.style.alignItems = "center";
        imgWrap.style.justifyContent = "center";
        imgWrap.style.overflow = "hidden";

        const img = el("img");
        img.alt = title;
        img.loading = "lazy";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";

        // banner rules:
        // - if banner is absolute URL => use
        // - else try B.URLS.ASSET(`/images/store/${banner}`)
        // - else fall back to local path
        if (banner && /^(https?:)?\/\//.test(banner)) {
          img.src = banner;
        } else if (banner) {
          img.src = (B.URLS?.ASSET ? B.URLS.ASSET(`/images/store/${banner}`) : `assets/images/store/${banner}`);
        } else {
          img.src = "assets/images/banners/global-marketplace-banner.webp";
        }

        imgWrap.appendChild(img);

        const body = el("div");
        body.style.padding = "14px";

        const h = el("div", { textContent: title });
        h.style.fontWeight = "900";
        h.style.fontSize = "16px";
        h.style.color = "#111827";
        h.style.letterSpacing = "-0.01em";

        const p = el("div", { textContent: tagline });
        p.style.marginTop = "6px";
        p.style.fontSize = "13px";
        p.style.color = "#6b7280";
        p.style.lineHeight = "1.5";

        body.appendChild(h);
        body.appendChild(p);

        wrap.appendChild(imgWrap);
        wrap.appendChild(body);

        card.appendChild(wrap);
        grid.appendChild(card);
      }

      console.log(`[HOME] Rendered ${entries.length} stores.`);
    } catch (e) {
      console.error("[HOME] Gallery error:", e);
      grid.innerHTML = `
        <div style="padding:16px;border:1px solid rgba(0,0,0,.08);border-radius:12px;background:#fff;">
          <b>Stores failed to load.</b><br>
          <span style="color:#6b7280;font-weight:700;">
            Open Console/Network and check the storeDataURL + HTTP status.
          </span>
        </div>`;
    }
  }

  // ---- 3) CATEGORIES PANEL (API live) ----
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

      const eyebrow = el("div", { className: "cat-detail-eyebrow", textContent: "CATEGORY" });
      const title = el("div", { className: "cat-detail-title", textContent: safeText(cat.title, cat.slug) });
      const subtitle = el("div", { className: "cat-detail-subtitle", textContent: safeText(cat.tagline, "") });

      const links = el("div", { className: "cat-detail-links" });

      const items = Array.isArray(cat.items) ? cat.items : [];
      if (!items.length) {
        const none = el("div");
        none.style.marginTop = "10px";
        none.style.color = "#6b7280";
        none.style.fontWeight = "800";
        none.textContent = "No stores in this category.";
        detail.appendChild(eyebrow);
        detail.appendChild(title);
        detail.appendChild(subtitle);
        detail.appendChild(none);
        return;
      }

      for (const storeSlug of items) {
        const a = el("a");
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
      const btn = el("button");
      btn.type = "button";
      btn.className = "cat-item";
      btn.innerHTML = `<span>${safeText(cat.title, cat.slug)}</span><span style="opacity:.35;">›</span>`;
      btn.addEventListener("mouseenter", () => setActive(idx));
      btn.addEventListener("click", () => setActive(idx));
      list.appendChild(btn);
    });

    setActive(0);
  }

  // ---- 4) SEARCH (API live) ----
  function mountSearchUI() {
    const input = $(".search-input");
    const btn = $(".search-btn");
    if (!input || !btn) return;

    const wrap = input.parentElement;
    wrap.style.position = "relative";

    const dd = el("div");
    dd.style.position = "absolute";
    dd.style.top = "44px";
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
        const a = el("a");
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

        const title = el("div", { textContent: safeText(r.title, "Result") });

        const sub = el("div");
        sub.style.marginTop = "4px";
        sub.style.fontSize = "12px";
        sub.style.fontWeight = "800";
        sub.style.color = "#6b7280";
        sub.textContent = safeText(r.storeSlug, "") + (r.sectionSlug ? ` / ${r.sectionSlug}` : "");

        a.appendChild(title);
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

  // ---- 5) Boot ----
  async function boot() {
    try { await renderGallery(); } catch (e) { console.error("[HOME] Gallery error:", e); }
    try { await renderCategoriesPanel(); } catch (e) { console.error("[HOME] Categories error:", e); }
    try { mountSearchUI(); } catch (e) { console.error("[HOME] Search UI error:", e); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

