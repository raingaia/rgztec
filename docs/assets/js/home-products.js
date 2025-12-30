(function () {
  "use strict";

  // ---------- 1. BASE RESOLVER (AWS YOLU) ----------
  function resolveBase() {
    return ""; // AWS Amplify kök dizin için
  }

  const BASE = resolveBase();
  const withBase = (p) => (BASE ? `${BASE}${p}` : p);
  const enc = (s) => encodeURIComponent(String(s || ""));

  const STORE_URL = (slug) => withBase(`/store/${enc(slug)}/`);
  const ASSET_URL = (p) => withBase(`/assets/${String(p || "").replace(/^\/+/, "")}`);

  const STORE_IMAGE_BASE = ASSET_URL("images/store/");
  const PLACEHOLDER_IMG = ASSET_URL("images/placeholder.png");

  // ---------- 2. STORE DATA (SEED) ----------
  const STORES_DATA = [
    {
      slug: "hardware",
      title: "Hardware Lab",
      tagline: "High-performance AI accelerators, dev boards & IoT kits.",
      isFeatured: true,
      sections: [{ name: "AI Boards" }, { name: "Sensors" }, { name: "Microcontrollers" }]
    },
    // ... Diğer tüm mağaza verilerin burada aynen kalıyor
  ];

  // ---------- 3. ENTRY POINT ----------
  document.addEventListener("DOMContentLoaded", () => {
    try {
      renderGallery(STORES_DATA);
      renderSubNav(STORES_DATA);
      initMegaMenu(STORES_DATA);
      
      // Dinamik özellikleri başlat
      syncWithLiveApi();
      initSearchEngine(); 

      console.log("RGZTEC HOME OK • BASE =", BASE || "(root)");
    } catch (err) {
      console.error("HOME MANAGER INIT ERROR:", err);
    }
  });

  // ---------- 4. UI FUNCTIONS (YAPI BOZULMADI) ----------
  function renderGallery(data) {
    const gallery = document.getElementById("gallery");
    if (!gallery || !Array.isArray(data)) return;

    gallery.innerHTML = data.map((store) => {
      const href = STORE_URL(store.slug);
      const title = escapeHtml(store.title);
      const imgSrc = `${STORE_IMAGE_BASE}${store.slug}.webp`;

      return `
        <article class="card ${store.isFeatured ? 'card--featured' : ''}">
          <a href="${href}" class="card-media">
            <img src="${imgSrc}" alt="${title}" loading="lazy" onerror="this.src='${PLACEHOLDER_IMG}';">
          </a>
          <div class="card-content">
            <span class="card-badge">${store.isFeatured ? 'Featured' : 'Official Store'}</span>
            <h3 class="card-title">${title}</h3>
            <p class="card-desc">${escapeHtml(store.tagline)}</p>
            <a href="${href}" class="card-link">Visit Store &rarr;</a>
          </div>
        </article>`;
    }).join("");
  }

  function renderSubNav(data) {
    const list = document.getElementById("sub-nav-list");
    if (list) {
      list.innerHTML = data.map((s) => 
        `<div class="sub-nav-item"><a href="${STORE_URL(s.slug)}">${escapeHtml(s.title)}</a></div>`
      ).join("");
    }
  }

  function initMegaMenu(data) {
    const btn = document.getElementById("btn-categories");
    const header = document.querySelector(".app-header");
    const listEl = document.getElementById("categories-list");
    const detailEl = document.getElementById("categories-detail");

    if (!btn || !listEl || !detailEl) return;

    listEl.innerHTML = data.map((s, i) => `
      <button class="cat-item ${i === 0 ? "cat-item--active" : ""}" type="button" data-slug="${escapeHtml(s.slug)}">
        <span>${escapeHtml(s.title)}</span>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
      </button>`).join("");

    renderDetail(data[0], detailEl);

    listEl.querySelectorAll(".cat-item").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        listEl.querySelectorAll(".cat-item").forEach((b) => b.classList.remove("cat-item--active"));
        item.classList.add("cat-item--active");
        const store = data.find((s) => s.slug === item.getAttribute("data-slug"));
        if (store) renderDetail(store, detailEl);
      });
    });

    btn.onclick = (e) => { e.stopPropagation(); header.classList.toggle("has-cat-open"); };
    document.onclick = (e) => { if (!header.contains(e.target)) header.classList.remove("has-cat-open"); };
  }

  function renderDetail(store, container) {
    if (!store || !container) return;
    const storeHref = STORE_URL(store.slug);
    container.innerHTML = `
      <div class="cat-detail-eyebrow">STORE</div>
      <div class="cat-detail-title">${escapeHtml(store.title)}</div>
      <div class="cat-detail-subtitle">${escapeHtml(store.tagline)}</div>
      <div class="cat-detail-links">
        ${(store.sections || []).map(s => `<a href="${storeHref}">${escapeHtml(s.name)}</a>`).join("")}
        <a href="${storeHref}">View All</a>
      </div>`;
  }

  // ---------- 5. DİNAMİK SERVİSLER (TEMİZLENDİ) ----------
  async function syncWithLiveApi() {
    try {
      const res = await fetch(withBase('/api/catalog'));
      const result = await res.json();
      if (result.ok && result.data.stores) {
        renderGallery(result.data.stores);
        renderSubNav(result.data.stores);
        initMegaMenu(result.data.stores);
      }
    } catch (e) { console.warn("API offline, seed data active."); }
  }

  function initSearchEngine() {
    const input = document.querySelector('.search-input');
    const btn = document.querySelector('.search-btn');
    if (!input || !btn) return;

    const execute = () => {
      const q = input.value.trim();
      if (q) window.location.href = withBase(`/search.html?q=${enc(q)}`);
    };

    btn.onclick = (e) => { e.preventDefault(); execute(); };
    input.onkeypress = (e) => { if (e.key === 'Enter') execute(); };
  }

  function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

})();

