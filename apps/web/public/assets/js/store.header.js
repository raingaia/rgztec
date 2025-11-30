// assets/js/store.header.js
// RGZTEC STORE • Header

(function (window, document, utils) {
  "use strict";

  if (!utils) {
    console.error("[store.header] StoreUtils yok. store.utils.js yüklü mü?");
    return;
  }

  const { qs } = utils;

  function initStoreHeader(storeConfig, root) {
    root = root || qs("#store-header-root");
    if (!root) return;

    const storeSlug =
      storeConfig?.slug || "";

    const storeTitle =
      storeConfig?.title ||
      storeConfig?.name ||
      storeSlug ||
      "Store";

    const accent =
      storeConfig?.accent || "#f97316";

    // Accent rengini CSS değişkeni olarak header'a bas
    root.parentElement.style.setProperty("--store-accent", accent);

    root.innerHTML = `
      <a href="/rgztec/" class="store-logo">
        <div class="store-logo-mark"></div>
        <div class="store-logo-text">
          <span class="store-logo-main">RGZTEC</span>
          <span class="store-logo-sub">${escapeHtml(storeTitle)}</span>
        </div>
      </a>

      <div class="store-header-spacer"></div>

      <div class="store-header-actions">
        <div class="store-search">
          <input
            type="search"
            class="store-search-input"
            id="store-search-input"
            placeholder="Search in this store"
          />
        </div>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  window.initStoreHeader = initStoreHeader;
})(window, document, window.StoreUtils);
