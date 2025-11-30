// assets/js/store.banner.js
// RGZTEC • Store Banner (tek görsellik hero kart)

(function (window, document) {
  "use strict";

  function renderStoreBanner(storeConfig) {
    const bannerRoot = document.getElementById("store-banner");
    const textRoot = document.getElementById("store-banner-text");
    if (!bannerRoot) return;

    const body = document.body;

    const storeSlug =
      storeConfig?.slug ||
      body.dataset.store ||
      "";

    const title =
      storeConfig?.name ||
      storeConfig?.title ||
      "Game Makers";

    const subtitle =
      storeConfig?.subtitle ||
      storeConfig?.tagline ||
      "Unity & Unreal templates, UI kits and game-ready assets.";

    // Görsel yolu: önce config.heroImage, yoksa slug tabanlı
    let imgPath = storeConfig?.heroImage;
    if (!imgPath && storeSlug) {
      imgPath = `assets/images/store/${storeSlug}-banner.webp`;
    }
    if (!imgPath) {
      imgPath = "assets/images/store/default-store-banner.webp";
    }

    bannerRoot.classList.add("store-banner-shell");

    bannerRoot.innerHTML = `
      <figure class="store-banner-card">
        <img
          src="${imgPath}"
          alt="${title} banner"
          loading="lazy"
        />
      </figure>
    `;

    if (textRoot) {
      textRoot.innerHTML = `
        <h1 class="store-title">${title}</h1>
        ${subtitle ? `<p class="store-subtitle">${subtitle}</p>` : ""}
      `;
    }
  }

  window.renderStoreBanner = renderStoreBanner;
})(window, document);
