// assets/js/store.banner.js
// RGZTEC • Store Banner – bağımsız çalışan sürüm

(function (window, document) {
  "use strict";

  const REGISTRY_PATH = "data/store-registry.json";

  function el(id) {
    return document.getElementById(id);
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
        };
      }
    } catch (err) {
      console.warn("[store.banner] registry okunamadı:", err);
    }

    return {
      slug,
      name: slug,
      subtitle: "",
    };
  }

  function renderBanner(storeConfig) {
    const bannerRoot = el("store-banner");
    const textRoot = el("store-banner-text");
    if (!bannerRoot) return;

    const slug = storeConfig.slug || "";
    const title =
      storeConfig.name ||
      storeConfig.title ||
      "Store";

    const subtitle =
      storeConfig.subtitle ||
      storeConfig.tagline ||
      "";

    // Görsel yolu: önce config.heroImage, yoksa slug tabanlı
    let imgPath = storeConfig.heroImage;
    if (!imgPath && slug) {
      imgPath = `assets/images/store/${slug}-banner.webp`;
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

  async function bootstrapBanner() {
    const bannerRoot = el("store-banner");
    if (!bannerRoot) return; // Bu sayfada banner yoksa çalışmasın

    const cfg = await loadStoreConfig();
    if (!cfg) return;
    renderBanner(cfg);
  }

  document.addEventListener("DOMContentLoaded", bootstrapBanner);
})(window, document);
