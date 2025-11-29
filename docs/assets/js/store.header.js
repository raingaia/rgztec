// store/core/assets/js/store.header.js
// Store header'ı data'dan doldurur ve mobil nav davranışını yönetir

(function (window, document, utils) {
  "use strict";

  if (!utils) {
    console.error("[store.header] StoreUtils yok.");
    return;
  }

  const { qs, createEl } = utils;

  /**
   * @param {Object} storeConfig
   * @param {HTMLElement} root
   */
  function initStoreHeader(storeConfig, root) {
    root = root || qs("#store-header-root");
    if (!root || !storeConfig) return;

    const storeTitle = storeConfig.title || "RGZTEC Store";

    root.innerHTML = `
      <a href="/rgztec/" class="store-logo">
        <div class="store-logo-mark"></div>
        <div>
          <div class="store-logo-text-main">RGZTEC</div>
          <div class="store-logo-text-sub">${escapeHtml(storeTitle)}</div>
        </div>
      </a>

      <nav class="store-nav" aria-label="Store sections">
        <!-- İleride nav linkleri stores.json'dan doldurulabilir -->
      </nav>

      <div class="store-header-actions">
        <button class="store-search-trigger" type="button" id="store-search-trigger">
          <span>Search in this store</span>
        </button>
        <button class="store-nav-toggle" type="button" id="store-nav-toggle" aria-label="Toggle navigation">
          ☰
        </button>
      </div>

      <div class="store-nav-panel" id="store-nav-panel">
        <div class="store-nav-panel-inner" id="store-nav-panel-inner"></div>
      </div>
    `;

    // Basic nav panel içeriği – şimdilik sadece "All products"
    const panelInner = qs("#store-nav-panel-inner", root);
    if (panelInner) {
      panelInner.innerHTML = `
        <a href="#store-root">All products</a>
      `;
    }

    // Mobil nav toggle
    const navToggle = qs("#store-nav-toggle", root);
    const navPanel = qs("#store-nav-panel", root);

    if (navToggle && navPanel) {
      navToggle.addEventListener("click", () => {
        navPanel.classList.toggle("is-open");
      });

      navPanel.addEventListener("click", (e) => {
        if (e.target === navPanel) {
          navPanel.classList.remove("is-open");
        }
      });
    }
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
