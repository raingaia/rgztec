(function () {
  "use strict";

  // 1. BASE & PATH CONFIG
  const resolveBase = () => ""; 
  const BASE = resolveBase();
  const withBase = (p) => (BASE ? `${BASE}${p}` : p);
  const enc = (s) => encodeURIComponent(String(s || ""));

  // Asset ve Store URL Tanımları
  const STORE_URL = (slug) => withBase(`/store/${enc(slug)}/`);
  const ASSET_URL = (p) => withBase(`/assets/${String(p || "").replace(/^\/+/, "")}`);
  const STORE_IMAGE_BASE = ASSET_URL("images/store/");
  const PLACEHOLDER_IMG = ASSET_URL("images/placeholder.png");

  // 2. ANA BAŞLATICI
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Veriyi direkt catalog.json'dan çekiyoruz
      const response = await fetch(withBase('/api/catalog.json')); 
      const result = await response.json();
      
      // JSON yapına göre stores dizisini alıyoruz
      const stores = result.stores || result.data?.stores || [];

      if (stores.length > 0) {
        renderGallery(stores);
        renderSubNav(stores);
        initMegaMenu(stores);
      }
      
      initSearchEngine();
      console.log(`RGZTEC: ${stores.length} mağaza yüklendi.`);
    } catch (err) {
      console.error("Katalog yüklenemedi:", err);
    }
  });

  // 3. UI RENDER FONKSİYONLARI (ORİJİNAL YAPI)
  function renderGallery(data) {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    gallery.innerHTML = data.map(store => `
      <article class="card ${store.isFeatured ? 'card--featured' : ''}">
        <a href="${STORE_URL(store.slug)}" class="card-media">
          <img src="${STORE_IMAGE_BASE}${store.slug}.webp" alt="${escapeHtml(store.title)}" 
               onerror="this.src='${PLACEHOLDER_IMG}';">
        </a>
        <div class="card-content">
          <h3 class="card-title">${escapeHtml(store.title)}</h3>
          <p class="card-desc">${escapeHtml(store.tagline)}</p>
          <a href="${STORE_URL(store.slug)}" class="card-link">Visit Store &rarr;</a>
        </div>
      </article>
    `).join("");
  }

  function renderSubNav(data) {
    const list = document.getElementById("sub-nav-list");
    if (list) list.innerHTML = data.map(s => 
      `<div class="sub-nav-item"><a href="${STORE_URL(s.slug)}">${escapeHtml(s.title)}</a></div>`
    ).join("");
  }

  function initMegaMenu(data) {
    const listEl = document.getElementById("categories-list");
    const detailEl = document.getElementById("categories-detail");
    const btn = document.getElementById("btn-categories");
    const header = document.querySelector(".app-header");
    if (!listEl || !btn) return;

    listEl.innerHTML = data.map((s, i) => `
      <button class="cat-item ${i === 0 ? 'cat-item--active' : ''}" data-slug="${s.slug}">
        <span>${escapeHtml(s.title)}</span>
      </button>`).join("");

    renderDetail(data[0], detailEl);

    listEl.querySelectorAll(".cat-item").forEach(item => {
      item.onmouseenter = () => {
        listEl.querySelectorAll(".cat-item").forEach(b => b.classList.remove("cat-item--active"));
        item.classList.add("cat-item--active");
        renderDetail(data.find(s => s.slug === item.dataset.slug), detailEl);
      };
    });

    btn.onclick = (e) => { e.stopPropagation(); header.classList.toggle("has-cat-open"); };
  }

  function renderDetail(store, container) {
    if (!store || !container) return;
    container.innerHTML = `
      <div class="cat-detail-title">${escapeHtml(store.title)}</div>
      <div class="cat-detail-subtitle">${escapeHtml(store.tagline)}</div>
      <div class="cat-detail-links">
        ${(store.sections || []).map(s => `<a href="${STORE_URL(store.slug)}">${escapeHtml(s.name)}</a>`).join("")}
        <a href="${STORE_URL(store.slug)}">View All</a>
      </div>`;
  }

  function initSearchEngine() {
    const input = document.querySelector('.search-input');
    const btn = document.querySelector('.search-btn');
    if (!input || !btn) return;
    const run = () => { if(input.value.trim()) window.location.href = withBase(`/search.html?q=${enc(input.value.trim())}`); };
    btn.onclick = run;
    input.onkeypress = (e) => { if(e.key === 'Enter') run(); };
  }

  function escapeHtml(str) {
    const p = document.createElement('p');
    p.textContent = str || "";
    return p.innerHTML;
  }

})();

