// assets/js/store.banner.js
// RGZTEC • Store Hero (SEO metni + banner kart)

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
        return (
          list.find((s) => s.slug === slug) || {
            slug,
            name: slug,
            subtitle: "",
            accent: "#f97316",
          }
        );
      }
    } catch (err) {
      console.warn("[store.banner] registry okunamadı:", err);
    }

    return {
      slug,
      name: slug,
      subtitle: "",
      accent: "#f97316",
    };
  }

  function renderHero(storeConfig) {
    const bannerRoot = el("store-banner");
    const textRoot = el("store-hero-text");
    if (!bannerRoot || !textRoot) return;

    const slug = storeConfig.slug || "";
    const name = storeConfig.name || "Store";

    // SEO yazıları
    const kicker =
      storeConfig.heroKicker || "For Unity & Unreal teams";

    const title =
      storeConfig.heroTitle || name;

    const subtitle =
      storeConfig.subtitle ||
      storeConfig.tagline ||
      "";

    const body =
      storeConfig.heroBody ||
      storeConfig.seoDescription ||
      "";

    // Görsel yolu
    let imgPath = storeConfig.heroImage;
    if (!imgPath && slug) {
      imgPath = `assets/images/store/${slug}.webp`;
    }
    if (!imgPath) {
      imgPath = "assets/images/store/default-store-banner.webp";
    }

    // Sağdaki kart
    bannerRoot.innerHTML = `
      <figure class="store-banner-card">
        <img
          src="${imgPath}"
          alt="${name} banner"
          loading="lazy"
        />
      </figure>
    `;

    // Soldaki SEO alanı
    textRoot.innerHTML = `
      <p class="store-hero-kicker">${kicker}</p>
      <h1 class="store-hero-title">${title}</h1>
      ${
        subtitle
          ? `<p class="store-hero-subtitle">${subtitle}</p>`
          : ""
      }
      ${
        body
          ? `<p class="store-hero-body">${body}</p>`
          : ""
      }
    `;
  }

  async function bootstrapHero() {
    const bannerRoot = el("store-banner");
    const textRoot = el("store-hero-text");
    if (!bannerRoot || !textRoot) return;

    const cfg = await loadStoreConfig();
    if (!cfg) return;

    renderHero(cfg);
  }

  document.addEventListener("DOMContentLoaded", bootstrapHero);
})(window, document);

