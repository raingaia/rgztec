// assets/js/store.header.js
// RGZTEC • Store Header (ince şerit + store etiketi)

(function (window, document) {
  "use strict";

  function qs(sel) {
    return document.querySelector(sel);
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function initStoreHeader(storeConfig) {
    const root = qs("#store-header-root");
    if (!root) return;

    const body = document.body;

    const storeSlug =
      storeConfig?.slug ||
      body.dataset.store ||
      "";

    const storeTitle =
      storeConfig?.name ||
      storeConfig?.title ||
      storeSlug ||
      "Store";

    const accent =
      storeConfig?.accent || "#f97316";

    // Accent rengini header elementine yaz
    root.parentElement.style.setProperty("--store-accent", accent);

    root.innerHTML = `
      <a href="/rgztec/" class="store-brand">
        <span class="store-brand-dot"></span>
        <span class="store-brand-text">
          <span class="store-brand-title">RGZTEC</span>
          <span class="store-brand-subtitle">STORE</span>
        </span>
      </a>

      <div class="store-header-divider"></div>

      <div class="store-current-store">
        <span class="store-current-label">Store</span>
        <span class="store-current-name">${escapeHtml(storeTitle)}</span>
      </div>

      <div class="store-header-spacer"></div>

      <div class="store-header-actions">
        <div class="store-search">
          <input
            type="search"
            id="store-search-input"
            class="store-search-input"
            placeholder="Search in this store"
          />
        </div>
      </div>
    `;
  }

  window.initStoreHeader = initStoreHeader;
})(window, document);
