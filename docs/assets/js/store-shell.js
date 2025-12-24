/**
 * RGZTEC Marketplace - Store Shell Engine
 * v18.2.7 - Vercel & Docs Deployment Ready
 */
(function () {
  "use strict";

  // Vercel'de projen root'ta çalışıyorsa "/" , GitHub Pages'da "/rgztec/" olur.
  // URL'de rgztec geçiyorsa yolu ona göre ayarlar.
  const isSubFolder = window.location.pathname.startsWith("/rgztec/");
  const APP_ROOT = isSubFolder ? "/rgztec/" : "/";

  const DATA_URL = `${APP_ROOT}data/store.data.json?v=1827`;
  const IMAGE_BASE_PATH = `${APP_ROOT}assets/images/store/`;

  document.addEventListener("DOMContentLoaded", () => {
    const storeRoot = document.getElementById("store-root");
    const storeBody = document.querySelector("body.store-body");

    if (!storeBody || !storeRoot) return;

    let path = normalizePath(storeBody.dataset.path || "");
    if (!path) return;

    initStore(path, storeRoot);
  });

  async function initStore(path, targetElement) {
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      const allStoresData = await res.json();

      const { currentData, rootSlug, currentSlug, depth } = findDataByPath(allStoresData, path);
      if (!currentData || !rootSlug) throw new Error(`Path not found: ${path}`);

      const rootStoreData = allStoresData[rootSlug] || {};
      const rootSections = rootStoreData.sections || [];
      const activeSectionSlug = depth >= 2 ? currentSlug : null;

      // Render akışı
      let html = renderHeader();
      html += renderStoreNav(allStoresData, rootSlug);
      html += renderSectionNav(rootSections, activeSectionSlug, rootSlug);
      html += renderHero(currentData);

      // İçerik Kararı
      if (currentData.sections?.length > 0) {
        html += renderShopSection(currentData.sections, rootSlug);
      } else if (currentData.products?.length > 0) {
        html += renderProductSection(currentData.products);
      } else {
        html += renderEmptyShop();
      }

      targetElement.innerHTML = html;
      wireInteractions(targetElement);
    } catch (err) {
      console.error("Shell Error:", err);
    }
  }

  // --- Navigasyon Linklerini APP_ROOT ile Besleyelim ---

  function renderStoreNav(allData, currentRootSlug) {
    const links = Object.keys(allData).map(slug => {
      const isActive = slug === currentRootSlug;
      return `
        <li class="store-main-nav__item">
          <a href="${APP_ROOT}store/${slug}/" class="store-main-nav__link ${isActive ? 'active' : ''}">
            ${allData[slug].title}
          </a>
        </li>`;
    }).join("");
    return `<nav class="store-main-nav"><ul class="store-main-nav__list">${links}</ul></nav>`;
  }

  function renderSectionNav(sections, activeSlug, rootSlug) {
    if (!sections.length) return "";
    const navItems = sections.map(s => {
      const isActive = activeSlug && s.slug === activeSlug;
      const href = isActive ? "#" : `${APP_ROOT}store/${rootSlug}/${s.slug}/`;
      return `
        <li class="store-section-nav__item">
          <a href="${href}" class="store-section-nav__link ${isActive ? 'active' : ''}">${s.name}</a>
        </li>`;
    }).join("");
    return `<nav id="store-section-nav" class="store-section-nav"><ul class="store-section-nav__list">${navItems}</ul></nav>`;
  }

  // Diğer fonksiyonlar (normalizePath, findDataByPath, renderHero, renderShopSection vb.) 
  // Senin attığın v18.2.5 ile aynı mantıkta devam ediyor.
  // Tek fark: href linklerinin başına ${APP_ROOT} eklendi.

  // ... (Geri kalan yardımcı fonksiyonlar)
  
  function normalizePath(p) {
    return String(p || "").replace(/#.*$/, "").trim().replace(/^\/+/, "").replace(/\/+$/, "");
  }

  function findDataByPath(allStoresData, path) {
    const segments = path.split("/").filter(Boolean);
    const rootSlug = segments[0] || null;
    const currentSlug = segments[segments.length - 1] || null;
    const depth = segments.length;
    if (!rootSlug || !allStoresData[rootSlug]) return { currentData: null };
    let currentData = allStoresData[rootSlug];
    for (let i = 1; i < segments.length; i++) {
      const next = (currentData.sections || []).find(s => s.slug === segments[i]);
      if (next) currentData = next; else return { currentData: null };
    }
    return { currentData, rootSlug, currentSlug, depth };
  }

  function renderHeader() { /* Senin header kodun */ return `...`; }
  function renderHero(data) { /* Senin hero kodun */ return `...`; }
  function wireInteractions(root) { /* Toggle mantığın */ }

})();

