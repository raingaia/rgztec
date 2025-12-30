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
    return (v == null ? fallback : String(v));
  }

  // ---- 2) GALLERY (Explore Stores) ----
  async function renderGallery() {
    const grid = $("#gallery");
    if (!grid) return;

    grid.innerHTML = "";

    // store.data.json: senin bridge'te PUBLIC.stores ile tanımlı
    const storeDataURL = (B.PUBLIC && B.PUBLIC.stores) ? B.PUBLIC.stores : B.withBase?.("/data/store.data.json");
    if (!storeDataURL) {
      console.error("[HOME] PUBLIC.stores not defined in bridge");
      return;
    }

    const data = await fetchJSON(storeDataURL);

    // Senin store.data.json formatına göre:
    // { "hardware": {...}, "ai-tools-hub": {...} } gibi object map
    const entries = Object.entries(data || {});
    if (!entries.length) {
      grid.innerHTML = `<div style="padding:16px;color:#6b7280;font-weight:700;">No stores found.</div>`;
      return;
    }

    // Home'da mağaza kartı basabiliriz (bu sadece Explore Stores bölümü)
    for (const [slug, store] of entries) {
      const title = safeText(store.title, slug);
      const tagline = safeText(store.tagline, "");
      const banner = safeText(store.banner, "");

      const card = el("a");
      card.href = (B.URLS?.STORE ? B.URLS.STORE(slug) : `./store/${encodeURIComponent(slug)}/`);
      card.className = "store-card"; // store-core.css içindeki kart class’larına uyar, yoksa da sorun değil
      card.style.textDecoration = "none";
      card.style.color = "inherit";

      const wrap = el("div");
      wrap.className = "store-card-inner";
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
      img.src = banner ? (B.URLS?.ASSET ? B.URLS.ASSET(`/images/store/${banner}`) : `assets/images/store/${banner}`) : "assets/images/banners/global-marketplace-banner.webp";

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
  }

  // ---- 3) CATEGORIES PANEL (API live) ----
  async function renderCategoriesPanel() {
    const list = $("#categories-list");
    const detail = $("#categories-detail");
    if (!list || !detail) return;

    const catURL = B.API?.categories;
    if (!catURL) {
      console.error("[HOME] API.categories not defined in bridge");
      return;
    }

    const cats = await fetchJSON(catURL); // categories.json response
    const categories = (cats && cats.categories) ? cats.categories : [];

    if (!categories.length) {
      list.innerHTML = `<div style="padding:12px;color:#6b7280;font-weight:700;">No categories.</div>`;
      detail.innerHTML = "";
      return;
    }

    function setActive(idx) {
      const cat = categories[idx];
      if (!cat) return;

      // active class
      [...list.querySelectorAll(".cat-item")].forEach((b, i) => {
        b.classList.toggle("cat-item--active", i === idx);
      });

      // detail
      detail.innerHTML = "";

      const eyebrow = el("div", { className: "cat-detail-eyebrow", textContent: "CATEGORY" });
      const title = el("div", { className: "cat-detail-title", textContent: safeText(cat.title, cat.slug) });
      const subtitle = el("div", { className: "cat-detail-subtitle", textContent: safeText(cat.tagline, "") });

      const links = el("div", { className: "cat-detail-links" });

      // ÖNEMLİ: Senin istediğin gibi KART BASMIYORUZ.
      // Sadece store linkleri veriyoruz.
      const items = Array.isArray(cat.items) ? cat.items : [];
      for (const storeSlug of items) {
        const a = el("a");
        a.href = (B.URLS?.STORE ? B.URLS.STORE(storeSlug) : `./store/${encodeURIComponent(storeSlug)}/`);
        a.textContent = storeSlug; // istersen burada store title map’ten çekebiliriz
        links.appendChild(a);
      }

      detail.appendChild(eyebrow);
      detail.appendChild(title);
      detail.appendChild(subtitle);
      detail.appendChild(links);
    }

    // list render
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

    // dropdown container
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
        return;
      }

      lastQ = q;
      const url = `${B.API.search}?q=${encodeURIComponent(q)}`;
      let data;
      try {
        data = await fetchJSON(url);
      } catch (err) {
        dd.innerHTML = `<div style="padding:12px;color:#6b7280;font-weight:700;">Search error.</div>`;
        open();
        return;
      }

      // Beklenen response:
      // { "q":"..", "results":[ { type:"product|store", title:"..", storeSlug:"..", sectionSlug:"..", id:".."} ] }
      const results = Array.isArray(data.results) ? data.results : [];
      if (!results.length) {
        dd.innerHTML = `<div style="padding:12px;color:#6b7280;font-weight:700;">No results.</div>`;
        open();
        return;
      }

      dd.innerHTML = "";
      results.slice(0, 10).forEach((r) => {
        const item = el("a");
        item.href = (r.sectionSlug && B.URLS?.STORE_SECTION)
          ? B.URLS.STORE_SECTION(r.storeSlug, r.sectionSlug)
          : (B.URLS?.STORE ? B.URLS.STORE(r.storeSlug) : `./store/${encodeURIComponent(r.storeSlug)}/`);

        item.style.display = "block";
        item.style.padding = "12px 14px";
        item.style.textDecoration = "none";
        item.style.color = "#111827";
        item.style.fontWeight = "800";
        item.style.borderTop = "1px solid rgba(0,0,0,0.06)";

        const sub = el("div");
        sub.style.marginTop = "4px";
        sub.style.fontSize = "12px";
        sub.style.fontWeight = "800";
        sub.style.color = "#6b7280";
        sub.textContent = r.storeSlug + (r.sectionSlug ? ` / ${r.sectionSlug}` : "");

        item.textContent = safeText(r.title, "Result");
        item.appendChild(sub);

        dd.appendChild(item);
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
    try {
      await renderGallery();
    } catch (e) {
      console.error("[HOME] Gallery error:", e);
    }

    try {
      await renderCategoriesPanel();
    } catch (e) {
      console.error("[HOME] Categories error:", e);
    }

    try {
      mountSearchUI();
    } catch (e) {
      console.error("[HOME] Search UI error:", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
