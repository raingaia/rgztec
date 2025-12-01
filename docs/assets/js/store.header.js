// assets/js/store.header.js
// RGZTEC • Store Header – bağımsız çalışan sürüm

(function (window, document) {
  "use strict";

  const REGISTRY_PATH = "data/store-registry.json";

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

  async function loadStoreConfig() {
    const body = document.body;
    const slug = body.dataset.store || "";
    if (!slug) return null;

    try {
      const res = await fetch(REGISTRY_PATH);
      if (!res.ok) throw new Error("registry fetch failed");
      const list = await res.json();
      if (Array.isArray(list)) {
        return list.find((s) => s.slug === slug) || {
          slug,
          name: slug,
          subtitle: "",
          accent: "#f97316",
        };
      }
    } catch (err) {
      console.warn("[store.header] registry okunamadı:", err);
    }

    return {
      slug,
      name: slug,
      subtitle: "",
      accent: "#f97316",
    };
  }

  function renderHeader(storeConfig) {
    const root = qs("#store-header-root");
    if (!root) return;

    const storeSlug = storeConfig.slug || "";
    const storeTitle =
      storeConfig.name ||
      storeConfig.title ||
      storeSlug ||
      "Store";

    const accent = storeConfig.accent || "#f97316";

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

  async function bootstrapHeader() {
    const root = qs("#store-header-root");
    if (!root) return; // Bu sayfada header yoksa hiç çalışmasın

    const cfg = await loadStoreConfig();
    if (!cfg) return;
    renderHeader(cfg);
  }

  // DOM hazır olduğunda otomatik çalışsın
  document.addEventListener("DOMContentLoaded", bootstrapHeader);
})(window, document);
