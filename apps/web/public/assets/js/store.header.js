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

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  window.initStoreHeader = initStoreHeader;
})(window, document, window.StoreUtils);
