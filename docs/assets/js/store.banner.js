// store/core/assets/js/store.banner.js
// Hero banner ve diğer banner yapılarını yönetir

(function (window, utils) {
  "use strict";

  if (!utils) {
    console.error("[store.banner] StoreUtils yok.");
    return;
  }

  const { createEl } = utils;

  /**
   * storeConfig.heroImage + banners içinden hero slot'unu kullanır
   * @param {Object} storeConfig
   * @param {Array} banners
   * @param {HTMLElement} root
   */
  function renderStoreHeroBanner(storeConfig, banners, root) {
    root = root || document.getElementById("store-hero-banner");
    if (!root || !storeConfig) return;

    const heroBannerData =
      (Array.isArray(banners) &&
        banners.find((b) => b.slot === "hero" && b.type === "image")) ||
      null;

    const bgImage = heroBannerData?.image || storeConfig.heroImage;

    root.classList.add("store-hero-banner");
    if (bgImage) {
      root.style.backgroundImage = `url(${bgImage})`;
    }

    const kicker = heroBannerData?.kicker || `RGZTEC • ${storeConfig.title}`;
    const title = heroBannerData?.title || storeConfig.title;
    const subtitle = heroBannerData?.subtitle || storeConfig.subtitle;
    const actionText = heroBannerData?.actionText || "Browse products";
    const actionUrl = heroBannerData?.actionUrl || "#store-root";

    root.innerHTML = `
      <div class="store-hero-banner-inner">
        <div class="store-hero-banner-kicker">${escapeHtml(kicker)}</div>
        <h2 class="store-hero-banner-title">${escapeHtml(title || "")}</h2>
        <p class="store-hero-banner-subtitle">
          ${escapeHtml(subtitle || "")}
        </p>
        <a href="${escapeAttr(actionUrl)}" class="store-hero-banner-cta">
          ${escapeHtml(actionText)} →
        </a>
      </div>
    `;
  }

  /**
   * İleride: content/sponsor/slider banner'ları da burada işleyebiliriz.
   * Şimdilik sadece hero'ya odaklanıyoruz.
   */

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(str) {
    if (str == null) return "";
    return String(str).replace(/"/g, "&quot;");
  }

  window.renderStoreHeroBanner = renderStoreHeroBanner;
})(window, window.StoreUtils);
